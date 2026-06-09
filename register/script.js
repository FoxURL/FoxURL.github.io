let currentStep = 0;
let users = {};

const stepsContainer = document.getElementById("stepsContainer");
const subtitleEl = document.getElementById("subtitle");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

// Load existing users for username/FoxMAIL uniqueness checks
fetch("https://foxurl.github.io/api/users.json")
    .then(res => res.json())
    .then(data => {
        users = data || {};
    })
    .catch(() => {
        users = {};
    });

function goBackToLogin() {
    window.location.href = "index.html";
}

function updateSubtitle() {
    const subtitles = [
        "Enter your name",
        "Enter your existing email",
        "Choose a username and FoxMAIL",
        "Create a password"
    ];
    subtitleEl.textContent = subtitles[currentStep];
}

function updateButtons() {
    backBtn.disabled = currentStep === 0;
    nextBtn.textContent = currentStep === 3 ? "Register" : "Next";
}

function showStep() {
    stepsContainer.style.transform = `translateX(-${currentStep * 100}%)`;
    updateSubtitle();
    updateButtons();
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep();
    }
}

async function nextStep() {
    // Validate current step before moving on / registering
    if (!(await validateStep(currentStep))) return;

    if (currentStep === 3) {
        // Final step → register
        registerAccount();
    } else {
        currentStep++;
        showStep();
    }
}

async function validateStep(step) {
    if (step === 0) {
        const first = document.getElementById("firstName").value.trim();
        const last = document.getElementById("lastName").value.trim();
        if (!first || !last) {
            alert("Please enter both first and last name.");
            return false;
        }
    }

    if (step === 1) {
        const email = document.getElementById("existingEmail").value.trim();
        if (!email || !email.includes("@")) {
            alert("Please enter a valid email address.");
            return false;
        }
    }

    if (step === 2) {
        const username = document.getElementById("reg_username").value.trim();
        const foxmailUser = document.getElementById("foxmailUser").value.trim();
        if (!username || !foxmailUser) {
            alert("Please enter both a username and a FoxMAIL username.");
            return false;
        }

        // Check username uniqueness
        if (isUsernameTaken(username)) {
            alert("That username is already taken. Please choose another.");
            return false;
        }

        // Check FoxMAIL uniqueness
        const foxmailFull = foxmailUser + "@FoxURL-mail.github.io";
        if (isFoxmailTaken(foxmailFull)) {
            alert("That FoxMAIL address is already taken. Please choose another.");
            return false;
        }
    }

    if (step === 3) {
        const pass = document.getElementById("reg_password").value;
        const confirm = document.getElementById("reg_password_confirm").value;

        if (!pass || !confirm) {
            alert("Please enter and confirm your password.");
            return false;
        }
        if (pass !== confirm) {
            alert("Passwords do not match.");
            return false;
        }
    }

    return true;
}

function isUsernameTaken(username) {
    // Check keys and signIN fields
    if (users[username]) return true;
    for (const key in users) {
        const u = users[key];
        if (u && (u.signIN === username || key === username)) {
            return true;
        }
    }
    return false;
}

function isFoxmailTaken(foxmailFull) {
    for (const key in users) {
        const u = users[key];
        if (u && u.FoxMAIL && u.FoxMAIL.toLowerCase() === foxmailFull.toLowerCase()) {
            return true;
        }
    }
    return false;
}

document.getElementById("showPassword").addEventListener("change", (e) => {
    const type = e.target.checked ? "text" : "password";
    document.getElementById("reg_password").type = type;
    document.getElementById("reg_password_confirm").type = type;
});

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function registerAccount() {
    const first = document.getElementById("firstName").value.trim();
    const last = document.getElementById("lastName").value.trim();
    const fullName = `${first} ${last}`;

    const email = document.getElementById("existingEmail").value.trim();
    const username = document.getElementById("reg_username").value.trim();
    const foxmailUser = document.getElementById("foxmailUser").value.trim();
    const foxmailFull = foxmailUser + "@FoxURL-mail.github.io";

    const password = document.getElementById("reg_password").value;
    const hashedPassword = await sha256(password);
    const token = crypto.randomUUID();

    const formURL =
        "https://docs.google.com/forms/d/e/1FAIpQLSeOLt8bJhVslT43K9QMJdDJEyK1nYCXe0hlLOITKRod4IzaAQ/formResponse" +
        "?entry.871476431=" + encodeURIComponent(fullName) +
        "&entry.863514196=" + encodeURIComponent(email) +
        "&entry.305740423=" + encodeURIComponent(foxmailFull) +
        "&entry.1518675919=" + encodeURIComponent(username) +
        "&entry.1862643087=" + encodeURIComponent(hashedPassword) +
        "&entry.699238993=" + encodeURIComponent(token);

    fetch(formURL, { method: "POST", mode: "no-cors" });

    alert("Account created! Your registration has been sent.");
    window.location.href = "index.html";
}

// Initialize UI
updateSubtitle();
updateButtons();
showStep();
