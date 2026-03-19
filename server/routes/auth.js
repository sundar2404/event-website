const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');

// Admin Login
router.post('/login', [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, password } = req.body;

    try {
        const [admins] = await db.execute('SELECT * FROM admins WHERE user_id = ? AND is_active = 1', [userId]);

        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, userId: admin.user_id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                userId: admin.user_id,
                fullName: admin.full_name,
                role: admin.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create Initial Admin (Use this only once for setup)
router.post('/setup-admin', async (req, res) => {
    try {
        const [existing] = await db.execute('SELECT * FROM admins LIMIT 1');
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Setup already completed' });
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD, 10);
        await db.execute(
            'INSERT INTO admins (user_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [process.env.ADMIN_DEFAULT_ID, 'admin@gensaas.com', hashedPassword, 'System Administrator', 'superadmin']
        );

        res.json({ success: true, message: 'Admin setup successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
