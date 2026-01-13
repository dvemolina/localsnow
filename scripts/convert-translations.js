import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the translation files
const enMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/en.json'), 'utf-8'));
const esMessages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages/es.json'), 'utf-8'));

// Remove the $schema key
delete enMessages.$schema;
delete esMessages.$schema;

// Group translations by prefix
function groupByPrefix(messages) {
  const groups = {};

  for (const [key, value] of Object.entries(messages)) {
    const parts = key.split('_');
    const prefix = parts[0];
    const rest = parts.slice(1).join('_') || 'root';

    if (!groups[prefix]) {
      groups[prefix] = {};
    }
    groups[prefix][rest] = value;
  }

  return groups;
}

// Generate Intlayer content structure
function generateIntlayerContent(groupName, enGroup, esGroup) {
  const content = {};

  for (const key in enGroup) {
    content[key] = {
      en: enGroup[key] || '',
      es: esGroup[key] || ''
    };
  }

  return content;
}

// Generate content file
function generateContentFile(name, enGroup, esGroup) {
  const content = generateIntlayerContent(name, enGroup, esGroup);

  let output = `import { t, type Dictionary } from "intlayer";\n\n`;
  output += `const ${name}Content = {\n`;
  output += `  key: "${name}",\n`;
  output += `  content: {\n`;

  for (const [key, translations] of Object.entries(content)) {
    const en = translations.en.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const es = translations.es.replace(/"/g, '\\"').replace(/\n/g, '\\n');

    output += `    ${key}: t({\n`;
    output += `      en: "${en}",\n`;
    output += `      es: "${es}",\n`;
    output += `    }),\n`;
  }

  output += `  },\n`;
  output += `} satisfies Dictionary;\n\n`;
  output += `export default ${name}Content;\n`;

  return output;
}

// Group both language files
const enGroups = groupByPrefix(enMessages);
const esGroups = groupByPrefix(esMessages);

// Create content files directory
const contentDir = path.join(__dirname, '../src/lib/content');
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

// Generate content files for each prefix group
for (const prefix in enGroups) {
  const enGroup = enGroups[prefix] || {};
  const esGroup = esGroups[prefix] || {};

  const fileContent = generateContentFile(prefix, enGroup, esGroup);
  const filePath = path.join(contentDir, `${prefix}.content.ts`);

  fs.writeFileSync(filePath, fileContent);
  console.log(`✅ Generated ${prefix}.content.ts`);
}

console.log('\\n🎉 Conversion complete!');
