(function () {
  if (window.FoxCaptcha && window.FoxCaptcha.render) return;

  const styleId = 'fox-captcha-widget-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .fox-captcha-host {
        width: 100%;
        max-width: 240px;
        margin: 0 auto;
        font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
      }

      .fox-captcha-card {
        position: relative;
        padding: 10px;
        border-radius: 12px;
        background: linear-gradient(145deg, #1d1208, #120a04);
        border: 1px solid rgba(255, 138, 31, 0.22);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
        color: #fff7ea;
        overflow: hidden;
      }

      .fox-captcha-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(110deg, transparent 8%, rgba(255, 138, 31, 0.12) 48%, transparent 92%);
        transform: translateX(-100%);
        animation: foxSweep 4.6s linear infinite;
        pointer-events: none;
      }

      .fox-captcha-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }

      .fox-captcha-title {
        font-size: 0.9rem;
        font-weight: 800;
      }

      .fox-captcha-badge {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: linear-gradient(145deg, #ff8a1f, #ff6a00);
        box-shadow: 0 5px 12px rgba(255, 138, 31, 0.25);
        animation: foxBob 2.1s ease-in-out infinite;
        font-size: 14px;
      }

      .fox-captcha-meta {
        font-size: 0.72rem;
        color: #f5c77d;
        margin-bottom: 8px;
      }

      .fox-captcha-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .fox-captcha-button {
        border: none;
        cursor: pointer;
        color: #2a1504;
        font-weight: 800;
        font-size: 0.78rem;
        padding: 7px 10px;
        border-radius: 999px;
        background: linear-gradient(90deg, #ffbb57, #ff8a1f);
        box-shadow: 0 7px 12px rgba(255, 138, 31, 0.18);
        user-select: none;
      }

      .fox-captcha-button:active {
        transform: scale(0.97);
      }

      .fox-captcha-hint {
        font-size: 0.68rem;
        color: #f2c584;
      }

      .fox-captcha-bar {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(255,255,255,0.08);
        margin: 6px 0 4px;
      }

      .fox-captcha-bar > span {
        display: block;
        height: 100%;
        width: 0;
        transition: width 240ms ease;
        background: linear-gradient(90deg, #ff8a1f, #ffbb57);
      }

      .fox-captcha-result {
        min-height: 16px;
        font-size: 0.74rem;
        color: #f7dfb5;
        line-height: 1.25;
      }

      @keyframes foxSweep {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(120%); }
      }

      @keyframes foxBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
    `;
    document.head.appendChild(style);
  }

  function render(target) {
    const host = target || document.currentScript && document.currentScript.parentNode;
    if (!host) return;

    host.classList.add('fox-captcha-host');
    host.innerHTML = `
      <div class="fox-captcha-card">
        <div class="fox-captcha-head">
          <div class="fox-captcha-title">I’m not a robot</div>
          <div class="fox-captcha-badge" aria-hidden="true">🦊</div>
        </div>
        <div class="fox-captcha-actions">
          <button class="fox-captcha-button" type="button" id="foxCaptchaButton">Click to verify</button>
          <span class="fox-captcha-hint">Orange mode</span>
        </div>
        <div class="fox-captcha-bar"><span id="foxCaptchaBar"></span></div>
        <div class="fox-captcha-result" id="foxCaptchaResult">Checking environment…</div>
      </div>
    `;

    const button = host.querySelector('#foxCaptchaButton');
    const bar = host.querySelector('#foxCaptchaBar');
    const result = host.querySelector('#foxCaptchaResult');
    const storageKey = 'FoxRecaptchaVerified';

    let pressStart = null;
    let interactionCount = 0;
    let challengeState = 'pending';

    function getStoredState() {
      try {
        return localStorage.getItem(storageKey) === 'true';
      } catch (error) {
        return false;
      }
    }

    function setStoredState(value) {
      try {
        localStorage.setItem(storageKey, value ? 'true' : 'false');
      } catch (error) {
        // ignore storage access errors
      }
    }

    setStoredState(false);

    function setBar(percent) {
      bar.style.width = `${percent}%`;
    }

    function evaluateEnvironment() {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(hostname);
      const isSecure = window.isSecureContext || protocol === 'https:' || isLocal;
      const ua = navigator.userAgent.toLowerCase();
      const vmHints = ['vmware', 'virtualbox', 'qemu', 'xen', 'parallels', 'hyper-v', 'kvm'].filter((item) => ua.includes(item));
      const canvas = document.createElement('canvas');
      const ctx2d = canvas.getContext('2d');
      const webgl = !!(window.WebGLRenderingContext || window.WebGL2RenderingContext);
      const hasTls = !!(window.crypto && window.crypto.subtle);
      const jsApiScore = [
        window.screen,
        window.localStorage,
        window.fetch,
        window.Intl,
        window.AudioContext,
        window.crypto && window.crypto.subtle
      ].filter(Boolean).length;
      const browserLikeHeaders = !!(navigator.userAgent && navigator.language && navigator.languages && navigator.languages.length);
      const networkOk = isSecure && !vmHints.length;
      const tlsOk = isSecure && hasTls;
      const canvasOk = !!(ctx2d && webgl);
      const jsOk = jsApiScore >= 5 && browserLikeHeaders;
      const behaviorOk = interactionCount > 0;
      const hasIssues = !networkOk || !tlsOk || !canvasOk || !jsOk || !behaviorOk;

      if (!isSecure || vmHints.length) {
        setStoredState(false);
        result.textContent = 'Verification auto-invalidated: insecure connection or VM-like environment detected.';
        setBar(0);
        button.disabled = true;
        button.textContent = 'Blocked';
        return;
      }

      button.disabled = false;
      button.textContent = 'Click to verify';
      result.textContent = getStoredState() ? 'Verification already passed.' : 'Ready to verify.';
      setBar(getStoredState() ? 100 : 24);
    }

    function isCenterClick(event) {
      if (!event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') return false;
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return Math.abs(event.clientX - centerX) < 2 && Math.abs(event.clientY - centerY) < 2;
    }

    function finishHold(event) {
      if (!pressStart) return;

      const elapsed = Date.now() - pressStart;
      pressStart = null;
      const clickedCenter = isCenterClick(event);

      if (elapsed === 1000 || clickedCenter) {
        challengeState = 'invalid';
        result.textContent = 'That interaction was invalid. Verification was not accepted.';
        setBar(30);
        return;
      }

      if (elapsed <= 0) {
        challengeState = 'invalid';
        setStoredState(false);
        result.textContent = 'Click the button from the edge before releasing.';
        setBar(20);
        return;
      }

      challengeState = 'solved';
      setStoredState(true);
      result.textContent = 'Verification accepted.';
      setBar(100);
    }

    button.addEventListener('mousedown', (event) => {
      pressStart = Date.now();
      if (event) {
        interactionCount += 1;
      }
    });

    button.addEventListener('mouseup', finishHold);
    button.addEventListener('mouseleave', finishHold);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        challengeState = 'invalid';
        result.textContent = 'That keyboard activation was invalid. Verification was not accepted.';
        setBar(30);
      }
    });
    button.addEventListener('mousemove', () => {
      interactionCount += 1;
    });
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      pressStart = Date.now();
      interactionCount += 1;
    }, { passive: false });
    button.addEventListener('touchend', (event) => {
      event.preventDefault();
      finishHold(event.changedTouches[0]);
    });
    document.addEventListener('keydown', () => {
      interactionCount += 1;
    });

    window.addEventListener('load', evaluateEnvironment);
    evaluateEnvironment();
  }

  window.FoxCaptcha = {
    render: function (target) {
      render(target);
    }
  };

  const scriptTag = document.currentScript;
  if (scriptTag) {
    const target = scriptTag.getAttribute('data-target');
    const mount = target ? document.querySelector(target) : null;
    render(mount || scriptTag.parentNode);
  } else {
    render(document.body);
  }
})();
