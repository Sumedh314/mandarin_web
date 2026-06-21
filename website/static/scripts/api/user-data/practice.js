import { request } from "../client";

/**
 * Fetches a list of words the user is currently learning.
 * 
 * @param {number} numWords Number of words to return in list
 */
export async function fetchRandomListWordsLearning(numWords) {
    return await request('/fetch_random_list_words_learning', 'GET', numWords);
}

/**
 * Fetches a list of words the user has saved.
 * 
 * @param {number} numWords Number of words to return in list
 */
export async function fetchRandomListWordsSaved(numWords) {
    return await request('/fetch_random_list_words_saved', numWords);
}

/**
 * Adds a word to saved_words.json
 * 
 * @param {string} word Word to save
 */
export async function updateSavedWord(word) {
    return await request('/toggle_saved_word', 'POST', word);
}

/**
 * Checks if a word is saved by the user
 * 
 * @param {string} word Word to check
 */
export async function fetchCheckSaved(word) {
    return await request('/check_saved', 'GET', word);
}

/**
 * Force the program to generate new sentences for words that are running low on sentences
 */
export async function createPracticeSentences() {
    return await request('/force_generate_practice_sentences', 'POST');
}

/**
 * Give a sentence that includes the given word for the user to practice with
 * 
 * @param {string} word Word to fetch sentence for
 */
export async function fetchSentence(word) {
    return await request('/fetch_sentence', 'GET', word);
}