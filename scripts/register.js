$(document).ready(function () {
    $('#RegisterActBtn').on('click', function () {
        console.log("register");
        window.location.href = 'Login.html';
    });

    $('#RShowPassword').on('click', function () {
        console.log("works")
        var x = $("#Rpassword");
        if (x.prop("type") == "password") {
            x.prop("type", "text");
        } else {
            x.prop("type", "password");
        }
    });
});