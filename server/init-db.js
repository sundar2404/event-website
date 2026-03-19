const db = require('./config/db');

async function init() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS speakers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                expertise VARCHAR(255),
                bio TEXT,
                image_url VARCHAR(255),
                social_links JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Speakers table created/verified.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating speakers table:', err);
        process.exit(1);
    }
}

init();
