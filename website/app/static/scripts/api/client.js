/**
 * Make a request to the backend to get or modify data
 * 
 * @param {string} endpoint The endpoint which the function will call
 * @param {string} method HTTP method for function to use
 * @param {string | object} body Information to pass to backend
 * @param {string} [urlPrefix='/api/v1'] Prefix for the URL
 * @returns {Promise<object | string>} What the API request returns
 */
export default async function request(endpoint, method, body, urlPrefix = '/api/v1') {
    const options = { method: method };
    const headers = {};
    
    if (body !== undefined) {
        const bodyIsString = typeof body == 'string';
        
        headers['Content-Type'] = bodyIsString ? 'text/plain' : 'application/json';

        options.body = bodyIsString ? body : JSON.stringify(body);
    }

    const cookie = getCookie('csrf_access_token');
    if (cookie != null) {
        headers['X-CSRF-TOKEN'] = cookie;
    }

    if (Object.keys(headers).length != 0) {
        options.headers = headers;
    }

    console.log(endpoint, options);
    
    const requestResponse = await fetch(`${urlPrefix}${endpoint}`, options);
    
    if (requestResponse.headers.get('content-type') == 'application/json') {
        return await requestResponse.json();
    }
    else {
        return await requestResponse.text();
    }
}

/**
 * Get the value of a cookie by its name
 * 
 * @param {string} name Name of cookie
 * @returns {string} The Value of the cookie
 */
async function getCookie(name) {
    const cookie = await cookieStore.get(name);
    return cookie ? cookie.value : undefined;
}