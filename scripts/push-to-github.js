// Automated GitHub Push Script for SentinelOps AI Hackathon Project
// Uses isomorphic-git (pure JS git implementation) to push to GitHub without requiring local git.exe

const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/Nivedita0987/swytchcode-by-nivedita.git';
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to list all files recursively excluding node_modules, .git, .env
function getProjectFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.env' || file === '.system_generated') continue;
    const fullPath = path.join(dir, file);
    const relPath = path.join(base, file).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getProjectFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function main() {
  const token = process.argv[2] || process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('❌ Error: GitHub Personal Access Token is required to push.');
    console.error('Usage: node scripts/push-to-github.js <YOUR_GITHUB_TOKEN>');
    console.error('Create a token at: https://github.com/settings/tokens (select "repo" scope)');
    process.exit(1);
  }

  console.log('📦 Initializing Git repository in:', ROOT_DIR);
  await git.init({ fs, dir: ROOT_DIR, defaultBranch: 'main' });

  console.log('🔍 Collecting project files...');
  const files = getProjectFiles(ROOT_DIR);
  console.log(`Found ${files.length} project files to track.`);

  for (const file of files) {
    await git.add({ fs, dir: ROOT_DIR, filepath: file });
  }

  console.log('✍️ Committing files...');
  const sha = await git.commit({
    fs,
    dir: ROOT_DIR,
    author: {
      name: 'Nivedita',
      email: 'nivedita@swytchcode.dev'
    },
    message: 'feat: SentinelOps AI - Track 5 Hackathon Submission for Build with Swytchcode (Gurgaon Edition)'
  });
  console.log(`✅ Commit created: ${sha}`);

  console.log(`🚀 Pushing to remote ${REPO_URL} (branch: main)...`);
  const pushResult = await git.push({
    fs,
    http,
    dir: ROOT_DIR,
    remote: 'origin',
    url: REPO_URL,
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token })
  });

  console.log('🎉 Push successful! All files and documentation are now live on GitHub.');
  console.log('🔗 Repository URL: ' + REPO_URL);
}

main().catch(err => {
  console.error('❌ Git push failed:', err.message);
  process.exit(1);
});
