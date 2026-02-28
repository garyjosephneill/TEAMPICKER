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

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT,
    squad_id TEXT NOT NULL,
    name TEXT NOT NULL,
    rating REAL NOT NULL,
    position TEXT NOT NULL,
    isSelected INTEGER DEFAULT 0,
    PRIMARY KEY (id, squad_id)
  );
  CREATE TABLE IF NOT EXISTS squad_metadata (
    squad_id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    is_licensed INTEGER DEFAULT 0
  );
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  // API: Get Squad Status
  app.get("/api/squad-status/:squadId", (req, res) => {
    const { squadId } = req.params;
    let metadata = db.prepare("SELECT * FROM squad_metadata WHERE squad_id = ?").get(squadId) as any;
    if (!metadata) {
      const now = Date.now();
      db.prepare("INSERT INTO squad_metadata (squad_id, created_at) VALUES (?, ?)").run(squadId, now);
      metadata = { squad_id: squadId, created_at: now, is_licensed: 0 };
    }
    res.json(metadata);
  });

  // API: Purchase License
  app.post("/api/purchase/:squadId", (req, res) => {
    const { squadId } = req.params;
    db.prepare("UPDATE squad_metadata SET is_licensed = 1 WHERE squad_id = ?").run(squadId);
    res.json({ success: true });
  });

  // API: Get Players
  app.get("/api/players/:squadId", (req, res) => {
    const { squadId } = req.params;
    const players = db.prepare("SELECT * FROM players WHERE squad_id = ?").all(squadId);
    res.json(players.map((p: any) => ({ ...p, isSelected: !!p.isSelected })));
  });

  // API: Save Players
  app.post("/api/players/:squadId", (req, res) => {
    const { squadId } = req.params;
    const players = req.body;
    const transaction = db.transaction((playerList) => {
      db.prepare("DELETE FROM players WHERE squad_id = ?").run(squadId);
      const insert = db.prepare("INSERT INTO players (id, squad_id, name, rating, position, isSelected) VALUES (?, ?, ?, ?, ?, ?)");
      for (const p of playerList) {
        insert.run(p.id, squadId, p.name, p.rating, p.position, p.isSelected ? 1 : 0);
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
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
