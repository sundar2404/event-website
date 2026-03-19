import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, ShieldCheck, Zap, Globe, Calendar, MapPin, Clock } from 'lucide-react';
import api from './utils/api';
import { useCMS } from './context/CMSContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import GetStartedButton from './components/GetStartedButton';
import './LandingPage.css';

const LandingPage = () => {
    const { content } = useCMS();
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    // Sample Dummy Data for 4 Webinar Cards (Standard Fallback)
    const dummyWebinars = [
        {
            id: 101,
            name: "Cloud Native Architecture 2026",
            description: "Master the art of building scalable cloud solutions with Kubernetes and Docker. A deep dive into modern infrastructure.",
            event_date: "Apr 10, 2026",
            event_time: "02:00 PM",
            location: "Virtual",
            tag: "Upcoming",
            tag_color: "#3498db",
            cta_text: "Secure Seat",
            status: "Upcoming",
            banner_image: null
        },
        {
            id: 102,
            name: "CyberSecurity Protocols",
            description: "Learn the latest defenses against modern cyber threats in this intensive webinar with industry leads.",
            event_date: "May 22, 2026",
            event_time: "11:00 AM",
            location: "Singapore",
            tag: "Live",
            tag_color: "#e74c3c",
            cta_text: "Join Mission",
            status: "Live",
            banner_image: null
        },
        {
            id: 103,
            name: "Frontend Mastery: React 19",
            description: "Deep dive into the new features of React 19 and the future of web development with Server Components.",
            event_date: "Jun 05, 2026",
            event_time: "04:00 PM",
            location: "San Francisco",
            tag: "Upcoming",
            tag_color: "#61dafb",
            cta_text: "Register Now",
            status: "Upcoming",
            banner_image: null
        },
        {
            id: 104,
            name: "Data Science with Python",
            description: "From zero to hero in data analysis and visualization using Pandas and Matplotlib. Full archive access.",
            event_date: "Jul 12, 2026",
            event_time: "09:00 AM",
            location: "Berlin",
            tag: "Completed",
            tag_color: "#f1c40f",
            cta_text: "View Archive",
            status: "Completed",
            banner_image: null
        }
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                const fetchedEvents = res.data.data || [];
                // Merge dummy data if no events exist in DB
                setEvents(fetchedEvents.length > 0 ? fetchedEvents : dummyWebinars);
            } catch (err) {
                console.error('Failed to fetch events');
                setEvents(dummyWebinars);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (content.primary_color) document.documentElement.style.setProperty('--primary-green', content.primary_color);
        if (content.secondary_color) document.documentElement.style.setProperty('--bg-dark', content.secondary_color);
    }, [content]);

    return (
        <div className="minimal-landing-root">
            <div className="minimal-scroll-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="minimal-container"
                >
                    <div className="minimal-logo-box">
                        {content.website_logo ? (
                            <img src={api.defaults.baseURL.replace('/api', '') + content.website_logo} alt="Logo" className="minimal-logo" />
                        ) : (
                            <div className="minimal-logo-placeholder">G</div>
                        )}
                        <h1 className="minimal-brand-name">{content.website_name || 'GENSAAS'}</h1>
                    </div>

                    <div className="minimal-action">
                        <GetStartedButton onClick={() => navigate('/login')} />
                    </div>
                </motion.div>

                {(events.length > 0) && (
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="landing-events-section"
                    >
                        <div className="section-header">
                            <h2 id="missions-title">Mission Catalogue</h2>
                            <p>Explore our upcoming world-class tech webinars and system deployments.</p>
                        </div>

                        <div
                            className="landing-events-grid"
                            role="list"
                            aria-labelledby="missions-title"
                        >
                            {events.map((event, index) => (
                                <motion.article
                                    key={event.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="event-mini-card glass-morph-premium"
                                    style={{ '--event-color': event.tag_color || 'var(--primary-green)' }}
                                    role="listitem"
                                >
                                    <div className="event-mini-thumb" onClick={() => navigate(`/register/${event.id}`)}>
                                        <img
                                            src={event.banner_image ? (event.banner_image.startsWith('http') ? event.banner_image : api.defaults.baseURL.replace('/api', '') + event.banner_image) : `https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=800&sig=${event.id}`}
                                            alt={`${event.name} thumbnail`}
                                            loading="lazy"
                                        />
                                        <div
                                            className="event-mini-tag"
                                            style={{
                                                backgroundColor: event.tag_color || 'var(--primary-green)',
                                                boxShadow: `0 10px 30px -5px ${event.tag_color || 'var(--primary-green)'}66`
                                            }}
                                        >
                                            {(event.status === 'Live' || event.is_featured) && <span className="tag-live-dot" />}
                                            {event.status || event.tag || 'Upcoming'}
                                        </div>
                                        <div className="event-mini-overlay" />
                                    </div>
                                    <div className="event-mini-content">
                                        <div className="event-mini-header">
                                            <span className="mission-id">MISSION_ARCHIVE // 0{event.id}</span>
                                            <h3>{event.name}</h3>
                                        </div>
                                        <p className="event-mini-desc">{event.description}</p>
                                        <div className="event-mini-meta">
                                            <span><Calendar size={14} aria-hidden="true" /> {event.event_date}</span>
                                            <span><Clock size={14} aria-hidden="true" /> {event.event_time || 'TBD'}</span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="event-mini-btn"
                                            onClick={() => navigate(`/register/${event.id}`)}
                                            aria-label={`Register for ${event.name}`}
                                        >
                                            {event.cta_text || 'Secure Seat'} <ArrowRight size={16} />
                                        </motion.button>
                                    </div>
                                    <div className="card-shine" />
                                </motion.article>
                            ))}
                        </div>
                    </motion.section>
                )}

                <div className="minimal-footer">
                    <p>© 2026 {content.website_name || 'GENSAAS'} • Secure Event Ecosystem</p>
                </div>
            </div>

            {/* Elegant Background Elements */}
            <div className="minimal-bg-glow" />
            <div className="minimal-grid" />
        </div>
    );
};

export default LandingPage;
