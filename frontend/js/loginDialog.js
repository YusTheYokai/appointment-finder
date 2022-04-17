function login() {
    const username = $("#usernameInput").val().trim();
    if (username.length === 0) {
        bootstrap.Toast.getOrCreateInstance(document.getElementById("usernameEmptyToast")).show();
    } else if (username.length < 3) {
        bootstrap.Toast.getOrCreateInstance(document.getElementById("usernameTooShortToast")).show();
    } else if (username.length > 30) {
        bootstrap.Toast.getOrCreateInstance(document.getElementById("usernameTooLongToast")).show();
    } else {
        createLoginCookie(username);
        $("#username").html(username);
        $("#usernameInput").val("");
        bootstrap.Modal.getInstance(document.getElementById("loginDialog"), null).hide();
    }
}

function createLoginCookie(username) {
    const date = new Date();
    // Der Cookie expired in 2 Stunden
    date.setTime(date.getTime() + 2 * 60 * 60 * 1000);
    document.cookie = `username=${username};expires=${date.toUTCString};`;
}