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
  checkCircle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
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

// ── Desktop Redesigned Mock (1440 x 1024 px) ──
function getDesktopMockHtml() {
  const emblemSvg = getEmblemSvg();
  
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
    
    /* Left Sidebar */
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
      margin-bottom: 24px;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 24px;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 6px;
      padding-left: 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
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
    
    /* Main Content Surface */
    .main-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 32px 40px;
      gap: 28px;
    }
    
    /* Top Action Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-greeting {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .date-meta {
      font-size: 13px;
      color: #64748B;
      font-weight: 500;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* 3-Pillar Financial Hero Grid */
    .hero-grid {
      display: grid;
      grid-template-columns: 1.4fr 1.3fr 1.3fr;
      gap: 20px;
    }
    .hero-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    
    /* AI Advisor Banner */
    .ai-banner {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }
    
    /* 2-Column Core Layout */
    .content-grid {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      gap: 24px;
    }
  </style>
</head>
<body>
  <!-- ── 1. DESKTOP SIDEBAR ── -->
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
        <div class="nav-item active">${ICONS.home} <span>Αρχική</span></div>
        <div class="nav-item">${ICONS.pieChart} <span>Ανάλυση</span></div>
        <div class="nav-item">${ICONS.clock} <span>Ιστορικό</span></div>
      </div>

      <div class="nav-group">
        <div class="nav-label">ΓΡΗΓΟΡΗ ΠΡΟΣΒΑΣΗ</div>
        <div class="nav-item">${ICONS.target} <span>Στόχοι</span></div>
        <div class="nav-item">${ICONS.wallet} <span>Προϋπολογισμοί</span></div>
        <div class="nav-item">${ICONS.repeat} <span>Επαναλαμβανόμενα</span></div>
        <div class="nav-item">${ICONS.lightbulb} <span>Spendlore AI Σύμβουλος</span></div>
      </div>
    </div>

    <!-- Bottom Profile Box -->
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:14px;display:flex;align-items:center;gap:12px;">
      <div style="width:40px;height:40px;border-radius:12px;background:#7C3AED;color:#FFF;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;">ΒΜ</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:800;color:#0F172A;truncate">Βαγγέλης Μπομπόνης</div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">
          <span style="font-size:9px;font-weight:900;color:#7C3AED;background:rgba(124,58,237,0.1);padding:2px 6px;border-radius:4px;">PRO</span>
          <span style="font-size:10px;color:#64748B;font-weight:600;">v1.1.39</span>
        </div>
      </div>
      <div style="color:#94A3B8;">${ICONS.settings}</div>
    </div>
  </aside>

  <!-- ── 2. DESKTOP MAIN SURFACE ── -->
  <main class="main-view">
    <!-- Top Action Bar -->
    <div class="top-bar">
      <div>
        <h1 class="user-greeting">Καλησπέρα, Βαγγέλης</h1>
        <div class="date-meta">
          <span>Σάββατο 7 Νοεμβρίου 2026</span>
          <span>•</span>
          <span style="color:#10B981;font-weight:700;">Οικονομική Επισκόπηση σε Πραγματικό Χρόνο</span>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:12px;">
        <button style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:1px solid #E2E8F0;background:#FFFFFF;color:#0F172A;font-weight:700;font-size:13px;cursor:pointer;">
          ${ICONS.scan} Σάρωση OCR
        </button>
        <button style="display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:12px;border:1px solid #E2E8F0;background:#FFFFFF;color:#0F172A;font-weight:700;font-size:13px;cursor:pointer;">
          ${ICONS.mic} Φωνητική Καταγραφή
        </button>
        <button style="display:flex;align-items:center;gap:8px;padding:10px 22px;border-radius:12px;background:#0F172A;color:#FFFFFF;font-weight:800;font-size:14px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,0.15);">
          ${ICONS.plus} Νέα Συναλλαγή
        </button>
      </div>
    </div>

    <!-- ── 3. REDESIGNED 3-PILLAR FINANCIAL HERO GRID ── -->
    <section class="hero-grid">
      <!-- Pillar 1: Verified Liquid Balance -->
      <div class="card hero-card" style="border-top:4px solid #0F172A;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1.5px;">ΔΙΑΘΕΣΙΜΟ ΚΕΦΑΛΑΙΟ</span>
            <span class="pill" style="background:#ECFDF5;color:#059669;">+14.2% μήνα</span>
          </div>
          <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#0F172A;letter-spacing:-1px;">14.850,20 €</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">Πραγματικό ρευστό υπόλοιπο συνδεδεμένων λογαριασμών</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid #F1F5F9;font-size:12px;">
          <div>
            <div style="color:#94A3B8;font-weight:700;">ΕΣΟΔΑ ΜΗΝΑ</div>
            <div style="font-weight:900;color:#059669;font-size:14px;">+3.400,00 €</div>
          </div>
          <div>
            <div style="color:#94A3B8;font-weight:700;">ΕΞΟΔΑ ΜΗΝΑ</div>
            <div style="font-weight:900;color:#E11D48;font-size:14px;">-1.120,00 €</div>
          </div>
          <div>
            <div style="color:#94A3B8;font-weight:700;">ΚΑΘΑΡΟ ΙΣΟΖΥΓΙΟ</div>
            <div style="font-weight:900;color:#0F172A;font-size:14px;">+2.280,00 €</div>
          </div>
        </div>
      </div>

      <!-- Pillar 2: Safe-to-Burn™ Discretionary Engine (Centerpiece) -->
      <div class="card hero-card" style="border-top:4px solid #10B981;background:linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%);">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1.5px;">SAFE-TO-BURN™ ΣΗΜΕΡΑ</span>
            <span class="pill" style="background:#FEF3C7;color:#D97706;">🔥 14 Ημέρες Streak</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#059669;letter-spacing:-1px;">78,50 €</div>
            <span style="font-size:13px;font-weight:700;color:#64748B;">/ ημέρα</span>
          </div>
          <div style="font-size:12px;color:#047857;font-weight:600;margin-top:2px;">Ασφαλές ημερήσιο περιθώριο κατανάλωσης</div>
        </div>

        <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(16,185,129,0.2);">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;font-weight:700;">
            <span style="color:#065F46;">Ποσοστό Κατανάλωσης Στόχου</span>
            <span style="color:#059669;">32% (Εντός Ασφαλούς Ορίου)</span>
          </div>
          <div style="height:8px;background:#DCFCE7;border-radius:10px;overflow:hidden;">
            <div style="width:32%;height:100%;background:#10B981;border-radius:10px;"></div>
          </div>
        </div>
      </div>

      <!-- Pillar 3: Cash Flow Velocity & Savings Rate -->
      <div class="card hero-card" style="border-top:4px solid #7C3AED;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:11px;font-weight:800;color:#6D28D9;text-transform:uppercase;letter-spacing:1.5px;">ΤΑΧΥΤΗΤΑ & ΑΠΟΤΑΜΙΕΥΣΗ</span>
            <span class="pill" style="background:#F5F3FF;color:#7C3AED;">67% Savings Rate</span>
          </div>
          <div style="font-family:'Outfit';font-size:42px;font-weight:900;color:#0F172A;letter-spacing:-1px;">278,10 €</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px;">Τρέχουσες μεταβλητές δαπάνες (81% κάτω από τον μέσο όρο)</div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid #F1F5F9;font-size:12px;">
          <div>
            <div style="color:#94A3B8;font-weight:700;">ΠΑΓΙΕΣ ΥΠΟΧΡΕΩΣΕΙΣ</div>
            <div style="font-weight:900;color:#475569;font-size:14px;">841,90 €</div>
          </div>
          <div>
            <div style="color:#94A3B8;font-weight:700;">ΑΠΟΤΑΜΙΕΥΣΗ ΣΤΟΧΩΝ</div>
            <div style="font-weight:900;color:#7C3AED;font-size:14px;">450,00 €</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 4. AI ADVISOR INSIGHT BANNER ── -->
    <div class="ai-banner">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        <div style="width:32px;height:32px;border-radius:10px;background:#0F172A;color:#FFFFFF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS.lightbulb}</div>
        <div style="font-size:13px;line-height:1.4;">
          <span style="font-weight:800;color:#0F172A;">Spendlore AI Σύμβουλος:</span>
          <span style="color:#475569;margin-left:6px;">«Βρίσκεσαι 81% κάτω από τον ιστορικό ρυθμό εξόδων σου. Διατηρώντας αυτό τον ρυθμό θα εξοικονομήσεις επιπλέον 420 € στο τέλος του μήνα.»</span>
        </div>
      </div>
      <a href="#" style="color:#0F172A;font-weight:800;text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0;margin-left:16px;">
        Συνομιλία με τον Σύμβουλο ${ICONS.chevronRight}
      </a>
    </div>

    <!-- ── 5. CORE 2-COLUMN WORK SURFACE ── -->
    <div class="content-grid">
      <!-- Left Column: Category Breakdown & Transactions Ledger -->
      <div style="display:flex;flex-direction:column;gap:24px;">
        <!-- Category Distribution -->
        <div class="card" style="padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;">Κατανομή Εξόδων Μήνα</h3>
              <p style="font-size:12px;color:#64748B;">4 κορυφαίες κατηγορίες μεταβλητών δαπανών</p>
            </div>
            <a href="#" style="color:#7C3AED;font-size:13px;font-weight:700;text-decoration:none;">Λεπτομερής Ανάλυση &rarr;</a>
          </div>

          <!-- Multi-tier progress bar -->
          <div style="display:flex;height:12px;border-radius:10px;overflow:hidden;gap:2px;margin-bottom:20px;">
            <div style="width:38%;background:#7C3AED;" title="Αγορές"></div>
            <div style="width:28%;background:#06B6D4;" title="Λογαριασμοί"></div>
            <div style="width:20%;background:#F59E0B;" title="Βενζίνη"></div>
            <div style="width:14%;background:#EC4899;" title="Διασκέδαση"></div>
          </div>

          <!-- 4 Category Value Cards -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:18px;">🛒</span>
                <span style="font-size:10px;font-weight:800;color:#7C3AED;background:rgba(124,58,237,0.1);padding:2px 6px;border-radius:4px;">38%</span>
              </div>
              <div style="font-size:12px;color:#64748B;font-weight:700;">Αγορές</div>
              <div style="font-size:16px;font-weight:900;color:#0F172A;margin-top:2px;">71,03 €</div>
            </div>

            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:18px;">📄</span>
                <span style="font-size:10px;font-weight:800;color:#06B6D4;background:rgba(6,182,212,0.1);padding:2px 6px;border-radius:4px;">28%</span>
              </div>
              <div style="font-size:12px;color:#64748B;font-weight:700;">Λογαριασμοί</div>
              <div style="font-size:16px;font-weight:900;color:#0F172A;margin-top:2px;">59,08 €</div>
            </div>

            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:18px;">⛽</span>
                <span style="font-size:10px;font-weight:800;color:#F59E0B;background:rgba(245,158,11,0.1);padding:2px 6px;border-radius:4px;">20%</span>
              </div>
              <div style="font-size:12px;color:#64748B;font-weight:700;">Βενζίνη</div>
              <div style="font-size:16px;font-weight:900;color:#0F172A;margin-top:2px;">50,00 €</div>
            </div>

            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:18px;">🍸</span>
                <span style="font-size:10px;font-weight:800;color:#EC4899;background:rgba(236,72,153,0.1);padding:2px 6px;border-radius:4px;">14%</span>
              </div>
              <div style="font-size:12px;color:#64748B;font-weight:700;">Διασκέδαση</div>
              <div style="font-size:16px;font-weight:900;color:#0F172A;margin-top:2px;">42,00 €</div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions Table -->
        <div class="card" style="padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;">Πρόσφατες Συναλλαγές</h3>
              <span class="pill" style="background:#F1F5F9;color:#475569;">588 Σύνολο</span>
            </div>
            
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="display:flex;background:#F1F5F9;padding:3px;border-radius:10px;gap:2px;">
                <span style="padding:4px 10px;background:#FFF;border-radius:8px;font-size:12px;font-weight:700;color:#0F172A;box-shadow:0 1px 2px rgba(0,0,0,0.05);">Όλα</span>
                <span style="padding:4px 10px;font-size:12px;font-weight:600;color:#64748B;">Έξοδα</span>
                <span style="padding:4px 10px;font-size:12px;font-weight:600;color:#64748B;">Έσοδα</span>
              </div>
              <a href="#" style="color:#7C3AED;font-size:13px;font-weight:700;text-decoration:none;margin-left:8px;">Προβολή Όλων &rarr;</a>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <!-- Row 1 -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:38px;height:38px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:16px;">✂️</div>
                <div>
                  <div style="font-size:14px;font-weight:800;color:#0F172A;">Κούρεμα</div>
                  <div style="font-size:12px;color:#64748B;">Σήμερα, 7 Νοεμβρίου • Προσωπική Φροντίδα</div>
                </div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#E11D48;">-15,00 €</div>
            </div>

            <!-- Row 2 -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;font-size:16px;">⛽</div>
                <div>
                  <div style="font-size:14px;font-weight:800;color:#0F172A;">Βενζίνη • Shell</div>
                  <div style="font-size:12px;color:#64748B;">Σήμερα, 7 Νοεμβρίου • Μετακίνηση</div>
                </div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#E11D48;">-20,00 €</div>
            </div>

            <!-- Row 3 -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:12px;">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:38px;height:38px;border-radius:10px;background:rgba(16,185,129,0.1);color:#059669;display:flex;align-items:center;justify-content:center;font-size:16px;">💼</div>
                <div>
                  <div style="font-size:14px;font-weight:800;color:#0F172A;">Μισθοδοσία Νοεμβρίου</div>
                  <div style="font-size:12px;color:#64748B;">1 Νοεμβρίου • Κύρια Εισοδήματα</div>
                </div>
              </div>
              <div style="font-size:15px;font-weight:900;color:#059669;">+3.400,00 €</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Active Budget Caps & Savings Targets -->
      <div style="display:flex;flex-direction:column;gap:24px;">
        <!-- Budget Caps -->
        <div class="card" style="padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;">Προϋπολογισμοί Μήνα</h3>
            <a href="#" style="color:#7C3AED;font-size:13px;font-weight:700;text-decoration:none;">Όλοι &rarr;</a>
          </div>

          <div style="display:flex;flex-direction:column;gap:18px;">
            <!-- Budget 1 -->
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
                <span style="color:#0F172A;">🩺 Υγεία</span>
                <span style="color:#64748B;">0,00 € / 20,00 € <strong style="color:#059669;">(0%)</strong></span>
              </div>
              <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
                <div style="width:0%;height:100%;background:#10B981;"></div>
              </div>
            </div>

            <!-- Budget 2 -->
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
                <span style="color:#0F172A;">✂️ Κούρεμα</span>
                <span style="color:#64748B;">15,00 € / 30,00 € <strong style="color:#059669;">(50%)</strong></span>
              </div>
              <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
                <div style="width:50%;height:100%;background:#7C3AED;border-radius:8px;"></div>
              </div>
            </div>

            <!-- Budget 3 -->
            <div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
                <span style="color:#0F172A;">📄 Λογαριασμοί</span>
                <span style="color:#64748B;">59,08 € / 150,00 € <strong style="color:#059669;">(39%)</strong></span>
              </div>
              <div style="height:8px;background:#F1F5F9;border-radius:8px;overflow:hidden;">
                <div style="width:39%;height:100%;background:#06B6D4;border-radius:8px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Savings Goals Card -->
        <div class="card" style="padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-family:'Outfit';font-size:18px;font-weight:800;color:#0F172A;">Στόχοι Αποταμίευσης</h3>
            <span class="pill" style="background:#ECFDF5;color:#059669;">2 Ενεργοί</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:14px;font-weight:800;color:#0F172A;">🛡️ Ταμείο Έκτακτης Ανάγκης</span>
                <span style="font-size:12px;font-weight:800;color:#059669;">75%</span>
              </div>
              <div style="font-size:13px;color:#64748B;margin-bottom:8px;">4.500,00 € από 6.000,00 €</div>
              <div style="height:8px;background:#E2E8F0;border-radius:8px;overflow:hidden;">
                <div style="width:75%;height:100%;background:#10B981;border-radius:8px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;
}

// ── Mobile Redesigned Mock (412 x 915 px @ 2x = 824 x 1830 px) ──
function getMobileMockHtml() {
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
    
    /* Top Header Bar */
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
    
    /* Scrollable Container */
    .mobile-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 100px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    /* Bottom Navigation Bar */
    .bottom-nav {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 74px;
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
    
    /* Floating Ergonomic Action Button */
    .fab-btn {
      width: 52px;
      height: 52px;
      border-radius: 18px;
      background: #0F172A;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
      border: 3px solid #FFFFFF;
      margin-top: -26px;
    }
  </style>
</head>
<body>
  <!-- ── 1. MOBILE TOP HEADER ── -->
  <header class="mobile-header">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:12px;background:#0F172A;padding:5px;box-shadow:0 2px 8px rgba(15,23,42,0.15);">${emblemSvg}</div>
      <div>
        <div style="font-family:'Outfit';font-size:18px;font-weight:900;color:#0F172A;line-height:1.1;">Spendlore</div>
        <div style="font-size:10px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Επισκόπηση</div>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:36px;height:36px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#64748B;">${ICONS.eye}</div>
      <div style="width:36px;height:36px;border-radius:10px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#64748B;">${ICONS.bell}</div>
    </div>
  </header>

  <!-- ── 2. SCROLLABLE BODY CONTENT ── -->
  <div class="mobile-content">
    <!-- Unified Liquid Balance Hero Card -->
    <div class="card" style="padding:20px;border-top:3px solid #0F172A;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1px;">ΔΙΑΘΕΣΙΜΟ ΚΕΦΑΛΑΙΟ</span>
        <span class="pill" style="background:#ECFDF5;color:#059669;">+14.2%</span>
      </div>
      <div style="font-family:'Outfit';font-size:36px;font-weight:900;color:#0F172A;letter-spacing:-0.5px;">14.850,20 €</div>
      <div style="font-size:11px;color:#64748B;margin-top:2px;">Ρευστό υπόλοιπο σε όλους τους λογαριασμούς</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid #F1F5F9;">
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;">ΕΣΟΔΑ ΜΗΝΑ</div>
          <div style="font-size:15px;font-weight:900;color:#059669;margin-top:2px;">+3.400,00 €</div>
        </div>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;">ΕΞΟΔΑ ΜΗΝΑ</div>
          <div style="font-size:15px;font-weight:900;color:#E11D48;margin-top:2px;">-1.120,00 €</div>
        </div>
      </div>
    </div>

    <!-- Redesigned Safe-to-Burn Card (Front and Center) -->
    <div class="card" style="padding:18px;border-top:3px solid #10B981;background:linear-gradient(180deg,#FFFFFF 0%,#F0FDF4 100%);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:11px;font-weight:800;color:#059669;text-transform:uppercase;letter-spacing:1px;">SAFE-TO-BURN™ ΣΗΜΕΡΑ</span>
        <span class="pill" style="background:#FEF3C7;color:#D97706;">🔥 14 Ημέρες Streak</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:6px;">
        <div style="font-family:'Outfit';font-size:34px;font-weight:900;color:#059669;">78,50 €</div>
        <span style="font-size:12px;font-weight:700;color:#64748B;">/ ημέρα</span>
      </div>
      <div style="font-size:11px;color:#047857;font-weight:600;margin-top:2px;">Ασφαλές ημερήσιο περιθώριο κατανάλωσης</div>
      
      <div style="margin-top:12px;">
        <div style="height:6px;background:#DCFCE7;border-radius:6px;overflow:hidden;">
          <div style="width:32%;height:100%;background:#10B981;border-radius:6px;"></div>
        </div>
      </div>
    </div>

    <!-- Ergonomic Quick Capture Dock -->
    <div>
      <div style="font-size:11px;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">ΓΡΗΓΟΡΗ ΚΑΤΑΓΡΑΦΗ</div>
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;">
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">
          <div style="width:34px;height:34px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;">${ICONS.scan}</div>
          <span style="font-size:11px;font-weight:700;color:#0F172A;">OCR Σάρωση</span>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">
          <div style="width:34px;height:34px;border-radius:10px;background:rgba(16,185,129,0.1);color:#059669;display:flex;align-items:center;justify-content:center;">${ICONS.mic}</div>
          <span style="font-size:11px;font-weight:700;color:#0F172A;">Φωνητικό</span>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">
          <div style="width:34px;height:34px;border-radius:10px;background:rgba(6,182,212,0.1);color:#0891B2;display:flex;align-items:center;justify-content:center;">${ICONS.target}</div>
          <span style="font-size:11px;font-weight:700;color:#0F172A;">Στόχοι</span>
        </div>

        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:14px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">
          <div style="width:34px;height:34px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;">${ICONS.wallet}</div>
          <span style="font-size:11px;font-weight:700;color:#0F172A;">Budgets</span>
        </div>
      </div>
    </div>

    <!-- AI Advisor Card -->
    <div style="background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;">
      <div style="width:30px;height:30px;border-radius:8px;background:#0F172A;color:#FFF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${ICONS.lightbulb}</div>
      <div style="font-size:12px;color:#334155;line-height:1.4;">
        <strong style="color:#0F172A;">AI Σύμβουλος:</strong> Βρίσκεσαι 81% κάτω από τον μέσο όρο εξόδων σου. Εξαιρετική διαχείριση!
      </div>
    </div>

    <!-- Recent Transactions Feed -->
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:13px;font-weight:800;color:#0F172A;">Πρόσφατες Συναλλαγές</span>
        <span style="font-size:12px;font-weight:700;color:#7C3AED;">Όλα (588) &rarr;</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:10px;background:rgba(124,58,237,0.1);color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:15px;">✂️</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0F172A;">Κούρεμα</div>
              <div style="font-size:11px;color:#64748B;">7 Νοεμβρίου • Φροντίδα</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:900;color:#E11D48;">-15,00 €</div>
        </div>

        <div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;font-size:15px;">⛽</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0F172A;">Βενζίνη</div>
              <div style="font-size:11px;color:#64748B;">7 Νοεμβρίου • Μετακίνηση</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:900;color:#E11D48;">-20,00 €</div>
        </div>

        <div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:10px;background:rgba(16,185,129,0.1);color:#059669;display:flex;align-items:center;justify-content:center;font-size:15px;">💼</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:#0F172A;">Μισθοδοσία</div>
              <div style="font-size:11px;color:#64748B;">1 Νοεμβρίου • Εισόδημα</div>
            </div>
          </div>
          <div style="font-size:14px;font-weight:900;color:#059669;">+3.400,00 €</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── 3. REDESIGNED ERGONOMIC BOTTOM NAV BAR ── -->
  <nav class="bottom-nav">
    <div class="nav-tab active">
      ${ICONS.home}
      <span>Αρχική</span>
    </div>

    <div class="nav-tab">
      ${ICONS.pieChart}
      <span>Ανάλυση</span>
    </div>

    <!-- Center Elevated FAB -->
    <div class="fab-btn">
      ${ICONS.plus}
    </div>

    <div class="nav-tab">
      ${ICONS.clock}
      <span>Ιστορικό</span>
    </div>

    <div class="nav-tab">
      ${ICONS.settings}
      <span>Ρυθμίσεις</span>
    </div>
  </nav>
</body>
</html>`;
}

async function renderMocks() {
  console.log('Rendering UX Mocks with Playwright...');
  const browser = await chromium.launch();

  // Desktop Mock (1440 x 1024)
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 1024, deviceScaleFactor: 1 } });
  await desktopPage.setContent(getDesktopMockHtml());
  const desktopBuf = await desktopPage.screenshot();
  fs.writeFileSync(path.join(outDir, 'desktop-homepage-mock.png'), desktopBuf);
  console.log('✓ desktop-homepage-mock.png (1440x1024)');
  await desktopPage.close();

  // Mobile Mock (412 x 915 @ 2x = 824 x 1830)
  const mobilePage = await browser.newPage({ viewport: { width: 412, height: 915, deviceScaleFactor: 2 } });
  await mobilePage.setContent(getMobileMockHtml());
  const mobileBuf = await mobilePage.screenshot();
  fs.writeFileSync(path.join(outDir, 'mobile-homepage-mock.png'), mobileBuf);
  console.log('✓ mobile-homepage-mock.png (824x1830)');
  await mobilePage.close();

  await browser.close();
  console.log('All UX Mocks generated successfully!');
}

renderMocks().catch(err => {
  console.error('UX Mock rendering failed:', err);
  process.exit(1);
});
