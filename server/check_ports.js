
const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, '127.0.0.1');
    });
}

async function run() {
    const p3306 = await checkPort(3306);
    const p3307 = await checkPort(3307);
    console.log(`Port 3306: ${p3306 ? 'OPEN' : 'CLOSED'}`);
    console.log(`Port 3307: ${p3307 ? 'OPEN' : 'CLOSED'}`);
}

run();
