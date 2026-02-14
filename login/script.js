// --- GLOBAL STATE ---
let currentSite = null;
let currentUser = null;
const creatures = [];

// Ensure SignedIn exists
if (localStorage.getItem("SignedIn") === null) {
  localStorage.setItem("SignedIn", "false");
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

  // Collect creatures
  document.querySelectorAll(".creature").forEach(c => creatures.push(c));

  // Load site + user from JSON based on ?source=
  initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle);

  // Toggle password visibility + shy reaction
  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.classList.toggle("closed", isPassword);

    if (isPassword) {
      // Going from hidden → visible: slimes get shy
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
      // Back to hidden: restore smile
      creatures.forEach(creature => {
        creature.classList.remove("shy", "mouth-flat", "mouth-squiggle");
      });
    }
  });

  // Enable button only when both fields filled
  function updateButtonState() {
    const filled =
      usernameInput.value.trim() !== "" &&
      passwordInput.value.trim() !== "";
    submitBtn.disabled = !filled;
  }
  usernameInput.addEventListener("input", updateButtonState);
  passwordInput.addEventListener("input", updateButtonState);

  // Custom red error highlight on empty required fields
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

  // Handle submit: exact match required
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value.trim();

    if (!currentUser || !currentSite) {
      invalidAnimation(usernameInput, passwordInput);
      return;
    }

    const userMatch = userVal === currentUser.username;
    const passMatch = passVal === currentUser.password;

    if (!userMatch || !passMatch) {
      invalidAnimation(usernameInput, passwordInput);
      return;
    }

    // Success
    localStorage.setItem("SignedIn", currentUser.ID);
    window.location.href = currentSite.URL;
  });

  // Creature engine
  initCreatures();
  initCursorTracking();
  initBlinking();
  initIdleStretch();
  initTypingReactions(usernameInput, passwordInput);
});

// --- JSON LOADING & SITE/USER RESOLUTION ---
async function initSiteAndUser(siteNameHeading, siteSub, welcomeTitle, welcomeSubtitle) {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source");

    const [sites, users] = await Promise.all([
      fetch("site.json").then(r => r.json()),
      fetch("details.json").then(r => r.json())
    ]);

    if (!Array.isArray(sites) || !Array.isArray(users)) {
      console.warn("site.json or details.json is not an array.");
      return;
    }

    const site = sites.find(s => String(s.ID) === String(source));
    if (!site) {
      console.warn("No site found for source:", source);
      siteNameHeading.textContent = "Sign in";
      siteSub.textContent = "to continue";
      welcomeSubtitle.textContent = "";
      return;
    }

    const ownerUser = users.find(u => String(u.ID) === String(site.owner));
    if (!ownerUser) {
      console.warn("No owner user found for site:", site);
      return;
    }

    currentSite = site;
    currentUser = ownerUser;

    // Update UI
    siteNameHeading.textContent = `Sign in to ${site.name || "this site"}`;
    siteSub.textContent = `to continue to ${site.name || site.URL || "your site"}`;
    welcomeTitle.textContent = `Welcome back`;
    welcomeSubtitle.textContent = ownerUser.nickname
      ? `Signing in as ${ownerUser.nickname}`
      : `Signing in to ${site.name || site.URL}`;
  } catch (err) {
    console.error("Error loading site or details JSON:", err);
  }
}

// --- INVALID ANIMATION ---
function invalidAnimation(usernameInput, passwordInput) {
  if (usernameInput.value.trim() === "") usernameInput.classList.add("error");
  if (passwordInput.value.trim() === "") passwordInput.classList.add("error");

  creatures.forEach(creature => {
    creature.classList.add("invalid", "mouth-squiggle");
    creature.classList.remove("mouth-flat");
  });

  setTimeout(() => {
    creatures.forEach(creature => {
      creature.classList.remove("invalid", "mouth-squiggle");
    });
  }, 600);
}

// --- CREATURE ENGINE ---

// Entrance animation
function initCreatures() {
  creatures.forEach((creature, index) => {
    const delay = 150 * index;
    setTimeout(() => {
      creature.style.animation = "creatureEnter 0.9s ease-out forwards";
    }, delay);
  });
}

// Cursor tracking: lean + slight move toward cursor + pupil tracking
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

      // Approach factor: how much they move toward cursor
      let approachFactor = 90;
      if (type === "small") approachFactor = 70;
      if (type === "wide") approachFactor = 110;

      const moveX = dx / approachFactor;
      const moveY = dy / approachFactor;

      // Lean factor
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

      // Pupil tracking
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

// Blinking system
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

// Idle stretch / look-around micro-movements
function initIdleStretch() {
  creatures.forEach(creature => {
    const body = creature.querySelector(".creature-body");
    let baseScaleX = 1;
    let baseScaleY = 1;

    function randomStretch() {
      const sx = 1 + (Math.random() - 0.5) * 0.06;
      const sy = 1 + (Math.random() - 0.5) * 0.06;
      baseScaleX = sx;
      baseScaleY = sy;

      body.style.transition = "transform 0.4s ease-in-out";
      const current = body.style.transform || "";
      // We don't try to parse existing transform here; cursor tracking overwrites frequently.
      // This just gives occasional subtle pulses when cursor is idle.
      setTimeout(() => {
        body.style.transition = "";
      }, 420);

      const delay = 1200 + Math.random() * 2000;
      setTimeout(randomStretch, delay);
    }

    setTimeout(randomStretch, 800 + Math.random() * 800);
  });
}

// React to typing (subtle)
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
