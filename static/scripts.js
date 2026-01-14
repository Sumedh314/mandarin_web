/**
 * Converts a YouTube transcript timestamp from seconds to hh:mm:ss
 * 
 * @param {string|number} timestamp time of video in seconds
 * @returns {string} mm:ss or hh:mm:ss
 */
function formatTimestamp(timestamp) {
    const totalSeconds = (Math.floor(Number(timestamp)));

    // Get hours, minutes, and seconds from total seconds
    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalSeconds / 3600);
    const seconds = totalSeconds % 60;

    // Array with parts for final timestamp
    const parts = [];
    
    // Add values to final timestamp
    if (hours > 0) {
        parts.push(String(hours).padStart(2, '0'));
    }
    parts.push(String(minutes).padStart(2, '0'));
    parts.push(String(seconds).padStart(2, '0'));

    return parts.join(':')
}

/**
 * Prints the English translation of a word into the dedicated translation area.
 */
async function requestTranslation() {

    // Phrase user entered
    let phrase = document.getElementById('text').value;

    // Get translation from Python
    const translationResponse = await fetch('/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: phrase,
    });
    const translation = await translationResponse.text();

    // Print translation
    document.getElementById('translation').innerHTML = translation;
}

/**
 * Loads a YouTube video based on the link pasted by the user, as well as its transcript.
 */
async function loadVideo() {

    // Convert user link to a link that can be embedded
    let originalLink = new URL(document.getElementById('link').value);
    let embedLink = `https://www.youtube.com/embed/${originalLink.searchParams.get('v')}`;
    
    // Embed video
    video.innerHTML = `<iframe width="560" height="315" src=${embedLink} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

    // Generate transcript
    const transcriptResponse = await fetch('/generate_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: originalLink.href,
    });
    const transcript = await transcriptResponse.json();

    // Print transcript line by line and including the timestamp
    let wordsAreaText = '';
    for (let i = 0; i < transcript.length; i++) {
        let timestamp = transcript[i]['start'];
        let text = transcript[i]['text'];
        wordsAreaText += `${formatTimestamp(timestamp)}: ${text}<br>`;
    }
    document.getElementById('wordsArea').innerHTML = wordsAreaText;
}

// Event listeners
const video = document.getElementById('video');
const videoButton = document.getElementById('videoButton');
const textButton = document.getElementById('textButton');

videoButton.addEventListener('click', loadVideo);
textButton.addEventListener('click', requestTranslation);