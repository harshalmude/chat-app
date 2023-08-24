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
        io.emit('users_update', users);
    });

    socket.on('chat_message', (msg) => {
        msg = replaceText(msg);
        io.emit('broadcast_message', { user: socket.id, msg });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('user_typing', socket.id);
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        io.emit('users_update', users);
    });
});

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

server.listen(4000, () => {
    console.log('Server started on http://localhost:4000');
});
