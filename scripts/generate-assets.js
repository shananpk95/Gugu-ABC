const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return ~crc >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBuffer, data, crc]);
}

function encodePng(width, height, getPixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = getPixel(x, y);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
      offset += 4;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function circle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function drawIcon(size, transparent) {
  const cx = size / 2;
  const cy = size / 2 + size * 0.04;
  return encodePng(size, size, (x, y) => {
    if (!transparent && circle(x, y, size * 0.78, size * 0.22, size * 0.08)) {
      return [255, 224, 138, 255];
    }
    const inHead = circle(x, y, cx, cy, size * 0.28);
    const inEarL = circle(x, y, cx - size * 0.22, cy - size * 0.22, size * 0.12);
    const inEarR = circle(x, y, cx + size * 0.22, cy - size * 0.22, size * 0.12);
    const inBelly = circle(x, y, cx, cy + size * 0.02, size * 0.16);
    if (inEarL || inEarR) return [214, 164, 110, 255];
    if (inHead) {
      if (circle(x, y, cx - size * 0.08, cy - size * 0.02, size * 0.035) ||
          circle(x, y, cx + size * 0.08, cy - size * 0.02, size * 0.035)) {
        return [43, 58, 74, 255];
      }
      if (circle(x, y, cx, cy + size * 0.08, size * 0.04)) return [255, 139, 123, 255];
      if (inBelly) return [255, 236, 214, 255];
      return [232, 184, 132, 255];
    }
    if (transparent) return [0, 0, 0, 0];
    return [126, 200, 227, 255];
  });
}

function writeWav(filePath, samples, sampleRate = 22050) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

function envelope(i, n, attack, release) {
  const a = Math.min(1, i / (n * attack));
  const r = Math.min(1, (n - i) / (n * release));
  return Math.max(0, Math.min(a, r));
}

function tone(freq, duration, volume, sampleRate = 22050) {
  const n = Math.floor(duration * sampleRate);
  const samples = new Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    samples[i] =
      Math.sin(2 * Math.PI * freq * t) * volume * envelope(i, n, 0.08, 0.2);
  }
  return samples;
}

function concat(parts) {
  return parts.reduce((all, part) => all.concat(part), []);
}

function backgroundMusic() {
  const sampleRate = 22050;
  const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66];
  const pattern = [];
  for (let loop = 0; loop < 4; loop += 1) {
    notes.forEach((freq, index) => {
      pattern.push(tone(freq / 2, 0.55, 0.08, sampleRate));
      if (index % 2 === 0) {
        pattern.push(tone(freq, 0.55, 0.04, sampleRate).map((s, i) => s + pattern[pattern.length - 1][i] * 0));
      }
    });
  }
  const duration = 18;
  const n = Math.floor(duration * sampleRate);
  const samples = new Array(n).fill(0);
  const seq = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 246.94];
  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const beat = Math.floor(t / 0.5) % seq.length;
    const freq = seq[beat] / 2;
    const env = 0.5 + 0.5 * Math.sin((t % 0.5) / 0.5 * Math.PI);
    samples[i] =
      Math.sin(2 * Math.PI * freq * t) * 0.07 * env +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.02 * env;
  }
  return samples;
}

function chime(freqs) {
  const parts = freqs.map((freq, i) => {
    const silence = new Array(Math.floor(22050 * 0.08 * i)).fill(0);
    return concat([silence, tone(freq, 0.35, 0.22)]);
  });
  const max = Math.max(...parts.map((p) => p.length));
  const mixed = new Array(max).fill(0);
  parts.forEach((part) => {
    part.forEach((s, i) => {
      mixed[i] += s;
    });
  });
  return mixed;
}

const root = path.join(__dirname, '..');
const imageDir = path.join(root, 'assets', 'images');
const effectDir = path.join(root, 'assets', 'audio', 'effects');
const musicDir = path.join(root, 'assets', 'audio', 'music');
[
  imageDir,
  effectDir,
  musicDir,
  path.join(root, 'assets', 'audio', 'letters'),
  path.join(root, 'assets', 'audio', 'letter-sounds'),
  path.join(root, 'assets', 'audio', 'words'),
  path.join(root, 'assets', 'audio', 'phonics'),
  path.join(root, 'assets', 'audio', 'phrases'),
].forEach(ensureDir);

// Branding assets (icon/splash/favicon) are generated from assets/images/gugu-logo.png.
// Do not overwrite them with the placeholder icon painter.

writeWav(path.join(effectDir, 'tap.wav'), tone(660, 0.09, 0.18));
writeWav(path.join(effectDir, 'success.wav'), chime([523.25, 659.25, 783.99]));
writeWav(path.join(effectDir, 'celebrate.wav'), chime([392.0, 523.25, 659.25, 783.99, 1046.5]));
writeWav(path.join(effectDir, 'retry.wav'), concat([tone(330, 0.16, 0.12), tone(294, 0.2, 0.1)]));
writeWav(path.join(musicDir, 'background.wav'), backgroundMusic());

fs.writeFileSync(
  path.join(root, 'assets', 'audio', 'README.md'),
  [
    '# Gugu ABC audio',
    '',
    'Voice pronunciation uses the device English TTS (`en-US`) through the centralized audio manager.',
    'Bundled WAV files are original generated music and sound effects.',
    'Replace files in `letters`, `letter-sounds`, `words`, `phonics`, and `phrases` with recorded voice assets when available; the audio manager will prefer bundled files when present.',
    '',
  ].join('\n'),
);

console.log('Generated Gugu ABC images and audio.');
