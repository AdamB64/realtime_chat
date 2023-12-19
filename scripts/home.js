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
});