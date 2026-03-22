#!/usr/bin/env node
/**
 * Verificación IA CEO (Twilio + WhatsApp).
 * Ejecutar: node scripts/verify-ceo.mjs
 * O: npm run verify:ceo
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Twilio from 'twilio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env.local');

const PADEL = '[Smart Padel · CEO Verify]';

function loadEnvLocal() {
  if (!existsSync(envPath)) {
    console.error(`${PADEL} No se encontró .env.local en ${root}`);
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER?.trim();
const toNumber = (process.env.YOUR_PHONE_NUMBER || process.env.TWILIO_DESTINATION_PHONE)?.trim();

console.log(`\n${PADEL} Verificación de configuración\n`);

const checks = {
  TWILIO_ACCOUNT_SID: !!accountSid,
  TWILIO_AUTH_TOKEN: !!authToken,
  TWILIO_WHATSAPP_NUMBER: !!fromNumber,
  YOUR_PHONE_NUMBER: !!toNumber,
};

let allOk = true;
for (const [key, ok] of Object.entries(checks)) {
  const icon = ok ? '✓' : '✗';
  if (!ok) allOk = false;
  console.log(`  ${icon} ${key}`);
}

if (!allOk) {
  console.log(`\n${PADEL} Faltan variables en .env.local. Añade las que falten y vuelve a ejecutar.\n`);
  process.exit(1);
}

console.log(`\n${PADEL} Enviando mensaje de prueba a WhatsApp...\n`);

try {
  const client = Twilio(accountSid, authToken);
  const message = '🧪 *Smart Padel – Prueba IA CEO*\n\nSi recibes este mensaje, la integración Twilio + WhatsApp está funcionando correctamente.\n\n_Verificación automática._';
  const result = await client.messages.create({
    body: message,
    from: fromNumber,
    to: toNumber,
  });
  console.log(`${PADEL} ✅ Mensaje enviado correctamente. SID: ${result.sid}`);
  console.log(`${PADEL} Revisa tu WhatsApp (${toNumber}).\n`);
} catch (err) {
  console.error(`${PADEL} ❌ Error:`, err.message || err);
  process.exit(1);
}
