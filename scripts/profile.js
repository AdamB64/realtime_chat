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
    console.log('Username:', username);
    $('#user').append(username);
    console.log("value " + $('#user').val());


    try {
        const response = await fetch('/profile-picture?username=' + username);
        //console.log(response);

        const data = await response.json();
        //console.log("data" + JSON.stringify(data));
        if (data.profilePicture) {
            //console.log(data.profilePicture);
            $('#profilePicture').attr('src', data.profilePicture);
        } else {
            console.log('No user is currently logged in');
        }
    } catch (error) {
        console.log(error);
    }

    $('#profileForm').on('submit', function (e) {
        e.preventDefault();

        let formData = new FormData(this);
        formData.append('username', 'ben');

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success: function (data) {
                toastr.success('Upload successful');
                // You can update the profile picture here if you want
                $('#profilePicture').attr('src', data.profilePicture);
            },
            error: function (error) {
                console.log('Error:', error);
                console.log('Upload failed');
            }
        });
    });

    $('#passwordForm').on('submit', async function (e) {
        e.preventDefault();
        //console.log($('#password').val());
        if ($('#password').val() != $('#password2').val()) {
            toastr.error('Passwords do not match');
            return;
        } else {

            const response = await fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password: $('#password').val() })
            });
            toastr.success('Password changed successfully');
        }
    });

    $('#changeProfilePicture').on('click', function () {
        $('#profileForm').toggle();
    });

    $('#changePassword').on('click', function () {
        $('#passwordForm').toggle();
    });
});