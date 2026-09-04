// Copie les fichiers de locale source vers dist/locales (consommation directe éventuelle).
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'locales');
const outDir = join(root, 'dist', 'locales');

mkdirSync(outDir, { recursive: true });

for (const file of readdirSync(srcDir)) {
  const src = join(srcDir, file);
  if (statSync(src).isFile()) copyFileSync(src, join(outDir, file));
}

console.log('i18n locales copied to dist/locales');
