$(document).ready(async function () {
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


    try {
        const response = await fetch('/profile-picture?username=' + username);
        console.log(response);
        const data = await response.json();
        console.log("data" + JSON.stringify(data));
        if (data.profilePicture) {
            //console.log(data.profilePicture);
            $('#profilePicture').attr('src', data.profilePicture);
        } else {
            console.log('No user is currently logged in');
        }
    } catch (error) {
        console.log(error);
    }

    $('form').on('submit', function (e) {
        e.preventDefault();

        let formData = new FormData(this);

        $.ajax({
            url: '/upload?username=' + username,
            type: 'POST',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            success: function (data) {
                console.log('Upload successful');
                // You can update the profile picture here if you want
                // $('#profilePicture').attr('src', data.profilePicture);
            },
            error: function (error) {
                console.log('Error:', error);
            }
        });
    });
});