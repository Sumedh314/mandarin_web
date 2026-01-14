const video = document.getElementById('video');
const videoButton = document.getElementById('videoButton');
const textButton = document.getElementById('textButton');

videoButton.addEventListener('click', loadVideo);
textButton.addEventListener('click', translate);

/**
 * Prints the English translation of a word into the dedicated translation area.
 */
async function translate() {

    // Phrase user entered
    let phrase = document.getElementById('text').value;

    // Get translation from Python
    const translationResponse = await fetch('/translate', {
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
        body: originalLink,
    });
    const transcript = await transcriptResponse.json();

    // Print transcript line by line and including the timestamp
    for (i = 0; i < Object.keys(transcript).length; i++) {
        let timestamp = result[i]['start'];
        let text = result[i]['text'];
        document.getElementById('wordsArea').innerHTML += `${timestamp}: ${text}<br>`;
    }
}