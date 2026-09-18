const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhzVU0hUGEXHtQVgVZFHMwTLs1j4hBYI9U-yFieYToNUGsE-ECMhvxMJqkG-vKQ6dwCw/exec";

const shareInput = document.getElementById('share-input');
const addBtn = document.getElementById('add-btn');
const bubbleContainer = document.getElementById('bubble-container');
const emptyQueue = document.getElementById('empty-queue');
const receiverOutput = document.getElementById('receiver-output');
const shareForm = document.getElementById('share-form');

// Handle adding text to create a bubble
shareForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = shareInput.value.trim();
    if (!text) {
        alert('Please type or paste some text first!');
        return;
    }

    if (emptyQueue) emptyQueue.style.display = 'none';
    createBubble(text);
    shareInput.value = '';
});

function setRadarMessage(message, success = false) {
    receiverOutput.replaceChildren();
    const dot = document.createElement('span');
    dot.className = success ? 'radar-pulse success' : 'radar-pulse';
    const text = document.createElement('span');
    text.textContent = message;
    receiverOutput.append(dot, text);
}

function createBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.draggable = true;
    
    const bubbleText = document.createElement('span');
    bubbleText.className = 'bubble-text';
    bubbleText.textContent = `📦 ${text}`;
    const badge = document.createElement('span');
    badge.className = 'method-badge';
    badge.textContent = 'Ready to beam';
    bubble.append(bubbleText, badge);

    let startY = 0;

    bubble.addEventListener('dragstart', (e) => {
        startY = e.clientY;
    });

    bubble.addEventListener('dragend', async (e) => {
        const endY = e.clientY;
        const distance = endY - startY;

        // If dragged upward significantly toward the top of the screen
        if (distance < -50) {
            setRadarMessage('Beaming payload upward...');
            
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'send', content: text, direction: 'up' })
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    setRadarMessage('Successfully beamed.', true);
                    bubble.remove();
                    
                    if (bubbleContainer.children.length === 0 && emptyQueue) {
                        emptyQueue.style.display = 'block';
                    }
                } else {
                    setRadarMessage('Failed to beam payload.');
                }
            } catch (err) {
                setRadarMessage('Network error during transmission.');
            }
        }
    });

    bubbleContainer.appendChild(bubble);
}
