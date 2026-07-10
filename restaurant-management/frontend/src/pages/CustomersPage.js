import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    const [custRes, statsRes] = await Promise.all([API.get('/customers'), API.get('/customers/stats')]);
    setCustomers(custRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const viewDetail = async (customer) => {
    setSelected(customer);
    const { data } = await API.get(`/customers/${customer._id}`);
    setDetail(data);
  };

  const updateTier = async (id, tier) => {
    await API.put(`/customers/${id}`, { loyaltyTier: tier });
    load();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Customers</h2>
      </div>

      <div className="stats-grid mb-6">
        <div className="stat-card"><div className="stat-label">Total Patrons</div><div className="stat-value">{stats.totalPatrons?.toLocaleString() || 0}</div></div>
        <div className="stat-card"><div className="stat-label">Average Loyalty</div><div className="stat-value">{stats.avgLoyalty || 4.8}</div></div>
        <div className="stat-card"><div className="stat-label">Returning Rate</div><div className="stat-value">{stats.returningRate || '0%'}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">Customer Database</span>
              <input className="form-control" style={{ width: 240 }} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Customer</th><th>Contact</th><th>Status</th><th>Orders</th><th>Spent</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No customers found</td></tr>}
                  {filtered.map(c => (
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => viewDetail(c)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                            {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <strong>{c.name}</strong>
                        </div>
                      </td>
                      <td className="text-muted text-sm">{c.email}</td>
                      <td><span className={`badge badge-${c.loyaltyTier}`}>{c.loyaltyTier?.toUpperCase()}</span></td>
                      <td>{c.totalOrders}</td>
                      <td>₹{c.totalSpent?.toFixed(2)}</td>
                      <td><button className="btn btn-secondary btn-sm">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="card" style={{ background: '#1e1e2d', color: 'white' }}>
              <div style={{ fontWeight: 700, marginBottom: 10, color: 'white' }}>Campaign Performance</div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Your Platinum Weekend promotion saw a 24% increase in covers. Loyalty program engagement is up 18% this quarter.</p>
            </div>
            <div className="card" style={{ background: '#e65100', color: 'white', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Ready for a VIP Night?</div>
              <p style={{ fontSize: 12, opacity: 0.85 }}>Send invitations to your {customers.filter(c => c.loyaltyTier === 'platinum').length} Platinum members</p>
            </div>
          </div>
        </div>

        {selected && detail && (
          <div className="card" style={{ width: 300, flexShrink: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <strong style={{ fontSize: 15 }}>Customer Profile</strong>
              <button onClick={() => { setSelected(null); setDetail(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 18, margin: '0 auto 10px' }}>
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <strong style={{ fontSize: 16 }}>{detail.customer.name}</strong>
              <div className="text-muted text-sm">{detail.customer.email}</div>
              <span className={`badge badge-${detail.customer.loyaltyTier}`} style={{ marginTop: 6 }}>{detail.customer.loyaltyTier?.toUpperCase()}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div className="staff-stat-box"><small>ORDERS</small><strong>{detail.customer.totalOrders}</strong></div>
              <div className="staff-stat-box"><small>SPENT</small><strong>₹{detail.customer.totalSpent?.toFixed(0)}</strong></div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 8, display: 'block' }}>Loyalty Tier</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {['bronze', 'silver', 'gold', 'platinum'].map(tier => (
                  <button key={tier} className={`btn btn-sm ${detail.customer.loyaltyTier === tier ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateTier(selected._id, tier)} style={{ textTransform: 'capitalize' }}>
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            {detail.recentOrders?.length > 0 && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 8, display: 'block' }}>Recent Orders</label>
                {detail.recentOrders.slice(0, 3).map(o => (
                  <div key={o._id} className="flex items-center justify-between" style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{o.orderNumber}</span>
                    <span style={{ fontWeight: 600 }}>₹{o.total?.toFixed(2)}</span>
                    <span className={`badge badge-${o.status}`} style={{ fontSize: 10 }}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
