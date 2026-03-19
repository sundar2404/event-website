-- ============================================================
-- GENSAAS EVENTS - ENHANCED DUMMY DATA (V2)
-- Purpose: Professional data for speakers, global events, and 30-day registration history for rich analytics.
-- ============================================================

USE gensaas_events;

-- 1. CLEAR EXISTING DATA (Optional - Clean slate for better demonstration)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE registrations;
TRUNCATE TABLE registration_fields;
TRUNCATE TABLE hero_slides;
TRUNCATE TABLE events;
TRUNCATE TABLE users;
TRUNCATE TABLE speakers;
TRUNCATE TABLE testimonials;
TRUNCATE TABLE sponsors;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. PROFESSIONAL SPEAKERS
INSERT INTO speakers (id, name, expertise, bio, is_visible) VALUES
(1, 'Dr. Aris Thorne', 'Quantum Computing & AI', 'Lead researcher at Neuralink Labs with 20+ years in neural networks and quantum algorithms.', 1),
(2, 'Sarah Jenkins', 'Cloud Infrastructure', 'Ex-AWS architect specializing in serverless and global scalability for Fortune 500 companies.', 1),
(3, 'Marcus Volkov', 'Cybersecurity', 'Former white-hat hacker focused on zero-day vulnerability research and blockchain security.', 1),
(4, 'Elena Rodriguez', 'Product Design (UX)', 'Design lead at Figma, pioneer of the "Human-First" design framework for SaaS platforms.', 1),
(5, 'Kenji Tanaka', 'Blockchain & Web3', 'Founder of decentralized finance protocols and advocate for programmable money.', 1);

-- 3. GLOBAL TECH MISSIONS (Events)
INSERT INTO events (id, name, description, event_date, event_time, location, speaker, capacity, tag, tag_color, event_type, event_status, is_visible, is_featured) VALUES
(10, 'Quantum AI Summit 2026', 'Unlock the potential of quantum-enhanced machine learning and the future of computation.', 'Oct 24, 2026', '10:00 AM', 'Virtual / MetaVerse', 'Dr. Aris Thorne', 5000, 'Quantum', '#a855f7', 'Online', 'Upcoming', 1, 1),
(11, 'Cloud Native Expo 2.0', 'The evolution of Kubernetes, serverless edge computing, and cloud-native observability.', 'Sep 15, 2026', '09:00 AM', 'Seattle, WA', 'Sarah Jenkins', 1200, 'Cloud', '#3b82f6', 'Offline', 'Upcoming', 1, 1),
(12, 'Cyber Defense Forum', 'Real-time live hacking demonstrations and strategic defense protocols for modern enterprises.', 'Mar 25, 2026', '01:00 PM', 'London, UK', 'Marcus Volkov', 800, 'Security', '#ef4444', 'Offline', 'Live', 1, 1),
(13, 'GenUI Design Workshop', 'Building generative interfaces that evoke emotion and drive seamless user conversion.', 'Feb 10, 2026', '11:00 AM', 'Virtual', 'Elena Rodriguez', 3000, 'Design', '#10b981', 'Online', 'Completed', 1, 0),
(14, 'Web3 Financial Future', 'How DeFi and smart contracts are restructuring the global banking and insurance systems.', 'Nov 05, 2026', '10:00 AM', 'Dubai, UAE', 'Kenji Tanaka', 1500, 'Web3', '#f59e0b', 'Offline', 'Upcoming', 1, 0);

-- 4. DUMMY USERS (ATTENDEES)
INSERT INTO users (id, name, email, phone) VALUES
(101, 'Liam Neeson', 'liam@action.com', '555-0101'),
(102, 'Emma Watson', 'emma@griffin.edu', '555-0102'),
(103, 'Robert Downey', 'tony@stark.io', '555-0103'),
(104, 'Scarlett Johansson', 'natasha@shield.gov', '555-0104'),
(105, 'Benedict Cumberbatch', 'strange@magic.org', '555-0105'),
(106, 'Zendaya Coleman', 'mj@dailybugle.com', '555-0106'),
(107, 'Tom Holland', 'peter@stark.io', '555-0107'),
(108, 'Gal Gadot', 'diana@themyscira.com', '555-0108'),
(109, 'Chris Evans', 'steve@shield.gov', '555-0109'),
(110, 'Brie Larson', 'carol@marvel.io', '555-0110');

-- 5. REGISTRATIONS & ANALYSIS DATA (Timestamps within last 30 days for trend charts)
INSERT INTO registrations (user_id, event_id, status, registered_at) VALUES
(101, 10, 'confirmed', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(102, 10, 'confirmed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(103, 11, 'confirmed', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(104, 12, 'confirmed', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(105, 12, 'pending',   DATE_SUB(NOW(), INTERVAL 12 DAY)),
(106, 13, 'confirmed', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(107, 10, 'confirmed', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(108, 14, 'confirmed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(109, 10, 'confirmed', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(110, 11, 'confirmed', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(101, 12, 'confirmed', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(102, 11, 'confirmed', DATE_SUB(NOW(), INTERVAL 20 DAY));

-- 6. DYNAMIC REGISTRATION FIELDS (FOR MISSION 10)
INSERT INTO registration_fields (event_id, label, field_type, is_required, field_order) VALUES
(10, 'Experience Level', 'dropdown', 1, 1),
(10, 'Current Role', 'text', 1, 2),
(10, 'Expectations', 'text', 0, 3);

-- 7. HERO SLIDES (HOME SLIDER)
INSERT INTO hero_slides (event_id, title, subtitle, slide_order, is_active) VALUES
(10, 'Quantum AI Summit', 'Deciphering the next era of computing.', 1, 1),
(11, 'Cloud Native 2.0', 'Scale beyond limits with edge serverless.', 2, 1),
(12, 'Cyber Defense Forum', 'Secure your perimeter at London 2026.', 3, 1);

-- 8. PREMIUM TESTIMONIALS & SPONSORS
INSERT INTO testimonials (name, role, content, is_active) VALUES
('Alex Rivers', 'Senior Dev at Google', 'The registration flow and real-time dashboard are industry-leading. Amazing posters!', 1),
('Maya Patel', 'Event Director', 'GenSaas simplified our logistics for over 5,000 attendees last month at the Design Week.', 1),
('Leo Brooks', 'CTO, FutureSys', 'I love the biometric-ready check-in concept. Very forward-thinking.', 1);

INSERT INTO sponsors (name, logo_url, link_url, is_active) VALUES
('TechNova', 'https://via.placeholder.com/150', 'https://technova.io', 1),
('CloudSphere', 'https://via.placeholder.com/150', 'https://cloudsphere.com', 1),
('InnovateLabs', 'https://via.placeholder.com/150', 'https://innovatelabs.io', 1);

-- 9. ADMIN ACCOUNT (Ensure sundar exists)
INSERT IGNORE INTO admins (user_id, email, password, full_name, role) VALUES
('sundar', 'sundar@gensaas.com', '$2b$10$YourHashedPasswordHere', 'Sundar Admin', 'superadmin');
