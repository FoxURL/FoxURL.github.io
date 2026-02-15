(function () {

  // Identify the script tag that loaded this file
  const scriptTag = document.currentScript;
  const siteID = scriptTag.getAttribute("data-site");

  if (!siteID) {
    console.error("CatURL.js: No site ID provided in data-site attribute.");
    return;
  }

  // Check login status
  const signedIn = localStorage.getItem("SignedIn");

  // If not signed in → redirect instantly
  if (!signedIn || signedIn === "false") {
    window.location.href = `https://foxurl.github.io/login/index.html?q=${siteID}`;
    return;
  }

  // Load site.json + details.json from FoxURL
  Promise.all([
    fetch("https://foxurl.github.io/login/site.json").then(r => r.json()),
    fetch("https://foxurl.github.io/login/details.json").then(r => r.json())
  ])
    .then(([sites, users]) => {

      // Find the site entry
      const site = sites.find(s => String(s.ID) === String(siteID));
      if (!site) {
        document.body.innerHTML = "<h1>Invalid site configuration.</h1>";
        return;
      }

      // Find the signed‑in user
      const user = users.find(u => String(u.ID) === String(signedIn));

      // If user ID doesn't exist → force re-login
      if (!user) {
        window.location.href = `https://foxurl.github.io/login/index.html?q=${siteID}`;
        return;
      }

      // Parse allowed list
      const allowedList = site.allowed.split(",").map(id => id.trim());

      // Check if user is allowed
      if (!allowedList.includes(user.ID)) {
        // User is signed in but not allowed → block page
        document.body.innerHTML = `
          <h1>You do not have permission to view this site.</h1>
        `;
        return;
      }

      // User is allowed → do nothing, page loads normally
    })
    .catch(err => {
      console.error("CatURL.js error:", err);
      document.body.innerHTML = "<h1>Access system error.</h1>";
    });

})();
