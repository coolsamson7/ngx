/// <reference types="node" />
// tools/scripts/generate-lib-meta.ts
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// The path to the library being built
// Pass as argument: `ts-node tools/scripts/generate-lib-meta.ts libs/common`
const args = process.argv.slice(2).filter(arg => arg !== '--');
const libPath = args[0];
if (!libPath) {
  console.error('Usage: ts-node generate-lib-meta.ts <libPath>');
  process.exit(1);
}

// Read the package.json of the library
async function generateMeta() {
  const packageJsonPath = join(process.cwd(), libPath, 'package.json');
  const pkgRaw = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(pkgRaw);

  // Get git commit hash
  let commitHash = 'unknown';
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {}

  const meta = {
    name: pkg.name,
    version: pkg.version,
    commitHash,
  };

  const targetDir = join(process.cwd(), libPath, 'src/lib');
  await mkdir(targetDir, { recursive: true });

  const content = `// Auto-generated, do not edit
export const LIBRARY_METADATA = ${JSON.stringify(meta, null, 2)};
`;

  const outputPath = join(targetDir, 'package-meta.ts');
  await writeFile(outputPath, content, 'utf-8');
  console.log(`Generated metadata for ${pkg.name} -> ${outputPath}`);
}

generateMeta().catch(err => {
  console.error(err);
  process.exit(1);
});