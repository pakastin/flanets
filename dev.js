require('./server.js');

run('build-js');
run('copy-tabler-icons-css');
run('copy-tabler-icons-fonts');

function run (cmd) {
  const cp = require('child_process');

  const child = cp.spawn('npm', ['run', cmd]);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}
