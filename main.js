// main.js — FoxURL global script
// Loads shared styles, sets favicon, and adds footer to every page

// 1️⃣ Load the shared CSS file (style.css) from main branch
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://FoxURL.github.io/style.css"; // full GitHub Pages URL
document.head.appendChild(link);

// 2️⃣ Set the favicon (logo.png) from the main branch
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = "https://FoxURL.github.io/logo.png"; // path to your favicon
document.head.appendChild(favicon);

// 3️⃣ When the page is ready, add a FoxURL footer
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <hr style="border: none; border-top: 2px solid orange; width: 60%; margin: 40px auto;">
    <p style="
      font-family: sans-serif;
      color: black;
      text-align: center;
      font-size: 16px;
      margin-bottom: 30px;
    ">
      🦊 FoxURL © 2025 – innovate your connection
    </p>
  `;
  document.body.appendChild(footer);
});
