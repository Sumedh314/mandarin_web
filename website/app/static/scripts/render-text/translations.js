import { translationArea } from "../document-areas.js";
import { getTextPinyin, getWordPinyin, segmentText, translateText, translateWord, updateWord } from "../api/routes.js";

const LOADING_SIGN = 'Loading...';

/**
 * Prints the word, pinyin, and English definitions into the dedicated area.
 * 
 * @param {number} wordId ID of word to translate
 * @param {string} text The text of the word
 */
export async function printWordDefinitions(wordId, text) {
    translationArea.innerHTML = LOADING_SIGN;
    let translation = await translateWord(wordId);
    if (translation == '') {
        translation = await translateText(text);
        await updateWord(wordId, { translation: translation });
    }
    let pinyin = await getWordPinyin(wordId);
    if (pinyin == '') {
        pinyin = await getTextPinyin(text);
        await updateWord(wordId, { pinyin: pinyin });
    }

    translationArea.innerHTML = `${text}<br>${pinyin}<br>${translation}`;
}

/**
 * Prints the selected characters, pinyin, and English definitions into the dedicated area.
 * 
 * @param {string} text Text to translate
 */
export async function printTextDefinitions(text) {
    translationArea.innerHTML = LOADING_SIGN;
    const translation = await translateText(text);
    const segmentedText = await segmentText(text);
    const pinyin = await getTextPinyin(segmentedText.join(' '));

    translationArea.innerHTML = `${text}<br>${pinyin}<br>${translation}`;
}

/**
 * Shows the word menu when the user clicks on a word.
 * 
 * @param {object} element The word for which to show the menu
 */
export async function showWordMenu(element) {
    const wordLeftBoundary = element.getBoundingClientRect()['left'];
    element.after(wordMenu);
    wordMenu.style.left = wordLeftBoundary - 10 + 'px';
    wordMenu.hidden = false;

    console.log('al;sdkfja;sldkfjas;ldkj');

    const translation = await translateText(element.dataset.word);
    const segmentedText = await segmentText(element.dataset.word);
    const pinyin = await getPinyin(segmentedText.join(' '));
    console.log(pinyin);

    tooltipTranslation.innerHTML = `${element.dataset.word}<br>${pinyin}<br>${translation}`;
}