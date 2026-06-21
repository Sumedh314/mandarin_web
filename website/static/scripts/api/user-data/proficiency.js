import { request } from "./client";

export async function updateProficiencyLevels(wordsToUpdate) {
    return await request('/update_proficiency_levels', 'POST', wordsToUpdate);
}

/**
 * fetchs the proficiency levels of each word of the given text
 * 
 * @param {Array} segmentedText Text segmented into individual words
 */
export async function fetchProficiencyLevels(segmentedText) {
    return await request('fetch_proficiency_levels', 'GET', segmentedText);
}

/**
 * fetchs the proficiency levels of each word in a transcript.
 * 
 * @param {Object} segmentedTranscript Transcript segmented into individual words
 */
export async function fetchTranscriptProficiencyLevels(segmentedTranscript) {
    const transcriptWords = Object.values(segmentedTranscript).flat();
    return await fetchProficiencyLevels(transcriptWords);
}

/**
 * Fetches the percent of each HSK level the user knows to be displayed on the table.
 */
export async function fetchHskPercentages() {
    return await request('/fetch_hsk_percentages', 'GET');
}