import { checkPasswordsMatch, registrationForm } from "../document-areas.js";
import { register } from '../api/routes.js'

/**
 * Register a new user onto the site based on the data in the form
 * 
 * @param {SubmitEvent} event Form that user submitted
 */
async function registerUser(event) {

    // Prevent page from reloading
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    if (userData['password'] != userData['repeat-password']) {
        checkPasswordsMatch.hidden = false;
        return;
    }

    try {
        const response = await register({ username: userData.username, password: userData.password });
    
        if (Object.keys(response).includes('url')) {
            window.location.href = response.url;
        }
    } catch (error) {
        checkPasswordsMatch.textContent = error;
    }
}

registrationForm.addEventListener('submit', registerUser);