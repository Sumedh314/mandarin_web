// import style from "./content.css";
// console.log(style);
let textSelected = false;

async function popupAction(/** @type {MouseEvent} */ event) {
    const text = window.getSelection().toString();
    
    console.log(event.target);
    if (document.querySelector('#popup') != undefined && event.target.id != 'popup') {
        document.querySelector('#popup').remove();
        return;
    }
    
    if (!textSelected || text.trim() == '' || event.target.parentNode.id == 'information-box') {
        return;
    }
    else {
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.style.position = 'absolute';
        popup.style.top = `${cursorY + window.scrollY + 20}px`;
        popup.style.left = `${cursorX}px`;
        document.body.appendChild(popup);

        const shadow = popup.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<link rel="stylesheet" href="${chrome.runtime.getURL('content_script/content.css')}">`;
        // shadow.innerHTML = `<style>@import url('content.css');</style>`

        const informationBox = document.createElement('div');
        informationBox.id = 'information-box';
        
        const translation = await chrome.runtime.sendMessage({ action: 'translateText', word: text });
        const information = document.createElement('p');
        information.style.margin = '0px 0px 10px 0px';
        information.textContent = translation;
        
        const saveWordButton = document.createElement('button');
        saveWordButton.type = 'button';
        saveWordButton.id = 'save-word-button';
        saveWordButton.textContent = 'Save';
        
        informationBox.appendChild(information);
        informationBox.appendChild(saveWordButton);
        shadow.appendChild(informationBox);

        saveWordButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'saveWord', word: text });
            let buttonText = saveWordButton.textContent;
            buttonText = buttonText == 'Save' ? 'Unsave' : 'Save';
            saveWordButton.textContent = buttonText;
        });

        popup.addEventListener('mouseleave', () => {
            popup.remove();
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