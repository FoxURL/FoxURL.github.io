// --- GLOBAL STATE ---
let currentSite = null;
window.allUsers = null;
const creatures = [];

if (localStorage.getItem("SignedIn") === null) {
  localStorage.setItem("SignedIn", "false");
}

function showError(msg) {
  const box = document.getElementById("errorBox");
  if (box) box.textContent = msg;
}

document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("toggleBtn");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("loginForm");

  const siteNameHeading = document.getElementById("siteNameHeading");
  const siteSub = document.getElementById("siteSub");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeSubtitle = document.getElementById("welcomeSubtitle");

  document.querySelectorAll(".creature").forEach(c => creatures.push(c));

  initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle);

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.classList.toggle("closed", isPassword);

    if (isPassword) {
      creatures.forEach(creature => {
        creature.classList.add("shy", "mouth-flat");
        creature.classList.remove("mouth-squiggle");
      });

      setTimeout(() => {
        creatures.forEach(creature => {
          creature.classList.remove("shy", "mouth-flat");
        });
      }, 1200);
    } else {
      creatures.forEach(creature => {
        creature.classList.remove("shy", "mouth-flat", "mouth-squiggle");
      });
    }
  });

  function updateButtonState() {
    const filled =
      usernameInput.value.trim() !== "" &&
      passwordInput.value.trim() !== "";
    submitBtn.disabled = !filled;
  }
  usernameInput.addEventListener("input", updateButtonState);
  passwordInput.addEventListener("input", updateButtonState);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value.trim();

    if (!currentSite) {
      showError("Site not found.");
      invalidAnimation();
      return;
    }

    const users = window.allUsers;
    if (!users) {
      showError("User database not loaded.");
      invalidAnimation();
      return;
    }

    const foundUser = users.find(u =>
      u.username === userVal && u.password === passVal
    );

    if (!foundUser) {
      showError("Incorrect username or password.");
      invalidAnimation();
      return;
    }

    const allowedList = currentSite.allowed.split(",").map(id => id.trim());

    if (!allowedList.includes(foundUser.ID)) {
      showError("You are not allowed to sign in to this site.");
      invalidAnimation();
      return;
    }

    localStorage.setItem("SignedIn", foundUser.ID);
    window.location.href = currentSite.URL;
  });

  initCreatures();
  initCursorTracking();
  initBlinking();
  initIdleStretch();
  initTypingReactions(usernameInput, passwordInput);
});

// --- JSON LOADING ---
async function initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle) {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("q");

    const [sites, usersData] = await Promise.all([
      fetch("site.json").then(r => r.json()),
      fetch("details.json").then(r => r.json())
    ]);

    if (!Array.isArray(sites) || !Array.isArray(usersData)) {
      showError("Login data is not formatted correctly.");
      return;
    }

    const site = sites.find(s => String(s.ID) === String(source));
    if (!site) {
      showError("Invalid site ID.");
      return;
    }

    currentSite = site;
    window.allUsers = usersData;

    siteNameHeading.textContent = `Sign in with FoxURL`;
    siteSub.textContent = `to continue to ${site.name || site.URL}`;

    welcomeTitle.textContent = `Welcome back`;
    welcomeSubtitle.textContent = "";

  } catch (err) {
    showError("Failed to load login data.");
    console.error(err);
  }
}

// --- INVALID ANIMATION ---
function invalidAnimation() {
  creatures.forEach(creature => {
    creature.classList.add("invalid", "mouth-squiggle");
  });

  setTimeout(() => {
    creatures.forEach(creature => {
      creature.classList.remove("invalid", "mouth-squiggle");
    });
  }, 600);
}
