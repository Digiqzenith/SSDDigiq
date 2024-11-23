// General Email Validation
export function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// General Mobile Validation (10 digits)
export function validateMobile(mobile) {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(mobile);
}

// Display Error Message
export function displayErrorMessage(inputElement, message) {
    const errorElement = inputElement.nextElementSibling;
    errorElement.textContent = message;
}

// Clear Error Messages
export function clearErrorMessages(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

export const getTokenFromCookie = () => {
    return document.cookie?.split('; ')?.find(row => row.startsWith('token='))?.split('=')[1]
};

export function buttonProperty(targetButtonId, value, message) {
    const submitButton = document.getElementById(targetButtonId);
    submitButton.disabled = value;
    submitButton.textContent = message;
}

export function showMessage(form, message, type = 'success') {
    // Remove any existing message
    const existingMessage = document.querySelector('.alert');
    if (existingMessage) existingMessage.remove();

    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`; // 'alert-success' or 'alert-danger'
    messageDiv.textContent = message;

    // Add the message to the specific form
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
    }

    setTimeout(() => {
        if (messageDiv) {
            messageDiv.remove();
        }
    }, 3000); // 3000 milliseconds = 3 seconds
}

