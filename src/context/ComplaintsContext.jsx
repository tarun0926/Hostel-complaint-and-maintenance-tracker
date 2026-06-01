import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNotifications } from './NotificationsContext';

// Create Context
const ComplaintsContext = createContext();

// Predefined maintenance staff list — multiple workers per domain
export const STAFF_LIST = [
  // Electrical
  { id: 'S-E01', name: 'Ramesh Kumar',    role: 'Senior Electrician', domain: 'Electrical' },
  { id: 'S-E02', name: 'Dinesh Gupta',    role: 'Electrician',        domain: 'Electrical' },
  { id: 'S-E03', name: 'Manoj Tiwari',    role: 'Electrician Helper',  domain: 'Electrical' },

  // Plumbing
  { id: 'S-P01', name: 'Suresh Verma',    role: 'Senior Plumber',     domain: 'Plumbing' },
  { id: 'S-P02', name: 'Rakesh Yadav',    role: 'Plumber',            domain: 'Plumbing' },
  { id: 'S-P03', name: 'Hemant Singh',    role: 'Plumber Helper',      domain: 'Plumbing' },

  // Carpentry
  { id: 'S-C01', name: 'Anil Sharma',     role: 'Senior Carpenter',   domain: 'Carpentry' },
  { id: 'S-C02', name: 'Rajesh Pandey',   role: 'Carpenter',          domain: 'Carpentry' },
  { id: 'S-C03', name: 'Santosh Mehta',   role: 'Carpenter Helper',    domain: 'Carpentry' },

  // Cleaning
  { id: 'S-CL1', name: 'Deepak Singh',    role: 'Cleaning Supervisor', domain: 'Cleaning' },
  { id: 'S-CL2', name: 'Arvind Patel',    role: 'Cleaner',             domain: 'Cleaning' },
  { id: 'S-CL3', name: 'Mohan Lal',       role: 'Cleaner',             domain: 'Cleaning' },
  { id: 'S-CL4', name: 'Sunita Devi',     role: 'Cleaner',             domain: 'Cleaning' },

  // General Maintenance
  { id: 'S-G01', name: 'Vijay Yadav',     role: 'Lead Technician',     domain: 'General Maintenance' },
  { id: 'S-G02', name: 'Pradeep Mishra',  role: 'Technician',          domain: 'General Maintenance' },
  { id: 'S-G03', name: 'Karan Rawat',     role: 'Technician',          domain: 'General Maintenance' },
];

const INITIAL_COMPLAINTS = [
  { id: 'C-1001', author: 'John Doe', enrollment: 'CS-2024-001', room: '402', category: 'Electrical', title: 'AC not working', description: 'The AC in room 402 is blowing warm air.', status: 'resolved', date: new Date('2026-03-12T09:30:00') },
  { id: 'C-1002', author: 'Jane Smith', enrollment: 'EC-2024-045', room: '205', category: 'Plumbing', title: 'Leaking tap in washroom', description: 'The left sink tap is leaking constantly.', status: 'in-progress', date: new Date('2026-03-11T14:15:00') },
  { id: 'C-1003', author: 'Mike Ross', enrollment: 'ME-2024-112', room: '112', category: 'Carpentry', title: 'Broken chair frame', description: 'One of my study chairs has a broken leg.', status: 'resolved', date: new Date('2026-03-10T11:00:00') },
  { id: 'C-1004', author: 'Sarah Lee', enrollment: 'STU-2026-304', room: '304', category: 'Electrical', title: 'Corridor lights flickering', description: 'The lights outside room 304 are flickering badly.', status: 'resolved', date: new Date('2026-03-09T18:45:00') },
  { id: 'C-1005', author: 'John Doe', enrollment: 'CS-2024-001', room: '402', category: 'Cleaning', title: 'Room dustbin not emptied', description: 'Trash hasn\'t been taken out for 3 days.', status: 'open', date: new Date('2026-03-12T10:00:00') },
  { id: 'C-1006', author: 'Demo User', enrollment: 'DEMO-000', room: '000', category: 'General Maintenance', title: 'Window latch broken', description: 'Unable to close the window properly.', status: 'resolved', date: new Date('2026-03-13T10:00:00') },
];

// Create Provider
export const ComplaintsProvider = ({ children }) => {
  const { addNotification } = useNotifications();
  
  const [complaints, setComplaints] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('hostel_complaints');
    if (saved) {
      // Parse dates back into Date objects
      const parsed = JSON.parse(saved);
      return parsed.map(c => ({ ...c, date: new Date(c.date) }));
    }
    return INITIAL_COMPLAINTS;
  });

  // Save to localStorage whenever complaints change
  useEffect(() => {
    localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Add a new complaint
  const addComplaint = (newComplaintData, user) => {
    const newId = `C-${1000 + complaints.length + 1}`;
    const complaint = {
      id: newId,
      author: user?.name || 'Unknown',
      enrollment: user?.enrollment || 'N/A',
      room: user?.room || 'N/A',
      status: 'open',
      date: new Date(),
      ...newComplaintData
    };
    
    // Add to the front of the array so newer ones are at the top
    setComplaints(prev => [complaint, ...prev]);
    
    // Notify admins about the new complaint
    addNotification('New Complaint Logged', `${user?.name} in Room ${user?.room} reported: ${complaint.title}`, 'admin');
  };

  // Update specific complaint status
  const updateComplaintStatus = (id, newStatus) => {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return;
    
    const oldStatus = complaint.status;
    
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (oldStatus !== newStatus) {
      // Notify the specific student that their complaint status changed
      addNotification(
        'Complaint Status Updated', 
        `Your issue '${complaint.title}' is now ${newStatus.toUpperCase().replace('-', ' ')}.`, 
        complaint.author
      );
    }
  };

  // Provide stats derived from current complaints array
  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    unassigned: complaints.filter(c => !c.assignedTo && c.status !== 'resolved').length
  };

  // Assign staff + task to a complaint (staffName can be string or array)
  const assignStaff = (id, staffName, taskDescription = '') => {
    const assignedTo = Array.isArray(staffName) ? staffName : [staffName];
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, assignedTo, assignedTask: taskDescription, assignedAt: new Date() } : c)
    );
    
    // Add a notification for the student
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      const names = assignedTo.join(', ');
      addNotification('Labour Assigned', `Labour assigned to your issue "${complaint.title}": ${names}`, complaint.author);
    }
  };

  // Submit feedback for a resolved complaint
  const submitFeedback = (id, rating, comment) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, feedback: { rating, comment, date: new Date() } } : c)
    );
    
    // Notify admins about new feedback
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      addNotification('New Feedback Received', `User ${complaint.author} gave ${rating} stars for issue: ${complaint.title}`, 'admin');
    }
  };

  // Delete a complaint
  const deleteComplaint = (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
  };

  // Delete all complaints for a specific student (used during user deletion)
  const deleteComplaintsByStudent = (enrollment) => {
    if (!enrollment) return;
    const target = enrollment.trim().toLowerCase();
    setComplaints(prev => prev.filter(c => 
      !c.enrollment || c.enrollment.trim().toLowerCase() !== target
    ));
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, stats, addComplaint, updateComplaintStatus, assignStaff, submitFeedback, deleteComplaint, deleteComplaintsByStudent }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

// Custom hook
export const useComplaints = () => {
  return useContext(ComplaintsContext);
};
