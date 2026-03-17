import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

const contracts = [
  {
    file: 'src/theme/AntdThemeConfig.js',
    requiredSnippets: [
      "colorPrimary: '#2DC275'",
      'borderRadius: 8',
      'controlHeight: 40',
      'fontWeight: 600',
    ],
  },
  {
    file: 'src/theme/DarkThemeConfig.js',
    requiredSnippets: [
      "colorPrimary: '#2dc275'",
      "colorBgLayout: 'rgb(39, 39, 42)'",
      'borderRadius: 14',
      'controlHeight: 44',
    ],
  },
  {
    file: 'src/index.css',
    requiredSnippets: [
      '--tb-primary: #2dc275;',
      '--tb-bg: rgb(39, 39, 42);',
      '--tb-surface: rgba(18, 18, 18, 0.55);',
      '--tb-border: rgba(255, 255, 255, 0.10);',
      '--tb-text: rgba(255, 255, 255, 0.92);',
      '.dark-theme {',
    ],
  },
  {
    file: 'src/App.jsx',
    requiredSnippets: [
      '<ConfigProvider theme={DarkThemeConfig}>',
      '<UserLayout />',
    ],
  },
];

const errors = [];

for (const contract of contracts) {
  const fullPath = path.join(rootDir, contract.file);

  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing file: ${contract.file}`);
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');

  for (const snippet of contract.requiredSnippets) {
    if (!content.includes(snippet)) {
      errors.push(`Contract broken in ${contract.file}: missing "${snippet}"`);
    }
  }
}

if (errors.length > 0) {
  console.error('UI contract check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error('\nReview ticketbookingwebapp/UI_RULES.md before changing UI foundations.');
  process.exit(1);
}

console.log('UI contract check passed.');
