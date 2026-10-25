// Generate the app icon as PNG without external fonts, services or native packages.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const size = 1024;
const pixels = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const p = y * (size * 4 + 1) + 1 + x * 4;
    const dx = x - 512, dy = y - 512;
    const r = Math.hypot(dx, dy);
    const cornerX = Math.max(0, Math.abs(dx) - 310);
    const cornerY = Math.max(0, Math.abs(dy) - 310);
    const inside = Math.hypot(cornerX, cornerY) < 180;
    const ring = Math.abs(r - 265) < 12 || Math.abs(r - 185) < 9;
    const dot = r < 77;
    const accent = dot || ring;
    const glow = Math.max(0, 1 - r / 600);
    pixels[p] = accent ? 213 : 16 + Math.round(glow * 10);
    pixels[p + 1] = accent ? 255 : 17 + Math.round(glow * 10);
    pixels[p + 2] = accent ? 64 : 14 + Math.round(glow * 9);
    pixels[p + 3] = inside ? 255 : 0;
  }
}
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const kind = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([kind, data])));
  return Buffer.concat([length, kind, data, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
fs.mkdirSync(path.join(__dirname, '../assets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../assets/icon.png'), Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(pixels)), chunk('IEND', Buffer.alloc(0)),
]));
