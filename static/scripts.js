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
 * Translates and prints text into the dedicated area.
 */
async function printDefinitions(text) {
    const translation = await requestTranslation(text);
    const pinyin = await requestPinyin(text);

    document.getElementById('translation').innerHTML = `${text}<br>${pinyin}<br>${translation}`;
}

/**
 * Segments and prints the text entered manually by the user.
 */
async function segmentAndPrintText() {
    const confidenceClasses = {0: 'confidenceZero', 1: 'confidenceOne', 2: 'confidenceTwo', 3:'confidenceThree', [-1]: 'confidenceNA'}

    const text = document.getElementById('text').value;
    const segmentedText = await requestWordSegments(text);
    const confidenceLevels = await requestConfidenceLevels(segmentedText);

    let wordsAreaText = '';
    for (const word of segmentedText) {
        if (confidenceLevels[word] != -1) {
            wordsAreaText += `<a class="${confidenceClasses[confidenceLevels[word]]}" onclick="printDefinitions('${word}')">${word}</a>`;
            wordsAreaText += ' ';
        }
        else {
            wordsAreaText += `<a>${word}</a>`
        }
    }

    console.log(confidenceLevels);

    document.getElementById('words').innerHTML = wordsAreaText;
}

/**
 * Prints the text into the dedicated area with clickable words
 * 
 * @param {Map} text Text segmented into words with confidence levels
 */
async function printText(text) {
    let wordsAreaText = '';
    for (const word of text) {
        let confidence = text[word];
        wordsAreaText += `<a class="highlight" onclick="printDefinitions('${word}')">${word}</a>`;
        wordsAreaText += '  ';
    }
}

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 */
async function loadVideoAndTranscript() {

    // Convert user link to a link that can be embedded
    let originalLink = new URL(document.getElementById('link').value);
    let embedLink = `https://www.youtube.com/embed/${originalLink.searchParams.get('v')}`;
    
    // Embed video
    video.innerHTML = `<iframe width="560" height="315" src=${embedLink} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    // Generate transcript
    const transcriptResponse = await fetch('/generate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: originalLink.href,
    });
    const transcript = await transcriptResponse.json();

    // Print transcript line by line and including the timestamp
    let wordsAreaText = '';
    for (let index = 0; index < transcript.length; index++) {
        let timestamp = transcript[index]['start'];
        let text = await requestWordSegments(transcript[index]['text']);

        wordsAreaText += `${formatTimestamp(timestamp)}: `
        for (const word of text) {
            wordsAreaText += `<a class="highlight" onclick="printTranslations('${word}')">${word}</a>`;
            wordsAreaText += '  ';
        }
        wordsAreaText += '<br>';
    }
    document.getElementById('words').innerHTML = wordsAreaText;
}

/**
 * Segments Mandarin text into individual words using Python
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

// Event listeners
const video = document.getElementById('video');
const videoButton = document.getElementById('videoButton');
const textButton = document.getElementById('textButton');

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', segmentAndPrintText);