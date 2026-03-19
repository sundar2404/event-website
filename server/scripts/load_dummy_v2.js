/* global require, __dirname, process */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runSeed() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'gensaas_events',
            multipleStatements: true 
        });

        console.log('Reading dummy_data_v2.sql...');
        const sqlPath = path.join(__dirname, '..', 'database', 'dummy_data_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing dummy data seed V2...');
        await connection.query(sql);
        console.log('Successfully seeded professional dummy data.');

    } catch (error) {
        console.error('Error seeding dummy data:', error.message);
        console.log('\nTIP: Make sure your MySQL server (XAMPP/WAMP) is running.');
    } finally {
        if (connection) await connection.end();
    }
}

runSeed();
