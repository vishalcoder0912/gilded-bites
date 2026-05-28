import fs from 'node:fs/promises';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();
const OUTPUT_FILE_NAME = 'PROJECT_CODEBASE_ARCHITECTURE.md';
const OUTPUT_FILE = path.join(PROJECT_ROOT, OUTPUT_FILE_NAME);

const INCLUDED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.mjs',
  '.cjs',
  '.prisma',
  '.ps1',
  '.yaml',
  '.yml',
]);

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.firebase',
  'build',
  'coverage',
  'dist',
  'dist-ssr',
  'node_modules',
]);

const IGNORED_FILENAMES = new Set([
  'PROJECT_AI_SAFE.md',
  'PROJECT_ARCHITECTURE.md',
  OUTPUT_FILE_NAME,
  'firebase-adminsdk.json',
  'package-lock.json',
  'serviceAccountKey.json',
]);

const IGNORED_EXTENSIONS = new Set([
  '.gif',
  '.jpeg',
  '.jpg',
  '.lock',
  '.log',
  '.mp4',
  '.png',
  '.zip',
]);

const MAX_FILE_BYTES = 1_000_000;

const toPosixPath = (filePath) => filePath.split(path.sep).join('/');

const isIgnoredFile = (relativePath) => {
  const fileName = path.basename(relativePath);
  const extension = path.extname(fileName).toLowerCase();

  if (fileName === '.env' || fileName.startsWith('.env.')) {
    return true;
  }

  if (fileName.startsWith('firebase-adminsdk') && extension === '.json') {
    return true;
  }

  return IGNORED_FILENAMES.has(fileName) || IGNORED_EXTENSIONS.has(extension);
};

const isIncludedFile = (relativePath) => {
  const extension = path.extname(relativePath).toLowerCase();
  return INCLUDED_EXTENSIONS.has(extension) && !isIgnoredFile(relativePath);
};

const redactSecrets = (content) =>
  content
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_FIREBASE_API_KEY]')
    .replace(/sk_(?:live|test)_[0-9A-Za-z]+/g, '[REDACTED_STRIPE_SECRET_KEY]')
    .replace(/pk_(?:live|test)_[0-9A-Za-z]+/g, '[REDACTED_STRIPE_PUBLIC_KEY]')
    .replace(/gh[pousr]_[0-9A-Za-z_]{36,255}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{20,}/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(Admin@12345|Password123)\b/g, '[REDACTED_SAMPLE_PASSWORD]')
    .replace(/\b(password\s*[:=]\s*)["']?[^"',\n}]+["']?/gi, '$1[REDACTED_PASSWORD]')
    .replace(/\b(adminPassword\s*=\s*)["']?[^"',;\n]+["']?/gi, '$1[REDACTED_PASSWORD]')
    .replace(
      /\b((?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^:\s/@]+:)[^@\s]+(@[^\s"'`<>)]+)/gi,
      '$1[REDACTED_PASSWORD]$2',
    )
    .replace(
      /^(\s*["']?[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY|ACCESS_KEY|REFRESH_TOKEN)[A-Z0-9_]*["']?\s*[:=]\s*)["']?[^"',\n}]+["']?/gim,
      '$1[REDACTED_SECRET]',
    );

const collectFiles = async (directory = PROJECT_ROOT, files = [], skipped = []) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(PROJECT_ROOT, absolutePath);
    const safeRelativePath = toPosixPath(relativePath);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) {
        await collectFiles(absolutePath, files, skipped);
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!isIncludedFile(relativePath)) {
      continue;
    }

    const stats = await fs.stat(absolutePath);

    if (stats.size > MAX_FILE_BYTES) {
      skipped.push({
        file: safeRelativePath,
        reason: `larger than ${MAX_FILE_BYTES} bytes`,
      });
      continue;
    }

    files.push({
      absolutePath,
      file: safeRelativePath,
      size: stats.size,
    });
  }

  return { files, skipped };
};

const buildArchitecture = (files, skipped) => {
  let architecture = '# Project Codebase And Architecture\n\n';
  architecture += `Generated: ${new Date().toISOString()}\n\n`;
  architecture += 'This single-file export combines the project architecture and source code. It excludes common sensitive files and generated folders, then applies best-effort secret redaction to included text files. Review before sharing externally.\n\n';
  architecture += '## Architecture\n\n';
  architecture += '- Frontend: Vite + React + TypeScript application under `src/`.\n';
  architecture += '- Backend: Express + TypeScript API under `backend/src/`.\n';
  architecture += '- Database: Prisma schema and seed files under `backend/prisma/`.\n';
  architecture += '- Tests: Vitest tests under `src/test/` and `backend/tests/`.\n';
  architecture += '- Tooling/config: root TypeScript, Vite, Tailwind, ESLint, PostCSS, and package configuration files.\n\n';
  architecture += '## Included Files\n\n';

  for (const { file, size } of files) {
    architecture += `- ${file} (${size} bytes)\n`;
  }

  if (skipped.length > 0) {
    architecture += '\n## Skipped Files\n\n';

    for (const { file, reason } of skipped) {
      architecture += `- ${file}: ${reason}\n`;
    }
  }

  architecture += '\n## Exclusion And Redaction Rules\n\n';
  architecture += '- Secret-bearing files such as `.env*`, Firebase admin SDK JSON, and service account keys are excluded.\n';
  architecture += '- Build output, dependency folders, logs, lockfiles, generated exports, and binary/media archives are excluded.\n';
  architecture += '- Known API keys, tokens, private keys, bearer tokens, emails, and database URL passwords are redacted before export.\n';

  return architecture;
};

const exportCodebase = async () => {
  const { files, skipped } = await collectFiles();
  const sortedFiles = files.sort((a, b) => a.file.localeCompare(b.file));

  let output = buildArchitecture(sortedFiles, skipped);
  output += '\n## Source Code\n\n';

  for (const { absolutePath, file } of sortedFiles) {
    const rawContent = await fs.readFile(absolutePath, 'utf8');
    const content = redactSecrets(rawContent);
    const extension = path.extname(file).replace('.', '');

    output += '---\n\n';
    output += `# FILE: ${file}\n\n`;
    output += `\`\`\`${extension}\n`;
    output += content;
    output += '\n```\n\n';
  }

  await fs.writeFile(OUTPUT_FILE, output, 'utf8');

  console.log(`${OUTPUT_FILE_NAME} generated`);

  if (skipped.length > 0) {
    console.log(`${skipped.length} oversized file(s) skipped; see ${OUTPUT_FILE_NAME}.`);
  }
};

exportCodebase().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
