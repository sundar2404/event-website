import React, { useState } from 'react';
import { 
    Mic, MicOff, Video, VideoOff, PhoneOff, Settings, 
    Users, MessageSquare, Shield, Share, MoreVertical,
    LayoutGrid, Maximize, Disc, Play, Clock
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import './LiveSession.css';

const LiveSession = ({ event, attendeeName, onExit }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // chat, users
    const [messages, setMessages] = useState([
        { id: 1, user: 'System', text: `Welcome to ${event.event_name}! The session will begin shortly.`, time: '10:00 AM' },
        { id: 2, user: 'Host (Admin)', text: 'Hello everyone! Glad to see you all here.', time: '10:01 AM' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msg = {
            id: Date.now(),
            user: attendeeName || 'You',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <motion.div 
            className="ls-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <header className="ls-header">
                <div className="ls-header-left">
                    <div className="ls-live-badge">
                        <span className="ls-live-dot" />
                        LIVE
                    </div>
                    <h2 className="ls-event-title">{event.event_name}</h2>
                    <div className="ls-header-divider" />
                    <div className="ls-timer">
                        <Clock size={14} />
                        <span>01:24:45</span>
                    </div>
                </div>

                <div className="ls-header-right">
                    <button className={`ls-tool-btn ${isRecording ? 'active' : ''}`} onClick={() => setIsRecording(!isRecording)}>
                        <Disc size={18} className={isRecording ? 'recording-spin' : ''} />
                        <span>{isRecording ? 'Recording...' : 'Record'}</span>
                    </button>
                    <div className="ls-attendees-count">
                        <Users size={18} />
                        <span>124 participants</span>
                    </div>
                </div>
            </header>

            <div className="ls-layout">
                {/* Main Video Area */}
                <main className="ls-video-area">
                    <div className="ls-video-wrapper">
                        {/* Speaker Video (Mock) */}
                        <div className="ls-main-video">
                            <img 
                                src={event.banner_image ? `http://localhost:5000${event.banner_image}` : 'https://images.unsplash.com/photo-1540575861501-7ad05823c94b?auto=format&fit=crop&q=80&w=1200'} 
                                alt="Presentation" 
                                className="ls-presentation-img"
                            />
                            <div className="ls-speaker-overlay">
                                <div className="ls-speaker-thumb">
                                    <img src="https://ui-avatars.com/api/?name=Host&background=00ff88&color=0a0a0a" alt="Host" />
                                    <span>Host Speaking</span>
                                </div>
                            </div>
                        </div>

                        {/* Self View */}
                        <div className="ls-self-view">
                            {!isCameraOff ? (
                                <div className="ls-self-video-placeholder">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(attendeeName)}&background=0a0a0a&color=00ff88&bold=true`} alt="Self" />
                                    <div className="ls-self-name">You ({attendeeName})</div>
                                </div>
                            ) : (
                                <div className="ls-self-off">
                                    <VideoOff size={32} />
                                    <span>Camera Off</span>
                                </div>
                            )}
                        </div>

                        {/* Floating Controls */}
                        <div className="ls-controls">
                            <button 
                                className={`ls-ctrl-btn ${isMuted ? 'danger' : ''}`} 
                                onClick={() => setIsMuted(!isMuted)}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                            </button>
                            <button 
                                className={`ls-ctrl-btn ${isCameraOff ? 'danger' : ''}`} 
                                onClick={() => setIsCameraOff(!isCameraOff)}
                                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                            >
                                {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                            </button>
                            <button className="ls-ctrl-btn" title="Share Screen">
                                <Share size={22} />
                            </button>
                            <button className="ls-ctrl-btn" title="Layout Settings">
                                <LayoutGrid size={22} />
                            </button>
                            <div className="ls-ctrl-divider" />
                            <button className="ls-leave-btn" onClick={onExit}>
                                <PhoneOff size={22} />
                                <span>Leave Session</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Sidebar (Chat / Participants) */}
                <aside className="ls-sidebar">
                    <div className="ls-sidebar-tabs">
                        <button 
                            className={`ls-tab ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <MessageSquare size={18} />
                            Chat
                        </button>
                        <button 
                            className={`ls-tab ${activeTab === 'participants' ? 'active' : ''}`}
                            onClick={() => setActiveTab('participants')}
                        >
                            <Users size={18} />
                            Participants
                        </button>
                    </div>

                    <div className="ls-sidebar-content">
                        {activeTab === 'chat' && (
                            <div className="ls-chat-container">
                                <div className="ls-messages">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`ls-msg ${msg.user === attendeeName ? 'ls-msg-self' : ''}`}>
                                            <div className="ls-msg-header">
                                                <span className="ls-msg-user">{msg.user}</span>
                                                <span className="ls-msg-time">{msg.time}</span>
                                            </div>
                                            <p className="ls-msg-text">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form className="ls-input-area" onSubmit={handleSendMessage}>
                                    <input 
                                        type="text" 
                                        placeholder="Send a message to everyone" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" className="ls-send-btn">
                                        <Play size={14} fill="currentColor" />
                                    </button>
                                </form>
                            </div>
                        )}
                        {activeTab === 'participants' && (
                            <div className="ls-participants-list">
                                <div className="ls-participant">
                                    <img src="https://ui-avatars.com/api/?name=Host&background=00ff88&color=0a0a0a" alt="" />
                                    <div className="ls-p-info">
                                        <span className="ls-p-name">Host (Admin)</span>
                                        <span className="ls-p-role">Organizer</span>
                                    </div>
                                    <Shield size={14} className="ls-p-shield" />
                                </div>
                                <div className="ls-participant">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(attendeeName)}&background=0a0a0a&color=00ff88&bold=true`} alt="" />
                                    <div className="ls-p-info">
                                        <span className="ls-p-name">{attendeeName} (You)</span>
                                        <span className="ls-p-role">Attendee</span>
                                    </div>
                                </div>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="ls-participant">
                                        <img src={`https://ui-avatars.com/api/?name=User+${i+1}&background=222&color=888`} alt="" />
                                        <div className="ls-p-info">
                                            <span className="ls-p-name">Attendee {i+1}</span>
                                            <span className="ls-p-role">Guest</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};

export default LiveSession;
