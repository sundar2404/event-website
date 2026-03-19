const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'tpl_' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Get default template
router.get('/default', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM templates WHERE is_default = 1 LIMIT 1');
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Default template not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update template (Admin Only)
router.post('/update', authMiddleware, upload.fields([
    { name: 'template_image', maxCount: 1 },
    { name: 'logo_image', maxCount: 1 }
]), async (req, res) => {
    const { congrat_message, name_x, name_y, font_size, font_family, font_color, logo_x, logo_y, logo_width, accent_color, show_event_date, show_logo } = req.body;

    try {
        let query = `UPDATE templates SET congrat_message=?, name_x=?, name_y=?, font_size=?, font_family=?, font_color=?, logo_x=?, logo_y=?, logo_width=?, accent_color=?, show_event_date=?, show_logo=?`;
        let params = [congrat_message, name_x, name_y, font_size, font_family, font_color, logo_x, logo_y, logo_width, accent_color, show_event_date === 'true', show_logo === 'true'];

        if (req.files['template_image']) {
            query += `, template_image=?`;
            params.push(`/uploads/${req.files['template_image'][0].filename}`);
        }
        if (req.files['logo_image']) {
            query += `, logo_image=?`;
            params.push(`/uploads/${req.files['logo_image'][0].filename}`);
        }

        query += ` WHERE is_default = 1`; // Always update default for now

        await db.execute(query, params);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
