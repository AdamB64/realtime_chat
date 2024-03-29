$(document).ready(async function () {
    try {
        const response = await fetch('/authorised')
        const data = await response.json()
        //console.log(data.message);
        if (data.message == 'User is not authenticated') {
            window.location.href = 'login.html';
            //console.log("doesnt work");
        } else {
            // Handle the response as usual
            //console.log("works");
        }
    }
    catch (error) {
        console.log(error);
    }

    var username;
    try {
        const response = await fetch('/get-username');
        const data = await response.json();
        if (data.username) {
            username = data.username;
        } else {
            console.log('No user is currently logged in');
        }
    } catch (error) {
        console.log(error);
    }

    // Use the username as needed
    //console.log('Username:', username);
    $('#username').val(username);

    function getFormattedDate() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month} ${hours}:${minutes}`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const chatRoomName = urlParams.get('name');


    const chatRoomResponse = await fetch(`/chat-room-data?chatroom=${encodeURIComponent(chatRoomName)}`);
    const chatRoomData = await chatRoomResponse.json();
    console.log(chatRoomData);


    const responce = await fetch('/getusers');
    const users = await responce.json();
    console.log(users);

    for (var i = 0; i < chatRoomData.chat.length; i++) {
        console.log(chatRoomData);

        var message = chatRoomData.chat[i];
        var messageClass = (message.username == $('#username').val()) ? 'align-right' : 'align-left';

        $('#messages').append('<li class="' + messageClass + '" style="background-color:' + ((messageClass === 'align-right') ? 'grey' : 'black') + ';">' +
            '<strong>' + message.username + ':</strong> ' + message.message +
            '<span class="date">' + message.date + '</span><img id="profile_picture" src=' + users[0].profilePicture + '></li>');
    }

    var socket = new WebSocket('ws://localhost:3000');

    // WebSocket connection opened
    socket.addEventListener('open', (event) => {
        //console.log('WebSocket connection opened', event);
        // You can add any initialization logic here
    });

    //console.log('Script loaded');
    // WebSocket received a message

    socket.addEventListener('message', (event) => {
        try {
            var data = JSON.parse(event.data);
            //console.log('Parsed message:', data);

            // Assuming data has a 'username' and 'message' property
            if (data.username && data.message) {
                // Append the message to the #messages ul
                //console.log(data);
                $('#messages').append('<li class="align-right" style="background-color:grey;">' +
                    '<strong>' + data.username + ':</strong> ' + data.message +
                    '<span class="date">' + data.date + '</span><img id="profile_picture" src=' + users[0].profilePicture + '></li>');

                // Optionally, scroll to the bottom of the #messages ul
                $('#messages').scrollTop($('#messages')[0].scrollHeight);
                //console.log(data.message);
                privateChat(data.username, data.message).then(() => {
                    //console.log("public chat saved");
                }).catch((error) => {
                    console.error('Error:', error);
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // WebSocket connection error
    socket.addEventListener('error', (event) => {
        //console.error('WebSocket connection error', event);
    });

    $('#form').submit(function (e) {
        e.preventDefault(); // Prevent the form from submitting

        var message = $('#input').val();
        var username = $('#username').val();

        if (message.trim() && username) {
            // Send the message to the server
            socket.send(JSON.stringify({ username: username, message: message, date: getFormattedDate() }));

            // Clear the input field
            $('#input').val('');

            // Optionally, focus back on the input field for the next message
            $('#input').focus();
        }
    });

    // Redirect to login page if the username is invalid
    //if (username == null || username == "" || username.includes(" ") == true) {
    //window.location.href = 'login.html';
    //}

    socket.addEventListener('close', function (e) {
        fetch('/logout', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch((error) => {
                console.error('Error:', error);
            });
    });

    const privateChat = async (username, message, date, chatroom) => {
        console.log(message)
        const response = await fetch('/private-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, message: message, date: getFormattedDate(), chatRoomName: chatRoomName, isChatRoom: true })
        });
    }
});