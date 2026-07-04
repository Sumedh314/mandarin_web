import request from "./client.js";

/**
 * Adds a list of words to the database
 * 
 * @param {Array} words List of words to add to database
 * @returns {Promise<string>} The success or error message
 */
export async function addWords(words) {
    // const words_data = Object.fromEntries(words.map(word => [word, {text: word}]));
    const words_data = [];
    for (const word of words) {
        words_data.push({ text: word });
    }
    return await request('/words', 'POST', words_data);
}

/**
 * Gets the IDs of each word from the database
 * 
 * @param {Array<string>} words The list of words to get the IDs of
 * @returns {Promise<object<string, number>>} The IDs of each word
 */
export async function getWordIds(words) {
    const args = words.map(word => `word=${encodeURIComponent(word)}`).join('&');
    return await request(`/words/ids?${args}`, 'GET');
}

/**
 * Gets the proficiency levels of each word of the given array
 * 
 * @param {Array} wordIds List of word IDs
 * @returns {Promise<object<string, number>>} The proficiency levels of the given words
 */
export async function getWordProficiencyLevels(wordIds) {
    const args = wordIds.map(wordId => `id=${encodeURIComponent(wordId)}`).join('&');
    return await request(`/words/proficiency-levels?${args}`, 'GET');
}

/**
 * Updates the proficiency levels for a list of words
 *
 * @param {object} newProficiencyLevels New proficiency levels with keys being words and values being their new levels
 * @returns {Promise<string>} The success or error message
 */
export async function updateWordProficiencyLevels(newProficiencyLevels) {
    return await request('/words/proficiency-levels', 'PATCH', { proficiency_levels: newProficiencyLevels });
}

/**
 * Calculates the new proficiency levels for a list of words based on the user's interaction
 * 
 * @param {Array} previousWordIds List of previous word IDs. Increments proficiency of these words, sets max proficiency if previously zero.
 * @param {number} currentWordId ID of the word the user clicked on. Decrements its proficiency by one if greater than one, increments if zero.
 * @returns {Promise<object<string, number>>} The new proficiency levels of the given words
 */
export async function calculateNewProficiencyLevels(previousWordIds, currentWordId) {
    return await request('/words/proficiency-levels/calculate', 'POST', {
        previous_words: previousWordIds,
        current_word: currentWordId
    });
}

/**
 * Gets whether or not a word is saved
 * 
 * @param {number} id The word ID to check
 * @returns {Promise<boolean>} A promise that resolves to true if the word is saved, false otherwise
 */
export async function checkIfWordSaved(id) {
    return await request(`/words/saved/${encodeURIComponent(id)}`, 'GET');
}

/**
 * Toggles the saved status of a word
 * 
 * @param {number} wordId The word to toggle
 * @returns {Promise<string>} The success or error message
 */
export async function toggleWordSaved(word) {
    return await request(`/words/saved/${encodeURIComponent(word)}`, 'PATCH');
}

/**
 * Gets a list of every word that the user has saved
 * 
 * @returns {Promise<Array<str>>} Words that are saved
 */
export async function getSavedWords() {
    return await request('/words/saved', 'GET');
}

/**
 * Segments a piece of Mandarin text into individual words
 * 
 * @param {string} text The text to segment
 * @returns {Promise<Array<string>>} The segmented text
 */
export async function segmentText(text) {
    return await request(`/language/segment?text=${encodeURIComponent(text)}`, 'GET');
}

/**
 * Gets the pinyin representation of a piece of Mandarin text
 * 
 * @param {string} text The text to convert to pinyin
 * @returns {Promise<string>} The pinyin representation of the text
 */
export async function getPinyin(text) {
    return await request(`/language/pinyin?text=${encodeURIComponent(text)}`, 'GET');
}

/**
 * Gets the translation of a piece of text
 * 
 * @param {string} text The text to translate
 * @returns {Promise<string>} The translation of the text
 */
export async function translateText(text) {
    return await request(`/language/translate?text=${encodeURIComponent(text)}`, 'GET');
}

/**
 * Adds a list of sentences for a specific word to the database
 * 
 * @param {Array<string>} sentences List of sentences to add
 * @param {string} wordId Word ID for which to add sentences
 * @returns {Promise<string>} The success or error message
 */
export async function addSentences(sentences, wordId) {
    return await request('/sentences', 'POST', {
        sentences: sentences,
        word: wordId
    });
}

/**
 * Gets the first sentence for a word that is available in the database
 * 
 * @param {number} wordId ID of word that the user saved that the sentence must contain
 * @returns {Promise<string>} Sentence containing the given word
 */
export async function getSentence(wordId) {
    return await request(`/sentences/${encodeURIComponent(wordId)}`, 'GET');
}

/**
 * Deletes a practice sentence from the database
 * 
 * @param {string} sentence Sentence to delete
 * @param {string} wordId ID of word that the sentence contains
 */
export async function deleteSentence(sentence, wordId) {
    return await request(`/sentences?sentence=${encodeURIComponent(sentence)}&word=${encodeURIComponent(wordId)}`, 'DELETE');
}

/**
 * Adds a video to the user's database
 * 
 * @param {string} videoId ID of the video
 * @returns {Promise<string>} The success or error message
 */
export async function addVideo(videoId) {
    return await request('/videos', 'POST', { video_id: videoId });
}

/** Gets the title of a video from the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<string>} The title of the video
 */
export async function getVideoTitle(videoId) {
    return await request(`/videos/${videoId}/title`, 'GET');
}

/**
 * Updates the title of a video in the database
 * 
 * @param {string} videoId The ID of the video
 * @param {string} title The title to set for the video
 * @returns {Promise<string>} The success or error message
 */
export async function updateVideoTitle(videoId, title) {
    return await request(`/videos/${videoId}/title`, 'PATCH', { title: title });
}

/**
 * Checks if a video exists in the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<boolean>} Whether or not the video exists
 */
export async function checkIfVideoExists(videoId) {
    return await request(`/videos/check?video_id=${videoId}`, 'GET');
}

/**
 * Updates the last index of a video in the database
 * 
 * @param {string} videoId The ID of the video
 * @param {number} lastIndex The last index of the video to set to
 * @returns {Promise<string>} The success or error message
 */
export async function updateVideoLastIndex(videoId, lastIndex) {
    return await request(`/videos/${videoId}/last-index`, 'PATCH', { last_index: lastIndex });
}

/**
 * Gets the last index of a video from the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<number>} The last index of the video
 */
export async function getVideoLastIndex(videoId) {
    return await request(`/videos/${videoId}/last-index`, 'GET');
}

/**
 * 
 * @param {string} videoId The ID of the video
 * @param {object<string, string | number>} transcript The transcript of the video
 * @returns {Promise<string>} The success or error message
 */
export async function addTranscript(videoId, transcript) {
    return await request('/transcripts', 'POST', { video_id: videoId, transcript: transcript });
}

/**
 * Gets the transcript of a video from the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<object<string, string | number>>} The transcript of the video
 */
export async function getTranscriptFromDatabase(videoId) {
    return await request(`/transcripts/data/${videoId}`, 'GET');
}

/**
 * Gets the transcript of a new video from YouTube
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<object<string, string | number>>} The transcript of the video
 */
export async function getNewTranscript(videoId) {
    return await request(`/transcripts/new?video_id=${videoId}`, 'GET');
}

/**
 * Adds a flashcard to the database
 * 
 * @param {number} wordId The ID of the word for which to create the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function addFlashcard(wordId) {
    return await request('/flashcards', 'POST', { wordId: wordId, due: new Date().toISOString() });
}

/**
 * Gets a flashcard from the database
 * 
 * @param {number} wordId The word for which to get the flashcard
 * @returns {Promise<object>} The flashcard data
 */
export async function getFlashcard(wordId) {
    return await request(`/flashcards/${encodeURIComponent(wordId)}`, 'GET');
}

/**
 * Gets the next flashcard that is due for review
 * 
 * @param {string} currentTime The current time in ISO format
 * @returns {Promise<object>} The flashcard that is next due
 */
export async function getNextDueFlashcard(currentTime) {
    return await request(`/flashcards/next-due?current_time=${currentTime}`, 'GET');
}

/**
 * Gets all flashcards that are currently due for review
 * 
 * @param {string} currentTime The current time in ISO format
 * @returns {Promise<Array<object>>} The flashcards that are due
 */
export async function getDueFlashcards(currentTime) {
    return await request(`/flashcards/due?current_time=${currentTime}`, 'GET');
}

/**
 * Updates a flashcard in the database
 * 
 * @param {number} cardId The ID of the carrd for which to update
 * @param {object} flashcardData The updated data for the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function updateFlashcard(cardId, flashcardData) {
    return await request(`/flashcards/${encodeURIComponent(cardId)}`, 'PATCH', flashcardData);
}

/**
 * Uses the FSRS system to review a card
 * 
 * @param {number} cardId The ID of the word that was reviewwed
 * @param {number} rating The rating from 1 to 4 that the user gave to the card
 * @param {string} reviewTime The date and time user reviewed the card as an ISO string
 * @returns {Promise<object>} The updated card
 */
export async function reviewFlashcard(cardId, rating, reviewTime) {
    return await request('/flashcards/review', 'POST', { word_id: cardId, rating: rating, review_time: reviewTime });
}

/**
 * Gets the review intervals for a flashcard
 * 
 * @param {number} cardId The ID of the word for which to get the review intervals
 * @param {string} reviewTime The time of the review as an ISO string
 * @returns {Promise<Array<number>>} The review intervals
 */
export async function getReviewIntervals(cardId, reviewTime) {
    return await request(`/flashcards/review-intervals/${encodeURIComponent(cardId)}?review_time=${reviewTime}`, 'GET');
}

/**
 * Deletes a flashcard from the database
 * 
 * @param {number} cardId The ID of the word for which to delete the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function deleteFlashcard(cardId) {
    return await request(`/flashcards/${encodeURIComponent(cardId)}`, 'DELETE');
}