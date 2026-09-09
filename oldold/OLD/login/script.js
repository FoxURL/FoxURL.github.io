function updateProgress(percent, text) {
  const progressBar = document.getElementById("progress-bar");
  const fill = progressBar.querySelector(".progress-fill");
  const textEl = progressBar.querySelector(".progress-text");
  fill.style.width = percent + "%";
  textEl.textContent = text;
}

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  console.log("[FoxURL Login] Starting login process...");
  console.log("[FoxURL Login] Email input:", emailInput);
  console.log("[FoxURL Login] Password input:", passwordInput);

  if (!emailInput || !passwordInput) {
    alert("Please enter both email and password.");
    console.error("[FoxURL Login] Validation failed: Missing email or password");
    return;
  }

  const progressBar = document.getElementById("progress-bar");
  const resultBox = document.getElementById("result");
  progressBar.style.display = "block";
  resultBox.style.display = "none";

  // Step 1: Fetch api.json
  updateProgress(25, "Loading configuration...");
  let apiData;
  try {
    const res = await fetch(`https://foxurl.github.io/api.json?cb=${Date.now()}`);
    apiData = await res.json();
    console.log("[FoxURL Login] API data loaded:", apiData);
  } catch (err) {
    console.error("[FoxURL Login] Error loading api.json:", err);
    resultBox.innerHTML = `<h3 style="color: #d33b27;">✗ Error</h3><p>Could not load api.json</p><button onclick="location.reload()">Try Again</button>`;
    resultBox.style.display = "block";
    progressBar.style.display = "none";
    return;
  }

  // Step 2: Extract the accounts URL
  updateProgress(50, "Fetching accounts...");
  const accountsURL = apiData.AccountsReadGet;
  console.log("[FoxURL Login] Accounts URL:", accountsURL);

  // Step 3: Fetch the accounts list
  let accounts;
  try {
    const res = await fetch(`${accountsURL}?cb=${Date.now()}`);
    accounts = await res.json();
    console.log("[FoxURL Login] Accounts fetched. Total count:", accounts.length);
    console.log("[FoxURL Login] Full accounts data:", accounts);
  } catch (err) {
    console.error("[FoxURL Login] Error loading accounts:", err);
    resultBox.innerHTML = `<h3 style="color: #d33b27;">✗ Error</h3><p>Could not load accounts list</p><button onclick="location.reload()">Try Again</button>`;
    resultBox.style.display = "block";
    progressBar.style.display = "none";
    return;
  }

  // Step 4: Find matching account
  updateProgress(75, "Checking credentials...");
  console.log("[FoxURL Login] Searching for account matching:");
  console.log("[FoxURL Login]   Email:", emailInput, "| Type:", typeof emailInput);
  console.log("[FoxURL Login]   Password:", passwordInput, "| Type:", typeof passwordInput);

  const matchingAccount = accounts.find(account => {
    const emailMatch = account.email === emailInput;
    const passwordMatch = account.password === passwordInput;
    if (emailMatch && passwordMatch) {
      console.log("[FoxURL Login] ✓ MATCH FOUND:", account.email, account.password);
    }
    return emailMatch && passwordMatch;
  });

  console.log("[FoxURL Login] Matching account result:", matchingAccount);
  if (!matchingAccount) {
    console.warn("[FoxURL Login] No matching account found. Checking for partial matches...");
    accounts.forEach((acc, idx) => {
      console.log(`[FoxURL Login] Account ${idx}:`, {
        email: acc.email,
        password: acc.password,
        emailMatches: acc.email === emailInput,
        passwordMatches: acc.password === passwordInput
      });
    });
  }

  // Step 5: Display result
  updateProgress(100, "Complete");
  progressBar.style.display = "none";
  resultBox.style.display = "block";

  if (matchingAccount) {
    console.log("[FoxURL Login] ✓ LOGIN SUCCESSFUL");
    console.log("[FoxURL Login] Token:", matchingAccount.token);

    // Set the browser cookie
    document.cookie = `FoxURLloginToken=${matchingAccount.token}; path=/; max-age=${60 * 60 * 24 * 30}`;
    console.log("[FoxURL Login] Cookie set: FoxURLloginToken");

    // Hide the login form card
    const cardWrapper = document.querySelector(".card-wrapper");
    cardWrapper.style.display = "none";

    // Show success message in the result box with full page display
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; text-align: center;">
        <h1 style="color: #1a73e8; font-size: 48px; margin-bottom: 10px;">✓ Logged In</h1>
        <p style="font-size: 18px; color: #5f6368; margin-bottom: 30px;">Welcome, ${matchingAccount.first} ${matchingAccount.second}!</p>
        <button onclick="window.location.href='https://foxurl.github.io'" style="background: #1a73e8; color: white; border: none; padding: 12px 28px; border-radius: 4px; font-size: 16px; cursor: pointer; margin-bottom: 20px;">Go to Home</button>
        <p style="font-size: 12px; color: #999;">Redirecting in 3 seconds...</p>
      </div>
    `;

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "https://foxurl.github.io";
    }, 3000);
  } else {
    console.error("[FoxURL Login] ✗ LOGIN FAILED - No matching account found");
    resultBox.innerHTML = `
      <h3 style="color: #d33b27;">✗ Login Failed</h3>
      <p><strong>No account found</strong> matching the provided email and password.</p>
      <p>Please check your credentials and try again.</p>
      <p style="font-size:12px; color:#999;">Check the browser console (F12) for debugging details.</p>
      <button onclick="location.reload()">Try Again</button>
    `;
  }
});
