import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import InteractiveMapPage from './components/InteractiveMapPage';
import RiskAnalysisPage from './components/RiskAnalysisPage';
import AlertsPage from './components/AlertsPage';
import AboutPage from './components/AboutPage';
import WhatIfSimulator from './components/WhatIfSimulator';
import HistoricalAnalysisView from './components/HistoricalAnalysisView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import HillGuardChat from './components/HillGuardChat';

import { riskLocations } from './data/riskLocations';
import { getSystemStats, getLocations, getAlerts } from './services/api';
import './App.css';

export default function App() {
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nelrms-theme') || 'light';
  });

  useEffect(() => {
    document.title = 'LandslideGuard AI · Monitor · Analyze · Stay Ahead';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nelrms-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // User session state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nelrms-user');
      return saved
        ? JSON.parse(saved)
        : {
            id: 'usr-rohan',
            name: 'Rohan Singh',
            role: 'Student',
            email: 'rohan.research@iitg.ac.in',
            avatar: 'R',
          };
    } catch {
      return {
        id: 'usr-rohan',
        name: 'Rohan Singh',
        role: 'Student',
        email: 'rohan.research@iitg.ac.in',
        avatar: 'R',
      };
    }
  });

  // Active page route: 'Historical Data' | 'Reports' | 'Map' | 'Analysis' | 'Alerts' | 'What-If Simulator' | 'Settings' | 'About' | 'Home'
  const [activePage, setActivePage] = useState('Historical Data');

  // Currently inspected station across Map & Analysis
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return riskLocations.find((l) => l.id === 'shillong') || riskLocations[0];
  });

  const [selectedState, setSelectedState] = useState('All States');
  const [mapLayer, setMapLayer] = useState('satellite');

  const [locationsList, setLocationsList] = useState(riskLocations);
  const [alertsList, setAlertsList] = useState([]);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  }, []);

  // Fetch telemetry and locations on startup
  useEffect(() => {
    getLocations().then((res) => {
      if (res && res.length > 0) setLocationsList(res);
    });
    getAlerts().then((res) => {
      if (res && res.length > 0) setAlertsList(res);
    });
  }, []);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (loggedInUser) => {
    const formatted = {
      ...loggedInUser,
      role: loggedInUser.role || 'Student',
      avatar: loggedInUser.avatar || loggedInUser.name?.charAt(0).toUpperCase() || 'R',
    };
    localStorage.setItem('nelrms-user', JSON.stringify(formatted));
    setUser(formatted);
    setShowLoginModal(false);
    setActivePage('Map');
    showToast(`Signed in as ${formatted.name || 'Rohan Singh'}`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('nelrms-user');
    setUser(null);
    setShowLoginModal(false);
    setActivePage('Home');
    showToast('Signed out successfully. Redirected to welcome portal.', 'info');
  };

  const handleStateSelect = (st) => {
    setSelectedState(st);
    if (st && st !== 'All States') {
      const match = riskLocations.find(
        (l) => l.state.toLowerCase() === st.toLowerCase()
      );
      if (match) {
        setSelectedLocation(match);
      }
    }
  };

  const isHomePage = activePage.toLowerCase() === 'home';

  return (
    <div
      className="app-root"
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? '#071610' : '#f8faf9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      }}
    >
      {isHomePage ? (
        <LandingPage
          onNavigate={handleNavigate}
          onLoginSuccess={(u) => {
            handleLogin(u);
            setActivePage('Map');
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
          {/* Persistent Left Navigation Sidebar */}
          <Sidebar
            activeNav={activePage}
            onNavigate={handleNavigate}
            unreadAlertCount={4}
            theme={theme}
          />

          {/* Right Main Content Area */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Header
              activePage={activePage}
              onNavigate={handleNavigate}
              user={user}
              onLoginClick={() => setShowLoginModal(true)}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              selectedState={selectedState}
              onStateSelect={handleStateSelect}
              mapLayer={mapLayer}
              onMapLayerChange={setMapLayer}
              unreadCount={4}
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
            />

            <main style={{ flex: 1, minWidth: 0 }}>
              {activePage.toLowerCase() === 'map' && (
                <InteractiveMapPage
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  onNavigate={handleNavigate}
                  theme={theme}
                  mapLayer={mapLayer}
                  selectedState={selectedState}
                  onStateSelect={handleStateSelect}
                />
              )}

              {activePage.toLowerCase() === 'analysis' && (
                <RiskAnalysisPage
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  onNavigate={handleNavigate}
                  theme={theme}
                />
              )}

              {activePage.toLowerCase() === 'alerts' && (
                <AlertsPage onNavigate={handleNavigate} theme={theme} />
              )}

              {(activePage.toLowerCase() === 'what-if simulator' || activePage.toLowerCase() === 'simulator') && (
                <WhatIfSimulator
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                  onNavigate={handleNavigate}
                  theme={theme}
                />
              )}

              {(activePage.toLowerCase() === 'historical data' || activePage.toLowerCase() === 'historical') && (
                <HistoricalAnalysisView
                  theme={theme}
                  onNavigate={handleNavigate}
                />
              )}

              {(activePage.toLowerCase() === 'reports' || activePage.toLowerCase() === 'reports & insights') && (
                <ReportsView
                  theme={theme}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage.toLowerCase() === 'settings' && (
                <SettingsView
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  onLogout={handleLogout}
                  showToast={showToast}
                  onNavigateToProfile={() => showToast(`User Profile: ${user?.name || 'Rohan Singh'} (${user?.role || 'Student'})`, 'info')}
                />
              )}

              {activePage.toLowerCase() === 'about' && (
                <AboutPage onNavigate={handleNavigate} theme={theme} />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Interactive Floating AI Assistant Chat (HillGuard Chat) */}
      <HillGuardChat
        currentLocation={selectedLocation}
        theme={theme}
        onNavigate={handleNavigate}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: toast.type === 'success' ? '#064e3b' : '#0f172a',
            color: '#ffffff',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
          role="status"
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Login / Auth Modal if requested */}
      {showLoginModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#ffffff',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <Login
            onLogin={handleLogin}
            onBackToHome={() => setShowLoginModal(false)}
            onClose={() => setShowLoginModal(false)}
            initialMode="login"
          />
        </div>
      )}
    </div>
  );
}
