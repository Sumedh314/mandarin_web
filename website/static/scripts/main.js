import {
    videoButton,
    textButton,
    translateTranscriptButton,
    generateStoryButton,
    wordsArea,
    state,
    locationMarker,
    practiceWordsButton,
    wordMenu,
    textEntry,
    linkEntry
} from "./documentAreas.js";

import {
    fetchGeminiPrompt,
    fetchVideoTranscript,
    fetchTranscriptTranslation,
    fetchUpdatedProficiencyLevels,
    fetchRandomListWordsLearning,
    fetchLastIndex,
    updatePracticeSentences,
    fetchToggleSavedWord,
    fetchRandomListWordsSaved
} from './fetchData.js';

import {
    createCards,
    generatePracticeSentence
} from "./practiceWords.js";

import {
    printText,
    printTranscript,
    printDefinitions,
    updateWordColors,
    updateHskLevels,
    updateLocationMarker,
    setLastIndex,
    updateWordUnderlines,
    showWordMenu
} from "./renderText.js";

import {
    embedVideo,
    findTimestamp,
    toggleVideo
} from "./videoFunctions/modifyingVideo.js";

import {videoReady} from "./videoFunctions/videoStates.js";

const loadingSign = 'Loading...';

/**
 * Runs when the words area is clicked. Prints word definition and movese transcript if word clicked and toggles video.
 * 
 * @param {Event} event Space in the words area that was clicked.
*/
async function onWordClick(event) {

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        printDefinitions(window.getSelection().toString());
    }

    // If the user clicked a word
    if (event.target.hasAttribute('data-word')) {
        state.clickedWord = event.target.dataset.word;

        // Adjust video state if there is one
        if (state.transcriptShowing) {

            // Scroll to time in the video of the word
            state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
            
            // Toggle video if the user clicked on the same word twice, or pause video if user clicked a new word
            if (!(state.clickedWord == event.target.dataset.word) || state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                state.videoPlayer.pauseVideo();
                state.clickedWord = event.target.dataset.word;
            }
            else {
                state.videoPlayer.playVideo();
            }

            // Make sure correct transcript line is highlited
            for (const element of event.target.parentNode.parentNode.children) {
                element.classList.replace('current-time', 'normal');
            }
            event.target.parentNode.classList.replace('normal', 'current-time');
        }

        // Print word's definitions and update colors and HSK table
        printDefinitions(event.target.dataset.word);
        // showWordMenu(event.target);
        let currentIndex = parseInt(event.target.dataset.index, 10);
        const proficiencyLevels = await fetchUpdatedProficiencyLevels(state.lastIndex, currentIndex);
        updateWordColors(proficiencyLevels);
        updateHskLevels();
        
        if (state.lastIndex < currentIndex) {
            state.lastIndex = currentIndex;
        }
        if (state.transcriptShowing) {
            await setLastIndex(state.lastIndex);
            updateLocationMarker();
        }
    }

    // If the user clicked the "Done" button, update word colors, proficiency levels, and HSK levels
    else if (event.target.hasAttribute('data-action')) {
        if (event.target.dataset.action == 'final-word') {
            let currentIndex = parseInt(event.target.dataset.index, 10);
            const proficiencyLevels = await fetchUpdatedProficiencyLevels(state.lastIndex, currentIndex, true);
            updateWordColors(proficiencyLevels);
            updateHskLevels();

            state.lastIndex = currentIndex;
            if (state.transcriptShowing) {
                await setLastIndex(state.lastIndex);
                updateLocationMarker();
            }
        }
    }

    // If the user clicked a timestamp, move the video to that timestamp
    else if (event.target.classList.contains('timestamp')) {
        state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
    }

    // Toggle video if the user clicked in the transcript area but not on a word
    else {
        if (state.transcriptShowing) {
            if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING || window.getSelection().toString() != '') {
                state.videoPlayer.pauseVideo();
            }
            else {
                state.videoPlayer.playVideo();
            }
        }
    }
}

/**
 * Runs when a key is pressed
 * 
 * @param {Event} event Key that was pressed
 */
async function onKeyPressed(event) {

    // Make sure video is ready and transcript is showing
    if (videoReady() && state.transcriptShowing) {
        const currentTime = state.videoPlayer.getCurrentTime();
        const currentTimestamp = findTimestamp(currentTime);
        const indexOfCurrentTimestamp = state.timestampElements.indexOf(currentTimestamp);

        const timeChangeKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'l'];

        // Make sure key pressed is within one of the keys that should adjust the video
        if (timeChangeKeys.includes(event.key)) {
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

            state.videoPlayer.seekTo(newTime);
        }
    }

    // Toggle word save if user presses the letter s
    if (event.key === 's') {
        console.log(state.clickedWord);
        if (state.clickedWord == '') {
            return
        }
        await fetchToggleSavedWord(state.clickedWord);
        updateWordUnderlines(state.clickedWord);
    }
}

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words. Scrolls video to place user left off.
 */
async function loadVideoAndTranscript() {
    wordsArea.textContent = loadingSign;
    
    // Embed video
    const link = document.getElementById('link-entry').value;
    state.videoLink = link;
    embedVideo(link);

    const lastIndex = await fetchLastIndex(link);
    state.lastIndex = lastIndex;
    
    const transcript = await fetchVideoTranscript(link);
    printTranscript(transcript);
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    const text = document.getElementById('text-entry').value;

    printText(text);

    state.transcriptShowing = false;
}

/**
 * Prompts Google Gemini to generate a story in Mandarin.
 */
async function generateStory() {
    const wordList = await fetchRandomListWordsLearning(10);
    const prompt = `I'm trying to learn Mandarin, and I'm currently a beginner. Can you generate a short, beginner-friendly story in Mandarin for me? Here's a list of words I'm learning that I would like you to incorporate: ${wordList}`;
    const response = await fetchGeminiPrompt(prompt);

    printText(response);

    state.transcriptShowing = false;
}

/**
 * Runs when the Practice Words button is clicked
 */
async function practiceWords() {
    let wordList = await fetchRandomListWordsSaved(10);
    console.log(wordList);

    const sentenceList = await generatePracticeSentence(wordList);
}

// Show HSK levels as soon as page loads
updateHskLevels();

// Immediately create flashcards for later use
createCards();

// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

textButton.addEventListener('click', printUserText);
textEntry.addEventListener('keypress', event => event.key === 'Enter' && printUserText(event));

videoButton.addEventListener('click', loadVideoAndTranscript);
linkEntry.addEventListener('keypress', event => event.key === 'Enter' && loadVideoAndTranscript(event));

translateTranscriptButton.addEventListener('click', fetchTranscriptTranslation);
generateStoryButton.addEventListener('click', generateStory);

practiceWordsButton.addEventListener('click', practiceWords);

wordsArea.addEventListener('click', onWordClick);
window.addEventListener('keydown', onKeyPressed);