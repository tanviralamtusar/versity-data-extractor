#!/usr/bin/env node

/**
 * Simple Icon Generator for API Extractor Extension
 * Run: node generate-icons.js
 * 
 * This script creates the required PNG icons for the Chrome extension.
 * It uses canvas to draw a simple API-themed icon.
 */

const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const outputDir = __dirname;

function generateIcon(size) {
  const canvas = Canvas.createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#667eea';
  ctx.fillRect(0, 0, size, size);

  // Draw a simple API icon (network nodes)
  const scale = size / 128;
  const lineWidth = Math.max(1, 2 * scale);

  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = lineWidth;

  if (size >= 16) {
    // Draw three circles (nodes)
    const r = size / 6;
    
    // Top node
    ctx.beginPath();
    ctx.arc(size / 2, size / 4, r, 0, Math.PI * 2);
    ctx.fill();

    // Bottom left node
    ctx.beginPath();
    ctx.arc(size / 4, (size * 3) / 4, r, 0, Math.PI * 2);
    ctx.fill();

    // Bottom right node
    ctx.beginPath();
    ctx.arc((size * 3) / 4, (size * 3) / 4, r, 0, Math.PI * 2);
    ctx.fill();

    // Draw connecting lines
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 4 + r);
    ctx.lineTo(size / 4, (size * 3) / 4 - r);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2, size / 4 + r);
    ctx.lineTo((size * 3) / 4, (size * 3) / 4 - r);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 4, (size * 3) / 4);
    ctx.lineTo((size * 3) / 4, (size * 3) / 4);
    ctx.stroke();
  }

  return canvas.createPNGStream();
}

console.log('🎨 Generating API Extractor extension icons...\n');

sizes.forEach(size => {
  const filename = `icon${size}.png`;
  const filepath = path.join(outputDir, filename);
  const stream = generateIcon(size);
  const fileStream = fs.createWriteStream(filepath);

  stream.pipe(fileStream);

  fileStream.on('finish', () => {
    console.log(`✅ Created ${filename} (${size}x${size})`);
  });

  fileStream.on('error', (err) => {
    console.error(`❌ Error creating ${filename}:`, err);
  });
});

console.log('\n✨ Icon generation complete! You can now load the extension in Chrome.');
