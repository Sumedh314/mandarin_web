import { request } from "../client.js";

/**
 * Segments Mandarin text into individual words using Python
 * 
 * @param {string} text Text to segment into words
 */
export async function fetchWordSegments(text) {
    return await request('/segment_text', 'POST', text);
}

/**
 * Segments a transcript into words while preserving timestamps.
 * 
 * @param {Object} transcript Transcript to segment into words
 */
export async function fetchTranscriptWordSegments(transcript) {
    return await request('/segment_transcript', 'POST', transcript);
}