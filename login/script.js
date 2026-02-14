// --- GLOBAL STATE ---
let currentSite = null;
let currentUser = null;
const creatures = [];

// Ensure SignedIn exists
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
  const quickInfo = document.getElementById("quickInfo");

  document.querySelectorAll(".creature").forEach(c => creatures.push(c));

  initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle, quickInfo);

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

  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener("blur", () => {
      if (input.value.trim() === "") {
        input.classList.add("error");
      } else {
        input.classList.remove("error");
      }
    });

    input.addEventListener("input", () => {
      if (input.value.trim() !== "") {
        input.classList.remove("error");
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value.trim();

    if (!currentUser || !currentSite) {
      showError("Site or user not found.");
      invalidAnimation();
      return;
    }

    const userMatch = userVal === currentUser.username;
    const passMatch = passVal === currentUser.password;

    if (!userMatch || !passMatch) {
      showError("Incorrect username or password.");
      invalidAnimation();
      return;
    }

    localStorage.setItem("SignedIn", currentUser.ID);
    window.location.href = currentSite.URL;
  });

  initCreatures();
  initCursorTracking();
  initBlinking();
  initIdleStretch();
  initTypingReactions(usernameInput, passwordInput);
});

// --- JSON LOADING ---
async function initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle, quickInfo) {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("q");

    const [sites, users] = await Promise.all([
      fetch("site.json").then(r => r.json()),
      fetch("details.json").then(r => r.json())
    ]);

    if (!Array.isArray(sites) || !Array.isArray(users)) {
      showError("Login data is not formatted correctly.");
      return;
    }

    const site = sites.find(s => String(s.ID) === String(source));
    if (!site) {
      showError("Invalid site ID.");
      return;
    }

    const ownerUser = users.find(u => String(u.ID) === String(site.owner));
    if (!ownerUser) {
      showError("Owner user not found.");
      return;
    }

    currentSite = site;
    currentUser = ownerUser;

    siteNameHeading.textContent = `Sign in with FoxURL`;
    siteSub.textContent = `to continue to ${site.name || site.URL || "this site"}`;

    welcomeTitle.textContent = `Welcome back`;
    welcomeSubtitle.textContent = ownerUser.nickname
      ? `Signing in as ${ownerUser.nickname}`
      : `Signing in`;

    if (quickInfo) {
      quickInfo.textContent = `Account: ${ownerUser.username} (${ownerUser.nickname})`;
    }

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

// --- CREATURE ENGINE ---

function initCreatures() {
  creatures.forEach((creature, index) => {
    const delay = 150 * index;
    setTimeout(() => {
      creature.style.animation = "creatureEnter 0.9s ease-out forwards";
    }, delay);
  });
}

function initCursorTracking() {
  document.addEventListener("mousemove", (e) => {
    creatures.forEach(creature => {
      const type = creature.dataset.type;
      const body = creature.querySelector(".creature-body");
      const rect = creature.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx);
      const dy = (e.clientY - cy);

      let approachFactor = 90;
      if (type === "small") approachFactor = 70;
      if (type === "wide") approachFactor = 110;

      const moveX = dx / approachFactor;
      const moveY = dy / approachFactor;

      let leanX = dx / 80;
      let stretchY = 1 - Math.min(Math.max(dy * 0.0008, -0.08), 0.08);
      let stretchX = 1 + Math.min(Math.max(dy * 0.0008, -0.08), 0.08);

      if (type === "tall") {
        stretchY *= 1.08;
        stretchX *= 0.96;
      }
      if (type === "wide") {
        stretchX *= 1.06;
        stretchY *= 0.97;
      }
      if (type === "small") {
        stretchX *= 1.02;
        stretchY *= 1.02;
      }

      body.style.transform =
        `translate(${moveX + leanX}px, ${moveY * 1.1}px) scale(${stretchX}, ${stretchY})`;

      const eyes = creature.querySelectorAll(".eye");
      eyes.forEach(eye => {
        const pupil = eye.querySelector(".pupil");
        const er = eye.getBoundingClientRect();
        const ex = er.left + er.width / 2;
        const ey = er.top + er.height / 2;

        let px = (e.clientX - ex) / 20;
        let py = (e.clientY - ey) / 20;

        const limit = 6;
        px = Math.max(-limit, Math.min(limit, px));
        py = Math.max(-limit, Math.min(limit, py));

        pupil.style.transform = `translate(${px}px, ${py}px)`;
      });
    });
  });
}

function scheduleBlink(eye, min = 3000, max = 8000) {
  const eyelid = eye.querySelector(".eyelid");
  if (!eyelid) return;

  const delay = Math.random() * (max - min) + min;
  setTimeout(() => {
    eye.classList.add("blinking");
    setTimeout(() => {
      eye.classList.remove("blinking");
      scheduleBlink(eye, min, max);
    }, 140);
  }, delay);
}

function initBlinking() {
  document.querySelectorAll(".eye").forEach(eye => {
    const parentCreature = eye.closest(".creature");
    const type = parentCreature.dataset.type;
    if (type === "small") {
      scheduleBlink(eye, 1500, 4000);
    } else if (type === "tall") {
      scheduleBlink(eye, 4000, 9000);
    } else {
      scheduleBlink(eye, 2500, 7000);
    }
  });
}

function initIdleStretch() {
  creatures.forEach(creature => {
    const body = creature.querySelector(".creature-body");

    function randomStretch() {
      const sx = 1 + (Math.random() - 0.5) * 0.06;
      const sy = 1 + (Math.random() - 0.5) * 0.06;

      body.style.transition = "transform 0.4s ease-in-out";
      const current = body.style.transform || "";
      body.style.transform = current + ` scale(${sx}, ${sy})`;

      setTimeout(() => {
        body.style.transition = "";
      }, 420);

      const delay = 1200 + Math.random() * 2000;
      setTimeout(randomStretch, delay);
    }

    setTimeout(randomStretch, 800 + Math.random() * 800);
  });
}

function initTypingReactions(usernameInput, passwordInput) {
  function creaturesReact(type) {
    creatures.forEach(creature => {
      const cType = creature.dataset.type;
      const body = creature.querySelector(".creature-body");

      if (type === "type") {
        if (cType === "small") {
          body.style.transition = "transform 0.08s ease-out";
          body.style.transform += " translateY(-4px)";
          setTimeout(() => {
            body.style.transform = body.style.transform.replace(" translateY(-4px)", "");
          }, 120);
        } else if (cType === "wide") {
          body.style.transition = "transform 0.12s ease-out";
          body.style.transform += " scale(1.02,0.98)";
          setTimeout(() => {
            body.style.transform = body.style.transform.replace(" scale(1.02,0.98)", "");
          }, 140);
        } else if (cType === "tall") {
          body.style.transition = "transform 0.12s ease-out";
          body.style.transform += " scale(0.99,1.02)";
          setTimeout(() => {
            body.style.transform = body.style.transform.replace(" scale(0.99,1.02)", "");
          }, 140);
        }
      }

      if (type === "focus") {
        body.style.transition = "transform 0.18s ease-out";
        body.style.transform += " translateY(-4px)";
        setTimeout(() => {
          body.style.transform = body.style.transform.replace(" translateY(-4px)", "");
        }, 180);
      }
    });
  }

  document.addEventListener("keydown", () => {
    creaturesReact("type");
  });

  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener("focus", () => {
      creaturesReact("focus");
    });
  });
}
