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
    loadContent();
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

function loadContent() {
    $.ajax({
        method: "GET",
        url: "../backend/api/v1/appointment.php",
        contentType: "json",
        dataType: "json",
        success: displayContent,
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
}

function displayContent(res) {
    if (Object.keys(res).length === 0) {
        let noData = $("<div />");
        noData.addClass('noData');
        noData.append("No data avaiable");
        $("#appointmentData").append(noData);
    } else {
        const empty = document.querySelectorAll('.noData');
        empty.forEach(noData => {
            noData.remove(); 
        });
        const removeAllAppointment = document.querySelectorAll('.appointment');
        removeAllAppointment.forEach(appointment => {
            appointment.remove(); 
        });
        res.forEach(appointment => {
            let appointmentBody = $("<div />");
            appointmentBody.addClass('appointment');
            appointmentBody.append($(`<h2>Title: ${appointment.TITLE}</h2>`));
            appointmentBody.append($(`<div>Creator: ${appointment.CREATOR}</div>`));
            appointmentBody.append($(`<div>Location: ${appointment.LOCATION}</div>`));
            appointmentBody.append($(`<div>Duration: ${appointment.DURATION}</div>`));

            const uuid = uuidv4();
            const details = $(`<div id="${uuid}" class="collapse" />`);
            details.append(`<div>Description: ${appointment.DESCRIPTION}</div>`);
            const dateTimesDiv = $("<div />");
            appointment.DATE_TIMES.forEach(dateTime => {
                const dateTimeButton = $(`<button class="btn btn-secondary">${new Date(dateTime.DATE_TIME).toLocaleString()}</button>`);
                dateTimeButton.on("click", _e => vote(dateTime));
                dateTimesDiv.append(dateTimeButton);
            });
            details.append(dateTimesDiv);
            appointmentBody.append(details);

            const expandButton = $(`<button class="btn btn-primary showMoreButton" type="button" data-bs-toggle="collapse" data-bs-target="#${uuid}" aria-expanded="false" aria-controls="${uuid}">show more</button>`);
            appointmentBody.append(expandButton);
            $("#appointmentData").append(appointmentBody);
        })
    }
}

function vote(dateTime) {
    $.ajax({
        method: "POST",
        url: "../backend/api/v1/vote.php",
        data: JSON.stringify({ "dateTimeId": dateTime.ID, "username": $("#username").html() }),
        contentType: "json",
        dataType: "json",
        success: _res => {
            // TODO: vielleicht Toast anzeigen, dass gevotet wurde
            // denke aber, dass es hier unnötig ist tbh
            loadContent();
        },
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
}
