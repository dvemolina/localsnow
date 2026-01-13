#!/usr/bin/env node

/**
 * Fix duplicate namespace prefixes in translation keys
 * Example: dashboard_dashboard_title -> dashboard_title
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Patterns to fix: namespace_namespace_key -> namespace_key
const namespaces = [
	'dashboard',
	'availability',
	'bookings',
	'lessons',
	'profile',
	'admin',
	'instructor',
	'resort'
];

function fixDuplicatePrefixes(filePath) {
	let content = fs.readFileSync(filePath, 'utf-8');
	let changesMade = 0;

	for (const ns of namespaces) {
		const pattern = new RegExp(`${ns}_${ns}_`, 'g');
		const matches = content.match(pattern);

		if (matches) {
			content = content.replace(pattern, `${ns}_`);
			changesMade += matches.length;
		}
	}

	if (changesMade > 0) {
		fs.writeFileSync(filePath, content, 'utf-8');
		console.log(`✓ ${path.relative(rootDir, filePath)}: ${changesMade} fixes`);
	}

	return changesMade;
}

function processDirectory(dir) {
	let totalChanges = 0;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
			totalChanges += processDirectory(fullPath);
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			totalChanges += fixDuplicatePrefixes(fullPath);
		}
	}

	return totalChanges;
}

console.log('🔍 Searching for duplicate namespace prefixes...\n');

const routesDir = path.join(rootDir, 'src/routes');
const componentsDir = path.join(rootDir, 'src/lib/components');

let totalChanges = 0;
totalChanges += processDirectory(routesDir);
totalChanges += processDirectory(componentsDir);

console.log(`\n✅ Fixed ${totalChanges} duplicate namespace prefixes`);
