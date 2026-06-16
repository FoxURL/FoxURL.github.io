// script.js
// Homepage-only logic

function openFoxApp(appName) {
    const appRoutes = {
        catFeeding: {
            name: 'Cat Feeding',
            url: 'https://foxurl.github.io/apps/Cat-feeding/'
        },
        wordleSolver: {
            name: 'Wordle Solver',
            url: 'https://foxurl.github.io/apps/wordle-solver-10/'
        },
        scoringApp: {
            name: 'Simple Scoring',
            url: 'https://foxurl.github.io/apps/simple-scoring-app/'
        }
    };

    const app = appRoutes[appName];
    if (!app) {
        alert('This Fox app is not available yet.');
        return;
    }

    saveRecentApp(appName, app.name, app.url);
    window.location.href = app.url;
}

function saveRecentApp(id, displayName, url) {
    const recent = JSON.parse(localStorage.getItem('foxurlRecentApps') || '[]');
    const filtered = recent.filter(item => item.id !== id);
    filtered.unshift({ id, displayName, url, launchedAt: Date.now() });
    const latest = filtered.slice(0, 2);
    localStorage.setItem('foxurlRecentApps', JSON.stringify(latest));
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
