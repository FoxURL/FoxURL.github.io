(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed to access screen sharing APIs.');
  }

  let activeStream = null;
  let videoElement = null;
  let canvasElement = null;

  class DesktopScreenCaptureExtension {
    getInfo() {
      return {
        id: 'screencapturedesktop',
        name: 'Screen Capture Pro',
        color1: '#2d72d9',
        color2: '#1b52a4',
        blocks: [
          {
            opcode: 'requestScreen',
            blockType: Scratch.BlockType.COMMAND,
            text: 'request screen sharing permission'
          },
          {
            opcode: 'stopScreen',
            blockType: Scratch.BlockType.COMMAND,
            text: 'stop screen sharing'
          },
          {
            opcode: 'getScreenshot',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get screen PNG data URL'
          }
        ]
      };
    }

    async requestScreen() {
      try {
        this.stopScreen();

        // 1. Check if running inside Electron (TurboWarp Desktop app environment)
        const isElectron = navigator.userAgent.toLowerCase().includes('electron');

        if (isElectron) {
          // Use legacy/Electron-supported constraints to hook directly into the window picker
          activeStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                // You can change max width/height if it hits performance lags
                maxWidth: 1920,
                maxHeight: 1080
              }
            }
          });
        } else {
          // 2. Fallback to normal web browser API if running on the web version
          activeStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
          });
        }

        // Set up hidden elements to parse the stream
        videoElement = document.createElement('video');
        videoElement.srcObject = activeStream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        canvasElement = document.createElement('canvas');

        activeStream.getVideoTracks()[0].onended = () => {
          this.stopScreen();
        };

        // Await frame initialization
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = resolve;
        });

      } catch (err) {
        console.error('Failed to grab screen stream:', err);
        this.stopScreen();
      }
    }

    stopScreen() {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      activeStream = null;
      videoElement = null;
      canvasElement = null;
    }

    getScreenshot() {
      if (!activeStream || !videoElement || !canvasElement) {
        return 'Error: Screen share is not active';
      }

      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;

      if (width === 0 || height === 0) {
        return 'Error: Video layout not ready';
      }

      canvasElement.width = width;
      canvasElement.height = height;

      const ctx = canvasElement.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, width, height);

      try {
        return canvasElement.toToDataURL('image/png');
      } catch (e) {
        // Fallback catch if the canvas encounters cross-origin issues
        return canvasElement.toDataURL();
      }
    }
  }

  Scratch.extensions.register(new DesktopScreenCaptureExtension());
})(Scratch);
