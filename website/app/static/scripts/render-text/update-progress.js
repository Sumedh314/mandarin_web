import {
    state,
    wordsArea,
    locationMarker
} from "../document-areas.js";

import { updateTranscriptLastIndex } from "../old_api/user-data/transcripts.js";
import { fetchHskPercentages } from "../old_api/user-data/proficiency.js";

/**
 * Moves the location marker to show the user's farthest point in the text
 */
export function updateLocationMarker() {
    for (const snippet of wordsArea.getElementsByTagName('span')) {
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
 * Sets the last index of where the user left off
 * 
 * @param {number} index Index to set lastIndex to
 */
export async function setLastIndex(index) {
    await updateTranscriptLastIndex(state.videoId, index);
}

/**
 * Updates the colors of the words on the screen based on the proficiency levels of each word.
 * 
 * @param {object} proficiencyLevels Proficiency levels of each word
 */
export function updateWordColors(proficiencyLevels) {
    console.log(proficiencyLevels)
    const segmentedWords = wordsArea.getElementsByTagName('span');
    
    for (const word of segmentedWords) {
        if (word.dataset.word in proficiencyLevels) {
            word.dataset.proficiency = proficiencyLevels[word.dataset.word];
        }
    }
}

/**
 * Updates the words that should be underlined based on if the user saved the word or not
 * 
 * @param {string} wordToUpdate Word to update underlines for
 */
export function updateWordUnderlines(wordToUpdate) {
    const segmentedWords = wordsArea.getElementsByTagName('span');

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