$(document).ready(function () {
    // Get the username from the URL query parameter
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');

    // Use the username as needed
    console.log('Username:', username);
    $('#username').val(username)

    $('#form').submit(function (e) {
        e.preventDefault(); // Prevent the form from submitting

        var message = $('#input').val();
        var username = $('#username').val();

        if (message.trim() && username) {
            // Your logic to send the message

            // After sending the message, clear the input field but keep the username
            $('#input').val('');

            // Optionally, you can also focus back on the input field for the next message
            $('#input').focus();
        }
    });
    if (username == null || username == "" || username.includes(" ") == true) {
        window.location.href = 'login.html'
    }
});