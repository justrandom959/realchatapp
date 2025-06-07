// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Vercel पर डिप्लॉय करते समय, आपको सर्वर URL और Socket.IO पाथ निर्दिष्ट करना होगा
    // विंडो का लोकेशन ओरिजिन (https://your-project-name.vercel.app) का उपयोग करें
    const socket = io(window.location.origin, {
        path: '/api/socketio', // <-- यह आपके server.js में सेट किए गए 'path' से मेल खाना चाहिए
        transports: ['websocket', 'polling'] // सुनिश्चित करें कि यह सही ट्रांसपोर्ट का उपयोग करता है
    });

    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatFeedback = document.getElementById('chatFeedback');

    let username = prompt('Please enter your username:');
    if (!username) {
        username = `Guest${Math.floor(Math.random() * 1000)}`;
    }

    // बाकी का कोड जैसा है वैसा ही रहेगा...

    // Add a message to the UI
    function addMessage(msg, type = 'received') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        if (type === 'received' && msg.username && msg.username !== username) {
             messageDiv.innerHTML = `<span class="username">${msg.username}:</span> ${msg.text}`;
        } else {
            messageDiv.textContent = msg.text;
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (messageText) {
            const msg = {
                username: username,
                text: messageText,
            };
            socket.emit('chatMessage', msg);
            addMessage(msg, 'sent');
            messageInput.value = '';
            chatFeedback.textContent = '';
        }
    });

    // Listen for incoming messages from the server
    socket.on('message', (msg) => {
        if (msg.username !== username) {
            addMessage(msg, 'received');
            chatFeedback.textContent = '';
        }
    });

    // Typing indicator logic
    let typingTimeout;
    messageInput.addEventListener('input', () => {
        socket.emit('typing', { username: username });
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { username: username, isTyping: false });
        }, 3000);
    });

    socket.on('typing', (data) => {
        if (data.username !== username) {
            if (data.isTyping !== false) {
                 chatFeedback.textContent = `${data.username} is typing...`;
            } else {
                 chatFeedback.textContent = '';
            }
        }
    });

    // System messages (user joined/left)
    socket.on('userJoined', (message) => {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = message;
        infoDiv.style.textAlign = 'center';
        infoDiv.style.fontSize = '0.8em';
        infoDiv.style.color = '#888';
        chatMessages.appendChild(infoDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

     socket.on('userDisconnected', (message) => {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = message;
        infoDiv.style.textAlign = 'center';
        infoDiv.style.fontSize = '0.8em';
        infoDiv.style.color = '#888';
        chatMessages.appendChild(infoDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});