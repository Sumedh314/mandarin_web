export let state = {
    timestampElements: [],
    videoPlayer: null,
    proficiencyClasses: {0: 'proficiency-zero', 1: 'proficiency-one', 2: 'proficiency-two', 3:'proficiency-three'},
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: '',
    transcriptShowing: false,
    videoLink: ''
};

export const videoTitle = document.getElementById('video-title');
export const videoLocation = document.getElementById('video-location');
export const textEntry = document.getElementById('text-entry');
export const textButton = document.getElementById('text-button');
export const linkEntry = document.getElementById('link-entry');
export const videoButton = document.getElementById('video-button');
export const generateStoryButton = document.getElementById('generate-story-button');
export const translationArea = document.getElementById('translation');
export const translateTranscriptButton = document.getElementById('translate-transcript-button');
export const practiceWordsButton = document.getElementById('practice-words-button');
export const locationMarker = document.getElementById('location-marker');
export const wordsArea = document.getElementById('words-area-container');
export const wordMenu = document.getElementById('word-menu');
export const tooltipTranslation = document.getElementById('word-tooltip-translation');