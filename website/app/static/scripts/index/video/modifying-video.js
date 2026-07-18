import { updateVideoTitle } from "../../api/routes.js";
import { state, videoTitle, practiceAreaContainer, videoLocation, videoContainer } from "../../document-areas.js";
import { iframeApiReady, onPlayerReady, videoReady } from "./video-states.js";

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 * 
 * @param {string} videoId ID of YouTube video
 */
export async function embedVideo(videoId) {

    // Stop if Iframe API is not ready
    if (!iframeApiReady()) {
        return alert('Iframe API not ready');
    }

    // Embed video
    if (!videoReady()) {
        state.videoPlayer = new YT.Player('video-location', {
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
        state.videoPlayer.loadVideoById(videoId);
    }
}

/**
 * Automatically scrolls the transcript to the location of the video
 */
export function scrollTranscript() {
    const wordsAreaTop = practiceAreaContainer.getBoundingClientRect()['top'];
    const wordsAreaBottom = practiceAreaContainer.getBoundingClientRect()['bottom'];

    const currentTime = state.videoPlayer.getCurrentTime();
    const currentTimestamp = findTimestamp(currentTime);
    
    if (!currentTimestamp) {
        state.scrollToTimestamp = requestAnimationFrame(scrollTranscript);
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
    for (const item of state.timestampElements) {
        item.setAttribute('class', 'normal');
    }
    currentTimestamp.setAttribute('class', 'current-time')

    if (state.videoPlayer.getPlayerState() === YT.PlayerState.PAUSED) {
        cancelAnimationFrame(state.scrollToTimestamp);
    }

    state.scrollToTimestamp = requestAnimationFrame(scrollTranscript);
}

/**
 * Scrolls the video to the location that the user last left off
 */
export function scrollToLocationMarker() {
    const timestamp = Number(locationMarker.parentNode.dataset.timestamp);

    state.videoPlayer.seekTo(timestamp, true);
}

/**
 * Finds the timestamp of the current portion of the transcript the video is playing.
 * 
 * @param {Number} currentTime The current time of the video
*/
export function findTimestamp(currentTime) {
    const candidates = [];
    
    // Push all timestamps before the current video location into candidates
    for (const timestamp of state.timestampElements) {
        if (currentTime > Number(timestamp.dataset.timestamp)) {
            candidates.push(timestamp);
        }
    }
    
    // Final candidate is the last element in candidates
    return candidates[candidates.length - 1];
}

/**
 * Runs when the 
 *  video player changes state
 */
export async function onPlayerStateChange() {

    // Run function to automatically scroll transcript if video is playing, otherwise don't scroll transcript
    if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        if (state.scrollToTimestamp === null) {
            state.scrollToTimestamp = requestAnimationFrame(scrollTranscript);
        }
        if (videoTitle.textContent == '') {
            videoTitle.textContent = state.videoPlayer.videoTitle;
            videoTitle.hidden = false;
            console.log('a;sldfkjas;dlfkjas;ldfkjas;ldfkjas;ldkfjas;ldfkjas;ldfkjas;lfkjsa;ldfkj');
            updateVideoTitle(state.videoId, state.videoPlayer.videoTitle);
        }
    }
    else {
        cancelAnimationFrame(state.scrollToTimestamp);
        state.scrollToTimestamp = null;
    }
}

/**
 * Pausese the video if the given condition is true, and plays the video if the condition is false
 * 
 * @param {boolean} condition Condition to pase pausing or playing video off of
 */
export function pauseIfPlayOtherwise(condition) {
    if (condition) {
        state.videoPlayer.pauseVideo();
    }
    else {
        state.videoPlayer.playVideo();
    }
}

/**
 * If the video is playing, the video pauses. If the video is paused, the video starts playing.
 */
export function toggleVideo() {
    if (videoReady()) {
        pauseIfPlayOtherwise(state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING);
    }
}

/**
 * Shows the current video on the page.
 */
export function showVideo() {
    videoContainer.style.display = 'inline';
}

/**
 * Hides the current video from the page.
 */
export function removeVideo() {
    videoContainer.style.display = 'none';
    videoTitle.textContent = '';
}