const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('move_circle', (data) => {
    // data: { x, y, ts, id }
    socket.broadcast.emit('update_circle', data);
  });
  // Pen Path: share drawn traces
  socket.on('path_draw', (data) => {
    // data: { path: [[x1, y1], [x2, y2], ...] }
    socket.broadcast.emit('path_draw', data);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.static(__dirname));
