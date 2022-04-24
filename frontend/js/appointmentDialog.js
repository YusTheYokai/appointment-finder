/**
 * Date-Times als Millis
 */
let dateTimes = [];

// //////////////////////////////////////////////////////////////////////////
// Date-Times erstellen und anzeigen
// //////////////////////////////////////////////////////////////////////////

function addDateTime() {
    const dateTime = new Date($("#dateTimeInput").val());
    const millis = Date.parse(dateTime);

    if (isNaN(millis)) {
        bootstrap.Toast.getOrCreateInstance($("#dateTimeNotValidToast")[0]).show();
        return;
    } else if (dateTimes.indexOf(millis) !== -1) {
        bootstrap.Toast.getOrCreateInstance($("#dateTimeAlreadyAddedToast")[0]).show();
        return;
    }

    dateTimes.push(millis);
    dateTimes.sort();

    const index = dateTimes.indexOf(millis);
    const dateTimesContainer = $("#dateTimes");
    const dateTimeElement = createDateTimeElement(dateTime);
    dateTimeElement.hide();
    dateTimeElement.fadeIn(250);

    if (index === 0) {
        dateTimesContainer.prepend(dateTimeElement);
    } else {
        dateTimesContainer.children()[index - 1].after(dateTimeElement[0]);
    }
}

function createDateTimeElement(dateTime) {
    const dateTimeBadge = $(`<span class="badge bg-secondary date-time mb-1" style="background-color: ${getRandomColor()} !important">${dateTime.toLocaleString()}</span>`);
    const deleteButton = $(`<button class="delete-date-time-button"><i class="bi bi-x"></i></button>`);
    deleteButton.on("click", _e => removeDateTime(dateTimeBadge, dateTime));
    dateTimeBadge.append(deleteButton);
    return dateTimeBadge;
}

function removeDateTime(dateTimeBadge, dateTime) {
    dateTimeBadge.remove();
    dateTimes = dateTimes.filter(millis => millis !== Date.parse(dateTime));
}

function getRandomColor() {
    const letters = "ABCDEF";
    const numbers = "0123456789";
    return "#"
            // RED
            + numbers[Math.floor(Math.random() * numbers.length)] + numbers[Math.floor(Math.random() * numbers.length)]
            // GREEN
            + numbers[Math.floor(Math.random() * numbers.length)] + numbers[Math.floor(Math.random() * numbers.length)]
            // BLUE
            + letters[Math.floor(Math.random() * letters.length)] + numbers[Math.floor(Math.random() * numbers.length)];
}

// //////////////////////////////////////////////////////////////////////////
// Appointment erstellen
// //////////////////////////////////////////////////////////////////////////

function createAppointment() {
    $.ajax({
        method: "POST",
        url: "../backend/api/v1/appointment.php",
        data: createAppointmentJson(),
        contentType: "json",
        dataType: "json",
        success: _res => {
            closeDialog();
            bootstrap.Toast.getOrCreateInstance(document.getElementById("successfullyCreatedAppointmentToast")).show();
            loadContent();
        },
        error: e => e.responseJSON.forEach(createAndShowErrorToast)
    });
}

function createAppointmentJson() {
    return JSON.stringify({
        title: $("#titleInput").val(),
        location: $("#locationInput").val(),
        description: $("#descriptionInput").val(),
        duration: $("#durationInput").val(),
        creator: $("#username").html(),
        dateTimes: dateTimes
    });
}

// //////////////////////////////////////////////////////////////////////////
// Dialog
// //////////////////////////////////////////////////////////////////////////

function closeDialog() {
    bootstrap.Modal.getInstance(document.getElementById("appointmentDialog")).hide();
    $("#titleInput").val("");
    $("#locationInput").val("");
    $("#descriptionInput").val("");
    $("#durationInput").val("");
    $("#dateTimeInput").val("");
    $("#dateTimes").empty();
}
