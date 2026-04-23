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

async function getPinyin(text) {
    const getPinyinResponse = await fetch('http://localhost:5000/get_pinyin', {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: text
    });
    const getPinyinResult = await getPinyinResponse.text();

    return getPinyinResult;
}

async function getProficiency(text) {
    const getPinyinResponse = await fetch('http://localhost:5000/get_proficiency_levels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(text)
    });
    const getPinyinResult = await getPinyinResponse.json();

    return getPinyinResult;
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

async function checkSaved(text) {
    const saveWordResponse = await fetch('http://localhost:5000/check_saved', {
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
            saveWord(message.word).then(response => sendResponse(response));
            break;
        
        case 'translateText':
            translateText(message.word).then(response => sendResponse(response));
            break;

        case 'getPinyin':
            getPinyin(message.word).then(response => sendResponse(response));
            break;

            case 'getProficiency':
                getProficiency(message.word).then(response => sendResponse(response));
                break;

        case 'checkSaved':
            checkSaved(message.word).then(response => sendResponse(response));
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

    await chrome.action.setBadgeText({ text: newState });
    chrome.tabs.sendMessage(tab.id, { action: action });
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.reload();
});
chrome.commands.onCommand.addListener(command => command == 'reload_extension' && chrome.runtime.reload());