const FILES = [
  { host: "GitHub", sizeMB: 1, url: "https://foxurl.github.io/bin/1MB.bin" },
  { host: "File.Garden", sizeMB: 1, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/1MB.txt" },
  { host: "GitHub", sizeMB: 10, url: "https://foxurl.github.io/bin/10MB.bin" },
  { host: "File.Garden", sizeMB: 10, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/10MB.txt" },
  { host: "GitHub", sizeMB: 25, url: "https://foxurl.github.io/bin/25MB.bin" },
  { host: "File.Garden", sizeMB: 25, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/25MB.txt" },
  { host: "GitHub", sizeMB: 50, url: "https://foxurl.github.io/bin/50MB.bin" },
  { host: "File.Garden", sizeMB: 50, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/50MB.txt" },
  { host: "GitHub", sizeMB: 100, url: "https://foxurl.github.io/bin/100MB.bin" },
  { host: "File.Garden", sizeMB: 100, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/100MB.txt" }
];

const VERIFY_GROUPS = [
  [
    { host: "GitHub", sizeMB: 10, url: "https://foxurl.github.io/bin/10MB.bin" },
    { host: "GitHub", sizeMB: 25, url: "https://foxurl.github.io/bin/25MB.bin" }
  ],
  [
    { host: "File.Garden", sizeMB: 10, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/10MB.txt" },
    { host: "File.Garden", sizeMB: 25, url: "https://file.garden/aIcUbFCOH3ttg6K4/bin/25MB.txt" }
  ]
];

const speedEl = document.getElementById("speedValue");
const statusEl = document.getElementById("statusText");
const etaEl = document.getElementById("etaText");

const trueBox = document.getElementById("trueBox");
const foxurlBox = document.getElementById("foxurlBox");
const referenceBox = document.getElementById("referenceBox");

const trueSpeedEl = document.getElementById("trueSpeed");
const foxurlSpeedEl = document.getElementById("foxurlSpeed");
const referenceSpeedEl = document.getElementById("referenceSpeed");

const startBtn = document.getElementById("startBtn");
const cancelBtn = document.getElementById("cancelBtn");

let abortController = null;

function setSpeedDisplay(mbps, done = false) {
  speedEl.classList.add("updating");
  setTimeout(() => {
    speedEl.textContent = mbps.toFixed(2);
    speedEl.style.color = done ? "var(--success)" : "var(--text)";
    speedEl.classList.remove("updating");
  }, 120);
}

function estimateEta(index, total) {
  const remaining = total - index;
  if (remaining <= 0) return "Almost done.";
  return `~${remaining * 4}s remaining`;
}

async function downloadFile(entry, signal) {
  const expectedBytes = entry.sizeMB * 1024 * 1024;
  const t0 = performance.now();
  let bytes = 0;

  const resp = await fetch(entry.url, { cache: "no-store", signal });
  const reader = resp.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes >= expectedBytes) break;
  }

  const seconds = (performance.now() - t0) / 1000;
  return { bps: (bytes * 8) / seconds };
}

async function runSequential(signal, results) {
  for (let i = 0; i < FILES.length; i++) {
    const f = FILES[i];
    statusEl.textContent = `Testing ${f.host} ${f.sizeMB}MB…`;
    etaEl.textContent = estimateEta(i, FILES.length + VERIFY_GROUPS.length * 2);

    const { bps } = await downloadFile(f, signal);
    const mbps = bps / 1_000_000;
    setSpeedDisplay(mbps);

    if (!results[f.sizeMB]) results[f.sizeMB] = [];
    results[f.sizeMB].push(mbps);
  }
}

async function runVerify(signal, results) {
  for (let g = 0; g < VERIFY_GROUPS.length; g++) {
    const group = VERIFY_GROUPS[g];
    statusEl.textContent = `Verification ${g + 1}…`;
    etaEl.textContent = estimateEta(FILES.length + g, FILES.length + VERIFY_GROUPS.length * 2);

    const res = await Promise.all(group.map(f => downloadFile(f, signal)));

    res.forEach((r, idx) => {
      const f = group[idx];
      const mbps = r.bps / 1_000_000;
      setSpeedDisplay(mbps);

      const key = `verify_${f.sizeMB}`;
      if (!results[key]) results[key] = [];
      results[key].push(mbps);
    });
  }
}

function computeTrueSpeed(results) {
  if (!results[100]) return 0;
  const arr = results[100];
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeFoxURLSpeed(results) {
  let all = [];
  for (const size in results) {
    if (!isNaN(size)) all = all.concat(results[size]);
  }
  if (all.length === 0) return 0;
  return all.reduce((a, b) => a + b, 0) / all.length;
}

function computeReferenceSpeed(results) {
  function avg(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

  const s1   = results[1]   ? avg(results[1])   / 100 : 0;
  const s10  = results[10]  ? avg(results[10])  / 10  : 0;
  const s25  = results[25]  ? avg(results[25])  / 4   : 0;
  const s50  = results[50]  ? avg(results[50])  / 2   : 0;
  const s100 = results[100] ? avg(results[100]) / 1   : 0;

  return (s1 + s10 + s25 + s50 + s100) / 5;
}

async function runTest() {
  startBtn.disabled = true;
  cancelBtn.disabled = false;

  trueBox.style.display = "none";
  foxurlBox.style.display = "none";
  referenceBox.style.display = "none";

  setSpeedDisplay(0);
  statusEl.textContent = "Starting test…";

  abortController = new AbortController();
  const signal = abortController.signal;

  const results = {};

  try {
    await runSequential(signal, results);
    await runVerify(signal, results);

    const trueSpeed = computeTrueSpeed(results);
    const foxurlSpeed = computeFoxURLSpeed(results);
    const referenceSpeed = computeReferenceSpeed(results);

    setSpeedDisplay(trueSpeed, true);

    trueSpeedEl.textContent = trueSpeed.toFixed(2) + " Mbps";
    foxurlSpeedEl.textContent = foxurlSpeed.toFixed(2) + " Mbps";
    referenceSpeedEl.textContent = referenceSpeed.toFixed(2) + " Mbps";

    trueBox.style.display = "block";
    foxurlBox.style.display = "block";
    referenceBox.style.display = "block";

    statusEl.textContent = "Test complete";
    etaEl.textContent = "Done.";
  } catch (e) {
    statusEl.textContent = signal.aborted ? "Test cancelled" : "Test failed";
  }

  startBtn.disabled = false;
  cancelBtn.disabled = true;
}

startBtn.addEventListener("click", () => {
  if (!abortController) runTest();
});

cancelBtn.addEventListener("click", () => {
  if (abortController) abortController.abort();
});
