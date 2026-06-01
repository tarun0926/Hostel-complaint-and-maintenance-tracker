import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, User, AlertCircle } from 'lucide-react';
import './Auth.css';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessError, setAccessError] = useState('');
  
  const { adminRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      await adminRegister(name, email, password);
      navigate('/admin', { state: { message: 'Admin registration successful! Please login.' } });
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
            <p className="text-muted">Enter master access code to unlock registration</p>
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
          <h2>Admin Registration</h2>
          <p className="text-muted">Create a new administrator account</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-icon" />
              <input 
                type="text" 
                className="input-field icon-padding" 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Admin Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-icon" />
              <input 
                type="email" 
                className="input-field icon-padding" 
                placeholder="admin@hostel.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>



          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-icon" />
              <input 
                type="password" 
                className="input-field icon-padding" 
                placeholder="At least 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength="6"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-icon" />
              <input 
                type="password" 
                className="input-field icon-padding" 
                placeholder="Repeat password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading} style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}>
            {isLoading ? 'Creating Account...' : 'Register as Admin'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <p>Already an Admin? <Link to="/admin" className="auth-link text-danger" style={{ color: 'var(--danger)' }}>Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
