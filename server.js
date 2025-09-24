// Simple Node.js Socket.IO backend for real-time draggable circle with timestamp ordering

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let circle = { x: 200, y: 200, ts: 0 };

io.on('connection', (socket) => {
    // Send current position to new client
    socket.emit('update_circle', circle);

    // Listen for movement events
    socket.on('move_circle', (data) => {
        // Only update if timestamp is newer
        if (typeof data.ts === 'number' && data.ts >= circle.ts) {
            circle = { x: data.x, y: data.y, ts: data.ts };
            // Broadcast to all clients except sender
            socket.broadcast.emit('update_circle', circle);
        }
    });
});

app.use(express.static(__dirname)); // Serve static files (index.html)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});