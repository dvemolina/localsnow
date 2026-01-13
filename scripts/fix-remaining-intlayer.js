import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .svelte files
const files = await glob('src/**/*.svelte', { cwd: path.join(__dirname, '..') });

let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileReplacements = 0;

  // Pattern: $namespace.key.value -> $t('namespace_key')
  const pattern = /\$(\w+)\.(\w+)\.value/g;
  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    continue;
  }

  console.log(`\n📝 Fixing: ${file} (${matches.length} patterns)`);

  // Replace each pattern
  content = content.replace(pattern, (match, namespace, key) => {
    fileReplacements++;
    return `$t('${namespace}_${key}')`;
  });

  // Also fix any remaining m. references
  content = content.replace(/\bm\.\w+\s*\?/g, (match) => {
    console.log(`   ⚠️  Found old Paraglide pattern: ${match}`);
    return 'true ?'; // Replace with true for now
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    totalReplacements += fileReplacements;
    console.log(`   ✅ Fixed ${fileReplacements} replacements`);
  }
}

console.log(`\n🎉 Fix complete!`);
console.log(`   Files updated: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
