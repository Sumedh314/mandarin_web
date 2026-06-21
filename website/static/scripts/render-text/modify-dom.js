import {
    fetchPinyin,
    fetchTranslation
} from "../fetch-data";

/**
 * Adds a "Done" button to the end of a transcript or text
 * 
 * @param {Number} wordIndex Index of the final word of the transcript or text
 */
export function addDoneButton(wordIndex) {
    const doneButton = document.createElement('span');
    doneButton.classList.add('word');
    doneButton.dataset.proficiency = 3;
    doneButton.dataset.action = 'final-word';
    doneButton.dataset.index = wordIndex + 1;
    doneButton.textContent = 'Done';

    wordsArea.appendChild(document.createElement('br'));
    wordsArea.appendChild(doneButton);
}

/**
 * Prints the selected characters, pinyin, and English definitions into the dedicated area.
 * 
 * @param {string} text Text to translate
 */
export async function printDefinitions(text) {
    translationArea.innerHTML = loadingSign;
    const translation = await fetchTranslation(text);
    const pinyin = await fetchPinyin(text);

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

    const translation = await fetchTranslation(element.dataset.word);
    const pinyin = await fetchPinyin(element.dataset.word);
    console.log(pinyin);

    tooltipTranslation.innerHTML = `${element.dataset.word}<br>${pinyin}<br>${translation}`;
}