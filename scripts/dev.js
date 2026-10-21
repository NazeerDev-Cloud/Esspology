// Runs the API server and the Vite dev server together: `npm run dev`
import { spawn } from 'node:child_process';
const run = (dir, script) => spawn('npm', ['--prefix', dir, 'run', script], { stdio: 'inherit', shell: true });
const procs = [run('server', 'dev'), run('client', 'dev')];
const stop = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stop); process.on('exit', stop);
procs.forEach((p) => p.on('exit', (c) => { if (c) { stop(); process.exit(c); } }));
