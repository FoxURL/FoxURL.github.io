/* Load config */
let FOX_API = null;

async function loadConfig() {
    if (FOX_API) return FOX_API;
    const res = await fetch("/api.json");
    FOX_API = await res.json();
    return FOX_API;
}

/* Fetch users from JSON API */
async function getUsers() {
    const config = await loadConfig();
    const apiUrl = config.services.foxapi.endpoint;

    const res = await fetch(apiUrl);
    const data = await res.json();

    return data.users || [];
}

/* Disable UI */
function disableAll(disabled) {
    document.querySelectorAll("input, button").forEach(el => el.disabled = disabled);
}

/* Password strength meter */
document.getElementById("password").addEventListener("input", () => {
    const val = document.getElementById("password").value;
    const bar = document.getElementById("strength");

    bar.className = "strength";

    if (val.length > 8) bar.classList.add("good");
    if (val.length > 12 && /[A-Z]/.test(val) && /\d/.test(val)) {
        bar.classList.add("strong");
    }
});

/* Register */
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    disableAll(true);

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const encryptedEmail = foxEncrypt(email);
    const encryptedPassword = foxEncrypt(password);

    const users = await getUsers();

    if (users.find(u => u.email === encryptedEmail)) {
        disableAll(false);
        alert("Email already exists — log in?");
        return;
    }

    const config = await loadConfig();
    const apiUrl = config.services.foxapi.endpoint;

    const res = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
            email: encryptedEmail,
            password: encryptedPassword
        })
    });

    const data = await res.json();

    if (data.success) {
        alert("Account created!");
        window.location.href = "../login/";
    } else {
        disableAll(false);
        alert("Error creating account");
    }
});
