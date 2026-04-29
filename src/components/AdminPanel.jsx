import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useCMS } from '../context/CMSContext';
import {
    ArrowLeft, ArrowRight, Users, Calendar, TrendingUp,
    CheckCircle, Clock, Trophy, Activity, BarChart3, PieChart as PieChartIcon,
    Image as ImageIcon
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import './AdminPanel.css';
import ThemeToggle from './ThemeToggle';
import ImageUploadField from './ImageUploadField';
import IMAGE_SPECS from './imageSpecs';

// Map of tab label → URL slug (and reverse)
const TABS = [
    { label: 'Overview', slug: 'overview' },
    { label: 'Events', slug: 'events' },
    { label: 'Users', slug: 'users' },
    { label: 'Registrations', slug: 'registrations' },
    { label: 'Slideshow CMS', slug: 'slideshow-cms' },
    { label: 'Header CMS', slug: 'header-cms' },
    { label: 'General CMS', slug: 'general-cms' },
    { label: 'Homepage CMS', slug: 'homepage-cms' },
    { label: 'Registration CMS', slug: 'registration-cms' },
    { label: 'Speaker CMS', slug: 'speaker-cms' },
    { label: 'Poster CMS', slug: 'poster-cms' },
    { label: 'Email CMS', slug: 'email-cms' },
    { label: 'Image Specs', slug: 'image-specs' },
    { label: 'Security', slug: 'security' },
    { label: 'Analytics', slug: 'analytics' },
];
const slugToLabel = (slug) => TABS.find(t => t.slug === slug)?.label || 'Overview';
const labelToSlug = (label) => TABS.find(t => t.label === label)?.slug || 'overview';

const AdminPanel = ({ onLogout }) => {
    const { refreshCMS } = useCMS();
    const navigate = useNavigate();
    const { tab: urlTab } = useParams();
    const activeTab = slugToLabel(urlTab || 'overview');

    const switchTab = (label) => {
        navigate(`/admin/${labelToSlug(label)}`, { replace: false });
    };
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [cmsData, setCmsData] = useState({});
    const [template, setTemplate] = useState({});
    const [analytics, setAnalytics] = useState({
        totalRegistrations: 0,
        totalUsers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        dailyTrends: [],
        eventDistribution: [],
        recentActivity: []
    });
    const [allUsers, setAllUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userEventFilter, setUserEventFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });
    const [activityFilter, setActivityFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [activeEventForFields, setActiveEventForFields] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', userId: '', email: '', fullName: '', subAdminPassword: '' });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({
        name: '', description: '', event_date: '', event_time: '', speaker: '', 
        event_type: 'Online', location: 'Virtual', 
        banner_image: null, card_thumbnail: null, success_poster: null, poster_logo: null,
        is_featured: false, is_visible: true
    });

    const [speakers, setSpeakers] = useState([]);
    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [newSpeaker, setNewSpeaker] = useState({ name: '', expertise: '', bio: '', image: null, is_visible: true });

    // Slideshow management state (reserved for custom slide modal)
    const [_slideshowItems, _setSlideshowItems] = useState([]);
    const [_showSlideModal, setShowSlideModal] = useState(false);
    const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: null, link_event_id: '', sort_order: 0, is_active: true });
    // Suppress unused warnings — these are used in the Slideshow CMS tab's Add Slide button
    void setShowSlideModal; void newSlide; void setNewSlide;

    // The config object is no longer needed for API calls if the `api` utility handles tokens internally.
    // Keeping it here for now in case it's used elsewhere, but it's removed from api calls below.


    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // Always fetch events to ensure filters and state are synced across tabs
            const resEvents = await api.get('/events?admin=true');
            setEvents(resEvents.data.data || []);

            if (activeTab === 'Overview' || activeTab === 'Registrations') {
                const res = await api.get('/registrations');
                setRegistrations(res.data.data || []);
            }
            if (activeTab === 'Overview' || activeTab === 'Analytics') {
                const res = await api.get('/analytics/overview');
                setAnalytics(res.data.data || {});
            }
            if (activeTab === 'Users') {
                const res = await api.get('/users');
                setAllUsers(res.data.data || []);
            }
            if (activeTab.includes('CMS') || activeTab === 'Overview') {
                const res = await api.get('/cms');
                setCmsData(res.data.data || {});
            }
            if (activeTab === 'Poster CMS') {
                const res = await api.get('/templates/default');
                setTemplate(res.data.data || {});
            }
            if (activeTab === 'Speaker CMS' || activeTab === 'Overview') {
                const res = await api.get('/speakers?admin=true');
                setSpeakers(res.data.data || []);
            }
        } catch (err) {
            console.error('Fetch error in AdminPanel:', err);
            if (err.response?.status === 401) {
                console.warn('Unauthorized access to admin data. Token may be expired.');
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab]); // token is in dependency array for config, but config is not used in api calls.

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newEvent).forEach(key => {
            if (!['banner_image', 'card_thumbnail', 'success_poster', 'poster_logo'].includes(key)) {
                formData.append(key, newEvent[key]);
            }
        });
        
        // Append all 4 images if they exist
        if (newEvent.banner_image) formData.append('banner_image', newEvent.banner_image);
        if (newEvent.card_thumbnail) formData.append('card_thumbnail', newEvent.card_thumbnail);
        if (newEvent.success_poster) formData.append('success_poster', newEvent.success_poster);
        if (newEvent.poster_logo) formData.append('poster_logo', newEvent.poster_logo);

        try {
            if (isEditingEvent) {
                await api.put(`/events/${editingEventId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Event Updated Successfully!');
            } else {
                await api.post('/events', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Event Launched Successfully!');
            }
            setShowCreateModal(false);
            setIsEditingEvent(false);
            setEditingEventId(null);
            setNewEvent({ 
                name: '', description: '', event_date: '', event_time: '', speaker: '', 
                event_type: 'Online', location: 'Virtual', 
                banner_image: null, card_thumbnail: null, success_poster: null, poster_logo: null,
                is_featured: false, is_visible: true 
            });
            fetchData();
            refreshCMS(); // Sync with dashboard slides
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to launch event';
            alert('Error: ' + msg);
        }
    };

    const handleCreateSpeaker = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newSpeaker.name);
        formData.append('expertise', newSpeaker.expertise);
        formData.append('bio', newSpeaker.bio);
        formData.append('is_visible', newSpeaker.is_visible);
        if (newSpeaker.image) formData.append('image', newSpeaker.image);

        try {
            await api.post('/speakers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowSpeakerModal(false);
            setNewSpeaker({ name: '', expertise: '', bio: '', image: null, is_visible: true });
            fetchData();
            alert('Speaker Profile Created!');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed to add speaker'));
        }
    };

    const deleteSpeaker = async (id) => {
        if (!window.confirm('Delete this speaker?')) return;
        try {
            await api.delete(`/speakers/${id}`);
            fetchData();
        } catch {
            alert('Delete failed');
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const handleUpdateCMS = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(cmsData).forEach(key => {
            formData.append(key, cmsData[key]);
        });

        try {
            await api.post('/cms/batch-update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Content Managed System updated successfully!');
            refreshCMS();
        } catch (err) {
            console.error('Update CMS Failed:', err);
            alert('Failed to update CMS');
        }
    };

    const [templateFiles, setTemplateFiles] = useState({ template_image: null, logo_image: null });

    const handleUpdateTemplate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(template).forEach(key => {
            formData.append(key, template[key]);
        });
        if (templateFiles.template_image) formData.append('template_image', templateFiles.template_image);
        if (templateFiles.logo_image) formData.append('logo_image', templateFiles.logo_image);

        try {
            await api.post('/templates/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Poster settings saved with new visuals!');
            fetchData();
        } catch (err) {
            console.error('Update Template Failed:', err);
            alert('Failed to save template visuals');
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchData();
        } catch {
            alert('Delete failed');
        }
    };


    const handleOpenEditModal = (ev) => {
        setNewEvent({
            name: ev.name,
            description: ev.description,
            event_date: ev.event_date,
            event_time: ev.event_time,
            speaker: ev.speaker,
            event_type: ev.event_type || 'Online',
            location: ev.location,
            banner_image: null,
            card_thumbnail: null,
            success_poster: null,
            poster_logo: null,
            is_featured: !!ev.is_featured,
            is_visible: !!ev.is_visible
        });
        setEditingEventId(ev.id);
        setIsEditingEvent(true);
        setShowCreateModal(true);
    };

    const toggleSpeakerVisibility = async (id, currentVisibility) => {
        try {
            await api.patch(`/speakers/${id}/visibility`,
                { is_visible: !currentVisibility }
            );
            fetchData();
        } catch (err) {
            console.error('Toggle Speaker Visibility Error:', err);
            alert('Failed to update speaker status');
        }
    };

    const exportCSV = () => {
        const headers = ['Name', 'Email', 'Event', 'Date'];
        const rows = registrations.map(r => [r.user_name, r.user_email, r.event_name, new Date(r.registered_at).toLocaleDateString()]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "registrations.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="admin-root">
            <header className="admin-header">
                <div className="admin-brand">
                    <div className="admin-logo">G</div>
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Powering GenSaas Events</p>
                    </div>
                </div>

                <div className="nav-history-controls" style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                    <button
                        className="nav-history-btn"
                        onClick={() => window.history.back()}
                        title="Go Back"
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)', borderRadius: '8px', padding: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    ><ArrowLeft size={18} /></button>
                    <button
                        className="nav-history-btn"
                        onClick={() => window.history.forward()}
                        title="Go Forward"
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)', borderRadius: '8px', padding: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    ><ArrowRight size={18} /></button>
                </div>
                <div className="admin-actions">
                    <ThemeToggle />
                    <button className="back-site-btn" onClick={() => window.location.href = '/'}>← Back to Website</button>
                    <button className="view-btn" onClick={() => { navigate('/dashboard', { replace: true }); }}>View Dashboard</button>
                    <button className="admin-logout" onClick={onLogout}>Logout</button>
                </div>
            </header>

            <div className="admin-tabs scroll-x">
                {TABS.map(({ label }) => (
                    <button
                        key={label}
                        className={`admin-tab ${activeTab === label ? 'active' : ''}`}
                        onClick={() => switchTab(label)}
                    >{label}</button>
                ))}
            </div>

            <div className="admin-main">
                {loading && <div className="admin-loading">Updating...</div>}

                {activeTab === 'Overview' && (
                    <div className="admin-overview">
                        {/* KPI Cards */}
                        <div className="stats-grid" style={{ marginBottom: '30px' }}>
                            <div className="stat-card glass-morph">
                                <div className="stat-header">
                                    <div className="stat-icon-box" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-green)' }}>
                                        <Users size={20} />
                                    </div>
                                    <div className="stat-trend">+12%</div>
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalUsers}</h3>
                                    <p className="stat-label">Total Users</p>
                                    <span className="stat-subtext">Active account holders</span>
                                </div>
                            </div>

                            <div className="stat-card glass-morph">
                                <div className="stat-header">
                                    <div className="stat-icon-box" style={{ background: 'rgba(74, 114, 255, 0.1)', color: '#4a72ff' }}>
                                        <Calendar size={20} />
                                    </div>
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalEvents}</h3>
                                    <p className="stat-label">Total Missions</p>
                                    <span className="stat-subtext">Launched across system</span>
                                </div>
                            </div>

                            <div className="stat-card glass-morph">
                                <div className="stat-header">
                                    <div className="stat-icon-box" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00' }}>
                                        <TrendingUp size={20} />
                                    </div>
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.upcomingEvents}</h3>
                                    <p className="stat-label">Upcoming Missions</p>
                                    <span className="stat-subtext">Live & Staged events</span>
                                </div>
                            </div>

                            <div className="stat-card glass-morph">
                                <div className="stat-header">
                                    <div className="stat-icon-box" style={{ background: 'rgba(0, 184, 217, 0.1)', color: '#00b8d9' }}>
                                        <CheckCircle size={20} />
                                    </div>
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.completedEvents}</h3>
                                    <p className="stat-label">Finished Missions</p>
                                    <span className="stat-subtext">Safely archived events</span>
                                </div>
                            </div>

                            <div className="stat-card glass-morph">
                                <div className="stat-header">
                                    <div className="stat-icon-box" style={{ background: 'rgba(255, 72, 66, 0.1)', color: '#ff4842' }}>
                                        <Trophy size={20} />
                                    </div>
                                    <div className="stat-trend">+5%</div>
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalRegistrations}</h3>
                                    <p className="stat-label">Total Conversions</p>
                                    <span className="stat-subtext">Successful bookings</span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="analytics-grid">
                            {/* Left Side: Event performance */}
                            <div className="analytics-card glass-morph">
                                <div className="chart-header">
                                    <div className="chart-title">
                                        <BarChart3 size={18} />
                                        <h4>Mission Performance</h4>
                                    </div>
                                    <div className="chart-actions">
                                        <select className="chart-select">
                                            <option>Last 30 Days</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={analytics.eventDistribution} barSize={34} barGap={12}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                            />
                                            <Bar dataKey="registrations" radius={[6, 6, 0, 0]} filter="url(#glow)">
                                                {analytics.eventDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={['#00ff88', '#00d2ff', '#ff007a', '#7a00ff', '#ffab00', '#ff4842', '#00b8d9', '#ffffff'][index % 8]}
                                                    />
                                                ))}
                                            </Bar>
                                            <defs>
                                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                                    <feMerge>
                                                        <feMergeNode in="blur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Right Side: Distribution & Activity */}
                            <div className="analytics-card glass-morph">
                                <div className="chart-header">
                                    <div className="chart-title">
                                        <Activity size={18} />
                                        <h4>Recent Mission Activity</h4>
                                    </div>
                                    <div className="chart-actions">
                                        <select
                                            className="chart-select"
                                            value={activityFilter}
                                            onChange={(e) => setActivityFilter(e.target.value)}
                                        >
                                            <option value="All">All Events</option>
                                            {events.map(ev => (
                                                <option key={ev.id} value={ev.name}>{ev.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="activity-feed-container">
                                    {analytics.recentActivity.filter(act => activityFilter === 'All' || act.event_name === activityFilter).length === 0 ? (
                                        <div className="empty-activity">No recent activity detected for this selection.</div>
                                    ) : (
                                        <div className="activity-scroll">
                                            {analytics.recentActivity
                                                .filter(act => activityFilter === 'All' || act.event_name === activityFilter)
                                                .map(act => (
                                                    <div key={act.id} className="activity-item-v2">
                                                        <div className="act-user-icon">
                                                            {act.user_name?.[0].toUpperCase()}
                                                        </div>
                                                        <div className="act-content">
                                                            <div className="act-text">
                                                                <span className="act-name">{act.user_name}</span>
                                                                <span className="act-desc">joined mission</span>
                                                                <span className="act-event">{act.event_name}</span>
                                                            </div>
                                                            <div className="act-time">
                                                                <Clock size={12} /> {new Date(act.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Events' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h3>All Events</h3>
                            <button className="add-btn" onClick={() => {
                                setIsEditingEvent(false);
                                setEditingEventId(null);
                                setNewEvent({ 
                                    name: '', description: '', event_date: '', event_time: '', 
                                    speaker: '', tag: 'Webinar', tag_color: '#00ff88', location: 'Virtual', 
                                    banner_image: null, card_thumbnail: null, success_poster: null, poster_logo: null,
                                    is_featured: false, is_visible: true 
                                });
                                setShowCreateModal(true);
                            }}>+ Launch New Event</button>
                        </div>

                        {showCreateModal && (
                            <div className="admin-modal-overlay">
                                <div className="admin-modal">
                                    <div className="modal-header">
                                        <h2>{isEditingEvent ? 'Modify Event Mission' : 'Launch New Event'}</h2>
                                        <button className="close-btn" onClick={() => {
                                            setShowCreateModal(false);
                                            setIsEditingEvent(false);
                                            setEditingEventId(null);
                                        }}>×</button>
                                    </div>
                                    <form onSubmit={handleCreateEvent} className="cms-form modal-scroll">
                                        <div className="form-group">
                                            <label>Event Name</label>
                                            <input required value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g. AI Innovation Summit" />
                                        </div>
                                        <div className="form-group">
                                            <label>Select Mission Speaker</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select
                                                    style={{ flex: 1, background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px' }}
                                                    onChange={e => setNewEvent({ ...newEvent, speaker: e.target.value })}
                                                    value={speakers.some(s => s.name === newEvent.speaker) ? newEvent.speaker : ''}
                                                >
                                                    <option value="">Select from Speakers...</option>
                                                    {speakers.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name} ({s.expertise})</option>
                                                    ))}
                                                    <option value="custom">-- Custom / Other --</option>
                                                </select>
                                                <input
                                                    placeholder="Or type manual name"
                                                    value={newEvent.speaker}
                                                    onChange={e => setNewEvent({ ...newEvent, speaker: e.target.value })}
                                                    style={{ flex: 1 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid-2">
                                            <div className="form-group">
                                                <label>Event Date</label>
                                                <input required value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} placeholder="e.g. Oct 24, 2026" />
                                            </div>
                                            <div className="form-group">
                                                <label>Event Time</label>
                                                <input value={newEvent.event_time} onChange={e => setNewEvent({ ...newEvent, event_time: e.target.value })} placeholder="e.g. 11:00 AM" />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Event Type</label>
                                            <select
                                                value={newEvent.event_type}
                                                onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}
                                                style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%' }}
                                            >
                                                <option value="Online">🌐 Online</option>
                                                <option value="Offline">📍 Offline</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Location</label>
                                            <input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Virtual / Physical Address" />
                                        </div>
                                        <div className="form-section-title">Visual Assets</div>
                                        <div className="grid-2">
                                            <ImageUploadField
                                                specKey="event_banner"
                                                existingImageUrl={isEditingEvent ? (events.find(ev => ev.id === editingEventId)?.banner_image) : null}
                                                onChange={(file) => setNewEvent({ ...newEvent, banner_image: file })}
                                            />
                                            <ImageUploadField
                                                specKey="event_card_thumbnail"
                                                existingImageUrl={isEditingEvent ? (events.find(ev => ev.id === editingEventId)?.card_thumbnail) : null}
                                                onChange={(file) => setNewEvent({ ...newEvent, card_thumbnail: file })}
                                            />
                                        </div>

                                        <div className="form-section-title">Registration Deliverables</div>
                                        <div className="grid-2">
                                            <ImageUploadField
                                                specKey="poster_template"
                                                existingImageUrl={isEditingEvent ? (events.find(ev => ev.id === editingEventId)?.success_poster) : null}
                                                onChange={(file) => setNewEvent({ ...newEvent, success_poster: file })}
                                            />
                                            <ImageUploadField
                                                specKey="poster_logo"
                                                existingImageUrl={isEditingEvent ? (events.find(ev => ev.id === editingEventId)?.poster_logo) : null}
                                                onChange={(file) => setNewEvent({ ...newEvent, poster_logo: file })}
                                            />
                                        </div>
                                        <div className="grid-2">
                                            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                                <input type="checkbox" checked={newEvent.is_featured} onChange={e => setNewEvent({ ...newEvent, is_featured: e.target.checked })} />
                                                <label style={{ cursor: 'pointer' }}>Feature on Home Slider</label>
                                            </div>
                                            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                                <input type="checkbox" checked={newEvent.is_visible} onChange={e => setNewEvent({ ...newEvent, is_visible: e.target.checked })} />
                                                <label style={{ cursor: 'pointer' }}>Immediate Public Visibility</label>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea rows="4" required value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Tell people what this event is about..." />
                                        </div>
                                        <button type="submit" className="save-btn">{isEditingEvent ? 'Update Mission Data' : 'Launch to Dashboard'}</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="events-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Event Name</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                        <tr key={ev.id}>
                                            <td>{ev.name}</td>
                                            <td>{ev.event_date}</td>
                                            <td>
                                                <button
                                                    onClick={async () => {
                                                        const newType = ev.event_type === 'Online' ? 'Offline' : 'Online';
                                                        try {
                                                            await api.patch(
                                                                `/events/${ev.id}/type`,
                                                                { event_type: newType }
                                                            );
                                                            fetchData();
                                                        } catch (err) {
                                                            alert('Failed to update type: ' + (err.response?.data?.message || err.message));
                                                        }
                                                    }}
                                                    style={{
                                                        background: ev.event_type === 'Online' ? 'rgba(0, 210, 255, 0.12)' : 'rgba(255, 171, 0, 0.12)',
                                                        color: ev.event_type === 'Online' ? '#00d2ff' : '#ffab00',
                                                        border: `1px solid ${ev.event_type === 'Online' ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255, 171, 0, 0.3)'}`,
                                                        padding: '5px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {ev.event_type === 'Online' ? '🌐 Online' : '📍 Offline'}
                                                </button>
                                            </td>
                                            <td>
                                                {(() => {
                                                    const statusCycle = { 'Live': 'Upcoming', 'Upcoming': 'Completed', 'Completed': 'Live' };
                                                    const statusStyle = {
                                                        'Live': { bg: 'rgba(0,255,136,0.12)', color: '#00ff88', border: 'rgba(0,255,136,0.3)', icon: '🟢' },
                                                        'Upcoming': { bg: 'rgba(255,171,0,0.12)', color: '#ffab00', border: 'rgba(255,171,0,0.3)', icon: '🟡' },
                                                        'Completed': { bg: 'rgba(74,114,255,0.12)', color: '#4a72ff', border: 'rgba(74,114,255,0.3)', icon: '🔵' },
                                                    };
                                                    const current = ev.event_status || 'Upcoming';
                                                    const s = statusStyle[current] || statusStyle['Upcoming'];
                                                    return (
                                                        <button
                                                            title="Click to cycle status"
                                                            onClick={async () => {
                                                                const next = statusCycle[current];
                                                                try {
                                                                    await api.patch(
                                                                        `/events/${ev.id}/status`,
                                                                        { event_status: next }
                                                                    );
                                                                    fetchData();
                                                                } catch (err) {
                                                                    alert('Failed to update status: ' + (err.response?.data?.message || err.message));
                                                                }
                                                            }}
                                                            style={{
                                                                background: s.bg,
                                                                color: s.color,
                                                                border: `1px solid ${s.border}`,
                                                                padding: '5px 12px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.72rem',
                                                                fontWeight: '700',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {s.icon} {current}
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="export-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleOpenEditModal(ev)}>Edit</button>
                                                    <button className="del-btn" onClick={() => deleteEvent(ev.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'Users' && (() => {
                    // Filtered users
                    const filteredUsers = allUsers.filter(u => {
                        const matchSearch = !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            u.phone?.includes(userSearch);
                        const matchEvent = userEventFilter === 'all' || (u.event_names || '').split('|||').some(n => n === userEventFilter);
                        return matchSearch && matchEvent;
                    });

                    const handleSaveUser = async (e) => {
                        e.preventDefault();
                        try {
                            if (isEditingUser) {
                                await api.put(`/users/${editingUserId}`, userForm);
                            } else {
                                await api.post('/users', userForm);
                            }
                            setShowUserModal(false);
                            setUserForm({ name: '', email: '', phone: '' });
                            setIsEditingUser(false);
                            setEditingUserId(null);
                            fetchData();
                        } catch (err) {
                            alert(err.response?.data?.message || 'Failed to save user');
                        }
                    };

                    const handleViewUser = async (userId) => {
                        try {
                            const res = await api.get(`/users/${userId}`);
                            setSelectedUser(res.data.data);
                        } catch {
                            alert('Failed to load user details');
                        }
                    };

                    const handleToggleUserStatus = async (userId) => {
                        try {
                            await api.patch(`/users/${userId}/status`, {});
                            fetchData();
                            if (selectedUser?.id === userId) handleViewUser(userId);
                        } catch {
                            alert('Failed to update status');
                        }
                    };

                    const handleDeleteUser = async (userId) => {
                        if (!window.confirm('Delete this user and all their registrations?')) return;
                        try {
                            await api.delete(`/users/${userId}`);
                            setSelectedUser(null);
                            fetchData();
                        } catch {
                            alert('Delete failed');
                        }
                    };

                    return (
                        <div className="admin-section">
                            {/* Header */}
                            <div className="section-header">
                                <h3>👥 User Management</h3>
                                <button className="add-btn" onClick={() => {
                                    setIsEditingUser(false);
                                    setEditingUserId(null);
                                    setUserForm({ name: '', email: '', phone: '' });
                                    setShowUserModal(true);
                                }}>+ Add User</button>
                            </div>

                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <input
                                    placeholder="🔍 Search by name, email or phone..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    style={{ flex: 2, minWidth: '200px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}
                                />
                                <select
                                    value={userEventFilter}
                                    onChange={e => setUserEventFilter(e.target.value)}
                                    style={{ flex: 1, minWidth: '160px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem' }}
                                >
                                    <option value="all">All Events</option>
                                    {events.map(ev => <option key={ev.id} value={ev.name}>{ev.name}</option>)}
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', padding: '0 8px' }}>
                                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Layout: Table + Detail Panel */}
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {/* Users Table */}
                                <div style={{ flex: 1, overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Events</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px' }}>No users found</td></tr>
                                            )}
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} style={{ cursor: 'pointer', background: selectedUser?.id === u.id ? 'rgba(0,255,136,0.04)' : '' }}>
                                                    <td>
                                                        <button
                                                            onClick={() => handleViewUser(u.id)}
                                                            style={{ background: 'none', border: 'none', color: '#00d2ff', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '0.85rem', padding: 0 }}
                                                        >
                                                            {u.name}
                                                        </button>
                                                    </td>
                                                    <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>{u.email}</td>
                                                    <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{u.phone || '—'}</td>
                                                    <td>
                                                        <span style={{
                                                            background: 'rgba(0,210,255,0.1)', color: '#00d2ff',
                                                            border: '1px solid rgba(0,210,255,0.2)',
                                                            borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: '700'
                                                        }}>
                                                            🎫 {u.total_events || 0}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleToggleUserStatus(u.id)}
                                                            style={{
                                                                background: u.is_active ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                                                                color: u.is_active ? '#00ff88' : '#ff4444',
                                                                border: `1px solid ${u.is_active ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)'}`,
                                                                borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer'
                                                            }}
                                                        >
                                                            {u.is_active ? '● Active' : '○ Blocked'}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="export-btn" style={{ padding: '5px 10px', fontSize: '0.72rem' }} onClick={() => {
                                                                setIsEditingUser(true);
                                                                setEditingUserId(u.id);
                                                                setUserForm({ name: u.name, email: u.email, phone: u.phone || '' });
                                                                setShowUserModal(true);
                                                            }}>Edit</button>
                                                            <button className="del-btn" onClick={() => handleDeleteUser(u.id)}>Del</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* User Detail Panel */}
                                {selectedUser && (
                                    <div style={{
                                        width: '320px', flexShrink: 0, background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px',
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#00d2ff' }}>👤 Profile</h4>
                                            <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d2ff, #7a00ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '700', color: 'white', marginBottom: '12px' }}>
                                                {selectedUser.name?.[0]?.toUpperCase()}
                                            </div>
                                            <p style={{ margin: '4px 0', fontWeight: '700', fontSize: '1rem' }}>{selectedUser.name}</p>
                                            <p style={{ margin: '2px 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{selectedUser.email}</p>
                                            <p style={{ margin: '2px 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>{selectedUser.phone || 'No phone'}</p>
                                            <p style={{ margin: '6px 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                                                Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                                            <p style={{ margin: '0 0 10px', fontSize: '0.82rem', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                🎫 {selectedUser.registered_events?.length || 0} Event{(selectedUser.registered_events?.length || 0) !== 1 ? 's' : ''} Attended
                                            </p>
                                            {(selectedUser.registered_events || []).length === 0 && (
                                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>No events registered</p>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                                {(selectedUser.registered_events || []).map((ev, i) => (
                                                    <div key={i} style={{
                                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                                        borderRadius: '10px', padding: '10px 12px'
                                                    }}>
                                                        <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '0.82rem' }}>{ev.name}</p>
                                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
                                                            📅 {ev.event_date} {ev.event_time && `· ${ev.event_time}`}
                                                        </p>
                                                        <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                                                            {ev.event_type === 'Online' ? '🌐' : '📍'} {ev.location || 'N/A'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add/Edit User Modal */}
                            {showUserModal && (
                                <div className="admin-modal-overlay">
                                    <div className="admin-modal" style={{ maxWidth: '420px' }}>
                                        <div className="modal-header">
                                            <h2>{isEditingUser ? 'Edit User' : 'Add New User'}</h2>
                                            <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
                                        </div>
                                        <form onSubmit={handleSaveUser} className="cms-form">
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="e.g. Sundar Kumar" />
                                            </div>
                                            <div className="form-group">
                                                <label>Email Address</label>
                                                <input required type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="user@example.com" />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number</label>
                                                <input value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} placeholder="+91 9876543210" />
                                            </div>
                                            <button type="submit" className="save-btn">{isEditingUser ? 'Update User' : 'Add User'}</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}



                {activeTab === 'General CMS' && (
                    <div className="admin-section">
                        <h3>General Website Settings</h3>
                        <form onSubmit={handleUpdateCMS} className="cms-form">
                            <div className="form-group">
                                <label>Website Name</label>
                                <input value={cmsData.website_name || ''} onChange={e => setCmsData({ ...cmsData, website_name: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <ImageUploadField
                                        specKey="website_logo"
                                        value={cmsData.website_logo}
                                        existingImageUrl={typeof cmsData.website_logo === 'string' ? cmsData.website_logo : null}
                                        onChange={(file) => setCmsData({ ...cmsData, website_logo: file })}
                                    />
                                </div>
                                <div className="form-group">
                                    <ImageUploadField
                                        specKey="favicon"
                                        value={cmsData.favicon}
                                        existingImageUrl={typeof cmsData.favicon === 'string' ? cmsData.favicon : null}
                                        onChange={(file) => setCmsData({ ...cmsData, favicon: file })}
                                    />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Primary Color</label>
                                    <input type="color" value={cmsData.primary_color || '#00ff88'} onChange={e => setCmsData({ ...cmsData, primary_color: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Secondary Color</label>
                                    <input type="color" value={cmsData.secondary_color || '#001a0d'} onChange={e => setCmsData({ ...cmsData, secondary_color: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>SEO Title</label>
                                <input value={cmsData.seo_title || ''} onChange={e => setCmsData({ ...cmsData, seo_title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>SEO Description</label>
                                <textarea value={cmsData.seo_description || ''} onChange={e => setCmsData({ ...cmsData, seo_description: e.target.value })} />
                            </div>
                            <button type="submit" className="save-btn">Apply General Settings</button>
                        </form>
                    </div>
                )}

                {activeTab === 'Homepage CMS' && (
                    <div className="admin-section">
                        <h3>Homepage Sections</h3>
                        <form onSubmit={handleUpdateCMS} className="cms-form">
                            <div className="form-group">
                                <label>Hero Title</label>
                                <input value={cmsData.hero_title || ''} onChange={e => setCmsData({ ...cmsData, hero_title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Hero Subtitle</label>
                                <input value={cmsData.hero_subtitle || ''} onChange={e => setCmsData({ ...cmsData, hero_subtitle: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Get Started Button Text</label>
                                    <input value={cmsData.hero_cta_text || ''} onChange={e => setCmsData({ ...cmsData, hero_cta_text: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Welcome Message</label>
                                    <input value={cmsData.welcome_message || ''} onChange={e => setCmsData({ ...cmsData, welcome_message: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="save-btn">Update Homepage Content</button>
                        </form>
                    </div>
                )}

                {activeTab === 'Header CMS' && (
                    <div className="admin-section">
                        <h3>Header & Branding CMS</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Configure the global identity elements that appear in the dashboard header.
                        </p>
                        <form onSubmit={handleUpdateCMS} className="cms-form">
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Website / Brand Name</label>
                                    <input
                                        placeholder="e.g. GENSAAS"
                                        value={cmsData.website_name || ''}
                                        onChange={e => setCmsData({ ...cmsData, website_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Header Tagline (Suffix)</label>
                                    <input
                                        placeholder="e.g. DASHBOARD"
                                        value={cmsData.header_tagline || ''}
                                        onChange={e => setCmsData({ ...cmsData, header_tagline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>User Badge Text (Member Status)</label>
                                    <input
                                        placeholder="e.g. Verified / Member / Elite"
                                        value={cmsData.user_badge_text || ''}
                                        onChange={e => setCmsData({ ...cmsData, user_badge_text: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Brand Logo Workstation</label>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '25px',
                                        background: 'rgba(0,0,0,0.4)',
                                        padding: '40px',
                                        borderRadius: '24px',
                                        border: '1px dashed rgba(255,255,255,0.15)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                            <div style={{
                                                width: '180px',
                                                height: '180px',
                                                borderRadius: '28px',
                                                background: '#0a0a0a',
                                                border: '3px solid var(--g-accent)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                boxShadow: '0 20px 50px rgba(0,255,136,0.15)',
                                                flexShrink: 0
                                            }}>
                                                {cmsData.website_logo && typeof cmsData.website_logo === 'string' ? (
                                                    <img src={`http://localhost:5000${cmsData.website_logo}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <span style={{ fontSize: '4rem', color: 'var(--g-accent)', fontWeight: '900' }}>
                                                        {cmsData.website_name ? cmsData.website_name[0] : 'G'}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: 'white' }}>Mission Logo Station</h4>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                                                    Upload your official mission mark. <br />
                                                    **Recommendation**: Transparent PNG or SVG for elite results. <br />
                                                    System will auto-fit your image into the 180x180px high-fidelity zone.
                                                </p>
                                                <ImageUploadField
                                                    specKey="website_logo"
                                                    value={cmsData.website_logo}
                                                    existingImageUrl={typeof cmsData.website_logo === 'string' ? cmsData.website_logo : null}
                                                    onChange={(file) => setCmsData({ ...cmsData, website_logo: file })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', margin: '20px 0' }} />

                            <h4 style={{ marginBottom: '15px', color: 'var(--g-accent)' }}>Visual & Interactive Controls</h4>

                            <div className="grid-3">
                                <div className="form-group">
                                    <label>Header Opacity ({cmsData.header_opacity || '0.6'})</label>
                                    <input type="range" min="0" max="1" step="0.1" value={cmsData.header_opacity || '0.6'} onChange={e => setCmsData({ ...cmsData, header_opacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Header Blur ({cmsData.header_blur || '20'}px)</label>
                                    <input type="range" min="0" max="100" step="5" value={cmsData.header_blur || '20'} onChange={e => setCmsData({ ...cmsData, header_blur: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Logo Display Size ({cmsData.header_logo_size || '32'}px)</label>
                                    <input type="range" min="20" max="60" step="2" value={cmsData.header_logo_size || '32'} onChange={e => setCmsData({ ...cmsData, header_logo_size: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Border Accent Color</label>
                                    <input type="color" value={cmsData.header_border_color || '#333333'} onChange={e => setCmsData({ ...cmsData, header_border_color: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Search Placeholder Text</label>
                                    <input
                                        placeholder="Search missions..."
                                        value={cmsData.search_placeholder || ''}
                                        onChange={e => setCmsData({ ...cmsData, search_placeholder: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nav Button Color</label>
                                    <input type="color" value={cmsData.nav_btn_color || '#ffffff'} onChange={e => setCmsData({ ...cmsData, nav_btn_color: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid-2" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={cmsData.show_search !== 'false'}
                                        onChange={e => setCmsData({ ...cmsData, show_search: e.target.checked ? 'true' : 'false' })}
                                        id="chkSearch"
                                    />
                                    <label htmlFor="chkSearch" style={{ marginBottom: 0 }}>Enable Search Bar</label>
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={cmsData.show_notifications !== 'false'}
                                        onChange={e => setCmsData({ ...cmsData, show_notifications: e.target.checked ? 'true' : 'false' })}
                                        id="chkNotify"
                                    />
                                    <label htmlFor="chkNotify" style={{ marginBottom: 0 }}>Enable Notifications (Bell Icon)</label>
                                </div>
                            </div>

                            <button type="submit" className="save-btn" style={{ marginTop: '20px' }}>Save Detailed Settings</button>
                        </form>
                    </div>
                )}



                {activeTab === 'Speaker CMS' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h3>Speaker Management</h3>
                            <button className="add-btn" onClick={() => setShowSpeakerModal(true)}>+ Add New Speaker</button>
                        </div>
                        <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', display: 'grid', gap: '25px', marginTop: '20px' }}>
                            {speakers.map(s => (
                                <div key={s.id} className="yt-card active" style={{
                                    height: 'auto',
                                    padding: '12px',
                                    background: '#0a0a0a',
                                    border: '1px solid rgba(0, 255, 136, 0.15)',
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div className="yt-thumb" style={{ height: '320px', background: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                                        {s.image_url ? (
                                            <img src={`http://localhost:5000${s.image_url}`} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ fontSize: '3rem', opacity: 0.2 }}>👤</div>
                                        )}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95) 40%, #000 100%)',
                                            zIndex: 2
                                        }}>
                                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>{s.name}</h4>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--g-accent)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>
                                                {s.expertise}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px 10px' }}>
                                        <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Expertise</span>
                                            <p style={{ margin: '6px 0 0', fontSize: '1rem', color: 'var(--g-accent)', fontWeight: '800' }}>{s.expertise}</p>
                                        </div>
                                        <p style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.85rem',
                                            lineHeight: '1.6',
                                            margin: '0',
                                            height: '70px',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            fontWeight: '500'
                                        }}>
                                            {s.bio}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                                            <button
                                                onClick={() => toggleSpeakerVisibility(s.id, s.is_visible)}
                                                style={{
                                                    flex: 1,
                                                    background: s.is_visible ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                                                    color: s.is_visible ? 'var(--primary-green)' : '#ff4444',
                                                    border: `1px solid ${s.is_visible ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`,
                                                    padding: '10px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: '0.2s'
                                                }}
                                            >
                                                {s.is_visible ? '● LIVE' : '○ HIDDEN'}
                                            </button>
                                            <button
                                                className="del-btn"
                                                style={{ borderRadius: '12px', flex: 0.5 }}
                                                onClick={() => deleteSpeaker(s.id)}
                                            >Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {speakers.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No speakers added yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Registrations' && (() => {
                    // Group registrations by event name
                    const grouped = registrations.reduce((acc, r) => {
                        const key = r.event_name || 'Unknown Event';
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(r);
                        return acc;
                    }, {});

                    const exportEventCSV = (eventName, rows) => {
                        const headers = ['#', 'Name', 'Email', 'Phone', 'Dietary Pref', 'Notes', 'Registered At'];
                        const csvRows = rows.map((r, i) => [
                            i + 1,
                            r.user_name,
                            r.user_email,
                            r.user_phone || '—',
                            r.dietary_pref || 'none',
                            r.notes || '',
                            new Date(r.registered_at).toLocaleString('en-IN')
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8,"
                            + [headers, ...csvRows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
                        const link = document.createElement('a');
                        link.setAttribute('href', encodeURI(csvContent));
                        link.setAttribute('download', `Registrations_${eventName.replace(/\s+/g, '_')}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };

                    return (
                        <div className="admin-section">
                            <div className="section-header">
                                <div>
                                    <h3>Event Registrations</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                                        {registrations.length} total registration{registrations.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} event{Object.keys(grouped).length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <button className="export-btn" onClick={() => exportCSV()}>Export All CSV</button>
                            </div>

                            {registrations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                                    <p>No registrations yet. They will appear here once attendees register for an event.</p>
                                </div>
                            ) : (
                                Object.entries(grouped).map(([eventName, regs]) => (
                                    <div key={eventName} style={{
                                        marginBottom: '32px',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '16px',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Event Header */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 20px',
                                            background: 'rgba(0,255,136,0.05)',
                                            borderBottom: '1px solid var(--glass-border)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '10px', height: '10px', borderRadius: '50%',
                                                    background: 'var(--primary-green)',
                                                    boxShadow: '0 0 8px var(--primary-green)'
                                                }} />
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{eventName}</h4>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                        {regs.length} registrant{regs.length !== 1 ? 's' : ''}
                                                        {' · '}Last: {new Date(regs[0].registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span style={{
                                                    padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem',
                                                    background: 'rgba(0,255,136,0.1)', color: 'var(--primary-green)',
                                                    border: '1px solid rgba(0,255,136,0.2)'
                                                }}>{regs.length} Registered</span>
                                                <button
                                                    className="export-btn"
                                                    style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                                                    onClick={() => exportEventCSV(eventName, regs)}
                                                >⬇ Export CSV</button>
                                            </div>
                                        </div>

                                        {/* Attendee Table */}
                                        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                            <table className="admin-table" style={{ marginBottom: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>Dietary / Needs</th>
                                                        <th>Notes</th>
                                                        <th>Registered At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {regs.map((r, idx) => (
                                                        <tr key={r.id}>
                                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                                            <td><strong>{r.user_name}</strong></td>
                                                            <td style={{ fontSize: '0.85rem' }}>{r.user_email}</td>
                                                            <td style={{ fontSize: '0.85rem' }}>{r.user_phone || '—'}</td>
                                                            <td>
                                                                <span style={{
                                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid rgba(255,255,255,0.08)'
                                                                }}>{r.dietary_pref || 'Standard'}</span>
                                                            </td>
                                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {r.notes || '—'}
                                                            </td>
                                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                                {new Date(r.registered_at).toLocaleString('en-IN', {
                                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'Registration CMS' && (
                    <div className="admin-section">
                        <h3>Dynamic Registration Form</h3>
                        <div className="form-group">
                            <label>Select Event to Configure Form</label>
                            <select onChange={async (e) => {
                                const evId = e.target.value;
                                setActiveEventForFields(evId);
                                const res = await api.get(`/registration-fields/${evId}`);
                                setDynamicFields(res.data.data || []);
                            }}>
                                <option value="">-- Choose Event --</option>
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                            </select>
                        </div>

                        {activeEventForFields && (
                            <div className="cms-form" style={{ marginTop: '20px' }}>
                                {dynamicFields.map((f, idx) => (
                                    <div key={idx} style={{
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '14px',
                                        background: 'rgba(255,255,255,0.02)'
                                    }}>
                                        {/* Row 1: Label + Type + Required + Remove */}
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <input
                                                placeholder="Field Label (e.g. T-Shirt Size)"
                                                value={f.label}
                                                style={{ flex: 2, minWidth: '150px' }}
                                                onChange={e => {
                                                    const nf = [...dynamicFields];
                                                    nf[idx] = { ...nf[idx], label: e.target.value };
                                                    setDynamicFields(nf);
                                                }}
                                            />
                                            <select
                                                value={f.field_type}
                                                style={{ flex: 1, minWidth: '130px' }}
                                                onChange={e => {
                                                    const nf = [...dynamicFields];
                                                    nf[idx] = { ...nf[idx], field_type: e.target.value, field_options: '[]' };
                                                    setDynamicFields(nf);
                                                }}
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="dropdown">Dropdown</option>
                                                <option value="checkbox">Checkbox</option>
                                            </select>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!f.is_required}
                                                    onChange={e => {
                                                        const nf = [...dynamicFields];
                                                        nf[idx] = { ...nf[idx], is_required: e.target.checked };
                                                        setDynamicFields(nf);
                                                    }}
                                                />
                                                Required
                                            </label>
                                            <button
                                                style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff4444', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                onClick={() => setDynamicFields(dynamicFields.filter((_, i) => i !== idx))}
                                            >✕ Remove</button>
                                        </div>

                                        {/* Row 2: Dropdown options input — only visible when type = dropdown */}
                                        {f.field_type === 'dropdown' && (
                                            <div style={{ marginTop: '12px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                                    📋 Options — separate each choice with a comma
                                                </label>
                                                <input
                                                    placeholder="e.g.  Morning,  Afternoon,  Evening"
                                                    style={{ width: '100%', marginTop: 0 }}
                                                    value={(() => {
                                                        try { 
                                                            const opts = typeof f.field_options === 'string' ? JSON.parse(f.field_options || '[]') : (f.field_options || []);
                                                            return Array.isArray(opts) ? opts.join(', ') : '';
                                                        }
                                                        catch { return ''; }
                                                    })()}
                                                    onChange={e => {
                                                        const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                        const nf = [...dynamicFields];
                                                        nf[idx] = { ...nf[idx], field_options: opts }; // Store as array for consistency
                                                        setDynamicFields(nf);
                                                    }}
                                                />
                                                {/* Live pill preview */}
                                                {(() => {
                                                    try {
                                                        const opts = typeof f.field_options === 'string' ? JSON.parse(f.field_options || '[]') : (f.field_options || []);
                                                        if (!opts || !opts.length) return null;
                                                        return (
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                                {opts.map((opt, oi) => (
                                                                    <span key={oi} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: 'var(--primary-green)' }}>
                                                                        {opt}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    } catch { return null; }
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                    <button className="add-btn" onClick={() => setDynamicFields([...dynamicFields, { label: '', field_type: 'text', is_required: false, field_options: [] }])}>
                                        + Add Field
                                    </button>
                                    <button className="save-btn" onClick={async () => {
                                        try {
                                            const payload = { 
                                                fields: dynamicFields.map(f => ({
                                                    ...f,
                                                    field_options: Array.isArray(f.field_options) ? JSON.stringify(f.field_options) : f.field_options
                                                }))
                                            };
                                            await api.post(`/registration-fields/batch-update/${activeEventForFields}`, payload);
                                            alert('Form structure saved successfully!');
                                        } catch (err) {
                                            console.error('Save failed', err);
                                            alert('Failed to save structure: ' + (err.response?.data?.message || err.message));
                                        }
                                    }}>Save Form Structure</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Security' && (
                    <div className="admin-section">
                        <div className="grid-2">
                            <div className="cms-form">
                                <h3>Change Admin Password</h3>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input type="password" value={securityData.currentPassword} onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" value={securityData.newPassword} onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })} />
                                </div>
                                <button className="save-btn" onClick={async () => {
                                    try {
                                        await api.post('/security/change-password', securityData);
                                        alert('Password changed!');
                                    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
                                }}>Update Password</button>
                            </div>

                            <div className="cms-form">
                                <h3>Add Sub-Admin</h3>
                                <div className="form-group">
                                    <label>User ID</label>
                                    <input value={securityData.userId} onChange={e => setSecurityData({ ...securityData, userId: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input value={securityData.fullName} onChange={e => setSecurityData({ ...securityData, fullName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" value={securityData.subAdminPassword} onChange={e => setSecurityData({ ...securityData, subAdminPassword: e.target.value })} />
                                </div>
                                <button className="save-btn" onClick={async () => {
                                    await api.post('/security/add-subadmin', { ...securityData, password: securityData.subAdminPassword });
                                    alert('Sub-Admin Added!');
                                }}>Add Admin Account</button>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="cms-form">
                                <h3>API Ecosystem Management</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Use this key for external connections and mobile app integration.</p>
                                <div className="form-group" style={{ marginTop: '10px' }}>
                                    <label>Current API Key</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            readOnly
                                            value={securityData.apiKey || 'AIzaSys-EventCheckInApp-2026-Sundar'}
                                            style={{ flex: 1, background: 'rgba(0,0,0,0.5)', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                        />
                                        <button
                                            className="view-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(securityData.apiKey || 'AIzaSys-EventCheckInApp-2026-Sundar');
                                                alert('Copied to Clipboard!');
                                            }}
                                        >Copy</button>
                                    </div>
                                </div>
                                <button
                                    className="save-btn"
                                    style={{ marginTop: '10px', background: 'rgba(0,255,136,0.1)', color: 'var(--primary-green)', border: '1px solid var(--primary-green)' }}
                                    onClick={async () => {
                                        if (!window.confirm('Rotating the API key will break current external connections. Continue?')) return;
                                        try {
                                            const res = await api.post('/api-keys/generate');
                                            setSecurityData({ ...securityData, apiKey: res.data.apiKey });
                                            alert('New API Key Generated!');
                                        } catch (err) {
                                            alert('Failed to generate key. Check console.');
                                            console.error(err);
                                        }
                                    }}
                                >Rotate System API Key</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Analytics' && (
                    <div className="admin-section analytics-dashboard">
                        <div className="section-header">
                            <h3>📊 Platform Analytics & Trends</h3>
                            <button className="export-btn" onClick={fetchData}>🔄 Refresh Analysis</button>
                        </div>

                        {/* Top Metrics Row */}
                        <div className="stats-grid" style={{ marginBottom: '30px' }}>
                            <div className="stat-card glass-morph">
                                <div className="stat-icon-box" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--primary-green)' }}>
                                    <Activity size={20} />
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalRegistrations}</h3>
                                    <p className="stat-label">Total Conversions</p>
                                    <span className="stat-subtext">Successful bookings across all missions</span>
                                </div>
                            </div>
                            <div className="stat-card glass-morph">
                                <div className="stat-icon-box" style={{ background: 'rgba(74, 114, 255, 0.1)', color: '#4a72ff' }}>
                                    <Users size={20} />
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalUsers}</h3>
                                    <p className="stat-label">User Ecosystem</p>
                                    <span className="stat-subtext">Verified active account holders</span>
                                </div>
                            </div>
                            <div className="stat-card glass-morph">
                                <div className="stat-icon-box" style={{ background: 'rgba(255, 171, 0, 0.1)', color: '#ffab00' }}>
                                    <Calendar size={20} />
                                </div>
                                <div className="stat-body">
                                    <h3 className="big-stat">{analytics.totalEvents}</h3>
                                    <p className="stat-label">Mission Inventory</p>
                                    <span className="stat-subtext">Active and archived events</span>
                                </div>
                            </div>
                        </div>

                        {/* Registration Trends Chart (Full Width) */}
                        <div className="analytics-card glass-morph full-width" style={{ marginBottom: '25px', padding: '25px', borderRadius: '24px' }}>
                            <div className="chart-header">
                                <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <TrendingUp size={20} color="var(--primary-green)" />
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Registration Velocity (Last 30 Days)</h4>
                                </div>
                            </div>
                            <div className="chart-container" style={{ height: '350px', marginTop: '30px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.dailyTrends}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary-green)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--primary-green)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                        />
                                        <YAxis 
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ background: '#0a0a0a', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white' }}
                                            itemStyle={{ color: 'var(--primary-green)' }}
                                            labelFormatter={(l) => new Date(l).toDateString()}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="count" 
                                            stroke="var(--primary-green)" 
                                            fillOpacity={1} 
                                            fill="url(#colorCount)" 
                                            strokeWidth={3}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Secondary Analytics Row */}
                        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            {/* Mission Popularity */}
                            <div className="analytics-card glass-morph" style={{ padding: '25px', borderRadius: '24px' }}>
                                <div className="chart-header">
                                    <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Trophy size={20} color="#ffab00" />
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Mission Success Rate</h4>
                                    </div>
                                </div>
                                <div className="chart-container" style={{ height: '300px', marginTop: '20px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.eventDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="registrations"
                                                animationDuration={1000}
                                            >
                                                {analytics.eventDistribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#00ff88', '#00d2ff', '#ff007a', '#7a00ff', '#ffab00'][index % 5]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ background: '#0a0a0a', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Joins Log */}
                            <div className="analytics-card glass-morph" style={{ padding: '25px', borderRadius: '24px' }}>
                                <div className="chart-header">
                                    <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Activity size={20} color="#00d2ff" />
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Telemetry: Live Joins</h4>
                                    </div>
                                </div>
                                <div className="activity-feed-container" style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', marginTop: '20px' }}>
                                    {analytics.recentActivity?.map((act, i) => (
                                        <div key={i} className="activity-item-v2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
                                            <div className="act-content">
                                                <div className="act-text">
                                                    <span className="act-name" style={{ color: 'var(--primary-green)', fontWeight: '700' }}>{act.user_name}</span>
                                                    <span className="act-desc"> registered for </span>
                                                    <span className="act-event" style={{ color: 'white' }}>{act.event_name}</span>
                                                </div>
                                                <div className="act-time" style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '4px' }}>
                                                    {new Date(act.registered_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                                        <div className="empty-activity" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No recent telemetry data.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Email CMS' && (
                    <div className="admin-section">
                        <h3>Email Notification Templates</h3>
                        <form onSubmit={handleUpdateCMS} className="cms-form">
                            <div className="form-group">
                                <label>Registration Confirmation Email (Subject)</label>
                                <input value={cmsData.email_subject || ''} onChange={e => setCmsData({ ...cmsData, email_subject: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email Content (Available tags: {"{{name}}"}, {"{{event_name}}"})</label>
                                <textarea rows="10" value={cmsData.email_content || ''} onChange={e => setCmsData({ ...cmsData, email_content: e.target.value })} />
                            </div>
                            <button type="submit" className="save-btn">Update Email Templates</button>
                        </form>
                    </div>
                )}
                {activeTab === 'Poster CMS' && (
                    <div className="admin-section">
                        <h3>Poster Template Visuals</h3>
                        <form onSubmit={handleUpdateTemplate} className="cms-form">
                            <div className="grid-2">
                                <div className="form-group">
                                    <ImageUploadField
                                        specKey="poster_template"
                                        value={templateFiles.template_image}
                                        existingImageUrl={template.template_image_url || null}
                                        onChange={(file) => setTemplateFiles({ ...templateFiles, template_image: file })}
                                    />
                                </div>
                                <div className="form-group">
                                    <ImageUploadField
                                        specKey="poster_logo"
                                        value={templateFiles.logo_image}
                                        existingImageUrl={template.logo_image_url || null}
                                        onChange={(file) => setTemplateFiles({ ...templateFiles, logo_image: file })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Congratulatory Message (Available tags: {"{{name}}"}, {"{{event_name}}"})</label>
                                <textarea value={template.congrat_message} onChange={e => setTemplate({ ...template, congrat_message: e.target.value })} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Name X Position</label>
                                    <input type="number" value={template.name_x} onChange={e => setTemplate({ ...template, name_x: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Name Y Position</label>
                                    <input type="number" value={template.name_y} onChange={e => setTemplate({ ...template, name_y: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="save-btn">Deploy Poster Settings</button>
                        </form>
                    </div>
                )}
                {/* ════════ SLIDESHOW CMS TAB ════════ */}
                {activeTab === 'Slideshow CMS' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <div>
                                <h3>🎞️ Slideshow Management</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                                    Manage hero slider banners shown on the dashboard. Images must be <strong style={{ color: 'var(--primary-green)' }}>1920×600px</strong> (16:5 ratio).
                                </p>
                            </div>
                            <button className="add-btn" onClick={() => {
                                setNewSlide({ title: '', subtitle: '', image: null, link_event_id: '', sort_order: _slideshowItems.length, is_active: true });
                                setShowSlideModal(true);
                            }}>+ Add Slide</button>
                        </div>

                        {/* Image Spec Callout */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            padding: '18px 22px', marginBottom: '24px',
                            background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)',
                            borderRadius: '16px'
                        }}>
                            <ImageIcon size={24} style={{ color: 'var(--primary-green)', flexShrink: 0 }} />
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                                    Required Image Size: <span style={{ color: 'var(--primary-green)' }}>1920 × 600px</span> (Aspect Ratio: 16:5)
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Accepted formats: JPEG, PNG, WebP · Max file size: 5MB · Images will be auto-fit with cover mode
                                </p>
                            </div>
                        </div>

                        {/* Featured Events as Slides */}
                        <h4 style={{ color: 'var(--primary-green)', marginBottom: '14px', fontSize: '0.95rem' }}>
                            Featured Events in Slideshow ({events.filter(e => e.is_featured).length})
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            {events.filter(e => e.is_featured).length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: '16px' }}>
                                    No events are marked as featured. Edit events and check "Feature on Home Slider" to add them.
                                </div>
                            )}
                            {events.filter(e => e.is_featured).map(ev => (
                                <div key={ev.id} style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s'
                                }}>
                                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#000' }}>
                                        {ev.banner_image ? (
                                            <img src={`http://localhost:5000${ev.banner_image}`} alt={ev.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                No banner image
                                            </div>
                                        )}
                                        <div style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            padding: '4px 12px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 800,
                                            background: 'rgba(0,255,136,0.15)', color: 'var(--primary-green)', border: '1px solid rgba(0,255,136,0.3)',
                                            backdropFilter: 'blur(10px)'
                                        }}>
                                            ⭐ FEATURED
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px' }}>
                                        <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'white' }}>{ev.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {ev.event_date} · {ev.event_type}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button className="export-btn" style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                                                onClick={() => handleOpenEditModal(ev)}>Edit Banner</button>
                                            <button className="del-btn" style={{ borderRadius: '8px' }}
                                                onClick={async () => {
                                                    try {
                                                        const fd = new FormData();
                                                        fd.append('is_featured', 'false');
                                                        await api.put(`/events/${ev.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                        fetchData();
                                                    } catch { alert('Failed to remove from slideshow'); }
                                                }}>Remove from Slideshow</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* All Events Quick-Toggle */}
                        <h4 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '14px', fontSize: '0.88rem' }}>
                            Quick Toggle: Add Events to Slideshow
                        </h4>
                        <div className="events-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Date</th>
                                        <th>Has Banner</th>
                                        <th>In Slideshow</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(ev => (
                                        <tr key={ev.id}>
                                            <td>{ev.name}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{ev.event_date}</td>
                                            <td>
                                                {ev.banner_image ? (
                                                    <span style={{ color: 'var(--primary-green)', fontWeight: 700, fontSize: '0.78rem' }}>✓ Yes</span>
                                                ) : (
                                                    <span style={{ color: '#ff4444', fontWeight: 700, fontSize: '0.78rem' }}>✗ Missing</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const fd = new FormData();
                                                            fd.append('is_featured', ev.is_featured ? 'false' : 'true');
                                                            await api.put(`/events/${ev.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            fetchData();
                                                            refreshCMS();
                                                        } catch { alert('Failed'); }
                                                    }}
                                                    style={{
                                                        background: ev.is_featured ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                                                        color: ev.is_featured ? 'var(--primary-green)' : 'var(--text-muted)',
                                                        border: `1px solid ${ev.is_featured ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.1)'}`,
                                                        padding: '5px 14px', borderRadius: '8px', fontSize: '0.75rem',
                                                        fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                                                    }}
                                                >
                                                    {ev.is_featured ? '⭐ Featured' : '○ Add'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ════════ IMAGE SPECS REFERENCE TAB ════════ */}
                {activeTab === 'Image Specs' && (
                    <div className="admin-section">
                        <h3>📐 Image Size Reference Guide</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.6 }}>
                            All image uploads in this admin panel follow strict dimension requirements to ensure
                            perfect display across the dashboard, slideshow, event cards, and registration templates.
                            <strong style={{ color: 'var(--primary-green)' }}> Always upload images matching the recommended size.</strong>
                        </p>

                        <div className="img-spec-reference-grid">
                            {Object.entries(IMAGE_SPECS).map(([key, spec]) => (
                                <div key={key} className="img-spec-ref-card">
                                    <div className="img-spec-ref-header">
                                        <span className="img-spec-ref-icon">{spec.icon}</span>
                                        <span className="img-spec-ref-title">{spec.label}</span>
                                    </div>
                                    <div className="img-spec-ref-dims">
                                        <span className="img-spec-ref-dim">{spec.width}×{spec.height}px</span>
                                        <span className="img-spec-ref-dim">Ratio: {spec.aspectRatio}</span>
                                        <span className="img-spec-ref-dim">Max: {spec.maxFileSize < 1024 * 1024 ? `${(spec.maxFileSize / 1024).toFixed(0)}KB` : `${(spec.maxFileSize / (1024 * 1024)).toFixed(0)}MB`}</span>
                                    </div>
                                    <p className="img-spec-ref-desc">{spec.description}</p>
                                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                                        Formats: {spec.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showSpeakerModal && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <div className="modal-header">
                                <h2>Add Industry Expert</h2>
                                <button className="close-btn" onClick={() => setShowSpeakerModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleCreateSpeaker} className="cms-form modal-scroll">
                                <div className="form-group">
                                    <label>Speaker Name</label>
                                    <input required value={newSpeaker.name} onChange={e => setNewSpeaker({ ...newSpeaker, name: e.target.value })} placeholder="e.g. Satya Nadella" />
                                </div>
                                <div className="form-group">
                                    <label>Field of Expertise</label>
                                    <input required value={newSpeaker.expertise} onChange={e => setNewSpeaker({ ...newSpeaker, expertise: e.target.value })} placeholder="e.g. Quantum Computing & AI" />
                                </div>
                                <div className="form-group">
                                    <label>Professional Bio</label>
                                    <textarea required value={newSpeaker.bio} onChange={e => setNewSpeaker({ ...newSpeaker, bio: e.target.value })} placeholder="Tell us about their background..." rows="4" />
                                </div>
                                <ImageUploadField
                                    specKey="speaker_photo"
                                    value={newSpeaker.image}
                                    onChange={(file) => setNewSpeaker({ ...newSpeaker, image: file })}
                                />
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <input type="checkbox" checked={newSpeaker.is_visible} onChange={e => setNewSpeaker({ ...newSpeaker, is_visible: e.target.checked })} id="speakerVisible" />
                                    <label htmlFor="speakerVisible" style={{ cursor: 'pointer', marginBottom: 0 }}>Immediate Public Visibility</label>
                                </div>
                                <button type="submit" className="save-btn">Onboard Speaker</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
