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
    $("#dateTimeInput").attr("min", new Date().toISOString().split("T")[0] + "T00:00");
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

function displayAppointments(appointments) {
    if (appointments.length === 0) {
        $("#noAppointmentsLabel").fadeIn(250);
    } else {
        sort(appointments);
        $("#noAppointmentsLabel").hide();
        $(".appointment").remove();
        const appointsmentsContainer = $("#appointments");
        appointments.forEach(appointment => appointsmentsContainer.append(createAppointmentElement(appointment)));
    }
}

function sort(appointments) {
    for (let i = 1; i < appointments.length; i++) {
        let current = appointments[i];
        let j;
        for(j = i - 1; j >= 0 && compareAppointments(appointments[j], current); j--) {
            appointments[j + 1] = appointments[j]
        }
        appointments[j + 1] = current;
    }
}

const compareAppointments = (a1, a2) => a1.DATE_TIMES[a1.DATE_TIMES.length - 1].DATE_TIME < a2.DATE_TIMES[a2.DATE_TIMES.length - 1].DATE_TIME;

function createAppointmentElement(appointment) {
    const expired = new Date(appointment.DATE_TIMES[appointment.DATE_TIMES.length - 1].DATE_TIME) < Date.now();
    const appointmentBody = $(`<div class="appointment ${expired ? "expired" : ""}" />`);

    const container = $(`<div class="container-fluid" />`);
    const firstRow = $(`<div class="row mb-3" />`);
    const baseInfoColumn = $(`<div class="col-lg" />`);

    container.append(firstRow);
    firstRow.append(baseInfoColumn);
    baseInfoColumn.append(createBaseInfoContainer(appointment));

    if (!expired) {
        const descriptionColumn = $(`<div class="col-lg-4" />`);
        const secondRow = $(`<div class="row" />`);
        const dateTimeButtonsColumn = $(`<div class="col-lg" />`);
        const hr = $("<hr>");
        const thirdRow = $(`<div class="row" />`);
        const commentsColumn = $(`<div class="col-lg" />`);

        container.append(secondRow, hr, thirdRow);

        firstRow.append(descriptionColumn);
        descriptionColumn.hide();
        descriptionColumn.append(createDescriptionContainer(appointment));

        secondRow.hide();
        secondRow.append(dateTimeButtonsColumn);
        dateTimeButtonsColumn.append(createDateTimeButtonsContainer(appointment.DATE_TIMES));

        hr.hide();

        thirdRow.hide();
        thirdRow.append(commentsColumn);
        commentsColumn.append(createCommentsContainer(appointment));

        const fourthRow = $(`<div class="row" />`);
        const toggleButtonColumn = $(`<div class="col-lg center-text" />`);
        const toggleButton = $(`<button title="toggle" class="btn toggle-button nmt-4-5"><i class="bi bi-chevron-compact-down"></i></button>`);
        toggleButton.on("click", _e => toggleAppointment(toggleButton, descriptionColumn, secondRow, hr, thirdRow))

        fourthRow.append(toggleButtonColumn);
        toggleButtonColumn.append(toggleButton);

        container.append(fourthRow);

        firstRow.on("click", _e => toggleAppointment(toggleButton, descriptionColumn, secondRow, hr, thirdRow));
    }

    appointmentBody.append(container);
    return appointmentBody;
}

function toggleAppointment(toggleButton, detailsColumn, secondRow, hr, thirdRow) {
    toggleButton.toggleClass("rotate-180");
    toggleButton.toggleClass("nmt-4-5");
    detailsColumn.toggle(250);
    secondRow.toggle(250);
    hr.toggle(250);
    thirdRow.toggle(250);
}

function createBaseInfoContainer(appointment) {
    const baseInfoContainer = $(`<div class="container-xl h-100" />`);
    const firstRow = $(`<div class="row mb-3 h-50" />`);

    const firstRowFirstColumn = $(`<div class="col-xl" />`);
    firstRowFirstColumn.append($(`<p class="center-text title">${appointment.TITLE}</p>`));

    const firstRowSecondColumn = $(`<div class="col-xl" />`);
    firstRowSecondColumn.append($(`<p class="center-text location-duration"><i class="bi bi-geo-alt"></i> ${appointment.LOCATION}</p>`));

    const secondRow = $(`<div class="row h-50" />`);

    const secondRowFirstColumn = $(`<div class="col-xl" />`);
    secondRowFirstColumn.append($(`<p class="center-text created-by"><i class="bi bi-person"></i> ${appointment.CREATOR}</p>`));

    const secondRowSecondColumn = $(`<div class="col-xl" />`);
    secondRowSecondColumn.append($(`<p class="center-text location-duration"><i class="bi bi-stopwatch"></i></i> ${appointment.DURATION} minutes</p>`))

    firstRow.append(firstRowFirstColumn, firstRowSecondColumn);
    secondRow.append(secondRowFirstColumn, secondRowSecondColumn);
    baseInfoContainer.append(firstRow);
    baseInfoContainer.append(secondRow);
    return baseInfoContainer;
}

function createDescriptionContainer(appointment) {
    const container = $(`<div class="container-lg" />`);
    const row = $(`<div class="row" />`);
    const column = $(`<div class="col-lg" style="overflow-y: auto;max-height: 300px;" />`);
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
        const col = $(`<div class="col-sm" />`);
        col.append(createDateTimeButton(dateTime));
        row.append(col);
    });

    return container;
}

function createDateTimeButton(dateTime) {
    const date = new Date(dateTime.DATE_TIME);
    const userHasVoted = dateTime.VOTES.some(v => v.USERNAME === $("#username").html());
    const dateTimeButton = $(`<button ${date < Date.now() ? "disabled" : ""} class="btn btn-secondary vote-button ${userHasVoted ? "voted" : ""}">${date.toLocaleString()} (${dateTime.VOTES.length})</button>`);
    dateTimeButton.on("click", _e => voteAction(userHasVoted ? "DELETE" : "POST" , dateTime, dateTimeButton, dateTime.VOTES.length));
    return dateTimeButton;
}

function createCommentsContainer(appointment) {
    const container = $(`<div class="container-fluid" />`);
    const inputRow = $(`<div class="row mb-3" />`);
    const inputColumn = $(`<div class="col-sm-10 mb-3" />`);
    const buttonColumn = $(`<div class="col-sm-2 mb-3" />`);

    container.append(inputRow);
    inputRow.append(inputColumn, buttonColumn);
    const textarea = $(`<textarea placeholder="New comment..." class="w-100 h-100 comment-textarea"></textarea>`);
    inputColumn.append(textarea);
    const button = $(`<button title="Post Comment" class="btn w-100 h-100 comment-button"><i class="bi bi-arrow-return-left"></i></button>`);
    buttonColumn.append(button);

    button.on("click", _e => postComment(textarea, appointment, container));
    appointment.COMMENTS.forEach(comment => container.append(createCommentElement(comment)));
    return container;
}

function createCommentElement(comment) {
    const row = $(`<div class="row" />`);
    const col = $(`<div class="col-sm-12" />`);

    const commentContainer = $(`<div class="container-sm mb-4 comment" />`);
    const headerRow = $(`<div class="row mb-1" />`);
    const userNameColumn = $(`<div class="col-sm-6" />`);
    const creationColumn = $(`<div class="col-sm-6" style="text-align: right"/>`);
    const contentRow = $(`<div class="row" />`);
    const contentColumn = $(`<div class="col-sm-12" />`);

    commentContainer.append(headerRow, contentRow);
    headerRow.append(userNameColumn, creationColumn);
    userNameColumn.append(`<p class="comment-username"><i class="bi bi-person"></i> ${comment.USERNAME}</p>`);
    creationColumn.append(`<p class="comment-creation"><i class="bi bi-clock"></i> ${new Date(comment.CREATION).toLocaleString()}</p>`);
    contentRow.append(contentColumn);
    contentColumn.append(`<p class="comment-content">${comment.CONTENT}</p>`);

    col.append(commentContainer);
    row.append(col);
    return row;
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

// //////////////////////////////////////////////////////////////////////////
// Kommentieren
// //////////////////////////////////////////////////////////////////////////

function postComment(textarea, appointment, commentsContainer) {
    const username = $("#username").html();
    $.ajax({
        method: "POST",
        url: "../backend/api/v1/comment.php",
        data: JSON.stringify({ username: username, content: textarea.val(), appointmentId: appointment.ID }),
        contentType: "json",
        dataType: "json",
        success: comment => {
            comment.CONTENT = comment.content;
            comment.USERNAME = comment.username;
            comment.CREATION = Date.now();
            commentsContainer.children().eq(0).after(createCommentElement(comment));
        },
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
    textarea.val("");
}
