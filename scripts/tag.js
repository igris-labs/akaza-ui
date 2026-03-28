const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
let releaseType = 'patch';
let preid = '';

args.forEach((arg) => {
  if (arg.startsWith('--release=')) releaseType = arg.split('=')[1];
  if (arg.startsWith('--preid=')) preid = arg.split('=')[1];
});

const root = path.join(__dirname, '..');

// Packages with a version field to keep in sync
const packages = [
  path.join(root, 'packages/akaza-ui'),
  root,
];

const versionCmd = preid
  ? `npm version ${releaseType} --preid=${preid} --no-git-tag-version`
  : `npm version ${releaseType} --no-git-tag-version`;

try {
  // Bump version in all packages; capture from the publishable package
  let newVersion;
  for (const dir of packages) {
    const output = execSync(versionCmd, { cwd: dir }).toString().trim().replace(/^v/, '');
    if (dir === path.join(root, 'packages/akaza-ui')) {
      newVersion = output;
    }
  }

  // Commit, tag, push
  execSync('git add packages/akaza-ui/package.json package.json', { cwd: root, stdio: 'inherit' });
  execSync(`git commit -m "chore: release v${newVersion}"`, { cwd: root, stdio: 'inherit' });
  execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, { cwd: root, stdio: 'inherit' });
  execSync('git push', { cwd: root, stdio: 'inherit' });
  execSync('git push --tags', { cwd: root, stdio: 'inherit' });

  console.log(`\nReleased v${newVersion} (${releaseType})`);
} catch (error) {
  console.error('Release failed:', error.message);
  process.exit(1);
}
