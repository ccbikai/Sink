import type { DeviceInfo, SmartLinkOptions } from './device-detection'

const TIMEOUTS = Object.freeze({
  FALLBACK: 1500,
  REDIRECT: 250,
  ULTIMATE: 2000,
  ANDROID_ATTEMPT: 300,
  IOS_VISIBILITY: 300,
  APP_DETECTION: 100,
  IN_APP_REDIRECT: 100,
} as const)

const HEADERS = Object.freeze({
  CACHE_CONTROL: 'public, max-age=3600, s-maxage=7200',
  CONTENT_TYPE: 'text/html; charset=utf-8',
  SECURITY: 'nosniff',
} as const)

const DEFAULT_APP_NAME = 'App'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Safe JSON stringification for script injection
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

function getRequestHost(event: any): string {
  try {
    return getHeader(event, 'host') || 'localhost'
  }
  catch {
    return 'localhost'
  }
}

function generateOptimizedStyles(): string {
  return `<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.container{max-width:400px;text-align:center}.spinner{width:50px;height:50px;border:3px solid rgba(255,255,255,0.3);border-top:3px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}h1{font-size:24px;margin-bottom:8px;font-weight:600}.status{font-size:14px;opacity:0.9;margin-bottom:20px}.fallback{margin-top:30px;padding:16px;background:rgba(255,255,255,0.1);border-radius:10px;backdrop-filter:blur(8px);display:none}.fallback a{color:#fff;text-decoration:none;font-weight:600;padding:10px 20px;background:rgba(255,255,255,0.2);border-radius:6px;display:inline-block;margin:4px;transition:all 0.2s ease;font-size:14px}.fallback a:hover{background:rgba(255,255,255,0.3);transform:translateY(-1px)}</style>`
}

function generateProductionRedirectScript(config: SmartLinkOptions, device: DeviceInfo, urlPath: string): string {
  const safeConfig = {
    target: config.target,
    urlPath,
    device: {
      isIOS: device.isIOS,
      isAndroid: device.isAndroid,
      isMobile: device.isMobile,
      isInAppBrowser: device.isInAppBrowser,
    },
    ios: {
      scheme: config.iosUrlScheme || '',
      universalLink: config.iosUniversalLink || '',
      appId: config.iosAppId || '',
    },
    android: {
      scheme: config.androidUrlScheme || '',
      package: config.androidPackageName || '',
    },
    timeouts: TIMEOUTS,
  }

  return `<script>
(function(){
'use strict';
const CONFIG=${safeJsonStringify(safeConfig)};
const elements={
  title:document.getElementById('title'),
  status:document.getElementById('status'),
  fallback:document.getElementById('fallback')
};
let redirected=false,appOpened=false,timeoutIds=[];

function clearTimeouts(){timeoutIds.forEach(clearTimeout);timeoutIds=[]}
function addTimeout(fn,delay){timeoutIds.push(setTimeout(fn,delay))}
function updateStatus(title,status){
  if(elements.title)elements.title.textContent=title;
  if(elements.status)elements.status.textContent=status;
}
function showFallback(){
  if(elements.fallback&&!redirected){
    elements.fallback.style.display='block';
  }
}
function performRedirect(){
  if(redirected)return;
  redirected=true;
  clearTimeouts();
  window.location.href=CONFIG.target;
}

function attemptIOSAppOpen(){
  if(appOpened||redirected)return;
  appOpened=true;
  updateStatus('Opening App...','Launching iOS app');

function attemptIOSAppOpen(){
  if(appOpened||redirected)return;
  appOpened=true;
  updateStatus('Opening App...','Launching iOS app');
  if(CONFIG.ios.universalLink){
    const universalUrl=CONFIG.target.startsWith(CONFIG.ios.universalLink)
      ?CONFIG.target
      :CONFIG.ios.universalLink+CONFIG.urlPath;

    try{
      window.location.href=universalUrl;
      const handleVisibilityChange=()=>{
        if(document.visibilityState==='hidden'){
          updateStatus('Success!','App opened successfully');
          document.removeEventListener('visibilitychange',handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange',handleVisibilityChange);

      addTimeout(()=>{
        document.removeEventListener('visibilitychange',handleVisibilityChange);
        if(document.visibilityState==='visible'){
          if(CONFIG.ios.appId){
            updateStatus('Opening App Store...','Downloading app');
            window.location.href='https://apps.apple.com/app/id'+CONFIG.ios.appId;
          }else performRedirect();
        }
      },CONFIG.timeouts.IOS_VISIBILITY);
      return;
    }catch(e){console.warn('Universal link failed:',e)}
  }

  if(CONFIG.ios.scheme){
    const schemeUrl=CONFIG.ios.scheme+'://open?url='+encodeURIComponent(CONFIG.target);
    addTimeout(()=>{
      if(!redirected){
        try{
          window.location.href=schemeUrl;
        }
        catch(e){console.warn('iOS scheme failed:',e)}
      }
    },CONFIG.timeouts.ANDROID_ATTEMPT);

    const handleVisibilityChange=()=>{
      if(document.visibilityState==='hidden'){
        updateStatus('Success!','App opened successfully');
        document.removeEventListener('visibilitychange',handleVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange',handleVisibilityChange);

    addTimeout(()=>{
      document.removeEventListener('visibilitychange',handleVisibilityChange);
      if(!redirected&&document.visibilityState==='visible'){
        showFallback();
        addTimeout(performRedirect,CONFIG.timeouts.FALLBACK);
      }
    },CONFIG.timeouts.FALLBACK);
  }

  addTimeout(performRedirect,CONFIG.timeouts.ULTIMATE);
}
  if(CONFIG.ios.scheme){
    const schemeUrl=CONFIG.ios.scheme+'://open/?url='+encodeURIComponent(CONFIG.target);
    addTimeout(()=>{
      if(!redirected){
        try{window.open(schemeUrl,'_self')}
        catch(e){console.warn('iOS scheme failed:',e)}
      }
    },CONFIG.timeouts.ANDROID_ATTEMPT);

    const handleVisibilityChange=()=>{
      if(document.visibilityState==='hidden'){
        updateStatus('Success!','App opened successfully');
        document.removeEventListener('visibilitychange',handleVisibilityChange);
      }
    };
    document.addEventListener('visibilitychange',handleVisibilityChange);

    addTimeout(()=>{
      document.removeEventListener('visibilitychange',handleVisibilityChange);
      if(!redirected&&document.visibilityState==='visible'){
        showFallback();
        addTimeout(performRedirect,CONFIG.timeouts.FALLBACK);
      }
    },CONFIG.timeouts.FALLBACK);
  }

  addTimeout(performRedirect,CONFIG.timeouts.ULTIMATE);
}

function attemptAndroidAppOpen(){
  if(appOpened||redirected)return;
  appOpened=true;
  updateStatus('Opening App...','Launching Android app');

  if(!CONFIG.android.scheme||!CONFIG.android.package){
    return performRedirect();
  }

  const intentUrl='intent://open?url='+encodeURIComponent(CONFIG.urlPath)
    +'#Intent;scheme='+CONFIG.android.scheme
    +';package='+CONFIG.android.package
    +';action=android.intent.action.VIEW'
    +';category=android.intent.category.BROWSABLE'
    +';end';

  let focused=true;
  const handleBlur=()=>{
    focused=false;
    updateStatus('Success!','App opened successfully');
    window.removeEventListener('blur',handleBlur);
    window.removeEventListener('focus',handleFocus);
  };
  const handleFocus=()=>{
    if(!focused){
      focused=true;
      addTimeout(()=>{if(!redirected)performRedirect()},0);
    }
  };

  window.addEventListener('blur',handleBlur);
  window.addEventListener('focus',handleFocus);

  try{
    window.location.href=intentUrl;
  }catch(e){
    console.warn('Android intent failed:',e);
    performRedirect();
  }

  addTimeout(()=>{
    window.removeEventListener('blur',handleBlur);
    window.removeEventListener('focus',handleFocus);
    performRedirect();
  },CONFIG.timeouts.ULTIMATE);
}

function handleInAppBrowser(){
  updateStatus('Opening in Browser...','Redirecting to external browser');
  addTimeout(()=>{
    if(!redirected){
      const a=document.createElement('a');
      a.href=CONFIG.target;
      a.target='_blank';
      a.rel='noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addTimeout(performRedirect,CONFIG.timeouts.REDIRECT);
    }
  },CONFIG.timeouts.IN_APP_REDIRECT);
}

function init(){
  if(CONFIG.device.isInAppBrowser){
    handleInAppBrowser();
  }else if(CONFIG.device.isIOS){
    addTimeout(attemptIOSAppOpen,CONFIG.timeouts.APP_DETECTION);
  }else if(CONFIG.device.isAndroid){
    addTimeout(attemptAndroidAppOpen,CONFIG.timeouts.APP_DETECTION);
  }else{
    updateStatus('Redirecting...','Taking you to your destination');
    addTimeout(performRedirect,CONFIG.timeouts.REDIRECT);
  }
}

history.pushState(null,null,location.href);
window.addEventListener('popstate',()=>history.pushState(null,null,location.href));

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else init();
})();
</script>`
}

export function generateSocialMetaResponse(event: any, config: SmartLinkOptions): string {
  const appName = config.androidAppName || DEFAULT_APP_NAME
  const escapedTarget = escapeHtml(config.target)
  const escapedAppName = escapeHtml(appName)

  setSecureHeaders(event)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:title" content="Open in ${escapedAppName}">
<meta property="og:description" content="Click to open this content in our mobile app">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Open in ${escapedAppName}">
<meta name="twitter:description" content="Click to open this content in our mobile app">
${config.iosAppId ? `<meta name="apple-itunes-app" content="app-id=${config.iosAppId}">` : ''}
<title>${escapedAppName} Link</title>
<meta http-equiv="refresh" content="0;url=${escapedTarget}">
</head>
<body>
<script>setTimeout(function(){window.location.href="${config.target.replace(/"/g, '\\"')}"}, 0);</script>
<p>Redirecting... <a href="${escapedTarget}">Click here if not redirected</a></p>
</body>
</html>`
}

export function generateAutoRedirectResponse(event: any, config: SmartLinkOptions, device: DeviceInfo): string {
  setSecureHeaders(event)

  const urlPath = config.target
  const escapedTarget = escapeHtml(config.target)
  const host = getRequestHost(event)

  const iosMetaTags = config.iosAppId && (config.iosUrlScheme || config.iosUniversalLink)
    ? `
<meta name="apple-itunes-app" content="app-id=${config.iosAppId}">
<meta property="al:ios:app_store_id" content="${config.iosAppId}">
<meta property="al:ios:url" content="${config.iosUniversalLink && config.target.startsWith(config.iosUniversalLink)
  ? config.target
  : config.target}">`
    : ''

  const androidMetaTags = config.androidPackageName
    ? `
<meta property="al:android:package" content="${config.androidPackageName}">
${config.androidUrlScheme
  ? `
<meta property="al:android:url" content="${config.androidUrlScheme}://open?url=${encodeURIComponent(urlPath)}">
<link rel="alternate" href="android-app://${config.androidPackageName}/${config.androidUrlScheme}/${host}${event.path}">`
  : ''}`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Redirecting...</title>
${iosMetaTags}${androidMetaTags}
${generateOptimizedStyles()}
</head>
<body>
<div class="container">
<h1 id="title">Redirecting...</h1>
<div class="spinner"></div>
<div class="status" id="status">Please wait while we redirect you</div>
<div class="fallback" id="fallback">
<p style="margin-bottom:15px">Taking too long?</p>
<a href="${escapedTarget}">Continue in Browser</a>
${config.iosAppId && device.isIOS
  ? `<a href="https://apps.apple.com/app/id${config.iosAppId}">Download App</a>`
  : ''}
${config.androidPackageName && device.isAndroid
  ? `<a href="https://play.google.com/store/apps/details?id=${config.androidPackageName}">Download App</a>`
  : ''}
</div>
</div>
${generateProductionRedirectScript(config, device, urlPath)}
</body>
</html>`
}
