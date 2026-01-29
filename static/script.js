const confidenceClasses = {0: 'confidenceZero', 1: 'confidenceOne', 2: 'confidenceTwo', 3:'confidenceThree'}
const loadingSign = 'Loading...';
let lastIndex = -1;
let iframe_api_ready = false;
let videoPlayer;
let videoId = '';
let clickedWord = '';
let scrollToTimestamp = null;
let timestampElements = [];

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words
 */
async function loadVideoAndTranscript() {
    words.innerHTML = loadingSign;

    lastIndex = -1;

    // Embed video
    const link = document.getElementById('link').value;
    embedVideo(link);

    const transcript = await requestVideoTranscript(link);

    printTranscript(transcript);
}

/**
 * Prompts Google Gemini to generate a story in Mandarin.
 */
async function generateStory() {
    const prompt = "I'm trying to learn Mandarin, and I'm currently a beginner. Can you generate a short, beginner-friendly story in Mandarin for me?";

    const response = await requestGeminiPrompt(prompt);

    printText(response);
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    lastIndex = -1;

    const text = document.getElementById('text').value;

    printText(text);
}

/**
 * Prints the text into the dedicated area with clickable words.
 * 
 * @param {string} text Original text to be printed
 */
async function printText(text) {
    let wordsAreaText = '';
    let wordIndex = 0;

    const segmentedText = await requestWordSegments(text);
    const confidenceLevels = await requestConfidenceLevels(segmentedText);

    for (const word of segmentedText) {
        if (word == '\n') {
            wordsAreaText += '<br>';
            continue;
        }
        if (word in confidenceLevels) {
            wordsAreaText += `<span class="${confidenceClasses[confidenceLevels[word]]}" data-word="${word}" data-index="${wordIndex}" data-confidence="${confidenceLevels[word]}">${word}</span>`;
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
async function printTranscript(transcript) {
    words.innerHTML = loadingSign;

    const segmentedTranscript = await requestTranscriptWordSegments(transcript);
    const confidenceLevels = await requestTranscriptConfidenceLevels(segmentedTranscript);

    timestampElements = [];
    let timestamps = [];

    for (const timestamp of Object.keys(segmentedTranscript)) {
        timestamps.push(timestamp)
    }
    timestamps = timestamps.sort((a, b) => a - b);

    let wordsAreaText = '';
    let wordIndex = 0;

    if (videoPlayer) {
        wordsAreaText += videoPlayer.getVideoData().title;
        wordsAreaText += '<br><br>';
    }

    for (const timestamp of timestamps) {
        wordsAreaText += `<span data-timestamp="${timestamp}" class="normal">`;
        wordsAreaText += `<span class="timestamp">${formatTimestamp(timestamp)}</span> `;

        for (const word of segmentedTranscript[timestamp]) {
            if (word == '\n') {
                wordsAreaText += '<br>';
                continue;
            }
            if (word in confidenceLevels) {
                wordsAreaText += `<span class="${confidenceClasses[confidenceLevels[word]]}" data-word="${word}" data-index="${wordIndex}" data-confidence="${confidenceLevels[word]}">${word}</span>`;
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
            timestampElements.push(timestamp);
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
async function printDefinitions(text) {
    translationArea.innerHTML = loadingSign;
    const translation = await requestTranslation(text);
    const pinyin = await requestPinyin(text);

    translationArea.innerHTML = `${text}<br>${pinyin}<br>${translation}`;
}

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 * 
 * @param {string} link Link to YouTube video
 */
async function embedVideo(link) {

    // Extract the video ID from the link the user gave
    const originalLink = new URL(link);
    videoId = originalLink.searchParams.get('v');

    if (!iframe_api_ready) {
        return alert('Iframe API not ready');
    }

    // Embed video
    if (!videoPlayer) {
        videoPlayer = new YT.Player('videoLocation', {
            height: 450,
            width: 800,
            videoId: videoId,
            playerVars: {
                'origin': 'http://localhost:5000',
                'enablejsapi': true,
                'autoplay': true,
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
    else {
        videoPlayer.loadVideoById(videoId);
    }

    videoLocation.focus();
}

/**
 * Sends a prompt to Google Gemini
 * 
 * @param {string} prompt The prompt to send to gemini
 */
async function requestGeminiPrompt(prompt) {
    const geminiResponse = await fetch('/prompt_gemini', {
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
 * 
 * @param {string} link Link of YouTube video
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
 * Translates a transcript into Chinese if available
 */
async function translateTranscript() {
    const transcriptResponse = await fetch('/translate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: videoId,
    });
    const transcript = await transcriptResponse.json();

    printTranscript(transcript);
}

/**
 * Segments Mandarin text into individual words using Python
 * 
 * @param {string} text Text to segment into words
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
 * Segments a transcript into words while preserving timestamps.
 * 
 * @param {Object} transcript Transcript to segment into words
 */
async function requestTranscriptWordSegments(transcript) {

    // Get segmented transcript
    const segmentationResponse = await fetch('/segment_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcript),
    });
    const segmentedTranscript = await segmentationResponse.json();

    return segmentedTranscript;
}

/**
 * Requests the confidence levels of each word of the given text
 * 
 * @param {Array} segmentedText Text segmented into individual words
 */
async function requestConfidenceLevels(segmentedText) {

    // Get confidence levels
    const confidenceLevelsResponse = await fetch('/get_confidence_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(segmentedText),
    });
    const confidenceLevels = await confidenceLevelsResponse.json();

    return confidenceLevels;
}

async function requestTranscriptConfidenceLevels(segmentedTranscript) {
    
    // Push all words of transcript into transcriptWords without including timestamps.
    let transcriptWords = []
    for (const snippet of Object.keys(segmentedTranscript)) {
        for (const word of segmentedTranscript[snippet]) {
            transcriptWords.push(word)
        }
    }

    const transcriptConfidencesLevels = await requestConfidenceLevels(transcriptWords);

    return transcriptConfidencesLevels;
}

/**
 * Updates the confidence levels of words based on the word the user clicked
 * 
 * @param {string} currentIndex Index of the word that the user clicked
 */
async function updateConfidenceLevels(currentIndex) {
    currentIndex = parseInt(currentIndex, 10);
    if (currentIndex == lastIndex) {
        return {};
    }
    const segmentedWords = words.getElementsByTagName('span');

    // Put all words from lastIndex to currentIndex in 'previous', and put current word in 'current'
    let wordsToUpdate = {'previous': [], 'current': ''};
    for (const word of segmentedWords) {
        if (word.hasAttribute('data-index')){
            wordIndex = parseInt(word.dataset.index, 10);

            if (wordIndex < currentIndex) {
                if (wordIndex > lastIndex) {
                    wordsToUpdate['previous'].push(word.dataset.word);
                }
            }
            else if (wordIndex == currentIndex) {
                wordsToUpdate['current'] = word.dataset.word;
            }
            else {
                break;
            }
        }
        else {
            continue;
        }
    }

    if (lastIndex < currentIndex) {
        lastIndex = currentIndex;
    }

    // Get confidence levels from Python
    const updatedConfidenceLevelsResponse = await fetch('/update_confidence_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordsToUpdate),
    });
    const updatedConfidenceLevels = await updatedConfidenceLevelsResponse.json();

    return updatedConfidenceLevels;
}

/**
 * Updates the colors of the words on the screen based on the confidence levels of each word.
 * 
 * @param {Object} confidenceLevels Confidence levels of each word
 */
function updateWordColors(confidenceLevels) {
    const segmentedWords = words.getElementsByTagName('span');
    
    for (const word of segmentedWords) {
        if (word.dataset.word in confidenceLevels) {
            word.dataset.confidence = confidenceLevels[word.dataset.word];
            word.setAttribute('class', confidenceClasses[word.dataset.confidence]);
        }
    }
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
 * Automatically scrolls the transcript to the location of the video
 */
function scrollTranscript() {
    const wordsAreaTop = words.getBoundingClientRect()['top'];
    const wordsAreaBottom = words.getBoundingClientRect()['bottom'];

    let currentTime = videoPlayer.getCurrentTime();
    let candidates = [];
    
    // Push all timestamps before the current video location into candidates
    for (const timestamp of timestampElements) {
        if (currentTime > Number(timestamp.dataset.timestamp)) {
            candidates.push(timestamp);
        }
    }

    // Final candidate is the last element in candidates
    const finalCandidate = candidates[candidates.length - 1];
    
    if (!finalCandidate) {
        scrollToTimestamp = requestAnimationFrame(scrollTranscript);
        return;
    }
    
    const finalCandidateTop = finalCandidate.getBoundingClientRect()['top'];
    const finalCandidateBottom = finalCandidate.getBoundingClientRect()['bottom'];

    // Scroll to timestamp if not in view
    if (finalCandidateTop < wordsAreaTop || finalCandidateBottom > wordsAreaBottom) {
        finalCandidate.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Change class attributes to highlight the current line
    for (const item of timestampElements) {
        item.setAttribute('class', 'normal');
    }
    finalCandidate.setAttribute('class', 'currentTime')

    if (videoPlayer.getPlayerState() === YT.PlayerState.PAUSED) {
        clearInterval(scrollToTimestamp);
    }

    scrollToTimestamp = requestAnimationFrame(scrollTranscript);
}

/**
 * Runs when the YouTube video player changes state
 */
async function onPlayerStateChange() {

    // Run function to automatically scroll transcript
    if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        if (scrollToTimestamp === null) {
            scrollToTimestamp = requestAnimationFrame(scrollTranscript);
        }
    }
    else {
        cancelAnimationFrame(scrollToTimestamp);
        scrollToTimestamp = null;
    }
}

/**
 * Runs when the YouTube IFrame API is ready
 */
function onYouTubeIframeAPIReady() {
    iframe_api_ready = true;
}

/**
 * Play the current video
 */
function playYouTubeVideo() {
    videoPlayer.playVideo();
}

// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

// Event listeners
const videoLocation = document.getElementById('videoLocation');
const videoButton = document.getElementById('videoButton');
const textButton = document.getElementById('textButton');
const translationArea = document.getElementById('translation');
const translateTranscriptButton = document.getElementById('translateTranscriptButton');
const generateStoryButton = document.getElementById('generateStory');
const words = document.getElementById('words');

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', printUserText);
translateTranscriptButton.addEventListener('click', translateTranscript);
generateStoryButton.addEventListener('click', generateStory);
words.addEventListener('click', async function(event) {

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        printDefinitions(window.getSelection().toString());
    }
    
    // If the user clicked a word
    if (event.target.hasAttribute('data-word')) {

        // Scroll to time in the video if the user clicked a word at a different timestamp
        if (!event.target.parentNode.classList.contains('currentTime') && !event.target.parentNode.classList.contains('words')) {
            for (const element of timestampElements) {
                if (element.classList.contains('currentTime')) {
                    element.classList.replace('currentTime', 'normal');
                }
            }
            event.target.parentNode.classList.replace('normal', 'currentTime');
            videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
        }

        printDefinitions(event.target.dataset.word);
        confidenceLevels = await updateConfidenceLevels(event.target.dataset.index);
        updateWordColors(confidenceLevels);
        
        // Toggle video if the user clicked on the same word twice, or pause video if user clicked a new word
        if (!(clickedWord == event.target.dataset.word) || videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            videoPlayer.pauseVideo();
            clickedWord = event.target.dataset.word;
        }
        else {
            videoPlayer.playVideo();
            clickedWord = '';
        }
    }

    // If the user clicked a timestamp, move the video to that timestamp
    else if (event.target.classList.contains('timestamp')) {
        videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
    }

    // Toggle video if the user clicked in the transcript area but not on a word
    else {
        clickedWord = '';
        if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING || window.getSelection().toString() != '') {
            videoPlayer.pauseVideo();
        }
        else {
            videoPlayer.playVideo();
        }
    }
});