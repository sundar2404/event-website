require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('--- Testing Gemini AI API Key ---');
    console.log('Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('Model:', process.env.GEMINI_MODEL);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, respond with 'Connected'");
        const response = await result.response;
        const text = response.text();
        console.log('✅ Gemini API connected successfully! Response:', text.trim());
    } catch (err) {
        console.error('❌ Gemini API connection failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.stack) console.error('Stack:', err.stack.split('\n')[0]);
    }
}

testGemini();
