// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Connect to the Socket.IO server
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatFeedback = document.getElementById('chatFeedback');

    let username = prompt('Please enter your username:');
    if (!username) {
        username = `Guest${Math.floor(Math.random() * 1000)}`;
    }

    // Optional: Join a room (if your server supports it)
    // socket.emit('joinRoom', 'general'); // Or prompt for a room name

    // Add a message to the UI
    function addMessage(msg, type = 'received') {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        // Display username only if it's a received message and not from the current user
        if (type === 'received' && msg.username && msg.username !== username) {
             messageDiv.innerHTML = `<span class="username">${msg.username}:</span> ${msg.text}`;
        } else {
            messageDiv.textContent = msg.text;
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    // Handle form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        const messageText = messageInput.value.trim();
        if (messageText) {
            const msg = {
                username: username,
                text: messageText,
                // Optional: room: 'general'
            };
            socket.emit('chatMessage', msg); // Send message to server
            addMessage(msg, 'sent'); // Add to local UI as sent
            messageInput.value = ''; // Clear input
            chatFeedback.textContent = ''; // Clear typing indicator
        }
    });

    // Listen for incoming messages from the server
    socket.on('message', (msg) => {
        if (msg.username !== username) { // Don't show our own sent messages twice
            addMessage(msg, 'received');
            chatFeedback.textContent = ''; // Clear typing indicator from others when new message arrives
        }
    });

    // Typing indicator logic
    let typingTimeout;
    messageInput.addEventListener('input', () => {
        socket.emit('typing', { username: username }); // Tell server we're typing
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { username: username, isTyping: false }); // Signal not typing after a pause
        }, 3000); // Stop typing after 3 seconds of no input
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