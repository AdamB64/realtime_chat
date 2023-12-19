$(document).ready(async function () {
    function getFormattedDate() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month} ${hours}:${minutes}`;
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

    fetch('/public-chat_find')
        .then(response => response.json())
        .then(data => {
            //console.log(data);
            for (var i = 0; i < data.length; i++) {
                //console.log(data[i].username + " " + $('#username').val());
                if (data[i].username == $('#username').val()) {
                    $('#messages').append('<li class="align-right" style="background-color:grey;">' +
                        '<strong>' + data[i].username + ':</strong> ' + data[i].message +
                        '<span class="date">' + data[i].date + '</span></li>');
                } else {
                    $('#messages').append('<li class="align-left" style="background-color:black;">' +
                        '<strong>' + data[i].username + ':</strong> ' + data[i].message +
                        '<span class="date">' + data[i].date + '</span></li>');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


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
                publicChat(data.username, data.message).then(() => {
                    //console.log("public chat saved");
                }).catch((error) => {
                    console.error('Error:', error);
                });
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

    const publicChat = async (username, message, date) => {
        const response = await fetch('/public-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, message, date: getFormattedDate() })
        });
    }
});
