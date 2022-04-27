function createAndShowErrorToast(msg) {
    const uuid = uuidv4();
    $("#toasts").append(`
        <div id="${uuid}" class="toast toast-error" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">ERROR</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${msg}</div>
        </div>
    `);
    bootstrap.Toast.getOrCreateInstance($("#" + uuid)[0]).show();
}
