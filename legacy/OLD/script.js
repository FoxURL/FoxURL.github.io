// script.js
// Homepage-only logic

function openFoxApp(appName, overrideUrl, overrideDisplayName) {
    const appRoutes = {
        catFeeding: {
            name: 'Cat Feeding',
            url: 'https://foxurl.github.io/apps/Cat-feeding/'
        },
        wordleSolver10: {
            name: 'Wordle Solver 10',
            url: 'https://foxurl.github.io/apps/wordle-solver-10/'
        },
        wordleSolver11: {
            name: 'Wordle Solver 11',
            url: 'https://foxurl.github.io/apps/wordle-solver-11/'
        },
        scoringApp: {
            name: 'Simple Scoring',
            url: 'https://foxurl.github.io/apps/simple-scoring-app/'
        },
        internetSpeed: {
            name: 'Internet Speed Test',
            url: 'https://foxurl.github.io/apps/internet-speed/'
        },
        login: {
            name: 'Login',
            url: 'https://foxurl.github.io/login/'
        },
        register: {
            name: 'Register',
            url: 'https://foxurl.github.io/register/'
        }
    };

    const mapped = appRoutes[appName];
    const url = (mapped && mapped.url) || overrideUrl;
    const displayName = (mapped && mapped.name) || overrideDisplayName || humanizeAppName(appName) || url;

    if (!url) {
        alert('This Fox app is not available yet.');
        return;
    }

    saveRecentApp(appName, displayName, url);
    window.location.href = url;
}

function saveRecentApp(id, displayName, url) {
    const recent = JSON.parse(localStorage.getItem('foxurlRecentApps') || '[]');
    const filtered = recent.filter(item => item.id !== id);
    filtered.unshift({ id, displayName, url, launchedAt: Date.now() });
    const latest = filtered.slice(0, 2);
    localStorage.setItem('foxurlRecentApps', JSON.stringify(latest));
}

function humanizeAppName(key) {
    if (!key) return '';
    const s = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadRecentApps() {
    const recentApps = JSON.parse(localStorage.getItem('foxurlRecentApps') || '[]');
    const container = document.getElementById('recentApps');
    if (!container) {
        return;
    }

    if (recentApps.length === 0) {
        container.innerHTML = '<p class="recent-empty">No recent apps yet. Open one to get started.</p>';
        return;
    }

    container.innerHTML = recentApps.map(item => {
        return `
            <button class="recent-button" onclick="window.location.href='${item.url}'">
                <span class="recent-name">${item.displayName}</span>
                <small>Last opened</small>
            </button>
        `;
    }).join('');
}

window.addEventListener('DOMContentLoaded', loadRecentApps);
