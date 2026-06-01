import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Mail, Lock, User, AlertCircle, DoorOpen } from 'lucide-react';
import './Auth.css'; // Reusing the same styles

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      await register(name, email, enrollment, room, password);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo glass">
            <Home size={28} color="var(--accent-primary)" />
          </div>
          <h2>Create Account</h2>
          <p className="text-muted">Register as a new hostel resident</p>
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
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-icon" />
              <input 
                type="email" 
                className="input-field icon-padding" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Enrollment Number</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-icon" />
              <input 
                type="text" 
                className="input-field icon-padding" 
                placeholder="e.g. EN-2026-001" 
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Room Number</label>
            <div className="auth-input-wrapper">
              <DoorOpen size={18} className="auth-icon" />
              <input 
                type="text" 
                className="input-field icon-padding" 
                placeholder="e.g. 402" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
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

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
