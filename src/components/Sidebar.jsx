import React from 'react';
import { Home, ClipboardList, PenTool, LayoutDashboard, FileText, Megaphone, Users, BarChart3, Settings, Menu, X, LogOut, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Complaints', icon: <FileText size={20} />, path: '/complaints' },
    { name: 'Announcements', icon: <Megaphone size={20} />, path: '/announcements', adminOnly: true },
    { name: 'Students', icon: <Users size={20} />, path: '/students', adminOnly: true },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics', adminOnly: true },
    { name: 'Submit Issue', icon: <PenTool size={20} />, path: '/submit', hideForAdmin: true },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' }
  ];

  // Filter items based on role
  const filteredNavItems = navItems.filter(item => {
    if (user?.role === 'admin' && item.hideForAdmin) return false;
    if (user?.role !== 'admin' && item.adminOnly) return false;
    return true;
  });

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`glass-nav sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon glass">
              <Home size={24} color="var(--accent-primary)" />
            </div>
            <h2>HostelCare</h2>
          </div>
          <button className="mobile-close btn-secondary btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active glass' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="glass user-card mb-4" onClick={() => navigate('/profile')}>
              <div className="avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">
                  {user.role === 'admin' ? 'Administrator' : `Room ${user.room || 'N/A'}`}
                </span>
              </div>
            </div>
          )}
          
          <button className="btn btn-secondary w-full" onClick={handleLogout} style={{ justifyContent: 'flex-start', paddingLeft: '1rem' }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
