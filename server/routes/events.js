const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'event_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const showAll = req.query.admin === 'true';
        const query = showAll
            ? 'SELECT * FROM events ORDER BY created_at DESC'
            : 'SELECT * FROM events WHERE is_visible = 1 ORDER BY created_at DESC';
        const [rows] = await db.execute(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// Create event (Admin Only)
router.post('/', authMiddleware, upload.single('banner_image'), async (req, res) => {
    const { name, description, event_date, event_time, location, speaker, event_type, event_status, is_featured, is_visible } = req.body;
    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;
    const featured = is_featured === 'true' || is_featured === true;
    const visible = is_visible === 'true' || is_visible === true || is_visible === 1 || is_visible === '1';

    try {
        const [result] = await db.execute(
            `INSERT INTO events (name, description, event_date, event_time, location, speaker, event_type, event_status, banner_image, is_featured, is_visible) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, event_date, event_time, location || 'Virtual', speaker, event_type || 'Online', event_status || 'Upcoming', banner_image, featured, visible ? 1 : 0]
        );

        // Also add to hero_slides if featured
        if (featured) {
            await db.execute(
                'INSERT INTO hero_slides (event_id, title, subtitle, image_url, is_active) VALUES (?, ?, ?, ?, ?)',
                [result.insertId, name, description, banner_image, 1]
            );
        }

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('Create Event Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get featured events for slides
router.get('/slides', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY slide_order ASC');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});

// Quick status update (Admin Only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    const { event_status } = req.body;
    const allowed = ['Live', 'Upcoming', 'Completed'];
    if (!allowed.includes(event_status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    try {
        await db.execute('UPDATE events SET event_status = ? WHERE id = ?', [event_status, req.params.id]);
        res.json({ success: true, event_status });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Quick type toggle (Admin Only)
router.patch('/:id/type', authMiddleware, async (req, res) => {
    const { event_type } = req.body;
    const allowed = ['Online', 'Offline'];
    if (!allowed.includes(event_type)) {
        return res.status(400).json({ success: false, message: 'Invalid type value' });
    }
    try {
        await db.execute('UPDATE events SET event_type = ? WHERE id = ?', [event_type, req.params.id]);
        res.json({ success: true, event_type });
    } catch (err) {
        console.error('Type update error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete event (Admin Only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.id;
        // First delete from slides to be clean
        await db.execute('DELETE FROM hero_slides WHERE event_id = ?', [eventId]);
        // Then delete the event
        await db.execute('DELETE FROM events WHERE id = ?', [eventId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete Event Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update event (Admin Only)
router.put('/:id', authMiddleware, upload.single('banner_image'), async (req, res) => {
    const { name, description, event_date, event_time, location, speaker, event_type, event_status, is_featured, is_visible } = req.body;
    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;
    const featured = is_featured === 'true' || is_featured === true || is_featured === 1 || is_featured === '1';
    const visible = is_visible === 'true' || is_visible === true || is_visible === 1 || is_visible === '1';

    try {
        let query = `UPDATE events SET 
            name = ?, 
            description = ?, 
            event_date = ?, 
            event_time = ?, 
            location = ?, 
            speaker = ?, 
            event_type = ?,
            event_status = ?,
            is_featured = ?, 
            is_visible = ?`;
        let params = [name, description, event_date, event_time, location || 'Virtual', speaker, event_type || 'Online', event_status || 'Upcoming', featured ? 1 : 0, visible ? 1 : 0];

        if (banner_image) {
            query += `, banner_image = ?`;
            params.push(banner_image);
        }

        query += ` WHERE id = ?`;
        params.push(req.params.id);

        await db.execute(query, params);

        // Sync with Hero Slides
        if (featured) {
            // Check if slide already exists
            const [slides] = await db.execute('SELECT id FROM hero_slides WHERE event_id = ?', [req.params.id]);
            if (slides.length > 0) {
                // Update existing slide
                let slideQuery = 'UPDATE hero_slides SET title = ?, subtitle = ?, is_active = ?';
                let slideParams = [name, description, visible ? 1 : 0];
                if (banner_image) {
                    slideQuery += ', image_url = ?';
                    slideParams.push(banner_image);
                }
                slideQuery += ' WHERE event_id = ?';
                slideParams.push(req.params.id);
                await db.execute(slideQuery, slideParams);
            } else {
                // Insert new slide
                await db.execute(
                    'INSERT INTO hero_slides (event_id, title, subtitle, image_url, is_active) VALUES (?, ?, ?, ?, ?)',
                    [req.params.id, name, description, banner_image || null, visible ? 1 : 0]
                );
            }
        } else {
            // Remove from featured if it was featured before
            await db.execute('DELETE FROM hero_slides WHERE event_id = ?', [req.params.id]);
        }

        res.json({ success: true, message: 'Event updated successfully' });
    } catch (err) {
        console.error('Update Event Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
