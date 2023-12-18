$(document).ready(function () {
    toastr.success("User created successfully");
    $('#LoginActBt').on('click', function () {
        console.log("login");
        var username = $('#LUsername').val();
        // Clear input fields
        $('#LUsername').val('');
        $('#LPassword').val('');
        window.location.href = 'Chat.html?username=' + encodeURIComponent(username);
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
    $('#RegisterArcBtn').on('click', function () {
        window.location.href = 'Register.html';
    });
});