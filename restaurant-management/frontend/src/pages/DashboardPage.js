import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import API from '../utils/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!data) return <div className="loading">Failed to load dashboard.</div>;

  const { stats, recentActivity, topSellingItems, chartData } = data;

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Dashboard Summary</h2>
        <div className="topbar-actions">
          <span className="text-muted text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{Number(stats.totalRevenue).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Orders</div>
          <div className="stat-value">{stats.todayOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Tables</div>
          <div className="stat-value">{stats.activeTables} / {stats.totalTables}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Real-time Analytics — Weekly Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#e65100" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Selling Items</span>
          </div>
          {topSellingItems.length === 0 ? (
            <div className="empty-state"><p>No data yet</p></div>
          ) : topSellingItems.map((item, i) => (
            <div key={item._id} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center gap-2">
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#e65100' : '#f1f5f9', color: i === 0 ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
              </div>
              <strong style={{ fontSize: 13, color: '#64748b' }}>{item.soldCount} sold</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="empty-state"><p>No recent orders</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Table</th><th>Status</th><th>Total</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>{o.customer || '—'}</td>
                    <td>{o.tableNumber || '—'}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td><strong>₹{o.total?.toFixed(2)}</strong></td>
                    <td className="text-muted text-sm">{new Date(o.time).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ background: '#1e1e2d', color: 'white' }}>
          <div className="card-title" style={{ color: 'white', marginBottom: 10 }}>Campaign Performance</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Your Platinum Weekend promotion saw a 24% increase in covers this month. Consider running another targeted VIP event.</p>
        </div>
        <div className="card" style={{ background: '#e65100', color: 'white', cursor: 'pointer' }}>
          <div className="card-title" style={{ color: 'white', marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Create New Order', 'Add Menu Item', 'New Reservation'].map(a => (
              <div key={a} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '10px 12px', fontSize: 13, fontWeight: 500 }}>{a}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
