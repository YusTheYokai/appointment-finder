$(() => {
    // DIALOGE
    let loginModal;

    const dialogsContainer = $("#dialogs");
    const loginDialog = $("<div />").load("components/loginDialog/loginDialog.html",
            () => loginModal = openLoginDialogIfNoCookie(dialogsContainer, loginDialog));
    const appointmentDialog = $("<div />").load("components/appointmentDialog/appointmentDialog.html",
            () => dialogsContainer.append(appointmentDialog));
    
    // TOASTS
    const toastContainer = $("#toasts");
    const loginDialogToasts = $("<div />").load("components/loginDialog/loginDialogToasts.html");
    const appointmentDialogToasts = $("<div />").load("components/appointmentDialog/appointmentDialogToasts.html");
    toastContainer.append(loginDialogToasts, appointmentDialogToasts);

    // NAVBAR
    $("#logoutButton").on("click", _e => {
        $("#username").html("");
        $("#usernameInput").val("");
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        loginModal.show();
    });
});

function openLoginDialogIfNoCookie(dialogsContainer, loginDialog) {
    dialogsContainer.append(loginDialog);
    const loginModal = new bootstrap.Modal(document.getElementById("loginDialog"), null);

    const usernameCookie = findUsernameCookie();
    if (usernameCookie) {
        $("#username").html(usernameCookie);
    } else {
        loginModal.show();
    }

    return loginModal;
}

function findUsernameCookie() {
    const decodedCookie = decodeURIComponent(document.cookie);
    let cookies = decodedCookie.split(";");
    cookies = cookies.map(c => {
        const splitted = c.split("=");
        return {
            key: splitted[0],
            value: splitted[1]
        }
    }).filter(c => c.key === "username");
    return cookies.length === 0 ? null : cookies[0].value;
}

function openAddAppointmentDialog() {
    $("#appointmentDialogTitle").html("Add Appointment");
    new bootstrap.Modal(document.getElementById("appointmentDialog"), null).show();
}