const socket = io();
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('user-list');
const typing = document.getElementById('typing');

let username = prompt("Enter your username:");
socket.emit('new_user', username);

input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && input.value) {
        socket.emit('chat_message', input.value);
        input.value = '';
    } else {
        socket.emit('typing');
    }
});

socket.on('broadcast_message', (data) => {
    const messageEl = document.createElement('div');
    messageEl.textContent = data.msg;
    messages.appendChild(messageEl);
});

socket.on('users_update', (users) => {
    usersList.innerHTML = "";
    users.forEach(user => {
        const userEl = document.createElement('li');
        userEl.textContent = user.name;
        usersList.appendChild(userEl);
    });
});

socket.on('user_typing', (userId) => {
    typing.textContent = userId + ' is typing...';
});
