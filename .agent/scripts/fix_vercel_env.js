import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Cargar variables desde .env.local (o el archivo que uses localmente)
dotenv.config({ path: '.env.local' });

function addEnv(key, value) {
  if (!value) {
    console.warn(`Skipping ${key}: no value found in env`);
    return;
  }

  try { execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch (e) {}
  try { execSync(`npx vercel env rm ${key} preview -y`, { stdio: 'ignore' }); } catch (e) {}
  try { execSync(`npx vercel env rm ${key} development -y`, { stdio: 'ignore' }); } catch (e) {}

  console.log(`Adding ${key}...`);
  execSync(`npx vercel env add ${key} production`, { input: value, stdio: 'pipe' });
  execSync(`npx vercel env add ${key} preview`, { input: value, stdio: 'pipe' });
  execSync(`npx vercel env add ${key} development`, { input: value, stdio: 'pipe' });
}

// Leer SIEMPRE de variables locales, nunca hardcodear credenciales
addEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
addEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
addEnv('NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET);
addEnv('NEXT_PUBLIC_SUPABASE_INSCRIPTIONS_BUCKET', process.env.NEXT_PUBLIC_SUPABASE_INSCRIPTIONS_BUCKET);
addEnv('NEXT_PUBLIC_DEV_EMAIL', process.env.NEXT_PUBLIC_DEV_EMAIL);
addEnv('NEXT_PUBLIC_DEV_PASSWORD', process.env.NEXT_PUBLIC_DEV_PASSWORD);

console.log('All variables added successfully from local env!');
