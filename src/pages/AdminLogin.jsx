import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, AlertCircle } from 'lucide-react';
import './Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessError, setAccessError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        // If somehow they log in with a student account on the admin portal
        setError('Access Denied. Administrator privileges required.');
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessCode === '787930') {
      setIsAuthorized(true);
      setAccessError('');
    } else {
      setAccessError('Invalid Access Code. Please contact system administrator.');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="auth-container animate-fade-in" style={{ 
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(239, 68, 68, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)' 
      }}>
        <div className="auth-card glass" style={{ borderTop: '4px solid var(--danger)' }}>
          <div className="auth-header">
            <div className="auth-logo glass" style={{ background: 'linear-gradient(135deg, var(--danger), #b91c1c)'}}>
              <ShieldAlert size={28} color="white" />
            </div>
            <h2>Admin Verification</h2>
            <p className="text-muted">Enter master access code to unlock admin portal</p>
          </div>

          {accessError && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{accessError}</span>
            </div>
          )}

          <form onSubmit={handleAccessSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Master Access Code</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-icon" />
                <input 
                  type="password" 
                  className="input-field icon-padding" 
                  placeholder="Enter 6-digit code" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoComplete="off"
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
              Verify & Continue
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <p>Student? <Link to="/login" className="auth-link">Return to Student Login</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container animate-fade-in" style={{ 
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(239, 68, 68, 0.1) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%)' 
    }}>
      <div className="auth-card glass" style={{ borderTop: '4px solid var(--danger)' }}>
        <div className="auth-header">
          <div className="auth-logo glass" style={{ background: 'linear-gradient(135deg, var(--danger), #b91c1c)'}}>
            <ShieldAlert size={28} color="white" />
          </div>
          <h2>Admin Portal</h2>
          <p className="text-muted">Secure access for hostel staff & administrators</p>
        </div>

        {location.state?.message && (
          <div className="auth-success" style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{location.state.message}</span>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Admin Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-icon" />
              <input 
                type="email" 
                className="input-field icon-padding" 
                placeholder="admin@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Admin Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-icon" />
              <input 
                type="password" 
                className="input-field icon-padding" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>


        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <p>Need admin access? <Link to="/admin/register" className="auth-link text-danger" style={{ color: 'var(--danger)' }}>Register here</Link></p>
          <p style={{ marginTop: '0.5rem' }}>Student? <Link to="/login" className="auth-link">Return to Student Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
