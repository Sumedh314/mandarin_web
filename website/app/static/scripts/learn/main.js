import { addFlashcard, addTranscript, addVideo, checkIfVideoExists, checkIfVideoExistsForUser, deleteFlashcard, getNewTranscript, getTranscript, getTranscriptFromDatabase, getVideoLastIndex, toggleWordSaved, updateVideoLastIndex, updateWordProficiencyLevels } from "../api/routes.js";
import { videoButton, linkEntry, state, practiceArea, textButton, textEntry, reviewWordsButton, ratingSelectionArea, practiceAreaContainer, videoLocation, showPracticeAndTranslationsArea, videoTitle } from "../document-areas.js";
import { checkIfWordSaved, selectRating, showNextCard, showNumDueCards } from "./practice-words.js";
import { addDoneButton, printText, printTranscript } from "./render-text/practice-area.js";
import { printTextDefinitions, printWordDefinitions } from "./render-text/translations.js";
import { updateLocationMarker, updateWordColors, updateWordUnderlines } from "./render-text/update-progress.js";
import { formatWordsToUpdate } from "../utils.js";
import { embedVideo, findTimestamp, pauseIfPlayOtherwise, removeVideo, showVideo, toggleVideo } from "./video/modifying-video.js";
import { videoReady } from "./video/video-states.js";

/**
 * Handles the click event on a word in the practice area.
 * 
 * @param {MouseEvent} event The place where the user clicked
 */
async function handleWordClick(event) {
    console.log('clicked');

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        console.log('highlighted');
        await printTextDefinitions(window.getSelection().toString());
    }

    // If the user clicked a word
    else if (event.target.hasAttribute('data-word')) {
        console.log('clicked word');
        let currentIndex = parseInt(event.target.dataset.index, 10);
        // updateHskLevels();
        
        if (state.transcriptShowing) {
            state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
            pauseIfPlayOtherwise(state.clickedWord != event.target.dataset.word || state.clickedWord == event.target.dataset.word && state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING);
        }
        
        if (state.lastIndex != currentIndex && state.clickedWord != event.target.dataset.word) {
            const wordElements = practiceArea.getElementsByTagName('span');
            const wordsToUpdate = formatWordsToUpdate(wordElements, state.lastIndex, currentIndex);
            const proficiencyLevels = await updateWordProficiencyLevels(wordsToUpdate.previousWords, wordsToUpdate.currentWord);
            updateWordColors(proficiencyLevels);
        }
        
        if (state.lastIndex < currentIndex) {
            state.lastIndex = currentIndex;
        }
        
        if (state.transcriptShowing) {
            await updateVideoLastIndex(state.videoId, state.lastIndex);
            updateLocationMarker();
        }

        state.clickedWord = event.target.dataset.word;
        state.clickedWordElement = event.target;
        
        console.log('printing definitions', event.target.dataset.id, event.target.dataset.word);
        await printWordDefinitions(event.target.dataset.id, event.target.dataset.word);
        console.log('done printing');
    }

    // If the user clicked a timestamp, move the video to that timestamp
    else if (event.target.classList.contains('timestamp')) {
        state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
    }

    // Toggle video if the user clicked in the transcript area but not on a word
    else if (state.transcriptShowing) {
        pauseIfPlayOtherwise(state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING || window.getSelection().toString() != '');
    }
}

/**
 * Runs when a key is pressed
 * 
 * @param {Event} event Key that was pressed
 */
async function handleKeyPress(event) {

    // Make sure user isn't trying to type somewhere
    if (document.activeElement.tagName == 'input') {
        return;
    }

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

                // Toggle video if spacebar is pressed
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

        const wordId = state.clickedWordElement.dataset.id;
        
        await toggleWordSaved(wordId);
        updateWordUnderlines(state.clickedWord);

        if (await checkIfWordSaved(wordId)) {
            await addFlashcard(wordId);
        }
        else {
            await deleteFlashcard(wordId);
        }
        await showNumDueCards();
    }
}

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words. Scrolls video to place user left off.
 */
export async function loadVideoAndTranscript() {
    practiceAreaContainer.style.textAlign = 'left';
    videoTitle.textContent = '';
    practiceArea.textContent = '';
    showVideo();
    showPracticeAndTranslationsArea();
    
    // Embed video
    const link = document.getElementById('link-entry').value;
    const originalLink = new URL(link);
    const videoId = originalLink.searchParams.get('v');
    embedVideo(videoId);
    state.videoId = videoId;
    
    const transcript = await getTranscript(videoId);;
    state.lastIndex = await getVideoLastIndex(videoId);
    if (transcript.length != 0) {
        await printTranscript(transcript);
        updateLocationMarker();
        state.transcriptShowing = true;
    }
    else {
        await printText('No transcript found');
    }
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    practiceAreaContainer.style.textAlign = 'left';
    console.log('askdfjls');
    
    removeVideo();
    showPracticeAndTranslationsArea();
    
    const text = document.getElementById('text-entry').value;

    const wordIndex = await printText(text, true, true);
    addDoneButton(wordIndex);

    state.transcriptShowing = false;
    state.lastIndex = -1;
}

document.getElementById('username').textContent = localStorage.getItem('username');
showNumDueCards();

// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

textButton.addEventListener('click', printUserText);
textEntry.addEventListener('keypress', event => event.key === 'Enter' && printUserText(event));

videoButton.addEventListener('click', loadVideoAndTranscript);
linkEntry.addEventListener('keypress', event => event.key === 'Enter' && loadVideoAndTranscript(event));

reviewWordsButton.addEventListener('click', showNextCard);

practiceArea.addEventListener('click', handleWordClick);

ratingSelectionArea.addEventListener('click', selectRating);

window.addEventListener('keydown', handleKeyPress);