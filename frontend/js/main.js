$(() => {
    console.log("Ready");
    $("#dialogs").load("components/appointmentDialog/appointmentDialog.html");
    $("#toasts").load("components/appointmentDialog/appointmentDialogToasts.html");
});

function openAddAppointmentDialog() {
    $("#appointmentDialogTitle").html("Add Appointment")
    new bootstrap.Modal($("#appointmentDialog"), null).show();
}