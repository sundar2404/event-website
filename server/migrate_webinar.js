require('dotenv').config();
const db = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        await db.execute(`ALTER TABLE events ADD COLUMN IF NOT EXISTS status ENUM('Upcoming', 'Live', 'Completed') DEFAULT 'Upcoming'`);
        console.log('Added status column');

        await db.execute(`ALTER TABLE events ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100) DEFAULT 'Register Now'`);
        console.log('Added cta_text column');

        // Insert dummy data if only 1 event exists (the seeded one)
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM events');
        if (rows[0].count <= 1) {
            console.log('Inserting dummy events...');
            const dummyEvents = [
                ['Cloud Native Architecture 2026', 'Master the art of building scalable cloud solutions with Kubernetes and Docker.', 'Apr 10, 2026', '02:00 PM', 'Virtual', 'Marcus Aurelius', 'Cloud', '#3498db', '/uploads/event_cloud.jpg', 0, 'Upcoming', 'Secure Seat'],
                ['CyberSecurity Protocols', 'Learn the latest defenses against modern cyber threats in this intensive webinar.', 'May 22, 2026', '11:00 AM', 'Singapore', 'Elena Troy', 'Security', '#e74c3c', '/uploads/event_sec.jpg', 1, 'Live', 'Join Mission'],
                ['Frontend Mastery: React 19', 'Deep dive into the new features of React 19 and the future of web development.', 'Jun 05, 2026', '04:00 PM', 'San Francisco', 'Dan Abramov', 'Development', '#61dafb', '/uploads/event_react.jpg', 0, 'Upcoming', 'Register Now'],
                ['Data Science with Python', 'From zero to hero in data analysis and visualization using Pandas and Matplotlib.', 'Jul 12, 2026', '09:00 AM', 'Berlin', 'Sarah Connor', 'Data', '#f1c40f', '/uploads/event_data.jpg', 0, 'Completed', 'View Archive']
            ];

            for (const ev of dummyEvents) {
                await db.execute(
                    `INSERT INTO events (name, description, event_date, event_time, location, speaker, tag, tag_color, banner_image, is_featured, status, cta_text, is_visible) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [...ev, 1]
                );
            }
            console.log('Inserted 4 dummy events');
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
