import {fetchGeminiPrompt} from "./fetchData.js";

/**
 * Prompts Gemini to generate a sentence using a given word
 * 
 * @param {Array} words Word for Gemini to use in sentence
 */
export async function generatePracticeSentence(words) {
    const prompt = `Using the following list of Mandarin words, generate a sentence, one sentence for each word: ${words}. Please simply list the sentences without any surrounding text in English.`;
    const sentences = await fetchGeminiPrompt(prompt);

    const sentenceList = new Map();
    let index = 0;
    let runningSentence = '';

    for (const character of sentences) {
        if (character != '\n') {
            runningSentence += character;
        }
        else {
            sentenceList.set(words[index], runningSentence);
            index++;
            runningSentence = '';
        }
    }
    if (index < words.length) {
        sentenceList.set(words[index], runningSentence);
    }

    console.log(sentenceList);
    return sentenceList;
}