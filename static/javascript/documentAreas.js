export let state = {
    timestampElements: [],
    videoPlayer: null,
    confidenceClasses: {0: 'confidenceZero', 1: 'confidenceOne', 2: 'confidenceTwo', 3:'confidenceThree'},
    scrollToTimestamp: null,
    lastIndex: -1,
    clickedWord: ''
};

export const videoTitle = document.getElementById('videoTitle');
export const videoLocation = document.getElementById('videoLocation');
export const videoButton = document.getElementById('videoButton');
export const textButton = document.getElementById('textButton');
export const generateStoryButton = document.getElementById('generateStory');
export const translationArea = document.getElementById('translation');
export const translateTranscriptButton = document.getElementById('translateTranscriptButton');
export const wordsArea = document.getElementById('wordsArea');