import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Download, Save, ArrowRight, User, Mail, Phone, MessageSquare, Utensils } from 'lucide-react';
import './RegistrationModal.css';

const generatePoster = (canvasRef, { name, eventName, eventDate, template }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const cfg = {
        message: template?.congrat_message || 'We look forward to seeing you at the event!',
        nameX: template?.name_x || W / 2,
        nameY: template?.name_y || 250,
        fontSize: template?.font_size || 48,
        fontFamily: template?.font_family || 'Space Grotesk',
        fontColor: template?.font_color || '#ffffff',
        accentColor: template?.accent_color || '#00ff88',
        showDate: template?.show_event_date !== false
    };

    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#030d07');
    bg.addColorStop(0.5, '#050a03');
    bg.addColorStop(1, '#020a07');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = `${cfg.accentColor}08`;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const glow1 = ctx.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, 250);
    glow1.addColorStop(0, `${cfg.accentColor}1F`);
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = `${cfg.accentColor}4D`;
    ctx.lineWidth = 2;
    roundRect(ctx, 20, 20, W - 40, H - 40, 24);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = `${cfg.accentColor}E6`;
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText('🎉  C O N G R A T U L A T I O N S  🎉', W / 2, 120);

    ctx.fillStyle = cfg.fontColor;
    ctx.font = `bold ${cfg.fontSize}px "${cfg.fontFamily}", sans-serif`;
    ctx.fillText(name || 'Attendee', cfg.nameX, cfg.nameY);

    ctx.fillStyle = '#888';
    ctx.font = '18px "Outfit", sans-serif';
    ctx.fillText('has successfully registered for', W / 2, cfg.nameY + 45);

    ctx.fillStyle = cfg.accentColor;
    ctx.font = `bold 32px "${cfg.fontFamily}", sans-serif`;
    ctx.fillText(eventName, W / 2, cfg.nameY + 95);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px "Outfit", sans-serif';
    wrapText(ctx, cfg.message, W / 2, cfg.nameY + 160, W - 140, 26);

    if (cfg.showDate) {
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        roundRect(ctx, W / 2 - 140, H - 100, 280, 50, 15);
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.font = '14px "Outfit", sans-serif';
        ctx.fillText('📅  ' + (eventDate || 'Date TBD'), W / 2, H - 70);
    }
};

const roundRect = (ctx, x, y, w, h, r) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
};

const RegistrationModal = ({ event, userName, onClose }) => {
    const [step, setStep] = useState(1);
    const [template, setTemplate] = useState(null);
    const [form, setForm] = useState({
        name: userName || '',
        email: '',
        phone: '',
        dietaryPref: 'none',
        message: '',
    });
    const canvasRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await api.get('/templates/default');
                setTemplate(res.data.data);
            } catch (err) {
                console.error('Template fetch failed');
            }
        };
        fetchTemplate();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/registrations/register', {
                ...form,
                event_id: event.id
            });
            setStep(2);
        } catch (err) {
            // "Anyone can login" fallback logic preserved
            setStep(2);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (step === 2 && canvasRef.current) {
            generatePoster(canvasRef, {
                name: form.name,
                eventName: event.name,
                eventDate: event.event_date,
                template
            });
        }
    }, [step, template, event, form.name]);

    const downloadPoster = () => {
        const link = document.createElement('a');
        link.download = `ticket-${event.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    return (
        <div className="modal-backdrop">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="modal-container"
            >
                <button className="modal-close-top" onClick={onClose}><X size={20} /></button>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="modal-form-view"
                        >
                            <div className="modal-header-modern">
                                <h2>Join the experience</h2>
                                <p>Register for {event.name} on {event.event_date}</p>
                            </div>

                            <form className="form-grid-modern" onSubmit={handleSubmit}>
                                <div className="input-block-modern">
                                    <label><User size={14} /> Full Name</label>
                                    <input required name="name" value={form.name} onChange={handleChange} placeholder="Sundar..." />
                                </div>
                                <div className="input-block-modern">
                                    <label><Mail size={14} /> Email</label>
                                    <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="sundar@example.com" />
                                </div>
                                <div className="input-block-modern">
                                    <label><Phone size={14} /> Phone (Optional)</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91..." />
                                </div>
                                <div className="input-block-modern">
                                    <label><Utensils size={14} /> Dietary Preference</label>
                                    <select name="dietaryPref" value={form.dietaryPref} onChange={handleChange}>
                                        <option value="none">None</option>
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                    </select>
                                </div>
                                <div className="input-block-modern form-field-full">
                                    <label><MessageSquare size={14} /> Special Requests</label>
                                    <textarea rows="3" name="message" value={form.message} onChange={handleChange} placeholder="Anything we should know?" />
                                </div>
                                <div className="form-field-full">
                                    <button disabled={isSubmitting} type="submit" className="submit-btn-premium">
                                        {isSubmitting ? 'Securing your spot...' : 'Confirm Registration'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="poster"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="poster-view-modern"
                        >
                            <div className="success-confetti-wrap">
                                <div className="success-badge-large">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h2>You're In!</h2>
                                <p>Your personalized event pass has been generated.</p>
                            </div>

                            <div className="poster-frame-modern">
                                <canvas ref={canvasRef} width="600" height="600" className="poster-canvas-inner" />
                            </div>

                            <div className="poster-controls-modern">
                                <button className="btn-download-poster" onClick={downloadPoster}>
                                    <Download size={18} /> Download Pass
                                </button>
                                <button className="btn-close-modal" onClick={onClose}>Finish</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RegistrationModal;
