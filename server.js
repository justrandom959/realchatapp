// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Socket.IO को सर्वर पर अटैच करें
// ध्यान दें: 'path' ऑप्शन सेट करें ताकि Socket.IO केवल /api/socket पर सुने
const io = socketIo(server, {
    path: '/api/socketio', // <-- यह महत्वपूर्ण है!
    cors: {
        origin: "*", // सभी ओरिजिन से कनेक्शन की अनुमति दें (विकास के लिए ठीक, प्रोडक्शन में विशिष्ट URL दें)
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// पब्लिक फ़ोल्डर से स्टैटिक फ़ाइलें सर्व करें
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO कनेक्शन हैंडलिंग
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg);
        io.emit('message', msg);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Vercel को यह बताने के लिए कि यह एक सर्वरलेस फ़ंक्शन है, हमें इसे module.exports के रूप में एक्सपोर्ट करना होगा
module.exports = app;

// लोकल डेवलपमेंट के लिए सर्वर को लिस्टेन करवाएं
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}