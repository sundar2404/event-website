const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

// Get high-level stats for Dashboard Overview
router.get('/overview', authMiddleware, async (req, res) => {
    try {
        const [totalReg] = await db.execute('SELECT COUNT(*) as count FROM registrations');
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [totalEvents] = await db.execute('SELECT COUNT(*) as count FROM events');

        // Count Upcoming vs Completed
        const [allEvents] = await db.execute('SELECT event_date FROM events');
        const now = new Date();
        let upcomingCount = 0;
        let completedCount = 0;

        allEvents.forEach(ev => {
            const date = new Date(ev.event_date);
            if (isNaN(date.getTime())) upcomingCount++; // Fallback
            else if (date >= now) upcomingCount++;
            else completedCount++;
        });

        // Daily Trends (Last 30 days)
        const [dailyTrends] = await db.execute(`
            SELECT DATE(registered_at) as date, COUNT(*) as count 
            FROM registrations 
            WHERE registered_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(registered_at) 
            ORDER BY date ASC
        `);

        // Event Registration Distribution
        const [eventDistribution] = await db.execute(`
            SELECT e.name, COUNT(r.id) as registrations
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id
            ORDER BY registrations DESC
            LIMIT 10
        `);

        // Recent Activity
        const [recentActivity] = await db.execute(`
            SELECT r.id, u.name as user_name, e.name as event_name, r.registered_at
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registered_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                totalRegistrations: totalReg[0].count,
                totalUsers: totalUsers[0].count,
                totalEvents: totalEvents[0].count,
                upcomingEvents: upcomingCount,
                completedEvents: completedCount,
                dailyTrends,
                eventDistribution,
                recentActivity
            }
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Stats per event
router.get('/events', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.name, COUNT(r.id) as registrations, e.capacity
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
