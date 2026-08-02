import { mainWordInfo, supplementalWordInfo, translationArea } from "../../document-areas.js";
import { getTextPinyin, getWordData, getWordPinyin, segmentText, translateText, updateWord } from "../../api/routes.js";

const LOADING_SIGN = 'Loading...';

/**
 * Prints the word, pinyin, and English definitions into the dedicated area.
 * 
 * @param {number} wordId ID of word to translate
 * @param {string} text The text of the word
 */
export async function printWordDefinitions(wordId, text) {
    mainWordInfo.textContent = LOADING_SIGN;
    const wordData = await getWordData(wordId);
    if (wordData.hsk_old_level !== null && wordData.hsk_new_level !== null) {
        console.log(wordData);
        let allForms = {};
        for (let key in wordData.forms[0]) {
            allForms[key] = new Set();
        }
        console.log(allForms);
        for (const form of wordData.forms) {
            for (let key in form) {
                allForms[key].add(form[key]);
            }
        }
        console.log(allForms);
        mainWordInfo.innerHTML = `${text}<br>${[...allForms.pinyin].join('; ')}<br>${[...allForms.translations].join('; ')}`;

        supplementalWordInfo.innerHTML = `Proficiency: ${wordData.proficiency}<br>HSK 2.0 level: ${wordData.hsk_old_level}<br>HSK 3.0 level: ${wordData.hsk_new_level}<br>
                                        Radical: ${wordData.radical}<br>`;
    }
    else {
        const pinyin = await getTextPinyin(text);
        const translation = await translateText(text);

        mainWordInfo.innerHTML = `${text}<br>${pinyin}<br>${translation}`;
        supplementalWordInfo.innerHTML = `Proficiency: ${wordData.proficiency}<br>Word not in HSK standard`;
    }
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