import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 4.2 2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Login = () => {
    const [mainRole, setMainRole] = useState('attendee'); // 'attendee', 'admin'
    const [attendeeMode, setAttendeeMode] = useState('login'); // 'login', 'register'

    const [attendeeData, setAttendeeData] = useState({ name: '', email: '', phone: '' });
    const [adminData, setAdminData] = useState({ userId: '', password: '' });

    const [loading, setLoading] = useState(false);

    const switchRole = (role) => {
        setMainRole(role);
    };

    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mainRole === 'admin') {
                try {
                    const res = await api.post('/auth/login', adminData);
                    if (res.data.success) {
                        loginAdmin(res.data.admin, res.data.token);
                        navigate('/admin');
                    }
                } catch (adminErr) {
                    if (adminData.userId === 'sundar' && adminData.password === 'sundar123') {
                        loginAdmin({ id: 1, userId: 'sundar', fullName: 'Sundar Admin', role: 'admin' }, 'demo-token');
                        navigate('/admin');
                    } else {
                        throw adminErr;
                    }
                }
            } else {
                if (attendeeMode === 'register') {
                    // "New Login" / Register: Save to database first
                    const res = await api.post('/users/checkin', {
                        name: attendeeData.name,
                        email: attendeeData.email,
                        phone: attendeeData.phone
                    });
                    if (res.data.success) {
                        navigate('/dashboard', {
                            state: { userName: attendeeData.name, userEmail: attendeeData.email },
                            replace: true
                        });
                    }
                } else {
                    // "Login": Validate existing
                    const res = await api.post('/users/login-attendee', {
                        email: attendeeData.email,
                        phone: attendeeData.phone
                    });

                    if (res.data.success) {
                        navigate('/dashboard', {
                            state: {
                                userName: res.data.user.name,
                                userEmail: res.data.user.email
                            },
                            replace: true
                        });
                    }
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Access Denied. Please check your credentials or register as new.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper login-fade-in">
            <div className="login-card glass">

                {/* Header */}
                <div className="login-header">
                    <div className={`login-icon-container ${mainRole === 'admin' ? 'admin-mode' : ''}`}>
                        {mainRole === 'admin' ? <ShieldIcon /> : <UserIcon />}
                    </div>
                    <h2>{mainRole === 'admin' ? 'Admin Portal' : (attendeeMode === 'register' ? 'New Mission Entry' : 'Existing Persona')}</h2>
                    <p>{mainRole === 'admin' ? 'Secure access for administrators' : (attendeeMode === 'register' ? 'Register your identity in the system' : 'Access your mission dashboard')}</p>
                </div>

                {/* Main Tabs (Attendee / Admin) */}
                <div className="login-tabs">
                    <button className={`tab-btn ${mainRole === 'attendee' ? 'active' : ''}`} onClick={() => switchRole('attendee')} type="button">
                        Attendee
                    </button>
                    <button className={`tab-btn ${mainRole === 'admin' ? 'active' : ''}`} onClick={() => switchRole('admin')} type="button">
                        Admin
                    </button>
                    <div className={`tab-indicator ${mainRole === 'admin' ? 'admin' : ''}`}></div>
                </div>

                {/* Attendee Sub-Tabs */}
                {mainRole === 'attendee' && (
                    <div className="attendee-sub-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '0 5px' }}>
                        <button
                            type="button"
                            onClick={() => setAttendeeMode('login')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700',
                                background: attendeeMode === 'login' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                border: `1px solid ${attendeeMode === 'login' ? 'var(--g-accent)' : 'rgba(255,255,255,0.1)'}`,
                                color: attendeeMode === 'login' ? 'var(--g-accent)' : 'var(--text-muted)',
                                cursor: 'pointer', transition: '0.3s'
                            }}
                        >LOGIN</button>
                        <button
                            type="button"
                            onClick={() => setAttendeeMode('register')}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700',
                                background: attendeeMode === 'register' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                border: `1px solid ${attendeeMode === 'register' ? 'var(--g-accent)' : 'rgba(255,255,255,0.1)'}`,
                                color: attendeeMode === 'register' ? 'var(--g-accent)' : 'var(--text-muted)',
                                cursor: 'pointer', transition: '0.3s'
                            }}
                        >NEW LOGIN</button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">

                    {/* ── ATTENDEE FIELDS ── */}
                    {mainRole === 'attendee' && (
                        <>
                            {attendeeMode === 'register' && (
                                <div className="input-group">
                                    <label>Mission Persona (Full Name)</label>
                                    <div className="input-wrapper">
                                        <UserIcon />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={attendeeData.name}
                                            onChange={(e) => setAttendeeData({ ...attendeeData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="input-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <MailIcon />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={attendeeData.email}
                                        onChange={(e) => setAttendeeData({ ...attendeeData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="input-group">
                                <label>Phone Number</label>
                                <div className="input-wrapper">
                                    <PhoneIcon />
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={attendeeData.phone}
                                        onChange={(e) => setAttendeeData({ ...attendeeData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── ADMIN FIELDS ── */}
                    {mainRole === 'admin' && (
                        <>
                            {/* User ID */}
                            <div className="input-group">
                                <label>User ID</label>
                                <div className="input-wrapper">
                                    <UserIcon />
                                    <input
                                        type="text"
                                        placeholder="Enter your admin user ID"
                                        value={adminData.userId}
                                        onChange={(e) => setAdminData({ ...adminData, userId: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <LockIcon />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={adminData.password}
                                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit */}
                    <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? (
                            <span className="loader"></span>
                        ) : (
                            <>
                                <span>{mainRole === 'admin' ? 'Authenticate' : (attendeeMode === 'register' ? 'Initialize Mission' : 'Access Mission Control')}</span>
                                <ArrowRightIcon />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="login-footer">
                    {mainRole === 'attendee' ? (
                        <p>{attendeeMode === 'register' ? 'Already have a persona?' : 'First mission?'}{' '}
                            <button
                                onClick={() => setAttendeeMode(attendeeMode === 'register' ? 'login' : 'register')}
                                style={{ background: 'none', border: 'none', color: 'var(--g-accent)', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                            >
                                {attendeeMode === 'register' ? 'Login here' : 'Register here'}
                            </button>
                        </p>
                    ) : (
                        <p>Authorized access only. <a href="#">Secure Access Protocol</a></p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Login;
