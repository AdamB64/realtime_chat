$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var fromRegister = urlParams.get('fromRegister');
    if (fromRegister == "true") {
        toastr.success("User created successfully");
    }
    $('#LoginActBt').on('click', async function () {
        console.log("login");
        var username = $('#LUsername').val();
        var password = $('#LPassword').val();
        // Clear input fields
        $('#LUsername').val('');
        $('#LPassword').val('');
        let loginLogic = await loginUser(username, password);
        console.log(loginLogic);
        if (loginLogic == false) {
            toastr.error("User does not exist or password is incorrect");
        } else {
            window.location.href = 'Chat.html?username=' + encodeURIComponent(username);
        }
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

    const loginUser = async (username, password) => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log(data.message);
        if (data.message == "User logged in successfully") {
            loginLogic = true;
        } else {
            loginLogic = false;
        }
        return loginLogic;
    }
});