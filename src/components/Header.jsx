import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Search, CheckCircle2, Circle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Theme toggle
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('hostel_theme');
    return saved ? saved === 'dark' : true; // default dark
  });

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('hostel_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme === 'light' ? 'light' : '');
  };

  // Apply saved theme on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('hostel_theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    if (!showNotifications && unreadCount > 0) {
      markAllAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="glass-nav header animate-fade-in">
      <div className="header-left">
        <button className="menu-btn btn btn-secondary" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="search-bar glass">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search complaints..." className="search-input" />
        </div>
      </div>
      
      <div className="header-right">
        {user?.role === 'admin' && (
          <span className="badge badge-in-progress" style={{ marginRight: '1rem' }}>Admin Mode</span>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>
        <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className={`notification-btn glass ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={handleNotificationClick}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown glass animate-fade-in" style={{ position: 'absolute', top: '120%', right: '0', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, padding: '0', borderRadius: '12px', background: 'var(--bg-sidebar)' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
                {unreadCount > 0 && <span className="text-xs text-accent">Marked as read</span>}
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`} style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', opacity: n.read ? 0.7 : 1, transition: 'background 0.2s', cursor: 'pointer' }}>
                      <div style={{ marginTop: '0.25rem' }}>
                        {!n.read ? <Circle size={10} fill="var(--accent-primary)" color="var(--accent-primary)" /> : <CheckCircle2 size={16} color="var(--success)" />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>{n.title}</h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDistanceToNow(n.date, { addSuffix: true })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No fresh notifications! You're all caught up.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
