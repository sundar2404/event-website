require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('--- Testing Gemini AI API Key ---');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Correct version is 1.5 flash, 2.5 flash might not be valid.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, respond with 'Connected'");
        const response = await result.response;
        const text = response.text();
        console.log('✅ Gemini API connected successfully! Response:', text.trim());
    } catch (err) {
        console.error('❌ Gemini API connection failed:', err.message);
    }
}

testGemini();
