// Generates src/environments/environment.prod.ts from process.env at build time.
// Run before `ng build --configuration netlify` on Netlify CI.
const { writeFileSync, mkdirSync } = require('fs');

mkdirSync('src/environments', { recursive: true });

const content = `export const environment = {
  production: true,
  supabaseUrl: '${process.env['SUPABASE_URL'] ?? ''}',
  supabaseAnonKey: '${process.env['SUPABASE_ANON_KEY'] ?? ''}',
};\n`;

writeFileSync('src/environments/environment.prod.ts', content);
console.log('✅ environment.prod.ts generated');
