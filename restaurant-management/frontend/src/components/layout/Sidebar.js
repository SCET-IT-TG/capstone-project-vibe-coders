import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/menu', icon: '☰', label: 'Menu' },
  { to: '/orders', icon: '◎', label: 'Orders' },
  { to: '/reservations', icon: '◈', label: 'Reservations' },
  { to: '/billing', icon: '◉', label: 'Billing' },
  { to: '/customers', icon: '◑', label: 'Customers' },
  { to: '/staff', icon: '◐', label: 'Staff' },
];

const staffNav = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/orders', icon: '◎', label: 'Orders' },
  { to: '/reservations', icon: '◈', label: 'Reservations' },
  { to: '/billing', icon: '◉', label: 'Billing' },
  { to: '/customers', icon: '◑', label: 'Customers' },
];

const customerNav = [
  { to: '/customer-menu', icon: '☰', label: 'Menu' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'staff' ? staffNav : customerNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
         <span> 🍛 Swaad</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name truncate">{user?.name}</div>
          <div className="sidebar-user-role">{user?.role}</div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'16px' }}>⏻</button>
      </div>
    </aside>
  );
}
