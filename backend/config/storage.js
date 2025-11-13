import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Single source of truth for where files live on disk
export const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Generate safe, unique filenames
export function makeFilename(ext = '.png') {
  const id = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${id}${ext.startsWith('.') ? ext : `.${ext}`}`;
}

// Convert an on-disk filename to a public URL (served by Express static)
export function toPublicUrl(filename) {
  return `/uploads/${filename}`;
}

// Save a canvas dataURL (base64) to disk and return { filename, url }
export function saveDataUrl(dataUrl) {
  const m = /^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Invalid data URL');

  const ext = m[1] === 'jpeg' ? '.jpg' : `.${m[1]}`;
  const buffer = Buffer.from(m[2], 'base64');

  const filename = makeFilename(ext);
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filepath, buffer);

  return { filename, url: toPublicUrl(filename), filepath };
}

// Delete a stored file (best-effort)
export function deleteStored(filename) {
  if (!filename) return;
  const filepath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filepath)) {
    try { fs.unlinkSync(filepath); } catch { /* ignore */ }
  }
}

// Multer storage for multipart/form-data uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, makeFilename(ext));
  }
});

// Basic image filter and size limits (tweak to taste)
const fileFilter = (_req, file, cb) => {
  const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Tipo de arquivo inválido (PNG/JPG/WEBP)'), ok);
};
//Helper
export function urlToFilename(url) {
  // "/uploads/169982233-a1b2.png" -> "169982233-a1b2.png"
  if (!url) return null;
  const i = url.lastIndexOf('/uploads/');
  return i >= 0 ? url.slice(i + '/uploads/'.length) : null;
}

export function getMulter() {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  });
}
