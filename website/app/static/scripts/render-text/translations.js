import { translationArea } from "../document-areas.js";
import { getPinyin, segmentText, translateText } from "../api/routes.js";

const LOADING_SIGN = 'Loading...';

/**
 * Prints the selected characters, pinyin, and English definitions into the dedicated area.
 * 
 * @param {string} text Text to translate
 */
export async function printDefinitions(text) {
    translationArea.innerHTML = LOADING_SIGN;
    const translation = await translateText(text);
    const segmentedText = await segmentText(text);
    const pinyin = await getPinyin(segmentedText.join(' '));

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