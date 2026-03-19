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
        cb(null, 'cms_' + Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Get all CMS content
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT `key`, value, type, section FROM cms_content');
        const content = {};
        rows.forEach(row => {
            content[row.key] = row.value;
        });
        res.json({ success: true, data: content });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update CMS content (Admin Only) with File Support
router.post('/batch-update', authMiddleware, upload.fields([
    { name: 'website_logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'about_image', maxCount: 1 }
]), async (req, res) => {
    const updates = { ...req.body };

    // Handle files
    if (req.files) {
        if (req.files['website_logo']) updates.website_logo = `/uploads/${req.files['website_logo'][0].filename}`;
        if (req.files['favicon']) updates.favicon = `/uploads/${req.files['favicon'][0].filename}`;
        if (req.files['about_image']) updates.about_image = `/uploads/${req.files['about_image'][0].filename}`;
    }

    try {
        const queries = Object.keys(updates).map(key => {
            return db.execute(
                'INSERT INTO cms_content (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
                [key, updates[key], updates[key]]
            );
        });

        await Promise.all(queries);
        res.json({ success: true });
    } catch (err) {
        console.error('CMS Update Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
