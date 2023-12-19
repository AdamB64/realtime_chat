$(document).ready(function () {
    //console.log("Document ready!");

    $('#RegisterBtn').on('click', function () {
        // Navigate to the register page
        window.location.href = 'Register.html';
        //console.log("register");
    });

    $('#LoginBtn').on('click', function () {

        window.location.href = "Login.html";
        //console.log("Login")
    });
});