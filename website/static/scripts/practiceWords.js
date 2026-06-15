import {
    numDueWordsCounter,
    ratingAgainTime,
    ratingEasyTime,
    ratingGoodTime,
    ratingHardTime,
    ratingSelectionArea,
    state
} from "./documentAreas.js";

import {
    fetchCreateCard,
    fetchCreateCards,
    fetchDueWords,
    fetchGeminiPrompt,
    fetchNextWord as fetchNextWord,
    fetchReviewTimes,
    fetchSentence,
    fetchUpdateCard
} from "./fetchData.js";

import { printText } from "./renderText.js";
import { formatSeconds } from "./utils.js";

/**
 * Prompts Gemini to generate a sentence using a given word
 * 
 * @param {Array} words Words for Gemini to use in sentence
 */
export async function generatePracticeSentence(words) {
    const prompt = `Using the following list of Mandarin words, generate one sentence for each word: ${words}. Please format your response as "'Mandarin word': 'sentence'", with one sentence in each line. Please simply list the sentences without any surrounding text in English.`;
    let sentences = await fetchGeminiPrompt(prompt);

    const sentencesByWord = {};
    
    while (true) {
        let finalSentence = false;
        let sentenceStartIndex = sentences.indexOf(':') + 2;
        let sentenceEndIndex = sentences.indexOf('\n');

        if (sentenceEndIndex == -1) {
            sentenceEndIndex = sentences.length;
            finalSentence = true;
        }

        let sentenceWord = sentences.substring(0, sentenceStartIndex - 2);
        let sentence = sentences.substring(sentenceStartIndex, sentenceEndIndex);

        sentencesByWord[sentenceWord] = sentence;
        sentences = sentences.substring(sentenceEndIndex + 1, sentences.length);

        if (finalSentence) {
            break;
        }
    }

    console.log(sentencesByWord);
    return sentencesByWord;
}

/**
 * Allows user to review the next flashcard
 * 
 * @param {number} [wordIndex=0] Index of due words to be used
 */
export async function showNextCard(wordIndex = 0) {
    ratingSelectionArea.style.display = 'flex';

    const word = await fetchNextWord(wordIndex);

    if (word == 'None') {
        printText('No new flashcards');
        ratingSelectionArea.style.display = 'none';
        return;
    }

    state.flashcardWord = word;
    
    const sentence = await fetchSentence(word);
    if (sentence == 'None') {
        showNextCard(wordIndex + 1);
        return;
    }
    printText(sentence);

    const reviewTimes = await fetchReviewTimes(word);
    const ratingTimeAreas = [ratingAgainTime, ratingHardTime, ratingGoodTime, ratingEasyTime];
    
    for (let index = 0; index < ratingTimeAreas.length; index++) {
        ratingTimeAreas[index].textContent = formatSeconds(reviewTimes[index]);
    }
}

/**
 * Updates a card after user chooses rating
 * 
 * @param {MouseEvent} event One of four buttons user clicked to give flashcard rating
 */
export async function reviewCard(event) {
    switch (event.target.id) {
        case 'rating-again-button':
            await fetchUpdateCard(state.flashcardWord, 1);
            break;
        case 'rating-hard-button':
            await fetchUpdateCard(state.flashcardWord, 2);
            break;
        case 'rating-good-button':
            await fetchUpdateCard(state.flashcardWord, 3);
            break;
        case 'rating-easy-button':
            await fetchUpdateCard(state.flashcardWord, 4);
            break;
    
        default:
            break;
    }

    await showNextCard();
}

/**
 * Show the number of cards the user can practice that are due currently
 */
export async function showNumDueCards() {
    const dueWords = await fetchDueWords();
    let numDueCards = 0;
    
    for (const word of dueWords) {
        const sentence = await fetchSentence(word);
        if (sentence != 'None') {
            numDueCards++;
        }
    }

    numDueWordsCounter.textContent = numDueCards;
}

/**
 * Creates flashcards at the beginning of a session
 */
export async function createCards() {
    await fetchCreateCards();
}

/**
 * Create a card for a word
 * 
 * @param {string} word Word to create card for
 */
export async function createCard(word) {
    await fetchCreateCard(word);
}