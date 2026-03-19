const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Development bypass for demo-token
    if (token === 'demo-token' && process.env.NODE_ENV === 'development') {
        req.admin = { id: 1, userId: 'sundar', role: 'admin' };
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { authMiddleware };
