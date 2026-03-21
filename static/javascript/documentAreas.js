export let state = {
    timestampElements: [],
    videoPlayer: null,
    proficiencyClasses: {0: 'proficiencyZero', 1: 'proficiencyOne', 2: 'proficiencyTwo', 3:'proficiencyThree'},
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: '',
    transcriptShowing: false,
    videoLink: ''
};

export const videoTitle = document.getElementById('videoTitle');
export const videoLocation = document.getElementById('videoLocation');
export const videoButton = document.getElementById('videoButton');
export const textButton = document.getElementById('textButton');
export const generateStoryButton = document.getElementById('generateStoryButton');
export const translationArea = document.getElementById('translation');
export const translateTranscriptButton = document.getElementById('translateTranscriptButton');
export const practiceWordsButton = document.getElementById('practiceWordsButton');
export const locationMarker = document.getElementById('locationMarker');
export const wordsArea = document.getElementById('wordsAreaDiv');