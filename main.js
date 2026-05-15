// main.js
// FoxURL-only shared logic

console.log("FoxURL main.js loaded");

// Auto-detect if the page is missing the standard header
document.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector(".topbar")) {
        console.warn("This FoxURL page does not include the standard header.");
    }
});
