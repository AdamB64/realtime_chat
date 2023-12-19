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
    for (var i = 0; i < chatRoomData.messages.length; i++) {
        //console.log(data[i].username + " " + $('#username').val());
        if (chatRoomData.messages[i].username == $('#username').val()) {
            $('#messages').append('<li class="align-right" style="background-color:grey;">' +
                '<strong>' + chatRoomData.messages[i].username + ':</strong> ' + chatRoomData.messages[i].text +
                '<span class="date">' + chatRoomData.messages[i].date + '</span></li>');
        } else {
            $('#messages').append('<li class="align-left" style="background-color:black;">' +
                '<strong>' + chatRoomData.messages[i].username + ':</strong> ' + chatRoomData.messages[i].text +
                '<span class="date">' + chatRoomData.messages[i].date + '</span></li>');
        }
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
                    '<span class="date">' + data.date + '</span></li>');

                // Optionally, scroll to the bottom of the #messages ul
                $('#messages').scrollTop($('#messages')[0].scrollHeight);
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
        console.log()
        const response = await fetch('/private-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, message, date: getFormattedDate(), chatRoomName: chatRoomName })
        });
    }

});