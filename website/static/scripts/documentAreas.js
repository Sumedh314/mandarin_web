export let state = {
    timestampElements: [],
    /** @type {YT.Player} */
    videoPlayer: null,
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: '',
    transcriptShowing: false,
    videoLink: '',
    flashcardWord: ''
};

// UPPER ELEMENTS
export const textEntry = document.getElementById('text-entry');
export const textButton = document.getElementById('text-button');

export const linkEntry = document.getElementById('link-entry');
export const videoButton = document.getElementById('video-button');

export const generateStoryButton = document.getElementById('generate-story-button');
export const practiceWordsButton = document.getElementById('practice-words-button');
export const translateTranscriptButton = document.getElementById('translate-transcript-button');

// TRANSLATION INFORMAMTION (MIDDLE SECTION)
export const translationArea = document.getElementById('translation-area');
export const wordMenu = document.getElementById('word-menu');
export const tooltipTranslation = document.getElementById('word-tooltip-translation');

export const videoTitle = document.getElementById('video-title');
export const videoLocation = document.getElementById('video-location');

// PRACTICE AREA
export const wordsAreaContainer = document.getElementById('words-area-container');
export const wordsArea = document.getElementById('words-area');

export const locationMarker = document.getElementById('location-marker');

// SPACED REPETITION SYSTEM AREA
export const ratingSelectionArea = document.getElementById('card-rating-selection');

export const ratingAgainButton = document.getElementById('rating-again-button');
export const ratingHardButton = document.getElementById('rating-hard-button');
export const ratingGoodButton = document.getElementById('rating-good-button');
export const ratingEasyButton = document.getElementById('rating-easy-button');

export const ratingAgainTime = document.getElementById('rating-again-time');
export const ratingHardTime = document.getElementById('rating-hard-time');
export const ratingGoodTime = document.getElementById('rating-good-time');
export const ratingEasyTime = document.getElementById('rating-easy-time');
