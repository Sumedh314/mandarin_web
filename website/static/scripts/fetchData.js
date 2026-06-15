import {wordsArea} from "./documentAreas.js";

/**
 * Sends a prompt to Google Gemini
 * 
 * @param {string} prompt The prompt to send to gemini
 * @param {object} [schema={}] schema Schema for Gemini to return content in
 */
export async function fetchGeminiPrompt(prompt, schema = {}) {
    const data = { prompt: prompt, schema: schema };

    const geminiResponse = await fetch('/prompt_gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const message = await geminiResponse.text();

    return message;
}

/**
 * Adds list of practice sentences to practice_sentences.json
 * 
 * @param {string} word Word that sentences contain in common for user to practice
 * @param {Array} sentencesList List of sentences to add
 */
export async function updatePracticeSentences(word, sentencesList) {
    const practice_data = [word, sentencesList]

    const updatePracticeSentencesResponse = await fetch('/update_practice_sentences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(practice_data),
    });
    const result = await updatePracticeSentencesResponse.text();

    return result;
}

/**
 * Gets the English translation of a word from Python.
 * 
 * @param {string} text text user wants to translate
 */
export async function fetchTranslation(text) {
    const translationResponse = await fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const translation = await translationResponse.text();

    return translation;
}

/**
 * Gets the pinyin representation of a word from Python.
 * 
 * @param {string} text text user wants to get pinyin of
 */
export async function fetchPinyin(text) {
    const translationResponse = await fetch('/get_pinyin', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const pinyin = await translationResponse.text();

    return pinyin;
}

/**
 * fetchs the transcript of the YouTube video with the given link.
 * 
 * @param {string} link Link of YouTube video
 */
export async function fetchVideoTranscript(link) {
    const transcriptResponse = await fetch('/generate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: link,
    });
    const transcript = await transcriptResponse.json();

    return transcript;
}

/**
 * Translates a transcript into Chinese if available
 */
export async function fetchTranscriptTranslation() {
    const transcriptResponse = await fetch('/translate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: videoId,
    });
    const transcript = await transcriptResponse.json();

    printTranscript(transcript);
}

/**
 * Gets the location of the place the user left off of a transcript
 * 
 * @param {string} link the link of the YouTube video with the desired transcript
 */
export async function fetchLastIndex(link) {
    const originalLink = new URL(link);
    const videoId = originalLink.searchParams.get('v');

    const lastIndexResponse = await fetch('/get_last_index', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: videoId,
    });
    const lastIndex = await lastIndexResponse.text();

    return Number(lastIndex);
}
/**
 * Sets the location of the place the user left off of a transcript
 * 
 * @param {string} link Link of YouTube video
 * @param {number} index the index to set the last index to
 */
export async function fetchSetLastIndex(link, index) {
    const originalLink = new URL(link);
    const videoId = originalLink.searchParams.get('v');

    const data = {'videoId': videoId, 'lastIndex': index};

    const setIndexResponse = await fetch('/set_last_index', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const setIndex = await setIndexResponse.text();

    return setIndex;
}

/**
 * Segments Mandarin text into individual words using Python
 * 
 * @param {string} text Text to segment into words
 */
export async function fetchWordSegments(text) {
    const segmentationResponse = await fetch('/segment_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const segmentedText = await segmentationResponse.json();

    return segmentedText;
}

/**
 * Segments a transcript into words while preserving timestamps.
 * 
 * @param {Object} transcript Transcript to segment into words
 */
export async function fetchTranscriptWordSegments(transcript) {

    // Get segmented transcript
    const segmentationResponse = await fetch('/segment_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcript),
    });
    const segmentedTranscript = await segmentationResponse.json();

    return segmentedTranscript;
}

/**
 * fetchs the proficiency levels of each word of the given text
 * 
 * @param {Array} segmentedText Text segmented into individual words
 */
export async function fetchProficiencyLevels(segmentedText) {
    const proficiencyLevelsResponse = await fetch('/get_proficiency_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(segmentedText),
    });
    const proficiencyLevels = await proficiencyLevelsResponse.json();

    return proficiencyLevels;
}

/**
 * fetchs the proficiency levels of each word in a transcript.
 * 
 * @param {Object} segmentedTranscript Transcript segmented into individual words
 */
export async function fetchTranscriptProficiencyLevels(segmentedTranscript) {
    
    // Push all words of transcript into transcriptWords without including timestamps.
    let transcriptWords = []
    for (const snippet of Object.keys(segmentedTranscript)) {
        for (const word of segmentedTranscript[snippet]) {
            transcriptWords.push(word)
        }
    }

    const transcriptProficiencysLevels = await fetchProficiencyLevels(transcriptWords);

    return transcriptProficiencysLevels;
}

/**
 * Updates the proficiency levels of words based on the word the user clicked
 * 
 * @param {Number} lastIndex Index of the last word that the user clicked
 * @param {Number} currentIndex Index of the word that the user clicked
 * @param {Boolean} isFinished Whether or not the user clicked the "Done" button
 */
export async function fetchUpdatedProficiencyLevels(lastIndex, currentIndex, isFinished = false) {
    if (currentIndex == lastIndex) {
        return {};
    }
    const segmentedWords = wordsArea.getElementsByTagName('span');

    // Put all words from state.lastIndex to currentIndex in 'previous', and put current word in 'current'
    let wordsToUpdate = {'previous': [], 'current': ''};
    for (const word of segmentedWords) {
        if (word.hasAttribute('data-index')){
            let wordIndex = parseInt(word.dataset.index, 10);

            if (wordIndex < currentIndex) {
                if (wordIndex > lastIndex) {
                    wordsToUpdate['previous'].push(word.dataset.word);
                }
            }
            else if (wordIndex == currentIndex) {
                if (!isFinished) {
                    wordsToUpdate['current'] = word.dataset.word;
                }
            }
            else {
                break;
            }
        }
        else {
            continue;
        }
    }

    // Get proficiency levels from Python
    const updatedProficiencyLevelsResponse = await fetch('/update_proficiency_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordsToUpdate),
    });
    const updatedProficiencyLevels = await updatedProficiencyLevelsResponse.json();

    return updatedProficiencyLevels;
}

/**
 * Fetches the percent of each HSK level the user knows to be displayed on the table.
 */
export async function fetchHskPercentages() {
    const hskLevelsResponse = await fetch('/get_hsk_percentages', {
        method: 'GET'
    });
    const hskLevels = await hskLevelsResponse.json();

    return hskLevels;
}

/**
 * Fetches a list of words the user is currently learning.
 * 
 * @param {number} numWords Number of words to return in list
 */
export async function fetchRandomListWordsLearning(numWords) {
    const wordListResponse = await fetch('/get_random_list_words_learning', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: numWords,
    });
    const wordList = await wordListResponse.json();

    return wordList;
}

/**
 * Fetches a list of words the user has saved.
 * 
 * @param {number} numWords Number of words to return in list
 */
export async function fetchRandomListWordsSaved(numWords) {
    const wordListResponse = await fetch('/get_random_list_words_saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: numWords,
    });
    const wordList = await wordListResponse.json();

    return wordList;
}

/**
 * Adds a word to saved_words.json
 * 
 * @param {string} word Word to save
 */
export async function fetchToggleSavedWord(word) {
    const addSavedWordResponse = await fetch('/toggle_saved_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: word,
    });
    const savedWord = await addSavedWordResponse.text();

    return savedWord;
}

/**
 * Checks if a word is saved by the user
 * 
 * @param {string} word Word to check
 */
export async function fetchCheckSaved(word) {
    const checkSaved = await fetch('/check_saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: word
    });
    const savedWord = await checkSaved.text();

    return savedWord;
}

/**
 * Gets the review times for the different ratings a user can give to a word
 * 
 * @param {string} word Word to get next review times for
 */
export async function fetchReviewTimes(word) {
    const reviewTimesResponse = await fetch('/get_review_times', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: word
    });
    const reviewTimes = await reviewTimesResponse.json();

    return reviewTimes;
}

/**
 * Gets the next word and card for the user to review
 * 
 * @param {number} [wordIndex=0] Index of list of due words to use
 */
export async function fetchNextWord(wordIndex = 0) {
    const nextWordResponse = await fetch('/get_next_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: wordIndex
    });
    const nextWord = await nextWordResponse.text();

    return nextWord;
}

/**
 * Gets a list of flashcard words that are due for the user to review
 */
export async function fetchDueWords() {
    const dueWordsResponse = await fetch('/get_due_words', {
        method: 'GET'
    });
    const dueWords = await dueWordsResponse.json();

    return dueWords;
}

/**
 * Creates all flashcards based on words that the user saved using flaskcards_data.json
 */
export async function fetchCreateCards() {
    const createCardsResponse = await fetch('/create_cards', {
        method: 'GET'
    });
    const createCards = await createCardsResponse.text();

    return createCards;
}

/**
 * Creates one card for a word that user has saved
 * 
 * @param {string} word Word to create flashcard for
 */
export async function fetchCreateCard(word) {
    const createCardResponse = await fetch('/create_card', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: word
    });
    const createCard = await createCardResponse.text();

    return createCard;
}

/**
 * Updates a card 
 * 
 * @param {string} word Word that card tested user for
 * @param {number} rating Rating of 0, 1, 2, or 3 that user gave word
 */
export async function fetchUpdateCard(word, rating) {
    const data = { word: word, rating: rating };

    const updateCardResponse = await fetch('/update_card', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    const updateCard = await updateCardResponse.text();

    return updateCard;
}

/**
 * Give a sentence that includes the given word for the user to practice with
 * 
 * @param {string} word Word to fetch sentence for
 */
export async function fetchSentence(word) {
    const sentenceResponse = await fetch('/get_sentence', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: word
    });
    const sentence = await sentenceResponse.text();

    return sentence;
}