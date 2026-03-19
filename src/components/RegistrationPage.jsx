import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle2, Download, ArrowLeft, ArrowRight,
    User, Mail, Phone, MessageSquare, Utensils, Calendar, MapPin, Clock, ShieldCheck
} from 'lucide-react';
import './RegistrationPage.css';

const RegistrationPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [template, setTemplate] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: location.state?.userName || '',
        email: location.state?.userEmail || '',
        phone: '',
        dietaryPref: 'none',
        message: '',
    });
    const [customData, setCustomData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const canvasRef = useRef(null);
    const [posterGenerated, setPosterGenerated] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, fieldsRes, templateRes] = await Promise.all([
                    api.get(`/events/${eventId}`),
                    api.get(`/registration-fields/${eventId}`),
                    api.get('/templates/default')
                ]);
                setEvent(eventRes.data.data);
                setTemplate(templateRes.data.data);
                setDynamicFields(fieldsRes.data.data || []);
            } catch (err) {
                console.error('Fetch failed', err);
                navigate('/dashboard');
            }
        };
        fetchData();
    }, [eventId, navigate]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleCustomChange = (label, val) => setCustomData({ ...customData, [label]: val });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/registrations/register', {
                ...form,
                event_id: eventId,
                dietary_pref: form.dietaryPref,
                notes: form.message,
                custom_data: JSON.stringify(customData)
            });
            setStep(2);
        } catch (err) {
            console.error('Registration failed', err);
            setStep(2);
        } finally {
            setIsSubmitting(false);
        }
    };

    const drawPoster = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || !template || !event) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        // Configuration
        const cfg = {
            message: template.congrat_message || 'Thank you for registering!',
            nameX: template.name_x || W / 2,
            nameY: template.name_y || 250,
            fontSize: template.font_size || 48,
            fontFamily: template.font_family || 'Space Grotesk',
            fontColor: template.font_color || '#ffffff',
            accentColor: template.accent_color || '#00ff88',
            logoX: template.logo_x || 50,
            logoY: template.logo_y || 50,
            logoWidth: template.logo_width || 120,
            showLogo: template.show_logo,
            showDate: template.show_event_date
        };

        // Load images
        const loadImage = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src.startsWith('http') ? src : `http://localhost:5000${src}`;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Image load failed: ' + src));
        });

        try {
            // Draw Background
            if (template.template_image) {
                const bgImg = await loadImage(template.template_image);
                ctx.drawImage(bgImg, 0, 0, W, H);
            } else {
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(0, 0, W, H);
                // Add some default techy style if no image
                ctx.strokeStyle = `${cfg.accentColor}22`;
                for (let i = 0; i < W; i += 50) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
                }
            }

            // Draw Logo
            if (cfg.showLogo && template.logo_image) {
                const logoImg = await loadImage(template.logo_image);
                const aspect = logoImg.height / logoImg.width;
                ctx.drawImage(logoImg, cfg.logoX, cfg.logoY, cfg.logoWidth, cfg.logoWidth * aspect);
            }

            // Text Styles
            ctx.textAlign = 'center';

            // Name
            ctx.fillStyle = cfg.fontColor;
            ctx.font = `bold ${cfg.fontSize}px "${cfg.fontFamily}", sans-serif`;
            ctx.fillText(form.name.toUpperCase(), cfg.nameX, cfg.nameY);

            // Congrat Message
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = `20px "${cfg.fontFamily}", sans-serif`;
            const lines = wrapText(ctx, cfg.message, W - 200);
            lines.forEach((line, i) => {
                ctx.fillText(line, W / 2, cfg.nameY + 60 + (i * 30));
            });

            // Event Details
            ctx.fillStyle = cfg.accentColor;
            ctx.font = `bold 30px "${cfg.fontFamily}", sans-serif`;
            ctx.fillText(event.name, W / 2, H - 120);

            if (cfg.showDate) {
                ctx.fillStyle = '#888';
                ctx.font = `18px "${cfg.fontFamily}", sans-serif`;
                ctx.fillText(`${event.event_date} | ${event.location || 'Virtual'}`, W / 2, H - 80);
            }

            setPosterGenerated(true);
        } catch (err) {
            console.error('Poster drawing error:', err);
            // Fallback: draw basic poster even if images fail
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#fff';
            ctx.font = '30px serif';
            ctx.fillText('Registration Confirmed: ' + form.name, W / 2, H / 2);
        }
    }, [template, event, form.name]);

    const wrapText = (ctx, text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    useEffect(() => {
        if (step === 2 && template && event && !posterGenerated) {
            drawPoster();
        }
    }, [step, template, event, drawPoster, posterGenerated]);

    const downloadPoster = () => {
        const link = document.createElement('a');
        link.download = `Pass-${event?.name}-${form.name}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    if (!event) return <div className="loading-full">Loading System...</div>;

    return (
        <div className="registration-page-root">
            <div className="reg-background-glow">
                <div className="glow-c spot-1" style={{ '--c': event.tag_color }} />
                <div className="glow-c spot-2" style={{ '--c': '#4a11ff' }} />
            </div>

            <nav className="reg-nav">
                <Link to="/dashboard" className="back-link">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <div className="reg-logo-mini"><span>G</span>ENSAAS</div>
            </nav>

            <main className="reg-container">
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="reg-card glass-morph"
                        >
                            <div className="reg-split">
                                <div className="reg-info-side">
                                    <div className="reg-tag" style={{ border: `1px solid ${event.tag_color}44`, color: event.tag_color }}>
                                        {event.tag} • MISSION
                                    </div>
                                    <h1>{event.name}</h1>
                                    <div className="reg-meta-stack">
                                        <div className="m-item"><Calendar size={18} /> <span>{event.event_date}</span></div>
                                        <div className="m-item"><Clock size={18} /> <span>{event.event_time || '10:00 AM'}</span></div>
                                        <div className="m-item"><MapPin size={18} /> <span>{event.location}</span></div>
                                    </div>
                                    <p className="reg-desc">{event.description}</p>
                                    <div className="reg-benefits">
                                        <div className="b-item"><ShieldCheck size={16} /> Biometric Verified</div>
                                        <div className="b-item"><ShieldCheck size={16} /> VIP Access Included</div>
                                    </div>
                                </div>

                                <div className="reg-form-side">
                                    <div className="form-header">
                                        <h2>Reserve Your Spot</h2>
                                        <p>Secure your participation in seconds.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="premium-form">
                                        <div className="p-input-group">
                                            <div className="p-field">
                                                <label><User size={14} /> Full Name</label>
                                                <input required name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                                            </div>
                                            <div className="p-field">
                                                <label><Mail size={14} /> Email Address</label>
                                                <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                                            </div>
                                        </div>

                                        <div className="p-input-group">
                                            <div className="p-field">
                                                <label><Phone size={14} /> Phone Number</label>
                                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91..." />
                                            </div>
                                            <div className="p-field">
                                                <label><Utensils size={14} /> Special Needs</label>
                                                <select name="dietaryPref" value={form.dietaryPref} onChange={handleChange}>
                                                    <option value="none">Standard Entry</option>
                                                    <option value="veg">Vegetarian</option>
                                                    <option value="vegan">Vegan Entry</option>
                                                </select>
                                            </div>
                                        </div>

                                        {dynamicFields.map((f, idx) => (
                                            <div key={idx} className="p-field">
                                                <label>{f.label} {f.is_required ? '*' : ''}</label>
                                                {f.field_type === 'dropdown' ? (
                                                    <select required={f.is_required} onChange={e => handleCustomChange(f.label, e.target.value)}>
                                                        <option value="">-- Select --</option>
                                                        {JSON.parse(f.field_options || '[]').map((opt, oi) => (
                                                            <option key={oi} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : f.field_type === 'checkbox' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input type="checkbox" onChange={e => handleCustomChange(f.label, e.target.checked)} />
                                                        <label style={{ margin: 0 }}>{f.label}</label>
                                                    </div>
                                                ) : (
                                                    <input required={f.is_required} placeholder={f.label} onChange={e => handleCustomChange(f.label, e.target.value)} />
                                                )}
                                            </div>
                                        ))}

                                        <div className="p-field">
                                            <label><MessageSquare size={14} /> Additional Notes</label>
                                            <textarea rows="3" name="message" value={form.message} onChange={handleChange} placeholder="Anything we should know?" />
                                        </div>

                                        <button type="submit" className="reg-submit-btn" disabled={isSubmitting}>
                                            {isSubmitting ? 'Verifying Identity...' : 'Confirm Registration'} <ArrowRight size={20} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="conf-view"
                        >
                            <div className="conf-header">
                                <CheckCircle2 size={64} className="conf-icon" />
                                <h1>Congratulations, {form.name.split(' ')[0]}!</h1>
                                <p>You are officially registered for {event.name}.</p>
                            </div>

                            <div className="poster-container">
                                <div className="poster-wrapper">
                                    <canvas ref={canvasRef} width="800" height="800" className="final-canvas" />
                                    <div className="canvas-scanner-effect" />
                                </div>
                                <div className="poster-actions">
                                    <button onClick={downloadPoster} className="action-download">
                                        <Download size={20} /> Download Personal Pass
                                    </button>
                                    <Link to="/dashboard" state={{ userName: form.name, userEmail: form.email, activeTab: 'registrations' }} className="action-finish">Return to Dashboard</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default RegistrationPage;
