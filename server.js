const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

io.on('connection', (socket) => {
    socket.on('new_user', (username) => {
        users.push({ id: socket.id, name: username });
        updateOnlineUsers();  // Call this function when a new user joins
    });

    socket.on('chat_message', (msg) => {
        msg = replaceText(msg);
        const user = users.find(user => user.id === socket.id);
        io.emit('broadcast_message', { username: user.name, msg });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user_typing', socket.id);
    });

    socket.on('random', () => {
        const user = users.find(user => user.id === socket.id);
        const randomNumber = Math.floor(Math.random() * 100); // Random number between 0 and 99
        io.emit('broadcast_message', { username: user.name, msg: randomNumber.toString() });
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        updateOnlineUsers();  // Call this function when a user disconnects
    });
});

function updateOnlineUsers() {
    // Emit a list where each user has their name and an 'online' status.
    io.emit('users_update', users.map(user => ({ name: user.name, status: 'online' })));
}

function replaceText(text) {
    const replacements = {
        "react": "⚛️",
        "woah": "😀",
        "hey": "👋",
        "lol": "😂",
        "like": "❤️",
        "congratulations": "🎉"
    };

    for (let key in replacements) {
        text = text.replace(new RegExp(`\\b${key}\\b`, 'g'), replacements[key]);
    }
    return text;
}

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
