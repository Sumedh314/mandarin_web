import { request } from "../client";

/**
 * Gets the English translation of a word from Python.
 * 
 * @param {string} text text user wants to translate
 */
export async function fetchTranslation(text) {
    return await request('/translate_text', 'GET', text);
}

/**
 * Gets the pinyin representation of a word from Python.
 * 
 * @param {string} text text user wants to get pinyin of
 */
export async function fetchPinyin(text) {
    return await request('/get_pinyin', 'GET', text);
}