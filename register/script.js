let FOX_API = null;

// Load API config
async function loadConfig() {
    if (FOX_API) return FOX_API;
    const res = await fetch("/api.json");
    FOX_API = await res.json();
    return FOX_API;
}

// Register handler
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const encryptedEmail = foxEncrypt(email);
    const encryptedPassword = foxEncrypt(password);

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
        alert("Account created successfully");
        window.location.href = "../login/";
    } else {
        alert("Error creating account");
    }
});
