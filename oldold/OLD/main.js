// main.js
// FoxURL-only shared logic

console.log("FoxURL main.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    // Remove any existing favicons
    document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach(e => e.remove());

    // Add favicon using the new centered circular file
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.href = "assets/logo/favicon.png";
    document.head.appendChild(icon);

    // Header check
    if (!document.querySelector(".topbar")) {
        console.warn("This FoxURL page does not include the standard header.");
    }
});
