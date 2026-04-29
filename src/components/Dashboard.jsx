import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
const Motion = motion; // re-export to avoid unused lint
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Users, Search, ChevronRight,
    MapPin, Clock, Trophy, LogOut, ArrowRight, Globe,
    Settings, ChevronLeft, Mic2, Ticket, Zap, Star, X
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import './Dashboard.css';
import ThemeToggle from './ThemeToggle';
import LiveSession from './LiveSession';

// ── Event Card ─────────────────────────────────────────────────────────────────

const EventCard = ({ event, isActive, onSelect, onRegister, speakers = [] }) => {
    const speakerDetail = speakers.find(s => s.name === event.speaker);
    const statusColor = event.event_status === 'Live' ? '#00ff88' : event.event_status === 'Completed' ? '#888' : '#ffab00';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className={`ev-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(event)}
        >
            {/* Thumbnail */}
            <div className="ev-thumb">
                <img
                    src={event.card_thumbnail
                        ? `http://localhost:5000${event.card_thumbnail}`
                        : (event.banner_image ? `http://localhost:5000${event.banner_image}` : 'https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=800')}
                    alt={event.name}
                />
                <div className="ev-thumb-overlay" />

                {/* Status tag */}
                <div className="ev-status-tag" style={{ background: `${statusColor}22`, borderColor: `${statusColor}55`, color: statusColor }}>
                    <span className="ev-status-dot" style={{ background: statusColor }} />
                    {event.event_status || 'Upcoming'}
                </div>

                {/* Category tag */}
                {event.tag && (
                    <div className="ev-category-tag">
                        {event.tag}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="ev-body">
                <h3 className="ev-title">{event.name}</h3>
                <p className="ev-desc">{event.description}</p>

                {/* Meta info */}
                <div className="ev-meta">
                    <span className="ev-meta-item">
                        <Calendar size={13} />
                        {event.event_date}
                    </span>
                    <span className="ev-meta-item">
                        <MapPin size={13} />
                        {event.location || 'Online'}
                    </span>
                    <span className="ev-meta-item">
                        <Clock size={13} />
                        {event.event_time || 'TBA'}
                    </span>
                </div>

                {/* Speaker row */}
                {event.speaker && (
                    <div className="ev-speaker-row">
                        <div className="ev-speaker-avatar">
                            {speakerDetail?.image_url
                                ? <img src={`http://localhost:5000${speakerDetail.image_url}`} alt="" />
                                : <span>{event.speaker[0]}</span>}
                        </div>
                        <div className="ev-speaker-info">
                            <span className="ev-speaker-name">{event.speaker}</span>
                            {speakerDetail && <span className="ev-speaker-role">{speakerDetail.expertise}</span>}
                        </div>
                    </div>
                )}

                {/* CTA Button */}
                <button
                    className="ev-register-btn"
                    onClick={e => { e.stopPropagation(); onRegister(event); }}
                >
                    <Ticket size={16} />
                    Register Now
                    <ArrowRight size={15} />
                </button>
            </div>
        </motion.div>
    );
};

// ── Speaker Card ───────────────────────────────────────────────────────────────

const SpeakerCard = ({ speaker }) => (
    <motion.div
        className="sp-card"
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
    >
        <div className="sp-photo">
            <img
                src={speaker.image_url
                    ? `http://localhost:5000${speaker.image_url}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=0a0a0a&color=00ff88&bold=true`}
                alt={speaker.name}
            />
            <div className="sp-photo-gradient" />
            <div className="sp-photo-badge">
                <Mic2 size={12} />
                Expert
            </div>
        </div>
        <div className="sp-body">
            <h3 className="sp-name">{speaker.name}</h3>
            <span className="sp-role">{speaker.expertise}</span>
            <p className="sp-bio">{speaker.bio}</p>
        </div>
    </motion.div>
);

// ── Ticket Card ────────────────────────────────────────────────────────────────

const TicketCard = ({ reg, onJoin }) => (
    <motion.div
        className="tk-card"
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
    >
        <div className="tk-left">
            <div className="tk-event-type">{reg.tag || 'Special Event'}</div>
            <h3 className="tk-title">{reg.event_name}</h3>
            
            <div className="tk-details">
                <div className="tk-detail">
                    <Calendar size={14} />
                    <span>{reg.event_date}</span>
                </div>
                <div className="tk-detail">
                    <Clock size={14} />
                    <span>{reg.event_time || 'Join now'}</span>
                </div>
                <div className="tk-detail">
                    <MapPin size={14} />
                    <span>{reg.location || 'Online Session'}</span>
                </div>
            </div>

            <button className="tk-join-btn" onClick={() => onJoin(reg)}>
                <Video size={16} />
                Join Live Session
                <ArrowRight size={14} />
            </button>
        </div>

        <div className="tk-divider">
            <div className="tk-notch tk-notch-top" />
            <div className="tk-dashed-line" />
            <div className="tk-notch tk-notch-bottom" />
        </div>

        <div className="tk-right">
            <div className="tk-qr-area">
                <div className="tk-qr-code">
                    <div className="tk-qr-pixel-grid">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="tk-qr-pixel" style={{ opacity: [1, 0.2, 0.8, 1, 0.4, 1, 0.2, 0.9, 1, 0.1, 1, 0.3, 1, 0.7, 0.2, 1][i] }} />
                        ))}
                    </div>
                </div>
                <span className="tk-ticket-id">#{reg.id.toString().padStart(5, '0')}</span>
            </div>
            <div className="tk-vertical-label">ADMIT ONE</div>
        </div>
    </motion.div>
);

// Fallback for CheckCircle (not imported at top)
const CheckCircle = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>;

// ── Side Details Panel ─────────────────────────────────────────────────────────

const SideDetailsPanel = ({ event, onBack, onRegister }) => (
    <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ type: 'spring', damping: 25 }}
        className="detail-panel"
    >
        <button className="detail-close-btn" onClick={onBack}>
            <X size={18} />
        </button>

        <div className="detail-scroll">
            <div className="detail-hero">
                <img
                    src={event.banner_image
                        ? `http://localhost:5000${event.banner_image}`
                        : 'https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=1200'}
                    alt={event.name}
                />
                <div className="detail-hero-overlay" />
                <div className="detail-hero-content">
                    {event.tag && <span className="detail-tag">{event.tag}</span>}
                    <h2>{event.name}</h2>
                </div>
            </div>

            <div className="detail-body">
                <div className="detail-info-grid">
                    <div className="detail-info-item">
                        <Calendar size={16} />
                        <div>
                            <span className="detail-info-label">Date</span>
                            <span className="detail-info-value">{event.event_date}</span>
                        </div>
                    </div>
                    <div className="detail-info-item">
                        <Clock size={16} />
                        <div>
                            <span className="detail-info-label">Time</span>
                            <span className="detail-info-value">{event.event_time || 'TBA'}</span>
                        </div>
                    </div>
                    <div className="detail-info-item">
                        <MapPin size={16} />
                        <div>
                            <span className="detail-info-label">Location</span>
                            <span className="detail-info-value">{event.location || 'Online'}</span>
                        </div>
                    </div>
                    <div className="detail-info-item">
                        <Globe size={16} />
                        <div>
                            <span className="detail-info-label">Type</span>
                            <span className="detail-info-value">{event.event_type || 'Online'}</span>
                        </div>
                    </div>
                </div>

                {event.speaker && (
                    <div className="detail-speaker-row">
                        <Mic2 size={16} />
                        <span>Speaker: <strong>{event.speaker}</strong></span>
                    </div>
                )}

                {event.description && (
                    <div className="detail-section">
                        <h4>About this Event</h4>
                        <p>{event.description}</p>
                    </div>
                )}

                <button className="detail-register-btn" onClick={() => onRegister(event)}>
                    <Ticket size={18} />
                    Register for this Event
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    </motion.div>
);

// ── Hero Slider ────────────────────────────────────────────────────────────────

const HeroSlider = ({ gallery, currentSlide, setCurrentSlide, onViewEvent, onRegister }) => {
    if (!gallery || gallery.length === 0) return (
        <div className="hero-empty">
            <Zap size={40} style={{ color: 'var(--g-accent)', marginBottom: '16px' }} />
            <p>No featured events yet. Add an event and mark it as featured!</p>
        </div>
    );

    const slide = gallery[currentSlide];

    return (
        <div className="hero-slider">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    className="hero-slide"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="hero-slide-media">
                        <img
                            src={slide.image_url
                                ? (slide.image_url.startsWith('http') ? slide.image_url : `http://localhost:5000${slide.image_url}`)
                                : (slide.banner_image
                                    ? `http://localhost:5000${slide.banner_image}`
                                    : 'https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=1600')}
                            alt=""
                        />
                        <div className="hero-gradient" />
                    </div>

                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            FEATURED EVENT
                        </div>
                        <h1 className="hero-title">{slide.name || slide.title}</h1>
                        <p className="hero-subtitle">{slide.description || slide.subtitle}</p>
                        <div className="hero-actions">
                            <button className="hero-btn-primary" onClick={() => onViewEvent(slide)}>
                                <ChevronRight size={18} /> View Details
                            </button>
                            <button className="hero-btn-secondary" onClick={() => onRegister(slide)}>
                                <Ticket size={16} /> Register Free
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slide indicators */}
            <div className="hero-dots">
                {gallery.map((_, i) => (
                    <button
                        key={i}
                        className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(i)}
                    />
                ))}
            </div>

            {/* Prev / Next */}
            <button className="hero-arrow hero-arrow-left" onClick={() => setCurrentSlide((currentSlide - 1 + gallery.length) % gallery.length)}>
                <ChevronLeft size={22} />
            </button>
            <button className="hero-arrow hero-arrow-right" onClick={() => setCurrentSlide((currentSlide + 1) % gallery.length)}>
                <ChevronRight size={22} />
            </button>
        </div>
    );
};

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
    const [activeSession, setActiveSession] = useState(null);

    const fetchEvents = useCallback(async () => {
        try { const r = await api.get('/events'); setEvents(r.data.data || []); } catch (err) { console.error('Fetch events failed', err); }
    }, []);

    const fetchMyRegistrations = useCallback(async () => {
        if (!userEmail) return;
        try { const r = await api.get(`/registrations/my/${userEmail}`); setUserRegistrations(r.data.data || []); } catch (err) { console.error('Fetch registrations failed', err); }
    }, [userEmail]);

    const fetchSpeakers = useCallback(async () => {
        try { const r = await api.get('/speakers'); setSpeakers(r.data.data || []); } catch (err) { console.error('Fetch speakers failed', err); }
    }, []);

    useEffect(() => {
        fetchEvents();
        fetchMyRegistrations();
        fetchSpeakers();
    }, [fetchEvents, fetchMyRegistrations, fetchSpeakers]);

    const activeGallery = slides?.length > 0 ? slides : events.filter(e => e.is_featured).slice(0, 5);

    useEffect(() => {
        if (activeGallery.length > 1) {
            const t = setInterval(() => setCurrentSlide(p => (p + 1) % activeGallery.length), 5000);
            return () => clearInterval(t);
        }
    }, [activeGallery]);

    const handleRegister = useCallback((event) => {
        navigate(`/register/${event.id}`, { state: { userName, userEmail } });
    }, [navigate, userName, userEmail]);

    const filteredEvents = events.filter(e => {
        const matchSearch = (e.name || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory === 'All' || e.tag === filterCategory;
        return matchSearch && matchCat;
    });

    const categories = ['All', ...new Set(events.map(e => e.tag).filter(Boolean))];

    const menuItems = [
        { id: 'events', label: 'Home', icon: LayoutDashboard, iconClass: 'nav-icon-home' },
        { id: 'speakers', label: 'Speakers', icon: Mic2, iconClass: 'nav-icon-speakers' },
        { id: 'registrations', label: 'My Tickets', icon: Ticket, iconClass: 'nav-icon-tickets' },
        { id: 'settings', label: 'Settings', icon: Settings, iconClass: 'nav-icon-settings' },
    ];

    return (
        <div className="db-root">
            {/* Background */}
            <div className="db-bg">
                <div className="db-glow db-glow-a" />
                <div className="db-glow db-glow-b" />
                <div className="db-grid" />
            </div>

            {/* ── Sidebar ── */}
            <aside className="db-sidebar">
                <div className="db-brand">
                    <div className="db-brand-logo">
                        {content.website_logo
                            ? <img src={`http://localhost:5000${content.website_logo}`} alt="" />
                            : <Zap size={20} />}
                    </div>
                    <span className="db-brand-name">{content.website_name || 'GenSaas'}</span>
                </div>

                <nav className="db-nav">
                    {menuItems.map((item, idx) => (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            whileHover={{ x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            className={`db-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className={`nav-icon-wrap ${item.iconClass}`}>
                                <item.icon size={20} />
                            </span>
                            <span>{item.label}</span>
                            {activeTab === item.id && <span className="db-nav-indicator" />}
                        </motion.button>
                    ))}
                </nav>

                <motion.div 
                    className="db-sidebar-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="db-user-pill">
                        <div className="db-user-avatar">{userName[0]?.toUpperCase()}</div>
                        <div className="db-user-info">
                            <span className="db-user-name">{userName}</span>
                            <span className="db-user-tag">Attendee</span>
                        </div>
                    </div>
                    <motion.button 
                        className="db-logout-btn" 
                        onClick={onLogout} 
                        title="Logout"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </motion.button>
                </motion.div>
            </aside>

            {/* ── Main area ── */}
            <div className="db-main">
                {/* Topbar */}
                <header className="db-topbar">
                    <div>
                        <h2 className="db-page-title">
                            {activeTab === 'events' && 'Discover Events'}
                            {activeTab === 'speakers' && 'Meet Speakers'}
                            {activeTab === 'registrations' && 'My Tickets'}
                            {activeTab === 'settings' && 'Settings'}
                        </h2>
                        <p className="db-page-sub">
                            {activeTab === 'events' && `${events.length} events available`}
                            {activeTab === 'speakers' && `${speakers.length} experts onboarded`}
                            {activeTab === 'registrations' && `${userRegistrations.length} ticket${userRegistrations.length !== 1 ? 's' : ''} registered`}
                        </p>
                    </div>

                    <div className="db-topbar-right">
                        <div className="db-search-box">
                            <Search size={16} />
                            <input
                                placeholder="Search events…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <ThemeToggle />
                        <div className="db-topbar-avatar">{userName[0]?.toUpperCase()}</div>
                    </div>
                </header>

                {/* Content */}
                <main className="db-content">
                    {/* ── Events Tab ── */}
                    {activeTab === 'events' && (
                        <div>
                            {/* Hero Slider */}
                            <HeroSlider
                                gallery={activeGallery}
                                currentSlide={currentSlide}
                                setCurrentSlide={setCurrentSlide}
                                onViewEvent={setViewingEvent}
                                onRegister={handleRegister}
                            />

                            {/* Category pills */}
                            <div className="db-section-header">
                                <h3 className="db-section-title">
                                    <span className="db-section-accent" />
                                    All Events
                                </h3>
                                <div className="db-pills">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`db-pill ${filterCategory === cat ? 'active' : ''}`}
                                            onClick={() => setFilterCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredEvents.length === 0 ? (
                                <div className="db-empty-state">
                                    <Calendar size={48} />
                                    <p>No events found. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="db-events-grid">
                                    {filteredEvents.map(ev => (
                                        <EventCard
                                            key={ev.id}
                                            event={ev}
                                            speakers={speakers}
                                            isActive={viewingEvent?.id === ev.id}
                                            onSelect={setViewingEvent}
                                            onRegister={handleRegister}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Speakers Tab ── */}
                    {activeTab === 'speakers' && (
                        <div>
                            {speakers.length === 0 ? (
                                <div className="db-empty-state">
                                    <Users size={48} />
                                    <p>No speakers added yet.</p>
                                </div>
                            ) : (
                                <div className="db-speakers-grid">
                                    {speakers.map(s => <SpeakerCard key={s.id} speaker={s} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tickets Tab ── */}
                    {activeTab === 'registrations' && (
                        <div>
                            {userRegistrations.length === 0 ? (
                                <div className="db-empty-state">
                                    <Ticket size={48} />
                                    <p>You haven't registered for any events yet.</p>
                                    <button className="db-explore-btn" onClick={() => setActiveTab('events')}>
                                        Explore Events <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="db-tickets-list">
                                    {userRegistrations.map(r => (
                                        <TicketCard 
                                            key={r.id} 
                                            reg={r} 
                                            onJoin={(reg) => setActiveSession(reg)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Settings Tab ── */}
                    {activeTab === 'settings' && (
                        <div className="db-settings-card">
                            <h3>Account Info</h3>
                            <div className="db-settings-row">
                                <span>Name</span><strong>{userName}</strong>
                            </div>
                            <div className="db-settings-row">
                                <span>Email</span><strong>{userEmail || '—'}</strong>
                            </div>
                            <div className="db-settings-row">
                                <span>Role</span><strong>Attendee</strong>
                            </div>
                            <button className="db-danger-btn" onClick={onLogout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Side detail panel ── */}
            <AnimatePresence>
                {viewingEvent && (
                    <SideDetailsPanel
                        event={viewingEvent}
                        onBack={() => setViewingEvent(null)}
                        onRegister={handleRegister}
                    />
                )}
            </AnimatePresence>

            {/* ── Active Session Overlay ── */}
            <AnimatePresence>
                {activeSession && (
                    <LiveSession 
                        event={activeSession} 
                        attendeeName={userName}
                        onExit={() => setActiveSession(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
