const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(cmd, cwd) {
    console.log(`\n> ${cmd} (in ${cwd})`);
    execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

run('npm run test:coverage', path.join(root, 'frontend'));
run('pytest --cov=app --cov-report=json --cov-report=term', path.join(root, 'backend'));
run('node scripts/merge-coverage.js', root);