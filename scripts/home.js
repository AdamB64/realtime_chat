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

    //console.log('Username:', username);
    $('#username').text('Welcome ' + username + '!');

    $('#main_chat').on('click', function () {
        window.location.href = 'chat.html';
    });

    // Redirect to login page if the username is invalid
    //if (username == null || username == "" || username.includes(" ") == true) {
    //  window.location.href = 'login.html';
    //}

    // Fetch the user's permissions and create chat room buttons
    try {
        const response = await fetch('/user-permissions')
        const data = await response.json()
        // Assume data is an array of chat room names the user has permission to access
        data.forEach(function (chatRoomName) {
            // Create a new button for each chat room
            var button = $('<button>')
                .text(chatRoomName.name)
                .attr('id', chatRoomName.name + 'Btn')
                .addClass('button') // Add the same class as your other buttons
                .click(function () {
                    // When the button is clicked, navigate to the corresponding chat room
                    window.location.href = chatRoomName + '.html';
                });

            // Add the new button to the DOM inside the 'chat-rooms' <ul>
            $('#chat-rooms').append(button);
        });
    } catch (error) {
        console.log(error);
    }

});