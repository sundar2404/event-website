USE gensaas_events;

-- Clear existing data (Optional, but helps in clean re-runs during development)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE registrations;
-- TRUNCATE TABLE hero_slides;
-- TRUNCATE TABLE events;
-- TRUNCATE TABLE users;
-- TRUNCATE TABLE admins;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Admins
INSERT IGNORE INTO admins (user_id, email, password, full_name, role) VALUES
('admin01', 'admin@gensaas.com', '$2b$10$YourHashedPasswordHere', 'Super Admin', 'superadmin'),
('staff01', 'staff@gensaas.com', '$2b$10$YourHashedPasswordHere', 'Event Coordinator', 'admin');

-- 2. Insert Diverse Events
INSERT IGNORE INTO events (id, name, description, event_date, event_time, location, speaker, capacity, tag, tag_color, event_type, event_status, is_visible, is_featured) VALUES
(2, 'Next-Gen Frontend 2026', 'Master React, Vue, and Svelte in this deep dive.', 'May 20, 2026', '10:00 AM', 'Virtual', 'Sarah Drasner', 1000, 'Frontend', '#61dafb', 'Online', 'Upcoming', 1, 1),
(3, 'Cloud Native Expo', 'Scaling applications with Kubernetes and Serverless.', 'June 15, 2026', '09:00 AM', 'Seattle, WA', 'Kelsey Hightower', 500, 'Cloud', '#326ce5', 'Offline', 'Live', 1, 1),
(4, 'Cybersecurity Forum', 'Defense against modern threats and zero-day exploits.', 'July 10, 2026', '01:00 PM', 'San Jose, CA', 'Kevin Mitnick', 300, 'Security', '#ff3333', 'Offline', 'Upcoming', 1, 0),
(5, 'Data Science Workshop', 'Practical Machine Learning with Python and TensorFlow.', 'Feb 10, 2026', '11:00 AM', 'Virtual', 'Andrew Ng', 2000, 'Data Science', '#ffcc00', 'Online', 'Completed', 1, 0),
(6, 'UX Design Sprint', 'Rapid prototyping and user testing workshops.', 'Aug 05, 2026', '10:00 AM', 'Austin, TX', 'Don Norman', 150, 'Design', '#ff00ff', 'Offline', 'Upcoming', 1, 0);

-- 3. Insert Users (Attendees)
INSERT IGNORE INTO users (id, name, email, phone) VALUES
(1, 'John Smith', 'john.smith@example.com', '123-456-7890'),
(2, 'Emma Wilson', 'emma.wilson@example.com', '234-567-8901'),
(3, 'Michael Brown', 'michael.brown@testmail.org', '345-678-9012'),
(4, 'Sophia Garcia', 'sophia.g@webmail.com', '456-789-0123'),
(5, 'David Chen', 'dchen@techcorp.io', '567-890-1234');

-- 4. Insert Registrations
INSERT IGNORE INTO registrations (user_id, event_id, dietary_pref, status) VALUES
(1, 2, 'None', 'confirmed'),
(1, 3, 'Vegetarian', 'confirmed'),
(2, 2, 'Vegan', 'confirmed'),
(3, 4, 'None', 'pending'),
(4, 5, 'Gluten-Free', 'confirmed'),
(5, 3, 'None', 'confirmed');

-- 5. Insert Hero Slides for Featured Events
INSERT IGNORE INTO hero_slides (event_id, title, subtitle, slide_order) VALUES
(2, 'Next-Gen Frontend 2026', 'The future of UI development is here.', 1),
(3, 'Cloud Native Expo', 'The biggest cloud infrastructure event of the year.', 2);

-- 6. Insert Dummy Speakers (Transitioning to separate table)
INSERT IGNORE INTO speakers (id, name, expertise, bio) VALUES
(1, 'Sarah Drasner', 'Frontend & Engineering Management', 'Expert in web animations and SVG.'),
(2, 'Kelsey Hightower', 'Cloud Native & Kubernetes', 'Advocate for open source and distributed systems.'),
(3, 'Kevin Mitnick', 'Cybersecurity', 'The world\'s most famous hacker.'),
(4, 'Andrew Ng', 'Artificial Intelligence', 'Co-founder of Coursera and Stanford professor.');

-- 7. Insert Dummy Registration Fields (for Event ID 2)
INSERT IGNORE INTO registration_fields (event_id, label, field_type, is_required) VALUES
(2, 'Job Role', 'text', 1),
(2, 'Experience Level', 'dropdown', 1),
(2, 'How did you hear about us?', 'dropdown', 0);

-- 8. Insert Dummy Testimonials
INSERT IGNORE INTO testimonials (name, role, content) VALUES
('Alex Rivera', 'Senior Developer', 'The best tech event platform I have ever used. Seamless registration!'),
('Maya Patel', 'Product Designer', 'The posters generated for each attendee are a nice touch. Very professional.'),
('Leo Brooks', 'Student', 'Learned so much from the AI summit last year. Highly recommended.');

-- 9. Insert Dummy Sponsors
INSERT IGNORE INTO sponsors (name, logo_url, link_url) VALUES
('Tech Giant', 'https://via.placeholder.com/150', 'https://example.com/tech-giant'),
('Innovate Labs', 'https://via.placeholder.com/150', 'https://example.com/innovate'),
('Future Systems', 'https://via.placeholder.com/150', 'https://example.com/future');

-- 10. Update CMS Content for Branding
INSERT INTO cms_content (`key`, value, type, label, section) VALUES
('footer_text', '© 2026 GenSaas Events. All rights reserved.', 'text', 'Footer Copyright', 'footer')
ON DUPLICATE KEY UPDATE value = VALUES(value);



