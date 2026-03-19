const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Public: Attendee check-in / login
router.post('/checkin', async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length === 0) {
            await db.execute('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone || null]);
        } else {
            if (phone) await db.execute('UPDATE users SET phone = ?, name = ? WHERE email = ?', [phone, name, email]);
        }
        res.json({ success: true, message: 'User recorded' });
    } catch (err) {
        console.error('Checkin error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Public: Login validation for existing attendees
router.post('/login-attendee', async (req, res) => {
    const { email, phone } = req.body;
    if (!email || !phone) {
        return res.status(400).json({ success: false, message: 'Email and phone are required' });
    }
    try {
        const [users] = await db.execute('SELECT name, email, phone FROM users WHERE email = ? AND phone = ?', [email, phone]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Access Denied: Record not found. Please register first.' });
        }
        res.json({ success: true, user: users[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Get all users with registration count + event list
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { search, event_id } = req.query;
        let query = `
            SELECT 
                u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
                COUNT(DISTINCT r.id) as total_events,
                GROUP_CONCAT(DISTINCT e.name ORDER BY r.registered_at DESC SEPARATOR '|||') as event_names
            FROM users u
            LEFT JOIN registrations r ON u.id = r.user_id
            LEFT JOIN events e ON r.event_id = e.id
        `;
        let params = [];
        let conditions = [];
        if (search) {
            conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (event_id) {
            conditions.push('r.event_id = ?');
            params.push(event_id);
        }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' GROUP BY u.id ORDER BY u.created_at DESC';

        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Get single user detail + all their registered events
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });
        const [evts] = await db.execute(`
            SELECT e.id, e.name, e.event_date, e.event_time, e.location, e.event_type, e.event_status, r.registered_at
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.registered_at DESC
        `, [req.params.id]);
        res.json({ success: true, data: { ...users[0], registered_events: evts } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Add a new user
router.post('/', authMiddleware, async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required' });
    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length) return res.status(409).json({ success: false, message: 'User with this email already exists' });
        const [result] = await db.execute('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone || null]);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Edit user
router.put('/:id', authMiddleware, async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        await db.execute('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone || null, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Toggle active status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const [user] = await db.execute('SELECT is_active FROM users WHERE id = ?', [req.params.id]);
        if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });
        const newStatus = !user[0].is_active;
        await db.execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
        res.json({ success: true, is_active: newStatus });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin: Delete user + registrations
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await db.execute('DELETE FROM registrations WHERE user_id = ?', [req.params.id]);
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
