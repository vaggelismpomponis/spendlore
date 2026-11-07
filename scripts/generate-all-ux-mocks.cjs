const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const { getEmblemSvg } = require('./generate-vector-logo.cjs');

const outDir = path.resolve(__dirname, '../docs/ux-mocks');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Common Lucide SVG icons
const ICONS = {
  wallet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
  trendingUp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  trendingDown: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  shieldCheck: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  scan: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>`,
  mic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  pieChart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  eye: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  lightbulb: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  plus: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  chevronRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  repeat: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
  checkCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  filter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  fingerprint: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
};

const COMMON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #F8FAFC;
    color: #0F172A;
    -webkit-font-smoothing: antialiased;
  }
  .font-display { font-family: 'Outfit', sans-serif; }
  .card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 18px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
  }
`;

function getDesktopShell(activeNav, contentHtml) {
  const emblemSvg = getEmblemSvg();
  const navItems = [
    { id: 'home', label: 'Αρχική', icon: ICONS.home, group: 'ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ' },
    { id: 'stats', label: 'Ανάλυση', icon: ICONS.pieChart, group: 'ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ' },
    { id: 'history', label: 'Ιστορικό', icon: ICONS.clock, group: 'ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ' },
    { id: 'goals', label: 'Στόχοι', icon: ICONS.target, group: 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ' },
    { id: 'budgets', label: 'Προϋπολογισμοί', icon: ICONS.wallet, group: 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ' },
    { id: 'recurring', label: 'Επαναλαμβανόμενα', icon: ICONS.repeat, group: 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ' },
    { id: 'advisor', label: 'Spendlore AI Σύμβουλος', icon: ICONS.lightbulb, group: 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ' },
    { id: 'settings', label: 'Ρυθμίσεις', icon: ICONS.settings, group: 'ΡΥΘΜΙΣΕΙΣ' }
  ];

  const mainPages = navItems.filter(i => i.group === 'ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ');
  const quickAccess = navItems.filter(i => i.group === 'ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ');
  const settingsPages = navItems.filter(i => i.group === 'ΡΥΘΜΙΣΕΙΣ');

  const renderNav = (items) => items.map(item => `
    <div class="nav-item ${item.id === activeNav ? 'active' : ''}">
      ${item.icon} <span>${item.label}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_CSS}
    body {
      width: 1440px;
      height: 1024px;
      display: flex;
      background: #F8FAFC;
      overflow: hidden;
    }
    .sidebar {
      width: 270px;
      background: #FFFFFF;
      border-right: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 20px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 24px;
      border-bottom: 1px solid #F1F5F9;
      margin-bottom: 20px;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 18px;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
      padding-left: 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .nav-item.active {
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 700;
    }
    .nav-item:hover:not(.active) {
      background: #F1F5F9;
      color: #0F172A;
    }
    .main-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 32px 40px;
      gap: 24px;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div>
      <div class="brand-header">
        <div style="width:38px;height:38px;border-radius:12px;background:#0F172A;padding:5px;box-shadow:0 4px 12px rgba(15,23,42,0.15);">${emblemSvg}</div>
        <div>
          <div style="font-family:'Outfit';font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#0F172A;">Spendlore</div>
          <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Executive Finance</div>
        </div>
      </div>

      <div class="nav-group">
        <div class="nav-label">ΚΥΡΙΕΣ ΣΕΛΙΔΕΣ</div>
        ${renderNav(mainPages)}
      </div>

      <div class="nav-group">
        <div class="nav-label">ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ</div>
        ${renderNav(quickAccess)}
      </div>

      <div class="nav-group">
        <div class="nav-label">ΡΥΘΜΙΣΕΙΣ</div>
        ${renderNav(settingsPages)}
      </div>
    </div>

    <!-- Bottom Profile Box -->
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px;">
      <div style="width:38px;height:38px;border-radius:12px;background:#7C3AED;color:#FFF;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;">ΒΜ</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:800;color:#0F172A;truncate">Βαγγέλης Μπομπόνης</div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">
          <span style="font-size:9px;font-weight:900;color:#7C3AED;background:rgba(124,58,237,0.1);padding:1px 6px;border-radius:4px;">PRO</span>
          <span style="font-size:10px;color:#64748B;font-weight:600;">v1.1.39</span>
        </div>
      </div>
      <div style="color:#94A3B8;">${ICONS.settings}</div>
    </div>
  </aside>

  <main class="main-view">
    ${contentHtml}
  </main>
</body>
</html>`;
}

function getMobileShell(activeNav, contentHtml) {
  const emblemSvg = getEmblemSvg();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${COMMON_CSS}
    body {
      width: 412px;
      height: 915px;
      background: #F8FAFC;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .mobile-header {
      padding: 16px 20px 12px 20px;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .mobile-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 90px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .bottom-nav {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 70px;
      background: #FFFFFF;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 12px;
      z-index: 40;
    }
    .nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      cursor: pointer;
    }
    .nav-tab.active {
      color: #7C3AED;
    }
    .fab-btn {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: #0F172A;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25);
      border: 3px solid #FFFFFF;
      margin-top: -24px;
    }
  </style>
</head>
<body>
  <header class="mobile-header">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:34px;height:34px;border-radius:10px;background:#0F172A;padding:4px;box-shadow:0 2px 8px rgba(15,23,42,0.15);">${emblemSvg}</div>
      <div>
        <div style="font-family:'Outfit';font-size:18px;font-weight:900;color:#0F172A;line-height:1.1;">Spendlore</div>
        <div style="font-size:10px;color:#64748B;font-weight:700;text-transform:uppercase;">${activeNav.toUpperCase()}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:34px;height:34px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#64748B;">${ICONS.eye}</div>
      <div style="width:34px;height:34px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#64748B;">${ICONS.bell}</div>
    </div>
  </header>

  <div class="mobile-content">
    ${contentHtml}
  </div>

  <nav class="bottom-nav">
    <div class="nav-tab ${activeNav === 'home' ? 'active' : ''}">${ICONS.home} <span>Αρχική</span></div>
    <div class="nav-tab ${activeNav === 'stats' ? 'active' : ''}">${ICONS.pieChart} <span>Ανάλυση</span></div>
    <div class="fab-btn">${ICONS.plus}</div>
    <div class="nav-tab ${activeNav === 'history' ? 'active' : ''}">${ICONS.clock} <span>Ιστορικό</span></div>
    <div class="nav-tab ${activeNav === 'settings' ? 'active' : ''}">${ICONS.settings} <span>Ρυθμίσεις</span></div>
  </nav>
</body>
</html>`;
}

// ── 1. STATS / ANALYTICS MOCK ──
function getStatsDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Οικονομική Ανάλυση & Τάσεις</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Λεπτομερής ταχύτητα κατανάλωσης, τάσεις κατηγοριών και κατανομή</p>
      </div>
      <div style="display:flex;gap:10px;">
        <div style="display:flex;background:#FFF;border:1px solid #E2E8F0;border-radius:12px;padding:3px;">
          <span style="padding:6px 14px;background:#0F172A;color:#FFF;border-radius:8px;font-size:12px;font-weight:700;">Νοέμβριος 2026</span>
          <span style="padding:6px 14px;color:#64748B;font-size:12px;font-weight:600;">Οκτώβριος 2026</span>
          <span style="padding:6px 14px;color:#64748B;font-size:12px;font-weight:600;">Έτος 2026</span>
        </div>
        <button style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:1px solid #E2E8F0;background:#FFF;color:#0F172A;font-weight:700;font-size:13px;cursor:pointer;">
          ${ICONS.download} Εξαγωγή CSV
        </button>
      </div>
    </div>

    <!-- 3 Metrics Top Cards -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
      <div class="card" style="padding:22px;border-top:3px solid #7C3AED;">
        <span style="font-size:11px;font-weight:800;color:#6D28D9;text-transform:uppercase;letter-spacing:1px;">ΜΕΣΗ ΗΜΕΡΗΣΙΑ ΔΑΠΑΝΗ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;margin-top:4px;">39,71 €</div>
        <div style="font-size:12px;color:#059669;font-weight:700;margin-top:4px;">↓ 18% χαμηλότερα από τον στόχο (48,50 €)</div>
      </div>

      <div class="card" style="padding:22px;border-top:3px solid #06B6D4;">
        <span style="font-size:11px;font-weight:800;color:#0891B2;text-transform:uppercase;letter-spacing:1px;">ΜΕΓΑΛΥΤΕΡΗ ΚΑΤΗΓΟΡΙΑ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;margin-top:4px;">Αγορές (38%)</div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-top:4px;">71,03 € συνολικά αυτόν τον μήνα</div>
      </div>

      <div class="card" style="padding:22px;border-top:3px solid #10B981;">
        <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1px;">ΤΑΧΥΤΗΤΑ ΕΞΟΔΩΝ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#059669;margin-top:4px;">Ασφαλής Ρυθμός</div>
        <div style="font-size:12px;color:#047857;font-weight:700;margin-top:4px;">Προβολή τέλους μήνα: 1.190 € (Εντός ορίων)</div>
      </div>
    </div>

    <!-- Charts Split -->
    <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:24px;">
      <!-- Spline Curve Chart Card -->
      <div class="card" style="padding:26px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;">Ημερήσια Εξέλιξη Εξόδων vs Προϋπολογισμός</h3>
          <span class="pill" style="background:#F1F5F9;color:#475569;">1 - 7 Νοεμβρίου</span>
        </div>
        
        <div style="height:260px;width:100%;position:relative;">
          <svg viewBox="0 0 600 240" style="width:100%;height:100%;overflow:visible;">
            <defs>
              <linearGradient id="statsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" stroke-width="1"/>
            <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" stroke-width="1"/>
            <line x1="0" y1="160" x2="600" y2="160" stroke="#F1F5F9" stroke-width="1"/>
            <line x1="0" y1="220" x2="600" y2="220" stroke="#E2E8F0" stroke-width="1.5"/>

            <!-- Target Budget Line -->
            <line x1="0" y1="90" x2="600" y2="90" stroke="#10B981" stroke-width="2" stroke-dasharray="6 6"/>

            <!-- Actual Spend Area -->
            <path d="M 0 220 L 100 200 L 200 180 L 300 150 L 400 140 L 500 110 L 600 95 L 600 220 Z" fill="url(#statsFill)"/>
            <path d="M 0 220 L 100 200 L 200 180 L 300 150 L 400 140 L 500 110 L 600 95" fill="none" stroke="#7C3AED" stroke-width="3" stroke-linecap="round"/>
            <circle cx="600" cy="95" r="5" fill="#7C3AED"/>
          </svg>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#94A3B8;margin-top:12px;">
          <span>1 Νοε</span><span>2 Νοε</span><span>3 Νοε</span><span>4 Νοε</span><span>5 Νοε</span><span>6 Νοε</span><span>7 Νοε</span>
        </div>
      </div>

      <!-- Donut & Category List -->
      <div class="card" style="padding:26px;">
        <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:16px;">Κατανομή Δαπανών</h3>
        
        <div style="display:flex;align-items:center;justify-content:center;height:140px;position:relative;margin-bottom:20px;">
          <svg viewBox="0 0 140 140" style="width:140px;height:140px;transform:rotate(-90deg);">
            <circle cx="70" cy="70" r="50" fill="none" stroke="#7C3AED" stroke-width="18" stroke-dasharray="314" stroke-dashoffset="120"/>
            <circle cx="70" cy="70" r="50" fill="none" stroke="#06B6D4" stroke-width="18" stroke-dasharray="314" stroke-dashoffset="230"/>
            <circle cx="70" cy="70" r="50" fill="none" stroke="#F59E0B" stroke-width="18" stroke-dasharray="314" stroke-dashoffset="280"/>
          </svg>
          <div style="position:absolute;text-align:center;">
            <div style="font-size:11px;color:#94A3B8;font-weight:700;">ΣΥΝΟΛΟ</div>
            <div style="font-size:18px;font-weight:900;font-family:'Outfit';">278,10 €</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;font-weight:700;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#7C3AED;"></span> Αγορές</span>
            <span style="color:#0F172A;">71,03 € (38%)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#06B6D4;"></span> Λογαριασμοί</span>
            <span style="color:#0F172A;">59,08 € (28%)</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#F59E0B;"></span> Βενζίνη</span>
            <span style="color:#0F172A;">50,00 € (20%)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStatsMobile() {
  return `
    <div class="card" style="padding:18px;text-align:center;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;">ΕΞΟΔΑ ΝΟΕΜΒΡΙΟΥ 2026</span>
      <div style="font-family:'Outfit';font-size:38px;font-weight:900;color:#0F172A;margin-top:4px;">278,10 €</div>
      <div style="font-size:12px;color:#059669;font-weight:700;margin-top:2px;">↓ 81% χαμηλότερα από τον μέσο όρο</div>

      <!-- Mini Donut -->
      <div style="display:flex;align-items:center;justify-content:center;height:120px;position:relative;margin:16px 0;">
        <svg viewBox="0 0 120 120" style="width:120px;height:120px;transform:rotate(-90deg);">
          <circle cx="60" cy="60" r="44" fill="none" stroke="#7C3AED" stroke-width="16" stroke-dasharray="276" stroke-dashoffset="100"/>
          <circle cx="60" cy="60" r="44" fill="none" stroke="#06B6D4" stroke-width="16" stroke-dasharray="276" stroke-dashoffset="200"/>
          <circle cx="60" cy="60" r="44" fill="none" stroke="#F59E0B" stroke-width="16" stroke-dasharray="276" stroke-dashoffset="250"/>
        </svg>
      </div>

      <div style="display:flex;justify-content:space-around;font-size:12px;font-weight:700;border-top:1px solid #F1F5F9;padding-top:12px;">
        <span>🛒 Αγορές: 38%</span>
        <span>📄 Λογ.: 28%</span>
        <span>⛽ Βενζ.: 20%</span>
      </div>
    </div>

    <!-- Category Velocity List -->
    <div class="card" style="padding:18px;">
      <div style="font-size:13px;font-weight:800;color:#0F172A;margin-bottom:14px;">Κορυφαίες Κατηγορίες</div>
      
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;">
            <span>🛒 Αγορές</span>
            <span>71,03 €</span>
          </div>
          <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
            <div style="width:38%;height:100%;background:#7C3AED;border-radius:6px;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;">
            <span>📄 Λογαριασμοί</span>
            <span>59,08 €</span>
          </div>
          <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
            <div style="width:28%;height:100%;background:#06B6D4;border-radius:6px;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:4px;">
            <span>⛽ Βενζίνη</span>
            <span>50,00 €</span>
          </div>
          <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
            <div style="width:20%;height:100%;background:#F59E0B;border-radius:6px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── 2. HISTORY MOCK ──
function getHistoryDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Ιστορικό Συναλλαγών</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Πλήρες αρχείο καταγραφών με φίλτρα, αποδείξεις και αναζήτηση</p>
      </div>
      <div style="display:flex;gap:12px;">
        <div style="display:flex;align-items:center;gap:8px;background:#FFF;border:1px solid #E2E8F0;border-radius:12px;padding:8px 14px;width:280px;">
          ${ICONS.search}
          <input type="text" placeholder="Αναζήτηση συναλλαγής..." style="border:none;outline:none;font-size:13px;width:100%;color:#0F172A;" value="">
        </div>
        <button style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;background:#0F172A;color:#FFF;font-weight:800;font-size:13px;border:none;cursor:pointer;">
          ${ICONS.plus} Νέα Εγγραφή
        </button>
      </div>
    </div>

    <!-- Summary strip -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;">
      <div class="card" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:700;color:#64748B;">Εισροές Μήνα:</span>
        <span style="font-size:18px;font-weight:900;color:#059669;">+3.400,00 €</span>
      </div>
      <div class="card" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:700;color:#64748B;">Εκροές Μήνα:</span>
        <span style="font-size:18px;font-weight:900;color:#E11D48;">-1.120,00 €</span>
      </div>
      <div class="card" style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:700;color:#64748B;">Καθαρή Μεταβολή:</span>
        <span style="font-size:18px;font-weight:900;color:#0F172A;">+2.280,00 €</span>
      </div>
    </div>

    <!-- Ledger Group 1 -->
    <div class="card" style="padding:22px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:13px;font-weight:800;color:#0F172A;">Σάββατο, 7 Νοεμβρίου 2026 (Σήμερα)</span>
        <span style="font-size:13px;font-weight:900;color:#E11D48;">Ημερήσιο Σύνολο: -35,00 €</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;font-size:16px;">⛽</div>
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">Βενζίνη • Shell</div>
              <div style="font-size:12px;color:#64748B;">18:14 • Alpha Bank Debit • Μετακίνηση</div>
            </div>
          </div>
          <div style="font-size:16px;font-weight:900;color:#E11D48;">-20,00 €</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:16px;">✂️</div>
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">Κούρεμα • Barber</div>
              <div style="font-size:12px;color:#64748B;">12:30 • Μετρητά • Φροντίδα</div>
            </div>
          </div>
          <div style="font-size:16px;font-weight:900;color:#E11D48;">-15,00 €</div>
        </div>
      </div>
    </div>

    <!-- Ledger Group 2 -->
    <div class="card" style="padding:22px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:13px;font-weight:800;color:#0F172A;">Παρασκευή, 6 Νοεμβρίου 2026</span>
        <span style="font-size:13px;font-weight:900;color:#E11D48;">Ημερήσιο Σύνολο: -52,35 €</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:16px;">🛒</div>
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">Σκλαβενίτης • Supermarket</div>
              <div style="font-size:12px;color:#64748B;">19:42 • OCR Σαρωμένη Απόδειξη • Αγορές</div>
            </div>
          </div>
          <div style="font-size:16px;font-weight:900;color:#E11D48;">-48,75 €</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;font-size:16px;">☕</div>
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">Coffee Island</div>
              <div style="font-size:12px;color:#64748B;">09:15 • Apple Pay • Καφές</div>
            </div>
          </div>
          <div style="font-size:16px;font-weight:900;color:#E11D48;">-3,60 €</div>
        </div>
      </div>
    </div>
  `;
}

function getHistoryMobile() {
  return `
    <!-- Search Bar -->
    <div style="display:flex;align-items:center;gap:8px;background:#FFF;border:1px solid #E2E8F0;border-radius:12px;padding:10px 14px;">
      ${ICONS.search}
      <input type="text" placeholder="Αναζήτηση..." style="border:none;outline:none;font-size:13px;width:100%;color:#0F172A;">
    </div>

    <!-- Filter Pills -->
    <div style="display:flex;gap:6px;">
      <span style="padding:6px 14px;background:#0F172A;color:#FFF;border-radius:8px;font-size:12px;font-weight:700;">Όλα (588)</span>
      <span style="padding:6px 14px;background:#FFF;border:1px solid #E2E8F0;color:#64748B;border-radius:8px;font-size:12px;font-weight:600;">Έξοδα</span>
      <span style="padding:6px 14px;background:#FFF;border:1px solid #E2E8F0;color:#64748B;border-radius:8px;font-size:12px;font-weight:600;">Έσοδα</span>
    </div>

    <!-- List -->
    <div class="card" style="padding:16px;">
      <div style="font-size:12px;font-weight:800;color:#64748B;text-transform:uppercase;margin-bottom:12px;">ΣΗΜΕΡΑ • 7 ΝΟΕΜΒΡΙΟΥ</div>
      
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F1F5F9;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;">⛽</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0F172A;">Βενζίνη • Shell</div>
              <div style="font-size:10px;color:#64748B;">18:14 • Alpha Bank</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:900;color:#E11D48;">-20,00 €</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:rgba(124,58,237,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;">✂️</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0F172A;">Κούρεμα</div>
              <div style="font-size:10px;color:#64748B;">12:30 • Μετρητά</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:900;color:#E11D48;">-15,00 €</div>
        </div>
      </div>
    </div>
  `;
}

// ── 3. GOALS MOCK ──
function getGoalsDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Στόχοι Αποταμίευσης</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Χρηματοοικονομικός προγραμματισμός και παρακολούθηση οροσήμων</p>
      </div>
      <button style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;background:#0F172A;color:#FFF;font-weight:800;font-size:13px;border:none;cursor:pointer;">
        ${ICONS.plus} Νέος Στόχος
      </button>
    </div>

    <!-- Summary Overview Card -->
    <div class="card" style="padding:24px;border-top:3px solid #10B981;background:linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%);display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1px;">ΣΥΝΟΛΙΚΗ ΣΥΣΣΩΡΕΥΜΕΝΗ ΑΠΟΤΑΜΙΕΥΣΗ</span>
        <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#0F172A;margin-top:4px;">12.350,00 € <span style="font-size:20px;color:#64748B;font-weight:600;">/ 20.000,00 €</span></div>
        <div style="font-size:13px;color:#047857;font-weight:700;margin-top:4px;">62% μέση πρόοδος σε 5 ενεργούς στόχους</div>
      </div>
      <div style="text-align:right;">
        <span class="pill" style="background:#ECFDF5;color:#059669;font-size:13px;padding:6px 14px;">+450,00 € / μήνα σταθερή συνεισφορά</span>
      </div>
    </div>

    <!-- Goals Grid -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
      <!-- Goal 1 -->
      <div class="card" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:28px;">🛡️</span>
            <span class="pill" style="background:#ECFDF5;color:#059669;">75%</span>
          </div>
          <h3 style="font-size:17px;font-weight:800;color:#0F172A;">Ταμείο Έκτακτης Ανάγκης</h3>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">Στόχος: 6 μήνες έξοδα διαβίωσης</div>
          <div style="font-family:'Outfit';font-size:24px;font-weight:900;color:#0F172A;margin-top:14px;">4.500,00 € <span style="font-size:14px;color:#94A3B8;font-weight:600;">/ 6.000 €</span></div>
        </div>
        <div style="margin-top:18px;">
          <div style="height:8px;background:#F1F5F9;border-radius:6px;overflow:hidden;margin-bottom:10px;">
            <div style="width:75%;height:100%;background:#10B981;border-radius:6px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#64748B;">
            <span>Απομένουν: 1.500 €</span>
            <span>Μάρτιος 2027</span>
          </div>
        </div>
      </div>

      <!-- Goal 2 -->
      <div class="card" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:28px;">✈️</span>
            <span class="pill" style="background:#EFF6FF;color:#2563EB;">74%</span>
          </div>
          <h3 style="font-size:17px;font-weight:800;color:#0F172A;">Καλοκαιρινές Διακοπές</h3>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">Ταξίδι στις Κυκλάδες 2027</div>
          <div style="font-family:'Outfit';font-size:24px;font-weight:900;color:#0F172A;margin-top:14px;">1.850,00 € <span style="font-size:14px;color:#94A3B8;font-weight:600;">/ 2.500 €</span></div>
        </div>
        <div style="margin-top:18px;">
          <div style="height:8px;background:#F1F5F9;border-radius:6px;overflow:hidden;margin-bottom:10px;">
            <div style="width:74%;height:100%;background:#3B82F6;border-radius:6px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#64748B;">
            <span>Απομένουν: 650 €</span>
            <span>Ιούνιος 2027</span>
          </div>
        </div>
      </div>

      <!-- Goal 3 -->
      <div class="card" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:28px;">💻</span>
            <span class="pill" style="background:#F5F3FF;color:#7C3AED;">80%</span>
          </div>
          <h3 style="font-size:17px;font-weight:800;color:#0F172A;">Νέο Laptop & Εργαλεία</h3>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">Αναβάθμιση εξοπλισμού γραφείου</div>
          <div style="font-family:'Outfit';font-size:24px;font-weight:900;color:#0F172A;margin-top:14px;">1.200,00 € <span style="font-size:14px;color:#94A3B8;font-weight:600;">/ 1.500 €</span></div>
        </div>
        <div style="margin-top:18px;">
          <div style="height:8px;background:#F1F5F9;border-radius:6px;overflow:hidden;margin-bottom:10px;">
            <div style="width:80%;height:100%;background:#7C3AED;border-radius:6px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:#64748B;">
            <span>Απομένουν: 300 €</span>
            <span>Δεκέμβριος 2026</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getGoalsMobile() {
  return `
    <div class="card" style="padding:18px;text-align:center;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;">ΣΥΝΟΛΙΚΗ ΑΠΟΤΑΜΙΕΥΣΗ</span>
      <div style="font-family:'Outfit';font-size:34px;font-weight:900;color:#0F172A;margin-top:4px;">12.350,00 €</div>
      <div style="font-size:12px;color:#059669;font-weight:700;margin-top:2px;">62% ολοκλήρωση στόχων</div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:15px;font-weight:800;color:#0F172A;">🛡️ Ταμείο Έκτακτης Ανάγκης</span>
        <span class="pill" style="background:#ECFDF5;color:#059669;">75%</span>
      </div>
      <div style="font-size:14px;font-weight:900;color:#0F172A;margin-bottom:8px;">4.500 € / 6.000 €</div>
      <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
        <div style="width:75%;height:100%;background:#10B981;border-radius:6px;"></div>
      </div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:15px;font-weight:800;color:#0F172A;">✈️ Καλοκαιρινές Διακοπές</span>
        <span class="pill" style="background:#EFF6FF;color:#2563EB;">74%</span>
      </div>
      <div style="font-size:14px;font-weight:900;color:#0F172A;margin-bottom:8px;">1.850 € / 2.500 €</div>
      <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
        <div style="width:74%;height:100%;background:#3B82F6;border-radius:6px;"></div>
      </div>
    </div>
  `;
}

// ── 4. BUDGETS MOCK ──
function getBudgetsDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Μηνιαίοι Προϋπολογισμοί</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Προληπτικά όρια δαπανών ανά κατηγορία με ειδοποιήσεις υπέρβασης</p>
      </div>
      <button style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;background:#0F172A;color:#FFF;font-weight:800;font-size:13px;border:none;cursor:pointer;">
        ${ICONS.plus} Ορισμός Ορίου
      </button>
    </div>

    <!-- Overall Budget Gauge Card -->
    <div class="card" style="padding:24px;border-top:3px solid #7C3AED;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span style="font-size:11px;font-weight:800;color:#6D28D9;text-transform:uppercase;letter-spacing:1px;">ΣΥΝΟΛΙΚΟΣ ΠΡΟΫΠΟΛΟΓΙΣΜΟΣ ΝΟΕΜΒΡΙΟΥ</span>
        <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#0F172A;margin-top:4px;">1.120,00 € <span style="font-size:20px;color:#64748B;font-weight:600;">/ 2.200,00 €</span></div>
        <div style="font-size:13px;color:#059669;font-weight:700;margin-top:4px;">51% αναλωθέντα • 23 ημέρες απομένουν στον μήνα</div>
      </div>
      <div style="display:flex;gap:12px;">
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:12px 18px;text-align:center;">
          <div style="font-size:18px;font-weight:900;color:#059669;">5</div>
          <div style="font-size:11px;font-weight:700;color:#065F46;">Εντός Ορίου</div>
        </div>
        <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;padding:12px 18px;text-align:center;">
          <div style="font-size:18px;font-weight:900;color:#D97706;">1</div>
          <div style="font-size:11px;font-weight:700;color:#92400E;">Προειδοποίηση</div>
        </div>
      </div>
    </div>

    <!-- Budget Table Rows -->
    <div class="card" style="padding:24px;">
      <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:18px;">Ενεργά Όρια Κατηγοριών</h3>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Item 1 -->
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">🛒</span>
              <div>
                <div style="font-size:15px;font-weight:800;color:#0F172A;">Σούπερ Μάρκετ & Τρόφιμα</div>
                <div style="font-size:12px;color:#64748B;">Απομένουν: 110,00 €</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:900;color:#0F172A;">390,00 € <span style="font-size:12px;color:#94A3B8;">/ 500 €</span></div>
              <span class="pill" style="background:#ECFDF5;color:#059669;margin-top:2px;">78% Εντός Ορίου</span>
            </div>
          </div>
          <div style="height:8px;background:#E2E8F0;border-radius:6px;overflow:hidden;">
            <div style="width:78%;height:100%;background:#10B981;border-radius:6px;"></div>
          </div>
        </div>

        <!-- Item 2 -->
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">🍽️</span>
              <div>
                <div style="font-size:15px;font-weight:800;color:#0F172A;">Εστιατόρια & Φαγητό Έξω</div>
                <div style="font-size:12px;color:#D97706;font-weight:700;">Προσοχή: Απομένουν μόνο 30,00 €</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:16px;font-weight:900;color:#D97706;">220,00 € <span style="font-size:12px;color:#94A3B8;">/ 250 €</span></div>
              <span class="pill" style="background:#FEF3C7;color:#D97706;margin-top:2px;">88% Προειδοποίηση</span>
            </div>
          </div>
          <div style="height:8px;background:#E2E8F0;border-radius:6px;overflow:hidden;">
            <div style="width:88%;height:100%;background:#F59E0B;border-radius:6px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getBudgetsMobile() {
  return `
    <div class="card" style="padding:18px;text-align:center;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;">ΣΥΝΟΛΙΚΟΣ ΠΡΟΫΠΟΛΟΓΙΣΜΟΣ</span>
      <div style="font-family:'Outfit';font-size:34px;font-weight:900;color:#0F172A;margin-top:4px;">1.120 € / 2.200 €</div>
      <div style="font-size:12px;color:#059669;font-weight:700;margin-top:2px;">51% αναλωθέντα (Ασφαλές)</div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:14px;font-weight:800;color:#0F172A;">🛒 Σούπερ Μάρκετ</span>
        <span style="font-size:13px;font-weight:900;color:#059669;">390 € / 500 €</span>
      </div>
      <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
        <div style="width:78%;height:100%;background:#10B981;border-radius:6px;"></div>
      </div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:14px;font-weight:800;color:#0F172A;">🍽️ Φαγητό Έξω</span>
        <span style="font-size:13px;font-weight:900;color:#D97706;">220 € / 250 € (88%)</span>
      </div>
      <div style="height:6px;background:#F1F5F9;border-radius:6px;overflow:hidden;">
        <div style="width:88%;height:100%;background:#F59E0B;border-radius:6px;"></div>
      </div>
    </div>
  `;
}

// ── 5. RECURRING MOCK ──
function getRecurringDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Επαναλαμβανόμενες Υποχρεώσεις</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Παρακολούθηση σταθερών μηνιαίων λογαριασμών και ψηφιακών συνδρομών</p>
      </div>
      <button style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;background:#0F172A;color:#FFF;font-weight:800;font-size:13px;border:none;cursor:pointer;">
        ${ICONS.plus} Νέα Συνδρομή
      </button>
    </div>

    <!-- Summary Metrics -->
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;">
      <div class="card" style="padding:22px;border-top:3px solid #7C3AED;">
        <span style="font-size:11px;font-weight:800;color:#6D28D9;text-transform:uppercase;letter-spacing:1px;">ΣΤΑΘΕΡΟ ΜΗΝΙΑΙΟ ΚΟΣΤΟΣ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;margin-top:4px;">841,90 €</div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-top:4px;">Δεσμευμένο κεφάλαιο κάθε μήνα</div>
      </div>

      <div class="card" style="padding:22px;border-top:3px solid #06B6D4;">
        <span style="font-size:11px;font-weight:800;color:#0891B2;text-transform:uppercase;letter-spacing:1px;">ΕΤΗΣΙΑ ΕΠΙΒΑΡΥΝΣΗ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;margin-top:4px;">10.102,80 €</div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-top:4px;">Προβολή 12 μηνών</div>
      </div>

      <div class="card" style="padding:22px;border-top:3px solid #10B981;">
        <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1px;">ΕΠΟΜΕΝΗ ΑΝΑΝΕΩΣΗ</span>
        <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;margin-top:4px;">Σε 3 Ημέρες</div>
        <div style="font-size:12px;color:#64748B;font-weight:600;margin-top:4px;">Netflix Premium (13,99 €)</div>
      </div>
    </div>

    <!-- Subscriptions List -->
    <div class="card" style="padding:24px;">
      <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:18px;">Ενεργές Υποχρεώσεις</h3>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:18px;">🏠</div>
            <div>
              <div style="font-size:15px;font-weight:800;color:#0F172A;">Ενοίκιο Κατοικίας</div>
              <div style="font-size:12px;color:#64748B;">Μηνιαία • 1η εκάστου μηνός</div>
            </div>
          </div>
          <div style="font-size:17px;font-weight:900;color:#0F172A;">550,00 €</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.1);color:#EF4444;display:flex;align-items:center;justify-content:center;font-size:18px;">🎬</div>
            <div>
              <div style="font-size:15px;font-weight:800;color:#0F172A;">Netflix Premium 4K</div>
              <div style="font-size:12px;color:#64748B;">Μηνιαία • 10 Νοεμβρίου</div>
            </div>
          </div>
          <div style="font-size:17px;font-weight:900;color:#0F172A;">13,99 €</div>
        </div>
      </div>
    </div>
  `;
}

function getRecurringMobile() {
  return `
    <div class="card" style="padding:18px;text-align:center;">
      <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;">ΠΑΓΙΑ ΕΞΟΔΑ ΜΗΝΑ</span>
      <div style="font-family:'Outfit';font-size:34px;font-weight:900;color:#0F172A;margin-top:4px;">841,90 €</div>
      <div style="font-size:12px;color:#64748B;font-weight:600;margin-top:2px;">8 ενεργές επαναλαμβανόμενες χρεώσεις</div>
    </div>

    <div class="card" style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">🏠</span>
        <div>
          <div style="font-size:14px;font-weight:800;color:#0F172A;">Ενοίκιο</div>
          <div style="font-size:11px;color:#64748B;">1η κάθε μήνα</div>
        </div>
      </div>
      <div style="font-size:15px;font-weight:900;color:#0F172A;">550,00 €</div>
    </div>

    <div class="card" style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">🎬</span>
        <div>
          <div style="font-size:14px;font-weight:800;color:#0F172A;">Netflix</div>
          <div style="font-size:11px;color:#64748B;">10 Νοεμβρίου</div>
        </div>
      </div>
      <div style="font-size:15px;font-weight:900;color:#0F172A;">13,99 €</div>
    </div>
  `;
}

// ── 6. FINANCIAL ADVISOR MOCK ──
function getAdvisorDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Spendlore AI Οικονομικός Σύμβουλος</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Έξυπνη ανάλυση υγείας χαρτοφυλακίου, κανόνας 50-30-20 και στρατηγικές βελτιστοποίησης</p>
      </div>
      <span class="pill" style="background:#F5F3FF;color:#7C3AED;font-size:13px;padding:6px 14px;">PRO Advisor Engine</span>
    </div>

    <!-- Health Score & 50-30-20 Grid -->
    <div style="display:grid;grid-template-columns:1.2fr 2fr;gap:20px;">
      <!-- Health Score Card -->
      <div class="card" style="padding:26px;display:flex;flex-direction:column;align-items:center;text-align:center;">
        <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">FINANCIAL HEALTH SCORE</span>
        
        <div style="position:relative;width:150px;height:150px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;">
          <svg viewBox="0 0 150 150" style="width:100%;height:100%;transform:rotate(-90deg);">
            <circle cx="75" cy="75" r="60" fill="none" stroke="#F1F5F9" stroke-width="12"/>
            <circle cx="75" cy="75" r="60" fill="none" stroke="#10B981" stroke-width="12" stroke-dasharray="377" stroke-dashoffset="60" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;">
            <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#0F172A;">84</div>
            <div style="font-size:11px;font-weight:800;color:#059669;">/ 100</div>
          </div>
        </div>

        <div style="font-size:16px;font-weight:800;color:#0F172A;">Εξαιρετική Οικονομική Υγεία</div>
        <div style="font-size:12px;color:#64748B;margin-top:4px;">Βρίσκεσαι στο ανώτερο 12% χρηστών με παρόμοιο προφίλ</div>
      </div>

      <!-- 50-30-20 Breakdown -->
      <div class="card" style="padding:26px;">
        <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:18px;">Κατανομή Κανόνα 50 - 30 - 20</h3>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
              <span>Ανάγκες (Needs): 48%</span>
              <span style="color:#059669;">Εντός στόχου (≤50%)</span>
            </div>
            <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
              <div style="width:48%;height:100%;background:#10B981;border-radius:8px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
              <span>Επιθυμίες (Wants): 24%</span>
              <span style="color:#059669;">Χαμηλότερο του ορίου (≤30%)</span>
            </div>
            <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
              <div style="width:24%;height:100%;background:#06B6D4;border-radius:8px;"></div>
            </div>
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
              <span>Αποταμίευση (Savings): 28%</span>
              <span style="color:#7C3AED;">Υπεραπόδοση στόχου (≥20%)</span>
            </div>
            <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
              <div style="width:28%;height:100%;background:#7C3AED;border-radius:8px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Insights & Chat Card -->
    <div class="card" style="padding:26px;">
      <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:16px;">Προτάσεις Βελτιστοποίησης</h3>

      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:18px;display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
        <div style="width:36px;height:36px;border-radius:10px;background:#0F172A;color:#FFF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS.lightbulb}</div>
        <div>
          <div style="font-size:14px;font-weight:800;color:#0F172A;">Ευκαιρία Αύξησης Αποταμίευσης</div>
          <div style="font-size:13px;color:#475569;margin-top:2px;line-height:1.45;">
            Με βάση τον τρέχοντα ρυθμό Safe-to-Burn, μπορείς να αυξήσεις τη μηνιαία σου συνεισφορά στο Ταμείο Έκτακτης Ανάγκης κατά 150 € χωρίς να επηρεαστεί το περιθώριο των καθημερινών σου εξόδων.
          </div>
        </div>
      </div>
    </div>
  `;
}

function getAdvisorMobile() {
  return `
    <div class="card" style="padding:20px;text-align:center;">
      <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;">FINANCIAL HEALTH SCORE</span>
      <div style="font-family:'Outfit';font-size:48px;font-weight:900;color:#0F172A;margin-top:6px;">84 <span style="font-size:18px;color:#059669;">/ 100</span></div>
      <div style="font-size:13px;font-weight:700;color:#059669;">Εξαιρετική Οικονομική Κατάσταση</div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="font-size:13px;font-weight:800;color:#0F172A;margin-bottom:10px;">Κανόνας 50 - 30 - 20</div>
      <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;font-weight:700;">
        <div style="display:flex;justify-content:space-between;"><span>Ανάγκες: 48%</span> <span style="color:#059669;">✓ Στόχος 50%</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Επιθυμίες: 24%</span> <span style="color:#059669;">✓ Στόχος 30%</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Αποταμίευση: 28%</span> <span style="color:#7C3AED;">★ Στόχος 20%</span></div>
      </div>
    </div>

    <div class="card" style="padding:16px;background:#F8FAFC;">
      <div style="font-size:13px;font-weight:800;color:#0F172A;margin-bottom:4px;">💡 AI Πρόταση</div>
      <div style="font-size:12px;color:#475569;line-height:1.4;">
        Μπορείς να διαθέσεις επιπλέον 150 € στους στόχους σου διατηρώντας το ασφαλές όριο Safe-to-Burn.
      </div>
    </div>
  `;
}

// ── 7. SETTINGS & SECURITY MOCK ──
function getSettingsDesktop() {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <h1 style="font-family:'Outfit';font-size:28px;font-weight:900;color:#0F172A;">Ρυθμίσεις & Ασφάλεια</h1>
        <p style="font-size:13px;color:#64748B;margin-top:2px;">Προτιμήσεις εφαρμογής, βιομετρική ασφάλεια και έλεγχος δεδομένων</p>
      </div>
      <span class="pill" style="background:#ECFDF5;color:#059669;font-size:13px;padding:6px 14px;">Bank-Grade Protected</span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <!-- Column 1: Preferences -->
      <div class="card" style="padding:26px;">
        <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:18px;">Προτιμήσεις Εφαρμογής</h3>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <div>
            <label style="display:block;font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;margin-bottom:8px;">ΘΕΜΑ ΕΜΦΑΝΙΣΗΣ</label>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;">
              <div style="border:2px solid #0F172A;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:800;color:#0F172A;">Φωτεινό</div>
              <div style="border:1px solid #E2E8F0;border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:600;color:#64748B;">Obsidian Dark</div>
              <div style="border:1px solid #E2E8F0;border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:600;color:#64748B;">Σύστημα</div>
            </div>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;margin-bottom:8px;">ΓΛΩΣΣΑ ΕΦΑΡΜΟΓΗΣ</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div style="border:2px solid #0F172A;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:800;color:#0F172A;">Ελληνικά (el)</div>
              <div style="border:1px solid #E2E8F0;border-radius:12px;padding:12px;text-align:center;font-size:13px;font-weight:600;color:#64748B;">English (en)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Security & Privacy -->
      <div class="card" style="padding:26px;">
        <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;margin-bottom:18px;">Ασφάλεια & Ιδιωτικότητα</h3>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">Βιομετρικό Ξεκλείδωμα</div>
              <div style="font-size:11px;color:#64748B;">Face ID & Δακτυλικό Αποτύπωμα</div>
            </div>
            <span class="pill" style="background:#ECFDF5;color:#059669;">Ενεργό</span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">App Switcher Privacy Screen</div>
              <div style="font-size:11px;color:#64748B;">Απόκρυψη υπολοίπου στον εναλλάκτη εφαρμογών</div>
            </div>
            <span class="pill" style="background:#ECFDF5;color:#059669;">Ενεργό</span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
            <div>
              <div style="font-size:14px;font-weight:800;color:#0F172A;">One-Click Privacy Blur</div>
              <div style="font-size:11px;color:#64748B;">Άμεση θόλωση ποσών με ένα πάτημα</div>
            </div>
            <span class="pill" style="background:#ECFDF5;color:#059669;">Ενεργό</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getSettingsMobile() {
  return `
    <div class="card" style="padding:16px;">
      <div style="font-size:12px;font-weight:800;color:#64748B;text-transform:uppercase;margin-bottom:12px;">ΠΡΟΤΙΜΗΣΕΙΣ</div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;color:#0F172A;">Θέμα</span>
          <span style="font-size:13px;font-weight:700;color:#7C3AED;">Φωτεινό &rarr;</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;color:#0F172A;">Γλώσσα</span>
          <span style="font-size:13px;font-weight:700;color:#7C3AED;">Ελληνικά &rarr;</span>
        </div>
      </div>
    </div>

    <div class="card" style="padding:16px;">
      <div style="font-size:12px;font-weight:800;color:#64748B;text-transform:uppercase;margin-bottom:12px;">ΑΣΦΑΛΕΙΑ & PRIVACY</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;color:#0F172A;">Βιομετρικό Ξεκλείδωμα</span>
          <span class="pill" style="background:#ECFDF5;color:#059669;">Ενεργό</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:14px;font-weight:700;color:#0F172A;">Privacy Screen</span>
          <span class="pill" style="background:#ECFDF5;color:#059669;">Ενεργό</span>
        </div>
      </div>
    </div>
  `;
}

// ── Master Render Loop ──
async function buildAllMocks() {
  console.log('=== Rendering Professional Spendlore Full Page Mocks ===');
  const browser = await chromium.launch();

  const pages = [
    { id: 'stats', name: '02_analytics', title: 'Ανάλυση', desktopFn: getStatsDesktop, mobileFn: getStatsMobile },
    { id: 'history', name: '03_history', title: 'Ιστορικό', desktopFn: getHistoryDesktop, mobileFn: getHistoryMobile },
    { id: 'goals', name: '04_goals', title: 'Στόχοι', desktopFn: getGoalsDesktop, mobileFn: getGoalsMobile },
    { id: 'budgets', name: '05_budgets', title: 'Προϋπολογισμοί', desktopFn: getBudgetsDesktop, mobileFn: getBudgetsMobile },
    { id: 'recurring', name: '06_recurring', title: 'Επαναλαμβανόμενα', desktopFn: getRecurringDesktop, mobileFn: getRecurringMobile },
    { id: 'advisor', name: '07_advisor', title: 'Spendlore AI Σύμβουλος', desktopFn: getAdvisorDesktop, mobileFn: getAdvisorMobile },
    { id: 'settings', name: '08_settings', title: 'Ρυθμίσεις', desktopFn: getSettingsDesktop, mobileFn: getSettingsMobile }
  ];

  for (const p of pages) {
    console.log(`Generating Desktop Mock: ${p.name}_desktop.png...`);
    const dPage = await browser.newPage({ viewport: { width: 1440, height: 1024, deviceScaleFactor: 1 } });
    await dPage.setContent(getDesktopShell(p.id, p.desktopFn()));
    const dBuf = await dPage.screenshot();
    fs.writeFileSync(path.join(outDir, `${p.name}_desktop.png`), dBuf);
    await dPage.close();

    console.log(`Generating Mobile Mock: ${p.name}_mobile.png...`);
    const mPage = await browser.newPage({ viewport: { width: 412, height: 915, deviceScaleFactor: 2 } });
    await mPage.setContent(getMobileShell(p.id, p.mobileFn()));
    const mBuf = await mPage.screenshot();
    fs.writeFileSync(path.join(outDir, `${p.name}_mobile.png`), mBuf);
    await mPage.close();
  }

  await browser.close();
  console.log('✓ All Desktop and Mobile Page Mocks generated successfully!');
}

buildAllMocks().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

