import { request } from "../client";

/**
 * fetchs the transcript of the YouTube video with the given link.
 * 
 * @param {string} link Link of YouTube video
 */
export async function fetchVideoTranscript(link) {
    return await request('/generate_transcript', 'POST', link);
}

/**
 * Gets the location of the place the user left off of a transcript
 * 
 * @param {string} link the link of the YouTube video with the desired transcript
 */
export async function fetchTranscriptLastIndex(link) {
    const videoId = new URL(link).searchParams.get('v');
    return await request('/fetch_transcript_last_index', 'GET', videoId);
}

/**
 * Sets the location of the place the user left off of a transcript
 * 
 * @param {string} link Link of YouTube video
 * @param {number} index the index to set the last index to
 */
export async function updateTranscriptLastIndex(link, index) {
    const videoId = new URL(link).searchParams.get('v');
    const data = { videoId: videoId, index: index };
    return await request('/update_transcript_last_index', 'POST', data);
}