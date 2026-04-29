const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get all fields for an event
router.get('/:eventId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM registration_fields WHERE event_id = ? ORDER BY field_order ASC',
            [req.params.eventId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add/Update fields (Admin Only)
router.post('/batch-update/:eventId', authMiddleware, async (req, res) => {
    const { fields } = req.body; 
    const eventId = req.params.eventId;

    try {
        await db.execute('DELETE FROM registration_fields WHERE event_id = ?', [eventId]);

        if (fields && fields.length > 0) {
            for (let i = 0; i < fields.length; i++) {
                const f = fields[i];
                const optionsStr = typeof f.field_options === 'string' 
                    ? f.field_options 
                    : JSON.stringify(f.field_options || []);

                await db.execute(
                    'INSERT INTO registration_fields (event_id, label, field_type, is_required, field_order, field_options) VALUES (?, ?, ?, ?, ?, ?)',
                    [eventId, f.label, f.field_type || 'text', f.is_required ? 1 : 0, i, optionsStr]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Save Fields Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
