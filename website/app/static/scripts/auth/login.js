import { errorMessage, loginForm } from "../document-areas.js";
import { login } from "../api/routes.js";

/**
 * Log in a user onto the site based on the data in the form
 * 
 * @param {SubmitEvent} event Form that user submitted
 */
async function loginUser(event) {

    // Prevent page from reloading
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    const response = await login({ username: userData.username, password: userData.password });
    console.log(document.cookie);
    console.log(response);
    
    if (Object.keys(response).includes('url')) {
        window.location.href = response.url;
    }
    else {
        errorMessage.textContent = response;
    }
}

loginForm.addEventListener('submit', loginUser)