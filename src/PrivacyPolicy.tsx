import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        background: 'var(--color-t-bg)',
        minHeight: '100vh',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 720, padding: '40px 24px 60px' }}>

        {/* Header */}
        <div
          style={{
            fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 52,
            color: 'var(--color-t-c4)',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          LAZY GAFFER
        </div>
        <div
          style={{
            fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontSize: 28,
            color: 'var(--color-t-c2)',
            letterSpacing: 3,
            marginBottom: 8,
          }}
        >
          PRIVACY POLICY
        </div>
        <div style={{ borderBottom: '4px solid var(--color-t-c2)', marginBottom: 32 }} />

        {/* Content */}
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>

          <p style={{ color: 'var(--color-t-c1)', opacity: 0.6, marginBottom: 32, fontSize: 13 }}>
            Last updated: March 2026
          </p>

          <Section title="Overview">
            Lazy Gaffer is a team picker app for casual football. This policy explains what data the app collects, how it is used, and your rights as a user.
          </Section>

          <Section title="Data We Collect">
            Lazy Gaffer collects only the information you choose to enter into the app. This includes player names and player ratings across six categories (GKP, DEF, MID, ATT, SPD, NRG). No real names are required — players can be entered under nicknames or aliases.
          </Section>

          <Section title="How We Use Your Data">
            Your squad data is used solely to generate balanced teams within the app. It is not analysed, sold, shared with third parties, or used for any marketing or advertising purpose.
          </Section>

          <Section title="Data Storage">
            Your squad and player data is stored securely and associated with your account for the duration of your licence. It is not shared with or accessible by other users.
          </Section>

          <Section title="Third Party Services">
            Lazy Gaffer does not integrate with any third party analytics, advertising, or tracking services.
          </Section>

          <Section title="Children's Privacy">
            Lazy Gaffer is not directed at children under the age of 13 and we do not knowingly collect data from children.
          </Section>

          <Section title="Your Rights">
            You may request deletion of your data at any time by contacting us at the address below. Upon request, all personal data associated with your account will be permanently deleted.
          </Section>

          <Section title="Contact">
            For any privacy related questions or data deletion requests, please contact:{' '}
            <a href="mailto:gary@garyneill.com" style={{ color: 'var(--color-t-c2)', textDecoration: 'underline' }}>
              gary@garyneill.com
            </a>
          </Section>

          <Section title="Changes to This Policy">
            We may update this policy from time to time. Any changes will be posted at lazygaffer.com/privacy with an updated date.
          </Section>

        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px solid var(--color-t-c2)', marginTop: 40, paddingTop: 16 }}>
          <a
            href="/"
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: 18,
              color: 'var(--color-t-c4)',
              textDecoration: 'none',
              letterSpacing: 2,
            }}
          >
            ← BACK TO APP
          </a>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontFamily: '"Bebas Neue", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 20,
          color: 'var(--color-t-c4)',
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <p style={{ margin: 0, color: '#ffffff' }}>{children}</p>
    </div>
  );
}
