let textSelected = false;

async function popupAction(/** @type {MouseEvent} */ event) {
    
    const text = window.getSelection().toString();
    
    if (document.querySelector('#information-box') != undefined) {
        document.querySelector('#information-box').remove();
        return;
    }
    
    if (!textSelected || text.trim() == '' || event.target.parentNode.id == 'information-box') {
        return;
    }
    else {
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        const informationBox = document.createElement('div');
        informationBox.id = 'information-box';
        informationBox.style.top = `${cursorY + window.scrollY + 20}px`;
        informationBox.style.left = `${cursorX}px`;

        const translation = await chrome.runtime.sendMessage({action: 'translateText', word: text});
        const information = document.createElement('p');
        information.textContent = translation;

        const saveWordButton = document.createElement('button');
        saveWordButton.type = 'button';
        saveWordButton.id = 'save-word-button';
        
        informationBox.appendChild(information);
        informationBox.appendChild(saveWordButton);
        document.body.appendChild(informationBox);

        saveWordButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({action: 'saveWord', word: text});
        });

        informationBox.addEventListener('mouseleave', () => {
            informationBox.remove();
        });
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