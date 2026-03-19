const express = require('express');
const cors = require('cors');
const path = require('path');
const { apiKeyAuth, router: apiKeyRouter } = require('./middleware/apiKeyAuth');
const { authMiddleware } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes placeholders
app.use('/api/api-keys', authMiddleware, apiKeyRouter); // Admin only can generate keys
app.use('/api/auth', apiKeyAuth, require('./routes/auth'));
app.use('/api/events', apiKeyAuth, require('./routes/events'));
app.use('/api/cms', apiKeyAuth, require('./routes/cms'));
app.use('/api/registrations', apiKeyAuth, require('./routes/registrations'));
app.use('/api/registration-fields', apiKeyAuth, require('./routes/registration_fields'));
app.use('/api/templates', apiKeyAuth, require('./routes/templates'));
app.use('/api/analytics', apiKeyAuth, require('./routes/analytics'));
app.use('/api/users', apiKeyAuth, require('./routes/users'));
app.use('/api/security', apiKeyAuth, require('./routes/security'));
app.use('/api/speakers', apiKeyAuth, require('./routes/speakers'));
app.use('/api/ai', apiKeyAuth, require('./routes/ai'));


// Root route
app.get('/', (req, res) => {
    res.send('GenSaas Events API is running...');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server and API running on port ${PORT}`);
});
