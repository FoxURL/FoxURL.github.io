// script.js
// Homepage-only logic

function openFoxApp(appName) {
    const apps = {
        FoxLINK: "https://foxlink.github.io",
        FoxID: "https://foxid.github.io",
        FoxCloud: "https://foxcloud.github.io"
    };

    if (apps[appName]) {
        window.location.href = apps[appName];
    } else {
        alert("This Fox app is not available yet.");
    }
}
