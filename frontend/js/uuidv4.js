// courtesy: https://qawithexperts.com/article/javascript/generating-guiduuid-using-javascript-various-ways/372
function uuidv4() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return "uuidv4-" + uuid;
}
