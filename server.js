// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialize Socket.IO with the HTTP server

const PORT = process.env.PORT || 3000;

// Serve static files (your HTML, CSS, JS frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a chat room (optional, for multiple chats)
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} joined room: ${roomName}`);
        // Optional: Notify others in the room
        socket.to(roomName).emit('userJoined', `${socket.id} has joined the chat.`);
    });

    // Listen for chat messages
    socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg);
        // Here, you would typically save the message to a database
        // For now, let's just broadcast it to all connected clients
        io.emit('message', msg); // Broadcast to all
        // If using rooms: socket.to(msg.room).emit('message', msg);
    });

    // Listen for typing indicator
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data); // Broadcast to all *except* sender
        // If using rooms: socket.to(data.room).emit('typing', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Optional: Notify others of disconnect
        io.emit('userDisconnected', `${socket.id} has left the chat.`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});