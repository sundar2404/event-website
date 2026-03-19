const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'gensaas_events',
}).promise();

async function migrate() {
    try {
        console.log('Adding event_status column...');
        await pool.execute("ALTER TABLE events ADD COLUMN event_status ENUM('Live', 'Upcoming', 'Completed') DEFAULT 'Upcoming' AFTER event_type");
        console.log('Done: event_status column added.');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Skipped: Column already exists.');
            process.exit(0);
        }
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
