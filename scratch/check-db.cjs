const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        console.log('✅ Connection Successful!');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables found:', rows.length);
        await connection.end();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Database missing. Creating...');
            // Try to create it
        }
    }
}
check();
