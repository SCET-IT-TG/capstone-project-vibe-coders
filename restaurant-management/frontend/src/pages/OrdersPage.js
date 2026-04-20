import React, { useEffect, useState, useCallback } from 'react';
import API from '../utils/api';

const STATUSES = ['new', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
const KANBAN_COLS = ['new', 'preparing', 'ready', 'served'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({ tableNumber: '', guestCount: 1, kitchenNotes: '', items: [] });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [ordersRes, menuRes] = await Promise.all([API.get('/orders'), API.get('/menu?available=true')]);
    setOrders(ordersRes.data);
    setMenuItems(menuRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await API.put(`/orders/${id}/status`, { status });
    load();
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
  };

  const addOrderItem = (menuItem) => {
    const exists = newOrder.items.find(i => i.menuItemId === menuItem._id);
    if (exists) {
      setNewOrder({ ...newOrder, items: newOrder.items.map(i => i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      setNewOrder({ ...newOrder, items: [...newOrder.items, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }] });
    }
  };

  const submitOrder = async () => {
    setError('');
    if (!newOrder.tableNumber) { setError('Table number is required'); return; }
    if (newOrder.items.length === 0) { setError('Add at least one item'); return; }
    try {
      await API.post('/orders', newOrder);
      setCreating(false);
      setNewOrder({ tableNumber: '', guestCount: 1, kitchenNotes: '', items: [] });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create order'); }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  const colOrders = (col) => orders.filter(o => o.status === col);

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Order Management</h2>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ New Order</button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <div className="kanban-board">
            {KANBAN_COLS.map(col => (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                  {col.toUpperCase()} <span className="count">{colOrders(col).length}</span>
                </div>
                {colOrders(col).length === 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.5)', border: '2px dashed #e2e8f0', borderRadius: 10, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>No orders</div>
                )}
                {colOrders(col).map(order => (
                  <div key={order._id} className={`ticket ${order.status}`} onClick={() => setSelected(order)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="ticket-number">{order.orderNumber}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="ticket-meta">TABLE {order.tableNumber || '—'} • {order.guestCount} GUESTS</div>
                    <div className="ticket-items">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i}>• {item.quantity}x {item.name}</div>
                      ))}
                      {order.items.length > 3 && <div style={{ color: '#94a3b8' }}>+{order.items.length - 3} more</div>}
                    </div>
                    {order.kitchenNotes && <div className="kitchen-note">⚠ {order.kitchenNotes}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="order-detail-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="order-detail-header" style={{ margin: 0, border: 'none', padding: 0 }}>Order {selected.orderNumber}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
              TABLE {selected.tableNumber || '—'} • {selected.guestCount} GUESTS
            </div>
            {selected.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {selected.kitchenNotes && <div className="kitchen-note" style={{ marginTop: 12 }}>⚠ KITCHEN NOTE: {selected.kitchenNotes}</div>}
            <div style={{ margin: '14px 0', padding: '14px 0', borderTop: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-between" style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                <span>Subtotal</span><span>₹{selected.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                <span>Tax (8.5%)</span><span>₹{selected.tax?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between" style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>
                <span>Total</span><span style={{ color: '#e65100' }}>₹{selected.total?.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 8, display: 'block' }}>Update Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STATUSES.map(s => (
                  <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => updateStatus(selected._id, s)} style={{ textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Order</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Table Number</label>
                <input className="form-control" value={newOrder.tableNumber} onChange={e => setNewOrder({ ...newOrder, tableNumber: e.target.value })} placeholder="e.g. 08" />
              </div>
              <div className="form-group">
                <label>Guests</label>
                <input type="number" className="form-control" value={newOrder.guestCount} onChange={e => setNewOrder({ ...newOrder, guestCount: Number(e.target.value) })} min={1} />
              </div>
            </div>
            <div className="form-group">
              <label>Kitchen Notes / Allergies</label>
              <input className="form-control" value={newOrder.kitchenNotes} onChange={e => setNewOrder({ ...newOrder, kitchenNotes: e.target.value })} placeholder="e.g. Severe shellfish allergy..." />
            </div>
            <div className="form-group">
              <label>Add Items</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {menuItems.map(item => (
                  <div key={item._id} onClick={() => addOrderItem(item)} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, transition: 'all 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#e65100'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: '#e65100', fontWeight: 700 }}>₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
            {newOrder.items.length > 0 && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>Selected Items</strong>
                {newOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between" style={{ fontSize: 13, marginTop: 6 }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total</span>
                  <span style={{ color: '#e65100' }}>₹{newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitOrder}>Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
