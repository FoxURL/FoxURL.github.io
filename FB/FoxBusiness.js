// This changes the title of the host page
document.title = "Dynamic Fox Business Title";

// This injects content into a specific element on the host page
document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("fox-container");
    if (container) {
        container.innerHTML = "<h1>Content loaded from FoxBusiness.js!</h1>";
    }
});