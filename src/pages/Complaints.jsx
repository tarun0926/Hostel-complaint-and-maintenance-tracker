import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Inbox,
  ChevronRight,
  ZoomIn,
  UserCheck,
  MoreVertical,
  X,
  Star
} from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';
import { format } from 'date-fns';
import { useComplaints, STAFF_LIST } from '../context/ComplaintsContext';
import { useAuth } from '../context/AuthContext';
import './Complaints.css';

// ── 3-dot kebab menu + assign popup per card ──────────────────────────────────
const KebabMenu = ({ complaint, onOpenAssign, onToggle }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Notify parent of open state
  useEffect(() => {
    if (onToggle) onToggle(open);
  }, [open, onToggle]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAssignClick = (e) => {
    e.stopPropagation();
    setOpen(false);
    onOpenAssign(complaint);
  };

  return (
    <div
      ref={menuRef}
      style={{ position: 'relative', zIndex: 20 }}
      onClick={e => e.stopPropagation()}
    >
      {/* ⋮ button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); setShowAssign(false); }}
        title="Options"
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          border: '1px solid var(--glass-border)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.18s',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '38px',
          right: 0,
          minWidth: '170px',
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid var(--glass-border)',
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          padding: '0.35rem',
          backdropFilter: 'blur(20px)',
        }}>
          <button
            onClick={handleAssignClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <UserCheck size={15} color="var(--accent-primary)" />
            Assign Labour
          </button>
        </div>
      )}
    </div>
  );
};

// ── Assign Labour Modal (Global Overlay) ──────────────────────────────────────
const AssignLabourModal = ({ complaint, isOpen, onClose, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Reset/Initialize selection when modal opens
  useEffect(() => {
    if (isOpen && complaint) {
      const current = complaint.assignedTo;
      if (Array.isArray(current)) {
        const ids = new Set(
          current.map(name => { const s = STAFF_LIST.find(x => x.name === name); return s ? s.id : null; }).filter(Boolean)
        );
        setSelectedIds(ids);
      } else if (current) {
        const s = STAFF_LIST.find(x => x.name === current);
        setSelectedIds(s ? new Set([s.id]) : new Set());
      } else {
        setSelectedIds(new Set());
      }
    }
  }, [isOpen, complaint]);

  const toggleStaff = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) return;
    const names = STAFF_LIST.filter(s => selectedIds.has(s.id)).map(s => s.name);
    onConfirm(complaint.id, names);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Labour">
      {complaint && (
        <div className="modal-content-premium" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem', textAlign: 'center' }}>
            Complaint: <strong style={{ color: 'var(--text-secondary)' }}>{complaint.title}</strong>
          </p>

          {/* Grouped staff list without nested scrolling */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {(() => {
              const domains = [...new Set(STAFF_LIST.map(s => s.domain))];
              const domainColors = {
                'Electrical':          { bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.2)',  text: '#facc15' },
                'Plumbing':            { bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.2)',  text: '#38bdf8' },
                'Carpentry':           { bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)',  text: '#fb923c' },
                'Cleaning':            { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  text: '#34d399' },
                'General Maintenance': { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#a78bfa' },
              };
              return domains.map(domain => {
                const color = domainColors[domain] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: 'var(--text-secondary)' };
                const workers = STAFF_LIST.filter(s => s.domain === domain);
                return (
                  <div key={domain} style={{ background: color.bg, border: `1px solid ${color.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${color.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: color.text }}>
                        {domain}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: color.text, opacity: 0.6, marginLeft: 'auto' }}>
                        {workers.length} workers
                      </span>
                    </div>
                    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {workers.map(s => {
                        const checked = selectedIds.has(s.id);
                        return (
                          <label
                            key={s.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.75rem',
                              padding: '0.7rem 1rem', borderRadius: '10px',
                              cursor: 'pointer',
                              background: checked ? `${color.bg}` : 'transparent',
                              border: checked ? `1px solid ${color.border}` : '1px solid rgba(255,255,255,0.04)',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => !checked && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={e => !checked && (e.currentTarget.style.background = 'transparent')}
                          >
                            <input
                              type="checkbox" value={s.id} checked={checked}
                              onChange={() => toggleStaff(s.id)}
                              style={{ accentColor: color.text, width: '18px', height: '18px', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{s.name}</div>
                              <div style={{ fontSize: '0.8rem', color: color.text, opacity: 0.8, marginTop: '0.15rem' }}>{s.role}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              style={{
                flex: 1,
                opacity: selectedIds.size > 0 ? 1 : 0.5,
                background: selectedIds.size > 0 ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                color: selectedIds.size > 0 ? '#fff' : 'var(--text-muted)',
                boxShadow: selectedIds.size > 0 ? '0 4px 12px rgba(56,189,248,0.25)' : 'none',
              }}
            >
              {selectedIds.size > 0 ? `Assign ${selectedIds.size} Labour${selectedIds.size > 1 ? 's' : ''}` : 'Select Labour'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ── Feedback Section Component ────────────────────────────────────────────────
const FeedbackSection = ({ complaint, onSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitFeedback } = useComplaints();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    
    setIsSubmitting(true);
    try {
      await submitFeedback(complaint.id, rating, comment);
      if (onSubmitting) onSubmitting();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-section glass" style={{ 
      marginTop: '1rem', 
      padding: '1rem', 
      borderRadius: '16px', 
      border: '1px solid var(--accent-primary)',
      background: 'rgba(56,189,248,0.05)'
    }}>
      <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Star size={16} color="var(--accent-primary)" fill="var(--accent-primary)" />
        How was your experience?
      </h4>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.8rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <Star
                size={24}
                color={(hover || rating) >= star ? '#facc15' : 'rgba(255,255,255,0.2)'}
                fill={(hover || rating) >= star ? '#facc15' : 'none'}
                style={{ transition: 'all 0.2s transform', transform: (hover || rating) === star ? 'scale(1.15)' : 'scale(1)' }}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Share your thoughts on the resolution (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            minHeight: '50px',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            padding: '0.6rem',
            color: 'white',
            marginBottom: '0.6rem',
            fontSize: '0.85rem',
            resize: 'vertical'
          }}
        />

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={rating === 0 || isSubmitting}
          style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

// ── Main Complaints Page ───────────────────────────────────────────────────────
const Complaints = () => {
  const { complaints, updateComplaintStatus, deleteComplaint, assignStaff } = useComplaints();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [activeMenuCardId, setActiveMenuCardId] = useState(null);
  const [assigningComplaint, setAssigningComplaint] = useState(null);

  const openLightbox = (images, index) => setLightbox({ open: true, images, index });
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });

  // Filter complaints based on user role and filters
  const filteredComplaints = complaints.filter(c => {
    if (!isAdmin && c.author !== user?.name) return false;

    const searchMatch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || c.status === statusFilter;
    const categoryMatch = selectedCategory === 'all' || c.category === selectedCategory;

    return searchMatch && statusMatch && categoryMatch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />;
      case 'in-progress': return <Clock size={16} />;
      case 'resolved': return <CheckCircle2 size={16} />;
      default: return null;
    }
  };

  const handleStatusUpdate = (e, id, status) => {
    e.stopPropagation();
    updateComplaintStatus(id, status);
  };

  return (
    <div className="complaints-page animate-fade-in">
      <div className="page-header">
        <h1>Maintenance Hub</h1>
        <p className="text-secondary">
          {isAdmin 
            ? 'Orchestrate facility maintenance and track operational efficiency.' 
            : 'Monitor your reported issues and facility feedback in real-time.'}
        </p>
      </div>

      <div className="filters-section">
        <div className="filters-bar">
          <div className="search-box">
            <Search size={20} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by issue ID, title, or details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-options">
            {['all', 'open', 'in-progress', 'resolved'].map((filter) => (
              <button 
                key={filter}
                className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter === 'all' ? 'All Requests' : filter.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="complaint-list">
        {filteredComplaints.length === 0 ? (
          <Card className="empty-state glass">
            <div className="empty-state-icon">
              <Inbox size={44} />
            </div>
            <h3>No Records Found</h3>
            <p className="text-muted">Refine your search parameters or adjust the filters to locate the maintenance requests.</p>
          </Card>
        ) : (
          filteredComplaints.map(complaint => {
            const isMenuActive = activeMenuCardId === complaint.id;
            return (
              <Card 
                key={complaint.id} 
                hover 
                className={`complaint-card glass status-${complaint.status}`}
                onClick={() => setSelectedComplaint(complaint)}
                style={{ zIndex: isMenuActive ? 10 : 1 }}
              >
                <div className="card-main-info">
                  <div className="issue-main">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="category-pill">{complaint.category}</span>
                      <span className="text-xs font-mono font-bold text-muted tracking-tight">#{complaint.id}</span>
                    </div>
                    <h3>{complaint.title}</h3>
                    <p className="description-text line-clamp-2">{complaint.description}</p>
                  </div>

                  <div className="card-status-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* 3-dot menu for admin */}
                    {isAdmin && (
                      <KebabMenu
                        complaint={complaint}
                        onOpenAssign={(c) => setAssigningComplaint(c)}
                        onToggle={(isOpen) => setActiveMenuCardId(isOpen ? complaint.id : null)}
                      />
                    )}
                    <span className={`badge badge-${complaint.status}`}>
                      {getStatusIcon(complaint.status)}
                      {complaint.status.replace('-', ' ')}
                    </span>
                    {complaint.feedback && (
                      <div 
                        title="User Feedback Provided"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(complaint);
                        }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          color: '#facc15',
                          background: 'rgba(250,204,21,0.15)',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          border: '1px solid rgba(250,204,21,0.3)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(250,204,21,0.1)'
                        }}
                      >
                        <Star size={13} fill="#facc15" />
                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reviewed</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted font-bold flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <Calendar size={14} />
                    {format(new Date(complaint.date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="footer-details">
                  <div className="info-item">
                    <span className="info-label">Reporter</span>
                    <span className="info-value">{complaint.author}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Room / Unit</span>
                    <span className="info-value">{complaint.room}</span>
                  </div>
                  {complaint.assignedTo && (
                    <div className="info-item">
                      <span className="info-label" style={{ color: 'var(--accent-primary)' }}>Assigned Labour</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.15rem' }}>
                        {(Array.isArray(complaint.assignedTo) ? complaint.assignedTo : [complaint.assignedTo]).map((name, i) => (
                          <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            background: 'rgba(56,189,248,0.12)', color: 'var(--accent-primary)',
                            fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                            borderRadius: '99px', border: '1px solid rgba(56,189,248,0.22)'
                          }}>
                            <UserCheck size={11} />{name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="footer-actions">
                  {isAdmin && (
                    <div className="flex gap-2">
                      {complaint.status === 'open' && (
                        <button 
                          className="btn btn-primary action-btn"
                          onClick={(e) => handleStatusUpdate(e, complaint.id, 'in-progress')}
                        >
                          Dispatch
                        </button>
                      )}
                      {complaint.status === 'in-progress' && (
                        <button 
                          className="btn btn-primary action-btn"
                          onClick={(e) => handleStatusUpdate(e, complaint.id, 'resolved')}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )}
                  {/* Student Feedback Button on Card */}
                  {(user?.role?.toLowerCase() === 'student' || (!isAdmin && user?.role !== 'admin')) && complaint.status === 'resolved' && !complaint.feedback && (
                    <button 
                      className="btn action-btn animate-fade-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(complaint);
                      }}
                      title={`Role: ${user?.role}, Status: ${complaint.status}`}
                      style={{ 
                        background: 'rgba(56,189,248,0.1)', 
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--accent-primary)',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Star size={14} fill="currentColor" />
                      Give Feedback
                    </button>
                  )}
                  <div className="arrow-indicator">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={!!selectedComplaint} 
        onClose={() => setSelectedComplaint(null)}
        title={`Maintenance File: ${selectedComplaint?.id}`}
      >
        {(() => {
          // Find the fresh version of this complaint from the context to get real-time status updates
          const freshComplaint = selectedComplaint 
            ? complaints.find(c => c.id === selectedComplaint.id) || selectedComplaint
            : null;
            
          if (!freshComplaint) return null;

          return (
            <div className="modal-content-premium">
              <div className="detail-stats">
                <div className="stat-card">
                  <span className="stat-label">Current Status</span>
                  <div className="flex items-center">
                    <span className={`status-dot ${freshComplaint.status}`}></span>
                    <span className="stat-value capitalize">{freshComplaint.status.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Logged Period</span>
                  <span className="stat-value">{format(new Date(freshComplaint.date), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">System Category</span>
                  <span className="stat-value text-accent-primary">{freshComplaint.category}</span>
                </div>
                {freshComplaint.assignedTo && (
                  <div className="stat-card">
                    <span className="stat-label" style={{ color: 'var(--accent-primary)' }}>Assigned Labour</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {(Array.isArray(freshComplaint.assignedTo) ? freshComplaint.assignedTo : [freshComplaint.assignedTo]).map((name, i) => (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: 'rgba(56,189,248,0.15)', color: 'var(--accent-primary)',
                          fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.7rem',
                          borderRadius: '99px', border: '1px solid rgba(56,189,248,0.28)'
                        }}>
                          <UserCheck size={13} />{name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <h4 className="text-3xl font-black mb-5 tracking-tight">{freshComplaint.title}</h4>
              <div className="glass p-5 rounded-3xl mb-6 bg-black/30 border-white/5 shadow-inner" 
                style={{ 
                  maxHeight: '160px', 
                  overflowY: 'auto',
                  scrollbarWidth: 'thin'
                }}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-secondary">{freshComplaint.description}</p>
              </div>

              {freshComplaint.images && freshComplaint.images.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="stat-label" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    📎 Attached Photos ({freshComplaint.images.length})
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {freshComplaint.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => openLightbox(freshComplaint.images, idx)}
                        title="Click to enlarge"
                        style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--glass-border)', cursor: 'zoom-in', transition: 'border-color 0.2s, transform 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <img src={img} alt={`Attachment ${idx + 1}`} style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', opacity: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.opacity = 1; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0; }}
                        >
                          <ZoomIn size={28} color="white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-4">
                  <button 
                    className="btn text-danger/80 hover:text-danger hover:bg-danger/10 transition-all font-bold"
                    onClick={() => {
                      if (window.confirm('Delete this maintenance record permanently?')) {
                        deleteComplaint(freshComplaint.id);
                        setSelectedComplaint(null);
                      }
                    }}
                  >
                    Expunge Record
                  </button>
                  <div className="flex gap-4">
                    {freshComplaint.status !== 'open' && (
                      <button className="btn btn-secondary" onClick={() => updateComplaintStatus(freshComplaint.id, 'open')}>Re-initialize</button>
                    )}
                    {freshComplaint.status !== 'in-progress' && (
                      <button className="btn btn-secondary" onClick={() => updateComplaintStatus(freshComplaint.id, 'in-progress')}>Escalate Flow</button>
                    )}
                    {freshComplaint.status !== 'resolved' && (
                      <button className="btn btn-primary" onClick={() => updateComplaintStatus(freshComplaint.id, 'resolved')}>Finalize Resolution</button>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Display / Submission */}
              <div style={{ marginTop: '1rem' }}>
                {freshComplaint.feedback ? (
                  <div className="feedback-display glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid rgba(250,204,21,0.3)', background: 'rgba(250,204,21,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Star size={16} color="#facc15" fill="#facc15" />
                        <h4 style={{ margin: 0, color: '#facc15', fontSize: '0.95rem' }}>User Feedback to Admin</h4>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} color={s <= freshComplaint.feedback.rating ? '#facc15' : 'rgba(255,255,255,0.2)'} fill={s <= freshComplaint.feedback.rating ? '#facc15' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      "{freshComplaint.feedback.comment || 'No comment provided.'}"
                    </p>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      Submitted on {format(new Date(freshComplaint.feedback.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                ) : (
                  (user?.role?.toLowerCase() === 'student' || (!isAdmin && user?.role !== 'admin')) && freshComplaint.status === 'resolved' && (
                    <FeedbackSection complaint={freshComplaint} onSubmitting={() => {
                      // Status update in context will trigger re-render with fresh data
                    }} />
                  )
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {lightbox.open && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={closeLightbox}
        />
      )}

      {/* Global Assign Labour Modal */}
      <AssignLabourModal
        isOpen={!!assigningComplaint}
        complaint={assigningComplaint}
        onClose={() => setAssigningComplaint(null)}
        onConfirm={(id, names) => assignStaff(id, names)}
      />
    </div>
  );
};

export default Complaints;