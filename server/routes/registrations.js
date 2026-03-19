const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Register for an event
router.post('/register', async (req, res) => {
    const { name, email, phone, event_id, dietary_pref, notes } = req.body;

    try {
        // 1. Get or create user
        let [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        let user_id;

        if (users.length === 0) {
            const [result] = await db.execute(
                'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
                [name, email, phone]
            );
            user_id = result.insertId;
        } else {
            user_id = users[0].id;
            // Update phone if provided
            if (phone) {
                await db.execute('UPDATE users SET phone = ? WHERE id = ?', [phone, user_id]);
            }
        }

        // 2. Check if already registered
        const [existing] = await db.execute('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Already registered for this event' });
        }

        // 3. Create registration
        const [regResult] = await db.execute(
            'INSERT INTO registrations (user_id, event_id, dietary_pref, notes) VALUES (?, ?, ?, ?)',
            [user_id, event_id, dietary_pref, notes]
        );

        // 4. Return success and registration info for poster
        const [eventInfo] = await db.execute('SELECT name, event_date FROM events WHERE id = ?', [event_id]);

        res.json({
            success: true,
            registration_id: regResult.insertId,
            attendee_name: name,
            event_name: eventInfo[0].name,
            event_date: eventInfo[0].event_date
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Already registered' });
        }
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Attendee: Get my registrations by email
router.get('/my/:email', async (req, res) => {
    try {
        const query = `
      SELECT r.*, e.name as event_name, e.event_date, e.event_time, e.location, e.banner_image, e.tag
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      WHERE u.email = ?
      ORDER BY r.registered_at DESC
    `;
        const [rows] = await db.execute(query, [req.params.email]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Get all registrations
router.get('/', authMiddleware, async (req, res) => {
    const { event_id } = req.query;
    try {
        let query = `
      SELECT r.*, u.name as user_name, u.email as user_email, u.phone as user_phone, e.name as event_name
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
    `;
        let params = [];

        if (event_id) {
            query += ` WHERE r.event_id = ?`;
            params.push(event_id);
        }

        query += ` ORDER BY r.registered_at DESC`;

        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
