/**
 * generate-manifest.js
 * ---------------------------------------------------
 * Run this LOCALLY, on your computer, where the real
 * .mp3 files actually exist inside the /songs folder.
 *
 *      node generate-manifest.js
 *
 * It scans every folder inside /songs and writes a
 * single songs/manifest.json file listing every album
 * and every song inside it.
 *
 * WHY THIS IS NEEDED:
 * Vercel (and most static hosts) do NOT let a website
 * "list" the files inside a folder at runtime the way
 * some free hosts did. So instead of asking the server
 * "what files are in this folder?" at runtime, we build
 * that list ONCE, save it as a JSON file, and the website
 * just reads that JSON file. This works everywhere.
 *
 * Re-run this script (and redeploy) any time you
 * add / remove / rename songs or folders.
 *
 * Optional: put an info.json inside a song folder to
 * give it a custom title/description, e.g.:
 *   songs/hindi/info.json
 *   { "title": "Hindi Hits", "description": "Top hindi tracks" }
 * If you don't add one, the folder name is used as the title.
 * ---------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');

if (!fs.existsSync(songsDir)) {
  console.error('❌ Could not find a "songs" folder next to this script.');
  process.exit(1);
}

const manifest = { folders: [] };

const folders = fs.readdirSync(songsDir).filter((f) =>
  fs.statSync(path.join(songsDir, f)).isDirectory()
);

if (folders.length === 0) {
  console.warn('⚠️  No sub-folders found inside /songs. Nothing to generate.');
}

folders.forEach((folder) => {
  const folderPath = path.join(songsDir, folder);
  const files = fs.readdirSync(folderPath);

  const mp3s = files.filter((f) => f.toLowerCase().endsWith('.mp3'));

  // Optional per-folder metadata
  let info = { title: folder, description: `${folder} songs` };
  const infoPath = path.join(folderPath, 'info.json');
  if (fs.existsSync(infoPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      info = { ...info, ...parsed };
    } catch (e) {
      console.warn(`⚠️  Could not parse info.json in "${folder}", using default title.`);
    }
  }

  // Pick a cover image if one exists in the folder, else fall back
  const coverCandidates = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const cover = coverCandidates[0] || 'cover.jpg';

  manifest.folders.push({
    id: folder,
    title: info.title,
    description: info.description,
    cover,
    songs: mp3s,
  });

  console.log(`✔ ${folder}: ${mp3s.length} song(s) found`);
});

fs.writeFileSync(
  path.join(songsDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`\n✅ songs/manifest.json generated with ${manifest.folders.length} album(s).`);
console.log('   Commit this file and redeploy to Vercel.');
