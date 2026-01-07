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
  let originalContent = content;

  // Check if file has const form = useIntlayer('form')
  const hasFormIntlayer = content.includes("const form = useIntlayer('form')");

  // Check if file also has: const form = superForm(...) OR let { form } = $props()
  const hasSuperForm = /const form = superForm\(/.test(content);
  const hasFormProp = /let\s+\{[^}]*\bform\b[^}]*\}\s*=\s*\$props\(\)/.test(content);

  if (hasFormIntlayer && (hasSuperForm || hasFormProp)) {
    console.log(`\n📝 Fixing form conflict in: ${file}`);

    // Replace const form = useIntlayer('form') with const formContent = useIntlayer('form')
    content = content.replace(
      "const form = useIntlayer('form')",
      "const formContent = useIntlayer('form')"
    );

    // Replace all $form. with $formContent. EXCEPT when followed by 'valid' or 'message' or 'posted'
    // These are from superForm, not from useIntlayer
    content = content.replace(/\$form\.(?!valid|message|posted)/g, '$formContent.');

    filesFixed++;
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Fixed form conflict in ${file}`);
  }
}

console.log(`\n🎉 Fixed ${filesFixed} files with form conflicts`);
