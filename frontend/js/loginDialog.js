function login() {
    const username = $("#usernameInput").val().trim();
    if (username.length === 0) {
        bootstrap.Toast.getOrCreateInstance($("#usernameEmptyToast")[0]).show();
    } else if (username.length < 3) {
        bootstrap.Toast.getOrCreateInstance($("#usernameTooShortToast")[0]).show();
    } else if (username.length > 30) {
        bootstrap.Toast.getOrCreateInstance($("#usernameTooLongToast")[0]).show();
    } else {
        loadAppointments();
        createLoginCookie(username);
        $("#username").html(username);
        $("#usernameInput").val("");
        bootstrap.Modal.getInstance($("#loginDialog")[0], null).hide();
        bootstrap.Toast.getOrCreateInstance($("#successfullyLoggedInToast")[0]).show();
    }
}

function createLoginCookie(username) {
    const date = new Date();
    // Der Cookie expired in 2 Stunden
    date.setTime(date.getTime() + 2 * 60 * 60 * 1000);
    document.cookie = `username=${username};expires=${date.toUTCString};`;
}