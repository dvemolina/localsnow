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

for (const file of svelteFiles) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileReplacements = 0;

  // Pattern to match m["namespace.key"]() or m['namespace.key']()
  // Captures: m["about.about_who_built_p1"]() -> about, about_who_built_p1
  const pattern = /\bm\[["']([a-zA-Z_]+)\.([a-zA-Z0-9_]+)["']\]\(\)/g;

  // Find all matches first to check if this file needs fixing
  const matches = [...content.matchAll(pattern)];

  if (matches.length > 0) {
    console.log(`\n📝 Fixing ${matches.length} Paraglide m[] calls in: ${file}`);

    // Track which content namespaces are used to ensure they're imported
    const usedNamespaces = new Set();

    // Replace each match
    content = content.replace(pattern, (match, namespace, key) => {
      usedNamespaces.add(namespace);
      fileReplacements++;
      return `$${namespace}.${key}.value`;
    });

    // Check if the file imports useIntlayer
    const hasUseIntlayer = content.includes("from 'svelte-intlayer'");

    if (hasUseIntlayer) {
      // Check if each namespace is declared with useIntlayer
      for (const namespace of usedNamespaces) {
        const hasNamespaceDeclaration = new RegExp(`const ${namespace} = useIntlayer\\(['"]${namespace}['"]\\)`).test(content);

        if (!hasNamespaceDeclaration) {
          console.log(`   ⚠️  Warning: ${file} uses $${namespace} but doesn't have: const ${namespace} = useIntlayer('${namespace}')`);
          console.log(`      You may need to add this declaration manually.`);
        }
      }
    } else {
      console.log(`   ⚠️  Warning: ${file} doesn't import 'svelte-intlayer'`);
      console.log(`      You may need to add: import { useIntlayer } from 'svelte-intlayer';`);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      filesFixed++;
      totalReplacements += fileReplacements;
      console.log(`   ✅ Fixed ${fileReplacements} replacements in ${file}`);
    }
  }
}

console.log(`\n🎉 Fixed ${filesFixed} files with ${totalReplacements} total replacements`);

if (filesFixed > 0) {
  console.log(`\n⚠️  IMPORTANT: Please verify that each file has the necessary useIntlayer declarations!`);
  console.log(`   Each file should have: const namespace = useIntlayer('namespace') for each $namespace used.`);
}
