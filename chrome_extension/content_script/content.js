let textSelected = false;

async function popupAction(/** @type {MouseEvent} */ event) {
    const text = window.getSelection().toString();
    
    // Remove popup if user clicked out of the area
    if (document.querySelector('#popupHost') != undefined && event.target.id != 'popupHost') {
        document.querySelector('#popupHost').remove();
        return;
    }
    
    // Don't do anything if user clicked inside popup or didn't select any text
    if (!textSelected || text.trim() == '' || event.target.parentNode.id == 'popup') {
        return;
    }
    else {
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        // Create host element for shadow DOM
        const popupHost = document.createElement('div');
        popupHost.id = 'popupHost';
        popupHost.style.all = 'initial';
        popupHost.style.position = 'absolute';
        popupHost.style.top = `${cursorY + window.scrollY + 20}px`;
        popupHost.style.left = `${cursorX}px`;
        document.body.appendChild(popupHost);

        // Create shadow with external stylesheet
        const shadow = popupHost.attachShadow({ mode: 'open' });
        const link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', chrome.runtime.getURL('content_script/content.css'));
        shadow.appendChild(link);

        // Create content inside shadow DOM with information about the user's text selection
        const popup = document.createElement('div');
        popup.id = 'popup';
        
        // Add information about user's text selection to popup
        const translation = await chrome.runtime.sendMessage({ action: 'translateText', word: text });
        const pinyin = await chrome.runtime.sendMessage({ action: 'getPinyin', word: text });
        const proficiency = await chrome.runtime.sendMessage({ action: 'getProficiency', word: text });
        const wordStatus = await chrome.runtime.sendMessage({ action: 'checkSaved', word: text });

        const information = document.createElement('p');
        information.style.margin = '0px 0px 10px 0px';
        information.innerHTML = `${pinyin}<br>${translation}<br>Proficiency: ${Object.values(proficiency)}`;
        
        // Create button for user to save the test to review later
        const saveWordButton = document.createElement('button');
        saveWordButton.type = 'button';
        saveWordButton.id = 'save-word-button';
        saveWordButton.textContent = wordStatus == 'Saved' ? 'Unsave' : 'Save';
        
        popup.appendChild(information);
        popup.appendChild(saveWordButton);
        shadow.appendChild(popup);

        // Save or unsave text when button is clicked
        saveWordButton.addEventListener('click', async () => {
            chrome.runtime.sendMessage({ action: 'saveWord', word: text });
            let buttonText = saveWordButton.textContent;
            buttonText = buttonText == 'Save' ? 'Unsave' : 'Save';
            saveWordButton.textContent = buttonText;
        });

        popupHost.addEventListener('mouseleave', () => popupHost.remove());
    }
}

function handleTextSelected() {
    const text = window.getSelection().toString();
    textSelected = text == '' ? true : false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'enable':
            document.addEventListener('mousedown', handleTextSelected);
            document.addEventListener('mouseup', popupAction);
            break;
        case 'disable':
            document.removeEventListener('mousedown', handleTextSelected);
            document.removeEventListener('mouseup', popupAction);
            break;
    
        default:
            break;
    }

    sendResponse();
    return true;
});