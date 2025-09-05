import type { DeviceInfo, SmartLinkOptions } from './device-detection'
import { detectAppFromHost, getEnvironmentBadge } from './apps.config'

const TIMEOUTS = Object.freeze({
  INITIAL_DELAY: 50,
  APP_ATTEMPT: 1500,
  FALLBACK_SHOW: 2000,
  FORCE_REDIRECT: 3000,
} as const)

const HEADERS = Object.freeze({
  CACHE_CONTROL: 'public, max-age=3600, s-maxage=7200',
  CONTENT_TYPE: 'text/html; charset=utf-8',
  SECURITY: 'nosniff',
} as const)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function safeJsonStringify(obj: any): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
}

function setSecureHeaders(event: any): void {
  try {
    setHeader(event, 'Content-Type', HEADERS.CONTENT_TYPE)
    setHeader(event, 'Cache-Control', HEADERS.CACHE_CONTROL)
    setHeader(event, 'X-Content-Type-Options', HEADERS.SECURITY)
    setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
  }
  catch (error) {
    console.warn('Failed to set security headers:', error)
  }
}

function generateAppStyles(config: SmartLinkOptions): string {
  const appName = config.appName || 'safeyou'
  const environment = config.environment || 'production'

  // App-specific color schemes
  const appColors: Record<string, any> = {
    safeyou: {
      production: { primary: '#6b46c1', secondary: '#9333ea', tertiary: '#c026d3' },
      staging: { primary: '#dc2626', secondary: '#ea580c', tertiary: '#f59e0b' },
      development: { primary: '#059669', secondary: '#0d9488', tertiary: '#06b6d4' },
    },
    youtube: {
      production: { primary: '#ff0000', secondary: '#cc0000', tertiary: '#990000' },
    },
    facebook: {
      production: { primary: '#1877f2', secondary: '#166fe5', tertiary: '#1467d8' },
    },
    whatsapp: {
      production: { primary: '#25d366', secondary: '#1faa4f', tertiary: '#198c3f' },
    },
    spotify: {
      production: { primary: '#1db954', secondary: '#1ca64c', tertiary: '#189443' },
    },
  }

  const defaultColors = { primary: '#6b46c1', secondary: '#9333ea', tertiary: '#c026d3' }
  const colors = appColors[appName]?.[environment] || appColors[appName]?.production || defaultColors

  return `<style>
*{margin:0;padding:0;box-sizing:border-box}
body{
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  background:linear-gradient(135deg,${colors.primary} 0%,${colors.secondary} 50%,${colors.tertiary} 100%);
  color:#fff;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  position:relative;
  overflow:hidden;
}
.container{
  max-width:400px;
  text-align:center;
  background:rgba(255,255,255,0.15);
  backdrop-filter:blur(20px);
  border-radius:24px;
  padding:40px 30px;
  border:1px solid rgba(255,255,255,0.2);
  box-shadow:0 20px 40px rgba(0,0,0,0.1);
  position:relative;
  z-index:2;
}
.logo{
  width:80px;
  height:80px;
  background:#fff;
  border-radius:20px;
  margin:0 auto 24px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:bold;
  color:${colors.primary};
  font-size:${config.logo && config.logo.length > 2 ? '24px' : '32px'};
  box-shadow:0 8px 32px rgba(0,0,0,0.1);
  position:relative;
}
h1{font-size:28px;margin-bottom:12px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1)}
.status{font-size:16px;opacity:0.9;margin-bottom:32px;font-weight:500}
.spinner{
  width:40px;
  height:40px;
  margin:20px auto;
  border:3px solid rgba(255,255,255,0.3);
  border-top:3px solid #fff;
  border-radius:50%;
  animation:spin 1s linear infinite;
}
@keyframes spin{
  0%{transform:rotate(0deg)}
  100%{transform:rotate(360deg)}
}
.fallback{
  margin-top:40px;
  padding:24px;
  background:rgba(255,255,255,0.1);
  border-radius:16px;
  backdrop-filter:blur(10px);
  display:none;
  border:1px solid rgba(255,255,255,0.15);
}
.fallback h3{
  font-size:18px;
  margin-bottom:16px;
  font-weight:600;
}
.fallback p{
  font-size:14px;
  opacity:0.9;
  margin-bottom:20px;
  line-height:1.5;
}
.fallback a{
  color:#fff;
  text-decoration:none;
  font-weight:600;
  padding:12px 24px;
  background:rgba(255,255,255,0.2);
  border-radius:8px;
  display:inline-block;
  margin:8px 4px;
  transition:all 0.3s ease;
  font-size:14px;
  border:1px solid rgba(255,255,255,0.2);
  min-width:140px;
}
.fallback a:hover{
  background:rgba(255,255,255,0.3);
  transform:translateY(-2px);
  box-shadow:0 8px 20px rgba(0,0,0,0.15);
}
.env-badge{
  position:absolute;
  top:20px;
  right:20px;
  padding:8px 16px;
  background:rgba(255,255,255,0.2);
  border-radius:24px;
  font-size:12px;
  text-transform:uppercase;
  font-weight:700;
  letter-spacing:0.8px;
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.2);
  z-index:3;
}
.background-blur{
  position:absolute;
  top:-50%;
  left:-50%;
  width:200%;
  height:200%;
  background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%);
  animation:float 6s ease-in-out infinite;
  z-index:1;
}
@keyframes float{
  0%,100%{transform:translate(0,0) rotate(0deg)}
  33%{transform:translate(30px,-30px) rotate(120deg)}
  66%{transform:translate(-20px,20px) rotate(240deg)}
}
</style>`
}

export function generateAutoRedirectResponse(event: any, config: SmartLinkOptions, device: DeviceInfo, context?: any): string {
  setSecureHeaders(event)

  const environment = context?.environment || 'production'
  const appName = config.appName || detectAppFromHost(context?.requestHost || '')
  const escapedTarget = escapeHtml(config.target)
  const envBadge = getEnvironmentBadge(context?.host || context?.requestHost || '')

  // Generate app-specific meta tags
  const iosMetaTags = config.iosAppId
    ? `
<meta name="apple-itunes-app" content="app-id=${config.iosAppId}">
<meta property="al:ios:app_store_id" content="${config.iosAppId}">
<meta property="al:ios:app_name" content="${config.name || config.displayName || 'App'}">
<meta property="al:ios:url" content="${config.iosUrlScheme}://open?url=${encodeURIComponent(config.target)}&env=${environment}">
<link rel="alternate" href="ios-app://${config.iosAppId}/${config.iosUrlScheme}/open?url=${encodeURIComponent(config.target)}&env=${environment}">`
    : ''

  const androidMetaTags = config.androidPackageName
    ? `
<meta property="al:android:package" content="${config.androidPackageName}">
<meta property="al:android:app_name" content="${config.androidAppName || config.name || 'App'}">
<meta property="al:android:url" content="${config.androidUrlScheme}://${config.androidHost || 'open'}?url=${encodeURIComponent(config.target)}&env=${environment}">
<link rel="alternate" href="android-app://${config.androidPackageName}/${config.androidUrlScheme}/${config.androidHost || 'open'}?url=${encodeURIComponent(config.target)}&env=${environment}">`
    : ''

  const configWithAppName = { ...config, appName }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover">
<title>${config.displayName || config.name || 'App'} - Opening App...</title>
<meta name="description" content="Opening ${config.displayName || config.name || 'App'} for ${environment} environment">
<meta name="theme-color" content="${config.themeColor || '#6b46c1'}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${iosMetaTags}${androidMetaTags}
${generateAppStyles(configWithAppName)}
</head>
<body>
<div class="background-blur"></div>
<div class="env-badge">${envBadge}</div>
<div class="container">
  <div class="logo">${config.logo || config.displayName?.charAt(0) || 'A'}</div>
  <h1 id="title">Opening ${config.displayName || config.name || 'App'}</h1>
  <div class="spinner" id="spinner"></div>
  <div class="status" id="status">Launching ${config.displayName || config.name || 'App'} for ${environment}</div>

  <div class="fallback" id="fallback">
    <h3>Choose an option</h3>
    <p>Access ${config.displayName || config.name || 'the app'} in your preferred way:</p>
    <div>
      <a href="${escapedTarget}" id="browser-link">Open in Browser</a>
      ${config.iosAppId && device.isIOS
        ? `
        <a href="https://apps.apple.com/app/id${config.iosAppId}" id="appstore-link">Download from App Store</a>
      `
        : ''}
      ${config.androidPackageName && device.isAndroid
        ? `
        <a href="https://play.google.com/store/apps/details?id=${config.androidPackageName}" id="playstore-link">Get on Play Store</a>
      `
        : ''}
    </div>
  </div>
</div>

${generateRedirectScript(config, device, context)}
</body>
</html>`
}

export function generateSocialMetaResponse(event: any, config: SmartLinkOptions): string {
  setSecureHeaders(event)

  const escapedTarget = escapeHtml(config.target)
  const environment = config.environment || 'production'
  const appName = config.displayName || config.name || 'App'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${appName} Link</title>
<meta name="description" content="${appName} link for ${environment}">
<meta property="og:title" content="${appName} Link">
<meta property="og:description" content="${appName} link for ${environment}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapedTarget}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${appName} Link">
<meta name="twitter:description" content="${appName} link for ${environment}">
</head>
<body>
<h1>${appName} Link</h1>
<p>This is a ${appName} link for ${environment} environment.</p>
<a href="${escapedTarget}">Visit Link</a>
</body>
</html>`
}

function generateRedirectScript(config: SmartLinkOptions, device: DeviceInfo, context: any): string {
  const environment = context?.environment || 'production'
  const appName = config.appName || 'safeyou'

  const scriptConfig = {
    target: config.target,
    environment,
    appName,
    device: {
      isIOS: device.isIOS,
      isAndroid: device.isAndroid,
      isMobile: device.isMobile,
      isInAppBrowser: device.isInAppBrowser,
    },
    app: {
      iosScheme: config.iosUrlScheme,
      iosUniversalLink: config.iosUniversalLink,
      iosAppId: config.iosAppId,
      androidScheme: config.androidUrlScheme,
      androidHost: config.androidHost,
      androidPackage: config.androidPackageName,
      webUrl: config.webUrl,
      name: config.name,
      displayName: config.displayName,
    },
    timeouts: TIMEOUTS,
  }

  return `<script>
(function() {
  'use strict';

  const CONFIG = ${safeJsonStringify(scriptConfig)};
  let redirected = false;
  let appLaunchAttempted = false;

  function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[DeepLink-' + CONFIG.appName + '] ' + msg);
    }
  }
  
  function redirectToAppStore() {
    if (CONFIG.device.isIOS && CONFIG.app.iosAppId) {
      log('Redirecting to App Store');
      window.location.href = 'https://apps.apple.com/app/id' + CONFIG.app.iosAppId;
      return true;
    } else if (CONFIG.device.isAndroid && CONFIG.app.androidPackage) {
      log('Redirecting to Play Store');
      window.location.href = 'https://play.google.com/store/apps/details?id=' + CONFIG.app.androidPackage;
      return true;
    }
    return false;
  }

  function redirect() {
    if (redirected) return;
    redirected = true;
    log('Redirecting to browser: ' + CONFIG.target);
    window.location.href = CONFIG.target;
  }

  function showFallback() {
    if (redirected) return;
    log('Showing fallback options');

    const title = document.getElementById('title');
    const status = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    const fallback = document.getElementById('fallback');

    if (title) title.textContent = 'Choose an Option';
    if (status) status.textContent = 'Select how you\\'d like to access ' + (CONFIG.app.displayName || CONFIG.app.name || 'the app');
    if (spinner) spinner.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  function tryAppLaunch() {
    if (redirected || appLaunchAttempted) return;
    appLaunchAttempted = true;

    log('Attempting app launch for ' + CONFIG.appName + ' with config: ' + JSON.stringify(CONFIG.app));

    // Verify we have app config
    if (!CONFIG.app.iosAppId && !CONFIG.app.androidPackage) {
      log('No app configuration found, redirecting to browser');
      redirect();
      return;
    }

    let appOpened = false;
    let detectionTimeout;

    const detectApp = () => {
      if (!appOpened) {
        appOpened = true;
        log('App launch detected!');
        clearTimeout(detectionTimeout);
      }
    };

    // Enhanced app detection
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        detectApp();
      } else if (!appOpened && !redirected) {
        // If we come back to the page and the app wasn't opened,
        // it means the app is not installed
        log('App not detected, redirecting to app store...');
        if (!redirectToAppStore()) {
          // If app store redirect fails, show fallback options
          showFallback();
        }
      }
    });
    
    window.addEventListener('blur', detectApp);
    window.addEventListener('pagehide', detectApp);
    
    // Set a timeout to handle cases where visibility change events don't fire
    setTimeout(() => {
      if (!appOpened && !redirected) {
        log('App launch timeout, redirecting to app store...');
        if (!redirectToAppStore()) {
          showFallback();
        }
      }
    }, 2500); // 2.5 seconds should be enough to detect if the app opened

    if (CONFIG.device.isIOS) {
      log('iOS device detected, launching ' + CONFIG.appName + ' app');

      if (CONFIG.appName === 'youtube' && CONFIG.app.iosAppId) {
        const videoId = extractYouTubeVideoId(CONFIG.target);
        if (videoId) {
          // Try YouTube app scheme first
          const youtubeScheme = 'youtube://watch?v=' + videoId;
          log('Trying YouTube iOS scheme: ' + youtubeScheme);
          window.location.href = youtubeScheme;
        } else {
          // Fallback to universal link
          log('No video ID, trying universal link: ' + CONFIG.target);
          window.location.href = CONFIG.target;
        }

      } else if (CONFIG.appName === 'facebook' && CONFIG.app.iosAppId) {
        const fbScheme = 'fb://facewebmodal/f?href=' + encodeURIComponent(CONFIG.target);
        log('Trying Facebook iOS scheme: ' + fbScheme);
        window.location.href = fbScheme;

      } else if (CONFIG.appName === 'whatsapp' && CONFIG.app.iosAppId) {
        const waScheme = convertToWhatsAppScheme(CONFIG.target);
        log('Trying WhatsApp iOS scheme: ' + waScheme);
        window.location.href = waScheme;

      } else if (CONFIG.appName === 'spotify' && CONFIG.app.iosAppId) {
        const spotifyScheme = convertToSpotifyScheme(CONFIG.target);
        log('Trying Spotify iOS scheme: ' + spotifyScheme);
        window.location.href = spotifyScheme;

      } else if (CONFIG.appName === 'safeyou' && CONFIG.app.iosAppId) {
        if (CONFIG.app.iosUniversalLink) {
          const universalUrl = CONFIG.app.iosUniversalLink + '?link=' + encodeURIComponent(CONFIG.target);
          log('Trying SafeYou universal link: ' + universalUrl);
          window.location.href = universalUrl;

          setTimeout(() => {
            if (!appOpened && CONFIG.app.iosScheme) {
              const schemeUrl = CONFIG.app.iosScheme + '://open?url=' + encodeURIComponent(CONFIG.target);
              log('Trying SafeYou scheme: ' + schemeUrl);
              window.location.href = schemeUrl;
            }
          }, 1000);
        }
      } else {
        log('Unknown app or missing iOS config, redirecting to browser');
        redirect();
        return;
      }

    } else if (CONFIG.device.isAndroid) {
      log('Android device detected, launching ' + CONFIG.appName + ' app');

      if (CONFIG.appName === 'youtube' && CONFIG.app.androidPackage) {
        const intentUrl = 'intent://' + CONFIG.target.replace('https://www.youtube.com/', 'www.youtube.com/') + '#Intent;' +
          'scheme=https;' +
          'package=' + CONFIG.app.androidPackage + ';' +
          'action=android.intent.action.VIEW;' +
          'category=android.intent.category.BROWSABLE;' +
          'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
          'end';
        log('Trying YouTube Android Intent: ' + intentUrl);
        window.location.href = intentUrl;

      } else if (CONFIG.appName === 'facebook' && CONFIG.app.androidPackage) {
        const intentUrl = 'intent://' + CONFIG.target.replace('https://www.facebook.com/', 'www.facebook.com/') + '#Intent;' +
          'scheme=https;' +
          'package=' + CONFIG.app.androidPackage + ';' +
          'action=android.intent.action.VIEW;' +
          'category=android.intent.category.BROWSABLE;' +
          'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
          'end';
        log('Trying Facebook Android Intent: ' + intentUrl);
        window.location.href = intentUrl;

      } else if (CONFIG.appName === 'whatsapp' && CONFIG.app.androidPackage) {
        const intentUrl = 'intent://send/#Intent;' +
          'scheme=whatsapp;' +
          'package=' + CONFIG.app.androidPackage + ';' +
          'action=android.intent.action.SEND;' +
          'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
          'end';
        log('Trying WhatsApp Android Intent: ' + intentUrl);
        window.location.href = intentUrl;

      } else if (CONFIG.appName === 'spotify' && CONFIG.app.androidPackage) {
        const intentUrl = 'intent://' + CONFIG.target.replace('https://open.spotify.com/', 'open.spotify.com/') + '#Intent;' +
          'scheme=https;' +
          'package=' + CONFIG.app.androidPackage + ';' +
          'action=android.intent.action.VIEW;' +
          'category=android.intent.category.BROWSABLE;' +
          'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
          'end';
        log('Trying Spotify Android Intent: ' + intentUrl);
        window.location.href = intentUrl;

      } else if (CONFIG.appName === 'safeyou' && CONFIG.app.androidPackage) {
        const intentUrl = 'intent://' + (CONFIG.app.androidHost || 'open') + '?url=' + encodeURIComponent(CONFIG.target) + '#Intent;' +
          'scheme=' + (CONFIG.app.androidScheme || 'https') + ';' +
          'package=' + CONFIG.app.androidPackage + ';' +
          'action=android.intent.action.VIEW;' +
          'category=android.intent.category.BROWSABLE;' +
          'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
          'end';
        log('Trying SafeYou Android Intent: ' + intentUrl);
        window.location.href = intentUrl;
      } else {
        log('Unknown app or missing Android config, redirecting to browser');
        redirect();
        return;
      }

    } else {
      log('Unknown device type, redirecting to browser');
      redirect();
      return;
    }

    // Set a timeout to redirect to app store if app doesn't open
    detectionTimeout = setTimeout(() => {
      if (!appOpened && !redirected) {
        log('App not detected after timeout, redirecting to app store...');
        if (!redirectToAppStore()) {
          showFallback();
        }
      }
    }, 1000);
  }
  function extractYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\\/)|(v\\/)|(\\/u\\/\\w\\/)|(embed\\/)|(watch\\?)|(watch\\.+))\\??v?=?([^#\\&\\?]*).*/;
    const match = url.match(regExp);
    return (match && match[8] && match[8].length === 11) ? match[8] : null;
  }

  function convertToWhatsAppScheme(url) {
    const waMatch = url.match(/wa\\.me\\/(\\d+)(?:\\?text=(.*))?/);
    if (waMatch) {
      const phone = waMatch[1];
      const text = waMatch[2] ? decodeURIComponent(waMatch[2]) : '';
      return 'whatsapp://send?phone=' + phone + (text ? '&text=' + encodeURIComponent(text) : '');
    }
    return 'whatsapp://send';
  }

  function convertToSpotifyScheme(url) {
    return url.replace('https://open.spotify.com/', 'spotify:');
  }

  function init() {
    log('Initializing deep link redirect');
    log('Target URL: ' + CONFIG.target);
    log('App name: ' + CONFIG.appName);
    log('Device: iOS=' + CONFIG.device.isIOS + ', Android=' + CONFIG.device.isAndroid + ', Mobile=' + CONFIG.device.isMobile);

    if (!CONFIG.target) {
      log('No target URL provided');
      showFallback();
      return;
    }

    if (!CONFIG.device.isMobile) {
      log('Desktop device detected, redirecting to browser');
      setTimeout(redirect, CONFIG.timeouts.INITIAL_DELAY);
      return;
    }

    if (CONFIG.device.isInAppBrowser) {
      log('In-app browser detected, redirecting to browser');
      setTimeout(redirect, CONFIG.timeouts.INITIAL_DELAY);
      return;
    }

    log('Mobile device detected, attempting app launch');
    setTimeout(tryAppLaunch, CONFIG.timeouts.INITIAL_DELAY);

    // Fallback safety nets
    setTimeout(() => {
      if (!appLaunchAttempted) {
        log('No app launch attempted, showing fallback');
        showFallback();
      }
    }, CONFIG.timeouts.FALLBACK_SHOW);

    setTimeout(() => {
      if (!redirected) {
        log('Final timeout reached, forcing redirect');
        redirect();
      }
    }, CONFIG.timeouts.FORCE_REDIRECT);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

})();
</script>`
}
