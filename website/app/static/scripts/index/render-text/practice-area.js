import { addWords, checkIfWordSaved, getSavedWords, getWordIds, getWordProficiencyLevels, segmentText } from "../../api/routes.js";
import { state, practiceArea, practiceAreaContainer } from "../../document-areas.js";
import { filterText, formatTimestamp } from "../../utils.js";

/**
 * Prints a transcript into the practice area with clickable words and timestamps
 * 
 * @param {object} transcript Transcript to print
 * @param {boolean} [newWords=false] Whether the transcript contains new words
 */
export async function printTranscript(transcript, newWords = false) {
    let wordIndex = -1;
    clearPracticeAreaContainer();

    for (const line of transcript) {
        const timestamp = line.start;

        const transcriptLineElement = document.createElement('span');
        transcriptLineElement.className = 'normal';
        transcriptLineElement.dataset.timestamp = timestamp;

        const timestampElement = document.createElement('span');
        timestampElement.className = 'timestamp';
        timestampElement.textContent = formatTimestamp(timestamp);

        const space = document.createElement('span');
        space.textContent = ' ';

        transcriptLineElement.appendChild(timestampElement);
        transcriptLineElement.appendChild(space);

        practiceArea.appendChild(transcriptLineElement);

        const text = line.text;
        wordIndex = await printText(text, false, wordIndex, newWords, transcriptLineElement);
        practiceArea.appendChild(document.createElement('br'));        
    }

    addDoneButton(wordIndex);
    
    // Push timestamps to timestampElements for other functions to use
    for (const timestamp of practiceArea.children) {
        if (timestamp.tagName == 'SPAN') {
            state.timestampElements.push(timestamp);
        }
    }

    // Automatically scroll to line in the transcript that the video is currently paying in
    practiceArea.scrollIntoView({
        behavior: 'smooth'
    });
}

/**
 * Prints text into the practice area with clickable words
 * 
 * @param {string} text Original text to be printed
 * @param {boolean} [clearArea=true] Whether or not to clear the practice area before printing text
 * @param {number} [wordIndex=0] The index to start labeling words at
 * @param {boolean} [addNewWords=true] Whether or not the text contains new words to add to the database
 * @param {HTMLElement} [parentElement=wordsArea] The element to print the text into
 * @returns {Promise<number>} The index of the last word printed
 */
export async function printText(text, clearArea = true, wordIndex = 0, addNewWords = true, parentElement = practiceArea) {
    if (clearArea) {
        parentElement.textContent = '';
    }

    const segmentedText = await segmentText(text);
    const filteredText = filterText(segmentedText);
    if (addNewWords) {
        await addWords(Array.from(new Set(filteredText)));
    }
    
    const wordIds = await getWordIds(filteredText);
    console.log(wordIds);
    
    const proficiencyLevels = await getWordProficiencyLevels(Object.values(wordIds));
    console.log(proficiencyLevels);
    
    const savedWords = await getSavedWords();
    
    for (const text of segmentedText) {
        let elementToAdd = null;

        if (filteredText.includes(text)) {
            wordIndex++;
            const wordId = wordIds[text];
            const wordElement = await createWordElement(text, wordId, wordIndex, proficiencyLevels[wordId], savedWords.includes(text));
            elementToAdd = wordElement;
        }
        else if (text == '\n') {
            elementToAdd = document.createElement('br');
        }
        else {
            let element = document.createElement('span');
            element.textContent = text;
            elementToAdd = element;
        }

        parentElement.appendChild(elementToAdd);
    }

    return wordIndex;
}

/**
 * Adds a "Done" button to the end of a transcript or text
 * 
 * @param {Number} wordIndex Index of the final word of the transcript or text
 */
export function addDoneButton(wordIndex) {
    const doneButton = document.createElement('span');
    doneButton.classList.add('word');
    doneButton.dataset.proficiency = 3;
    doneButton.dataset.action = 'final-word';
    doneButton.dataset.index = wordIndex + 1;
    doneButton.textContent = 'Done';

    practiceArea.appendChild(document.createElement('br'));
    practiceArea.appendChild(document.createElement('br'));
    practiceArea.appendChild(doneButton);
}

/**
 * Creates an HTML span element for the practice area whose text is the given word
 * 
 * @param {string} word Text of word
 * @param {number} wordId Id of word in database
 * @param {number} proficiency Proficiency level of word
 * @param {number} wordIndex Index of word
 * @param {boolean} wordIsSaved Whether or now the word is saved
 */
async function createWordElement(word, wordId, wordIndex, proficiency, wordIsSaved) {
    const wordElement = document.createElement('span');
    wordElement.classList.add('word');
    wordElement.dataset.id = wordId;
    wordElement.dataset.word = word;
    wordElement.dataset.index = wordIndex;
    wordElement.dataset.proficiency = proficiency;
    wordElement.textContent = word;
    
    if (wordIsSaved) {
        wordElement.classList.add('saved-word');
    }

    return wordElement;
}

/**
 * Clears the practice area.
 */
export function clearPracticeAreaContainer() {
    practiceArea.textContent = '';
}