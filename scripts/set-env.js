// Generates Angular environment files from env vars.
//
// Dev:  `node scripts/set-env.js --dev`
//       Reads .env.local → writes src/environments/environment.ts
//
// Prod: `node scripts/set-env.js`  (run by Netlify before build)
//       Reads process.env → writes src/environments/environment.prod.ts
const { writeFileSync, mkdirSync } = require('fs');
const { resolve } = require('path');
const isDev = process.argv.includes('--dev');

if (isDev) {
  require('dotenv').config({ path: resolve(__dirname, '../.env.local') });
}

mkdirSync('src/environments', { recursive: true });

const url = process.env['SUPABASE_URL'] ?? '';
const key = process.env['SUPABASE_ANON_KEY'] ?? '';

if (!url || !key) {
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_ANON_KEY'].filter(Boolean);
  console.warn(`⚠️  Missing env vars: ${missing.join(', ')}`);
  console.warn('   Copy .env.example → .env.local and fill in values.');
}

const outFile = isDev ? 'src/environments/environment.ts' : 'src/environments/environment.prod.ts';
const isProd = !isDev;

writeFileSync(outFile, `export const environment = {
  production: ${isProd},
  supabaseUrl: '${url}',
  supabaseAnonKey: '${key}',
};\n`);

console.log(`✅ ${outFile} generated`);
