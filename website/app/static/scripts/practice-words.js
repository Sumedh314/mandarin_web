import { deleteSentence, getDueFlashcards, getNextDueFlashcard, getReviewIntervals, getSentence, reviewFlashcard, updateFlashcard } from "./api/routes.js";
import { numDueWordsCounter, ratingAgainTime, ratingEasyTime, ratingGoodTime, ratingHardTime, ratingSelectionArea, state, practiceAreaContainer } from "./document-areas.js";
import { clearPracticeAreaContainer, printText } from "./render-text/practice-area.js";
import { currentISOTime, formatSeconds } from "./utils.js";

/**
 * Allows user to review the next flashcard
 * 
 * @param {number} [wordIndex=0] Index of due words to be used
 */
export async function showNextCard() {
    practiceAreaContainer.style.textAlign = 'center';
    state.lastIndex = -1;

    const card = await getNextDueFlashcard(new Date().toISOString());
    
    if (card == 'None') {
        printText('No new flashcards', true);
        ratingSelectionArea.style.display = 'none';
        return;
    }

    ratingSelectionArea.style.display = 'flex';

    const word = card.word;
    state.flashcardWord = word;

    await printText('Generating sentence...');
    const sentence = await getSentence(word);
    await printText(sentence);
    state.flashcardSentence = sentence;
    
    const reviewTimes = await getReviewIntervals(word, currentISOTime());
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
    const reviewTime = currentISOTime();
    let newCard = null;
    switch (event.target.id) {
        case 'rating-again-button':
            newCard = await reviewFlashcard(state.flashcardWord, 1, reviewTime);
            break;
        case 'rating-hard-button':
            newCard = await reviewFlashcard(state.flashcardWord, 2, reviewTime);
            break;
        case 'rating-good-button':
            newCard = await reviewFlashcard(state.flashcardWord, 3, reviewTime);
            break;
        case 'rating-easy-button':
            newCard = await reviewFlashcard(state.flashcardWord, 4, reviewTime);
            break;
        case 'exit-review-button':
            ratingSelectionArea.style.display = 'none';
            clearPracticeAreaContainer();
            return;
        
        default:
            break;
    }
    console.log(newCard);
    

    await deleteSentence(state.flashcardSentence, state.flashcardWord);
    await updateFlashcard(state.flashcardWord, newCard);
    await showNumDueCards();
    showNextCard();
}

/**
 * Show the number of cards the user can practice that are due currently
 */
export async function showNumDueCards() {
    const currentTime = new Date().toISOString();
    const dueWords = await getDueFlashcards(currentTime);
    console.log(dueWords);
    const numDueCards = dueWords.length;

    numDueWordsCounter.textContent = numDueCards;
}