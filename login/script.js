let FOX_API = null;

// Load API config
async function loadConfig() {
    if (FOX_API) return FOX_API;
    const res = await fetch("/api.json");
    FOX_API = await res.json();
    return FOX_API;
}

// Fetch and decrypt all users
async function getUsers() {
    const config = await loadConfig();
    const csvUrl = config.services.foxcloud.sheet_url;

    const res = await fetch(csvUrl);
    const text = await res.text();

    const rows = text.split("\n").slice(1);

    const users = rows
        .map(r => r.split(","))
        .filter(c => c.length >= 2)
        .map(c => ({
            email: foxDecrypt(c[0].trim()),
            password: foxDecrypt(c[1].trim())
        }));

    return users;
}

// Login handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const encryptedPassword = foxEncrypt(password);

    const users = await getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        alert("No account found with that email");
        return;
    }

    if (user.password === encryptedPassword) {
        alert("Login successful");
        localStorage.setItem("foxurl_user", email);
        window.location.href = "../dashboard/";
    } else {
        alert("Incorrect password");
    }
});
