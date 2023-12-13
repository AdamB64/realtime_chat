// chat.js

// Create a WebSocket connection to the server
const socket = new WebSocket('ws://localhost:3000/Chat.html');

// Connection opened
socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened');
});

// Listen for messages from the server
socket.addEventListener('message', (event) => {
    // Assuming the server sends JSON messages
    const messageData = JSON.parse(event.data);
    console.log('Received message from server:', messageData);

    // Update your UI or perform actions based on the received message
    // For example, append the message to the list of messages
    const messagesList = document.getElementById('messages');
    const li = document.createElement('li');
    li.textContent = `${messageData.username}: ${messageData.message}`;
    messagesList.appendChild(li);
});

// Connection closed
socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');
});

// Handle form submission
$(document).ready(function () {
    // Get the username from the URL query parameter
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');

    // Use the username as needed
    console.log('Username:', username);
    $('#username').val(username);

    $('#form').submit(function (e) {
        e.preventDefault(); // Prevent the form from submitting

        var message = $('#input').val();
        var username = $('#username').val();

        if (message.trim() && username) {
            // Assuming you want to send JSON messages to the server
            const messageData = { username, message };

            // Send the message to the server
            socket.send(JSON.stringify(messageData));

            // After sending the message, clear the input field but keep the username
            $('#input').val('');

            // Optionally, you can also focus back on the input field for the next message
            $('#input').focus();
        }
    });

    // Redirect to login page if the username is invalid
    if (username == null || username == "" || username.includes(" ") == true) {
        window.location.href = 'login.html';
    }
});
