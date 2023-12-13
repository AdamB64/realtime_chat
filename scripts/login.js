$(document).ready(function () {
    $('#LoginActBt').on('click', function () {
        console.log("login");
        window.location.href = 'Chat.html';
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