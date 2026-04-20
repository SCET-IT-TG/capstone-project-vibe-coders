import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', tableNumber: '', date: '', time: '', guestCount: 2, specialRequests: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [resRes, tablesRes] = await Promise.all([API.get('/reservations'), API.get('/tables')]);
    setReservations(resRes.data);
    setTables(tablesRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setError(''); setSuccess('');
    if (!form.customerName || !form.date || !form.time) { setError('Name, date and time are required'); return; }
    try {
      await API.post('/reservations', form);
      setSuccess('Reservation confirmed!');
      setForm({ customerName: '', customerPhone: '', tableNumber: '', date: '', time: '', guestCount: 2, specialRequests: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create reservation'); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    await API.delete(`/reservations/${id}`);
    load();
  };

  if (loading) return <div className="loading">Loading reservations...</div>;

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Reservations</h2>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="card mb-6">
            <div className="card-header"><span className="card-title">Table Status</span></div>
            <div className="tables-grid">
              {tables.map(t => (
                <div key={t._id} className={`table-box ${t.status} ${t.type === 'booth' ? 'booth' : ''}`}>
                  <div className="table-number">
                    {t.type === 'booth' ? `BOOTH ${t.number}` : `TABLE ${t.number}`}
                  </div>
                  <small style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{t.location} view</small>
                  {t.status === 'occupied' && t.seatedAt && (
                    <span className="warning-text" style={{ fontSize: 10 }}>
                      {Math.round((Date.now() - new Date(t.seatedAt)) / 60000)}m seated
                    </span>
                  )}
                  {t.status !== 'occupied' && (
                    <span className={`badge badge-${t.status}`} style={{ fontSize: 9, padding: '2px 6px', marginTop: 2 }}>{t.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Upcoming Reservations</span></div>
            {reservations.length === 0 ? (
              <div className="empty-state"><p>No reservations yet</p></div>
            ) : reservations.map(res => (
              <div key={res._id} className="flex items-center gap-3" style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div className="date-badge">
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{new Date(res.date).getDate()}</div>
                  <div style={{ fontSize: 10 }}>{new Date(res.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 14 }}>{res.customerName}</strong>
                  <div className="text-muted text-sm">{res.guestCount} Guests • {res.time} • Table {res.tableNumber || 'TBD'}</div>
                  {res.specialRequests && <div style={{ fontSize: 12, color: '#e65100', marginTop: 2 }}>Note: {res.specialRequests}</div>}
                </div>
                <span className={`badge badge-${res.status}`}>{res.status}</span>
                <button className="btn btn-danger btn-sm" onClick={() => cancel(res._id)}>Cancel</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 320, background: '#f0f4f8', borderRadius: 12, padding: 24, flexShrink: 0 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, marginBottom: 20 }}>New Reservation</h3>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>Customer Name</label>
            <input className="form-control" placeholder="e.g. John Doe" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" placeholder="Phone number" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" className="form-control" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Table Number</label>
            <select className="form-control" value={form.tableNumber} onChange={e => setForm({ ...form, tableNumber: e.target.value })}>
              <option value="">Select table...</option>
              {tables.filter(t => t.status === 'available').map(t => (
                <option key={t._id} value={t.number}>{t.type === 'booth' ? `Booth ${t.number}` : `Table ${t.number}`} (cap: {t.capacity})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Number of Guests</label>
            <div className="flex gap-2">
              {[2, 4, 6, '8+'].map(n => (
                <button key={n} className={`btn btn-sm ${form.guestCount === n || (n === '8+' && form.guestCount >= 8) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, guestCount: n === '8+' ? 8 : n })} style={{ flex: 1 }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Special Requests</label>
            <input className="form-control" placeholder="Allergies, occasion..." value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block" onClick={submit}>CONFIRM RESERVATION</button>
        </div>
      </div>
    </div>
  );
}
