import React, { createContext, useState, useEffect, useContext } from 'react';

// Create Context
const AuthContext = createContext();

const MOCK_REGISTERED_USERS = [
  { id: 'U-990', enrollment: 'CS-2024-001', name: 'John Doe', email: 'john@student.com', role: 'student', room: '402' },
  { id: 'U-991', enrollment: 'EC-2024-045', name: 'Jane Smith', email: 'jane@student.com', role: 'student', room: '205' },
  { id: 'U-992', enrollment: 'ME-2024-112', name: 'Mike Ross', email: 'mike@student.com', role: 'student', room: '112' },
  { id: 'U-000', enrollment: 'DEMO-000', name: 'Demo User', email: 'demo@student.com', role: 'student', room: '000' }
];

const DEFAULT_ADMIN = { id: 'U-001', name: 'Hostel Admin', email: 'admin@hostel.com', role: 'admin' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('hostel_all_users');
    return saved ? JSON.parse(saved) : MOCK_REGISTERED_USERS;
  });
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('hostel_admins');
    return saved ? JSON.parse(saved) : [DEFAULT_ADMIN];
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('hostel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Ensure the demo user exists in allUsers if it's not there
    const demoUser = MOCK_REGISTERED_USERS.find(u => u.email === 'demo@student.com');
    setAllUsers(prev => {
      if (demoUser && !prev.find(u => u.email === 'demo@student.com')) {
        return [...prev, demoUser];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('hostel_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('hostel_admins', JSON.stringify(admins));
  }, [admins]);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Mock login validation
      setTimeout(() => {
        // First check in admins pool
        const foundAdmin = admins.find(a => a.email === email);
        if (foundAdmin) {
          // In a real app, we'd check password hash here
          if (password === 'admin123' || password.length >= 6) { 
            setUser(foundAdmin);
            localStorage.setItem('hostel_user', JSON.stringify(foundAdmin));
            resolve(foundAdmin);
            return;
          } else {
            reject('Invalid administrator password.');
            return;
          }
        }

        // Then check against the allUsers list (registered students)
        const foundUser = allUsers.find(u => u.email === email);
        
        if (foundUser && password.length >= 6) {
          setUser(foundUser);
          localStorage.setItem('hostel_user', JSON.stringify(foundUser));
          resolve(foundUser);
        } else {
          reject('Invalid email or password. Please check your credentials.');
        }
      }, 1000);
    });
  };

  const register = (name, email, enrollment, room, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          reject('Must use a valid email address to register.');
          return;
        }
        if (password.length < 6) {
          reject('Password must be at least 6 characters.');
          return;
        }
        
        const newUser = { id: `U-${Math.floor(Math.random() * 1000)}`, enrollment, name, email, role: 'student', room };
        
        // Check if email already exists
        if (allUsers.find(u => u.email === email)) {
          reject('Email already registered.');
          return;
        }

        setAllUsers(prev => [...prev, newUser]);
        resolve(newUser);
      }, 1500);
    });
  };

  const adminRegister = (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          reject('Must use a valid email address to register.');
          return;
        }
        if (password.length < 6) {
          reject('Password must be at least 6 characters.');
          return;
        }

        // Check if admin already exists
        if (admins.find(a => a.email === email)) {
          reject('Administrator email already registered.');
          return;
        }
        
        const newAdmin = { id: `A-${Math.floor(Math.random() * 1000)}`, name, email, role: 'admin' };
        setAdmins(prev => [...prev, newAdmin]);
        resolve(newAdmin);
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostel_user');
  };

  const deleteUser = (userId) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    
    // If the admin deleted themselves or a user on another tab is affected:
    // This is tricky with local storage, but for the current session:
    if (user && user.id === userId) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      allUsers,
      login, 
      register, 
      adminRegister, 
      logout,
      deleteUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
