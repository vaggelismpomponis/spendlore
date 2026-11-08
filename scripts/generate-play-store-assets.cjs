const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const Jimp = require('jimp');
const { getEmblemSvg, getFullLogoSvg } = require('./generate-vector-logo.cjs');

// Ensure output directories exist
const assetsDir = path.resolve(__dirname, '../assets');
const publicDir = path.resolve(__dirname, '../public');
const playStoreDir = path.resolve(__dirname, '../assets/google-play');
const docsScreenshotsDir = path.resolve(__dirname, '../docs/google-play-screenshots');

[assetsDir, publicDir, playStoreDir, docsScreenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load the authentic 3D ribbon mark
const emblemMarkBase64 = fs.existsSync(path.join(publicDir, 'spendlore-mark.png'))
  ? fs.readFileSync(path.join(publicDir, 'spendlore-mark.png')).toString('base64')
  : '';
const emblemImgSrc = `data:image/png;base64,${emblemMarkBase64}`;

// Common Lucide SVG icons for the mockups
const ICONS = {
  wallet: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  trendingUp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  shieldCheck: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  scan: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>`,
  mic: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  pieChart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  lock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  fingerprint: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>`,
  bell: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  eye: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  clock: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  target: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  sparkle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
};

// Common CSS for Google Play renders
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #08070D;
    color: #FFFFFF;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
  
  /* Smartphone Frame Mockup */
  .phone-mockup {
    position: relative;
    width: 780px;
    height: 1600px;
    border-radius: 64px;
    background: #0E0D16;
    border: 12px solid #282538;
    box-shadow: 
      0 0 0 4px #151322,
      0 40px 100px -20px rgba(0, 0, 0, 0.85),
      0 20px 50px -10px rgba(124, 58, 237, 0.25);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .phone-notch {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 30px;
    background: #000000;
    border-radius: 20px;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .phone-lens {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #0F172A;
    border: 1.5px solid #1E293B;
  }
  .phone-screen {
    flex: 1;
    background: #0D0C15;
    padding: 60px 32px 32px 32px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  
  /* Modern Executive Cards */
  .fin-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 24px;
    padding: 24px;
    backdrop-filter: blur(12px);
  }
  .glass-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(124, 58, 237, 0.12);
    border: 1px solid rgba(124, 58, 237, 0.3);
    color: #C4B5FD;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

// ── 1. Generate Google Play Feature Graphic (1024 x 500 px) ──
function getFeatureGraphicHtml() {
  const emblemSvg = getEmblemSvg();

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    ${BASE_CSS}
    body {
      width: 1024px;
      height: 500px;
      display: flex;
      position: relative;
      background: radial-gradient(circle at 75% 35%, rgba(124, 58, 237, 0.28) 0%, transparent 60%),
                  radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                  #08070D;
    }
    .fg-container {
      width: 100%;
      height: 100%;
      padding: 44px 56px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .left-col {
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.10);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -1px;
      font-family: 'Outfit', sans-serif;
    }
    .pro-badge {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      padding: 4px 10px;
      border-radius: 8px;
      background: #1E1B4B;
      border: 1px solid #4F46E5;
      color: #A5B4FC;
    }
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 42px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #FFFFFF 40%, #E2E8F0 70%, #A5B4FC 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 16px;
      line-height: 1.45;
      color: #94A3B8;
      font-weight: 500;
    }
    .pills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 6px;
    }
    .feature-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 7px 13px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      color: #E2E8F0;
    }
    .feature-pill svg {
      width: 14px;
      height: 14px;
      color: #34D399;
    }
    
    /* 3D Angled Phone Preview on Right */
    .phone-preview-wrapper {
      position: absolute;
      right: -20px;
      top: 30px;
      width: 440px;
      height: 600px;
      transform: perspective(1000px) rotateY(-18deg) rotateX(12deg) rotateZ(-4deg);
      filter: drop-shadow(-30px 40px 60px rgba(0, 0, 0, 0.9));
    }
    .phone-preview {
      width: 380px;
      height: 720px;
      border-radius: 44px;
      background: #0F0E18;
      border: 8px solid #2B283D;
      padding: 24px 20px;
      box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
  </style>
</head>
<body>
  <div class="fg-container">
    <div class="left-col">
      <div class="brand-row">
        <div class="brand-logo"><img src="${emblemImgSrc}" style="width:100%; height:100%; object-fit:contain;" alt="Spendlore" /></div>
        <div class="brand-name">Spendlore</div>
        <div class="pro-badge">PRO</div>
      </div>

      <div class="hero-title">
        Master Your Money with Absolute Clarity
      </div>

      <div class="hero-sub">
        Single source of truth personal finance with dynamic Safe-to-Burn calculations and on-device privacy.
      </div>

      <div class="pills-grid">
        <div class="feature-pill">${ICONS.trendingUp} Safe-to-Burn Engine</div>
        <div class="feature-pill">${ICONS.scan} Dual On-Device OCR</div>
        <div class="feature-pill">${ICONS.mic} Greek Voice Logging</div>
        <div class="feature-pill">${ICONS.shieldCheck} Biometric Security</div>
      </div>
    </div>

    <div class="phone-preview-wrapper">
      <div class="phone-preview">
        <!-- Mini Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div>
            <div style="font-size:11px; color:#94A3B8; text-transform:uppercase; font-weight:700; letter-spacing:1px;">Liquid Capital</div>
            <div style="font-size:28px; font-weight:900; font-family:'Outfit'; color:#FFFFFF;">€14,850.00</div>
          </div>
          <div style="padding:6px 10px; border-radius:10px; background:rgba(16,185,129,0.15); color:#34D399; font-size:12px; font-weight:800;">
            +8.4% ↑
          </div>
        </div>

        <!-- Safe-to-Burn Card -->
        <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:18px; text-align:center; margin-bottom:16px;">
          <div style="font-size:11px; color:#A78BFA; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px;">
            Safe-to-Burn • Today
          </div>
          <div style="font-size:36px; font-weight:900; font-family:'Outfit'; color:#34D399;">€78.50</div>
          <div style="display:inline-block; margin-top:8px; padding:3px 10px; border-radius:8px; background:rgba(245,158,11,0.15); color:#FBBF24; font-size:11px; font-weight:700;">
            14 Day Streak 🔥
          </div>
        </div>

        <!-- Recent Transactions -->
        <div style="font-size:11px; color:#64748B; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:10px;">Recent Activity</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:10px 14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px; height:32px; border-radius:10px; background:rgba(124,58,237,0.2); display:flex; align-items:center; justify-content:center; color:#A78BFA;">🛒</div>
              <div>
                <div style="font-size:13px; font-weight:700; color:#FFFFFF;">Σκλαβενίτης</div>
                <div style="font-size:10px; color:#64748B;">Supermarket • OCR</div>
              </div>
            </div>
            <div style="font-size:14px; font-weight:800; color:#F87171;">-€42.50</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:10px 14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px; height:32px; border-radius:10px; background:rgba(16,185,129,0.2); display:flex; align-items:center; justify-content:center; color:#34D399;">💼</div>
              <div>
                <div style="font-size:13px; font-weight:700; color:#FFFFFF;">Μισθοδοσία</div>
                <div style="font-size:10px; color:#64748B;">Verified Income</div>
              </div>
            </div>
            <div style="font-size:14px; font-weight:800; color:#34D399;">+€2,450.00</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── 2. Showcase Screenshot Generator Helper (1080 x 2400 px) ──
function getScreenshotHtml({ overline, title, subtitle, screenContent, bottomCard }) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    ${BASE_CSS}
    body {
      width: 1080px;
      height: 2400px;
      padding: 120px 80px 80px 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: radial-gradient(circle at 50% 15%, rgba(124, 58, 237, 0.25) 0%, transparent 65%),
                  radial-gradient(circle at 50% 85%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
                  #07060C;
      position: relative;
    }
    
    .header-zone {
      text-align: center;
      max-width: 920px;
      margin-bottom: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      z-index: 10;
    }
    .overline-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 24px;
      border-radius: 100px;
      background: rgba(124, 58, 237, 0.15);
      border: 1px solid rgba(124, 58, 237, 0.35);
      color: #DDD6FE;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .headline-main {
      font-family: 'Outfit', sans-serif;
      font-size: 64px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -2px;
      background: linear-gradient(135deg, #FFFFFF 40%, #E2E8F0 75%, #A5B4FC 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle-main {
      font-size: 24px;
      line-height: 1.45;
      color: #94A3B8;
      font-weight: 500;
      max-width: 820px;
    }
    
    .mockup-container {
      flex: 1;
      width: 100%;
      display: flex;
      justify-content: center;
      position: relative;
    }
  </style>
</head>
<body>
  <div class="header-zone">
    <div class="overline-badge">${overline}</div>
    <div class="headline-main">${title}</div>
    <div class="subtitle-main">${subtitle}</div>
  </div>

  <div class="mockup-container">
    <div class="phone-mockup">
      <div class="phone-notch">
        <div class="phone-lens"></div>
      </div>
      <div class="phone-screen">
        ${screenContent}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Screen Content Definitions ──

// Screen 1: Executive Financial Dashboard
function getDashboardScreenContent() {
  return `
    <!-- Top App Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.15); padding:7px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.35);">
          <img src="${emblemImgSrc}" style="width:100%; height:100%; object-fit:contain;" alt="Spendlore" />
        </div>
        <div>
          <div style="font-size:22px; font-weight:800; font-family:'Outfit'; letter-spacing:-0.5px; color:#FFFFFF;">Spendlore</div>
          <div style="font-size:12px; color:#94A3B8; font-weight:600;">Executive Finance</div>
        </div>
      </div>
      <div style="display:flex; gap:10px;">
        <div style="width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:#94A3B8;">${ICONS.eye}</div>
        <div style="width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:#94A3B8;">${ICONS.bell}</div>
      </div>
    </div>

    <!-- Liquid Capital Hero Card -->
    <div class="fin-card" style="margin-bottom:24px; background:linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,255,255,0.02) 100%);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1.5px;">Verified Liquid Balance</span>
        <span style="font-size:12px; font-weight:800; color:#34D399; background:rgba(16,185,129,0.15); padding:4px 10px; border-radius:8px;">+14.2% Month</span>
      </div>
      <div style="font-size:54px; font-weight:900; font-family:'Outfit'; letter-spacing:-1.5px; margin-bottom:14px;">€18,450.00</div>
      
      <!-- Trajectory Micro Chart -->
      <div style="height:60px; width:100%; position:relative; margin-bottom:12px;">
        <svg viewBox="0 0 400 60" style="width:100%; height:100%; overflow:visible;">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M 0 50 Q 80 45, 140 30 T 260 22 T 400 8 L 400 60 L 0 60 Z" fill="url(#chartGrad)"/>
          <path d="M 0 50 Q 80 45, 140 30 T 260 22 T 400 8" fill="none" stroke="#A78BFA" stroke-width="3" stroke-linecap="round"/>
          <circle cx="400" cy="8" r="5" fill="#34D399"/>
        </svg>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:13px; color:#94A3B8; font-weight:600; border-top:1px solid rgba(255,255,255,0.08); padding-top:14px;">
        <span>Month In: <strong style="color:#34D399;">+€4,200.00</strong></span>
        <span>Month Out: <strong style="color:#F87171;">-€1,640.00</strong></span>
      </div>
    </div>

    <!-- Safe-to-Burn Card Mini Preview -->
    <div class="fin-card" style="margin-bottom:24px; display:flex; align-items:center; justify-content:space-between;">
      <div>
        <div style="font-size:12px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Safe-to-Burn Daily Allowance</div>
        <div style="font-size:38px; font-weight:900; font-family:'Outfit'; color:#34D399;">€78.50</div>
        <div style="font-size:12px; color:#94A3B8; font-weight:500; margin-top:4px;">Discretionary spending limit for today</div>
      </div>
      <div style="width:72px; height:72px; border-radius:50%; border:6px solid #34D399; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#34D399; background:rgba(16,185,129,0.1);">
        82%
      </div>
    </div>

    <!-- Quick Action Grid -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:24px;">
      <div style="background:rgba(124,58,237,0.15); border:1px solid rgba(124,58,237,0.3); border-radius:18px; padding:16px; display:flex; align-items:center; gap:12px; color:#DDD6FE; font-weight:700; font-size:15px;">
        <div style="width:38px; height:38px; border-radius:10px; background:#7C3AED; display:flex; align-items:center; justify-content:center; color:#FFFFFF;">${ICONS.scan}</div>
        Scan Receipt
      </div>
      <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:16px; display:flex; align-items:center; gap:12px; color:#FFFFFF; font-weight:700; font-size:15px;">
        <div style="width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; color:#34D399;">${ICONS.mic}</div>
        Voice Log
      </div>
    </div>

    <!-- Verified Transactions Feed -->
    <div style="font-size:13px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Recent Transactions</div>
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:42px; height:42px; border-radius:12px; background:rgba(124,58,237,0.2); display:flex; align-items:center; justify-content:center; color:#A78BFA;">${ICONS.wallet}</div>
          <div>
            <div style="font-size:16px; font-weight:800; color:#FFFFFF;">Σκλαβενίτης Supermarket</div>
            <div style="font-size:12px; color:#64748B; font-weight:600;">Groceries • OCR Scanned</div>
          </div>
        </div>
        <div style="font-size:17px; font-weight:900; color:#F87171;">-€48.75</div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:16px 20px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:42px; height:42px; border-radius:12px; background:rgba(245,158,11,0.2); display:flex; align-items:center; justify-content:center; color:#F59E0B;">${ICONS.clock}</div>
          <div>
            <div style="font-size:16px; font-weight:800; color:#FFFFFF;">Coffee Island</div>
            <div style="font-size:12px; color:#64748B; font-weight:600;">Daily Cafe • Voice Log</div>
          </div>
        </div>
        <div style="font-size:17px; font-weight:900; color:#F87171;">-€3.60</div>
      </div>
    </div>
  `;
}

// Screen 2: Dynamic Safe-to-Burn Engine
function getSafeToBurnScreenContent() {
  return `
    <div style="text-align:center; margin-bottom:32px;">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
        Adaptive Discretionary Engine
      </div>
      <div style="font-size:32px; font-weight:900; font-family:'Outfit'; color:#FFFFFF;">Safe-to-Burn™</div>
    </div>

    <!-- Giant Radial Burn Ring Card -->
    <div class="fin-card" style="display:flex; flex-direction:column; align-items:center; padding:44px 24px; margin-bottom:28px;">
      <div style="position:relative; width:260px; height:260px; display:flex; align-items:center; justify-content:center; margin-bottom:24px;">
        <svg viewBox="0 0 260 260" style="width:100%; height:100%; transform:rotate(-90deg);">
          <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="18"/>
          <circle cx="130" cy="130" r="110" fill="none" stroke="#34D399" stroke-width="18" stroke-dasharray="691" stroke-dashoffset="180" stroke-linecap="round"/>
        </svg>
        <div style="position:absolute; display:flex; flex-direction:column; align-items:center;">
          <div style="font-size:13px; color:#94A3B8; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Today's Allowance</div>
          <div style="font-size:62px; font-weight:900; font-family:'Outfit'; color:#FFFFFF; letter-spacing:-2px;">€78.50</div>
          <div style="font-size:13px; color:#34D399; font-weight:800; background:rgba(16,185,129,0.15); padding:4px 12px; border-radius:10px;">
            Safe Velocity
          </div>
        </div>
      </div>

      <div style="display:inline-flex; align-items:center; gap:8px; padding:8px 18px; border-radius:12px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:#FBBF24; font-size:15px; font-weight:800;">
        🔥 14-Day Spending Streak Active
      </div>
    </div>

    <!-- Breakdown Mathematics Card -->
    <div class="fin-card">
      <div style="font-size:14px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
        Algorithmic Projection Factors
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:600;">
          <span style="color:#94A3B8;">Verified Current Month Income</span>
          <strong style="color:#34D399;">+€3,400.00</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:600;">
          <span style="color:#94A3B8;">Fixed Monthly Liabilities</span>
          <strong style="color:#F87171;">-€1,120.00</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:600;">
          <span style="color:#94A3B8;">Allocated Savings Goals</span>
          <strong style="color:#60A5FA;">-€450.00</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:600; border-top:1px solid rgba(255,255,255,0.08); padding-top:14px;">
          <span style="color:#FFFFFF; font-weight:700;">Remaining Discretionary Pool</span>
          <strong style="color:#FFFFFF; font-weight:900;">€1,830.00</strong>
        </div>
      </div>
    </div>
  `;
}

// Screen 3: Zero-Friction Capture (OCR & Voice)
function getOcrVoiceScreenContent() {
  return `
    <div style="text-align:center; margin-bottom:28px;">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
        Zero-Friction Transaction Capture
      </div>
      <div style="font-size:32px; font-weight:900; font-family:'Outfit'; color:#FFFFFF;">On-Device OCR & Voice</div>
    </div>

    <!-- Live OCR Scanner Viewfinder Card -->
    <div class="fin-card" style="margin-bottom:24px; position:relative; overflow:hidden;">
      <div style="font-size:13px; font-weight:800; color:#34D399; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px; display:flex; align-items:center; gap:8px;">
        <span style="width:8px; height:8px; border-radius:50%; background:#34D399; display:inline-block;"></span>
        Greek & English OCR Active
      </div>

      <!-- Scanned Receipt Mockup with Detection Boxes -->
      <div style="background:#1A1829; border:2px dashed #7C3AED; border-radius:18px; padding:20px; position:relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="background:rgba(124,58,237,0.3); border:1px solid #7C3AED; color:#DDD6FE; font-size:12px; font-weight:800; padding:4px 10px; border-radius:8px;">
            MERCHANT DETECTED
          </span>
          <span style="font-size:13px; font-weight:700; color:#FFFFFF;">ΣΚΛΑΒΕΝΙΤΗΣ Α.Ε.Ε.</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span style="background:rgba(255,255,255,0.1); color:#94A3B8; font-size:12px; font-weight:700; padding:4px 8px; border-radius:6px;">
            DATE
          </span>
          <span style="font-size:13px; font-weight:600; color:#CBD5E1;">07/11/2026 18:42</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(16,185,129,0.12); border:1px solid #059669; border-radius:12px; padding:12px 16px;">
          <span style="font-size:14px; font-weight:800; color:#34D399;">EXTRACTED TOTAL</span>
          <span style="font-size:24px; font-weight:900; font-family:'Outfit'; color:#34D399;">€48.75</span>
        </div>
      </div>
    </div>

    <!-- Natural Voice Capture Card -->
    <div class="fin-card" style="background:linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(255,255,255,0.03) 100%);">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
        <div style="font-size:13px; font-weight:800; color:#DDD6FE; text-transform:uppercase; letter-spacing:1px;">
          Natural Voice Parsing (el-GR)
        </div>
        <div style="width:36px; height:36px; border-radius:50%; background:#7C3AED; display:flex; align-items:center; justify-content:center; color:#FFFFFF;">
          ${ICONS.mic}
        </div>
      </div>

      <!-- Audio Waveform Visualization -->
      <div style="display:flex; align-items:center; justify-content:center; gap:6px; height:46px; margin-bottom:18px;">
        <div style="width:5px; height:24px; background:#7C3AED; border-radius:10px;"></div>
        <div style="width:5px; height:38px; background:#8B5CF6; border-radius:10px;"></div>
        <div style="width:5px; height:44px; background:#A855F7; border-radius:10px;"></div>
        <div style="width:5px; height:30px; background:#C084FC; border-radius:10px;"></div>
        <div style="width:5px; height:46px; background:#34D399; border-radius:10px;"></div>
        <div style="width:5px; height:28px; background:#8B5CF6; border-radius:10px;"></div>
        <div style="width:5px; height:18px; background:#7C3AED; border-radius:10px;"></div>
      </div>

      <div style="background:rgba(0,0,0,0.3); border-radius:14px; padding:16px; margin-bottom:14px;">
        <div style="font-size:12px; color:#94A3B8; margin-bottom:4px; font-weight:600;">Spoken Input:</div>
        <div style="font-size:16px; font-weight:700; color:#FFFFFF; font-style:italic;">
          "Σαράντα οκτώ ευρώ και εβδομήντα πέντε λεπτά στο σούπερ μάρκετ"
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:700;">
        <span style="color:#A78BFA;">→ Parsed Category: <strong>Groceries</strong></span>
        <span style="color:#34D399;">Ready to Log ✓</span>
      </div>
    </div>
  `;
}

// Screen 4: Intelligent Category Analytics & Budgets
function getAnalyticsBudgetsScreenContent() {
  return `
    <div style="text-align:center; margin-bottom:28px;">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
        Intelligent Velocity & Caps
      </div>
      <div style="font-size:32px; font-weight:900; font-family:'Outfit'; color:#FFFFFF;">Analytics & Budgets</div>
    </div>

    <!-- Category Donut Card -->
    <div class="fin-card" style="margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1px;">Monthly Category Distribution</span>
        <span style="font-size:12px; font-weight:700; color:#94A3B8;">November 2026</span>
      </div>

      <!-- Donut Graphic Simulation -->
      <div style="display:flex; align-items:center; justify-content:space-around; margin-bottom:20px;">
        <div style="position:relative; width:150px; height:150px; display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 150 150" style="width:100%; height:100%; transform:rotate(-90deg);">
            <circle cx="75" cy="75" r="55" fill="none" stroke="#7C3AED" stroke-width="20" stroke-dasharray="345" stroke-dashoffset="120"/>
            <circle cx="75" cy="75" r="55" fill="none" stroke="#34D399" stroke-width="20" stroke-dasharray="345" stroke-dashoffset="240"/>
            <circle cx="75" cy="75" r="55" fill="none" stroke="#F59E0B" stroke-width="20" stroke-dasharray="345" stroke-dashoffset="300"/>
          </svg>
          <div style="position:absolute; text-align:center;">
            <div style="font-size:11px; color:#94A3B8; font-weight:700;">TOTAL</div>
            <div style="font-size:18px; font-weight:900; font-family:'Outfit';">€1,640</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; font-weight:700;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:#7C3AED;"></span>
            <span style="color:#CBD5E1;">Housing: 42%</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:#34D399;"></span>
            <span style="color:#CBD5E1;">Groceries: 28%</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:#F59E0B;"></span>
            <span style="color:#CBD5E1;">Transport: 16%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Proactive Budget Threshold Cards -->
    <div class="fin-card">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
        Proactive Budget Thresholds
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Groceries: 78% -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; margin-bottom:6px;">
            <span style="color:#FFFFFF;">🛒 Supermarket & Groceries</span>
            <span style="color:#34D399;">€390 / €500 (78%)</span>
          </div>
          <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
            <div style="width:78%; height:100%; background:#34D399; border-radius:10px;"></div>
          </div>
        </div>

        <!-- Dining Out: 88% Alert -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:700; margin-bottom:6px;">
            <span style="color:#FFFFFF;">🍽️ Restaurants & Dining</span>
            <span style="color:#FBBF24;">€220 / €250 (88% Warning)</span>
          </div>
          <div style="height:10px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
            <div style="width:88%; height:100%; background:#F59E0B; border-radius:10px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Screen 5: Bank-Grade Security & Privacy Shield
function getSecurityScreenContent() {
  return `
    <div style="text-align:center; margin-bottom:28px;">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px;">
        Bank-Grade Defense-in-Depth
      </div>
      <div style="font-size:32px; font-weight:900; font-family:'Outfit'; color:#FFFFFF;">Biometrics & Privacy</div>
    </div>

    <!-- Obsidian Vault Lockscreen Card -->
    <div class="fin-card" style="display:flex; flex-direction:column; align-items:center; padding:36px 24px; margin-bottom:24px; text-align:center; background:linear-gradient(180deg, rgba(124,58,237,0.15) 0%, rgba(0,0,0,0.4) 100%);">
      <div style="width:72px; height:72px; border-radius:20px; background:rgba(255,255,255,0.10); border:1px solid rgba(255,255,255,0.15); padding:10px; box-shadow:0 8px 24px rgba(0,0,0,0.35); margin-bottom:18px; display:flex; align-items:center; justify-content:center;">
        <img src="${emblemImgSrc}" style="width:100%; height:100%; object-fit:contain;" alt="Spendlore" />
      </div>

      <div style="font-size:24px; font-weight:800; font-family:'Outfit'; letter-spacing:-0.5px; margin-bottom:6px; color:#FFFFFF;">Spendlore Vault</div>
      <div style="font-size:13px; color:#94A3B8; font-weight:600; margin-bottom:24px;">Biometric Authentication Required</div>

      <!-- PIN Code Dots -->
      <div style="display:flex; gap:16px; margin-bottom:28px;">
        <div style="width:14px; height:14px; border-radius:50%; background:#7C3AED; box-shadow:0 0 10px #7C3AED;"></div>
        <div style="width:14px; height:14px; border-radius:50%; background:#7C3AED; box-shadow:0 0 10px #7C3AED;"></div>
        <div style="width:14px; height:14px; border-radius:50%; background:#7C3AED; box-shadow:0 0 10px #7C3AED;"></div>
        <div style="width:14px; height:14px; border-radius:50%; background:rgba(255,255,255,0.2);"></div>
      </div>

      <!-- Biometric Modal Prompt -->
      <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:18px 24px; display:flex; align-items:center; gap:16px; width:100%; max-width:320px;">
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; color:#34D399;">
          ${ICONS.fingerprint}
        </div>
        <div style="text-align:left;">
          <div style="font-size:14px; font-weight:800; color:#FFFFFF;">Fingerprint Sensor</div>
          <div style="font-size:11px; color:#34D399; font-weight:700;">Sensor Ready • Touch to Unlock</div>
        </div>
      </div>
    </div>

    <!-- Security Attributes List -->
    <div class="fin-card">
      <div style="font-size:13px; font-weight:800; color:#A78BFA; text-transform:uppercase; letter-spacing:1px; margin-bottom:16px;">
        Hardware & Protocol Protections
      </div>
      <div style="display:flex; flex-direction:column; gap:14px; font-size:14px; font-weight:700;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:8px; color:#CBD5E1;"><span style="color:#A78BFA; display:flex; align-items:center;">${ICONS.shieldCheck}</span> App Switcher Privacy Screen</span>
          <span style="color:#34D399;">Active</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:8px; color:#CBD5E1;"><span style="color:#A78BFA; display:flex; align-items:center;">${ICONS.eye}</span> One-Click Amount Blur Mask</span>
          <span style="color:#34D399;">Active</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="display:flex; align-items:center; gap:8px; color:#CBD5E1;"><span style="color:#A78BFA; display:flex; align-items:center;">${ICONS.lock}</span> Row-Level PostgreSQL Security</span>
          <span style="color:#34D399;">Enforced</span>
        </div>
      </div>
    </div>
  `;
}

// ── Master Runner Function ──
async function buildAllAssets() {
  console.log('=== Starting Professional Spendlore Logo & Google Play Suite Generation ===');

  // 1. Output Master SVG Vectors (if needed)
  console.log('Writing Master SVG Vector Files...');
  fs.writeFileSync(path.join(assetsDir, 'logo.svg'), getEmblemSvg(), 'utf-8');

  // Launch Playwright Chromium
  const browser = await chromium.launch();

  // 1. Render Google Play Feature Graphic (1024 x 500 px)
  console.log('Rendering Google Play Feature Graphic (1024 x 500 px)...');
  const fgPage = await browser.newPage({ viewport: { width: 1024, height: 500, deviceScaleFactor: 1 } });
  await fgPage.setContent(getFeatureGraphicHtml());
  const fgBuf = await fgPage.screenshot({ type: 'jpeg', quality: 95 });
  fs.writeFileSync(path.join(assetsDir, 'play-store-feature-graphic.jpg'), fgBuf);
  fs.writeFileSync(path.join(playStoreDir, '00_feature_graphic_1024x500.jpg'), fgBuf);
  await fgPage.close();

  // 7. Render 5 Master Showcase Screenshots (1080 x 2400 px)
  const screens = [
    {
      filename: '01_dashboard_overview.png',
      overline: 'FINANCIAL COMMAND CENTER',
      title: 'Master Your Money with Absolute Clarity',
      subtitle: 'Real-time liquid balance, month balance trajectory, and single-source-of-truth ledger.',
      content: getDashboardScreenContent()
    },
    {
      filename: '02_safe_to_burn.png',
      overline: 'ADAPTIVE DISCRETIONARY ENGINE',
      title: 'Know Exactly What You Can Spend Today',
      subtitle: 'Intelligent algorithm factors verified income, fixed liabilities & active savings goals in real time.',
      content: getSafeToBurnScreenContent()
    },
    {
      filename: '03_ocr_receipts_voice.png',
      overline: 'ZERO-FRICTION CAPTURE',
      title: 'Scan Receipts & Speak Naturally',
      subtitle: 'On-device dual-engine OCR scanner & Greek/English natural voice transaction logging.',
      content: getOcrVoiceScreenContent()
    },
    {
      filename: '04_analytics_budgets.png',
      overline: 'INTELLIGENT SPEND VELOCITY',
      title: 'Visualize Expenses & Enforce Budgets',
      subtitle: 'Interactive category velocity analytics with automated 80% & 100% threshold notifications.',
      content: getAnalyticsBudgetsScreenContent()
    },
    {
      filename: '05_security_privacy.png',
      overline: 'BANK-GRADE DEFENSE-IN-DEPTH',
      title: 'Biometric Security & Total Privacy',
      subtitle: 'Fingerprint & Face ID unlock, App Switcher Privacy Screen, and instant One-Click Mask.',
      content: getSecurityScreenContent()
    }
  ];

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    console.log(`Rendering Screenshot ${i + 1}/5: ${s.filename} (1080 x 2400 px)...`);
    const sPage = await browser.newPage({ viewport: { width: 1080, height: 2400, deviceScaleFactor: 1 } });
    const html = getScreenshotHtml({
      overline: s.overline,
      title: s.title,
      subtitle: s.subtitle,
      screenContent: s.content
    });
    await sPage.setContent(html);
    const sBuf = await sPage.screenshot();

    // Save to both playStoreDir and docsScreenshotsDir
    fs.writeFileSync(path.join(playStoreDir, s.filename), sBuf);
    fs.writeFileSync(path.join(docsScreenshotsDir, s.filename), sBuf);
    await sPage.close();
  }

  await browser.close();
  console.log('✓ All Google Play graphics & master brand assets rendered successfully!');
}

buildAllAssets().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

