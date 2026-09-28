import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Bell,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  MapPin,
  X,
  Layers,
} from 'lucide-react';
import { riskLocations } from '../data/riskLocations';

const NER_STATES = [
  'All States',
  'Assam',
  'Arunachal Pradesh',
  'Meghalaya',
  'Manipur',
  'Mizoram',
  'Nagaland',
  'Tripura',
  'Sikkim',
];

export default function Header({
  activePage = 'Map',
  onNavigate,
  selectedLocation,
  onLocationSelect,
  selectedState = 'All States',
  onStateSelect,
  mapLayer = 'satellite', // 'map' | 'satellite' | 'terrain'
  onMapLayerChange,
  theme = 'light',
  onToggleTheme,
  user = null,
  onLogout,
  onLoginClick,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const searchBoxRef = useRef(null);
  const userMenuRef = useRef(null);
  const alertsMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(e.target)) {
        setShowAlertsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const q = val.toLowerCase();
      const matches = riskLocations.filter(
        (l) =>
          l.locationName.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          (l.district && l.district.toLowerCase().includes(q))
      );
      setSuggestions(matches.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (loc) => {
    if (onLocationSelect) onLocationSelect(loc);
    setSearchQuery(loc.locationName);
    setShowSuggestions(false);
    if (onNavigate && activePage !== 'Map') {
      onNavigate('Map');
    }
  };

  return (
    <header
      style={{
        background: theme === 'dark' ? '#0d1813' : '#ffffff',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.16)' : '#e2e8f0'}`,
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* Center Left: Search Bar & State Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 680 }}>
        {/* Search Input Box */}
        <div style={{ position: 'relative', flex: 1 }} ref={searchBoxRef}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
              borderRadius: 12,
              padding: '8px 14px',
              transition: 'all 0.2s ease',
            }}
          >
            <Search size={17} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search location (e.g., Shillong, Tura, Kohima...)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                fontSize: '0.88rem',
                width: '100%',
              }}
            />
            {searchQuery && (
              <X
                size={15}
                color="#94a3b8"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
              />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: theme === 'dark' ? '#0f241a' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : '#cbd5e1'}`,
                borderRadius: 12,
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              {suggestions.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                    fontSize: '0.85rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={15} color="#f97316" />
                    <strong>{loc.locationName}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>({loc.state})</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background:
                        loc.riskLevel === 'Critical'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : loc.riskLevel === 'High'
                          ? 'rgba(249, 115, 22, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      color:
                        loc.riskLevel === 'Critical'
                          ? '#ef4444'
                          : loc.riskLevel === 'High'
                          ? '#f97316'
                          : '#10b981',
                    }}
                  >
                    {loc.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* State Dropdown */}
        <select
          value={selectedState}
          onChange={(e) => {
            if (onStateSelect) onStateSelect(e.target.value);
          }}
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
            borderRadius: 12,
            padding: '8px 14px',
            color: theme === 'dark' ? '#ffffff' : '#0f172a',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {NER_STATES.map((st) => (
            <option
              key={st}
              value={st}
              style={{ background: theme === 'dark' ? '#0f241a' : '#ffffff' }}
            >
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side: Map Layer Segment (when on Map), Theme, Alerts, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Map Type Segmented Control (Visible on Map Page) */}
        {activePage.toLowerCase() === 'map' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
              padding: '3px',
              borderRadius: 10,
              gap: 3,
            }}
          >
            {[
              { id: 'map', label: 'Map' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'terrain', label: 'Terrain' },
            ].map((btn) => {
              const isSelected = mapLayer === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => onMapLayerChange && onMapLayerChange(btn.id)}
                  style={{
                    border: 'none',
                    background: isSelected ? '#e05626' : 'transparent',
                    color: isSelected ? '#ffffff' : theme === 'dark' ? '#cbd5e1' : '#64748b',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Theme Toggle Button (Sun/Moon Pill) */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: theme === 'dark' ? '#182f24' : '#f1f5f9',
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : '#cbd5e1'}`,
            borderRadius: 9999,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Sun size={15} color={theme === 'light' ? '#f59e0b' : '#94a3b8'} />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: theme === 'dark' ? '#34d399' : '#0f172a',
            }}
          />
          <Moon size={15} color={theme === 'dark' ? '#34d399' : '#94a3b8'} />
        </button>

        {/* Notifications Icon with Red Badge "4" */}
        <div style={{ position: 'relative' }} ref={alertsMenuRef}>
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            title="View Real-Time Alerts"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
              border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme === 'dark' ? '#e2e8f0' : '#475569',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px #ef4444',
              }}
            >
              4
            </span>
          </button>

          {/* Quick Alerts Dropdown */}
          {showAlertsDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 300,
                background: theme === 'dark' ? '#0d281e' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : '#cbd5e1'}`,
                borderRadius: 16,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                padding: '12px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 8,
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  marginBottom: 8,
                }}
              >
                <strong style={{ fontSize: '0.88rem' }}>Active Risk Alerts</strong>
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onNavigate && onNavigate('Alerts');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e05626',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { title: 'High risk in Meghalaya', time: '2 hours ago', color: '#ef4444' },
                  { title: 'Moderate risk in Assam', time: '5 hours ago', color: '#f59e0b' },
                  { title: 'Critical risk in Arunachal Pradesh', time: '8 hours ago', color: '#dc2626' },
                ].map((a, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setShowAlertsDropdown(false);
                      onNavigate && onNavigate('Alerts');
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: a.color }}>{a.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          {user ? (
            <div
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                borderRadius: 9999,
                padding: '4px 12px 4px 4px',
                cursor: 'pointer',
              }}
            >
              {/* Avatar Photo */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundImage: `url('/meghalaya-hills.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              >
                {!user.avatar ? (user.name ? user.name[0].toUpperCase() : 'U') : null}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#ffffff' : '#0f172a',
                  }}
                >
                  {user.name || 'User'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                  {user.role || 'Analyst'}
                </div>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
          ) : (
            <button
              onClick={() => onLoginClick && onLoginClick()}
              style={{
                background: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              }}
            >
              Sign In
            </button>
          )}

          {/* User Menu Dropdown */}
          {user && showUserDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 220,
                background: theme === 'dark' ? '#0d281e' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.3)' : '#cbd5e1'}`,
                borderRadius: 14,
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                padding: '8px 0',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{user.name || 'User'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  {user.email || 'user@nelrms.gov.in'}
                </p>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate && onNavigate('Analysis');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                  }}
                >
                  <Sparkles size={15} color="#10b981" />
                  <span>My Active Predictions</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate && onNavigate('Settings');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                  }}
                >
                  <span>System Preferences</span>
                </button>

                <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={15} color="#ef4444" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
