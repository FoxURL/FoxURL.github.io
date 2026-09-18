const QUEUE_KEY = 'foxbox.queue';
const MAX_QUEUE_SIZE = 50;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    return processShare(data.action, data.content, data.direction, data.sender);
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || '';

  if (action === 'send') {
    return processShare('send', params.content, params.direction, params.sender);
  }

  if (action === 'poll') {
    return pollShare(params.direction || 'up', params.clientId || '');
  }

  return jsonResponse({ status: 'ok', message: 'FoxBox relay is active.' });
}

function processShare(action, content, direction, sender) {
  if (action !== 'send') {
    return jsonResponse({ status: 'error', message: 'Invalid action' });
  }

  const payload = {
    id: generateId(),
    content: String(content || ''),
    direction: direction || 'up',
    sender: String(sender || ''),
    createdAt: Date.now()
  };

  if (!payload.content) {
    return jsonResponse({ status: 'error', message: 'Content is required' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const queue = readQueue(properties);
    queue.push(payload);
    properties.setProperty(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
  } finally {
    lock.releaseLock();
  }

  return jsonResponse({ status: 'success', id: payload.id });
}

function pollShare(direction, clientId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const queue = readQueue(properties);
    const payloadIndex = queue.findIndex(payload => payload.direction === direction && payload.sender !== clientId);

    if (payloadIndex === -1) {
      return jsonResponse({ status: 'empty' });
    }

    const payload = queue.splice(payloadIndex, 1)[0];
    properties.setProperty(QUEUE_KEY, JSON.stringify(queue));
    return jsonResponse({ status: 'success', payload: payload });
  } finally {
    lock.releaseLock();
  }
}

function readQueue(properties) {
  try {
    return JSON.parse(properties.getProperty(QUEUE_KEY) || '[]');
  } catch (err) {
    return [];
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
