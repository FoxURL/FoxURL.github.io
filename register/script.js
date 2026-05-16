/* CSV PARSER — REQUIRED */
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && line[i + 1] === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/* CLEAN CSV VALUES (fixes Google Sheets escaping) */
function cleanCSVValue(v) {
    return v
        .trim()
        .replace(/^"|"$/g, "")   // remove wrapping quotes
        .replace(/""/g, '"');    // unescape double quotes
}

let FOX_API = null;

/* Load API config */
async function loadConfig() {
    if (FOX_API) return FOX_API;
    const res = await fetch("/api.json");
    FOX_API = await res.json();
    return FOX_API;
}

/* Parse + return encrypted users */
async function getUsers() {
    const config = await loadConfig();
    const csvUrl = config.services.foxcloud.sheet_url;

    const res = await fetch(csvUrl);
    const text = await res.text();

    const rows = text.split("\n").slice(1);

    return rows
        .map(r => parseCSVLine(r))
        .filter(c => c.length >= 2 && c[0].trim() !== "" && c[1].trim() !== "")
        .map(c => ({
            encryptedEmail: cleanCSVValue(c[0]),
            encryptedPassword: cleanCSVValue(c[1])
        }));
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

    if (users.find(u => u.encryptedEmail === encryptedEmail)) {
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
