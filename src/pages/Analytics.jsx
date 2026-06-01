import React from 'react';
import Card from '../components/Card';
import { useComplaints } from '../context/ComplaintsContext';
import { BarChart3, Download, PieChart, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const Analytics = () => {
  const { complaints, stats } = useComplaints();

  // Category distribution
  const categories = ['Electrical', 'Plumbing', 'Cleaning', 'Carpentry', 'Other'];
  const categoryData = categories.map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length
  }));

  const maxCount = Math.max(...categoryData.map(d => d.count), 1);

  // CSV Export Logic
  const exportToCSV = () => {
    const headers = ['ID,Author,Room,Category,Title,Status,Date,AssignedTo\n'];
    const rows = complaints.map(c => 
      `${c.id},"${c.author}",${c.room},${c.category},"${c.title}",${c.status},${format(c.date, 'yyyy-MM-dd')},"${c.assignedTo || 'Unassigned'}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hostel_complaints_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="var(--accent-primary)" />
            Analytics & Reports
          </h1>
          <p className="text-muted">Analyze complaint trends and export data.</p>
        </div>
        
        <button className="btn btn-primary" onClick={exportToCSV}>
          <Download size={18} />
          <span>Download CSV Report</span>
        </button>
      </div>

      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Card>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} color="var(--accent-primary)" />
            Status Distribution
          </h3>
          <div className="status-bars" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { label: 'Open', count: stats.open, color: 'var(--danger)', icon: <AlertCircle size={16} /> },
              { label: 'In Progress', count: stats.inProgress, color: 'var(--warning)', icon: <Clock size={16} /> },
              { label: 'Resolved', count: stats.resolved, color: 'var(--success)', icon: <CheckCircle2 size={16} /> }
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{item.icon} {item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.count} ({Math.round((item.count / (stats.total || 1)) * 100)}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(item.count / (stats.total || 1)) * 100}%`, background: item.color, borderRadius: '10px', transition: 'width 1s ease-out' }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-secondary)" />
            Category Trends
          </h3>
          <div className="category-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 1rem' }}>
            {categoryData.map(data => (
              <div key={data.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{data.count}</span>
                <div 
                  style={{ 
                    width: '30px', 
                    height: `${(data.count / maxCount) * 120}px`, 
                    background: 'linear-gradient(to top, var(--accent-primary), var(--accent-tertiary))', 
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 1s ease-out'
                  }}
                  title={`${data.name}: ${data.count}`}
                ></div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', height: '24px' }}>{data.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
            <AlertCircle color="var(--accent-primary)" size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>Efficiency Insight</h4>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Currently, <strong>{stats.unassigned}</strong> complaints are unassigned. Assigning staff members can reduce resolution time by up to 40%.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
