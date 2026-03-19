require('dotenv').config();
const mysql = require('mysql2/promise');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnections() {
    console.log('--- Checking Database Connection ---');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'gensaas_events',
        });
        console.log('✅ Database connected successfully!');
        await connection.end();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log('   (Note: Check if your MySQL service is running and the port ' + (process.env.DB_PORT || 3306) + ' is correct.)');
        }
    }

    console.log('\n--- Checking Gemini API Key ---');
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

testConnections();
