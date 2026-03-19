const mockData = {
    events: [
        {
            id: 10,
            name: 'Quantum AI Summit 2026',
            description: 'Unlock the potential of quantum-enhanced machine learning and the future of computation.',
            event_date: 'Oct 24, 2026',
            event_time: '10:00 AM',
            location: 'Virtual / MetaVerse',
            speaker: 'Dr. Aris Thorne',
            capacity: 5000,
            tag: 'Quantum',
            tag_color: '#a855f7',
            event_type: 'Online',
            event_status: 'Upcoming',
            is_visible: 1,
            is_featured: 1
        },
        {
            id: 11,
            name: 'Cloud Native Expo 2.0',
            description: 'The evolution of Kubernetes, serverless edge computing, and cloud-native observability.',
            event_date: 'Sep 15, 2026',
            event_time: '09:00 AM',
            location: 'Seattle, WA',
            speaker: 'Sarah Jenkins',
            capacity: 1200,
            tag: 'Cloud',
            tag_color: '#3b82f6',
            event_type: 'Offline',
            event_status: 'Upcoming',
            is_visible: 1,
            is_featured: 1
        },
        {
            id: 12,
            name: 'Cyber Defense Forum',
            description: 'Real-time live hacking demonstrations and strategic defense protocols for modern enterprises.',
            event_date: 'Mar 25, 2026',
            event_time: '01:00 PM',
            location: 'London, UK',
            speaker: 'Marcus Volkov',
            capacity: 800,
            tag: 'Security',
            tag_color: '#ef4444',
            event_type: 'Offline',
            event_status: 'Live',
            is_visible: 1,
            is_featured: 1
        },
        {
            id: 13,
            name: 'GenUI Design Workshop',
            description: 'Building generative interfaces that evoke emotion and drive seamless user conversion.',
            event_date: 'Feb 10, 2026',
            event_time: '11:00 AM',
            location: 'Virtual',
            speaker: 'Elena Rodriguez',
            capacity: 3000,
            tag: 'Design',
            tag_color: '#10b981',
            event_type: 'Online',
            event_status: 'Completed',
            is_visible: 1,
            is_featured: 0
        }
    ],
    speakers: [
        { id: 1, name: 'Dr. Aris Thorne', expertise: 'Quantum Computing & AI', bio: 'Lead researcher at Neuralink Labs with 20+ years in neural networks.', is_visible: 1 },
        { id: 2, name: 'Sarah Jenkins', expertise: 'Cloud Infrastructure', bio: 'Ex-AWS architect specializing in serverless and global scalability.', is_visible: 1 },
        { id: 3, name: 'Marcus Volkov', expertise: 'Cybersecurity', bio: 'Former white-hat hacker focused on zero-day vulnerability research.', is_visible: 1 },
        { id: 4, name: 'Elena Rodriguez', expertise: 'Product Design (UX)', bio: 'Design lead at Figma, pioneer of the Human-First design framework.', is_visible: 1 }
    ],
    registrations: [
        { id: 1, user_name: 'Liam Neeson', event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString(), status: 'confirmed' },
        { id: 2, user_name: 'Emma Watson', event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString(), status: 'confirmed' },
        { id: 3, user_name: 'Robert Downey', event_name: 'Cloud Native Expo 2.0', registered_at: new Date().toISOString(), status: 'confirmed' }
    ],
    analytics: {
        totalRegistrations: 1540,
        totalUsers: 890,
        totalEvents: 12,
        upcomingEvents: 5,
        completedEvents: 7,
        dailyTrends: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 50) + 10
        })),
        eventDistribution: [
            { name: 'Quantum AI', registrations: 450 },
            { name: 'Cloud Native', registrations: 380 },
            { name: 'Cyber Defense', registrations: 310 },
            { name: 'GenUI Design', registrations: 280 },
            { name: 'Web3 Future', registrations: 120 }
        ],
        recentActivity: [
            { id: 1, user_name: 'Liam Neeson', event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString() },
            { id: 2, user_name: 'Emma Watson', event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString() },
            { id: 3, user_name: 'Robert Downey', event_name: 'Cloud Native Expo 2.0', registered_at: new Date().toISOString() }
        ]
    },
    users: [
        { id: 101, name: 'Liam Neeson', email: 'liam@action.com', phone: '555-0101', is_active: 1, event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString() },
        { id: 102, name: 'Emma Watson', email: 'emma@griffin.edu', phone: '555-0102', is_active: 1, event_name: 'Quantum AI Summit 2026', registered_at: new Date().toISOString() },
        { id: 103, name: 'Robert Downey', email: 'tony@stark.io', phone: '555-0103', is_active: 1, event_name: 'Cloud Native Expo 2.0', registered_at: new Date().toISOString() }
    ],
    cms: {
        website_name: 'GenSaas Events',
        hero_title: 'Future of Events',
        hero_subtitle: 'Secure biometric registration for next-gen missions.',
        hero_cta_text: 'Join Mission',
        primary_color: '#00ff88',
        secondary_color: '#001a0d'
    },
    templates: {
        default: {
            id: 1,
            name: 'Default Template',
            congrat_message: 'Welcome to the mission, {{name}}! Your spot for {{event_name}} is secured.',
            name_x: 400,
            name_y: 300,
            font_size: 48,
            font_family: 'Space Grotesk',
            font_color: '#ffffff',
            accent_color: '#00ff88',
            show_logo: true,
            show_event_date: true
        }
    }
};

export default mockData;
