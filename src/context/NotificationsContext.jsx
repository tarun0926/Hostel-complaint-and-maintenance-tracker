import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hostel_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(n => ({ ...n, date: new Date(n.date) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('hostel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Add a new notification
  const addNotification = (title, message, relatedUserId = null, expiresAt = null, isAnnouncement = false) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      relatedUserId,
      isAnnouncement,
      expiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
      date: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Cleanup expired notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > now));
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mark all as read for current user
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => {
        // Mark as read if it's targeted to admin and current user is admin
        if (user?.role === 'admin' && (n.relatedUserId === 'admin' || !n.relatedUserId)) return { ...n, read: true };
        // Mark as read if it's targeted to current student
        if (user?.role !== 'admin' && n.relatedUserId === user?.name) return { ...n, read: true };
        return n;
      })
    );
  };

  // Get notifications specifically for the current logged-in user
  const userNotifications = notifications.filter(n => {
    if (!user) return false;
    
    // Priority for announcements - if it's marked as announcement and has no target user, everyone sees it
    if (n.isAnnouncement && !n.relatedUserId) return true;

    if (user.role === 'admin') {
      // Admins see everything global AND things specifically for admins
      return !n.relatedUserId || n.relatedUserId === 'admin';
    } else {
      // Students see things global AND things specifically for them
      return !n.relatedUserId || n.relatedUserId === user.name;
    }
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ 
      notifications: userNotifications, 
      allNotifications: notifications, // For admin management
      unreadCount, 
      addNotification, 
      removeNotification,
      markAllAsRead 
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
