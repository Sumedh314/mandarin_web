import {
    ratingSelectionArea,
    state
} from "./documentAreas.js";

import {
    fetchCreateCard,
    fetchCreateCards,
    fetchGeminiPrompt,
    fetchNextWordAndCard,
    fetchSentence,
    fetchUpdateCard
} from "./fetchData.js";

import { printText } from "./renderText.js";

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

    // const dueWords = await fetchDueWords();
    // for (const word of dueWords) {
    //     let sentence = await fetchSentence(word);
    //     if (sentence == 'None') {
    //         continue;
    //     }
    //     await printText(sentence);
    // }
    const wordAndCard = await fetchNextWordAndCard(wordIndex);
    const word = wordAndCard.word;
    const card = wordAndCard.card;

    state.flashcardWord = word;
    
    const sentence = await fetchSentence(word);
    if (sentence == 'None') {
        showNextCard(wordIndex + 1);
        return;
    }
    printText(sentence);

    // await fetchUpdateCard(word, 1);
    console.log('asdf');
}

/**
 * Updates a card after user chooses rating
 * 
 * @param {MouseEvent} event One of four buttons user clicked to give flashcard rating
 */
export async function reviewCard(event) {
    switch (event.target.id) {
        case 'rating-again-button':
            fetchUpdateCard(state.flashcardWord, 1);
            break;
        case 'rating-hard-button':
            fetchUpdateCard(state.flashcardWord, 2);
            break;
        case 'rating-good-button':
            fetchUpdateCard(state.flashcardWord, 3);
            break;
        case 'rating-easy-button':
            fetchUpdateCard(state.flashcardWord, 4);
            break;
    
        default:
            break;
    }
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