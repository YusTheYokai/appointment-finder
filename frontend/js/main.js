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
    const appointmentBody = $(`<div class="appointment" />`);

    const container = $(`<div class="container-fluid" />`);
    const firstRow = $(`<div class="row" />`);
    const baseInfoColumn = $(`<div class="col-lg" />`);
    const detailsColumn = $(`<div class="col-lg-4" />`);
    const secondRow = $(`<div class="row" />`);
    const dateTimeButtonsColumn = $(`<div class="col-lg" />`);
    const thirdRow = $(`<div class="row" />`);
    const commentsColumn = $(`<div class="col-lg" />`);

    container.append(firstRow, secondRow, thirdRow);

    firstRow.append(baseInfoColumn, detailsColumn);
    baseInfoColumn.append(createBaseInfoContainer(appointment));
    detailsColumn.hide();
    detailsColumn.append(createDescriptionContainer(appointment));

    secondRow.hide();
    secondRow.append(dateTimeButtonsColumn);
    dateTimeButtonsColumn.append(createDateTimeButtonsContainer(appointment.DATE_TIMES));

    thirdRow.hide();
    thirdRow.append(commentsColumn);
    commentsColumn.append(createCommentsContainer(appointment));

    firstRow.on("click", _e => { detailsColumn.toggle(250); secondRow.toggle(250); thirdRow.toggle(250); });
    appointmentBody.append(container);
    return appointmentBody;
}

function createBaseInfoContainer(appointment) {
    const baseInfoContainer = $(`<div class="container-xl" />`);
    const firstRow = $(`<div class="row" />`);

    const firstRowFirstColumn = $(`<div class="col-xl" />`);
    firstRowFirstColumn.append($(`<p class="title">${appointment.TITLE}</p>`));

    const firstRowSecondColumn = $(`<div class="col-xl" />`);
    firstRowSecondColumn.append($(`<p class="location-duration"><i class="bi bi-geo-alt"></i> ${appointment.LOCATION}</p>`));

    const secondRow = $(`<div class="row" />`);

    const secondRowFirstColumn = $(`<div class="col-xl" />`);
    secondRowFirstColumn.append($(`<p class="created-by"><i class="bi bi-person"></i> ${appointment.CREATOR}</p>`));

    const secondRowSecondColumn = $(`<div class="col-xl" />`);
    secondRowSecondColumn.append($(`<p class="location-duration"><i class="bi bi-clock"></i> ${appointment.DURATION} minutes</p>`))

    firstRow.append(firstRowFirstColumn, firstRowSecondColumn);
    secondRow.append(secondRowFirstColumn, secondRowSecondColumn);
    baseInfoContainer.append(firstRow);
    baseInfoContainer.append(secondRow);
    return baseInfoContainer;
}

function createDescriptionContainer(appointment) {
    const container = $(`<div class="container-lg" />`);
    const row = $(`<div class="row" />`);
    const column = $(`<div class="col-lg" />`);
    column.append($(`<p class="description"><i class="bi bi-info-circle"></i> ${appointment.DESCRIPTION}</p>`));
    row.append(column);
    container.append(row);
    return container;
}

function createDateTimeButtonsContainer(dateTimes) {
    const BUTTONS_PER_ROW = 4;
    const container = $(`<div class="container-sm" />`);

    let row;
    dateTimes.forEach((dateTime, index, _arr) => {
        if (index % BUTTONS_PER_ROW === 0) {
            row = $(`<div class="row" />`);
            container.append(row);
        }
        const col = $(`<div class="col-sm-${12 / BUTTONS_PER_ROW}" />`);
        col.append(createDateTimeButton(dateTime));
        row.append(col);
    });

    return container;
}

function createDateTimeButton(dateTime) {
    const userHasVoted = dateTime.VOTES.some(v => v.USERNAME === $("#username").html());
    const dateTimeButton = $(`<button class="btn btn-secondary vote-button ${userHasVoted ? "voted" : ""}">${new Date(dateTime.DATE_TIME).toLocaleString()} (${dateTime.VOTES.length})</button>`);
    dateTimeButton.on("click", _e => voteAction(userHasVoted ? "DELETE" : "POST" , dateTime, dateTimeButton, dateTime.VOTES.length));
    return dateTimeButton;
}

function createCommentsContainer(appointment) {
    const container = $(`<div class="container-fluid" />`);
    const inputRow = $(`<div class="row" />`);
    const inputColumn = $(`<div class="col-sm-10" />`);
    const buttonColumn = $(`<div class="col-sm-2" />`);

    container.append(inputRow);
    inputRow.append(inputColumn, buttonColumn);
    const textarea = $(`<textarea class="w-100"></textarea>`);
    inputColumn.append(textarea);
    const button = $(`<button class="btn"><i class="bi bi-arrow-return-left"></i></button>`);
    buttonColumn.append(button);

    button.on("click", _e => {
        $.ajax({
            method: "POST",
            url: "../backend/api/v1/comment.php",
            data: JSON.stringify({ username: $("#username").html(), content: textarea.val(), appointmentId: appointment.ID }),
            contentType: "json",
            dataType: "json",
            success: _res => {
                bootstrap.Toast.getOrCreateInstance(document.getElementById("successfullyCreatedCommentToast")).show();
                //TODO Einzelnes Kommentar einfügen statt alles neu zu laden
                loadAppointments();
            },
            error: e => e.responseJSON.forEach(createAndShowErrorToast)
        });

    })

    appointment.COMMENTS.forEach(comment => {
        const row = $(`<div class="row" />`);
        const col = $(`<div class="col-sm-12" />`);

        const commentContainer = $(`<div class="container-sm" />`);
        const headerRow = $(`<div class="row" />`);
        const userNameColumn = $(`<div class="col-sm-6" />`);
        const creationColumn = $(`<div class="col-sm-6" style="text-align: right"/>`);
        const contentRow = $(`<div class="row" />`);
        const contentColumn = $(`<div class="col-sm-12" />`);

        commentContainer.append(headerRow, contentRow);
        headerRow.append(userNameColumn, creationColumn);
        userNameColumn.append(comment.USERNAME);
        creationColumn.append(new Date(comment.CREATION).toLocaleString());
        contentRow.append(contentColumn);
        contentColumn.append(comment.CONTENT);

        col.append(commentContainer);
        row.append(col);
        container.append(row);
    });

    return container;
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
