const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get all fields for an event
router.get('/:eventId', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM registration_fields WHERE event_id = ? AND is_enabled = 1 ORDER BY field_order ASC',
            [req.params.eventId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add/Update fields (Admin Only)
router.post('/batch-update/:eventId', authMiddleware, async (req, res) => {
    const { fields } = req.body; // Array of fields [{label, field_type, is_required, field_order, field_options}]
    const eventId = req.params.eventId;

    try {
        // Simple approach: Delete and re-insert for the event
        await db.execute('DELETE FROM registration_fields WHERE event_id = ?', [eventId]);

        if (fields && fields.length > 0) {
            const queries = fields.map(f => {
                // Prevent double stringification: if it's already a string, use it; if object, stringify it
                const options = typeof f.field_options === 'string'
                    ? f.field_options
                    : JSON.stringify(f.field_options || []);

                return db.execute(
                    'INSERT INTO registration_fields (event_id, label, field_type, is_required, field_order, field_options) VALUES (?, ?, ?, ?, ?, ?)',
                    [eventId, f.label, f.field_type || 'text', f.is_required || false, f.field_order || 0, options]
                );
            });
            await Promise.all(queries);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
