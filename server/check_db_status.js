require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({
        host: 'localhost',
        port: parseInt(process.env.DB_PORT) || 3307,
        user: 'root',
        password: '',
        database: 'gensaas_events'
    });

    console.log('=== DB STATUS REPORT ===');
    console.log('Port:', parseInt(process.env.DB_PORT) || 3307);

    const tables = ['events', 'users', 'registrations', 'cms_content', 'templates', 'hero_slides', 'admins', 'speakers'];
    console.log('\n--- TABLE ROW COUNTS ---');
    for (const t of tables) {
        try {
            const [r] = await c.execute('SELECT COUNT(*) AS n FROM `' + t + '`');
            console.log(t + ': ' + r[0].n + ' row(s)');
        } catch (e) {
            console.log(t + ': TABLE MISSING');
        }
    }

    console.log('\n--- EVENTS COLUMNS CHECK ---');
    const [cols] = await c.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='gensaas_events' AND TABLE_NAME='events' AND COLUMN_NAME IN ('event_status','event_type')"
    );
    if (cols.length === 2) {
        console.log('event_type: EXISTS');
        console.log('event_status: EXISTS');
        console.log('=> Launch Event should work!');
    } else {
        console.log('MISSING columns: Run migration_fix_events.sql in phpMyAdmin!');
    }

    await c.end();
}

run().catch(e => console.log('ERROR:', e.message));
