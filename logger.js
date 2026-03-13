// === Google Form URL ===
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScmhN8b4Q9JUy08LNMemJ9b8GeeskgrtCVru0s3UMqyiZ-IYg/formResponse";

// === FIELD MAPPING (1–29) ===
const F = {
  batteryLevel:       "entry.330246852",   // 1
  charging:           "entry.1015260769",  // 2
  timeFull:           "entry.758642992",   // 3
  timeEmpty:          "entry.1247089984",  // 4
  batterySupported:   "entry.1566401944",  // 5
  cpuCores:           "entry.1396639518",  // 6
  cpuLoad:            "entry.494715554",   // 7
  cpuThrottle:        "entry.615522254",   // 8
  wasmScore:          "entry.1654189058",  // 9
  jsSpeed:            "entry.2075171834",  // 10
  thermalThrottle:    "entry.1729710692",  // 11
  heapLimit:          "entry.308944843",   // 12
  heapUsed:           "entry.2098296506",  // 13
  heapAllocated:      "entry.591340993",   // 14
  deviceMemory:       "entry.1080932204",  // 15
  memoryPressure:     "entry.324997151",   // 16
  memorySnapshot:     "entry.863927205",   // 17
  memoryLeak:         "entry.561426071",   // 18
  audioFormats:       "entry.1831455685",  // 19
  videoFormats:       "entry.20720378",    // 20
  cpuName:            "entry.1406817285",  // 21
  renderer:           "entry.1000438713",  // 22
  gpuVendor:          "entry.1950154101",  // 23
  webglVendor:        "entry.178858677",   // 24
  maxTextureSize:     "entry.696441045",   // 25
  webglVersion:       "entry.520614518",   // 26
  canvasHash:         "entry.1735629205",  // 27
  screenResolution:   "entry.388754685",   // 28
  viewportSize:       "entry.1633429688"   // 29
};

// === CPU NAME GUESSER ===
function guessCPUName() {
  let ua = navigator.userAgent || "";
  let brands = navigator.userAgentData?.brands || [];

  if (ua.includes("Intel")) return "Intel (UA)";
  if (ua.includes("AMD")) return "AMD (UA)";
  if (ua.includes("Apple")) return "Apple Silicon (UA)";
  if (ua.includes("Snapdragon")) return "Qualcomm Snapdragon (UA)";

  for (let b of brands) {
    if (b.brand.includes("Intel")) return "Intel (UA-CH)";
    if (b.brand.includes("AMD")) return "AMD (UA-CH)";
    if (b.brand.includes("Apple")) return "Apple Silicon (UA-CH)";
  }

  return "Unknown CPU";
}

// === GPU VENDOR ===
function getGPUVendor() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "WebGL unsupported";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "Vendor hidden";

    return gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
  } catch {
    return "Error";
  }
}

// === GPU RENDERER ===
function getRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "WebGL unsupported";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "Renderer hidden";

    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
  } catch {
    return "Error";
  }
}

// === WEBGL VERSION ===
function getWebGLVersion() {
  const canvas = document.createElement("canvas");
  if (canvas.getContext("webgl2")) return "WebGL 2";
  if (canvas.getContext("webgl")) return "WebGL 1";
  return "Unsupported";
}

// === MAX TEXTURE SIZE ===
function getMaxTextureSize() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "N/A";
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  } catch {
    return "N/A";
  }
}

// === CANVAS FINGERPRINT HASH ===
function getCanvasHash() {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "16px Arial";
    ctx.fillText("canvas-fingerprint", 2, 2);

    const data = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  } catch {
    return "N/A";
  }
}

// === MAIN LOGGER ===
async function runLogger() {
  const formData = new FormData();

  // Battery
  let batterySupported = false;
  try {
    const battery = await navigator.getBattery();
    batterySupported = true;

    formData.append(F.batteryLevel, Math.round(battery.level * 100));
    formData.append(F.charging, battery.charging);
    formData.append(F.timeFull, battery.chargingTime);
    formData.append(F.timeEmpty, battery.dischargingTime);
  } catch {
    formData.append(F.batteryLevel, "N/A");
    formData.append(F.charging, "N/A");
    formData.append(F.timeFull, "N/A");
    formData.append(F.timeEmpty, "N/A");
  }
  formData.append(F.batterySupported, batterySupported);

  // CPU
  formData.append(F.cpuCores, navigator.hardwareConcurrency || "N/A");

  const start = performance.now();
  for (let i = 0; i < 5e6; i++) {}
  formData.append(F.cpuLoad, performance.now() - start);

  const t1 = performance.now();
  await new Promise(r => setTimeout(r, 200));
  const drift = (performance.now() - t1) - 200;
  formData.append(F.cpuThrottle, drift);
  formData.append(F.thermalThrottle, drift);

  let wasmScore = "N/A";
  try {
    const ws = performance.now();
    for (let i = 0; i < 1e7; i++) {}
    wasmScore = performance.now() - ws;
  } catch {}
  formData.append(F.wasmScore, wasmScore);

  const jsStart = performance.now();
  for (let i = 0; i < 1e7; i++) {}
  formData.append(F.jsSpeed, performance.now() - jsStart);

  // Memory
  if (performance.memory) {
    formData.append(F.heapLimit, performance.memory.jsHeapSizeLimit);
    formData.append(F.heapUsed, performance.memory.usedJSHeapSize);
    formData.append(F.heapAllocated, performance.memory.totalJSHeapSize);

    formData.append(F.deviceMemory, navigator.deviceMemory || "N/A");

    const pressure =
      performance.memory.usedJSHeapSize /
      performance.memory.jsHeapSizeLimit;
    formData.append(F.memoryPressure, pressure.toFixed(4));

    formData.append(F.memorySnapshot, performance.memory.usedJSHeapSize);
  } else {
    formData.append(F.heapLimit, "N/A");
    formData.append(F.heapUsed, "N/A");
    formData.append(F.heapAllocated, "N/A");
    formData.append(F.deviceMemory, "N/A");
    formData.append(F.memoryPressure, "N/A");
    formData.append(F.memorySnapshot, "N/A");
  }

  // Memory leak placeholder
  formData.append(F.memoryLeak, "not_detected");

  // Audio formats
  const audio = document.createElement("audio");
  const audioSupport = {
    mp3: audio.canPlayType("audio/mpeg"),
    wav: audio.canPlayType("audio/wav"),
    ogg: audio.canPlayType("audio/ogg"),
    aac: audio.canPlayType("audio/aac")
  };
  formData.append(F.audioFormats, JSON.stringify(audioSupport));

  // Video formats
  const video = document.createElement("video");
  const videoSupport = {
    mp4: video.canPlayType("video/mp4"),
    webm: video.canPlayType("video/webm"),
    ogv: video.canPlayType("video/ogg")
  };
  formData.append(F.videoFormats, JSON.stringify(videoSupport));

  // CPU name
  formData.append(F.cpuName, guessCPUName());

  // Renderer
  formData.append(F.renderer, getRenderer());

  // GPU vendor
  formData.append(F.gpuVendor, getGPUVendor());

  // WebGL vendor
  formData.append(F.webglVendor, getGPUVendor());

  // Max texture size
  formData.append(F.maxTextureSize, getMaxTextureSize());

  // WebGL version
  formData.append(F.webglVersion, getWebGLVersion());

  // Canvas hash
  formData.append(F.canvasHash, getCanvasHash());

  // Screen resolution
  formData.append(F.screenResolution, `${screen.width}x${screen.height}`);

  // Viewport size
  formData.append(F.viewportSize, `${window.innerWidth}x${window.innerHeight}`);

  // SEND
  fetch(GOOGLE_FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}

// Run immediately when file loads
runLogger();
