async function changeColor() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => {
            const title = document.getElementById('program');
            title.style.color = 'blue';
        }
    })
}

const button = document.getElementById('change-color');
button.addEventListener('click', changeColor);