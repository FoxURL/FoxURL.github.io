const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhzVU0hUGEXHtQVgVZFHMwTLs1j4hBYI9U-yFieYToNUGsE-ECMhvxMJqkG-vKQ6dwCw/exec";

const shareInput = document.getElementById('share-input');
const addBtn = document.getElementById('add-btn');
const bubbleContainer = document.getElementById('bubble-container');
const emptyQueue = document.getElementById('empty-queue');
const receiverOutput = document.getElementById('receiver-output');
const shareForm = document.getElementById('share-form');
const knownPayloadIds = new Set();
let lastReceivedAt = 0;

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

function getPayloadItems(result) {
    const payloads = Array.isArray(result) ? result : result.data || result.payloads || result.items || result.payload || result;
    if (!Array.isArray(payloads)) return payloads && payloads.content ? [payloads] : [];
    return payloads;
}

function getPayloadId(payload) {
    return String(payload.id || payload.key || payload.timestamp || `${payload.content}-${payload.createdAt || ''}`);
}

async function sendPayload(text) {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'send', content: text, direction: 'up' })
    });
    if (!response.ok) throw new Error(`Relay returned ${response.status}`);
    const result = await response.json();
    if (result.status !== 'success' || !result.id) throw new Error('Relay did not confirm the payload');
    knownPayloadIds.add(String(result.id));
    return result;
}

async function checkForIncoming() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=receive&direction=up&since=${lastReceivedAt}`, { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        getPayloadItems(result).forEach(payload => {
            const content = payload.content || payload.text || payload.value;
            const id = getPayloadId(payload);
            if (!content || knownPayloadIds.has(id)) return;
            knownPayloadIds.add(id);
            lastReceivedAt = Math.max(lastReceivedAt, Number(payload.timestamp || payload.createdAt || Date.now()));
            createBubble(content, true);
            setRadarMessage('Payload received.', true);
        });
    } catch (error) {
        // A temporary polling failure should not interrupt local composing.
    }
}

function createBubble(text, incoming = false) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (incoming) bubble.classList.add('incoming');
    if (emptyQueue) emptyQueue.style.display = 'none';
    
    const bubbleText = document.createElement('span');
    bubbleText.className = 'bubble-text';
    bubbleText.textContent = `📦 ${text}`;
    const badge = document.createElement('span');
    badge.className = 'method-badge';
    badge.textContent = incoming ? 'Received' : 'Drag up to beam';
    bubble.append(bubbleText, badge);

    let startY = 0;
    let currentY = 0;
    let pointerId = null;

    bubble.addEventListener('pointerdown', event => {
        if (incoming) return;
        pointerId = event.pointerId;
        startY = event.clientY;
        currentY = startY;
        try {
            bubble.setPointerCapture(pointerId);
        } catch (error) {
            // Older WebKit builds may not expose pointer capture immediately.
        }
        bubble.classList.add('dragging');
    });

    bubble.addEventListener('pointermove', event => {
        if (event.pointerId !== pointerId) return;
        currentY = event.clientY;
        bubble.style.setProperty('--drag-offset', `${currentY - startY}px`);
    });

    bubble.addEventListener('pointerup', async event => {
        if (event.pointerId !== pointerId) return;
        const distance = currentY - startY;
        pointerId = null;
        bubble.classList.remove('dragging');
        bubble.style.removeProperty('--drag-offset');
        if (distance >= -70) return;

        setRadarMessage('Beaming payload upward...');
        try {
            await sendPayload(text);
            setRadarMessage('Successfully beamed.', true);
            bubble.remove();
            if (!bubbleContainer.querySelector('.bubble') && emptyQueue) emptyQueue.style.display = 'block';
        } catch (error) {
            setRadarMessage('Beam was not confirmed. Try again.');
        }
    });

    bubble.addEventListener('pointercancel', () => {
        pointerId = null;
        bubble.classList.remove('dragging');
        bubble.style.removeProperty('--drag-offset');
    });

    bubbleContainer.appendChild(bubble);
}

checkForIncoming();
setInterval(checkForIncoming, 2500);
