import type { DeviceInfo, SmartLinkOptions } from './device-detection'
import { getEnvironmentBadge, getSafeYouConfig } from './safeyou.config'

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

function generateSafeYouStyles(environment: string): string {
  const envColors = {
    production: { primary: '#6b46c1', secondary: '#9333ea', tertiary: '#c026d3' },
    staging: { primary: '#dc2626', secondary: '#ea580c', tertiary: '#f59e0b' },
    development: { primary: '#059669', secondary: '#0d9488', tertiary: '#06b6d4' },
  }

  const colors = envColors[environment as keyof typeof envColors] || envColors.production

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
  font-size:32px;
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
  const safeYouConfig = getSafeYouConfig(environment)
  const escapedTarget = escapeHtml(config.target)
  const envBadge = getEnvironmentBadge(context?.host || '')

  const iosMetaTags = safeYouConfig.iosAppId
    ? `
<meta name="apple-itunes-app" content="app-id=${safeYouConfig.iosAppId}">
<meta property="al:ios:app_store_id" content="${safeYouConfig.iosAppId}">
<meta property="al:ios:app_name" content="Safe You">
<meta property="al:ios:url" content="${safeYouConfig.iosUrlScheme}://open?url=${encodeURIComponent(config.target)}&env=${environment}">
<link rel="alternate" href="ios-app://${safeYouConfig.iosAppId}/${safeYouConfig.iosUrlScheme}/open?url=${encodeURIComponent(config.target)}&env=${environment}">`
    : ''

  const androidMetaTags = safeYouConfig.androidPackageName
    ? `
<meta property="al:android:package" content="${safeYouConfig.androidPackageName}">
<meta property="al:android:app_name" content="${safeYouConfig.androidAppName}">
<meta property="al:android:url" content="${safeYouConfig.androidUrlScheme}://${safeYouConfig.androidHost}/open?url=${encodeURIComponent(config.target)}&env=${environment}">
<link rel="alternate" href="android-app://${safeYouConfig.androidPackageName}/${safeYouConfig.androidUrlScheme}/${safeYouConfig.androidHost}/open?url=${encodeURIComponent(config.target)}&env=${environment}">`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover">
<title>SafeYou - Opening App...</title>
<meta name="description" content="Opening SafeYou app for ${environment} environment">
<meta name="theme-color" content="#6b46c1">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${iosMetaTags}${androidMetaTags}
${generateSafeYouStyles(environment)}
</head>
<body>
<div class="background-blur"></div>
<div class="env-badge">${envBadge}</div>
<div class="container">
  <div class="logo">SY</div>
  <h1 id="title">Opening SafeYou</h1>
  <div class="spinner" id="spinner"></div>
  <div class="status" id="status">Launching SafeYou app for ${environment}</div>

  <div class="fallback" id="fallback">
    <h3>Choose an option</h3>
    <p>Access SafeYou in your preferred way:</p>
    <div>
      <a href="${escapedTarget}" id="browser-link">Open in Browser</a>
      ${safeYouConfig.iosAppId && device.isIOS
        ? `
        <a href="https://apps.apple.com/app/id${safeYouConfig.iosAppId}" id="appstore-link">Download from App Store</a>
      `
        : ''}
      ${safeYouConfig.androidPackageName && device.isAndroid
        ? `
        <a href="https://play.google.com/store/apps/details?id=${safeYouConfig.androidPackageName}" id="playstore-link">Get on Play Store</a>
      `
        : ''}
    </div>
  </div>
</div>

${generateSimpleRedirectScript(config, device, context, safeYouConfig)}
</body>
</html>`
}

export function generateSocialMetaResponse(event: any, config: SmartLinkOptions): string {
  setSecureHeaders(event)

  const escapedTarget = escapeHtml(config.target)
  const environment = config.environment || 'production'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SafeYou Link</title>
<meta name="description" content="SafeYou secure link for ${environment}">
<meta property="og:title" content="SafeYou Link">
<meta property="og:description" content="SafeYou secure link for ${environment}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapedTarget}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="SafeYou Link">
<meta name="twitter:description" content="SafeYou secure link for ${environment}">
</head>
<body>
<h1>SafeYou Link</h1>
<p>This is a SafeYou secure link for ${environment} environment.</p>
<a href="${escapedTarget}">Visit Link</a>
</body>
</html>`
}

function generateSimpleRedirectScript(config: any, device: any, context: any, safeYouConfig: any): string {
  const environment = context?.environment || 'production'

  const scriptConfig = {
    target: config.target,
    environment,
    device: {
      isIOS: device.isIOS,
      isAndroid: device.isAndroid,
      isMobile: device.isMobile,
      isInAppBrowser: device.isInAppBrowser,
    },
    app: {
      iosScheme: safeYouConfig.iosUrlScheme,
      iosUniversalLink: safeYouConfig.iosUniversalLink,
      iosAppId: safeYouConfig.iosAppId,
      androidScheme: safeYouConfig.androidUrlScheme,
      androidHost: safeYouConfig.androidHost,
      androidPackage: safeYouConfig.androidPackageName,
    },
    timeouts: TIMEOUTS,
  }

  return `<script>
(function() {
  'use strict';

  const CONFIG = ${safeJsonStringify(scriptConfig)};
  let redirected = false;

  function log(msg) {
    console.log('[SafeYou] ' + msg);
  }

  function redirect() {
    if (redirected) return;
    redirected = true;

    log('Redirecting to: ' + CONFIG.target);
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
    if (status) status.textContent = 'Select how you\'d like to access SafeYou';
    if (spinner) spinner.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  function tryAppLaunch() {
    if (redirected) return;

    log('Attempting app launch');

    let appOpened = false;
    const detectApp = () => {
      if (!appOpened) {
        appOpened = true;
        log('App may have opened');
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) detectApp();
    });
    window.addEventListener('blur', detectApp);
    window.addEventListener('pagehide', detectApp);

    const params = 'url=' + encodeURIComponent(CONFIG.target)

    if (CONFIG.device.isIOS && CONFIG.app.iosUniversalLink) {
      const universalUrl = CONFIG.app.iosUniversalLink + '?link=' + encodeURIComponent(CONFIG.target)
      log('Trying iOS Universal Link: ' + universalUrl);
      window.location.href = universalUrl;

      setTimeout(() => {
        if (!appOpened && CONFIG.app.iosScheme) {
          const schemeUrl = CONFIG.app.iosScheme + '://open?' + params;
          log('Trying iOS scheme: ' + schemeUrl);
          window.location.href = schemeUrl;
        }
      }, 800);

    } else if (CONFIG.device.isAndroid && CONFIG.app.androidPackage) {
      const intentUrl = 'intent://' + CONFIG.app.androidHost + '/open?' + params + '#Intent;' +
        'scheme=' + CONFIG.app.androidScheme + ';' +
        'package=' + CONFIG.app.androidPackage + ';' +
        'action=android.intent.action.VIEW;' +
        'category=android.intent.category.BROWSABLE;' +
        'S.browser_fallback_url=' + encodeURIComponent(CONFIG.target) + ';' +
        'end';

      log('Trying Android Intent: ' + intentUrl);
      window.location.href = intentUrl;

    } else {
      log('No app config or unknown device, showing fallback');
      showFallback();
      return;
    }

    // Show fallback after app attempt timeout
    setTimeout(() => {
      if (!appOpened) {
        log('App attempt timeout, showing fallback');
        showFallback();
      }
    }, CONFIG.timeouts.APP_ATTEMPT);
  }

  function init() {
    log('Initializing redirect');

    if (!CONFIG.target) {
      log('No target URL');
      showFallback();
      return;
    }

    if (!CONFIG.device.isMobile || CONFIG.device.isInAppBrowser) {
      log('Non-mobile or in-app browser, redirecting immediately');
      setTimeout(redirect, CONFIG.timeouts.INITIAL_DELAY);
      return;
    }

    log('Mobile device detected');
    setTimeout(tryAppLaunch, CONFIG.timeouts.INITIAL_DELAY);

    setTimeout(showFallback, CONFIG.timeouts.FALLBACK_SHOW);

    setTimeout(redirect, CONFIG.timeouts.FORCE_REDIRECT);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
</script>`
}
