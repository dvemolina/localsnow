import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .svelte files in src directory
const svelteFiles = await glob('src/**/*.svelte', { cwd: path.join(__dirname, '..') });

let filesFixed = 0;
let totalReplacements = 0;

// Map to normalize namespace names (some use dots, dashes, etc)
function getContentNamespace(fullKey) {
  const parts = fullKey.split('.');

  // For nested namespaces like "dashboard.my-bookings.key"
  // We want to use "my_bookings" as the content namespace
  if (parts.length >= 2) {
    // Take the last part before the actual key
    // Convert dashes to underscores for valid JavaScript identifiers
    const namespace = parts[parts.length - 2].replace(/-/g, '_');
    return namespace;
  }

  // Fallback to first part
  return parts[0].replace(/-/g, '_');
}

function getContentKey(fullKey) {
  const parts = fullKey.split('.');
  // The key is the last part
  return parts[parts.length - 1];
}

for (const file of svelteFiles) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileReplacements = 0;

  // Pattern to match m["any.dotted.key"]() or m['any.dotted.key']()
  const pattern = /\bm\[["']([a-zA-Z0-9._-]+)["']\]\(\)/g;

  // Find all matches first
  const matches = [...content.matchAll(pattern)];

  if (matches.length > 0) {
    console.log(`\n📝 Fixing ${matches.length} m[] calls in: ${file}`);

    // Track which content namespaces are used
    const usedNamespaces = new Set();

    // Track the keys being used for each namespace
    const namespaceKeys = new Map();

    // Replace each match
    content = content.replace(pattern, (match, fullKey) => {
      const namespace = getContentNamespace(fullKey);
      const key = getContentKey(fullKey);

      usedNamespaces.add(namespace);

      if (!namespaceKeys.has(namespace)) {
        namespaceKeys.set(namespace, []);
      }
      namespaceKeys.get(namespace).push({ fullKey, key });

      fileReplacements++;
      return `$${namespace}.${key}.value`;
    });

    // Check if the file imports useIntlayer
    const hasUseIntlayer = content.includes("from 'svelte-intlayer'");

    if (hasUseIntlayer) {
      // Check if each namespace is declared with useIntlayer
      for (const namespace of usedNamespaces) {
        const hasNamespaceDeclaration = new RegExp(
          `const ${namespace} = useIntlayer\\(['"]${namespace}['"]\\)`
        ).test(content);

        if (!hasNamespaceDeclaration) {
          console.log(`   ⚠️  Missing: const ${namespace} = useIntlayer('${namespace}')`);
          console.log(`      Used for:`);
          for (const { fullKey, key } of namespaceKeys.get(namespace).slice(0, 3)) {
            console.log(`        - ${fullKey} → $${namespace}.${key}.value`);
          }
          if (namespaceKeys.get(namespace).length > 3) {
            console.log(`        ... and ${namespaceKeys.get(namespace).length - 3} more`);
          }
        }
      }
    } else {
      console.log(`   ⚠️  Warning: File doesn't import 'svelte-intlayer'`);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      totalReplacements += fileReplacements;
      console.log(`   ✅ Fixed ${fileReplacements} replacements`);
    }
  }
}

console.log(`\n🎉 Fixed ${filesFixed} files with ${totalReplacements} total replacements`);

if (filesFixed > 0) {
  console.log(`\n📋 NEXT STEPS:`);
  console.log(`1. Add missing useIntlayer declarations to files (warnings above)`);
  console.log(`2. Verify all content files exist for the used namespaces`);
  console.log(`3. Run the dev server to check for any remaining errors`);
}
