import React, { useState, useEffect } from 'react';
import { Megaphone, X, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';

const GlobalBanner = () => {
  const { notifications } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Find the latest active global announcement (strictly using the isAnnouncement flag)
  const activeAnnouncement = notifications
    .filter(n => n.isAnnouncement)
    .sort((a, b) => b.id - a.id)[0];

  // Reset dismissal if a new announcement comes in
  useEffect(() => {
    if (activeAnnouncement) {
      setDismissed(false);
    }
  }, [activeAnnouncement?.id]);

  if (!activeAnnouncement || dismissed) return null;

  const hasExpiry = !!activeAnnouncement.expiresAt;

  return (
    <div
      className="global-banner-wrapper animate-slide-down"
      style={{
        padding: '0 1rem 1rem 1rem',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 50%, #1565c0 100%)',
          color: 'white',
          padding: '0',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(26, 115, 232, 0.4), 0 2px 8px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Decorative background circles */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '200px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          gap: '1rem',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left: icon + text */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            {/* Icon pill */}
            <div style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <Megaphone size={20} />
            </div>

            {/* Badge + text */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.22)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '1px 10px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}>
                  Announcement
                </span>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  letterSpacing: '0.2px',
                }}>
                  {activeAnnouncement.title}
                </span>
              </div>
              <div style={{
                fontSize: '0.85rem',
                opacity: 0.9,
                lineHeight: 1.4,
              }}>
                {activeAnnouncement.message}
              </div>
            </div>
          </div>

          {/* Right: expiry + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {hasExpiry && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 10px',
                borderRadius: '20px',
                opacity: 0.9,
              }}>
                <Clock size={12} />
                Expires {formatDistanceToNow(activeAnnouncement.expiresAt, { addSuffix: true })}
              </div>
            )}
            <button
              onClick={() => setDismissed(true)}
              title="Dismiss"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBanner;
