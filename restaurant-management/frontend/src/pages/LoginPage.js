import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin');
  const [role, setRole] = useState('admin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      let user;
      if (tab === 'signin') {
        user = await login(form.email, form.password);
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        user = await register(form.name, form.email, form.password, role);
      }
      navigate(user.role === 'customer' ? '/customer-menu' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-layout">
      <div className="login-left">
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Restaurant Management System</p>
          <h1 className="login-hero-title">
            The Digital<br />
            <span className="login-hero-accent">Maître D'</span>
          </h1>
          <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.45)', fontSize: 15, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>
            Orchestrating Excellence.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-tabs">
            <div className={`login-tab${tab === 'signin' ? ' active' : ''}`} onClick={() => setTab('signin')}>SIGN IN</div>
            <div className={`login-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>CREATE ACCOUNT</div>
          </div>

          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 600, marginBottom: 4 }}>
            {tab === 'signin' ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
            {tab === 'signin' ? 'Please enter your credentials.' : 'Create your account below.'}
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" className="form-control" placeholder="Your full name" value={form.name} onChange={handle} />
            </div>
          )}

          <div className="form-group">
            <label>Work Email</label>
            <input name="email" type="email" className="form-control" placeholder="chef@culina.com" value={form.email} onChange={handle} />
          </div>

          <div className="form-group">
            <label>Security Key</label>
            <input name="password" type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={handle} />
          </div>

          {tab === 'register' && (
            <div className="form-group">
              <label>Role</label>
              <div className="role-select">
                {['admin', 'staff', 'customer'].map(r => (
                  <div key={r} className={`role-btn${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
                    {r.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'signin' && (
            <div className="form-group">
              <label>Role</label>
              <div className="role-select">
                {['admin', 'staff', 'customer'].map(r => (
                  <div key={r} className={`role-btn${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
                    {r.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={submit} disabled={loading}>
            {loading ? 'Please wait...' : tab === 'signin' ? 'Enter Workspace →' : 'Create Account →'}
          </button>

          {tab === 'signin' && (
            <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
              <strong>Demo Credentials:</strong><br />
              Admin: admin@culina.com / admin123<br />
              Staff: julian@culina.com / staff123<br />
              Customer: julian.c@email.com / customer123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
