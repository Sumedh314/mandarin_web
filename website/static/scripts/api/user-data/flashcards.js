import { request } from "../client.js";

/**
 * Gets the review times for the different ratings a user can give to a word
 * 
 * @param {string} word Word to get next review times for
 */
export async function fetchReviewTimes(word) {
    return await request('/fetch_review_times', 'POST', word);
}

/**
 * Gets the next word and card for the user to review
 * 
 * @param {number} [wordIndex=0] Index of list of due words to use
 */
export async function fetchNextWord(wordIndex = 0) {
    return await request('/fetch_next_word', 'POST', wordIndex);
}

/**
 * Gets a list of flashcard words that are due for the user to review
 */
export async function fetchDueWords() {
    return await request('/fetch_due_words', 'GET');
}

/**
 * Creates all flashcards based on words that the user saved using flaskcards_data.json
 */
export async function createInitialCards() {
    return await request('/create_initial_cards', 'POST');
}

/**
 * Creates one card for a word that user has saved
 * 
 * @param {string} word Word to create flashcard for
 */
export async function createCard(word) {
    return await request('/create_card', 'POST', word);
}

/**
 * Updates a card 
 * 
 * @param {string} word Word that card tested user for
 * @param {number} rating Rating of 0, 1, 2, or 3 that user gave word
 */
export async function fetchUpdateCard(word, rating) {
    const data = { word: word, rating: rating };
    
    return await request('update_card', 'POST', data);
}