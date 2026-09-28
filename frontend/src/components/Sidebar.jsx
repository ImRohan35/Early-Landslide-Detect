import React from 'react';
import {
  Home,
  Map as LucideMap,
  BarChart2,
  Bell,
  SlidersHorizontal,
  History,
  FileText,
  Users,
  Settings,
  Info,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Sidebar({
  activeNav = 'Map',
  onNavigate,
  unreadAlertCount = 4,
  theme = 'light',
}) {
  const navItems = [
    { key: 'Home', label: 'Home', icon: Home, activeColor: '#10b981' },
    { key: 'Map', label: 'Map', icon: LucideMap, activeColor: '#e05626' },
    { key: 'Analysis', label: 'Analysis', icon: BarChart2, activeColor: '#e05626' },
    { key: 'Alerts', label: 'Alerts', icon: Bell, badge: unreadAlertCount, activeColor: '#10b981' },
    { key: 'What-If Simulator', label: 'What-If Simulator', icon: SlidersHorizontal, activeColor: '#10b981' },
    { key: 'Historical Data', label: 'Historical Data', icon: History, activeColor: '#8b5cf6' },
    { key: 'Reports', label: 'Reports', icon: FileText, activeColor: '#597753' },
    { key: 'Community', label: 'Community', icon: Users, activeColor: '#10b981' },
    { key: 'Settings', label: 'Settings', icon: Settings, activeColor: '#10b981' },
    { key: 'About', label: 'About', icon: Info, activeColor: '#10b981' },
  ];

  // For Historical Data view, show "Past data Builds a safer tomorrow." with purple bar
  const isHistorical = activeNav === 'Historical Data';

  return (
    <aside
      style={{
        width: 235,
        minWidth: 235,
        background: '#0d1813',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px 14px',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#ffffff',
        userSelect: 'none',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        overflowY: 'auto',
      }}
      className="dashboard-sidebar"
    >
      <div>
        {/* Brand Header */}
        <div
          onClick={() => onNavigate && onNavigate('Home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '4px 8px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: 16,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <BrandLogo size={28} />
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.15,
              }}
            >
              LandslideGuard <span style={{ color: '#f97316' }}>AI</span>
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: '#94a3b8',
                letterSpacing: '0.02em',
                marginTop: 2,
              }}
            >
              Monitor · Analyze · Stay Ahead
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {navItems.map(({ key, label, icon: Icon, badge, activeColor }) => {
            const isActive = activeNav.toLowerCase() === key.toLowerCase();

            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate && onNavigate(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 11px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? activeColor : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  boxShadow: isActive ? `0 4px 14px ${activeColor}55` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
                id={`sidebar-nav-${key.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.4 : 1.9} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 9999,
                      boxShadow: '0 0 6px #ef4444',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mountain Wallpaper & Handwritten Quote */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          padding: '16px 12px 14px',
          backgroundImage: `linear-gradient(to top, rgba(7, 24, 17, 0.95) 0%, rgba(7, 24, 17, 0.5) 100%), url('/hero-mountains.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 3.5,
              height: 48,
              borderRadius: 2,
              background: isHistorical ? '#8b5cf6' : '#f97316',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontFamily: "'Caveat', 'Segoe Script', cursive, sans-serif",
              fontSize: '1.18rem',
              color: '#f8fafc',
              lineHeight: 1.25,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {isHistorical ? (
              <>
                "Past data<br />
                Builds a safer<br />
                tomorrow."
              </>
            ) : (
              <>
                "Mountains<br />
                Are Home.<br />
                Let's Keep Them Safe."
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
