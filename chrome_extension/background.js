async function translateText(text) {
    const translateTextResponse = await fetch('http://localhost:5000/translate_text', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text
    });
    const translateTextResult = await translateTextResponse.text();

    return translateTextResult;
}

async function saveWord(text) {
    const saveWordResponse = await fetch('http://localhost:5000/toggle_saved_word', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: text
    });
    const saveWordResult = await saveWordResponse.text();

    return saveWordResult;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('received');

    // let response = null;
    switch (message.action) {
        case 'saveWord':
            saveWord(message.word);
            sendResponse();
            break;
        
        case 'translateText':
            translateText(message.word).then(response => sendResponse(response));
            // console.log(response);
            break;
    
        default:
            break;
    }

    return true;
});

chrome.action.onClicked.addListener(async (tab) => {
    const state = await chrome.action.getBadgeText({});
    
    const newState = state == 'On' ? '' : 'On';
    const action = state == 'On' ? 'disable' : 'enable';

    chrome.action.setBadgeText({ text: newState });
    chrome.tabs.sendMessage(tab.id, { action: action });
});
chrome.runtime.onInstalled.addListener(() => {
    // const [tab] = await chrome.tabs.query({});
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     files: ['content_script/content.js'],
    // });
    // setTimeout(() => {
    //     chrome.tabs.sendMessage(tab.id, { action: 'enable' });
    //     chrome.action.setBadgeText({ text: 'On' });
    // }, 2000);
    chrome.tabs.reload();
});
chrome.commands.onCommand.addListener(command => command == 'reload_extension' && chrome.runtime.reload());