import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['all', 'starters', 'mains','breads', 'desserts', 'beverages'];
const EMOJIS = { starters: '🥗', mains: '🍽️', breads: '🫓', desserts: '🍮', beverages: '🍷' };

export default function MenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'starters', price: '', isAvailable: true, isPopular: false, isFeatured: false, allergens: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [itemsRes, statsRes] = await Promise.all([API.get('/menu'), API.get('/menu/stats')]);
    setItems(itemsRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item ? { ...item, allergens: (item.allergens || []).join(', ') } : { name: '', description: '', category: 'starters', price: '', isAvailable: true, isPopular: false, isFeatured: false, allergens: '' });
    setError('');
    setModal(true);
  };

  const save = async () => {
    setError('');
    try {
      const payload = { ...form, price: Number(form.price), allergens: form.allergens ? form.allergens.split(',').map(a => a.trim()) : [] };
      if (editing) await API.put(`/menu/${editing._id}`, payload);
      else await API.post('/menu', payload);
      setModal(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await API.delete(`/menu/${id}`);
    load();
  };

  const toggleAvail = async (item) => {
    await API.put(`/menu/${item._id}`, { isAvailable: !item.isAvailable });
    load();
  };

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Master Catalog</h2>
        {user.role === 'admin' && <button className="btn btn-primary" onClick={() => openModal()}>+ Add New Item</button>}
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Items</div><div className="stat-value">{stats.total || 0}</div></div>
        <div className="stat-card"><div className="stat-label">Active Categories</div><div className="stat-value">{stats.activeCategories || 0}</div></div>
        <div className="stat-card danger"><div className="stat-label">Out of Stock</div><div className="stat-value">{stats.outOfStock || 0}</div></div>
        <div className="stat-card"><div className="stat-label">Popular Item</div><div className="stat-value popular">{stats.popularItem || '—'}</div></div>
      </div>

      <div className="filters">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-btn${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? 'All Dishes' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th>Sold</th>{user.role === 'admin' && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No items found</td></tr>}
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div className="text-muted text-sm">{item.description.slice(0, 55)}...</div>
                    {item.isPopular && <span className="badge badge-platinum" style={{ marginTop: 4 }}>Popular</span>}
                  </td>
                  <td><span style={{ textTransform: 'capitalize' }}>{EMOJIS[item.category]} {item.category}</span></td>
                  <td><strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>₹{item.price.toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge badge-${item.isAvailable ? 'available' : 'cancelled'}`}>
                      {item.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="text-muted">{item.soldCount}</td>
                  {user.role === 'admin' && (
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleAvail(item)}>
                          {item.isAvailable ? 'Disable' : 'Enable'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(item._id)}>Del</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Edit Menu Item' : 'Add New Item'}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['starters', 'mains','breads', 'desserts', 'beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Item description..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Allergens (comma-sep)</label>
                <input className="form-control" value={form.allergens} onChange={e => setForm({ ...form, allergens: e.target.value })} placeholder="nuts, dairy..." />
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              {[['isAvailable', 'Available'], ['isPopular', 'Popular'], ['isFeatured', 'Featured']].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} />
                  {l}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
