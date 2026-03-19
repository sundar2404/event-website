
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
    const ports = [80, 443, 3306, 3307, 5000];
    const results = {};
    for (const port of ports) {
        results[port] = await checkPort(port);
    }
    console.log(JSON.stringify(results, null, 2));
}

run();
