// FoxURL Auth Gate v1.0

(async function () {
  const session = localStorage.getItem("CAT_AUTH");

  if (!session) {
    lock();
    return;
  }

  try {
    const auth = JSON.parse(session);

    const res = await fetch("https://foxurl.github.io/security/users.json");
    const data = await res.json();

    const valid = data.users.find(u => u.username === auth.user);

    if (!valid) {
      lock();
    }
  } catch {
    lock();
  }

  function lock() {
    document.body.innerHTML = `
      <div style="
        background:#0e0f14;
        color:white;
        font-family:system-ui;
        height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
      ">
        <div>
          <h2>Private site</h2>
          <p>This site is restricted</p>
          <a href="https://foxurl.github.io/auth/index.html?loopback=${encodeURIComponent(location.href)}"
             style="
               display:inline-block;
               margin-top:12px;
               padding:10px 16px;
               background:#6b8cff;
               color:white;
               border-radius:10px;
               text-decoration:none;
               font-weight:bold;
             ">
            Sign in
          </a>
        </div>
      </div>
    `;
  }
})();
