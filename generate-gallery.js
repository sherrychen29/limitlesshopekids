/**
 * Run this script once whenever you add/remove photos from media/gallery/:
 *   node generate-gallery.js
 *
 * It scans the folder and writes media/gallery/manifest.json,
 * which the site reads to build the gallery dynamically.
 */

const fs   = require('fs');
const path = require('path');

const galleryDir  = path.join(__dirname, 'media', 'gallery');
const manifestPath = path.join(galleryDir, 'manifest.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

const files = fs.readdirSync(galleryDir).filter(f => {
    if (f === 'manifest.json') return false;
    return IMAGE_EXTS.has(path.extname(f).toLowerCase());
});

fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
console.log(`✓ manifest.json updated with ${files.length} photo(s):`);
files.forEach(f => console.log(`  • ${f}`));
