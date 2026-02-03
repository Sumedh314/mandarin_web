/**
 * Sends a prompt to Google Gemini
 * 
 * @param {string} prompt The prompt to send to gemini
 */
export async function fetchGeminiPrompt(prompt) {
    const geminiResponse = await fetch('/prompt_gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: prompt,
    });
    const message = await geminiResponse.text();

    return message;
}

/**
 * Gets the English translation of a word from Python.
 * 
 * @param {string} text text user wants to translate
 */
export async function fetchTranslation(text) {

    // Get translation from Python
    const translationResponse = await fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const translation = await translationResponse.text();

    return translation;
}

/**
 * Gets the pinyin representation of a word from Python.
 * 
 * @param {string} text text user wants to get pinyin of
 */
export async function fetchPinyin(text) {

    // Get translation from Python
    const translationResponse = await fetch('/get_pinyin', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const pinyin = await translationResponse.text();

    return pinyin;
}

/**
 * fetchs the transcript of the YouTube video with the given link.
 * 
 * @param {string} link Link of YouTube video
 */
export async function fetchVideoTranscript(link) {
    const transcriptResponse = await fetch('/generate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: link,
    });
    const transcript = await transcriptResponse.json();

    return transcript;
}

/**
 * Translates a transcript into Chinese if available
 */
export async function fetchTranscriptTranslation() {
    const transcriptResponse = await fetch('/translate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: videoId,
    });
    const transcript = await transcriptResponse.json();

    printTranscript(transcript);
}

/**
 * Segments Mandarin text into individual words using Python
 * 
 * @param {string} text Text to segment into words
 */
export async function fetchWordSegments(text) {

    // Get segmented text
    const segmentationResponse = await fetch('/segment_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text,
    });
    const segmentedText = await segmentationResponse.json();

    return segmentedText;
}

/**
 * Segments a transcript into words while preserving timestamps.
 * 
 * @param {Object} transcript Transcript to segment into words
 */
export async function fetchTranscriptWordSegments(transcript) {

    // Get segmented transcript
    const segmentationResponse = await fetch('/segment_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcript),
    });
    const segmentedTranscript = await segmentationResponse.json();

    return segmentedTranscript;
}

/**
 * fetchs the confidence levels of each word of the given text
 * 
 * @param {Array} segmentedText Text segmented into individual words
 */
export async function fetchConfidenceLevels(segmentedText) {

    // Get confidence levels
    const confidenceLevelsResponse = await fetch('/get_confidence_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(segmentedText),
    });
    const confidenceLevels = await confidenceLevelsResponse.json();

    return confidenceLevels;
}

/**
 * fetchs the confidence levels of each word in a transcript.
 * 
 * @param {Object} segmentedTranscript Transcript segmented into individual words
 */
export async function fetchTranscriptConfidenceLevels(segmentedTranscript) {
    
    // Push all words of transcript into transcriptWords without including timestamps.
    let transcriptWords = []
    for (const snippet of Object.keys(segmentedTranscript)) {
        for (const word of segmentedTranscript[snippet]) {
            transcriptWords.push(word)
        }
    }

    const transcriptConfidencesLevels = await fetchConfidenceLevels(transcriptWords);

    return transcriptConfidencesLevels;
}

/**
 * Updates the confidence levels of words based on the word the user clicked
 * 
 * @param {string} currentIndex Index of the word that the user clicked
 */
export async function fetchUpdatedConfidenceLevels(currentIndex) {
    currentIndex = parseInt(currentIndex, 10);
    if (currentIndex == lastIndex) {
        return {};
    }
    const segmentedWords = words.getElementsByTagName('span');

    // Put all words from lastIndex to currentIndex in 'previous', and put current word in 'current'
    let wordsToUpdate = {'previous': [], 'current': ''};
    for (const word of segmentedWords) {
        if (word.hasAttribute('data-index')){
            wordIndex = parseInt(word.dataset.index, 10);

            if (wordIndex < currentIndex) {
                if (wordIndex > lastIndex) {
                    wordsToUpdate['previous'].push(word.dataset.word);
                }
            }
            else if (wordIndex == currentIndex) {
                wordsToUpdate['current'] = word.dataset.word;
            }
            else {
                break;
            }
        }
        else {
            continue;
        }
    }

    if (lastIndex < currentIndex) {
        lastIndex = currentIndex;
    }

    // Get confidence levels from Python
    const updatedConfidenceLevelsResponse = await fetch('/update_confidence_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(wordsToUpdate),
    });
    const updatedConfidenceLevels = await updatedConfidenceLevelsResponse.json();

    return updatedConfidenceLevels;
}