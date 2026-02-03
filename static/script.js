import {
    fetchGeminiPrompt,
    fetchTranslation,
    fetchPinyin,
    fetchVideoTranscript,
    fetchTranscriptTranslation,
    fetchWordSegments,
    fetchTranscriptWordSegments,
    fetchConfidenceLevels,
    fetchTranscriptConfidenceLevels,
    fetchUpdatedConfidenceLevels
} from './fetch_functions.js';

const confidenceClasses = {0: 'confidenceZero', 1: 'confidenceOne', 2: 'confidenceTwo', 3:'confidenceThree'}
const loadingSign = 'Loading...';
let lastIndex = -1;
let iframe_api_ready = false;
let videoPlayer;
let videoReady = false;
let videoId = '';
let clickedWord = '';
let scrollToTimestamp = null;
let timestampElements = [];

/**
 * Runs when the words area is clicked. Prints word definition and movese transcript if word clicked and toggles video.
 * 
 * @param {object} event Space in the words area that was clicked.
 */
async function onWordClick(event) {

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        printDefinitions(window.getSelection().toString());
    }
    
    // If the user clicked a word
    if (event.target.hasAttribute('data-word')) {

        // Scroll to time in the video of the word
        if (!event.target.parentNode.classList.contains('words')) {
            for (const element of timestampElements) {
                if (element.classList.contains('currentTime')) {
                    element.classList.replace('currentTime', 'normal');
                }
            }
            event.target.parentNode.classList.replace('normal', 'currentTime');
            videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
        }

        printDefinitions(event.target.dataset.word);
        const confidenceLevels = await fetchUpdatedConfidenceLevels(event.target.dataset.index);
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
}

/**
 * Runs when a key is pressed
 * 
 * @param {object} event Key that was pressed
 */
async function onKeyPressed(event) {

    // Make sure video is ready
    if (videoReady) {
        const currentTime = videoPlayer.getCurrentTime();
        const currentTimestamp = findTimestamp(currentTime);
        const indexOfCurrentTimestamp = timestampElements.indexOf(currentTimestamp);

        const allKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'l'];

        if (allKeys.includes(event.key)) {
            event.preventDefault();

            let newTime = 0;
            switch (event.key) {

                // Toggle video is spacebar is pressed
                case ' ':
                    toggleVideo();
                    break;

                // Move video back and forth 5 seconds if left or right arrow keys are pressed
                case 'ArrowLeft':
                    newTime = currentTime - 5;
                    break;
                case 'ArrowRight':
                    newTime = currentTime + 5;
                    break;

                // Move video back and forth 10 seconds if j or l are pressed
                case 'j':
                    newTime = currentTime - 10;
                    break;
                case 'l':
                    newTime = currentTime + 10;
                    break;

                // Move to previous or next timestamp if user clicked up or down arrow
                case 'ArrowUp':
                    newTime = Number(timestampElements[indexOfCurrentTimestamp - 1].dataset.timestamp);
                    break;
                case 'ArrowDown':
                    newTime = Number(timestampElements[indexOfCurrentTimestamp + 1].dataset.timestamp);
                    break;
                
                default:
                    break;
            }

            console.log(timestampElements);
            console.log(indexOfCurrentTimestamp);
            console.log(newTime);
            videoPlayer.seekTo(newTime);
        }
    }
}

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words
 */
async function loadVideoAndTranscript() {
    words.innerHTML = loadingSign;

    lastIndex = -1;

    // Embed video
    const link = document.getElementById('link').value;
    embedVideo(link);
    
    const transcript = await fetchVideoTranscript(link);
    printTranscript(transcript);
}

/**
 * Prompts Google Gemini to generate a story in Mandarin.
 */
async function generateStory() {
    const prompt = "I'm trying to learn Mandarin, and I'm currently a beginner. Can you generate a short, beginner-friendly story in Mandarin for me?";

    const response = await fetchGeminiPrompt(prompt);

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

    const segmentedText = await fetchWordSegments(text);
    const confidenceLevels = await fetchConfidenceLevels(segmentedText);

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

    const segmentedTranscript = await fetchTranscriptWordSegments(transcript);
    const confidenceLevels = await fetchTranscriptConfidenceLevels(segmentedTranscript);

    timestampElements = [];
    let timestamps = [];

    for (const timestamp of Object.keys(segmentedTranscript)) {
        timestamps.push(timestamp)
    }
    timestamps = timestamps.sort((a, b) => a - b);

    let wordsAreaText = '';
    let wordIndex = 0;

    videoTitle.textContent = videoPlayer.videoTitle;

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
    const translation = await fetchTranslation(text);
    const pinyin = await fetchPinyin(text);

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
    if (!videoReady) {
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
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    else {
        videoPlayer.loadVideoById(videoId);
    }
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
 * Finds the timestamp of the current portion of the transcript the video is playing.
 * 
 * @param {Number} currentTime The current time of the video
*/
function findTimestamp(currentTime) {
    const candidates = [];
    
    // Push all timestamps before the current video location into candidates
    for (const timestamp of timestampElements) {
        if (currentTime > Number(timestamp.dataset.timestamp)) {
            candidates.push(timestamp);
        }
    }
    
    // Final candidate is the last element in candidates
    return candidates[candidates.length - 1];
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

    const currentTime = videoPlayer.getCurrentTime();

    const currentTimestamp = findTimestamp(currentTime);
    
    if (!currentTimestamp) {
        scrollToTimestamp = requestAnimationFrame(scrollTranscript);
        return;
    }
    
    const currentTimestampTop = currentTimestamp.getBoundingClientRect()['top'];
    const currentTimestampBottom = currentTimestamp.getBoundingClientRect()['bottom'];

    // Scroll to timestamp if not in view
    if (currentTimestampTop < wordsAreaTop || currentTimestampBottom > wordsAreaBottom) {
        currentTimestamp.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Change class attributes to highlight the current line
    for (const item of timestampElements) {
        item.setAttribute('class', 'normal');
    }
    currentTimestamp.setAttribute('class', 'currentTime')

    if (videoPlayer.getPlayerState() === YT.PlayerState.PAUSED) {
        cancelAnimationFrame(scrollToTimestamp);
    }

    scrollToTimestamp = requestAnimationFrame(scrollTranscript);
}

/**
 * Runs when the YouTube video player is ready.
 */
function onPlayerReady() {
    videoReady = true;
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
 * If the video is playing, the video pauses. If the video is paused, the video starts playing.
 */
function toggleVideo() {
    if (videoReady) {
        if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            videoPlayer.pauseVideo();
        }
        else {
            videoPlayer.playVideo()
        }
    }
}

/**
 * Runs when the YouTube IFrame API is ready
 */
window.onYouTubeIframeAPIReady = function() {
    iframe_api_ready = true;
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
const videoTitle = document.getElementById('videoTitle');

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', printUserText);
translateTranscriptButton.addEventListener('click', fetchTranscriptTranslation);
generateStoryButton.addEventListener('click', generateStory);
words.addEventListener('click', (event) => onWordClick(event));
window.addEventListener('keydown', (event) => onKeyPressed(event));