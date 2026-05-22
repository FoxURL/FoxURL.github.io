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

/* STEP 1 — EMAIL */
document.getElementById("emailStep").addEventListener("submit", async (e) => {
    e.preventDefault();
    disableAll(true);

    const email = document.getElementById("email").value.trim();
    const encryptedEmail = foxEncrypt(email);

    const users = await getUsers();
    const user = users.find(u => u.email === encryptedEmail);

    if (!user) {
        disableAll(false);
        alert("No account found with that email");
        return;
    }

    document.getElementById("emailStep").style.display = "none";
    document.getElementById("passwordStep").style.display = "block";
    document.getElementById("emailDisplay").innerText = email;

    disableAll(false);
});

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

/* STEP 2 — PASSWORD */
document.getElementById("passwordStep").addEventListener("submit", async (e) => {
    e.preventDefault();
    disableAll(true);

    const email = document.getElementById("emailDisplay").innerText;
    const encryptedEmail = foxEncrypt(email);
    const password = document.getElementById("password").value;
    const encryptedPassword = foxEncrypt(password);

    const users = await getUsers();
    const user = users.find(u => u.email === encryptedEmail);

    if (user && user.password === encryptedPassword) {
        localStorage.setItem("foxurl_user", email);
        window.location.href = "../dashboard/";
    } else {
        disableAll(false);
        alert("Incorrect password");
    }
});
