const fs = require("fs");
const path = require("path");

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg)$/i;
const ROOT_DIR = "videos";
const OUTPUT = "index.html";

/**
 * Recursively walk folders and collect videos grouped by folder
 */
function scan(dir, base = ROOT_DIR, result = {}) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeDir = path.relative(base, dir) || "Root";

    if (entry.isDirectory()) {
      scan(fullPath, base, result);
    } 
    else if (VIDEO_EXTENSIONS.test(entry.name)) {
      if (!result[relativeDir]) result[relativeDir] = [];
      result[relativeDir].push(path.relative(".", fullPath).replace(/\\/g, "/"));
    }
  }
  return result;
}

const groups = scan(ROOT_DIR);

// Sort folders alphabetically
const sortedFolders = Object.keys(groups).sort((a, b) => a.localeCompare(b));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Video Gallery</title>
<style>
body {
  font-family: system-ui, sans-serif;
  background: #111;
  color: #fff;
  padding: 20px;
}
h1 { margin-bottom: 10px }
h2 {
  margin-top: 40px;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 12px;
}
video {
  width: 100%;
  border-radius: 8px;
  background: #000;
}
.filename {
  font-size: 0.85rem;
  opacity: 0.75;
  margin-top: 4px;
  word-break: break-word;
}
</style>
</head>
<body>

<h1>🎬 Video Gallery</h1>

${sortedFolders.map(folder => `
<h2>${folder}</h2>
<div class="gallery">
${groups[folder]
  .sort((a, b) => a.localeCompare(b))
  .map(v => `
  <div>
    <video src="${v}" controls></video>
    <div class="filename">${path.basename(v)}</div>
  </div>
`).join("")}
</div>
`).join("")}

</body>
</html>`;

fs.writeFileSync(OUTPUT, html);
console.log("✅ index.html generated with subfolders!");
