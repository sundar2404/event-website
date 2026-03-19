-- ============================================================
-- Fix Migration: Add missing columns to events table
-- Run this in phpMyAdmin → gensaas_events → SQL tab
-- ============================================================

USE gensaas_events;

-- Add event_type column (Online / Offline)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS event_type ENUM('Online', 'Offline') DEFAULT 'Online'
        AFTER gradient;

-- Add event_status column (Live / Upcoming / Completed)
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS event_status ENUM('Live', 'Upcoming', 'Completed') DEFAULT 'Upcoming'
        AFTER event_type;

-- Set default values for any existing rows
UPDATE events SET event_type   = 'Online'   WHERE event_type   IS NULL;
UPDATE events SET event_status = 'Upcoming' WHERE event_status IS NULL;

-- Make sure hero_slides table exists (required for featured events)
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

-- Confirm changes
SELECT 'Migration applied successfully!' AS status;
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'gensaas_events'
  AND TABLE_NAME   = 'events'
  AND COLUMN_NAME IN ('event_type', 'event_status');
