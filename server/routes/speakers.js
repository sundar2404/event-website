const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'speaker_' + Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Get all speakers
router.get('/', async (req, res) => {
    try {
        const isAdmin = req.query.admin === 'true';
        const query = isAdmin
            ? 'SELECT * FROM speakers ORDER BY created_at DESC'
            : 'SELECT * FROM speakers WHERE is_visible = 1 ORDER BY created_at DESC';
        const [rows] = await db.execute(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add speaker (Admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { name, expertise, bio, social_links, is_visible } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const visible = is_visible === 'true' || is_visible === true || is_visible === 1 || is_visible === '1';

    try {
        const [result] = await db.execute(
            'INSERT INTO speakers (name, expertise, bio, image_url, social_links, is_visible) VALUES (?, ?, ?, ?, ?, ?)',
            [name, expertise, bio, image_url, social_links || '{}', visible ? 1 : 0]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Toggle visibility (Admin Only)
router.patch('/:id/visibility', authMiddleware, async (req, res) => {
    const { is_visible } = req.body;
    try {
        await db.execute('UPDATE speakers SET is_visible = ? WHERE id = ?', [is_visible ? 1 : 0, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Update Visibility Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete speaker (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await db.execute('DELETE FROM speakers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
