import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EMOJIS = { starters: '🥗', mains: '🍖',breads: '🫓', desserts: '🍮', beverages: '🍷' };

export default function CustomerMenuPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('mains');
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState('menu');
  const [tableNumber, setTableNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get('/menu?available=true').then(r => { setItems(r.data); setLoading(false); });
    API.get('/orders').then(r => setOrders(r.data));
  }, []);

  const filtered = items.filter(i => i.category === category);

  const addToCart = (item) => {
    const exists = cart.find(c => c._id === item._id);
    if (exists) setCart(cart.map(c => c._id === item._id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...item, qty: 1 }]);
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c._id !== id));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!tableNumber) { alert('Please enter your table number'); return; }
    if (cart.length === 0) { alert('Your cart is empty'); return; }
    setPlacing(true);
    try {
      await API.post('/orders', {
        tableNumber,
        guestCount: 1,
        items: cart.map(i => ({ menuItemId: i._id, quantity: i.qty })),
      });
      setSuccess('Order placed successfully! 🎉');
      setCart([]);
      setTab('orders');
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch (err) { alert(err.response?.data?.message || 'Order failed'); }
    setPlacing(false);
  };

  if (loading) return <div className="loading">Loading menu...</div>;

  const categories = ['starters', 'mains','breads', 'desserts', 'beverages'];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', fontWeight: 600 }}>The Culinary Architect</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Welcome, {user?.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {cart.length > 0 && (
            <div style={{ background: '#e65100', color: 'white', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => setTab('cart')}>
              🛒 {cartCount} • ₹{cartTotal.toFixed(2)}
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#64748b' }}>Logout</button>
        </div>
      </div>

      {tab === 'menu' && (
        <div>
          <div style={{ padding: '20px 20px 0', background: 'white' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: 16 }}>Handcrafted Perfection</h2>
            <div className="category-scroll" style={{ paddingBottom: 16 }}>
              {categories.map(c => (
                <div key={c} className={`category-card${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
                  {EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Featured Selection</h3>
            <div className="menu-grid">
              {filtered.map(item => (
                <div key={item._id} className="menu-card">
                  <div className="menu-card-img">{EMOJIS[item.category]}</div>
                  <div className="menu-card-body">
                    <div className="menu-card-name">{item.name}</div>
                    <div className="menu-card-desc">{item.description}</div>
                    <div className="menu-card-footer">
                      <span className="menu-card-price">₹{item.price.toFixed(2)}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>+ Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'cart' && (
        <div style={{ padding: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, marginBottom: 20 }}>Your Cart</h2>
          {success && <div className="alert alert-success">{success}</div>}
          {cart.length === 0 ? (
            <div className="empty-state"><h3>Your cart is empty</h3><p>Browse the menu and add items</p></div>
          ) : (
            <>
              <div className="card mb-4">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Qty: {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong style={{ color: '#e65100' }}>₹{(item.price * item.qty).toFixed(2)}</strong>
                      <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item._id)}>✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ paddingTop: 14, fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span>
                  <span style={{ color: '#e65100', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem' }}>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Your Table Number</label>
                <input className="form-control" placeholder="e.g. 08" value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block" onClick={placeOrder} disabled={placing}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div style={{ padding: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, marginBottom: 20 }}>Order History</h2>
          {success && <div className="alert alert-success">{success}</div>}
          {orders.length === 0 ? (
            <div className="empty-state"><h3>No orders yet</h3><p>Place your first order from the menu</p></div>
          ) : orders.map(o => (
            <div key={o._id} className="card mb-4">
              <div className="flex items-center justify-between mb-3">
                <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem' }}>{o.orderNumber}</strong>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
              </div>
              {o.items.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: '#64748b', marginBottom: 3 }}>• {item.quantity}x {item.name}</div>
              ))}
              <div className="flex items-center justify-between" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                <strong style={{ color: '#e65100' }}>₹{o.total?.toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reservations' && (
        <div style={{ padding: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600, marginBottom: 20 }}>Reservations</h2>
          <div className="card">
            <p style={{ color: '#64748b', fontSize: 13 }}>To make a reservation, please call us or visit the front desk.</p>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        {[['menu','☰','Menu'], ['cart','🛒','Cart'], ['orders','◎','Orders'], ['reservations','◈','Reservations']].map(([id, icon, label]) => (
          <div key={id} className={`bottom-nav-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
