// Sidebar tab switching logic
function switchTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetPane = document.getElementById('tab-' + tabName);
    if (targetPane) targetPane.classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (tabName === 'communications') loadCommunications();
}

// Sign out function to clear local profile data and redirect home
function signOutUser() {
    localStorage.removeItem('foxurl.signin.email');
    localStorage.removeItem('foxurl.signin.method');
    localStorage.removeItem('foxurl.signin.lastLogin');
    window.location.href = '/';
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('foxurl.theme', isDark ? 'dark' : 'warm');
    updateThemeToggle(isDark);
}

function updateThemeToggle(isDark) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    themeToggle.textContent = isDark ? 'Warm theme' : 'Dark mode';
    themeToggle.setAttribute('aria-pressed', String(isDark));
}

function toggleNotifications(forceState) {
    const center = document.getElementById('notification-center');
    const toggle = document.getElementById('notification-toggle');
    if (!center || !toggle) return;
    const shouldOpen = typeof forceState === 'boolean' ? forceState : center.hidden;
    center.hidden = !shouldOpen;
    toggle.setAttribute('aria-expanded', String(shouldOpen));
}

function addNotification(message, tone = 'good') {
    const list = document.getElementById('notification-list');
    const count = document.getElementById('notification-count');
    if (!list || !count) return;
    if (list.querySelector('.empty')) list.innerHTML = '';
    const item = document.createElement('div');
    item.className = `notification-item notification-${tone} unread`;
    item.dataset.message = message;
    item.textContent = message;
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'notification-dismiss';
    dismiss.textContent = 'Dismiss';
    dismiss.addEventListener('click', () => {
        item.remove();
        saveNotifications();
        updateNotificationCount();
        showEmptyNotifications();
    });
    item.appendChild(dismiss);
    list.prepend(item);
    saveNotifications();
    updateNotificationCount();
}

function updateNotificationCount() {
    const count = document.getElementById('notification-count');
    const list = document.getElementById('notification-list');
    if (count && list) count.textContent = list.querySelectorAll('.unread').length;
}

function showEmptyNotifications() {
    const list = document.getElementById('notification-list');
    if (list && !list.children.length) list.innerHTML = '<div class="empty">No new updates.</div>';
}

function saveNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;
    const notifications = [...list.querySelectorAll('.notification-item')].map(item => ({ message: item.dataset.message, tone: item.classList.contains('notification-warning') ? 'warning' : 'good', unread: item.classList.contains('unread') }));
    localStorage.setItem('foxurl.notifications', JSON.stringify(notifications.slice(0, 12)));
}

function restoreNotifications() {
    const saved = JSON.parse(localStorage.getItem('foxurl.notifications') || '[]');
    saved.slice().reverse().forEach(notification => addNotification(notification.message, notification.tone));
    document.querySelectorAll('.notification-item').forEach(item => {
        const notification = saved.find(savedItem => savedItem.message === item.dataset.message);
        if (notification && !notification.unread) item.classList.remove('unread');
    });
    saveNotifications();
    updateNotificationCount();
}

function markNotificationsRead() {
    document.querySelectorAll('.notification-item').forEach(item => item.classList.remove('unread'));
    saveNotifications();
    updateNotificationCount();
}

function clearNotifications() {
    const list = document.getElementById('notification-list');
    if (list) list.innerHTML = '';
    saveNotifications();
    updateNotificationCount();
    showEmptyNotifications();
}

const savedTheme = localStorage.getItem('foxurl.theme') === 'dark';
if (savedTheme) document.body.classList.add('dark-mode');
updateThemeToggle(savedTheme);
restoreNotifications();

// Retrieve session details from local storage
const email = localStorage.getItem('foxurl.signin.email') || '';
const method = localStorage.getItem('foxurl.signin.method') || 'Not recorded';
const methodLabel = { email: 'Email verification', google: 'Google', passkey: 'Passkey' }[method] || method;

const communicationsEndpoint = 'https://script.google.com/macros/s/AKfycby9a10Rb0OM4Iqe0rPz9-MKjVV4iIfN0mOiPd-3JhnqMSP2LO6abGtcjsKjGPUBtJQf/exec';
let communicationsLoaded = false;
let communicationsLoading = false;

function appendFormattedEmailBody(container, body) {
    const emphasisPattern = /\*([^*\n]+)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = emphasisPattern.exec(body)) !== null) {
        container.append(document.createTextNode(body.slice(lastIndex, match.index)));
        const emphasis = document.createElement('strong');
        emphasis.textContent = match[1];
        container.append(emphasis);
        lastIndex = emphasisPattern.lastIndex;
    }
    container.append(document.createTextNode(body.slice(lastIndex)));
}

function createCommunicationCard(message) {
    const card = document.createElement('details');
    card.className = 'communication-card';

    const summary = document.createElement('summary');
    const sender = document.createElement('span');
    sender.className = 'communication-sender';
    sender.textContent = message.from || 'FoxURL';
    const messagePreview = document.createElement('span');
    messagePreview.className = 'communication-message-preview';
    const subject = document.createElement('strong');
    subject.className = 'communication-subject';
    subject.textContent = message.subject || '(No subject)';
    const preview = document.createElement('span');
    preview.className = 'communication-snippet';
    preview.textContent = (message.body || '').replace(/\s+/g, ' ').trim().slice(0, 120) || 'No message body.';
    messagePreview.append(subject, preview);
    const timestamp = document.createElement('time');
    const date = new Date(message.timestamp);
    if (message.timestamp && !Number.isNaN(date.getTime())) {
        timestamp.dateTime = date.toISOString();
        timestamp.textContent = date.toLocaleString();
    } else {
        timestamp.textContent = 'Date unavailable';
    }
    summary.append(sender, messagePreview, timestamp);

    const addresses = document.createElement('div');
    addresses.className = 'communication-addresses';
    const from = document.createElement('span');
    from.textContent = `From: ${message.from || 'Unknown sender'}`;
    const to = document.createElement('span');
    to.textContent = `To: ${message.to || 'Unknown recipient'}`;
    addresses.append(from, to);

    const body = document.createElement('div');
    body.className = 'communication-body';
    appendFormattedEmailBody(body, message.body || 'No message body.');

    card.append(summary, addresses, body);
    return card;
}

async function loadCommunications(forceRefresh = false) {
    const list = document.getElementById('communications-list');
    const status = document.getElementById('communications-status');
    const refreshButton = document.getElementById('refresh-communications-btn');
    if (!list || !status || communicationsLoading || (communicationsLoaded && !forceRefresh)) return;

    if (!email) {
        status.textContent = 'Sign in to your FoxURL account to view its emails.';
        return;
    }

    communicationsLoading = true;
    if (refreshButton) refreshButton.disabled = true;
    status.textContent = 'Connecting to FoxURL servers, please wait...';

    try {
        const url = new URL(communicationsEndpoint);
        url.searchParams.set('email', email);
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Communications request returned HTTP ${response.status}.`);

        const messages = await response.json();
        if (!Array.isArray(messages)) throw new Error('Communications response was not an email list.');

        const accountMessages = messages.map((message, index) => {
            if (!message || typeof message !== 'object' || Array.isArray(message)) {
                throw new Error(`Communications response contains an invalid email at position ${index + 1}.`);
            }
            return {
                subject: typeof message.subject === 'string' ? message.subject : '',
                body: typeof message.body === 'string' ? message.body : '',
                timestamp: typeof message.timestamp === 'string' ? message.timestamp : '',
                to: typeof message.to === 'string' ? message.to : '',
                from: typeof message.from === 'string' ? message.from : ''
            };
        }).filter(message => message.to.trim().toLowerCase() === email.trim().toLowerCase())
            .sort((first, second) => {
                const firstTime = Date.parse(first.timestamp);
                const secondTime = Date.parse(second.timestamp);
                return (Number.isFinite(secondTime) ? secondTime : 0) - (Number.isFinite(firstTime) ? firstTime : 0);
            });

        list.replaceChildren();
        accountMessages.forEach(message => list.append(createCommunicationCard(message)));
        status.textContent = accountMessages.length
            ? `${accountMessages.length} email${accountMessages.length === 1 ? '' : 's'} sent to ${email}.`
            : `No emails found for ${email}.`;
        communicationsLoaded = true;
    } catch (error) {
        console.error('Could not load FoxURL communications.', error);
        status.textContent = 'Unable to load your emails right now. Check your connection and try again.';
    } finally {
        communicationsLoading = false;
        if (refreshButton) refreshButton.disabled = false;
    }
}

const refreshCommunicationsButton = document.getElementById('refresh-communications-btn');
if (refreshCommunicationsButton) {
    refreshCommunicationsButton.addEventListener('click', () => loadCommunications(true));
}

const emailElement = document.getElementById('account-email');
const profileEmail = document.getElementById('profile-email');
const avatar = document.getElementById('avatar');
const lastLoginElement = document.getElementById('last-login');

if (emailElement) emailElement.textContent = email || 'Not available';
if (profileEmail) profileEmail.textContent = email || 'Signed-in account';
if (document.getElementById('profile-method')) document.getElementById('profile-method').textContent = methodLabel;
if (document.getElementById('account-method')) document.getElementById('account-method').textContent = methodLabel;
if (email && avatar) avatar.textContent = email.charAt(0).toUpperCase();

function updateSecurityHealth() {
    const scoreElement = document.getElementById('security-score');
    const checklist = document.getElementById('security-checklist');
    if (!scoreElement || !checklist) return;

    const score = Math.min(100, 70 + (email ? 15 : 0) + (method === 'passkey' ? 15 : 0));
    scoreElement.textContent = `${score}/100`;
    checklist.innerHTML = `
        <div class="security-check"><span>Account identity</span><b class="security-good">${email ? 'Verified' : 'Needs sign-in'}</b></div>
        <div class="security-check"><span>Secure connection</span><b class="security-good">TLS protected</b></div>
        <div class="security-check"><span>Sign-in method</span><b>${methodLabel}</b></div>`;
}

updateSecurityHealth();

if (lastLoginElement) {
    const lastLogin = localStorage.getItem('foxurl.signin.lastLogin');
    lastLoginElement.textContent = `Last signed in: ${lastLogin ? new Date(lastLogin).toLocaleString() : 'Not available'}`;
}

const copyEmailButton = document.getElementById('copy-email-btn');
if (copyEmailButton) {
    copyEmailButton.addEventListener('click', async () => {
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            copyEmailButton.textContent = 'Copied';
            setTimeout(() => { copyEmailButton.textContent = 'Copy'; }, 1500);
        } catch (err) {
            copyEmailButton.textContent = 'Unavailable';
        }
    });
}

// Device and session breakdown
let latestLocation = null;
let latestIp = null;
const userAgent = navigator.userAgent;
const deviceEl = document.getElementById('session-device');
if (deviceEl) {
    deviceEl.textContent = /Android/i.test(userAgent) ? 'Android device' : /iPhone|iPad|iPod/i.test(userAgent) ? 'Apple device' : /Windows/i.test(userAgent) ? 'Windows device' : /Macintosh/i.test(userAgent) ? 'Mac device' : 'Desktop browser';
}

const ipLookupPromise = fetch('https://api.ipify.org?format=json')
    .then(response => {
        if (!response.ok) throw new Error(`IP lookup returned HTTP ${response.status}.`);
        return response.json();
    })
    .then(data => { 
        latestIp = data.ip || null;
        const ipEl = document.getElementById('session-ip');
        if (ipEl) ipEl.textContent = latestIp || 'Not available';
        return latestIp;
    })
    .catch(error => {
        console.warn('Could not determine the public IP address.', error);
        const ipEl = document.getElementById('session-ip');
        if (ipEl) ipEl.textContent = 'Not available'; 
        return null;
    });
    
const locationLookupPromise = fetch('https://ipapi.co/json/')
    .then(response => {
        if (!response.ok) throw new Error(`Approximate location lookup returned HTTP ${response.status}.`);
        return response.json();
    })
    .then(data => { 
        latestLocation = data;
        const locEl = document.getElementById('session-location');
        if (locEl) {
            if (data.city && data.country_name) locEl.textContent = `${data.city}, ${data.country_name}`; 
            else if (data.country_name) locEl.textContent = data.country_name; 
        }
        loadLocalWeather(data);
        loadOfficialAlerts(data);
        return data;
    })
    .catch(error => {
        console.warn('Could not determine the approximate IP location.', error);
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) weatherWidget.innerHTML = '<div class="empty">Weather location could not be determined.</div>';
        return null;
    });

function weatherDescription(code) {
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
        61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
        80: 'Rain showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm',
        96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Current conditions';
}

function weatherIcon(code) {
    if (code === 0) return '☀';
    if (code <= 3) return '☁';
    if (code <= 48) return '〰';
    if (code >= 71 && code <= 77) return '❄';
    if (code <= 67 || code <= 82) return '☂';
    if (code >= 95) return '⚡';
    return '☁';
}

function getCycloneSignal(weather) {
    const gusts = Number(weather.wind_gusts_10m) || 0;
    const pressure = Number(weather.surface_pressure) || 1013;
    const stormSignal = Number(weather.weather_code) >= 95;
    const signal = Math.min(15, Math.round(Math.max(0, (gusts - 55) / 8) + Math.max(0, (1000 - pressure) / 5) + (stormSignal ? 2 : 0)));
    return signal;
}

function getCycloneComparison() {
    return "You're more likely to be hit by a flying bird than encounter a cyclone today.";
}

async function loadLocalWeather(location) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget || !location || !Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude))) return;

    const params = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m,cloud_cover,visibility,uv_index',
        hourly: 'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max,sunrise,sunset',
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        timezone: 'auto'
    });

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!response.ok) throw new Error('Weather request failed');
        const data = await response.json();
        const weather = data.current;
        const cycloneChance = getCycloneSignal(weather);
        const windGusts = Number(weather.wind_gusts_10m) || 0;
        const windMood = windGusts >= 90
            ? 'wind-holding'
            : windGusts >= 50
                ? 'wind-blustery'
                : windGusts >= 25
                    ? 'wind-breezy'
                    : 'wind-calm';
        const windMessage = windGusts >= 90
            ? 'Very strong gusts! The fox is holding on.'
            : windGusts >= 50
                ? 'Blustery gusts — the fox is leaning into the wind.'
                : windGusts >= 25
                    ? 'A breeze is ruffling the fox’s fur.'
                    : 'Calm air — the fox is taking it easy.';
        const comparison = cycloneChance < 1
            ? getCycloneComparison()
            : 'Keep an eye on official local weather alerts.';

        weatherWidget.innerHTML = `
            <div class="weather-main">
                <div class="weather-icon" aria-hidden="true">${weatherIcon(Number(weather.weather_code))}</div>
                <div class="weather-temperature">${Math.round(weather.temperature_2m)}<span>°C</span></div>
                <div><strong>${weatherDescription(weather.weather_code)}</strong><span class="weather-place">${location.city || location.country_name || 'Approximate location'}</span></div>
            </div>
            <div class="weather-grid">
                <div><span>Feels like</span><strong>${Math.round(weather.apparent_temperature)}°C</strong></div>
                <div><span>Humidity</span><strong>${weather.relative_humidity_2m}%</strong></div>
                <div><span>Pressure</span><strong>${Math.round(weather.surface_pressure)} hPa</strong></div>
                <div><span>Wind</span><strong>${Math.round(weather.wind_speed_10m)} km/h</strong></div>
                <div><span>Gusts</span><strong>${Math.round(weather.wind_gusts_10m)} km/h</strong></div>
                <div><span>Rain now</span><strong>${Number(weather.precipitation).toFixed(1)} mm</strong></div>
                <div><span>Cloud cover</span><strong>${weather.cloud_cover}%</strong></div>
                <div><span>UV index</span><strong>${Number(weather.uv_index).toFixed(1)}</strong></div>
            </div>
            <div class="cyclone-signal"><span><strong>Cyclone signal</strong><small>${comparison}</small></span><b>${cycloneChance}%</b></div>`;
        weatherWidget.insertAdjacentHTML('beforeend', `
            <div class="wind-scene ${windMood}" role="img" aria-label="${windMessage} This is a playful wind illustration, not a weather warning.">
                <svg class="wind-illustration" viewBox="0 0 190 112" aria-hidden="true">
                    <path class="wind-line wind-line-one" d="M8 33h46q9 0 9-7t-9-7h-8"/>
                    <path class="wind-line wind-line-two" d="M2 52h33q9 0 9-7t-9-7"/>
                    <path class="wind-line wind-line-three" d="M13 72h42q8 0 8 7t-8 7h-9"/>
                    <path class="wind-post" d="M158 16v84"/>
                    <path class="wind-ground" d="M62 100h110"/>
                    <g class="wind-fox">
                        <path class="fox-tail" d="M68 76C49 65 37 68 34 80c-3 12 10 17 22 9l14-8z"/>
                        <path class="fox-tail-tip" d="M39 78c-1 6 4 10 10 9-5 6-15 4-16-3-1-4 2-7 6-6z"/>
                        <ellipse class="fox-body" cx="88" cy="76" rx="27" ry="16"/>
                        <path class="fox-leg" d="m76 86-3 12m22-11 3 11"/>
                        <path class="fox-arm fox-arm-free" d="m103 70 7 13"/>
                        <path class="fox-arm fox-arm-grip" d="M102 68c21 2 35-4 49-17"/>
                        <circle class="fox-paw" cx="151" cy="51" r="4"/>
                        <g class="fox-head">
                            <path class="fox-ear" d="m99 44 1-16 12 12m10 1 11-13 2 19"/>
                            <circle class="fox-head-shape" cx="113" cy="49" r="16"/>
                            <path class="fox-muzzle" d="M122 53q13-4 15 4-8 7-18 1"/>
                            <circle class="fox-eye" cx="119" cy="46" r="1.5"/>
                            <circle class="fox-nose" cx="136" cy="55" r="2"/>
                        </g>
                    </g>
                </svg>
                <span class="wind-caption">${windMessage} <small>Illustration only — check official alerts for safety information.</small></span>
            </div>`);

        const forecast = data.daily;
        const hourly = data.hourly;
        const hourlyElement = document.getElementById('hourly-forecast');
        if (hourlyElement && hourly) {
            const startIndex = Math.max(0, hourly.time.findIndex(time => time >= data.current.time));
            const endIndex = Math.min(hourly.time.length, startIndex + 12);
            hourlyElement.innerHTML = hourly.time.slice(startIndex, endIndex).map((time, offset) => {
                const index = startIndex + offset;
                return `<div class="hourly-item"><strong>${offset === 0 ? 'Now' : new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</strong><span class="hourly-icon">${weatherIcon(Number(hourly.weather_code[index]))}</span><b>${Math.round(hourly.temperature_2m[index])}°</b><small>${hourly.precipitation_probability[index] || 0}% rain</small></div>`;
            }).join('');
        }
        const forecastElement = document.getElementById('weather-forecast');
        if (forecastElement && forecast) {
            forecastElement.innerHTML = forecast.time.map((date, index) => `
                <div class="forecast-day">
                    <strong>${index === 0 ? 'Today' : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</strong>
                    <span class="forecast-condition">${weatherDescription(forecast.weather_code[index])}</span>
                    <b>${Math.round(forecast.temperature_2m_max[index])}° / ${Math.round(forecast.temperature_2m_min[index])}°</b>
                    <small>${forecast.precipitation_probability_max[index] || 0}% rain</small>
                </div>`).join('');
        }

        const chartElement = document.getElementById('weather-chart');
        if (chartElement && forecast) {
            const highs = forecast.temperature_2m_max.map(Number);
            const lowestHigh = Math.min(...highs);
            const highestHigh = Math.max(...highs);
            const range = Math.max(1, highestHigh - lowestHigh);
            chartElement.innerHTML = highs.map((temperature, index) => `
                <div class="chart-column">
                    <span class="chart-value">${Math.round(temperature)}°</span>
                    <div class="chart-track"><i style="height: ${24 + ((temperature - lowestHigh) / range) * 76}%"></i></div>
                    <small>${index === 0 ? 'Today' : new Date(`${forecast.time[index]}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</small>
                </div>`).join('');
        }

        const alertElement = document.getElementById('weather-alert');
        if (alertElement && forecast) {
            const maxGust = Math.max(...forecast.wind_gusts_10m_max.map(Number));
            const stormExpected = forecast.weather_code.some(code => Number(code) >= 95);
            const alertText = stormExpected
                ? 'Thunderstorm conditions appear in the local forecast. Check official weather alerts before travelling.'
                : maxGust >= 60
                    ? `Strong wind signal: forecast gusts may reach ${Math.round(maxGust)} km/h.`
                    : 'No severe-weather signal detected in the available seven-day forecast.';
            alertElement.className = `weather-alert ${stormExpected || maxGust >= 60 ? 'weather-alert-warning' : 'weather-alert-good'}`;
            alertElement.textContent = alertText;
            addNotification(alertText, stormExpected || maxGust >= 60 ? 'warning' : 'good');
        }
        const updatedElement = document.getElementById('weather-updated');
        if (updatedElement) updatedElement.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
        weatherWidget.innerHTML = '<div class="empty">Current weather is unavailable right now.</div>';
        const forecastElement = document.getElementById('weather-forecast');
        if (forecastElement) forecastElement.innerHTML = '<div class="empty">Forecast is unavailable right now.</div>';
    }
}

async function loadOfficialAlerts(location) {
    const alertsElement = document.getElementById('official-alerts');
    if (!alertsElement) return;
    if (String(location.country_code).toUpperCase() !== 'US') {
        alertsElement.innerHTML = '<div class="official-alert-neutral">Official alerts depend on the local weather authority for this country.</div>';
        return;
    }

    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?point=${encodeURIComponent(location.latitude)},${encodeURIComponent(location.longitude)}`, { headers: { Accept: 'application/geo+json' } });
        if (!response.ok) throw new Error('Official alert request failed');
        const data = await response.json();
        const alerts = data.features || [];
        if (!alerts.length) {
            alertsElement.innerHTML = '<div class="official-alert-good">No active National Weather Service alerts for this location.</div>';
            return;
        }
        alertsElement.innerHTML = alerts.slice(0, 3).map(alert => `<div class="official-alert-warning"><strong>${alert.properties.event}</strong><span>${alert.properties.headline || 'Active official alert'}</span></div>`).join('');
        alerts.slice(0, 3).forEach(alert => addNotification(`Official alert: ${alert.properties.event}`, 'warning'));
    } catch (error) {
        alertsElement.innerHTML = '<div class="official-alert-neutral">Official alert feed is unavailable right now. Check your local weather authority.</div>';
    }
}

const refreshWeatherButton = document.getElementById('refresh-weather-btn');
if (refreshWeatherButton) {
    refreshWeatherButton.addEventListener('click', () => {
        if (!latestLocation) return;
        refreshWeatherButton.disabled = true;
        loadLocalWeather(latestLocation).finally(() => { refreshWeatherButton.disabled = false; });
    });
}

// Automated Multi-File Speed Test ("Test Connection Speed" Button Handler)
const cloudSyncToggle = document.getElementById('speed-cloud-sync');
const cloudSyncStatus = document.getElementById('speed-sync-status');
const speedInfoButton = document.getElementById('speed-info-button');
const speedSyncInfo = document.getElementById('speed-sync-info');
const signedIn = Boolean(email);
const cloudSyncPreferenceKey = 'foxurl.speedtest.cloudSync';

if (speedInfoButton && speedSyncInfo) {
    speedInfoButton.addEventListener('click', () => {
        speedSyncInfo.hidden = !speedSyncInfo.hidden;
        speedInfoButton.setAttribute('aria-expanded', String(!speedSyncInfo.hidden));
    });
}

if (cloudSyncToggle) {
    const savedPreference = localStorage.getItem(cloudSyncPreferenceKey);
    cloudSyncToggle.disabled = !signedIn;
    cloudSyncToggle.checked = signedIn && savedPreference !== 'false';
    if (cloudSyncStatus) {
        cloudSyncStatus.textContent = signedIn
            ? (cloudSyncToggle.checked ? 'Cloud sync is enabled for this browser.' : 'Cloud sync is off.')
            : 'Sign in to enable cloud sync.';
    }
    cloudSyncToggle.addEventListener('change', () => {
        localStorage.setItem(cloudSyncPreferenceKey, String(cloudSyncToggle.checked));
        if (cloudSyncStatus) {
            cloudSyncStatus.textContent = cloudSyncToggle.checked ? 'Cloud sync is enabled for this browser.' : 'Cloud sync is off.';
        }
    });
}

async function syncSpeedTestResult(speedMbps, ip, location) {
    if (!cloudSyncToggle || !cloudSyncToggle.checked || !signedIn) return;

    const [lookupIp, lookupLocation] = await Promise.all([ipLookupPromise, locationLookupPromise]);
    const submitIp = ip || lookupIp || latestIp;
    const locationParts = [
        lookupLocation?.city || latestLocation?.city || location.split(',')[0]?.trim(),
        lookupLocation?.region_code || lookupLocation?.region || latestLocation?.region_code || latestLocation?.region,
        lookupLocation?.country_name || latestLocation?.country_name || location.split(',').slice(1).join(',').trim()
    ].filter(Boolean);
    const submitLocation = locationParts.filter((part, index, parts) => parts.indexOf(part) === index).join(', ');

    if (!submitIp || !submitLocation) {
        if (cloudSyncStatus) cloudSyncStatus.textContent = 'Could not sync: IP address or approximate location is unavailable.';
        return;
    }

    const formData = new URLSearchParams({
        'entry.1829190046': submitIp,
        'entry.158464818': submitLocation,
        'entry.436405582': `${speedMbps.toFixed(1)} Mbps`
    });

    if (cloudSyncStatus) cloudSyncStatus.textContent = 'Sending speed test data to Google Forms...';
    try {
        await fetch('https://docs.google.com/forms/d/e/1FAIpQLSeeCZINFeHcE7hX9FjB-vye3kLCESd5DBOspL8YDsxZLlyQjg/formResponse', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: formData.toString()
        });
        if (cloudSyncStatus) cloudSyncStatus.textContent = 'Sync request sent. Google Forms does not provide this page with a delivery confirmation.';
    } catch (error) {
        console.error('Could not send the speed test result to Google Forms.', error);
        if (cloudSyncStatus) cloudSyncStatus.textContent = 'Cloud sync failed. Check your connection and try again.';
    }
}

function getAreaLocationQuery(locationData) {
    if (!locationData || !locationData.city || !locationData.country_name) return '';
    const region = (locationData.region_code || locationData.region || '').replace(/^AU-/, '');
    return [locationData.city, region, locationData.country_name].filter(Boolean).join(', ');
}

function renderAreaSpeedStats(container, stats) {
    container.replaceChildren();
    const title = document.createElement('div');
    title.textContent = `${stats.total_samples} ${stats.total_samples === 1 ? 'test' : 'tests'} for ${stats.location}`;
    container.append(title);

    if (stats.total_samples === 0) {
        const message = document.createElement('div');
        message.textContent = stats.message || 'No speed records are available for this area yet.';
        container.append(message);
        return;
    }

    const summary = document.createElement('div');
    summary.className = 'area-speed-summary';
    [
        ['Average', stats.avg_speed_mbps],
        ['Fastest', stats.max_speed_mbps],
        ['Slowest', stats.min_speed_mbps]
    ].forEach(([label, speed]) => {
        const stat = document.createElement('div');
        stat.className = 'area-speed-stat';
        const name = document.createElement('span');
        name.textContent = label;
        const value = document.createElement('strong');
        value.textContent = `${Number(speed).toFixed(1)} Mbps`;
        stat.append(name, value);
        summary.append(stat);
    });
    container.append(summary);
}

const areaSpeedButton = document.getElementById('area-speed-button');
const areaSpeedResults = document.getElementById('area-speed-results');
if (areaSpeedButton && areaSpeedResults) {
    areaSpeedButton.addEventListener('click', async () => {
        areaSpeedButton.disabled = true;
        areaSpeedResults.textContent = 'Finding your approximate area...';
        try {
            const locationData = await locationLookupPromise;
            const query = getAreaLocationQuery(locationData);
            if (!query) throw new Error('Your approximate IP location is unavailable.');

            areaSpeedResults.textContent = `Loading speed tests for ${query}...`;
            const endpoint = 'https://script.google.com/macros/s/AKfycbwGxrF6D4KZ_LgO_lKQ-chBfzaP2pdgKpx2YJRMQiBZnCLOXckYldyy9hwJmi3ltxa_/exec';
            const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`Area speed lookup returned HTTP ${response.status}.`);
            const stats = await response.json();
            if (stats.error) throw new Error(stats.error);
            if (!Number.isFinite(Number(stats.total_samples)) || !stats.location) {
                throw new Error('Area speed service returned an invalid response.');
            }
            renderAreaSpeedStats(areaSpeedResults, stats);
        } catch (error) {
            console.error('Could not load area speed results.', error);
            areaSpeedResults.textContent = `Could not load area speeds: ${error.message}`;
        } finally {
            areaSpeedButton.disabled = false;
        }
    });
}

async function runSmartSpeedTest() {
    const speedOutput = document.getElementById('speed-result');
    const statusOutput = document.getElementById('speed-status');
    const startBtn = document.getElementById('start-speed-test-btn');
    const liveLabel = document.getElementById('speed-live-label');
    let speedDisplayInterval = null;
    
    if (!speedOutput) return;

    if (startBtn) startBtn.disabled = true;
    speedOutput.textContent = 'Testing...';
    if (liveLabel) liveLabel.textContent = 'Live speed updates every second';

    if (statusOutput) statusOutput.textContent = 'Downloading 100 MB from Cloudflare Speed Test...';
    try {
        const response = await fetch(`https://speed.cloudflare.com/__down?bytes=100000000&test=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Cloudflare speed test returned HTTP ${response.status}.`);
        if (!response.body) throw new Error('This browser does not support streaming the speed-test download.');

        const reader = response.body.getReader();
        const startTime = performance.now();
        let totalBytes = 0;
        const speedSamples = [];
        let liveSpeedMbps = 0;
        speedOutput.textContent = '0.0 Mbps';
        speedDisplayInterval = window.setInterval(() => {
            speedOutput.textContent = `${liveSpeedMbps.toFixed(1)} Mbps`;
        }, 1000);
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const now = performance.now();
                totalBytes += value.byteLength;
                speedSamples.push({ time: now, bytes: value.byteLength });
                while (speedSamples.length > 1 && now - speedSamples[0].time > 1000) speedSamples.shift();
                const sampledBytes = speedSamples.reduce((sum, sample) => sum + sample.bytes, 0);
                const sampleDuration = Math.max((now - speedSamples[0].time) / 1000, 0.1);
                liveSpeedMbps = (sampledBytes * 8) / sampleDuration / 1_000_000;
            }
        } finally {
            reader.releaseLock();
        }
        window.clearInterval(speedDisplayInterval);
        speedDisplayInterval = null;

        const durationSeconds = (performance.now() - startTime) / 1000;
        if (totalBytes !== 100_000_000 || durationSeconds <= 0) {
            throw new Error(`Incomplete speed-test download: received ${totalBytes} of 100000000 bytes.`);
        }
        const speedMbps = (totalBytes * 8) / durationSeconds / 1_000_000;
        if (liveLabel) liveLabel.textContent = 'Final download speed';
        const ip = response.headers.get('cf-meta-ip');
        const city = response.headers.get('city') || response.headers.get('cf-meta-city');
        const country = response.headers.get('country') || response.headers.get('cf-meta-country');
        const location = [city, country].filter(Boolean).join(', ');

        speedOutput.textContent = `${speedMbps.toFixed(1)} Mbps`;
        if (statusOutput) statusOutput.textContent = 'Test complete. Measured from the 100 MB Cloudflare download.';
        const updatedElement = document.getElementById('speed-updated');
        if (updatedElement) updatedElement.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        await syncSpeedTestResult(speedMbps, ip, location);
    } catch (error) {
        console.error('The Cloudflare speed test failed.', error);
        speedOutput.textContent = 'Error';
        if (liveLabel) liveLabel.textContent = 'Test unavailable';
        if (statusOutput) {
            statusOutput.textContent = 'Speed test failed. Check your connection and try again.';
        }
        const updatedElement = document.getElementById('speed-updated');
        if (updatedElement) updatedElement.textContent = 'Test failed';
    } finally {
        if (speedDisplayInterval !== null) window.clearInterval(speedDisplayInterval);
        if (startBtn) startBtn.disabled = false;
    }
}

const startSpeedBtn = document.getElementById('start-speed-test-btn');
if (startSpeedBtn) {
    startSpeedBtn.addEventListener('click', runSmartSpeedTest);
}

async function runLatencyTest() {
    const button = document.getElementById('latency-test-btn');
    const output = document.getElementById('latency-result');
    if (!button || !output) return;

    button.disabled = true;
    output.textContent = 'Measuring response time...';
    const samples = [];

    for (let attempt = 0; attempt < 5; attempt++) {
        const startTime = performance.now();
        try {
            const response = await fetch(`./bin/1MB.bin?latency=${Date.now()}-${attempt}`, { cache: 'no-store', headers: { Range: 'bytes=0-0' } });
            if (!response.ok) throw new Error('Latency request failed');
            await response.body?.cancel();
            samples.push(performance.now() - startTime);
        } catch (error) {
            // A failed sample is omitted so one transient request does not skew the result.
        }
    }

    const packetLoss = Math.round(((5 - samples.length) / 5) * 100);
    if (samples.length) {
        const average = samples.reduce((total, value) => total + value, 0) / samples.length;
        const stability = Math.max(...samples) - Math.min(...samples);
        output.textContent = `${Math.round(average)} ms average · ${samples.length}/5 replies · ${Math.round(stability)} ms variation`;
        const details = document.getElementById('network-details');
        if (details) details.innerHTML = `<span>Packet loss <b>${packetLoss}%</b></span><span>Browser estimate <b>${navigator.connection?.downlink ? `${navigator.connection.downlink} Mbps` : 'Unavailable'}</b></span>`;
        const updatedElement = document.getElementById('latency-updated');
        if (updatedElement) updatedElement.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        output.textContent = 'Latency test unavailable. Check the connection and try again.';
        const updatedElement = document.getElementById('latency-updated');
        if (updatedElement) updatedElement.textContent = 'Test failed';
    }
    button.disabled = false;
    return { packetLoss, samples };
}

const latencyButton = document.getElementById('latency-test-btn');
if (latencyButton) latencyButton.addEventListener('click', runLatencyTest);

async function runFullNetworkTest() {
    const button = document.getElementById('full-network-test-btn');
    const output = document.getElementById('network-details');
    if (!button || !output) return;
    button.disabled = true;
    const latency = await runLatencyTest();
    output.innerHTML += '<span>Upload timing <b>Measuring...</b></span>';
    try {
        const payload = new Blob([new Uint8Array(256 * 1024)]);
        const startTime = performance.now();
        const response = await fetch('https://httpbin.org/post', { method: 'POST', body: payload, cache: 'no-store' });
        if (!response.ok) throw new Error('Upload test failed');
        const seconds = (performance.now() - startTime) / 1000;
        const uploadMbps = (payload.size * 8) / seconds / (1024 * 1024);
        output.innerHTML = `<span>Packet loss <b>${latency ? latency.packetLoss : 'n/a'}%</b></span><span>Browser estimate <b>${navigator.connection?.downlink ? `${navigator.connection.downlink} Mbps` : 'Unavailable'}</b></span><span>Upload timing <b>${uploadMbps.toFixed(1)} Mbps</b></span>`;
    } catch (error) {
        output.innerHTML = '<span>Upload timing <b>Unavailable</b></span><span>Packet loss <b>Check latency result</b></span>';
    }
    button.disabled = false;
}

const fullNetworkButton = document.getElementById('full-network-test-btn');
if (fullNetworkButton) fullNetworkButton.addEventListener('click', runFullNetworkTest);

// FoxURL My Data Breach Checker Function
async function checkEmailBreaches(userEmail) {
    const container = document.getElementById('breach-container');
    
    if (!userEmail) {
        if (container) container.innerHTML = '<div class="empty">No active email found in session. Sign in or type an email above to run a breach audit.</div>';
        return;
    }
    
    if (container) {
        container.innerHTML = `<div class="empty" id="breach-loading">Checking threat intelligence feeds for <strong>${userEmail}</strong>...</div>`;
    }

    try {
        const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(userEmail)}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch breach data.");
        }
        
        const data = await response.json();
        
        if (container) {
            const breachesList = data && data.ExposedBreaches && data.ExposedBreaches.breaches_details;
            
            if (breachesList && breachesList.length > 0) {
                container.innerHTML = '';
                
                breachesList.forEach(breach => {
                    let riskClass = 'risk-medium';
                    let riskText = 'Moderate Risk';
                    if (breach.password_risk && breach.password_risk.toLowerCase().includes('easytocrack')) {
                        riskClass = 'risk-high';
                        riskText = 'High Risk (Passwords Exposed)';
                    }

                    const breachCard = document.createElement('div');
                    breachCard.className = 'breach-card';
                    breachCard.innerHTML = `
                        <div class="breach-header">
                            <span class="breach-title">${breach.breach || 'Unknown Platform'}</span>
                            <span class="risk-badge ${riskClass}">${riskText}</span>
                        </div>
                        <div class="breach-details">
                            <span><strong>Year of Incident:</strong> ${breach.xposed_date || 'Recent / Unspecified'}</span>
                            <span><strong>Industry:</strong> ${breach.industry || 'General'}</span>
                            <span><strong>Leaked Data Types:</strong> <span style="color: var(--light);">${breach.xposed_data || 'Account credentials / metadata'}</span></span>
                            <span><strong>Details:</strong> ${breach.details || 'No additional description provided.'}</span>
                            ${breach.references ? `<span><strong>Reference Link:</strong> <a href="${breach.references}" target="_blank" rel="noopener noreferrer" style="color: var(--light); text-decoration: underline;">Official source / Advisory</a></span>` : ''}
                        </div>
                        <div class="remediation-box">
                            <strong>Recommended Action:</strong>
                            If you used a matching password on ${breach.breach}, change it immediately across other services and secure your account with Passkeys.
                        </div>
                    `;
                    container.appendChild(breachCard);
                });
            } else {
                container.innerHTML = `<div class="status" style="padding: 10px 0;">Great news! No known public data breaches found matching <strong>${userEmail}</strong>.</div>`;
            }
        }
    } catch (err) {
        if (container) container.innerHTML = '<div class="empty">Unable to complete breach scan at this moment. Please try again later.</div>';
    }
}

// Explicit event listener binding for the custom search button
const searchBtn = document.getElementById('search-email-btn');
if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const customInputEl = document.getElementById('custom-search-input');
        const customInput = customInputEl ? customInputEl.value.trim() : '';
        if (!customInput) {
            alert('Please enter a valid email address to search.');
            return;
        }
        checkEmailBreaches(customInput);
    });
}

// Initial check runs automatically using the logged-in session email (if available)
checkEmailBreaches(email);