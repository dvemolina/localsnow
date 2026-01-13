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

  // Skip if doesn't use svelte-intlayer
  if (!content.includes('svelte-intlayer')) {
    continue;
  }

  console.log(`\n📝 Migrating: ${file}`);

  // Step 1: Replace import
  content = content.replace(
    /import\s+{\s*useIntlayer\s*}\s+from\s+['"]svelte-intlayer['"];?\n?/g,
    "import { t } from '$lib/i18n/i18n';\n"
  );

  // Step 2: Find all useIntlayer declarations to get namespaces
  const useIntlayerPattern = /const\s+(\w+)\s*=\s*useIntlayer\(['"](\w+)['"]\);?/g;
  const namespaces = [];
  let match;

  while ((match = useIntlayerPattern.exec(content)) !== null) {
    namespaces.push({ varName: match[1], namespace: match[2] });
  }

  if (namespaces.length === 0) {
    console.log(`   ⚠️  No useIntlayer calls found, skipping`);
    continue;
  }

  // Step 3: Remove useIntlayer declarations
  content = content.replace(/\s*const\s+\w+\s*=\s*useIntlayer\(['"](\w+)['"]\);?\n?/g, '');

  // Step 4: Replace usage patterns for each namespace
  for (const { varName, namespace } of namespaces) {
    // Pattern: $varName.key.value -> $t('namespace_key')
    const usagePattern = new RegExp(`\\$${varName}\\.(\\w+)\\.value`, 'g');

    content = content.replace(usagePattern, (match, key) => {
      fileReplacements++;
      return `$t('${namespace}_${key}')`;
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFiles++;
    totalReplacements += fileReplacements;
    console.log(`   ✅ Updated with ${fileReplacements} replacements`);
    console.log(`   Namespaces: ${namespaces.map(n => n.namespace).join(', ')}`);
  }
}

console.log(`\n🎉 Migration complete!`);
console.log(`   Files updated: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`\n⚠️  IMPORTANT: Review the changes and check for:`);
console.log(`   1. Translation keys that may not match exactly`);
console.log(`   2. Components that need manual updates`);
console.log(`   3. Any remaining svelte-intlayer imports`);
