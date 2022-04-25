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

// //////////////////////////////////////////////////////////////////////////
// Login und Cookie
// //////////////////////////////////////////////////////////////////////////

function openLoginDialogIfNoCookie(dialogsContainer, loginDialog) {
    dialogsContainer.append(loginDialog);
    const loginModal = new bootstrap.Modal(document.getElementById("loginDialog"), null);

    const usernameCookie = findUsernameCookie();
    if (usernameCookie) {
        loadAppointments();
        $("#username").html(usernameCookie);
    } else {
        // Wenn man nicht eingeloggt ist werden die Appointments geladen, sobald man sich eingeloggt hat.
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

// //////////////////////////////////////////////////////////////////////////
// Appointments laden und anzeigen
// //////////////////////////////////////////////////////////////////////////

function loadAppointments() {
    $.ajax({
        method: "GET",
        url: "../backend/api/v1/appointment.php",
        contentType: "json",
        dataType: "json",
        success: displayAppointments,
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
}

function displayAppointments(res) {
    if (Object.keys(res).length === 0) {
        $("#noAppointmentsLabel").fadeIn(250);
    } else {
        $("#noAppointmentsLabel").hide();
        $(".appointment").remove();
        const appointsmentsContainer = $("#appointments");
        res.forEach(appointment => appointsmentsContainer.append(createAppointmentElement(appointment)));
    }
}

function createAppointmentElement(appointment) {
    const appointmentBody = $("<div />");
    appointmentBody.addClass('appointment');
    appointmentBody.append($(`<h2>Title: ${appointment.TITLE}</h2>`));
    appointmentBody.append($(`<div>Creator: ${appointment.CREATOR}</div>`));
    appointmentBody.append($(`<div>Location: ${appointment.LOCATION}</div>`));
    appointmentBody.append($(`<div>Duration: ${appointment.DURATION}</div>`));

    const uuid = uuidv4();
    const detailsContainer = $(`<div id="${uuid}" class="collapse" />`);
    detailsContainer.append(`<div>Description: ${appointment.DESCRIPTION}</div>`);
    const dateTimeButtonsContainer = $("<div />");
    appointment.DATE_TIMES.forEach(dateTime => dateTimeButtonsContainer.append(createDateTimeButton(dateTime)));
    detailsContainer.append(dateTimeButtonsContainer);
    appointmentBody.append(detailsContainer);

    const expandButton = $(`<button class="btn btn-primary showMoreButton" type="button" data-bs-toggle="collapse" data-bs-target="#${uuid}" aria-expanded="false" aria-controls="${uuid}">show more</button>`);
    appointmentBody.append(expandButton);
    return appointmentBody;
}

function createDateTimeButton(dateTime) {
    const userHasVoted = dateTime.VOTES.some(v => v.USERNAME === $("#username").html());
    const dateTimeButton = $(`<button class="btn btn-secondary ${userHasVoted ? "voted" : ""}">${new Date(dateTime.DATE_TIME).toLocaleString()} (${dateTime.VOTES.length})</button>`);
    dateTimeButton.on("click", _e => voteAction(userHasVoted ? "DELETE" : "POST" , dateTime, dateTimeButton, dateTime.VOTES.length));
    return dateTimeButton;
}

// //////////////////////////////////////////////////////////////////////////
// Voten
// //////////////////////////////////////////////////////////////////////////

function voteAction(method, dateTime, button, count) {
    $.ajax({
        method: method,
        url: "../backend/api/v1/vote.php",
        data: JSON.stringify({ "dateTimeId": dateTime.ID, "username": $("#username").html() }),
        contentType: "json",
        dataType: "json",
        success: _res => {
            if (method === "POST") {
                button.addClass("voted");
                button.html(`${new Date(dateTime.DATE_TIME).toLocaleString()} (${++count})`);
                button.off("click");
                button.on("click", _e => voteAction("DELETE", dateTime, button, count));
            } else if (method === "DELETE") {
                button.removeClass("voted");
                button.html(`${new Date(dateTime.DATE_TIME).toLocaleString()} (${--count})`);
                button.off("click");
                button.on("click", _e => voteAction("POST", dateTime, button, count));
            }
        },
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
}
