// FoxURL ↔ CatURL Support Bridge + Auth Gate
// Version 1.3

(function () {
  // Respect opt-out
  if (window.CAT_DISABLE === true) return;

  async function checkAuth() {
    try {
      const session = localStorage.getItem("CAT_AUTH");
      if (!session) throw "No session";

      const auth = JSON.parse(session);

      // Fetch allowed users
      const res = await fetch("https://foxurl.github.io/security/users.json");
      const data = await res.json();

      // Check if username exists
      const allowed = data.users.find(u => u.username === auth.user);
      if (!allowed) throw "Not allowed";

      // Authorized → continue
      return true;
    } catch {
      // Not authorized → redirect to login
      const loopback = encodeURIComponent(location.href);
      location.href = `https://foxurl.github.io/auth/index.html?loopback=${loopback}`;
    }
  }

  // Run auth check first
  checkAuth().then(() => {
    // DOM ready
    document.addEventListener("DOMContentLoaded", () => {
      // --- Existing footer code ---
      const footer = document.createElement("div");
      footer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-family: system-ui, sans-serif;
        background: rgba(0, 0, 0, 0.75);
        color: #ffffff;
        cursor: pointer;
        z-index: 9999;
      `;
      footer.onclick = () => window.open("https://foxurl.github.io", "_blank");

      const logo = document.createElement("img");
      logo.src = "https://foxurl.github.io/logo.png";
      logo.alt = "FoxURL logo";
      logo.style.height = "16px";
      logo.style.width = "auto";

      const text = document.createElement("span");
      text.textContent = "website brought to you by FoxURL";

      footer.appendChild(logo);
      footer.appendChild(text);

      document.body.appendChild(footer);
    });
  });
})();
