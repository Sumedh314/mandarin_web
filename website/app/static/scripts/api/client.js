/**
 * Make a request to the backend to get or modify data
 * 
 * @param {string} endpoint The endpoint which the function will call
 * @param {string} method HTTP method for function to use
 * @param {string | object} body Information to pass to backend
 */
export async function request(endpoint, method, body) {
    const options = { method: method };
    
    if (body !== undefined) {
        const bodyIsString = typeof body == 'string';
        
        options.headers = { 'Content-Type': bodyIsString ? 'text/plain' : 'application/json' };
        options.body = bodyIsString ? body : JSON.stringify(body);
    }

    const requestResponse = await fetch(endpoint, options);
    
    if (requestResponse.headers.get('content-type') == 'application/json') {
        return await requestResponse.json();
    }
    else {
        return await requestResponse.text();
    }
}