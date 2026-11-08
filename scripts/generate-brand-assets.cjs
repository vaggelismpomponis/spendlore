const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
  console.log('=== Spendlore Master Brand Asset Generator ===');
  const srcPath = path.resolve(__dirname, '../spendlore.jpg');
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source image not found: ${srcPath}`);
  }

  const src = await Jimp.read(srcPath);
  const W = src.bitmap.width;
  const H = src.bitmap.height;
  console.log(`Source master image: ${W}x${H}`);

  // ── Step 1: Extract Authentic 3D Ribbon Emblem ──
  const embX1 = 221, embX2 = 685;
  const embY1 = 662, embY2 = 1385;
  const embW = embX2 - embX1;
  const embH = embY2 - embY1;

  console.log(`Extracting 3D ribbon emblem (${embW}x${embH})...`);
  const rawEmblem = new Jimp(embW, embH, 0x00000000);

  for (let y = 0; y < embH; y++) {
    for (let x = 0; x < embW; x++) {
      const px = Jimp.intToRGBA(src.getPixelColor(embX1 + x, embY1 + y));
      const r = px.r, g = px.g, b = px.b;
      const isWhiteish = (r >= 245 && g >= 245 && b >= 245);
      const isLowSaturation = (Math.max(r, g, b) - Math.min(r, g, b) < 14);

      if (isWhiteish || (g > 240 && isLowSaturation)) {
        rawEmblem.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
      } else {
        let alpha = 1.0;
        if (g > 35) {
          alpha = Math.max(0, Math.min(1, (253 - g) / (253 - 35)));
        }
        alpha = Math.pow(alpha, 1.15);

        const unmix = (val) => {
          if (alpha <= 0.05) return val;
          const pure = (val - (1 - alpha) * 254) / alpha;
          return Math.max(0, Math.min(255, Math.round(pure)));
        };

        const outR = unmix(r);
        const outG = unmix(g);
        const outB = unmix(b);
        const outA = Math.max(0, Math.min(255, Math.round(alpha * 255)));

        if (outA > 4) {
          rawEmblem.setPixelColor(Jimp.rgbaToInt(outR, outG, outB, outA), x, y);
        } else {
          rawEmblem.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
        }
      }
    }
  }

  rawEmblem.autocrop({ tolerance: 0.01, leaveBorder: 0 });
  console.log(`Cleaned 3D emblem size: ${rawEmblem.bitmap.width}x${rawEmblem.bitmap.height}`);
  const emblemBase64 = (await rawEmblem.getBufferAsync(Jimp.MIME_PNG)).toString('base64');

  // Helper function for centered square icon creation
  async function createCenteredSquare(image, size, scaleRatio = 0.78, bgHex = 0x00000000) {
    const canvas = new Jimp(size, size, bgHex);
    const targetDim = Math.round(size * scaleRatio);
    
    const imgRatio = image.bitmap.width / image.bitmap.height;
    let targetW, targetH;
    if (imgRatio > 1) {
      targetW = targetDim;
      targetH = Math.round(targetDim / imgRatio);
    } else {
      targetH = targetDim;
      targetW = Math.round(targetDim * imgRatio);
    }

    const scaled = image.clone().resize(targetW, targetH, Jimp.RESIZE_BICUBIC);
    const offsetX = Math.round((size - targetW) / 2);
    const offsetY = Math.round((size - targetH) / 2);

    canvas.composite(scaled, offsetX, offsetY);
    return canvas;
  }

  // ── Step 2: Generate All Standalone Mark & App Icon Targets ──
  console.log('Generating standalone mark and icon assets...');

  const pubDir = path.resolve(__dirname, '../public');
  const assetsDir = path.resolve(__dirname, '../assets');
  const playStoreDir = path.resolve(__dirname, '../assets/google-play');

  [pubDir, assetsDir, playStoreDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // 1. Transparent Standalone Mark (512x512)
  const mark512 = await createCenteredSquare(rawEmblem, 512, 0.82, 0x00000000);
  await mark512.writeAsync(path.join(pubDir, 'spendlore-mark.png'));
  console.log('✓ spendlore-mark.png (512x512 transparent)');

  // 2. Play Store Icon (512x512 solid white background)
  const playStoreIcon = await createCenteredSquare(rawEmblem, 512, 0.70, 0xFFFFFFFF);
  await playStoreIcon.writeAsync(path.join(assetsDir, 'play-store-icon-512.png'));
  await playStoreIcon.writeAsync(path.join(pubDir, 'play-store-icon-512.png'));
  await playStoreIcon.writeAsync(path.join(playStoreDir, 'play-store-icon-512.png'));
  console.log('✓ assets, public & google-play /play-store-icon-512.png (512x512 solid white)');

  // 3. High-Res Logo / App Icon (1024x1024 solid white background)
  const logo1024 = await createCenteredSquare(rawEmblem, 1024, 0.65, 0xFFFFFFFF);
  await logo1024.writeAsync(path.join(pubDir, 'spendlore-logo.png'));
  console.log('✓ spendlore-logo.png (1024x1024 solid white)');

  // 4. Favicon (512x512 PNG, ICO 16/32/48, and SVG)
  await playStoreIcon.writeAsync(path.join(pubDir, 'favicon.png'));
  console.log('✓ favicon.png (512x512 matching Play Store icon)');

  const ico16 = await createCenteredSquare(rawEmblem, 16, 0.78, 0xFFFFFFFF);
  const ico32 = await createCenteredSquare(rawEmblem, 32, 0.74, 0xFFFFFFFF);
  const ico48 = await createCenteredSquare(rawEmblem, 48, 0.72, 0xFFFFFFFF);
  const buf16 = await ico16.getBufferAsync(Jimp.MIME_PNG);
  const buf32 = await ico32.getBufferAsync(Jimp.MIME_PNG);
  const buf48 = await ico48.getBufferAsync(Jimp.MIME_PNG);
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 }
  ]);
  fs.writeFileSync(path.join(pubDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico (16x16, 32x32, 48x48 multi-size)');

  // SVG Favicon
  const faviconBase64 = (await playStoreIcon.getBufferAsync(Jimp.MIME_PNG)).toString('base64');
  const svgFaviconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <image width="512" height="512" href="data:image/png;base64,${faviconBase64}"/>
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgFaviconContent, 'utf-8');
  console.log('✓ favicon.svg');

  // Standalone Mark SVG
  const svgMarkContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image width="512" height="512" href="data:image/png;base64,${(await mark512.getBufferAsync(Jimp.MIME_PNG)).toString('base64')}"/>
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'spendlore-mark.svg'), svgMarkContent, 'utf-8');
  console.log('✓ spendlore-mark.svg');

  // 5. PWA Icons (192x192 & 512x512)
  const pwa192 = await createCenteredSquare(rawEmblem, 192, 0.70, 0xFFFFFFFF);
  await pwa192.writeAsync(path.join(pubDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png');

  await playStoreIcon.writeAsync(path.join(pubDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png');

  // 6. Apple Touch Icon (180x180)
  const appleTouchIcon = await createCenteredSquare(rawEmblem, 180, 0.70, 0xFFFFFFFF);
  await appleTouchIcon.writeAsync(path.join(pubDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // 7. Capacitor Native Assets
  const capIcon = await createCenteredSquare(rawEmblem, 1024, 0.65, 0xFFFFFFFF);
  await capIcon.writeAsync(path.join(assetsDir, 'icon.png'));
  console.log('✓ assets/icon.png (1024x1024 solid white background)');

  const capLogo = await createCenteredSquare(rawEmblem, 1024, 0.75, 0x00000000);
  await capLogo.writeAsync(path.join(assetsDir, 'logo.png'));
  console.log('✓ assets/logo.png (1024x1024 transparent)');

  const capSplash = await createCenteredSquare(rawEmblem, 1024, 0.50, 0xFFFFFFFF);
  await capSplash.writeAsync(path.join(assetsDir, 'splash.png'));
  console.log('✓ assets/splash.png (1024x1024 solid white)');

  // ── Step 3: Render Master Full Logo System (Emblem + "Spendlore") ──
  console.log('Rendering Master "Spendlore" Full Logo System...');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 400 },
    deviceScaleFactor: 2
  });

  const getFullLogoHtml = (textColor) => `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: transparent;
          width: 1200px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .container {
          display: inline-flex;
          align-items: center;
          gap: 36px;
        }
        .emblem {
          height: 250px;
          width: auto;
          display: block;
          filter: drop-shadow(0 12px 28px rgba(124, 58, 237, 0.18));
        }
        .wordmark {
          font-family: 'Outfit', system-ui, -apple-system, sans-serif;
          font-weight: 700;
          font-size: 172px;
          color: ${textColor};
          letter-spacing: -0.022em;
          line-height: 1;
          display: inline-block;
          transform: translateY(2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <img class="emblem" src="data:image/png;base64,${emblemBase64}" alt="Spendlore" />
        <span class="wordmark">Spendlore</span>
      </div>
    </body>
    </html>
  `;

  // Render Full Logo PNG (Light)
  await page.setContent(getFullLogoHtml('#04142D'));
  await page.waitForTimeout(1000);
  const fullLogoBuf = await page.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(pubDir, 'spendlore-full-logo.png'), fullLogoBuf);
  console.log('✓ public/spendlore-full-logo.png (2400x800 retina transparent)');

  // Render Full Logo PNG (Dark)
  await page.setContent(getFullLogoHtml('#FFFFFF'));
  await page.waitForTimeout(500);
  const fullLogoDarkBuf = await page.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(pubDir, 'spendlore-full-logo-dark.png'), fullLogoDarkBuf);
  console.log('✓ public/spendlore-full-logo-dark.png (2400x800 retina transparent)');

  await browser.close();

  // Full Logo SVGs
  const svgLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700&amp;display=swap');
      .wordmark {
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 172px;
        letter-spacing: -0.022em;
        fill: #04142D;
      }
    </style>
    <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#7C3AED" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g transform="translate(100, 75)">
    <image filter="url(#emblemGlow)" width="160" height="250" href="data:image/png;base64,${emblemBase64}"/>
    <text x="200" y="184" class="wordmark">Spendlore</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'spendlore-full-logo.svg'), svgLight, 'utf-8');
  console.log('✓ public/spendlore-full-logo.svg');

  const svgDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700&amp;display=swap');
      .wordmark {
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 172px;
        letter-spacing: -0.022em;
        fill: #FFFFFF;
      }
    </style>
    <filter id="emblemGlowDark" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#7C3AED" flood-opacity="0.30"/>
    </filter>
  </defs>
  <g transform="translate(100, 75)">
    <image filter="url(#emblemGlowDark)" width="160" height="250" href="data:image/png;base64,${emblemBase64}"/>
    <text x="200" y="184" class="wordmark">Spendlore</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'spendlore-full-logo-dark.svg'), svgDark, 'utf-8');
  console.log('✓ public/spendlore-full-logo-dark.svg');

  console.log('=== All brand assets successfully generated! ===');
}

run().catch((err) => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
