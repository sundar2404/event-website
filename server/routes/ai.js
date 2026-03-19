const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

router.post('/generate', async (req, res) => {
    try {
        const { prompt, context } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const model = genAI.getGenerativeModel({ model: modelName });

        const fullPrompt = context
            ? `Context: ${context}\n\nTask: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, data: text });
    } catch (error) {
        console.error('Gemini AI Error:', error);
        res.status(500).json({
            success: false,
            message: 'AI Generation failed',
            error: error.message
        });
    }
});

module.exports = router;
