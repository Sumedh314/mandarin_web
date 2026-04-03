async function getSelectedWord() {
    const text = window.getSelection().toString();
    
    if (text == '') {
        return;
    }
    else {
        console.log('sent');
        console.log(text);
        const response = await chrome.runtime.sendMessage({action: 'saveWord', word: text});
        console.log(response);
        return response;
    }

}

document.addEventListener('selectionchange', (event) => getSelectedWord(event));