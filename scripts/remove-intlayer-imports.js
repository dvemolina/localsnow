import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .svelte and .ts files
const files = await glob('src/**/*.{svelte,ts}', { cwd: path.join(__dirname, '..') });

let totalFiles = 0;

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Remove import lines
  content = content.replace(/\s*import\s+{\s*useIntlayer\s*}\s+from\s+['"]svelte-intlayer['"];?\n?/g, '');
  content = content.replace(/\s*import\s+.*from\s+['"]@intlayer\/.*['"];?\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    console.log(`✅ Fixed: ${file}`);
  }
}

console.log(`\n🎉 Removed imports from ${totalFiles} files`);
