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

    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let konamiCodeIndex = 0;

    function checkKonamiCode(event) {
        const key = event.key.toLowerCase();
        console.log(key);
        if (key === konamiCode[konamiCodeIndex]) {
            konamiCodeIndex++;

            if (konamiCodeIndex === konamiCode.length) {
                // Konami Code successfully entered, redirect to Tetris.html
                console.log('Konami Code entered!');
                window.location.href = 'Tetris.html';
            }
        } else {
            // Reset the code index if a wrong key is pressed
            konamiCodeIndex = 0;
        }
    }

    document.addEventListener('keydown', checkKonamiCode);
});