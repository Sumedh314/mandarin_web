import request from "./client.js";

/**
 * Registers a new user onto the site
 * 
 * @param {object} data Login data including username and password
 * @returns {Promise<string>} The success or error message
 */
export async function register(data) {
    return await request('/register', 'POST', data, '');
}

/**
 * Logs a user into the site
 * 
 * @param {object} data Login data including username and password
 * @returns {Promise<string>} The access token or an error message
 */
export async function login(data) {
    return await request('/login', 'POST', data, '');
}

/**
 * Adds a list of words to the database
 * 
 * @param {Array} words List of words to add to database
 * @returns {Promise<string>} The success or error message
 */
export async function addWords(words) {
    // const words_data = Object.fromEntries(words.map(word => [word, {text: word}]));
    // const words_data = [];
    // for (const word of words) {
    //     words_data.push({ text: word });
    // }
    return await request('/words', 'POST', words);
}

/**
 * Get all the data of a word.
 * 
 * @param {number} wordId The ID of the word
 * @returns {Promise<object>} The word's data
 */
export async function getWordData(wordId) {
    return await request(`/words/learning/${wordId}`, 'GET');
}

/**
 * Gets the IDs of each word from the database
 * 
 * @param {Array<string>} words The list of words to get the IDs of
 * @returns {Promise<object<string, number>>} The IDs of each word
 */
export async function getWordIds(words) {
    return await request(`/words/learning/ids`, 'POST', words);
}

/**
 * Updates a word with the given data
 * 
 * @param {number} wordId ID of word to update
 * @param {object} data Data to update word with
 * @returns {Promise<string>} The success or error message
 */
export async function updateWord(wordId, data) {
    return await request(`/words/${wordId}/update`, 'PATCH', data);
}

/**
 * Gets the proficiency levels of each word of the given array
 * 
 * @param {Array} wordIds List of word IDs
 * @returns {Promise<object<string, number>>} The proficiency levels of the given words
 */
export async function getWordProficiencyLevels(wordIds) {
    return await request(`/words/learning/proficiency-levels`, 'POST', wordIds);
}

/**
 * Updates the new proficiency levels for a list of words based on the user's interaction.
 * 
 * @param {Array} previousWordIds List of previous word IDs. Increments proficiency of these words, sets max proficiency if previously zero.
 * @param {number} currentWordId ID of the word the user clicked on. Decrements its proficiency by one if greater than one, increments if zero.
 * @returns {Promise<object<string, number>>} The new proficiency levels of the given words
 */
export async function updateWordProficiencyLevels(previousWordIds, currentWordId) {
    return await request('/words/learning/proficiency-levels', 'PATCH', {
        previousWordIds: previousWordIds,
        currentWordId: currentWordId
    });
}

/**
 * Toggles the saved status of a word
 * 
 * @param {number} wordId The word to toggle
 * @returns {Promise<string>} The success or error message
 */
export async function toggleWordSaved(wordId) {
    return await request(`/words/learning/saved/${encodeURIComponent(wordId)}/toggle`, 'PATCH');
}

/**
 * Gets a list of words that the user has saved from the given list.
 * 
 * @param {Array<int>} wordIds Word IDs to check
 * @returns {Promise<Array<str>>} Words that are saved
 */
export async function getSavedWords(wordIds) {
    return await request('/words/learning/saved', 'POST', wordIds);
}

/**
 * Segments a piece of Mandarin text into individual words
 * 
 * @param {string | Array<string>} text The text to segment
 * @returns {Promise<Array<string>>} The segmented text
 */
export async function segmentText(text) {
    return await request('/words/segment', 'POST', { text: text });
}

/**
 * Gets the pinyin representation of a single word through the database
 * 
 * @param {number} wordId ID of word to get pinyin for
 * @returns {Promise<string>} The pinyin representation of the word
 */
export async function getWordPinyin(wordId) {
    return await request(`/words/${wordId}/pinyin`, 'GET');
}

/**
 * Gets the pinyin representation of a piece of Mandarin text
 * 
 * @param {string} text The text to convert to pinyin
 * @param {string} context Optional text surrounding target text
 * @returns {Promise<string>} The pinyin representation of the text
 */
export async function getTextPinyin(text, context) {
    return await request(`/words/pinyin`, 'POST', { text: text, context: context });
}

/**
 * Gets the translation of a piece of text
 * 
 * @param {string} text The text to translate
 * @returns {Promise<string>} The translation of the text
 */
export async function translateText(text) {
    return await request(`/words/translate`, 'POST', { text: text });
}

/**
 * Adds a list of sentences for a specific word to the database
 * 
 * @param {Array<string>} sentences List of sentences to add
 * @param {string} wordId Word ID for which to add sentences
 * @returns {Promise<string>} The success or error message
 */
export async function addSentences(sentences, wordId) {
    return await request('/srs/sentences', 'POST', {
        sentences: sentences,
        wordId: wordId
    });
}

/**
 * Gets the first sentence for a word that is available in the database
 * 
 * @param {number} wordId ID of word that the user saved that the sentence must contain
 * @returns {Promise<string>} Sentence containing the given word
 */
export async function getSentence(wordId) {
    return await request(`/srs/sentences/${wordId}`, 'GET');
}

/**
 * Deletes a practice sentence from the database
 * 
 * @param {string} sentence Sentence to delete
 * @param {string} wordId ID of word that the sentence contains
 */
export async function deleteSentence(sentence, wordId) {
    return await request(`/srs/sentences?sentence=${encodeURIComponent(sentence)}&learningWordId=${encodeURIComponent(wordId)}`, 'DELETE');
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
 * Checks if a video exists in the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<boolean>} Whether or not the video exists
 */
export async function checkIfVideoExistsForUser(videoId) {
    return await request(`/videos/check/user?video_id=${videoId}`, 'GET');
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
    return await request('/videos/transcripts', 'POST', { video_id: videoId, transcript: transcript });
}

/**
 * Gets the transcript of a video
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<object<string, string | number>>} The transcript of the video
 */
export async function getTranscript(videoId) {
    return await request(`/videos/transcripts/${videoId}`, 'GET');
}

/**
 * Gets the transcript of a video from the database
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<object<string, string | number>>} The transcript of the video
 */
export async function getTranscriptFromDatabase(videoId) {
    return await request(`/videos/transcripts/data/${videoId}`, 'GET');
}

/**
 * Gets the transcript of a new video from YouTube
 * 
 * @param {string} videoId The ID of the video
 * @returns {Promise<object<string, string | number>>} The transcript of the video
 */
export async function getNewTranscript(videoId) {
    return await request(`/videos/transcripts/new?video_id=${videoId}`, 'GET');
}

/**
 * Adds a flashcard to the database
 * 
 * @param {number} wordId The ID of the word for which to create the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function addFlashcard(wordId) {
    return await request('/srs/flashcards', 'POST', { learning_word_id: wordId });
}

/**
 * Gets a flashcard from the database
 * 
 * @param {number} wordId The word for which to get the flashcard
 * @returns {Promise<object>} The flashcard data
 */
export async function getFlashcard(wordId) {
    return await request(`/srs/flashcards/${encodeURIComponent(wordId)}`, 'GET');
}

/**
 * Gets the next flashcard that is due for review
 * 
 * @returns {Promise<object>} The flashcard that is next due
 */
export async function getNextDueFlashcard() {
    return await request(`/srs/flashcards/next-due`, 'GET');
}

/**
 * Gets all flashcards that are currently due for review
 * 
 * @returns {Promise<Array<object>>} The flashcards that are due
 */
export async function getDueFlashcards() {
    return await request(`/srs/flashcards/due`, 'GET');
}

/**
 * Updates a flashcard in the database
 * 
 * @param {number} cardId The ID of the carrd for which to update
 * @param {object} flashcardData The updated data for the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function updateFlashcard(cardId, flashcardData) {
    return await request(`/srs/flashcards/${encodeURIComponent(cardId)}`, 'PATCH', flashcardData);
}

/**
 * Uses the FSRS system to review a card
 * 
 * @param {number} cardId The ID of the word that was reviewwed
 * @param {number} rating The rating from 1 to 4 that the user gave to the card
 * @returns {Promise<object>} The updated card
 */
export async function reviewFlashcard(cardId, rating) {
    return await request('/srs/flashcards/review', 'PATCH', { learningWordId: cardId, rating: rating });
}

/**
 * Gets the review intervals for a flashcard
 * 
 * @param {number} cardId The ID of the word for which to get the review intervals
 * @returns {Promise<Array<number>>} The review intervals
 */
export async function getReviewIntervals(cardId) {
    return await request(`/srs/flashcards/review-intervals/${encodeURIComponent(cardId)}`, 'GET');
}

/**
 * Deletes a flashcard from the database
 * 
 * @param {number} cardId The ID of the word for which to delete the flashcard
 * @returns {Promise<string>} The success or error message
 */
export async function deleteFlashcard(cardId) {
    return await request(`/srs/flashcards/${encodeURIComponent(cardId)}`, 'DELETE');
}