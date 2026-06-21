import { request } from "../client.js";

/**
 * fetchs the transcript of the YouTube video with the given link.
 * 
 * @param {string} link Link of YouTube video
 */
export async function fetchVideoTranscript(link) {
    return await request('/fetch_transcript', 'POST', link);
}

/**
 * Gets the location of the place the user left off of a transcript
 * 
 * @param {string} link the link of the YouTube video with the desired transcript
 */
export async function fetchTranscriptLastIndex(link) {
    const videoId = new URL(link).searchParams.get('v');
    return await request('/fetch_last_index', 'POST', videoId);
}

/**
 * Sets the location of the place the user left off of a transcript
 * 
 * @param {string} link Link of YouTube video
 * @param {number} lastIndex the index to set the last index to
 */
export async function updateTranscriptLastIndex(link, lastIndex) {
    const videoId = new URL(link).searchParams.get('v');
    const data = { videoId: videoId, lastIndex: lastIndex };
    return await request('/update_transcript_last_index', 'POST', data);
}