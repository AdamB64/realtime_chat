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
        for (let i = 0; i < data.length; i++) {
            //console.log(data[i]);
            // Create a new button for each chat room
            var button = $('<button class="button">')

                .text(data[i])
                .attr('id', data[i] + 'Btn')
                .addClass('button') // Add the same class as your other buttons
                .click(function () {

                    // When the button is clicked, navigate to the corresponding chat room
                    window.location.href = 'chatroom.html?name=' + data[i];
                });

            // Add the new button to the DOM inside the 'chat-rooms' <ul>
            $('#chat-rooms').append(button);
        }
    } catch (error) {
        console.log(error);
    }

    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("create_chat");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    $('#new-chat-room-form').on('submit', function (event) {
        event.preventDefault();

        var name = $('#name').val();
        var members = $('#members').val();

        $.post('/private-chat-room', { name: name, members: members })
            .done(function () {
                toastr.success('Chat room created successfully');
                modal.style.display = "none";
                console.log("Chat room created successfully");
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                //console.log(jqXHR.status)
                if (jqXHR.status == 400) {
                    toastr.error('All members must be users');
                } else {
                    toastr.error('Could not create chat room');
                }
            });
    });

});