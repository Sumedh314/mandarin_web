import {
    fetchWordSegments,
    fetchProficiencyLevels,
    fetchTranscriptWordSegments,
    fetchTranscriptProficiencyLevels,
    fetchTranslation,
    fetchPinyin,
    fetchHskPercentages,
    fetchSetLastIndex
} from "./fetchData.js";

import {
    translationArea,
    videoTitle,
    wordsArea,
    state,
    locationMarker
} from "./documentAreas.js";

import {formatTimestamp} from "./utils.js"

const loadingSign = 'Loading...';

/**
 * Prints the text into the dedicated area with clickable words.
 * 
 * @param {string} text Original text to be printed
 */
export async function printText(text) {
    state.lastIndex = -1;

    let wordIndex = 0;
    wordsArea.textContent = '';

    const segmentedText = await fetchWordSegments(text);
    const proficiencyLevels = await fetchProficiencyLevels(segmentedText);

    for (const word of segmentedText) {
        if (word == '\n') {
            wordsArea.appendChild(document.createElement('br'));
            continue;
        }
        if (word in proficiencyLevels) {
            let wordElement = document.createElement('span');
            wordElement.classList.add('word');
            wordElement.classList.add(state.proficiencyClasses[proficiencyLevels[word]]);
            wordElement.dataset.word = word;
            wordElement.dataset.index = wordIndex;
            wordElement.dataset.proficiency = proficiencyLevels[word];
            wordElement.textContent = word;

            wordsArea.appendChild(wordElement);
            wordIndex++;
        }
        else {
            let wordElement = document.createElement('span');
            wordElement.textContent = word;
            wordsArea.appendChild(wordElement);
        }
    }

    const doneButton = document.createElement('span');
    doneButton.className = 'proficiencyThree';
    doneButton.dataset.action = 'finalWord';
    doneButton.dataset.index = wordIndex + 1;
    doneButton.textContent = 'Done';

    wordsArea.appendChild(document.createElement('br'));
    wordsArea.appendChild(document.createElement('br'));
    wordsArea.appendChild(doneButton);
}

/**
 * Prints a transcript to the screen while preserving timestamps
 * 
 * @param {Object} transcript Original transcript with snippets at each timestamp
 */
export async function printTranscript(transcript) {
    const segmentedTranscript = await fetchTranscriptWordSegments(transcript);
    const proficiencyLevels = await fetchTranscriptProficiencyLevels(segmentedTranscript);

    state.timestampElements = [];
    let timestamps = [];

    for (const timestamp of Object.keys(segmentedTranscript)) {
        timestamps.push(timestamp)
    }
    timestamps = timestamps.sort((a, b) => a - b);

    let wordIndex = 0;

    videoTitle.textContent = state.videoPlayer.videoTitle;
    wordsArea.textContent = '';

    for (const timestamp of timestamps) {
        let transcriptLine = document.createElement('span');
        transcriptLine.className = 'normal';
        transcriptLine.dataset.timestamp = timestamp;

        let timestampElement = document.createElement('span');
        timestampElement.className = 'timestamp';
        timestampElement.textContent = formatTimestamp(timestamp);

        transcriptLine.appendChild(timestampElement);
        
        for (const word of segmentedTranscript[timestamp]) {
            if (word == '\n') {
                wordsArea.appendChild(document.createElement('br'));
                continue;
            }
            if (word in proficiencyLevels) {
                let wordElement = document.createElement('span');
                wordElement.classList.add('word');
                wordElement.classList.add(state.proficiencyClasses[proficiencyLevels[word]]);
                wordElement.dataset.word = word;
                wordElement.dataset.index = wordIndex;
                wordElement.dataset.proficiency = proficiencyLevels[word];
                wordElement.textContent = word;

                transcriptLine.appendChild(wordElement);

                wordIndex++;
            }
            else {
                let wordElement = document.createElement('span');
                wordElement.textContent = word;

                transcriptLine.appendChild(wordElement);
            }

            if (wordIndex == state.lastIndex + 1) {
                transcriptLine.appendChild(locationMarker);
                locationMarker.removeAttribute('hidden');
            }
        }

        wordsArea.appendChild(transcriptLine);
        wordsArea.appendChild(document.createElement('br'));
    }

    const doneButton = document.createElement('span');
    doneButton.className = 'proficiencyThree';
    doneButton.dataset.action = 'finalWord';
    doneButton.dataset.index = wordIndex + 1;
    doneButton.textContent = 'Done';

    wordsArea.appendChild(document.createElement('br'));
    wordsArea.appendChild(doneButton);

    // Push timestamps to timestampElements for other functions to use
    for (const timestamp of wordsArea.children) {
        if (timestamp.tagName == 'SPAN') {
            state.timestampElements.push(timestamp);
        }
    }

    // Automatically scroll to line in the transcript that the video is currently paying in
    wordsArea.scrollIntoView({
        behavior: 'smooth'
    });

    state.transcriptShowing = true;
    // scrollToLocationMarker();
}

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
    await fetchSetLastIndex(state.videoLink, index);
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
 * Updates the colors of the words on the screen based on the proficiency levels of each word.
 * 
 * @param {Object} proficiencyLevels Proficiency levels of each word
 */
export function updateWordColors(proficiencyLevels) {
    const segmentedWords = wordsArea.getElementsByTagName('span');
    
    for (const word of segmentedWords) {
        if (word.dataset.word in proficiencyLevels) {
            word.dataset.proficiency = proficiencyLevels[word.dataset.word];
            word.classList.add(state.proficiencyClasses[word.dataset.proficiency]);
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
            word.classList.toggle('savedWord');
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