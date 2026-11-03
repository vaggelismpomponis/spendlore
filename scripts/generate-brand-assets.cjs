const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

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
  console.log('--- Spendlore Brand Asset Generator ---');
  const srcPath = path.resolve(__dirname, '../spendlore.jpg');
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source image not found: ${srcPath}`);
  }

  const src = await Jimp.read(srcPath);
  const W = src.bitmap.width;
  const H = src.bitmap.height;
  console.log(`Source image size: ${W}x${H}`);

  // ── Step 1: Extract the Emblem (the purple '8' loop) ──
  const embX1 = 215, embX2 = 690;
  const embY1 = 650, embY2 = 1395;
  const embW = embX2 - embX1;
  const embH = embY2 - embY1;

  console.log(`Extracting emblem from region (${embX1},${embY1}) to (${embX2},${embY2})...`);
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
  console.log(`Cleaned emblem trimmed size: ${rawEmblem.bitmap.width}x${rawEmblem.bitmap.height}`);

  // ── Step 2: Extract Full Logo (Emblem + Text) ──
  const fullX1 = 215, fullX2 = 1820;
  const fullY1 = 650, fullY2 = 1395;
  const fullW = fullX2 - fullX1;
  const fullH = fullY2 - fullY1;

  console.log(`Extracting full logo (${fullW}x${fullH})...`);
  const rawFull = new Jimp(fullW, fullH, 0x00000000);

  for (let y = 0; y < fullH; y++) {
    for (let x = 0; x < fullW; x++) {
      const px = Jimp.intToRGBA(src.getPixelColor(fullX1 + x, fullY1 + y));
      const r = px.r, g = px.g, b = px.b;

      const isWhite = (r >= 246 && g >= 246 && b >= 246);
      const isNoise = (Math.max(r, g, b) - Math.min(r, g, b) < 12 && r > 238 && g > 238 && b > 238);

      if (isWhite || isNoise) {
        rawFull.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
      } else {
        let alpha = Math.max(0, Math.min(1, (253 - Math.max(r, g, b) + (Math.max(r,g,b)-Math.min(r,g,b))*1.2) / 250));
        if (alpha < 0.05) alpha = 0;

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
          rawFull.setPixelColor(Jimp.rgbaToInt(outR, outG, outB, outA), x, y);
        } else {
          rawFull.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
        }
      }
    }
  }

  rawFull.autocrop({ tolerance: 0.01, leaveBorder: 0 });
  console.log(`Cleaned full logo trimmed size: ${rawFull.bitmap.width}x${rawFull.bitmap.height}`);

  // Helper functions
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

  async function createFullLogoCanvas(image, targetW, targetH, bgHex = 0x00000000) {
    const canvas = new Jimp(targetW, targetH, bgHex);
    const maxInnerW = Math.round(targetW * 0.9);
    const maxInnerH = Math.round(targetH * 0.75);

    const imgRatio = image.bitmap.width / image.bitmap.height;
    let finalW = maxInnerW;
    let finalH = Math.round(maxInnerW / imgRatio);
    if (finalH > maxInnerH) {
      finalH = maxInnerH;
      finalW = Math.round(maxInnerH * imgRatio);
    }

    const scaled = image.clone().resize(finalW, finalH, Jimp.RESIZE_BICUBIC);
    const offsetX = Math.round((targetW - finalW) / 2);
    const offsetY = Math.round((targetH - finalH) / 2);

    canvas.composite(scaled, offsetX, offsetY);
    return canvas;
  }

  // ── Step 3: Generate All Targets ──
  console.log('Generating production asset files...');

  const pubDir = path.resolve(__dirname, '../public');
  const assetsDir = path.resolve(__dirname, '../assets');

  // 1. Transparent Mark (512x512) - Used in LoginView squircle, App headers, etc.
  const mark512 = await createCenteredSquare(rawEmblem, 512, 0.82, 0x00000000);
  await mark512.writeAsync(path.join(pubDir, 'spendlore-mark.png'));
  await mark512.writeAsync(path.join(pubDir, 'spendwise-mark.png'));
  console.log('✓ spendlore-mark.png & spendwise-mark.png (512x512 transparent)');

  // 2. High-Res Logo / App Icon (1024x1024) - Transparent mark
  const logo1024 = await createCenteredSquare(rawEmblem, 1024, 0.78, 0x00000000);
  await logo1024.writeAsync(path.join(pubDir, 'spendlore-logo.png'));
  await logo1024.writeAsync(path.join(pubDir, 'spendwise-logo.png'));
  console.log('✓ spendlore-logo.png & spendwise-logo.png (1024x1024 transparent)');

  // 3. Favicon (512x512 PNG, ICO with 16, 32, 48, and SVG)
  const favicon512 = await createCenteredSquare(rawEmblem, 512, 0.85, 0x00000000);
  await favicon512.writeAsync(path.join(pubDir, 'favicon.png'));
  console.log('✓ favicon.png (512x512)');

  const ico16 = await createCenteredSquare(rawEmblem, 16, 0.90, 0x00000000);
  const ico32 = await createCenteredSquare(rawEmblem, 32, 0.88, 0x00000000);
  const ico48 = await createCenteredSquare(rawEmblem, 48, 0.86, 0x00000000);
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
  const faviconBase64 = (await favicon512.getBufferAsync(Jimp.MIME_PNG)).toString('base64');
  const svgFaviconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <image width="512" height="512" href="data:image/png;base64,${faviconBase64}"/>
</svg>`;
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgFaviconContent, 'utf-8');
  console.log('✓ favicon.svg (vector wrapper with high-res base64 emblem)');

  // 4. PWA Icons (192x192 & 512x512)
  const pwa192 = await createCenteredSquare(rawEmblem, 192, 0.80, 0x00000000);
  await pwa192.writeAsync(path.join(pubDir, 'pwa-192x192.png'));
  await pwa192.writeAsync(path.join(pubDir, 'spendwise-pwa-192.png'));
  console.log('✓ pwa-192x192.png');

  const pwa512 = await createCenteredSquare(rawEmblem, 512, 0.80, 0x00000000);
  await pwa512.writeAsync(path.join(pubDir, 'pwa-512x512.png'));
  await pwa512.writeAsync(path.join(pubDir, 'spendwise-pwa-512.png'));
  console.log('✓ pwa-512x512.png');

  // 5. Capacitor Native Assets (assets/icon.png, assets/logo.png, assets/splash.png)
  const capIcon = await createCenteredSquare(rawEmblem, 1024, 0.65, 0xFFFFFFFF);
  await capIcon.writeAsync(path.join(assetsDir, 'icon.png'));
  console.log('✓ assets/icon.png (1024x1024 solid white background for Android adaptive icons)');

  const capLogo = await createCenteredSquare(rawEmblem, 1024, 0.75, 0x00000000);
  await capLogo.writeAsync(path.join(assetsDir, 'logo.png'));
  console.log('✓ assets/logo.png (1024x1024)');

  const capSplash = await createCenteredSquare(rawEmblem, 1024, 0.50, 0xFFFFFFFF);
  await capSplash.writeAsync(path.join(assetsDir, 'splash.png'));
  console.log('✓ assets/splash.png (1024x1024 solid white for splash generator)');

  const playStoreIcon = await createCenteredSquare(rawEmblem, 512, 0.70, 0xFFFFFFFF);
  await playStoreIcon.writeAsync(path.join(assetsDir, 'play-store-icon-512.png'));
  console.log('✓ assets/play-store-icon-512.png (512x512 solid white for Google Play store)');

  // 6. Full Horizontal Brand Logo (spendlore-full-logo.png)
  const fullLogo = await createFullLogoCanvas(rawFull, 1200, 500, 0x00000000);
  await fullLogo.writeAsync(path.join(pubDir, 'spendlore-full-logo.png'));
  console.log('✓ spendlore-full-logo.png (1200x500 transparent)');

  console.log('All brand assets successfully generated!');
}

run().catch((err) => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
