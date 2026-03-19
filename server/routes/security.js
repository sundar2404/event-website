const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    try {
        const [admins] = await db.execute('SELECT password FROM admins WHERE id = ?', [adminId]);
        const isMatch = await bcrypt.compare(currentPassword, admins[0].password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password incorrect' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE admins SET password = ? WHERE id = ?', [hashed, adminId]);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Add sub-admin
router.post('/add-subadmin', authMiddleware, async (req, res) => {
    const { userId, email, password, fullName } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO admins (user_id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [userId, email, hashed, fullName, 'admin']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
