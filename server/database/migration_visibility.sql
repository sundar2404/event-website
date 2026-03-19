-- Migration to add is_visible to speakers table
USE gensaas_events;

-- Ensure is_visible exists on speakers
SET @dbname = 'gensaas_events';
SET @tablename = 'speakers';
SET @columnname = 'is_visible';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE speakers ADD COLUMN is_visible BOOLEAN DEFAULT TRUE'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure is_visible exists on events (should exist but to be safe)
SET @tablename = 'events';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE events ADD COLUMN is_visible BOOLEAN DEFAULT TRUE'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
