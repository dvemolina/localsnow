import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .svelte files in src directory
const svelteFiles = await glob('src/**/*.svelte', { cwd: path.join(__dirname, '..') });

let filesFixed = 0;

for (const file of svelteFiles) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Check for problematic m. patterns
  const hasMReference = /\bm\./g.test(content) || /\bm\[/g.test(content);

  if (hasMReference) {
    console.log(`\n📝 Fixing m. references in: ${file}`);

    // Pattern 1: m.property ? $intlayer.key.value : 'Fallback'
    // Replace with just: $intlayer.key.value
    content = content.replace(
      /m\.\w+\s*\?\s*(\$\w+\.\w+\.value)\s*:\s*['"][^'"]*['"]/g,
      '$1'
    );

    // Pattern 2: Remove any remaining m["key"]() patterns
    const pattern = /\bm\[["']([a-zA-Z_.-]+)["']\]\(\)/g;
    const matches = [...content.matchAll(pattern)];

    if (matches.length > 0) {
      console.log(`   Found ${matches.length} m["key"]() patterns that need manual review`);
      for (const match of matches) {
        console.log(`   - m["${match[1]}"]() at position ${match.index}`);
      }
    }

    // Remove import of paraglide messages
    content = content.replace(
      /import\s+\*\s+as\s+m\s+from\s+['"][^'"]*paraglide[^'"]*['"];?\n?/g,
      ''
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      console.log(`   ✅ Fixed ${file}`);
    }
  }
}

console.log(`\n🎉 Fixed ${filesFixed} files with m. references`);
