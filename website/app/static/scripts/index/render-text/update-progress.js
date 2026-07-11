import {
    state,
    practiceArea,
    locationMarker
} from "../../document-areas.js";

/**
 * Moves the location marker to show the user's farthest point in the text
 */
export function updateLocationMarker() {
    locationMarker.style.visibility = 'visible';
    for (const snippet of practiceArea.getElementsByTagName('span')) {
        for (const word of snippet.children) {
            if (word.hasAttribute('data-index')) {
                if (word.dataset.index == state.lastIndex) {
                    word.after(locationMarker);
                }
            }
        }
    }
}

/**
 * Updates the colors of the words on the screen based on the proficiency levels of each word.
 * 
 * @param {object} proficiencyLevels Proficiency levels of each word ID
 */
export function updateWordColors(proficiencyLevels) {
    console.log(proficiencyLevels)
    const segmentedWords = practiceArea.getElementsByTagName('span');
    
    for (const word of segmentedWords) {
        if (word.dataset.id in proficiencyLevels) {
            word.dataset.proficiency = proficiencyLevels[word.dataset.id];
        }
    }
}

/**
 * Updates the words that should be underlined based on if the user saved the word or not
 * 
 * @param {string} wordToUpdate Word to update underlines for
 */
export function updateWordUnderlines(wordToUpdate) {
    const segmentedWords = practiceArea.getElementsByTagName('span');

    for (const word of segmentedWords) {
        if (word.dataset.word == wordToUpdate) {
            word.classList.toggle('saved-word');
        }
    }
}

/**
 * Updates the table with percent of HSK words user knows
 */
export async function updateHskLevels() {
    const hskPercentages = await fetchHskPercentages();

    for (const level of Object.keys(hskPercentages)) {
        document.getElementById(level).innerHTML = hskPercentages[level];
    }
}