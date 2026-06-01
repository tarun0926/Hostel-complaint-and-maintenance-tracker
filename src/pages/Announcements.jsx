import React, { useState } from 'react';
import Card from '../components/Card';
import { Send, Megaphone, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { format } from 'date-fns';
import './SubmitComplaint.css'; // Reuse form styles

const Announcements = () => {
  const { addNotification, allNotifications, removeNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use allNotifications for management, filtered for announcements
  const announcementHistory = (allNotifications || []).filter(n => !n.relatedUserId && n.title !== 'New Complaint Logged');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Send global notification with isAnnouncement flag set to true
      addNotification(`📢 ${title}`, message, null, expiry || null, true);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      setTitle('');
      setMessage('');
      setExpiry('');
      
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="submit-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Announcements</h1>
          <p className="text-muted">Broadcast important notices to all hostel residents instantly.</p>
        </div>
      </div>

      <div className="form-container">
        <Card className="form-card">
          {isSuccess ? (
            <div className="success-state animate-fade-in">
              <CheckCircle2 size={64} className="success-icon" />
              <h2>Announcement Sent!</h2>
              <p className="text-muted">All residents have received a notification with your message.</p>
              <button className="btn btn-primary mt-4" onClick={() => setIsSuccess(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="input-group">
                <label className="input-label">Announcement Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Water Supply Interruption, Registration Deadline" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Message Details</label>
                <textarea 
                  className="input-field textarea-field" 
                  placeholder="Write the full details of the announcement here..." 
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-group">
                <label className="input-label">Expiry Date & Time (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="datetime-local" 
                    className="input-field" 
                    style={{ colorScheme: 'dark' }}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <p className="text-muted text-xs mt-1">If set, the announcement will automatically disappear after this time.</p>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Broadcasting...' : (
                    <>
                      <Send size={18} />
                      <span>Broadcast to All</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Card>

        <div className="info-sidebar">
          <Card className="info-card">
            <h3 className="info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} color="var(--accent-primary)" />
              Recent Broadcasts
            </h3>
            
            <div className="notifications-list flex-col" style={{ gap: '1rem', marginTop: '1rem' }}>
              {announcementHistory.length > 0 ? (
                announcementHistory.slice(0, 10).map(a => {
                  const isExpired = a.expiresAt && a.expiresAt < Date.now();
                  return (
                    <div key={a.id} style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '8px', 
                      borderLeft: `3px solid ${isExpired ? '#6b7280' : 'var(--accent-primary)'}`,
                      position: 'relative',
                      opacity: isExpired ? 0.6 : 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', flex: 1 }}>{a.title}</h4>
                        <button 
                          onClick={() => removeNotification(a.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', padding: '2px', cursor: 'pointer', opacity: 0.7 }}
                          title="Delete Announcement"
                        >
                          <svg size={14} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6m4-6v6"/></svg>
                        </button>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="line-clamp-2">{a.message}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <span>{format(a.date, 'MMM dd, h:mm a')}</span>
                        {a.expiresAt && (
                          <span style={{ color: isExpired ? 'var(--danger)' : 'var(--warning)' }}>
                            {isExpired ? 'Expired' : `Expires: ${format(a.expiresAt, 'MMM dd, h:mm a')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted text-sm pb-2">No past announcements found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
