import {
    videoReady,
    iframeApiReady,
    onPlayerReady
} from "./videoStates.js";

import {
    wordsArea,
    state,
    locationMarker,
    videoTitle
} from "../documentAreas.js";

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 * 
 * @param {string} link Link to YouTube video
 */
export async function embedVideo(link) {

    // Extract the video ID from the link the user gave
    const originalLink = new URL(link);
    const videoId = originalLink.searchParams.get('v');

    // Stop if Iframe API is not ready
    if (!iframeApiReady()) {
        return alert('Iframe API not ready');
    }

    // Embed video
    if (!videoReady()) {
        state.videoPlayer = new YT.Player('video-location', {
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
        state.videoPlayer.loadVideoById(videoId);
    }
}

/**
 * Automatically scrolls the transcript to the location of the video
 */
export function scrollTranscript() {
    const wordsAreaTop = wordsArea.getBoundingClientRect()['top'];
    const wordsAreaBottom = wordsArea.getBoundingClientRect()['bottom'];

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

    videoPlayer.seekTo(timestamp, true);
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
 * Runs when the YouTube video player changes state
 */
export async function onPlayerStateChange() {

    // Run function to automatically scroll transcript if video is playing, otherwise don't scroll transcript
    if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        if (state.scrollToTimestamp === null) {
            state.scrollToTimestamp = requestAnimationFrame(scrollTranscript);
        }
        if (videoTitle.textContent == '') {
            videoTitle.textContent = state.videoPlayer.videoTitle;
        }
    }
    else {
        cancelAnimationFrame(state.scrollToTimestamp);
        state.scrollToTimestamp = null;
    }
}

/**
 * If the video is playing, the video pauses. If the video is paused, the video starts playing.
 */
export function toggleVideo() {
    if (videoReady()) {
        if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
            state.videoPlayer.pauseVideo();
        }
        else {
            state.videoPlayer.playVideo()
        }
    }
}