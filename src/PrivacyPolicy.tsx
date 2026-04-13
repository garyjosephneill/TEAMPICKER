import React, { useState } from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8, borderColor: 'var(--color-t-c2)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: '2px solid var(--color-t-c2)',
          padding: '10px 14px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--color-t-c4)',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
        <span style={{ color: 'var(--color-t-c1)', opacity: 0.5, fontSize: 12, marginLeft: 12 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{
          border: '2px solid var(--color-t-c2)',
          borderTop: 'none',
          padding: '14px',
          fontFamily: '"Rajdhani", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 500,
          fontSize: 16,
          lineHeight: 1.7,
          color: '#ffffff',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--color-t-bg)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column' }}>

        {/* Sticky header */}
        <div style={{
          paddingTop: 'calc(max(20px, env(safe-area-inset-top)) + 10px)',
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingBottom: 16,
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 52,
            color: 'var(--color-t-c4)',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            LAZY GAFFER
          </div>
          <div style={{
            fontFamily: '"Barlow Condensed", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 21,
            color: 'var(--color-t-c2)',
            letterSpacing: 3,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}>
            Legal
          </div>
          <div style={{ borderBottom: '4px solid var(--color-t-c2)' }} />
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingTop: 16,
          paddingBottom: 'calc(max(40px, env(safe-area-inset-bottom)) + 40px)',
        }}>

          {/* ── Privacy Policy ── */}
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--color-t-c1)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            opacity: 0.5,
            marginBottom: 10,
          }}>
            Privacy Policy
          </div>

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

          <Section title="Cookies">
            Lazy Gaffer uses only essential cookies necessary to operate the service. These include session cookies set by Supabase to keep you signed in, and cookies set by Stripe to process payments securely. No advertising, analytics, or tracking cookies are used.
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
            <a href="mailto:gaffer@lazygaffer.com" style={{ color: 'var(--color-t-c2)', textDecoration: 'underline' }}>
              gaffer@lazygaffer.com
            </a>
          </Section>

          <Section title="Changes to This Policy">
            We may update this policy from time to time. Any changes will be posted at www.lazygaffer.com/privacy with an updated date.
          </Section>

          {/* ── Divider ── */}
          <div style={{ borderTop: '2px solid var(--color-t-c2)', margin: '28px 0' }} />

          {/* ── Terms & Conditions ── */}
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--color-t-c1)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            opacity: 0.5,
            marginBottom: 10,
          }}>
            Terms &amp; Conditions
          </div>

          <Section title="The Service">
            Lazy Gaffer is a team-picking application for casual football provided by Gary Neill Limited. It allows organisers to rate players and generate balanced teams. The service is available via the iOS app on the App Store and the web app at lazygaffer.com.
          </Section>

          <Section title="Free Trial">
            New users receive a 14-day free trial with full access to all features. No payment is required to begin the trial. At the end of the trial period, continued access requires an active subscription or a lifetime licence.
          </Section>

          <Section title="Subscription & Pricing">
            Lazy Gaffer is available on the following terms:{'\n'}
            Annual subscription: £3.99 per year{'\n'}
            Lifetime licence: £7.99 (one-time payment){'\n\n'}
            Prices are in GBP and include VAT where applicable. Gary Neill Limited reserves the right to change pricing with reasonable advance notice.
          </Section>

          <Section title="Payment">
            Payments made via the iOS app are processed by Apple through the App Store. Payments made via the web app are processed by Stripe. Gary Neill Limited does not store or have access to your payment card details.
          </Section>

          <Section title="Cancellation">
            You may cancel your subscription at any time. iOS subscriptions are managed through your Apple ID account settings. Web subscriptions can be cancelled via your account settings at lazygaffer.com. Cancellation takes effect at the end of the current billing period and you will retain access until that date.
          </Section>

          <Section title="Refunds">
            iOS refund requests are handled by Apple in accordance with their refund policy. For web subscription refund requests, please contact{' '}
            <a href="mailto:gaffer@lazygaffer.com" style={{ color: 'var(--color-t-c2)', textDecoration: 'underline' }}>
              gaffer@lazygaffer.com
            </a>
            {' '}within 14 days of payment. Refunds are considered at our discretion.
          </Section>

          <Section title="Acceptable Use">
            You agree to use Lazy Gaffer for lawful purposes only. You must not attempt to reverse engineer, reproduce, copy, or resell any part of the service. You are responsible for all activity under your account.
          </Section>

          <Section title="Limitation of Liability">
            Lazy Gaffer is provided on an "as is" basis. Gary Neill Limited makes no warranties regarding uninterrupted or error-free operation. To the fullest extent permitted by law, Gary Neill Limited shall not be liable for any indirect or consequential loss arising from use of the service. Our total liability shall not exceed the amount paid by you in the 12 months prior to the claim.
          </Section>

          <Section title="Governing Law">
            These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </Section>

          <Section title="Contact">
            For any questions regarding these terms, please contact:{' '}
            <a href="mailto:gaffer@lazygaffer.com" style={{ color: 'var(--color-t-c2)', textDecoration: 'underline' }}>
              gaffer@lazygaffer.com
            </a>
          </Section>

          {/* Footer */}
          <div style={{ borderTop: '2px solid var(--color-t-c2)', marginTop: 32, paddingTop: 16 }}>
            <a
              href="/"
              style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--color-t-c4)',
                textDecoration: 'none',
                letterSpacing: 2,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 16,
              }}
            >
              ← Back to App
            </a>
            <p style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 500,
              color: 'var(--color-t-c1)',
              opacity: 0.6,
              margin: 0,
              fontSize: 13,
            }}>
              Gary Neill Limited · Company No. 4741682 · Last updated: April 2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
