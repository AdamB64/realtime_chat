$(document).ready(async function () {
    try {
        const response = await fetch('/authorised')
        const data = await response.json()
        //console.log(data.message);
        if (data.message == 'User is not authenticated') {
            window.location.href = 'login.html';
            console.log("doesnt work");
        } else {
            // Handle the response as usual
            console.log("works");
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
    console.log('Username:', username);
    $('#username').val(username);

    var socket = new WebSocket('ws://localhost:3000');

    // WebSocket connection opened
    socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened', event);
        // You can add any initialization logic here
    });

    console.log('Script loaded');
    // WebSocket received a message

    socket.addEventListener('message', (event) => {
        try {
            var data = JSON.parse(event.data);
            console.log('Parsed message:', data);

            // Assuming data has a 'username' and 'message' property
            if (data.username && data.message) {
                // Append the message to the #messages ul
                $('#messages').append('<li class="' + data.alignmentClass + '" style="background-color:' + data.color + ';">' +
                    '<strong>' + data.username + ':</strong> ' + data.message + '</li>');

                // Optionally, scroll to the bottom of the #messages ul
                $('#messages').scrollTop($('#messages')[0].scrollHeight);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    /*
    old code that kind works but above is better
    socket.addEventListener('message', (event) => {
        console.log("message")
        console.log('Raw message:', event.data);

        try {
            var data = JSON.parse(event.data);
            console.log('Parsed message:', data);

            // Assuming data has a 'username' and 'message' property
            if (data.username && data.message) {
                // Append the message to the #messages ul
                $('#messages').append('<li><strong>' + data.username + ':</strong> ' + data.message + '</li>');

                // Optionally, scroll to the bottom of the #messages ul
                $('#messages').scrollTop($('#messages')[0].scrollHeight);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });*/

    // WebSocket connection closed
    //socket.addEventListener('close', (event) => {
    //  console.log('WebSocket connection closed', event);
    //});

    // WebSocket connection error
    socket.addEventListener('error', (event) => {
        console.error('WebSocket connection error', event);
    });


    $('#form').submit(function (e) {
        e.preventDefault(); // Prevent the form from submitting

        var message = $('#input').val();
        var username = $('#username').val();

        if (message.trim() && username) {
            // Send the message to the server
            socket.send(JSON.stringify({ username: username, message: message }));

            // Clear the input field
            $('#input').val('');

            // Optionally, focus back on the input field for the next message
            $('#input').focus();
        }
    });

    // Redirect to login page if the username is invalid
    if (username == null || username == "" || username.includes(" ") == true) {
        window.location.href = 'login.html';
    }

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

});
