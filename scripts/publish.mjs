import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  }).trim();
}

function runLogged(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd,
    stdio: 'inherit',
  });
}

function fail(message) {
  console.error(`publish failed: ${message}`);
  process.exit(1);
}

function getRepoRoot() {
  return run('git', ['rev-parse', '--show-toplevel']);
}

function getDefaultBranch(cwd) {
  try {
    const ref = run('git', ['symbolic-ref', 'refs/remotes/origin/HEAD'], { cwd });
    return ref.split('/').at(-1) || 'main';
  } catch {
    return 'main';
  }
}

function ensureCleanWorkingTree(cwd) {
  const status = run('git', ['status', '--porcelain'], { cwd });

  if (status) {
    fail('working tree is not clean. Commit or stash changes before publishing.');
  }
}

function tagExistsRemotely(cwd, tag) {
  try {
    run('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`], { cwd });
    return true;
  } catch {
    return false;
  }
}

function tagExistsLocally(cwd, tag) {
  try {
    run('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { cwd });
    return true;
  } catch {
    return false;
  }
}

try {
  const cwd = getRepoRoot();
  const branch = run('git', ['branch', '--show-current'], { cwd });
  const defaultBranch = getDefaultBranch(cwd);

  if (!branch) {
    fail('you must be on a branch to publish.');
  }

  if (branch !== defaultBranch) {
    fail(`current branch is ${branch}; publish from ${defaultBranch}.`);
  }

  ensureCleanWorkingTree(cwd);

  console.log(`Syncing ${defaultBranch} with origin...`);
  runLogged('git', ['fetch', 'origin', '--tags'], { cwd });
  runLogged('git', ['pull', '--rebase', 'origin', defaultBranch], { cwd });
  runLogged('git', ['push', 'origin', defaultBranch], { cwd });

  const packageJson = JSON.parse(readFileSync(`${cwd}/package.json`, 'utf8'));
  const version = packageJson.version;

  if (!version || typeof version !== 'string') {
    fail('package.json does not contain a valid version string.');
  }

  if (tagExistsRemotely(cwd, version)) {
    console.log(`Tag ${version} already exists on origin. Nothing to publish.`);
    process.exit(0);
  }

  if (!tagExistsLocally(cwd, version)) {
    console.log(`Creating release tag ${version}...`);
    runLogged('git', ['tag', '-a', version, '-m', `Release ${version}`], { cwd });
  } else {
    console.log(`Reusing existing local tag ${version}.`);
  }

  runLogged('git', ['push', 'origin', version], { cwd });

  console.log(`Tag ${version} pushed. GitHub Actions will create the release and deploy.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
}