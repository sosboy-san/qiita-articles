const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const slug = process.argv[2];
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run new -- article-slug (lowercase letters, numbers, hyphens)');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'public', `${slug}.md`);
if (fs.existsSync(target)) {
  console.error('Article already exists.');
  process.exit(1);
}
const cli = path.join(root, 'node_modules', '@qiita', 'qiita-cli', 'dist', 'main.js');
const result = spawnSync(process.execPath, [cli, 'new', slug], { cwd: root, stdio: 'inherit' });
if (result.error || result.status !== 0) process.exit(1);
const content = fs.readFileSync(target, 'utf8');
if (!/^ignorePublish: false\s*$/m.test(content)) {
  fs.renameSync(target, `${target}.unverified`);
  console.error('Unexpected CLI template. Article moved outside publish targets; review it.');
  process.exit(1);
}
fs.writeFileSync(target, content.replace(/^ignorePublish: false\s*$/m, 'ignorePublish: true\n'));
console.log('Draft created with ignorePublish: true.');
