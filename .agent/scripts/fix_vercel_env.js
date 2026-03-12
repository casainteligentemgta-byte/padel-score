import { execSync } from 'child_process';

function addEnv(key, value) {
  try { execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch (e) {}
  try { execSync(`npx vercel env rm ${key} preview -y`, { stdio: 'ignore' }); } catch (e) {}
  try { execSync(`npx vercel env rm ${key} development -y`, { stdio: 'ignore' }); } catch (e) {}

  console.log(`Adding ${key}...`);
  execSync(`npx vercel env add ${key} production`, { input: value, stdio: 'pipe' });
  execSync(`npx vercel env add ${key} preview`, { input: value, stdio: 'pipe' });
  execSync(`npx vercel env add ${key} development`, { input: value, stdio: 'pipe' });
}

addEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://cecwrpmoitxhfynpqhkc.supabase.co');
addEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk');
addEnv('NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET', 'patrocinantes');
addEnv('NEXT_PUBLIC_SUPABASE_INSCRIPTIONS_BUCKET', 'inscripciones');
addEnv('NEXT_PUBLIC_DEV_EMAIL', 'admin@padelscore.pro');
addEnv('NEXT_PUBLIC_DEV_PASSWORD', 'padel2024');

console.log('All variables added successfully!');
