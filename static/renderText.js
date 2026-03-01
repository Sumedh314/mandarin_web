import {
    fetchWordSegments,
    fetchConfidenceLevels,
    fetchTranscriptWordSegments,
    fetchTranscriptConfidenceLevels,
    fetchTranslation,
    fetchPinyin
} from "./fetchFunctions.js";

import {
    translationArea,
    videoTitle,
    words,
    state
} from "./documentAreas.js";

import {formatTimestamp} from "./utils.js"

const loadingSign = 'Loading...';

/**
 * Prints the text into the dedicated area with clickable words.
 * 
 * @param {string} text Original text to be printed
 */
export async function printText(text) {
    let wordsAreaText = '';
    let wordIndex = 0;

    const segmentedText = await fetchWordSegments(text);
    const confidenceLevels = await fetchConfidenceLevels(segmentedText);

    for (const word of segmentedText) {
        if (word == '\n') {
            wordsAreaText += '<br>';
            continue;
        }
        if (word in confidenceLevels) {
            wordsAreaText += `<span class="${state.confidenceClasses[confidenceLevels[word]]}" data-word="${word}" data-index="${wordIndex}" data-confidence="${confidenceLevels[word]}">${word}</span>`;
            wordIndex++;
        }
        else {
            wordsAreaText += `<span>${word}</span>`;
        }
    }

    words.innerHTML = wordsAreaText;
}

/**
 * Prints a transcript to the screen while preserving timestamps
 * 
 * @param {Object} transcript Original transcript with snippets at each timestamp
 */
export async function printTranscript(transcript) {
    words.innerHTML = loadingSign;

    const segmentedTranscript = await fetchTranscriptWordSegments(transcript);
    const confidenceLevels = await fetchTranscriptConfidenceLevels(segmentedTranscript);

    state.timestampElements = [];
    let timestamps = [];

    for (const timestamp of Object.keys(segmentedTranscript)) {
        timestamps.push(timestamp)
    }
    timestamps = timestamps.sort((a, b) => a - b);

    let wordsAreaText = '';
    let wordIndex = 0;

    videoTitle.textContent = state.videoPlayer.videoTitle;

    for (const timestamp of timestamps) {
        wordsAreaText += `<span data-timestamp="${timestamp}" class="normal">`;
        wordsAreaText += `<span class="timestamp">${formatTimestamp(timestamp)}</span> `;

        for (const word of segmentedTranscript[timestamp]) {
            if (word == '\n') {
                wordsAreaText += '<br>';
                continue;
            }
            if (word in confidenceLevels) {
                wordsAreaText += `<span class="${state.confidenceClasses[confidenceLevels[word]]}" data-word="${word}" data-index="${wordIndex}" data-confidence="${confidenceLevels[word]}">${word}</span>`;
                wordIndex++;
            }
            else {
                wordsAreaText += `<span>${word}</span>`;
            }
        }

        wordsAreaText += '</span><br>';
    }

    words.innerHTML = wordsAreaText;

    // Push timestamps to timestampElements for other functions to use
    for (const timestamp of words.children) {
        if (timestamp.tagName == 'SPAN') {
            state.timestampElements.push(timestamp);
        }
    }

    // Automatically scroll to line in the transcript that the video is currently paying in
    words.scrollIntoView({
        behavior: 'smooth'
    });
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
 * Segments and prints text pasted in by the user
 */
export async function printUserText() {
    state.lastIndex = -1;

    const text = document.getElementById('text').value;

    printText(text);
}

/**
 * Updates the colors of the words on the screen based on the confidence levels of each word.
 * 
 * @param {Object} confidenceLevels Confidence levels of each word
 */
export function updateWordColors(confidenceLevels) {
    const segmentedWords = words.getElementsByTagName('span');
    
    for (const word of segmentedWords) {
        if (word.dataset.word in confidenceLevels) {
            word.dataset.confidence = confidenceLevels[word.dataset.word];
            word.setAttribute('class', state.confidenceClasses[word.dataset.confidence]);
        }
    }
}