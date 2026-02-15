(function () {

  const scriptTag = document.currentScript;
  const siteID = scriptTag.getAttribute("data-site");

  if (!siteID) {
    console.error("CatURL.js: No site ID provided.");
    return;
  }

  const signedIn = localStorage.getItem("SignedIn");

  // Redirect to the REAL login page (in /login/)
  if (!signedIn || signedIn === "false") {
    window.location.href = `https://foxurl.github.io/login/index.html?q=${siteID}`;
    return;
  }

  // Load JSON from /login/ (NOT /auth/)
  Promise.all([
    fetch("https://foxurl.github.io/login/site.json").then(r => r.json()),
    fetch("https://foxurl.github.io/login/details.json").then(r => r.json())
  ])
    .then(([sites, users]) => {

      const site = sites.find(s => String(s.ID) === String(siteID));
      if (!site) {
        document.body.innerHTML = "<h1>Invalid site configuration.</h1>";
        return;
      }

      const user = users.find(u => String(u.ID) === String(signedIn));

      if (!user) {
        localStorage.setItem("SignedIn", "false");
        window.location.href = `https://foxurl.github.io/login/index.html?q=${siteID}`;
        return;
      }

      const allowedList = site.allowed.split(",").map(id => id.trim());

      if (!allowedList.includes(user.ID)) {
        document.body.innerHTML = `
          <h1>You do not have permission to view this site.</h1>
        `;
        return;
      }

      // User is allowed — page loads normally

    })
    .catch(err => {
      console.error("CatURL.js error:", err);
      document.body.innerHTML = "<h1>Access system error.</h1>";
    });

})();
