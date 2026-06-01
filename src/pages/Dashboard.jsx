import React, { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { AlertCircle, CheckCircle, Clock, Wrench, Trash2, ZoomIn } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';
import { format } from 'date-fns';
import { useComplaints } from '../context/ComplaintsContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

import './Dashboard.css';


const getStatusBadge = (status) => {
  switch (status) {
    case 'open':
      return <span className="badge badge-open">Open</span>;
    case 'in-progress':
      return <span className="badge badge-in-progress">In Progress</span>;
    case 'resolved':
      return <span className="badge badge-resolved">Resolved</span>;
    default:
      return null;
  }
};

const Dashboard = () => {
  const { complaints, stats, deleteComplaint } = useComplaints();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const navigate = useNavigate();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const openLightbox = (images, index) => setLightbox({ open: true, images, index });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeComplaintDetails = () => {
    setSelectedComplaint(null);
    setIsDeleting(false);
  };

  const MOCK_STATS = [
    { id: 1, title: 'Total Issues', count: stats.total, icon: <AlertCircle size={24} color="var(--accent-primary)" />, trend: 'All time' },
    { id: 2, title: 'In Progress', count: stats.inProgress, icon: <Clock size={24} color="var(--warning)" />, trend: 'Active issues' },
    { id: 3, title: 'Resolved', count: stats.resolved, icon: <CheckCircle size={24} color="var(--success)" />, trend: 'Completed issues' },
  ];

  const RECENT_COMPLAINTS = complaints.slice(0, 5);
  
  // Sort announcements by newest first
  const announcementHistory = notifications
    .filter(n => n.isAnnouncement && (!n.expiresAt || n.expiresAt > Date.now()))
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted">Here's what's happening with hostel maintenance today.</p>
        </div>
        {user?.role !== 'admin' && (
          <button className="btn btn-primary" onClick={() => navigate('/submit')}>
            <Wrench size={18} />
            <span>New Request</span>
          </button>
        )}
      </div>

      <div className="stats-grid">
        {MOCK_STATS.map((stat) => (
          <Card key={stat.id} hover className="stat-card">
            <div className="stat-header">
              <div className="stat-icon glass">{stat.icon}</div>
              <h3 className="stat-count">{stat.count}</h3>
            </div>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-trend">{stat.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {!isAdmin && announcementHistory.length > 0 && (
          <Card className="recent-announcements-card">
            <h3 className="info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', marginTop: 0 }}>
              <AlertCircle size={18} color="var(--accent-primary)" />
              Recent Announcements
            </h3>
            <div className="notifications-list flex-col" style={{ gap: '1rem' }}>
              {announcementHistory.map(a => (
                <div key={a.id} style={{ 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '10px', 
                  borderLeft: `4px solid var(--accent-primary)`,
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>{a.title}</h4>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.message}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {format(a.date, 'MMM dd, h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {/* Admin Feedback Summary */}
        {isAdmin && (
          <Card className="recent-feedback-card">
            <h3 className="info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', marginTop: 0 }}>
              <CheckCircle size={18} color="#facc15" />
              Latest Feedback Received
            </h3>
            <div className="feedback-list flex-col" style={{ gap: '1rem' }}>
              {complaints
                .filter(c => c.feedback)
                .sort((a, b) => new Date(b.feedback.date) - new Date(a.feedback.date))
                .slice(0, 3)
                .map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => openComplaintDetails(c)}
                    style={{ 
                      padding: '0.85rem', 
                      background: 'rgba(250,204,21,0.03)', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(250,204,21,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(250,204,21,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(250,204,21,0.03)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>{c.author}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <CheckCircle key={s} size={10} color={s <= c.feedback.rating ? '#facc15' : 'rgba(255,255,255,0.05)'} fill={s <= c.feedback.rating ? '#facc15' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic', opacity: 0.9 }} className="line-clamp-1">
                      "{c.feedback.comment || 'No comment provided.'}"
                    </p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      Regarding: <span style={{ fontWeight: 600 }}>{c.title}</span>
                    </div>
                  </div>
                ))}
              {complaints.filter(c => c.feedback).length === 0 && (
                <p className="text-muted text-sm pt-2">No feedback received yet.</p>
              )}
            </div>
          </Card>
        )}

        <Card title="Recent Complaints" className="recent-complaints-card">
          <div className="table-wrapper">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_COMPLAINTS.map((complaint) => (
                  <tr 
                    key={complaint.id} 
                    onClick={() => openComplaintDetails(complaint)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row mx-hover"
                  >
                    <td className="fw-medium">{complaint.id}</td>
                    <td>{complaint.category}</td>
                    <td className="text-truncate" style={{ maxWidth: '150px' }}>{complaint.title}</td>
                    <td>{getStatusBadge(complaint.status)}</td>
                    <td className="text-muted">{format(complaint.date, 'MMM dd')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={!!selectedComplaint} 
        onClose={closeComplaintDetails}
        title={`Complaint Details: ${selectedComplaint?.id}`}
      >
        {selectedComplaint && (
          <div className="complaint-detail-section">
            <div className="complaint-detail-grid">
              <div>
                <span className="complaint-detail-label">Status</span>
                <div style={{ marginTop: '0.25rem' }}>{getStatusBadge(selectedComplaint.status)}</div>
              </div>
              <div>
                <span className="complaint-detail-label">Date Logged</span>
                <div className="complaint-detail-value">{format(selectedComplaint.date, 'MMMM dd, yyyy h:mm a')}</div>
              </div>
              <div>
                <span className="complaint-detail-label">Category</span>
                <div className="complaint-detail-value">{selectedComplaint.category}</div>
              </div>
              <div>
                <span className="complaint-detail-label">Reporter</span>
                <div className="complaint-detail-value">{selectedComplaint.author} (Room {selectedComplaint.room})</div>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <span className="complaint-detail-label">Issue Title</span>
              <div className="complaint-detail-value" style={{ fontWeight: 500 }}>{selectedComplaint.title}</div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <span className="complaint-detail-label">Description</span>
              <div className="complaint-detail-value" style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                {selectedComplaint.description}
              </div>
            </div>

            {/* Photo Attachments */}
            <div style={{ marginTop: '1rem' }}>
              <span className="complaint-detail-label">Attached Photos</span>
              {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {selectedComplaint.images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      onClick={() => openLightbox(selectedComplaint.images, idx)}
                      title="Click to enlarge"
                      style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--glass-border)', cursor: 'zoom-in', transition: 'border-color 0.2s, transform 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <img src={imgSrc} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                      <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.opacity = 1; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0; }}
                      >
                        <ZoomIn size={24} color="white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No photos attached.
                </div>
              )}
            </div>

            {/* Feedback Display inside Dashboard Modal */}
            {selectedComplaint.feedback && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <div className="feedback-display glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={16} color="#facc15" />
                      <h4 style={{ margin: 0, color: '#facc15', fontSize: '0.95rem' }}>User Feedback to Admin</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <CheckCircle key={s} size={12} color={s <= selectedComplaint.feedback.rating ? '#facc15' : 'rgba(255,255,255,0.1)'} fill={s <= selectedComplaint.feedback.rating ? '#facc15' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    "{selectedComplaint.feedback.comment || 'No comment provided.'}"
                  </p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Submitted on {format(new Date(selectedComplaint.feedback.date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {!isDeleting ? (
                  <button 
                    className="btn btn-secondary" 
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', gap: '8px' }}
                    onClick={() => setIsDeleting(true)}
                  >
                    <Trash2 size={16} />
                    <span>Delete Issue</span>
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={() => setIsDeleting(false)} style={{ fontSize: '0.85rem' }}>Cancel</button>
                    <button 
                      className="btn btn-primary" 
                      style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: 'white', gap: '8px', fontSize: '0.85rem' }}
                      onClick={() => {
                        deleteComplaint(selectedComplaint.id);
                        closeComplaintDetails();
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Confirm Permanent Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {lightbox.open && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default Dashboard;
