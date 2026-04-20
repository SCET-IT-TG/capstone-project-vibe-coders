import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function BillingPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get('/orders?status=served').then(r => { setOrders(r.data); setLoading(false); });
  }, []);

  const loadBill = async (order) => {
    setSelected(order);
    setSuccess('');
    const { data } = await API.get(`/billing/${order._id}`);
    setBill(data);
  };

  const processPayment = async () => {
    setPaying(true);
    try {
      await API.post(`/billing/${selected._id}/pay`, { paymentMethod });
      setSuccess('Payment processed successfully!');
      setBill(prev => ({ ...prev, paymentStatus: 'paid', status: 'completed' }));
      const res = await API.get('/orders?status=served');
      setOrders(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
    setPaying(false);
  };

  if (loading) return <div className="loading">Loading billing...</div>;

  return (
    <div className="page-content">
      <div className="topbar" style={{ marginLeft: -30, marginRight: -30, marginTop: -30, paddingLeft: 30, paddingRight: 30, marginBottom: 30 }}>
        <h2 className="topbar-title">Billing</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }}>
        <div>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Orders Ready for Billing</span></div>
            {orders.length === 0 ? (
              <div className="empty-state"><p>No orders ready for billing</p><p className="text-sm text-muted" style={{ marginTop: 4 }}>Orders with status "served" will appear here</p></div>
            ) : orders.map(order => (
              <div key={order._id} onClick={() => loadBill(order)}
                style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <div className="text-muted text-sm">Table {order.tableNumber} • {order.guestCount} guests</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#e65100' }}>₹{order.total?.toFixed(2)}</strong>
                  <div><span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span></div>
                </div>
              </div>
            ))}
          </div>

          {bill && (
            <div className="card">
              <div className="card-header"><span className="card-title">Itemized Bill — {bill.orderNumber}</span></div>
              {bill.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: '14px 0', borderTop: '2px solid #f1f5f9' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8, color: '#64748b', fontSize: 14 }}>
                  <span>Subtotal</span><span>₹{bill.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 8, color: '#64748b', fontSize: 14 }}>
                  <span>Tax (8.5%)</span><span>₹{bill.tax?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ fontWeight: 700, fontSize: 22, fontFamily: 'Cormorant Garamond, serif', marginTop: 10 }}>
                  <span>Total</span><span style={{ color: '#e65100' }}>₹{bill.total?.toFixed(2)}</span>
                </div>
              </div>

              {bill.customer && (
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  <strong>Customer:</strong> {bill.customer.name} ({bill.customer.email})
                </div>
              )}
            </div>
          )}
        </div>

        {bill && (
          <div className="card" style={{ borderTop: '4px solid #c0392b' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 600, marginBottom: 20 }}>Bill Summary</h3>
            <div className="flex items-center justify-between mb-2 text-muted"><span>Subtotal</span><span>₹{bill.subtotal?.toFixed(2)}</span></div>
            <div className="flex items-center justify-between mb-2 text-muted"><span>Tax (8.5%)</span><span>₹{bill.tax?.toFixed(2)}</span></div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 600, margin: '16px 0', color: '#e65100' }}>₹{bill.total?.toFixed(2)}</div>

            {success ? (
              <div className="alert alert-success">{success}</div>
            ) : (
              <>
                <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: 12 }}>Payment Method</h4>
                {[['credit_card', '💳', 'Credit Card'], ['debit_card', '🏦', 'Debit Card'], ['cash', '💵', 'Cash']].map(([val, icon, label]) => (
                  <div key={val} className={`payment-method${paymentMethod === val ? ' active' : ''}`} onClick={() => setPaymentMethod(val)}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
                {bill.paymentStatus !== 'paid' && (
                  <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={processPayment} disabled={paying}>
                    {paying ? 'Processing...' : 'Process Payment'}
                  </button>
                )}
              </>
            )}

            {bill.paymentStatus === 'paid' && !success && (
              <div className="alert alert-success">Payment already processed</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
