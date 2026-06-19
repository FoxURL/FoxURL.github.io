document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();

  // Store typed values in JS variables
  const emailInput = document.getElementById("email").value.trim();
  const passwordInput = document.getElementById("password").value.trim();

  if (!emailInput || !passwordInput) {
    alert("Please enter both email and password.");
    return;
  }

  // Cache buster
  const url = `https://foxurl.github.io/api.json?cb=${Date.now()}`;

  let data = null;

  try {
    const res = await fetch(url);
    data = await res.json();
  } catch (err) {
    alert("Could not fetch account data.");
    return;
  }

  const resultBox = document.getElementById("result");
  resultBox.style.display = "block";

  resultBox.innerHTML = `
    <h3>Account Data Loaded</h3>

    <p><strong>Your email variable:</strong> ${emailInput}</p>
    <p><strong>Your password variable:</strong> ${passwordInput}</p>

    <p><strong>JSON returned:</strong></p>
    <pre style="background:#f1f3f4; padding:10px; border-radius:6px; max-height:300px; overflow:auto;">
${JSON.stringify(data, null, 2)}
    </pre>

    <p>
      <strong>Now manually find your token</strong> by locating the object in the JSON
      that matches your email and password.
    </p>

    <button onclick="window.location.href='https://foxurl.github.io'">Home</button>
  `;
});
