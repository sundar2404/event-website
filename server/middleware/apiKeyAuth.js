const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// This is a simple in-memory store for demonstration.
// In production, you would store this in a database.
const apiKeys = new Set();

// Middleware to protect routes with API Key
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    // For local development or initial setup
    if (!apiKey && process.env.NODE_ENV === 'development') {
        return next();
    }

    if (apiKey && (apiKey === process.env.STATIC_API_KEY || apiKeys.has(apiKey))) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid or missing API Key'
    });
};

// Route to generate a new API Key (should be protected by admin auth)
router.post('/generate', (req, res) => {
    const newKey = crypto.randomBytes(32).toString('hex');
    apiKeys.add(newKey);
    res.json({
        success: true,
        apiKey: newKey,
        message: 'API Key generated successfully. Save it somewhere safe!'
    });
});

module.exports = {
    router,
    apiKeyAuth
};
