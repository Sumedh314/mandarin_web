export function showPracticeAndTranslationsArea() {
    practiceAreaContainer.style.display = 'block';
    translationAreaContainer.style.display = 'block';
}

export const state = {
    timestampElements: [],
    /** @type {YT.Player} */
    videoPlayer: null,
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: '',
    /** @type {HTMLElement} */
    clickedWordElement: null,
    transcriptShowing: false,
    videoId: '',
    flashcardWordId: '',
    flashcardSentence: ''
};

// USER AUTHENTICATION INFORMATION
export const loginForm = document.getElementById('login-form');
export const registrationForm = document.getElementById('registration-form');
export const checkPasswordsMatch = document.getElementById('check-passwords-match');
export const errorMessage = document.getElementById('error-message');

// UPPER ELEMENTS
export const textEntry = document.getElementById('text-entry');
export const textButton = document.getElementById('text-button');

export const linkEntry = document.getElementById('link-entry');
export const videoButton = document.getElementById('video-button');

export const generateStoryButton = document.getElementById('generate-story-button');
export const reviewWordsButton = document.getElementById('review-words-button');
export const translateTranscriptButton = document.getElementById('translate-transcript-button');

export const numDueWordsCounter = document.getElementById('num-due-cards');

// TRANSLATION INFORMAMTION (MIDDLE SECTION)
export const translationAreaContainer = document.getElementById('translation-area-container');
export const translationArea = document.getElementById('translation-area');
export const wordMenu = document.getElementById('word-menu');
export const tooltipTranslation = document.getElementById('word-tooltip-translation');

export const videoContainer = document.getElementById('video-container');
export const videoLocation = document.getElementById('video-location');

export const videoTitle = document.getElementById('video-title');
    
export const mainWordInfo = document.getElementById('main-word-info');
export const supplementalWordInfo = document.getElementById('supplemental-word-info');
export const saveWordButton = document.getElementById('save-word-button');

// PRACTICE AREA
export const practiceAreaContainer = document.getElementById('practice-area-container');
export const practiceArea = document.getElementById('practice-area');

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