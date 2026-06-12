export let state = {
    timestampElements: [],
    /** @type {YT.Player} */ videoPlayer: null,
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: '',
    transcriptShowing: false,
    videoLink: ''
};

export const videoTitle = document.querySelector('#video-title');
export const videoLocation = document.querySelector('#video-location');
export const textEntry = document.querySelector('#text-entry');
export const textButton = document.querySelector('#text-button');
export const linkEntry = document.querySelector('#link-entry');
export const videoButton = document.querySelector('#video-button');
export const generateStoryButton = document.querySelector('#generate-story-button');
export const translationArea = document.querySelector('#translation');
export const translateTranscriptButton = document.querySelector('#translate-transcript-button');
export const practiceWordsButton = document.querySelector('#practice-words-button');
export const locationMarker = document.querySelector('#location-marker');
export const wordsAreaContainer = document.querySelector('#words-area-container');
export const wordsArea = document.querySelector('#words-area');
export const wordMenu = document.querySelector('#word-menu');
export const tooltipTranslation = document.querySelector('#word-tooltip-translation');
export const ratingAgainTime = document.querySelector('#rating-again-time');
export const ratingHardTime = document.querySelector('#rating-hard-time');
export const ratingGoodTime = document.querySelector('#rating-good-time');
export const ratingEasyTime = document.querySelector('#rating-easy-time');