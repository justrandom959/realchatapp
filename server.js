// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new socketIo.Server(server, { // <-- यहां बदलाव है, 'new' का उपयोग किया
    path: '/api/socketio', // Vercel के लिए सही पाथ
    cors: {
        origin: "*", // सभी ओरिजिन से कनेक्शन की अनुमति दें
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'] // सुनिश्चित करें कि वेबसॉकेट प्राथमिकता हो
});

const PORT = process.env.PORT || 3000;

// पब्लिक फोल्डर से स्टैटिक फाइलें सर्व करें
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO कनेक्शन हैंडलिंग
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('chatMessage', (msg) => {
        console.log('Message received:', msg);
        io.emit('message', msg); // सभी को मैसेज भेजें
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Vercel के लिए: ऐप को सर्वरलेस फ़ंक्शन के रूप में एक्सपोर्ट करें
// यह Vercel को आपके HTTP अनुरोधों को हैंडल करने देता है, जिसमें Socket.IO अपग्रेड भी शामिल है
module.exports = app;

// लोकल डेवलपमेंट के लिए सर्वर को लिस्टेन करवाएं
// यह हिस्सा तभी चलेगा जब आप `node server.js` चलाएंगे, Vercel पर नहीं
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}