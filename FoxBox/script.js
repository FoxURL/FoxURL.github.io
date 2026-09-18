const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyD80sjDnBZr7IE73aK8-TsgcrGERh5mQ1_IQ4zjqdYtg3DiTa-O0_BUl-O19wJamDG/exec";

const shareInput = document.getElementById('share-input');
const addBtn = document.getElementById('add-btn');
const bubbleContainer = document.getElementById('bubble-container');
const emptyQueue = document.getElementById('empty-queue');
const receiverOutput = document.getElementById('receiver-output');
const shareForm = document.getElementById('share-form');
const knownPayloadIds = new Set();
const clientId = localStorage.getItem('foxbox.clientId') || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let lastReceivedAt = 0;
localStorage.setItem('foxbox.clientId', clientId);

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

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.setAttribute('readonly', '');
    fallback.style.position = 'fixed';
    fallback.style.top = '0';
    fallback.style.left = '0';
    fallback.style.width = '1px';
    fallback.style.height = '1px';
    fallback.style.padding = '0';
    fallback.style.border = '0';
    fallback.style.opacity = '0.01';
    fallback.style.fontSize = '16px';
    document.body.appendChild(fallback);
    fallback.focus();
    fallback.select();
    fallback.setSelectionRange(0, fallback.value.length);
    const copied = document.execCommand('copy');
    fallback.remove();
    if (!copied) throw new Error('Clipboard copy was blocked');
}

async function sendPayload(text) {
    const params = new URLSearchParams({ action: 'send', content: text, direction: 'up', sender: clientId });
    const response = await fetch(`${SCRIPT_URL}?${params}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Relay returned ${response.status}`);
    const result = await response.json();
    if (result.status !== 'success' || !result.id) throw new Error('Relay did not confirm the payload');
    knownPayloadIds.add(String(result.id));
    return result;
}

async function checkForIncoming() {
    try {
        const params = new URLSearchParams({ action: 'poll', direction: 'up', clientId });
        const response = await fetch(`${SCRIPT_URL}?${params}`, { cache: 'no-store' });
        if (!response.ok) {
            setRadarMessage('Receiving is unavailable on the relay.');
            return;
        }
        const result = await response.json();
        if (result.status === 'error') {
            setRadarMessage('Receiving is unavailable on the relay.');
            return;
        }
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
        setRadarMessage('Unable to reach the relay.');
    }
}

function createBubble(text, incoming = false) {
    const bubble = document.createElement('button');
    bubble.type = 'button';
    bubble.className = 'bubble';
    if (incoming) bubble.classList.add('incoming');
    if (emptyQueue) emptyQueue.style.display = 'none';
    
    const bubbleText = document.createElement('span');
    bubbleText.className = 'bubble-text';
    bubbleText.textContent = `📦 ${text}`;
    const badge = document.createElement('span');
    badge.className = 'method-badge';
    badge.textContent = incoming ? 'Received' : 'Click to beam';
    bubble.append(bubbleText, badge);

    async function copyReceivedBubble() {
        if (bubble.dataset.copying === 'true') return;
        bubble.dataset.copying = 'true';
        try {
            await copyText(text);
            badge.textContent = 'Copied';
            setRadarMessage('Copied to clipboard.', true);
            bubble.classList.add('copying');
            setTimeout(() => {
                bubble.remove();
                if (!bubbleContainer.querySelector('.bubble') && emptyQueue) emptyQueue.style.display = 'block';
            }, 460);
        } catch (error) {
            bubble.dataset.copying = 'false';
            setRadarMessage('Copy was blocked by the browser.');
        }
    }

    async function beamBubble() {
        if (incoming || bubble.dataset.beaming === 'true') return;
        bubble.dataset.beaming = 'true';
        bubble.classList.add('beaming');
        setRadarMessage('Beaming payload upward...');
        try {
            await sendPayload(text);
            setRadarMessage('Successfully beamed.', true);
            bubble.remove();
            if (!bubbleContainer.querySelector('.bubble') && emptyQueue) emptyQueue.style.display = 'block';
        } catch (error) {
            setRadarMessage('Beam was not confirmed. Try again.');
            bubble.dataset.beaming = 'false';
            bubble.classList.remove('beaming');
        }
    }

    if (incoming) {
        bubble.setAttribute('aria-label', 'Copy received payload');
        bubble.addEventListener('click', copyReceivedBubble);
        bubble.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                copyReceivedBubble();
            }
        });
    } else {
        bubble.addEventListener('click', beamBubble);
        bubble.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                beamBubble();
            }
        });
    }

    bubbleContainer.appendChild(bubble);
}

checkForIncoming();
setInterval(checkForIncoming, 2500);
