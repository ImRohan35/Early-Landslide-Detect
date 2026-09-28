import React from 'react';
import {
  Database,
  Brain,
  Users,
  BookOpen,
  Mountain,
  Shield,
  Layers,
  Sparkles,
  Quote,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage({ onNavigate, theme = 'light' }) {
  return (
    <div
      style={{
        background: theme === 'dark' ? '#071610' : '#f8faf9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '24px 28px 60px',
        minHeight: 'calc(100vh - 64px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Top Header & Subtitle */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: theme === 'dark' ? '#ffffff' : '#0d2818',
              margin: '0 0 6px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            About LandslideGuard AI
          </h1>
          <p
            style={{
              fontSize: '0.94rem',
              color: theme === 'dark' ? '#94a3b8' : '#64748b',
              margin: 0,
            }}
          >
            A data-driven approach to landslide risk monitoring for a safer North East.
          </p>
        </div>

        {/* Main Grid: Left Story & Features + Right Mountain Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 0.9fr)',
            gap: 26,
            marginBottom: 26,
          }}
          className="grid-cols-1 lg:grid-cols-about"
        >
          {/* Left Column: Mission Description, 4 Cards, Quote Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Description Paragraphs */}
            <div
              style={{
                fontSize: '0.94rem',
                lineHeight: 1.68,
                color: theme === 'dark' ? '#cbd5e1' : '#334155',
              }}
            >
              <p style={{ margin: '0 0 12px' }}>
                <strong>LandslideGuard AI</strong> is a research and development project that uses real-time environmental data, satellite imagery and machine learning to estimate landslide risk across the North Eastern Region of India.
              </p>
              <p style={{ margin: 0 }}>
                Our goal is to support communities, authorities and researchers with accurate, accessible and actionable insights for disaster preparedness and risk reduction.
              </p>
            </div>

            {/* 4 Feature Cards (2x2 Grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
              className="grid-cols-1 sm:grid-cols-2"
            >
              {[
                {
                  title: 'Data Driven',
                  desc: 'Real-time & historical data',
                  icon: <Database size={20} color="#38bdf8" />,
                  bg: 'rgba(56, 189, 248, 0.12)',
                },
                {
                  title: 'AI Powered',
                  desc: 'Machine learning models',
                  icon: <Brain size={20} color="#34d399" />,
                  bg: 'rgba(52, 211, 153, 0.12)',
                },
                {
                  title: 'People Focused',
                  desc: 'Community safety',
                  icon: <Users size={20} color="#fb923c" />,
                  bg: 'rgba(251, 146, 60, 0.12)',
                },
                {
                  title: 'Open Knowledge',
                  desc: 'For a resilient future',
                  icon: <BookOpen size={20} color="#a855f7" />,
                  bg: 'rgba(168, 85, 247, 0.12)',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: theme === 'dark' ? '#0d281e' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.18)' : '#e2e8f0'}`,
                    borderRadius: 16,
                    padding: '18px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                      {card.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote Card */}
            <div
              style={{
                background: theme === 'dark' ? '#0a2118' : '#eaf7ee',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: 16,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Quote size={28} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#e2e8f0' : '#064e3b',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  "Technology is most powerful when it helps protect people."
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                  — LandslideGuard AI
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Large Mountain Image Card */}
          <div
            style={{
              backgroundImage: `linear-gradient(to top, rgba(7, 24, 17, 0.95) 0%, rgba(7, 24, 17, 0.35) 100%), url('/valley-river.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 22,
              padding: '36px 30px',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  margin: '0 0 10px',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Stronger Communities.
                <br />
                <span style={{ color: '#34d399' }}>Safer Tomorrows.</span>
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: '0 0 18px', maxWidth: 360, lineHeight: 1.5 }}>
                Integrating multi-source geotechnical modeling with WMO meteorological telemetry to protect the Northeast Himalayan corridor.
              </p>
              <button
                onClick={() => onNavigate && onNavigate('Map')}
                style={{
                  background: '#10b981',
                  color: '#062016',
                  padding: '10px 22px',
                  borderRadius: 9999,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                }}
              >
                <span>Explore Live Stations</span>
                <ArrowRight size={15} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Statistics Bar (Wide card) */}
        <div
          style={{
            background: theme === 'dark' ? '#0d281e' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
            borderRadius: 20,
            padding: '24px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            textAlign: 'center',
          }}
          className="grid-cols-2 md:grid-cols-4"
        >
          <div>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#10b981',
                lineHeight: 1,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              8
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
              NER States Covered
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#ef4444',
                lineHeight: 1,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              120+
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
              High-Risk Districts
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#38bdf8',
                lineHeight: 1,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              2.3M+
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
              People in Vulnerable Areas
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: '#f59e0b',
                lineHeight: 1,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              500+
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
              Landslide Events Analysed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
