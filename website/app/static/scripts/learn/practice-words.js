import { deleteSentence, getDueFlashcards, getNextDueFlashcard, getReviewIntervals, getSentence, getWordData, reviewFlashcard, updateFlashcard } from "../api/routes.js";
import { numDueWordsCounter, ratingAgainTime, ratingEasyTime, ratingGoodTime, ratingHardTime, ratingSelectionArea, state, practiceAreaContainer, showPracticeAndTranslationsArea } from "../document-areas.js";
import { clearPracticeAreaContainer, printText } from "./render-text/practice-area.js";
import { formatSeconds } from "../utils.js";

/**
 * Allows user to review the next flashcard
 */
export async function showNextCard() {
    showPracticeAndTranslationsArea();
    practiceAreaContainer.style.textAlign = 'center';
    state.lastIndex = -1;

    console.log('asdfj;asldkfjas;ldkfjas;ldkfjads;lkfjasd;lfk')
    const card = await getNextDueFlashcard();
    console.log(card);
    
    if (card == 'None') {
        printText('No new flashcards', true);
        ratingSelectionArea.style.display = 'none';
        return;
    }

    ratingSelectionArea.style.display = 'flex';

    state.flashcardWordId = card.learning_word_id;
    console.log(card);

    await printText('Generating sentence...');
    const sentence = await getSentence(state.flashcardWordId);

    await printText(sentence);
    state.flashcardSentence = sentence;
    
    const reviewTimes = await getReviewIntervals(state.flashcardWordId);
    const ratingTimeAreas = [ratingAgainTime, ratingHardTime, ratingGoodTime, ratingEasyTime];

    for (let index = 0; index < ratingTimeAreas.length; index++) {
        ratingTimeAreas[index].textContent = formatSeconds(reviewTimes[index]);
    }
}

/**
 * Updates a card after user chooses rating
 * 
 * @param {MouseEvent} event One of four buttons user clicked to give flashcard rating
 */
export async function selectRating(event) {
    console.log('as;ldkfjas;l');
    let newCard = null;
    switch (event.target.id) {
        case 'rating-again-button':
            newCard = await reviewFlashcard(state.flashcardWordId, 1);
            break;
        case 'rating-hard-button':
            newCard = await reviewFlashcard(state.flashcardWordId, 2);
            break;
        case 'rating-good-button':
            newCard = await reviewFlashcard(state.flashcardWordId, 3);
            break;
        case 'rating-easy-button':
            newCard = await reviewFlashcard(state.flashcardWordId, 4);
            break;
        case 'exit-review-button':
            ratingSelectionArea.style.display = 'none';
            clearPracticeAreaContainer();
            return;
        
        default:
            break;
    }

    await deleteSentence(state.flashcardSentence, state.flashcardWordId);
    await showNumDueCards();
    showNextCard();
}

/**
 * Show the number of cards the user can practice that are due currently
 */
export async function showNumDueCards() {
    const dueWords = await getDueFlashcards();
    console.log(dueWords);
    const numDueCards = dueWords.length;

    numDueWordsCounter.textContent = numDueCards;
}

/**
 * Check if the user has saved a word or not.
 * 
 * @param {number} wordId The ID of the word
 * @returns {boolean} Whether or not the word is saved.
 */
export async function checkIfWordSaved(wordId) {
    const data = await getWordData(wordId);
    console.log(data);
    return data.saved;
}