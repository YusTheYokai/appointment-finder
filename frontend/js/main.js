$(() => {
    console.log("Ready");
    $("#dialogs").load("components/appointmentDialog.html");
});

function openAddAppointmentDialog() {
    $("#appointmentDialogTitle").html("Add Appointment")
    new bootstrap.Modal($("#appointmentDialog"), null).show();
}