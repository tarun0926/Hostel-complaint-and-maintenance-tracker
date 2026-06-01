import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Mail, Lock, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
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
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to HostelCare</p>
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
            <label className="input-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-icon" />
              <input 
                type="email" 
                className="input-field icon-padding" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
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
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required 
              />
            </div>
            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
          <p style={{ marginTop: '0.5rem' }}><Link to="/admin" className="auth-link text-muted" style={{ fontSize: '0.8rem' }}>Staff / Administrator Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
