#!/usr/bin/env node
/**
 * Generate favicon from logo: resize, make white background transparent.
 * Usage: node scripts/make-favicon.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = path.join(__dirname, '../assets/img/logo/skarilje-logo-src.png');
const OUT = path.join(__dirname, '../assets/img/favicon.png');
const SIZE = 32;

const WHITE_THRESHOLD = 240; // RGB all >= this → white/near-white (and soft shadow) → transparent

async function main() {
  const img = sharp(SRC).ensureAlpha();
  const meta = await img.metadata();
  const { channels } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = channels || 4;
  const buf = await img.ensureAlpha().raw().toBuffer();
  const len = buf.length;

  for (let i = 0; i < len; i += ch) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      buf[i + 3] = 0; // alpha = transparent
    }
  }

  await sharp(buf, {
    raw: {
      width: meta.width,
      height: meta.height,
      channels: 4,
    },
  })
    .resize(SIZE, SIZE)
    .png()
    .toFile(OUT);

  console.log('Favicon written to', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
