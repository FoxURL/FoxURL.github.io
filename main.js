// main.js
// FoxURL-only shared logic

console.log("FoxURL main.js loaded");

// Insert favicon on all FoxURL pages
document.addEventListener("DOMContentLoaded", () => {
    const existingIcon = document.querySelector("link[rel='icon']");

    if (!existingIcon) {
        const icon = document.createElement("link");
        icon.rel = "icon";
        icon.type = "image/png";
        icon.href = "assets/logo/circular.png";
        document.head.appendChild(icon);
    }

    // Warn if page doesn't include the standard header
    if (!document.querySelector(".topbar")) {
        console.warn("This FoxURL page does not include the standard header.");
    }
});
