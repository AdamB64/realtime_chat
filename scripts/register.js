$(document).ready(function () {
    $('#RegisterActBtn').on('click', function () {
        var username = $('#Rusername').val();
        var password = $('#Rpassword').val();
        if (username && !username.includes(" ")) {
            if (password && !password.includes(" ")) {
                console.log("register");
                window.location.href = 'Login.html';
            } else {
                alert("Password must not have spaces or be empty");
            }
        } else {
            alert("Username must not have spaces or be empty");
        }
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