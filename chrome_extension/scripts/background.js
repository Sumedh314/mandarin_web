async function saveWord(text) {
    const saveWordResponse = await fetch('http://localhost:5000/toggle_saved_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text
    });
    const saveWordResult = saveWordResponse.text();

    return saveWordResult;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('received');
    if (message.action === 'saveWord') {
        saveWord(message.word)
    }

    return true;
})