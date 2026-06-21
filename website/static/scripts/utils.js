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
    const wordsToUpdate = { previous: [], current: '' };

    for (const word of wordElements) {
        if (word.hasAttribute('data-index')) {
            let wordIndex = parseInt(word.dataset.index);

            if (wordIndex < currentIndex) {
                if (wordIndex > lastIndex) {
                    wordsToUpdate.previous.push(word.dataset.word);
                }
            }
            else if (wordIndex == currentIndex) {
                wordsToUpdate.current = word.dataset.word;
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