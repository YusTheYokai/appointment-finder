function createAndShowErrorToast(msg) {
    const uuid = uuidv4();
    $("#toasts").append(`
        <div id="${uuid}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">ERROR</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${msg}</div>
        </div>
    `);
    bootstrap.Toast.getOrCreateInstance($("#" + uuid)[0]).show();
}

// courtesy: https://qawithexperts.com/article/javascript/generating-guiduuid-using-javascript-various-ways/372
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}