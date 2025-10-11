// main.js — FoxURL global script
// Loads shared styles, sets favicon and iOS touch icon, and adds footer to every page

// 1️⃣ Load the shared CSS file (style.css) from main branch
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://FoxURL.github.io/style.css"; // full GitHub Pages URL
document.head.appendChild(link);

// 2️⃣ Set the favicon (logo.png) from the main branch
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/png";
favicon.href = "https://FoxURL.github.io/logo.png";
document.head.appendChild(favicon);

// 3️⃣ Set the Apple touch icon (iPhone Home Screen icon)
const appleIcon = document.createElement("link");
appleIcon.rel = "apple-touch-icon";
appleIcon.href = "https://FoxURL.github.io/logo.png";
document.head.appendChild(appleIcon);

// Optional: iOS full-screen mode meta tags
const appleMetaCapable = document.createElement("meta");
appleMetaCapable.name = "apple-mobile-web-app-capable";
appleMetaCapable.content = "yes";
document.head.appendChild(appleMetaCapable);

const appleMetaStatus = document.createElement("meta");
appleMetaStatus.name = "apple-mobile-web-app-status-bar-style";
appleMetaStatus.content = "black-translucent";
document.head.appendChild(appleMetaStatus);

// 4️⃣ When the page is ready, add a FoxURL footer
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
