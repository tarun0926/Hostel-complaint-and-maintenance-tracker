import React, { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { Users, Trash2, Search, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';

const StudentManagement = () => {
  const { allUsers, deleteUser } = useAuth();
  const { deleteComplaintsByStudent } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);

  // Filter out admins, we only want to manage students
  const students = allUsers.filter(u => u.role === 'student');

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (userToDelete) {
      // First clean up all complaints associated with this student
      if (userToDelete.enrollment) {
        deleteComplaintsByStudent(userToDelete.enrollment);
      }
      
      // Then delete the user account
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users color="var(--accent-primary)" />
            Student Management
          </h1>
          <p className="text-muted">View and manage all registered hostel residents.</p>
        </div>
        
        <div className="search-bar glass" style={{ maxWidth: '300px', margin: 0 }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Enrollment</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Room</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{student.name}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{student.enrollment || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-in-progress" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)' }}>
                        Room {student.room || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => setUserToDelete(student)}
                        title="Remove Student Access"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Revoke Access">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <AlertTriangle size={32} color="var(--danger)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Remove {userToDelete?.name}?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            This student will immediately lose access to the portal. This action cannot be undone.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setUserToDelete(null)}>Cancel</button>
            <button className="btn btn-primary" style={{ background: 'var(--danger)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }} onClick={handleDelete}>
              Yes, Remove Student
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;
