-- ============================================================
-- GenSaas Events - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS gensaas_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gensaas_events;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(150) NOT NULL,
    role        ENUM('superadmin','admin') DEFAULT 'admin',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users (Attendees)
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    photo_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    event_date      VARCHAR(100) NOT NULL,
    event_time      VARCHAR(50),
    location        VARCHAR(255) DEFAULT 'Virtual',
    speaker         VARCHAR(150),
    capacity        INT DEFAULT 1000,
    tag             VARCHAR(100),
    tag_color       VARCHAR(20) DEFAULT '#00ff88',
    banner_image    VARCHAR(500),
    gradient        VARCHAR(255) DEFAULT 'linear-gradient(135deg, #002211 0%, #001a0d 100%)',
    event_type      ENUM('Online', 'Offline') DEFAULT 'Online',
    event_status    ENUM('Live', 'Upcoming', 'Completed') DEFAULT 'Upcoming',
    is_visible      BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    slide_order     INT DEFAULT 0,
    created_by      INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    event_id        INT NOT NULL,
    dietary_pref    VARCHAR(100),
    notes           TEXT,
    status          ENUM('confirmed','pending','cancelled') DEFAULT 'confirmed',
    poster_url      VARCHAR(500),
    registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_registration (user_id, event_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Speakers
CREATE TABLE IF NOT EXISTS speakers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    expertise   VARCHAR(255),
    bio         TEXT,
    image_url   VARCHAR(500),
    social_links JSON DEFAULT NULL,
    is_visible  BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registration Fields
CREATE TABLE IF NOT EXISTS registration_fields (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    event_id        INT NOT NULL,
    label           VARCHAR(255) NOT NULL,
    field_type      ENUM('text', 'number', 'dropdown', 'checkbox') DEFAULT 'text',
    is_required     BOOLEAN DEFAULT FALSE,
    field_order     INT DEFAULT 0,
    options         JSON,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    role        VARCHAR(255),
    content     TEXT,
    image_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    logo_url    VARCHAR(500),
    link_url    VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates (Poster)
CREATE TABLE IF NOT EXISTS templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    template_image  VARCHAR(500),
    logo_image      VARCHAR(500),
    congrat_message TEXT,
    name_x          INT DEFAULT 320,
    name_y          INT DEFAULT 250,
    font_size       INT DEFAULT 48,
    font_family     VARCHAR(100) DEFAULT 'Space Grotesk',
    font_color      VARCHAR(20) DEFAULT '#ffffff',
    logo_x          INT DEFAULT 50,
    logo_y          INT DEFAULT 50,
    logo_width      INT DEFAULT 120,
    accent_color    VARCHAR(20) DEFAULT '#00ff88',
    show_event_date BOOLEAN DEFAULT TRUE,
    show_logo       BOOLEAN DEFAULT TRUE,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CMS Content
CREATE TABLE IF NOT EXISTS cms_content (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    `key`       VARCHAR(100) UNIQUE NOT NULL,
    value       TEXT,
    type        ENUM('text','html','json','image') DEFAULT 'text',
    label       VARCHAR(200),
    section     VARCHAR(100),
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    event_id    INT,
    title       VARCHAR(255),
    subtitle    TEXT,
    image_url   VARCHAR(500),
    cta_text    VARCHAR(100) DEFAULT 'Register Now',
    slide_order INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Default CMS Content
INSERT INTO cms_content (`key`, value, type, label, section) VALUES
('hero_title', 'GenSaas Check-in', 'text', 'Hero Title', 'homepage'),
('hero_subtitle', 'Secure biometric registration for next-gen events.', 'text', 'Hero Subtitle', 'homepage'),
('hero_cta_text', 'Get Started', 'text', 'CTA Button Text', 'homepage'),
('brand_name', 'GenSaas', 'text', 'Brand Name', 'branding')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- Default Template
INSERT INTO templates (name, congrat_message, is_default) VALUES
('Default Template', 'We look forward to seeing you at the event! Your registration is confirmed.', TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- Seed Data (Initial Event)
INSERT INTO events (id, name, description, event_date, event_time, location, speaker, tag, tag_color, gradient, is_visible, is_featured) VALUES
(1, 'AI Summit 2026', 'The biggest AI conference in Asia.', 'Mar 15, 2026', '10:00 AM', 'Bangalore, India', 'Dr. Sarah Chen', 'Technology', '#00ff88', 'linear-gradient(135deg, #001a0d 0%, #001108 100%)', 1, 1)
ON DUPLICATE KEY UPDATE name = name;

-- Seed Data (Initial Slide)
INSERT INTO hero_slides (event_id, title, subtitle, cta_text, slide_order, is_active) VALUES
(1, 'AI Summit 2026', 'Join 1,200+ founders and engineers for a day of innovation.', 'Register Free', 0, 1)
ON DUPLICATE KEY UPDATE title = title;
