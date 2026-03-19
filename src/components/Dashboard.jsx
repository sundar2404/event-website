import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Search,
    Bell,
    ChevronRight,
    MapPin,
    Clock,
    Star,
    Filter,
    Menu,
    X,
    Trophy,
    CheckCircle2,
    BookOpen,
    LogOut,
    ArrowLeft,
    ArrowRight,
    Globe,
    Settings,
    ChevronLeft
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import './Dashboard.css';
import ThemeToggle from './ThemeToggle';

// ── Sub-Components ────────────────────────────────────────────────────────────

const WebinarCard = ({ event, isActive, onSelect, onRegister, speakers = [] }) => {
    const speakerDetail = speakers.find(s => s.name === event.speaker);

    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            className={`yt-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(event)}
        >
            <div className="yt-thumb">
                <img
                    src={event.banner_image ? `http://localhost:5000${event.banner_image}` : (event.image_url ? `http://localhost:5000${event.image_url}` : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600')}
                    alt={event.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95) 40%, #000 100%)',
                    display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: 'white', letterSpacing: '-0.8px', lineHeight: '1.1' }}>{event.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--g-accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        <Clock size={14} /> {event.event_time || '10:00 AM'}
                    </div>
                </div>
                {event.is_featured && <div className="yt-live-tag">LIVE MISSION</div>}
            </div>

            <div className="yt-info" style={{ marginTop: '12px', padding: '0 8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="yt-avatar" style={{
                    border: '2px solid rgba(0, 255, 136, 0.2)',
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)'
                }}>
                    {speakerDetail?.image_url ? (
                        <img src={`http://localhost:5000${speakerDetail.image_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <span style={{ color: 'var(--g-accent)', fontWeight: '900' }}>{event.speaker ? event.speaker[0] : 'S'}</span>}
                </div>
                <div className="yt-text">
                    <span className="yt-speaker" style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>{event.speaker || 'Elite Operative'}</span>
                    {speakerDetail && (
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {speakerDetail.expertise}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '0 8px 15px 56px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: '1.6',
                    margin: '12px 0 20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontWeight: '400'
                }}>
                    {event.description}
                </p>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                            <Calendar size={14} style={{ color: 'var(--g-accent)' }} /> <span>{event.event_date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                            <MapPin size={14} style={{ color: 'var(--g-accent)' }} /> <span>{event.location || 'Cyber-Space'}</span>
                        </div>
                    </div>

                    <button className="poster-action-btn" onClick={(e) => { e.stopPropagation(); onRegister(event); }} style={{ width: '100%', letterSpacing: '2px' }}>
                        INITIALIZE REGISTRATION
                    </button>
                </div>
            </div>
        </motion.div >
    );
};


const SideDetailsPanel = ({ event, onBack, onRegister }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="side-preview-panel glass-morph"
    >
        <div className="preview-header">
            <button className="preview-back-btn" onClick={onBack}><X size={18} /> TERMINATE PREVIEW</button>
        </div>
        <div className="preview-scroll">
            <div className="preview-visual">
                <img src={event.banner_image ? `http://localhost:5000${event.banner_image}` : (event.image_url ? `http://localhost:5000${event.image_url}` : 'https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=1200')} alt="" />
            </div>
            <div className="preview-content">
                <h2>{event.name}</h2>
                <div className="preview-meta-list">
                    <div className="p-item"><Calendar size={16} /> <span>{event.event_date}</span></div>
                    <div className="p-item"><Clock size={16} /> <span>{event.event_time || '10:00 AM'}</span></div>
                    <div className="p-item"><MapPin size={16} /> <span>{event.location}</span></div>
                </div>
                <div className="p-divider" />
                <div className="p-section">
                    <label>MISSION BRIEFING</label>
                    <p>{event.description}</p>
                </div>
                <button className="p-primary-btn" onClick={() => onRegister(event)}>
                    SECURE CLEARANCE <ArrowRight size={18} />
                </button>
            </div>
        </div>
    </motion.div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────────

const Dashboard = ({ onLogout }) => {
    const { content, slides } = useCMS();
    const navigate = useNavigate();
    const location = useLocation();

    const userName = location.state?.userName || 'Operator';
    const userEmail = location.state?.userEmail || '';

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'events');
    const [search, setSearch] = useState('');
    const [viewingEvent, setViewingEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentSlide, setCurrentSlide] = useState(0);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data.data || []);
        } catch {
            console.error('Failed to fetch events');
        }
    }, []);

    const fetchMyRegistrations = useCallback(async () => {
        if (!userEmail) return;
        try {
            const res = await api.get(`/registrations/my/${userEmail}`);
            setUserRegistrations(res.data.data || []);
        } catch {
            console.error('Failed to fetch my registrations');
        }
    }, [userEmail]);

    const fetchSpeakers = useCallback(async () => {
        try {
            const res = await api.get('/speakers');
            setSpeakers(res.data.data || []);
        } catch {
            console.error('Failed to fetch speakers');
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        fetchMyRegistrations();
        fetchSpeakers();
    }, [fetchEvents, fetchMyRegistrations, fetchSpeakers]);

    const activeGallery = slides?.length > 0 ? slides : events.slice(0, 3);

    useEffect(() => {
        if (activeGallery.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % activeGallery.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [activeGallery]);

    const handleRegister = useCallback((event) => {
        navigate(`/register/${event.id}`, { state: { userName, userEmail } });
    }, [navigate, userName, userEmail]);

    const filteredEvents = events.filter(e => {
        const matchesSearch = (e.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'All' || e.tag === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(events.map(e => e.tag).filter(Boolean))];

    const menuItems = [
        { id: 'events', label: 'Home', icon: LayoutDashboard },
        { id: 'speakers', label: 'Speakers', icon: Users },
        { id: 'registrations', label: 'My Tickets', icon: Trophy },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="glass-root">
            <div className="glass-bg">
                <div className="glass-glow spot-a" />
                <div className="glass-glow spot-b" />
                <div className="glass-grid" />
            </div>

            <header className="glass-header glass-morph">
                <div className="h-left">
                    <div className="h-logo">
                        {content.website_logo ? (
                            <img src={`http://localhost:5000${content.website_logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : <span style={{ fontWeight: '900' }}>{content.website_name ? content.website_name[0] : 'G'}</span>}
                    </div>
                    <span>{content.website_name || 'GENSAAS'} HQ</span>
                </div>

                <nav className="h-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`h-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="h-right">
                    <div className="h-search glass-morph">
                        <Search size={16} />
                        <input
                            placeholder="Search missions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <ThemeToggle />
                    <div className="h-user">
                        <div className="h-user-info">
                            <span className="h-user-name">{userName}</span>
                            <span className="h-user-tag">SECURE ADVISOR</span>
                        </div>
                        <div className="h-avatar">{userName[0]}</div>
                    </div>
                    <button className="h-logout-btn" onClick={onLogout} title="Sign Out">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="glass-main">
                <AnimatePresence>
                    {viewingEvent && (
                        <SideDetailsPanel
                            event={viewingEvent}
                            onBack={() => setViewingEvent(null)}
                            onRegister={handleRegister}
                        />
                    )}
                </AnimatePresence>

                <main className="glass-content-v2 scroll-area">
                    {activeTab === 'events' && (
                        <>
                            <div className="poster-slideshow-v3 glass-morph">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 1 }}
                                        className="poster-slide"
                                    >
                                        <div className="slide-media">
                                            <img
                                                src={activeGallery.length > 0 ?
                                                    (activeGallery[currentSlide].image_url ?
                                                        (activeGallery[currentSlide].image_url.startsWith('http') ? activeGallery[currentSlide].image_url : `http://localhost:5000${activeGallery[currentSlide].image_url}`) :
                                                        (activeGallery[currentSlide].banner_image ? `http://localhost:5000${activeGallery[currentSlide].banner_image}` : `https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=1200`)) :
                                                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000'
                                                }
                                                alt=""
                                            />
                                            <div className="slide-vignette" />
                                        </div>
                                        <div className="poster-overlay">
                                            <div className="poster-info">
                                                <span className="poster-badge">
                                                    <span className="pulse-dot" />
                                                    MISSION STATUS: ACTIVE
                                                </span>
                                                <h1 className="hero-title-text">
                                                    {activeGallery.length > 0 ? (activeGallery[currentSlide].name || activeGallery[currentSlide].title) : "Access Denied"}
                                                </h1>
                                                <p className="hero-desc">
                                                    {activeGallery.length > 0 ? (activeGallery[currentSlide].description || activeGallery[currentSlide].subtitle) : "Decrypting next wave of exclusive global tech missions."}
                                                </p>
                                                <div className="hero-actions" style={{ display: 'flex', gap: '16px' }}>
                                                    {activeGallery.length > 0 && (
                                                        <>
                                                            <button className="poster-action-btn" onClick={() => setViewingEvent(activeGallery[currentSlide])}>
                                                                ACCESS DATA <ArrowRight size={18} />
                                                            </button>
                                                            <button className="poster-secondary-btn" onClick={() => handleRegister(activeGallery[currentSlide])}>
                                                                INITIALIZE
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {activeGallery.length > 0 && (
                                    <div className="poster-controls">
                                        <div style={{ display: 'flex', gap: '40px' }}>
                                            {activeGallery.map((_, i) => (
                                                <button key={i} className={`p-dot-v2 ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}>
                                                    <span className="dot-labeled">MISSION {i + 1}</span>
                                                    <div className="dot-progress-rect" />
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="poster-secondary-btn" style={{ padding: '10px' }} onClick={() => setCurrentSlide((currentSlide - 1 + activeGallery.length) % activeGallery.length)}><ChevronLeft size={20} /></button>
                                            <button className="poster-secondary-btn" style={{ padding: '10px' }} onClick={() => setCurrentSlide((currentSlide + 1) % activeGallery.length)}><ChevronRight size={20} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="section-header" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '900' }}>
                                    <div style={{ width: '8px', height: '24px', background: 'var(--g-accent)', borderRadius: '4px' }} />
                                    EXPLORE LIVE MISSIONS
                                </h3>
                                <div className="category-pills" style={{ display: 'flex', gap: '8px' }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`pill-btn ${filterCategory === cat ? 'active' : ''}`}
                                            onClick={() => setFilterCategory(cat)}
                                            style={{
                                                padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--g-border)',
                                                background: filterCategory === cat ? 'var(--g-accent)' : 'rgba(255,255,255,0.03)',
                                                color: filterCategory === cat ? '#000' : '#fff', fontWeight: '800', cursor: 'pointer'
                                            }}
                                        >{cat}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="events-grid-v2" style={{ marginTop: '20px' }}>
                                {filteredEvents.map(ev => (
                                    <WebinarCard
                                        key={ev.id}
                                        event={ev}
                                        speakers={speakers}
                                        isActive={viewingEvent?.id === ev.id}
                                        onSelect={setViewingEvent}
                                        onRegister={handleRegister}
                                    />
                                ))}
                            </div>
                        </>
                    )}


                    {activeTab === 'speakers' && (
                        <div className="events-grid-v2">
                            {speakers.map(s => (
                                <div key={s.id} className="yt-card active">
                                    <div className="yt-thumb">
                                        <img src={s.image_url ? `http://localhost:5000${s.image_url}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'} alt="" />
                                        <div className="yt-live-tag">MISSION ELITE</div>
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{s.name}</h3>
                                        <span style={{ color: 'var(--g-accent)', fontWeight: '800', fontSize: '0.9rem', display: 'block', margin: '8px 0' }}>{s.expertise}</span>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: '1.6' }}>{s.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="events-grid-v2">
                            {userRegistrations.map(reg => (
                                <div key={reg.id} className="yt-card active">
                                    <div className="yt-thumb" style={{ height: '300px' }}>
                                        <img src={reg.banner_image ? `http://localhost:5000${reg.banner_image}` : 'https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800'} alt="" />
                                        <div className="yt-live-tag" style={{ background: 'var(--g-accent)', color: '#000' }}>DECRYPTED</div>
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>{reg.event_name}</h3>
                                        <div style={{ display: 'flex', gap: '15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '10px' }}>
                                            <span><Calendar size={14} /> {reg.event_date}</span>
                                            <span><Clock size={14} /> {reg.event_time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
