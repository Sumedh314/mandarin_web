import { request } from "../client";

/**
 * Sends a prompt to Google Gemini
 * 
 * @param {string} prompt The prompt to send to gemini
 * @param {object} [schema={}] schema Schema for Gemini to return content in
 */
export async function fetchGeminiPrompt(prompt, schema = {}) {
    const data = { prompt: prompt, schema: schema };
    return await request('/prompt_gemini', 'GET', data);
}