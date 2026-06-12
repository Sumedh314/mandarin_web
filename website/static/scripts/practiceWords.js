import {
    fetchCreateCard,
    fetchCreateCards,
    fetchGeminiPrompt,
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
 * Allows user to review flashcards
 */
export async function reviewCards() {
    // const sentence = await fetchSentence('炒蛋');
    // printText(sentence);
    await fetchUpdateCard('hi', 3);
    console.log('asdf');
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