import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all .svelte files in src directory
const svelteFiles = await glob('src/**/*.svelte', { cwd: path.join(__dirname, '..') });

let filesUpdated = 0;
let totalChanges = 0;

for (const file of svelteFiles) {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  let fileChanges = 0;

  // Skip if file doesn't use Paraglide
  if (!content.includes("from '$lib/paraglide/messages'") &&
      !content.includes("from '$lib/paraglide/runtime'")) {
    continue;
  }

  console.log(`\n📝 Processing: ${file}`);

  // Replace Paraglide imports with Intlayer
  if (content.includes("import * as m from '$lib/paraglide/messages'")) {
    content = content.replace(
      "import * as m from '$lib/paraglide/messages'",
      "import { useIntlayer } from 'svelte-intlayer'"
    );
    fileChanges++;
    console.log('   ✓ Replaced Paraglide messages import with useIntlayer');
  }

  // Remove Paraglide runtime imports (locales, baseLocale, etc.)
  const runtimeImportRegex = /import\s+\{[^}]+\}\s+from\s+'\$lib\/paraglide\/runtime';?\n?/g;
  if (runtimeImportRegex.test(content)) {
    content = content.replace(runtimeImportRegex, '');
    fileChanges++;
    console.log('   ✓ Removed Paraglide runtime imports');
  }

  // Find all message function calls and map them to content keys
  // Pattern: m.some_key_name() -> need to determine which content file
  const messageCalls = content.matchAll(/m\.([a-z_]+)\(/g);
  const usedPrefixes = new Set();

  for (const match of messageCalls) {
    const fullKey = match[1];
    const prefix = fullKey.split('_')[0];
    usedPrefixes.add(prefix);
  }

  // Add useIntlayer hooks for each prefix used
  if (usedPrefixes.size > 0) {
    const scriptTagMatch = content.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
    if (scriptTagMatch) {
      const [fullMatch, openTag, scriptContent, closeTag] = scriptTagMatch;

      // Check if useIntlayer is already imported
      if (scriptContent.includes("from 'svelte-intlayer'")) {
        // Add const declarations after imports
        const importEndIndex = scriptContent.lastIndexOf('import');
        const nextNewlineIndex = scriptContent.indexOf('\n', importEndIndex);

        const declarations = Array.from(usedPrefixes)
          .map(prefix => `\tconst ${prefix} = useIntlayer('${prefix}');`)
          .join('\n');

        const beforeImports = scriptContent.substring(0, nextNewlineIndex + 1);
        const afterImports = scriptContent.substring(nextNewlineIndex + 1);

        const newScriptContent = beforeImports + '\n' + declarations + '\n' + afterImports;
        content = content.replace(scriptContent, newScriptContent);

        fileChanges++;
        console.log(`   ✓ Added useIntlayer hooks for: ${Array.from(usedPrefixes).join(', ')}`);
      }
    }
  }

  // Now replace all message calls: m.prefix_key() -> $prefix.key.value
  content = content.replace(/m\.([a-z_]+)\(\)/g, (match, fullKey) => {
    const parts = fullKey.split('_');
    const prefix = parts[0];
    const key = parts.slice(1).join('_');
    return `$${prefix}.${key}.value`;
  });

  if (content !== originalContent) {
    filesUpdated++;
    totalChanges += fileChanges;
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Updated ${file}`);
  }
}

console.log(`\n🎉 Migration complete!`);
console.log(`   Files updated: ${filesUpdated}`);
console.log(`   Total changes: ${totalChanges}`);
