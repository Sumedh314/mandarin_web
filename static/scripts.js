const confidenceClasses = {0: 'confidenceZero', 1: 'confidenceOne', 2: 'confidenceTwo', 3:'confidenceThree'};

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words
 */
async function loadVideoAndTranscript() {
    const link = document.getElementById('link').value;
    embedVideo(link);

    const transcript = await requestVideoTranscript(link);
    const segmentedTranscript = await requestTranscriptWordSegments(transcript);
    
    let transcriptConfidencesLevels = {};
    for (const timestamp in segmentedTranscript) {
        let snippetConfidencesLevels = await requestConfidenceLevels(segmentedTranscript[timestamp]);
        for (const word in snippetConfidencesLevels) {
            transcriptConfidencesLevels[word] = snippetConfidencesLevels[word];
        }
    }

    printText(segmentedTranscript, transcriptConfidencesLevels, true);
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    const text = document.getElementById('text').value;

    const segmentedText = await requestWordSegments(text);
    const confidenceLevels = await requestConfidenceLevels(segmentedText);

    printText(segmentedText, confidenceLevels, false);
}

/**
 * Prints the text into the dedicated area with clickable words.
 * 
 * @param {Object} segmentedText Original text to be printed after being segmented
 * @param {Object} confidenceLevels Confidence levels for each word
 * @param {boolean} isTranscript Whether or not the text to be printed is a transcript
 */
function printText(segmentedText, confidenceLevels, isTranscript) {
    let wordsAreaText = '';
    if (isTranscript) {
        for (const timestamp of Object.keys(segmentedText)) {
            let text = segmentedText[timestamp];
            wordsAreaText += formatTimestamp(timestamp);

            wordsAreaText += createClickableWords(text, confidenceLevels);

            wordsAreaText += "<br>";
        }
    }
    else {
        wordsAreaText += createClickableWords(segmentedText, confidenceLevels)
    }

    document.getElementById('words').innerHTML = wordsAreaText;
}

/**
 * Translates and prints text into the dedicated area.
 */
async function printDefinitions(text) {
    const translation = await requestTranslation(text);
    const pinyin = await requestPinyin(text);

    document.getElementById('translation').innerHTML = `${text}<br>${pinyin}<br>${translation}`;
}

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 */
async function embedVideo(link) {

    // Convert user link to a link that can be embedded
    const originalLink = new URL(link);
    const embedLink = `https://www.youtube.com/embed/${originalLink.searchParams.get('v')}`;
    
    // Embed video
    video.innerHTML = `<iframe width="560" height="315" src=${embedLink} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

/**
 * Sends a prompt to Google Gemini
 * 
 * @param {string} prompt the prompt to send to gemini
 * @returns {string} Gemini's response
 */
async function requestGeminiPrompt(prompt) {

    // Prompt Gemini
    const geminiResponse = await fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: prompt,
    });
    const message = await geminiResponse.text();

    return message;
}

/**
 * Gets the English translation of a word from Python.
 * 
 * @param {string} text text user wants to translate
 */
async function requestTranslation(text) {

    // Get translation from Python
    const translationResponse = await fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const translation = await translationResponse.text();

    return translation;
}

/**
 * Gets the pinyin representation of a word from Python.
 * 
 * @param {string} text text user wants to get pinyin of
 */
async function requestPinyin(text) {

    // Get translation from Python
    const translationResponse = await fetch('/get_pinyin', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const pinyin = await translationResponse.text();

    return pinyin;
}

/**
 * Requests the transcript of the YouTube video with the given link.
 */
async function requestVideoTranscript(link) {
    const transcriptResponse = await fetch('/generate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: link,
    });
    const transcript = await transcriptResponse.json();

    return transcript;
}

/**
 * Segments Mandarin text into individual words using Python
 * 
 * @param {string} text Text for function to segment
 */
async function requestWordSegments(text) {

    // Get segmented text
    const segmentationResponse = await fetch('/segment_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const segmentedText = await segmentationResponse.json();

    return segmentedText;
}

/**
 * Requests a video transcript to be segmented into individual words while preserving timestamps
 */
async function requestTranscriptWordSegments(transcript) {

    // Get segmented text
    const segmentationResponse = await fetch('/segment_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcript),
    });
    const segmentedText = await Map(segmentationResponse.json());
    
    // let segmentedTextMap = new Map(Object.entries(segmentedText));
    console.log(segmentedTextMap);

    return segmentedText;
}

/**
 * Requests the confidence levels of each word of the given text
 */
async function requestConfidenceLevels(text) {

    // Get confidence levels
    const confidenceLevelsResponse = await fetch('/get_confidence_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(text),
    });
    const confidenceLevels = await confidenceLevelsResponse.json();

    return confidenceLevels;
}

/**
 * Converts a YouTube transcript timestamp from seconds to hh:mm:ss
 * 
 * @param {string|number} timestamp time of video in seconds
 * @returns {string} timestamp in mm:ss or hh:mm:ss
 */
function formatTimestamp(timestamp) {
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
 * Creates color-coded words that the user can click to see definitions
 * 
 * @param {Object} text The segmented text to print in the words area
 * @param {Object} confidenceLevels Confidencen levels of each word in the text
 * @returns {string}
 */
function createClickableWords(text, confidenceLevels) {
    let wordsAreaText = '';

    for (const word of text) {
        if (word == '\n') {
            wordsAreaText += '<br>';
            continue;
        }
        if (word in confidenceLevels) {
            wordsAreaText += `<span class="${confidenceClasses[confidenceLevels[word]]}" data-word="${word}" data-confidence="${confidenceLevels[word]}">${word}</span> `;
        }
        else {
            wordsAreaText += `<span>${word}</span>`
        }
    }

    return wordsAreaText;
}

// Event listeners
const video = document.getElementById('video');
const videoButton = document.getElementById('videoButton');
const textButton = document.getElementById('textButton');
const words = document.getElementById('words');

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', printUserText);
words.addEventListener('click', function(event) {
    if (event.target.hasAttribute('data-word')) {
        printDefinitions(event.target.dataset.word);
    }
});