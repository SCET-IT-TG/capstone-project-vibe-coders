import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', position: '', shiftEnd: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [staffRes, statsRes] = await Promise.all([API.get('/staff'), API.get('/staff/stats')]);
    setStaff(staffRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = (member = null) => {
    setEditing(member);
    setForm(member ? { ...member, password: '' } : { name: '', email: '', password: '', phone: '', position: '', shiftEnd: '' });
    setError('');
    setModal(true);
  };

  const save = async () => {
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) await API.put(`/staff/${editing._id}`, payload);
      else await API.post('/staff', payload);
      setModal(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    await API.delete(`/staff/${id}`);
    load();
  };

  if (loading) return <div className="loading">Loading staff...</div>;

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Roster Overview</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Staff</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ flex: 2 }}>
          <div className="stat-label">Floor Efficiency</div>
          <div className="stat-value">{stats.floorEfficiency || 94}%</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${stats.floorEfficiency || 94}%` }} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Prep Time</div>
          <div className="stat-value sm">14.2m</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Service Rating</div>
          <div className="stat-value sm">{stats.avgServiceRating || 4.8} ★</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Staff</div>
          <div className="stat-value sm">{stats.totalActive || staff.length}</div>
        </div>
      </div>

      <div className="staff-grid">
        {staff.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}><h3>No staff members yet</h3><p>Add staff members to get started</p></div>
        )}
        {staff.map(member => (
          <div key={member._id} className="staff-card">
            <div className="staff-card-header">
              <div className="avatar">{initials(member.name)}</div>
              <div>
                <strong style={{ fontSize: 15 }}>{member.name}</strong>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{member.position || 'Staff'}</div>
              </div>
            </div>
            <div className="staff-stats-row">
              <div className="staff-stat-box">
                <small>SHIFT ENDS</small>
                <strong>{member.shiftEnd || 'N/A'}</strong>
              </div>
              <div className="staff-stat-box">
                <small>TABLES</small>
                <strong>{member.tablesManaged || 0}</strong>
              </div>
              <div className="staff-stat-box">
                <small>RATING</small>
                <strong>{member.serviceRating || '4.8'} ★</strong>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{member.email} {member.phone && `• ${member.phone}`}</div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openModal(member)}>Edit Details</button>
              <button className="btn btn-danger btn-sm" onClick={() => del(member._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Edit Staff Member' : 'Add Staff Member'}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
              <div className="form-group"><label>Position</label><input className="form-control" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="e.g. Sous Chef" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@culina.com" /></div>
              <div className="form-group"><label>{editing ? 'New Password (optional)' : 'Password'}</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></div>
              <div className="form-group"><label>Shift End</label><input className="form-control" value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} placeholder="e.g. 11:00 PM" /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Member'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
