$(document).ready(function () {
    $('#RegisterActBtn').on('click', async function () {
        var username = $('#Rusername').val();
        var password = $('#Rpassword').val();
        if (username && !username.includes(" ")) {
            if (password && !password.includes(" ")) {
                console.log("register");
                // Clear input fields
                $('#Rusername').val('');
                $('#Rpassword').val('');

                let regsiterLogic = await registerUser(username, password);

                console.log(regsiterLogic);
                if (regsiterLogic == false) {
                    toastr.error("User already exists");
                } else {
                    window.location.href = 'Login.html?fromRegister=true';
                }
            } else {
                toastr.error("Password must not have spaces or be empty");
            }
        } else {
            toastr.error("Username must not have spaces or be empty");
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

    const registerUser = async (username, password) => {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log(data.message);
        if (data.message == "User already exits") {
            regsiterLogic = false;
        } else {
            regsiterLogic = true;
        }
        return regsiterLogic;
    }
});