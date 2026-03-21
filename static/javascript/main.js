import {
    videoButton,
    textButton,
    translateTranscriptButton,
    generateStoryButton,
    wordsArea,
    state,
    locationMarker,
    practiceWordsButton
} from "./documentAreas.js";

import {
    fetchGeminiPrompt,
    fetchVideoTranscript,
    fetchTranscriptTranslation,
    fetchUpdatedProficiencyLevels,
    fetchRandomListWordsLearning,
    fetchLastIndex,
    updatePracticeSentences,
    toggleSavedWord,
} from './fetchData.js';
import { generatePracticeSentence } from "./practiceWords.js";

import {
    printText,
    printTranscript,
    printDefinitions,
    updateWordColors,
    updateHskLevels,
    updateLocationMarker,
    setLastIndex,
    updateWordUnderlines
} from "./renderText.js";

import {
    embedVideo,
    findTimestamp,
    toggleVideo,
} from "./videoFunctions/modifyingVideo.js";

import {videoReady} from "./videoFunctions/videoStates.js";

const loadingSign = 'Loading...';

/**
 * Runs when the words area is clicked. Prints word definition and movese transcript if word clicked and toggles video.
 * 
 * @param {object} event Space in the words area that was clicked.
*/
async function onWordClick(event) {

    // If the user highlighted something, print its translation and pinyin
    if (window.getSelection().toString() != '') {
        printDefinitions(window.getSelection().toString());
    }
    
    // If the user clicked a word
    if (event.target.hasAttribute('data-word')) {
        state.clickedWord = event.target.dataset.word;

        // Adjust video state if there is one
        if (state.transcriptShowing) {

            // Scroll to time in the video of the word if a transcript is currently showing
            if (!event.target.parentNode.classList.contains('words')) {
                for (const element of state.timestampElements) {
                    if (element.classList.contains('currentTime')) {
                        element.classList.replace('currentTime', 'normal');
                    }
                }
                event.target.parentNode.classList.replace('normal', 'currentTime');
                state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
            }
            
            // Toggle video if the user clicked on the same word twice, or pause video if user clicked a new word
            if (!(state.clickedWord == event.target.dataset.word) || state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
                state.videoPlayer.pauseVideo();
                state.clickedWord = event.target.dataset.word;
            }
            else {
                state.videoPlayer.playVideo();
            }
        }

        // Print word's definitions and update colors and HSK table
        printDefinitions(event.target.dataset.word);
        let currentIndex = parseInt(event.target.dataset.index, 10);
        const proficiencyLevels = await fetchUpdatedProficiencyLevels(state.lastIndex, currentIndex);
        updateWordColors(proficiencyLevels);
        updateHskLevels();
        
        if (state.lastIndex < currentIndex) {
            state.lastIndex = currentIndex;
        }
        if (state.transcriptShowing) {
            await setLastIndex(state.lastIndex);
            updateLocationMarker();
        }
    }

    // If the user clicked the "Done" button, update word colors, proficiency levels, and HSK levels
    else if (event.target.hasAttribute('data-action')) {
        if (event.target.dataset.action == 'finalWord') {
            let currentIndex = parseInt(event.target.dataset.index, 10);
            const proficiencyLevels = await fetchUpdatedProficiencyLevels(state.lastIndex, currentIndex, true);
            updateWordColors(proficiencyLevels);
            updateHskLevels();

            state.lastIndex = currentIndex;
            if (state.transcriptShowing) {
                await setLastIndex(state.lastIndex);
                updateLocationMarker();
            }
        }
    }

    // If the user clicked a timestamp, move the video to that timestamp
    else if (event.target.classList.contains('timestamp')) {
        state.videoPlayer.seekTo(Number(event.target.parentNode.dataset.timestamp), true);
    }

    // Toggle video if the user clicked in the transcript area but not on a word
    else {
        if (state.transcriptShowing) {
            if (state.videoPlayer.getPlayerState() === YT.PlayerState.PLAYING || window.getSelection().toString() != '') {
                state.videoPlayer.pauseVideo();
            }
            else {
                state.videoPlayer.playVideo();
            }
        }
    }
}

/**
 * Runs when a key is pressed
 * 
 * @param {object} event Key that was pressed
 */
async function onKeyPressed(event) {

    // Make sure video is ready and transcript is showing
    if (videoReady() && state.transcriptShowing) {
        const currentTime = state.videoPlayer.getCurrentTime();
        const currentTimestamp = findTimestamp(currentTime);
        const indexOfCurrentTimestamp = state.timestampElements.indexOf(currentTimestamp);

        const timeChangeKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'j', 'l'];

        // Make sure key pressed is within one of the keys that should adjust the video
        if (timeChangeKeys.includes(event.key)) {
            event.preventDefault();

            let newTime = 0;
            switch (event.key) {

                // Toggle video is spacebar is pressed
                case ' ':
                    toggleVideo();
                    break;

                // Move video back and forth 5 seconds if left or right arrow keys are pressed
                case 'ArrowLeft':
                    newTime = currentTime - 5;
                    break;
                case 'ArrowRight':
                    newTime = currentTime + 5;
                    break;

                // Move video back and forth 10 seconds if j or l are pressed
                case 'j':
                    newTime = currentTime - 10;
                    break;
                case 'l':
                    newTime = currentTime + 10;
                    break;

                // Move to previous or next timestamp if user clicked up or down arrow
                case 'ArrowUp':
                    newTime = Number(state.timestampElements[indexOfCurrentTimestamp - 1].dataset.timestamp);
                    break;
                case 'ArrowDown':
                    newTime = Number(state.timestampElements[indexOfCurrentTimestamp + 1].dataset.timestamp);
                    break;
                
                default:
                    break;
            }

            state.videoPlayer.seekTo(newTime);
        }
    }

    console.log(';asldkfjas');
    // Toggle word save if user presses the letter s
    if (event.key === 's') {
        console.log(state.clickedWord);
        await toggleSavedWord(state.clickedWord);
        updateWordUnderlines(state.clickedWord);
    }
}

/**
 * Embeds video, loads transcript, and prints the transcript with clickable words. Scrolls video to place user left off.
 */
async function loadVideoAndTranscript() {
    wordsArea.textContent = loadingSign;
    
    // Embed video
    const link = document.getElementById('link').value;
    state.videoLink = link;
    embedVideo(link);

    const lastIndex = await fetchLastIndex(link);
    state.lastIndex = lastIndex;
    
    const transcript = await fetchVideoTranscript(link);
    printTranscript(transcript);
}

/**
 * Segments and prints text pasted in by the user
 */
async function printUserText() {
    const text = document.getElementById('text').value;

    printText(text);

    state.transcriptShowing = false;
}

/**
 * Prompts Google Gemini to generate a story in Mandarin.
 */
async function generateStory() {
    const wordList = await fetchRandomListWordsLearning(10);
    const prompt = `I'm trying to learn Mandarin, and I'm currently a beginner. Can you generate a short, beginner-friendly story in Mandarin for me? Here's a list of words I'm learning that I would like you to incorporate: ${wordList}`;
    const response = await fetchGeminiPrompt(prompt);

    printText(response);

    state.transcriptShowing = false;
}

/**
 * Runs when the Practice Words button is clicked
 */
async function practiceWords() {
    let wordList = await fetchRandomListWordsLearning(25);
    // word = word[0];
    console.log(wordList);

    const sentenceList = await generatePracticeSentence(wordList);

    let allSentences = '';
    for (const sentence of sentenceList) {
        allSentences += sentence + '\n';
    }
    printText(allSentences);
    // updatePracticeSentences(['他把地图卷了起来。', '战争会毁灭家园。', '请你尽量早点来。', '我误以为他生病了。', '吃完饭后，她收拾了桌子。', '这是一种新型手机。', '这个问题关乎每个人的利益。', '孩子喜欢玩飞机模型。', '他负责管理这个项目。', '我今天精力充沛。', '安琪是我的好朋友。', '隔壁的邻居很友好。', '学习可以增长知识。', '他正在攻读博士学位。', '她在大学学习临床医学。', '他正在学习土耳其语。', '这座房子值几百万。', '我喜欢吃杏仁。', '他对自己的考试成绩很满意。', '我家有一只可爱的猫咪。', '科学家正在做实验。', '那个声音吓了我一跳。', '这本书分为三个部分。', '这代人面临很多挑战。', '他今天出了门。', '学校里有小卖部。', '不要把这当成儿戏。', '很高兴能来到这里，我感到非常荣幸。', '请保持联系。', '我喜欢在网上浏览新闻。', '我们可以再举一个例子。', '这个网站有很多有用的信息。', '他下定决心要学好中文。', '他是一个成功的商人。', '这代人对环保很重视。', '她很快适应了新环境。', '这是一个特殊的历史时期。', '他心灵受到了很大的创伤。', '他的话给了我很大的启发。', '她在大学辅修希腊语。', '比赛因雨暂停了。', '这位商人很懂得市场。', '他的头发已经全白了。', '成功取决于你的努力。', '这代人更有创新精神。', '服务员，我们要点餐。', '人类不是地球的唯一主宰者。', '这种情况以前也发生过类似的。', '他的办公室正对着公园。', '他的坏习惯很难改。', '她能说流利的波兰语。'])
}

// Show HSK levels as soon as page loads
updateHskLevels();

// YouTube Iframe stuff
var tag = document.createElement('script');
tag.src = 'https://youtube.com/iframe_api';
var firstTagScript = document.getElementsByTagName('script')[0]
firstTagScript.parentNode.insertBefore(tag, firstTagScript);

videoButton.addEventListener('click', loadVideoAndTranscript);
textButton.addEventListener('click', printUserText);
translateTranscriptButton.addEventListener('click', fetchTranscriptTranslation);
generateStoryButton.addEventListener('click', generateStory);
practiceWordsButton.addEventListener('click', practiceWords);
wordsArea.addEventListener('click', (event) => onWordClick(event));
window.addEventListener('keydown', (event) => onKeyPressed(event));