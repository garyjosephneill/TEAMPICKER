import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let dbPath = process.env.DATABASE_URL || path.join(__dirname, "squad.db");
if (dbPath.includes("://")) {
  console.warn("DATABASE_URL is set to a non-SQLite URL. Falling back to local squad.db");
  dbPath = path.join(__dirname, "squad.db");
}
const db = new Database(dbPath);

// Force clean recreate of players table
try {
  db.exec("DROP TABLE IF EXISTS players");
  db.exec(`
    CREATE TABLE players (
      id TEXT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      ratings TEXT NOT NULL,
      position TEXT NOT NULL,
      isSelected INTEGER DEFAULT 0,
      PRIMARY KEY (id, user_id)
    );
  `);
  console.log("Players table recreated cleanly.");
} catch (e) {
  console.error("Migration error:", e);
}

// Initialize user_metadata table
db.exec(`
  CREATE TABLE IF NOT EXISTS user_metadata (
    user_id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    is_licensed INTEGER DEFAULT 0
  );
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  // API: Get User Status
  app.get("/api/squad-status/:userId", (req, res) => {
    const { userId } = req.params;
    let metadata = db.prepare("SELECT * FROM user_metadata WHERE user_id = ?").get(userId) as any;
    if (!metadata) {
      const now = Date.now();
      db.prepare("INSERT INTO user_metadata (user_id, created_at) VALUES (?, ?)").run(userId, now);
      metadata = { user_id: userId, created_at: now, is_licensed: 0 };
    }
    res.json(metadata);
  });

  // API: Purchase License
  app.post("/api/purchase/:userId", (req, res) => {
    const { userId } = req.params;
    db.prepare("UPDATE user_metadata SET is_licensed = 1 WHERE user_id = ?").run(userId);
    res.json({ success: true });
  });

  // API: Get Players
  app.get("/api/players/:userId", (req, res) => {
    const { userId } = req.params;
    const players = db.prepare("SELECT * FROM players WHERE user_id = ?").all(userId);
    res.json(players.map((p: any) => ({
      ...p,
      ratings: JSON.parse(p.ratings),
      isSelected: !!p.isSelected
    })));
  });

  // API: Save Players
  app.post("/api/players/:userId", (req, res) => {
    const { userId } = req.params;
    const players = req.body;
    const transaction = db.transaction((playerList) => {
      db.prepare("DELETE FROM players WHERE user_id = ?").run(userId);
      const insert = db.prepare("INSERT INTO players (id, user_id, name, ratings, position, isSelected) VALUES (?, ?, ?, ?, ?, ?)");
      for (const p of playerList) {
        insert.run(p.id, userId, p.name, JSON.stringify(p.ratings), p.position, p.isSelected ? 1 : 0);
      }
    });
    transaction(players);
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
