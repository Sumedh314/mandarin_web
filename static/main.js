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
} from './fetchFunctions.js';

import {
    videoTitle,
    videoLocation,
    videoButton,
    textButton,
    translationArea,
    translateTranscriptButton,
    generateStoryButton,
    words,
    state
} from "./documentAreas.js";

import {
    printText,
    printTranscript,
    printDefinitions,
    printUserText,
    updateWordColors
} from "./renderText.js";

import {
    embedVideo,
    findTimestamp,
    toggleVideo,
} from "./videoFunctions/modifyingVideo.js";

import {videoReady} from "./videoFunctions/videoStates.js";

const loadingSign = 'Loading...';

/**
 * Runs when the words area is clicked. Prints word definition and movese transcript if word clicked and toggles video.
 * 
 * @param {object} event Space in the words area that was clicked.
*/
async function onWordClick(event) {
    let clickedWord = '';

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        printDefinitions(window.getSelection().toString());
    }
    
    // If the user clicked a word
    if (event.target.hasAttribute('data-word')) {

        // Scroll to time in the video of the word
        if (!event.target.parentNode.classList.contains('words')) {
            for (const element of state.timestampElements) {
                if (element.classList.contains('currentTime')) {
                    element.classList.replace('currentTime', 'normal');
                }
            }
            event.target.parentNode.classList.replace('normal', 'currentTime');
            state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
        }

        printDefinitions(event.target.dataset.word);
        console.log(state.lastIndex);
        let currentIndex = parseInt(event.target.dataset.index, 10);
        const confidenceLevels = await fetchUpdatedConfidenceLevels(state.lastIndex, currentIndex);
        updateWordColors(confidenceLevels);

        if (state.lastIndex < currentIndex) {
            state.lastIndex = currentIndex;
        }
        
        // Toggle video if the user clicked on the same word twice, or pause video if user clicked a new word
        if (!(clickedWord == event.target.dataset.word) || state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            state.videoPlayer.pauseVideo();
            clickedWord = event.target.dataset.word;
        }
        else {
            state.videoPlayer.playVideo();
            clickedWord = '';
        }
    }

    // If the user clicked a timestamp, move the video to that timestamp
    else if (event.target.classList.contains('timestamp')) {
        state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
    }

    // Toggle video if the user clicked in the transcript area but not on a word
    else {
        clickedWord = '';
        if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING || window.getSelection().toString() != '') {
            state.videoPlayer.pauseVideo();
        }
        else {
            state.videoPlayer.playVideo();
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
    if (videoReady()) {
        const currentTime = state.videoPlayer.getCurrentTime();
        const currentTimestamp = findTimestamp(currentTime);
        const indexOfCurrentTimestamp = state.timestampElements.indexOf(currentTimestamp);

        const allKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'l'];

        // Make sure key pressed is within one of the keys that should do something
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
                    newTime = Number(state.timestampElements[indexOfCurrentTimestamp - 1].dataset.timestamp);
                    break;
                case 'ArrowDown':
                    newTime = Number(state.timestampElements[indexOfCurrentTimestamp + 1].dataset.timestamp);
                    break;
                
                default:
                    break;
            }

            console.log(state.timestampElements);
            console.log(indexOfCurrentTimestamp);
            console.log(newTime);
            state.videoPlayer.seekTo(newTime);
        }
    }
}

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words
 */
async function loadVideoAndTranscript() {
    words.innerHTML = loadingSign;

    state.lastIndex = -1;

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

// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', printUserText);
translateTranscriptButton.addEventListener('click', fetchTranscriptTranslation);
generateStoryButton.addEventListener('click', generateStory);
words.addEventListener('click', (event) => onWordClick(event));
window.addEventListener('keydown', (event) => onKeyPressed(event));