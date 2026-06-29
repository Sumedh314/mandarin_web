import { addTranscript, addVideo, calculateNewProficiencyLevels, checkIfVideoExists, getNewTranscript, getTranscriptFromDatabase, getVideoLastIndex, updateVideoLastIndex, updateWordProficiencyLevels } from "./api/routes.js";
import { videoButton, linkEntry, state, wordsArea, textButton, textEntry } from "./document-areas.js";
import { addDoneButton, printText, printTranscript } from "./render-text/new_practice_area.js";
import { printDefinitions } from "./render-text/translations.js";
import { setLastIndex, updateLocationMarker, updateWordColors } from "./render-text/update-progress.js";
import { formatWordsToUpdate } from "./utils.js";
import { embedVideo, pauseIfPlayOtherwise } from "./video/modifying-video.js";

/**
 * Handles the click event on a word in the practice area.
 * 
 * @param {MouseEvent} event The place where the user clicked
 */
async function handleWordClick(event) {

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        await printDefinitions(window.getSelection().toString());
    }

    // If the user clicked a word
    else if (event.target.hasAttribute('data-word')) {
        printDefinitions(event.target.dataset.word);
        let currentIndex = parseInt(event.target.dataset.index, 10);
        // updateHskLevels();
        
        if (state.transcriptShowing) {
            state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
            pauseIfPlayOtherwise(state.clickedWord != event.target.dataset.word || state.clickedWord == event.target.dataset.word && state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING);
            // updateLocationMarker();
        }
        
        if (state.lastIndex != currentIndex && state.clickedWord != event.target.dataset.word) {
            const wordElements = wordsArea.getElementsByTagName('span');
            const wordsToUpdate = formatWordsToUpdate(wordElements, state.lastIndex, currentIndex);
            const proficiencyLevels = await calculateNewProficiencyLevels(wordsToUpdate.previousWords, wordsToUpdate.currentWord);
            updateWordProficiencyLevels(proficiencyLevels);
            updateWordColors(proficiencyLevels);
        }
        
        if (state.lastIndex < currentIndex) {
            state.lastIndex = currentIndex;
        }
        
        if (state.transcriptShowing) {
            updateVideoLastIndex(state.videoId, state.lastIndex);
        }

        state.clickedWord = event.target.dataset.word;
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
 * Embeds video, loads transcript, and prints the transcript with clickable words. Scrolls video to place user left off.
 */
export async function loadVideoAndTranscript() {
    
    // Embed video
    const link = document.getElementById('link-entry').value;
    const originalLink = new URL(link);
    const videoId = originalLink.searchParams.get('v');
    embedVideo(videoId);
    state.videoId = videoId;
    
    if (await checkIfVideoExists(videoId)) {
        const transcript = await getTranscriptFromDatabase(videoId);
        printTranscript(transcript, false);
        state.lastIndex = await getVideoLastIndex(videoId);
    }
    else {
        addVideo(videoId);
        const transcript = await getNewTranscript(videoId);
        addTranscript(videoId, transcript);
        printTranscript(transcript, true);
        state.lastIndex = -1;
    }

    state.transcriptShowing = true;
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    const text = document.getElementById('text-entry').value;

    const wordIndex = await printText(text);
    addDoneButton(wordIndex);

    state.transcriptShowing = false;
}


// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

textButton.addEventListener('click', printUserText);
textEntry.addEventListener('keypress', event => event.key === 'Enter' && printUserText(event));

videoButton.addEventListener('click', loadVideoAndTranscript);
linkEntry.addEventListener('keypress', event => event.key === 'Enter' && loadVideoAndTranscript(event));

wordsArea.addEventListener('click', handleWordClick);