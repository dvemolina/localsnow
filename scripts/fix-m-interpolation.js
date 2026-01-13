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

  // Pattern: m["namespace.key"]({ params }) -> $t('namespace_key')
  // For now, we'll drop the parameters since the JSON doesn't support interpolation yet
  const pattern = /\bm\[["']([a-zA-Z0-9._-]+)["']\]\(\{[^}]*\}\)/g;
  const matches = [...content.matchAll(pattern)];

  if (matches.length === 0) {
    continue;
  }

  console.log(`\n📝 Fixing: ${file} (${matches.length} m[] with params)`);

  // Replace each pattern
  content = content.replace(pattern, (match, fullKey) => {
    // Convert dotted key to underscore notation
    // "admin.resorts.admin_resort_management_desc" -> "admin_resorts_admin_resort_management_desc"
    // But actually, the pattern in JSON is: "admin_resort_management_desc"
    // So we take the last part after the last dot
    const parts = fullKey.split('.');
    const key = parts[parts.length - 1];

    // Try to determine namespace from the key
    let namespace = 'admin';
    if (fullKey.includes('dashboard.')) namespace = parts[1].replace('-', '_');
    else if (fullKey.includes('admin.')) namespace = parts[1];

    fileReplacements++;
    console.log(`   ${fullKey} -> ${namespace}_${key}`);
    return `$t('${namespace}_${key}')`;
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
