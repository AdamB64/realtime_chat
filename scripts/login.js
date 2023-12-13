$(document).ready(function () {
    $('#LoginActBt').on('click', function () {
        console.log("login");
        var username = $('#LUsername').val();
        window.location.href = 'Chat.html?username=' + encodeURIComponent(username);;
    });

    $('#LShowPassword').on('click', function () {
        console.log("works")
        var x = $("#LPassword");
        if (x.prop("type") == "password") {
            x.prop("type", "text");
        } else {
            x.prop("type", "password");
        }
    });
});