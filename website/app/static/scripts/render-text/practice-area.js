import {
    state,
    videoTitle,
    wordsArea,
    wordsAreaContainer
} from "../document-areas.js";

import {
    fetchTranscriptWordSegments,
    fetchWordSegments
} from "../old_api/language-processing/segmentation.js";

import {
    fetchProficiencyLevels,
    fetchTranscriptProficiencyLevels
} from "../old_api/user-data/proficiency.js";

import { fetchCheckSaved } from "../old_api/user-data/practice.js";
import { formatTimestamp } from "../utils.js";

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
        const transcriptLine = document.createElement('span');
        transcriptLine.className = 'normal';
        transcriptLine.dataset.timestamp = timestamp;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'timestamp';
        timestampElement.textContent = formatTimestamp(timestamp);

        const space = document.createElement('span');
        space.textContent = ' ';

        transcriptLine.appendChild(timestampElement);
        transcriptLine.appendChild(space);
        
        for (const word of segmentedTranscript[timestamp]) {
            if (word == '\n') {
                wordsArea.appendChild(document.createElement('br'));
                continue;
            }
            if (word in proficiencyLevels) {
                const wordElement = document.createElement('span');
                wordElement.classList.add('word');
                wordElement.dataset.word = word;
                wordElement.dataset.index = wordIndex;
                wordElement.dataset.proficiency = proficiencyLevels[word];
                wordElement.textContent = word;

                const wordIsSaved = await fetchCheckSaved(word) == 'Saved' ? true : false;
                if (wordIsSaved) {
                    wordElement.classList.add('saved-word');
                }

                transcriptLine.appendChild(wordElement);

                wordIndex++;
            }
            else {
                const wordElement = document.createElement('span');
                wordElement.textContent = word;

                transcriptLine.appendChild(wordElement);
            }

            if (wordIndex == state.lastIndex + 1) {
                transcriptLine.appendChild(locationMarker);
                locationMarker.hidden = false;
            }
        }

        wordsArea.appendChild(transcriptLine);
        wordsArea.appendChild(document.createElement('br'));
    }
    addDoneButton(wordIndex);

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
            wordElement.dataset.word = word;
            wordElement.dataset.index = wordIndex;
            wordElement.dataset.proficiency = proficiencyLevels[word];
            wordElement.textContent = word;

            const wordIsSaved = await fetchCheckSaved(word) == 'Saved' ? true : false;
            if (wordIsSaved) {
                wordElement.classList.add('saved-word');
            }

            wordsArea.appendChild(wordElement);
            wordIndex++;
        }
        else {
            let wordElement = document.createElement('span');
            wordElement.textContent = word;
            wordsArea.appendChild(wordElement);
        }
    }

    wordsAreaContainer.style.textAlign = 'left';
    wordsArea.appendChild(document.createElement('br'));
    addDoneButton(wordIndex);
}

/**
 * Adds a "Done" button to the end of a transcript or text
 * 
 * @param {Number} wordIndex Index of the final word of the transcript or text
 */
function addDoneButton(wordIndex) {
    const doneButton = document.createElement('span');
    doneButton.classList.add('word');
    doneButton.dataset.proficiency = 3;
    doneButton.dataset.action = 'final-word';
    doneButton.dataset.index = wordIndex + 1;
    doneButton.textContent = 'Done';

    wordsArea.appendChild(document.createElement('br'));
    wordsArea.appendChild(doneButton);
}