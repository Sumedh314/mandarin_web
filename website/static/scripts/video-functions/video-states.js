let videoIsReady = false;
let iframeApiIsReady = false;

/**
 * Checks if video player is ready or not
 * 
 * @returns {boolean} If video is ready or not
 */
export function videoReady() {
    return videoIsReady;
}

/**
 * Checks if YouTube Iframe API is ready or not
 * 
 * @returns {boolean} If API ready or not
 */
export function iframeApiReady() {
    return iframeApiIsReady;
}

/**
 * Runs when the YouTube video player is ready
 */
export function onPlayerReady() {
    videoIsReady = true;
}

/**
 * Runs when the YouTube IFrame API is ready
 */
window.onYouTubeIframeAPIReady = function() {
    iframeApiIsReady = true;
}