const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    const creds = [
        { host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '', database: 'gensaas_events' },
        { host: 'localhost', user: 'root', password: '', database: 'gensaas_events' },
        { host: 'localhost', user: 'root', password: 'password', database: 'gensaas_events' }
    ];

    let connection;
    for (const cred of creds) {
        try {
            console.log(`Trying to connect as ${cred.user}...`);
            // Connect without DB first to create it
            const connInit = await mysql.createConnection({
                host: cred.host,
                user: cred.user,
                password: cred.password
            });
            await connInit.execute(`CREATE DATABASE IF NOT EXISTS \`${cred.database}\``);
            await connInit.end();

            connection = await mysql.createConnection(cred);
            console.log(`Connected to ${cred.database}!`);
            break;
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }

    if (!connection) {
        console.error('Could not connect to database with any credentials.');
        process.exit(1);
    }

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database', 'migration_full_cms.sql'), 'utf8');
        const queries = sql.split(';').filter(q => q.trim());

        for (let query of queries) {
            try {
                await connection.execute(query);
            } catch (err) {
                console.log(`Query warning/error: ${err.message}`);
            }
        }
        console.log('Migration finished!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await connection.end();
    }
}

run();
