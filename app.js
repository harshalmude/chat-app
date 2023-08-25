const socket = io();
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('user-list');
const typing = document.getElementById('typing');

let username = prompt("Enter your username:");
socket.emit('new_user', username);

input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13 && input.value) {
        sendMessage();  // Use the sendMessage function here.
    } else {
        socket.emit('typing');
    }
});

socket.on('broadcast_message', (data) => {
    const messageEl = document.createElement('div');
    messageEl.textContent = `${data.username}: ${data.msg}`; // prefixing username
    messages.appendChild(messageEl);
});

socket.on('users_update', (users) => {
    usersList.innerHTML = "";
    users.forEach(user => {
        const userEl = document.createElement('li');
        userEl.textContent = user.name;
        
        // Check the user's status and add an 'online' class if they're online
        if (user.status === 'online') {
            userEl.classList.add('online');  // Applying 'online' class to online users
        }
        
        usersList.appendChild(userEl);
    });
});

function sendMessage() {
    let message = input.value;

    // Check if the message is a local command.
    if (message.startsWith("/")) {
        handleLocalCommand(message);
        input.value = ""; // Clear the input field
        return; // Don't send local commands to the server.
    }

    socket.emit('chat_message', message);
    input.value = "";
}

function handleLocalCommand(command) {
    switch (command) {
        case "/help":
            const commandsList = `
            Available commands:
            /help: Display this help message.
            /random: Send a random number to the chat.
            /clear: Clear the chat history.
            `;
            alert(commandsList);
            break;
        case "/random":
            const randomNumber = Math.floor(Math.random() * 100); // Random number between 0 and 99
            messages.innerHTML += '<div>' + username + ': ' + randomNumber + '</div>';
            break;
        case "/clear":
            messages.innerHTML = "";
            break;
        default:
            alert("Unknown command.");
            break;
    }
}

socket.on('user_typing', (userId) => {
    typing.textContent = userId + ' is typing...';
});
