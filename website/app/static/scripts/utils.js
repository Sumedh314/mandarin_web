/**
 * Converts a YouTube transcript timestamp from seconds to hh:mm:ss
 * 
 * @param {string|number} timestamp time of video in seconds
 * @returns {string} timestamp in mm:ss or hh:mm:ss
 */
export function formatTimestamp(timestamp) {
    const totalSeconds = (Math.floor(Number(timestamp)));

    // Get hours, minutes, and seconds from total seconds
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalSeconds / 3600);
    const seconds = totalSeconds % 60;

    // Array with parts for final timestamp
    const parts = [];
    
    // Add values to final timestamp
    if (hours > 0) {
        parts.push(String(hours).padStart(2, '0'));
    }
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));

    return parts.join(':')
}

/**
 * Rounds a number of seconds to minutes, hours, days, months, or years
 */
export function formatSeconds(seconds) {
    const timeFrames = ['y', 'mo', 'd', 'h', 'm'];
    const divisionFactors = [31536000, 2592000, 86400, 3600, 60];

    let index = 0;
    for (const factor of divisionFactors) {
        if (seconds / factor >= 1) {
            let time = Math.round(seconds / factor * 10) / 10;
            let timeFrame = timeFrames[index];

            if (time == divisionFactors[index - 1] / factor) {
                time = 1;
                timeFrame = timeFrames[index - 1];
            }
            
            return `${time}${timeFrame}`;
        }
        index++;
    }
    return '<1m';
}

/**
 * Formats words to update proficiency levels of given HTML elements of words.
 * 
 * @param {HTMLElement} wordElements Element containing words to update
 * @param {number} lastIndex Index at which user last clicked a word
 * @param {number} currentIndex Index of the current word user clicked
 */
export function formatWordsToUpdate(wordElements, lastIndex, currentIndex) {
    const wordsToUpdate = { previousWords: [], currentWord: '' };

    for (const word of wordElements) {
        if (word.hasAttribute('data-index')) {
            let wordIndex = parseInt(word.dataset.index);

            if (wordIndex < currentIndex) {
                if (wordIndex > lastIndex) {
                    wordsToUpdate.previousWords.push(word.dataset.id);
                }
            }
            else if (wordIndex == currentIndex) {
                wordsToUpdate.currentWord = word.dataset.id;
            }
            else {
                break;
            }
        }
        else {
            continue;
        }
    }

    return wordsToUpdate;
}

/**
 * Filters out items from the original list that are not entirely made of Mandarin characters
 * 
 * @param {Array<string>} segmentedText Text segmented into individual items
 * @returns {Array<string>} Items that are only Mandarin
 */
export function filterText(segmentedText) {
    const filteredText = [];
    for (const item of segmentedText) {
        if (textIsMandarin(item)) {
            filteredText.push(item);
        }
    }
    return filteredText;
}

/**
 * Checks whether the given text is made entirely of Mandarin characters without punctuation
 * 
 * @param {string} text Text to check if is Mandarin
 * @returns {boolean} Whether or not the text is Mandarin
 */
function textIsMandarin(text) {
    for (const character of text) {
        if (character.codePointAt(0) < 0x4e00 || character.codePointAt(0) > 0x9fff) {
            return false;
        }
    }
    return true;
}

/**
 * Gets the current time in ISO format
 * 
 * @returns {string} Current time in ISO format
 */
export function currentISOTime() {
    const currentTime = new Date();
    const isoTime = currentTime.toISOString();
    return isoTime;
}