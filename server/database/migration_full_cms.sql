-- Migration for Expanded CMS Features
USE gensaas_events;

-- 1. Update events table
ALTER TABLE events 
ADD COLUMN registration_limit INT DEFAULT 1000,
ADD COLUMN registration_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- 2. Registration Custom Fields
CREATE TABLE IF NOT EXISTS registration_fields (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_id    INT,
    label       VARCHAR(100) NOT NULL,
    field_type  ENUM('text', 'number', 'email', 'dropdown', 'checkbox') DEFAULT 'text',
    is_required BOOLEAN DEFAULT FALSE,
    field_order INT DEFAULT 0,
    field_options TEXT, -- JSON string for dropdowns
    is_enabled  BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 3. Store Custom Field Values in registrations (JSON approach)
ALTER TABLE registrations
ADD COLUMN custom_data JSON;

-- 4. Analytics: Add indexes for better queries
CREATE INDEX idx_registered_at ON registrations(registered_at);

-- 5. Expand templates table for Poster CMS
ALTER TABLE templates
ADD COLUMN text_alignment ENUM('left', 'center', 'right') DEFAULT 'center';

-- 6. Insert new CMS content placeholders if they don't exist
INSERT IGNORE INTO cms_content (`key`, value, type, label, section) VALUES
('website_name', 'GenSaas Events', 'text', 'Website Name', 'general'),
('website_logo', '', 'image', 'Website Logo', 'general'),
('favicon', '', 'image', 'Favicon', 'general'),
('primary_color', '#00ff88', 'text', 'Primary Color', 'style'),
('secondary_color', '#001a0d', 'text', 'Secondary Color', 'style'),
('footer_content', '© 2026 GenSaas Events. All rights reserved.', 'text', 'Footer Content', 'general'),
('contact_email', 'hello@gensaas.com', 'text', 'Contact Email', 'general'),
('contact_phone', '+1 234 567 890', 'text', 'Contact Phone', 'general'),
('social_linkedin', '', 'text', 'LinkedIn URL', 'social'),
('social_twitter', '', 'text', 'Twitter URL', 'social'),
('seo_title', 'GenSaas Events - Book Your Spot', 'text', 'SEO Title', 'seo'),
('seo_description', 'The premier platform for next-gen webinar registration.', 'text', 'SEO Description', 'seo'),
('seo_keywords', 'webinar, tech, events, gensaas', 'text', 'Meta Keywords', 'seo'),
('section_hero_enabled', 'true', 'text', 'Hero Section Enabled', 'homepage'),
('section_about_enabled', 'true', 'text', 'About Section Enabled', 'homepage'),
('section_events_enabled', 'true', 'text', 'Events Section Enabled', 'homepage'),
('about_title', 'About GenSaas Events', 'text', 'About Title', 'homepage'),
('about_content', 'We provide the best event experience with modern tech.', 'text', 'About Content', 'homepage'),
('about_image', '', 'image', 'About Image', 'homepage'),
('welcome_message', 'Welcome to the future of event check-ins.', 'text', 'Welcome Message', 'homepage');

-- 7. Create table for Sponsors and Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(100),
    content     TEXT NOT NULL,
    image_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    logo_url    VARCHAR(500) NOT NULL,
    link_url    VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
