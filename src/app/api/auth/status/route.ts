import { NextResponse } from 'next/server';
import { isStagingDeployment } from '@/lib/deploymentTier';

function supabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export async function GET() {
  const urlConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceConfigured = !!(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_KEY?.trim()
  );

  let authReachable: boolean | null = null;
  let authDetail: string | null = null;

  if (urlConfigured && anonConfigured) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim().replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/auth/v1/health`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()}`,
        },
        cache: 'no-store',
      });
      authReachable = res.ok;
      if (!res.ok) {
        authDetail = `HTTP ${res.status}`;
      }
    } catch (e) {
      authReachable = false;
      authDetail = e instanceof Error ? e.message : 'fetch failed';
    }
  }

  return NextResponse.json({
    ok: urlConfigured && anonConfigured && authReachable !== false,
    tier: isStagingDeployment() ? 'staging' : 'production',
    supabase: {
      urlConfigured,
      anonConfigured,
      serviceConfigured,
      host: supabaseHost(),
      authReachable,
      authDetail,
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || null,
  });
}
