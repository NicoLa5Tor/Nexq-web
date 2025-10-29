import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DeviceTokenService {
  private readonly platformId = inject(PLATFORM_ID);

  async ensureToken(): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'server';
    }

    try {
      const stored = window.localStorage.getItem('device_token_nexq');
      if (stored) {
        return stored;
      }
    } catch (error) {
      console.warn('device token storage error', error);
    }

    const token = await this.buildFingerprintString()
      .then((fingerprint) => this.hashString(fingerprint))
      .catch(() => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));

    try {
      window.localStorage.setItem('device_token_nexq', token);
    } catch (error) {
      console.warn('device token storage error', error);
    }

    return token;
  }

  private async buildFingerprintString(): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return 'server';
    }

    const navigatorAny = navigator as Navigator & { deviceMemory?: number };
    const screenData = window.screen;
    const languages = Array.isArray(navigator.languages) ? navigator.languages.join(',') : '';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    const canvasFingerprint = this.getCanvasFingerprint();
    const webglFingerprint = this.getWebGLFingerprint();

    const data = {
      ua: navigator.userAgent,
      platform: navigator.platform,
      screen: {
        width: screenData?.width ?? 0,
        height: screenData?.height ?? 0,
        colorDepth: screenData?.colorDepth ?? 0
      },
      languages,
      timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
      deviceMemory: navigatorAny.deviceMemory ?? 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack ?? '',
      hostname: window.location.hostname,
      touchSupport: 'ontouchstart' in window,
      serviceWorker: 'serviceWorker' in navigator,
      mediaDevices: 'mediaDevices' in navigator,
      canvasFingerprint,
      webglFingerprint
    };

    return JSON.stringify(data);
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 60;
      const context = canvas.getContext('2d');
      if (!context) {
        return 'no_canvas';
      }
      context.textBaseline = 'top';
      context.font = '16px "Fira Code", monospace';
      context.fillStyle = '#f0f';
      context.fillRect(0, 0, 200, 60);
      context.fillStyle = '#00f';
      context.fillText('NEXQ fingerprint', 4, 18);
      context.strokeStyle = '#0f0';
      context.strokeRect(2, 2, 196, 56);
      return canvas.toDataURL();
    } catch (error) {
      console.warn('canvas fingerprint error', error);
      return 'canvas_error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        return 'no_webgl';
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      const version = gl.getParameter(gl.VERSION) ?? '';
      const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) ?? '';
      const extensions = gl.getSupportedExtensions()?.join(',') ?? '';
      return [vendor, renderer, version, shading, extensions].join('~');
    } catch (error) {
      console.warn('webgl fingerprint error', error);
      return 'webgl_error';
    }
  }

  private async hashString(source: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto?.subtle) {
      return Math.random().toString(36).slice(2);
    }
    const data = new TextEncoder().encode(source);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}
