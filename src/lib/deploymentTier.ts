/**
 * Distingue despliegue Vercel de producción (padel-score / smartpadel58.com)
 * del de pruebas (padel-score-mgti / staging).
 *
 * En Vercel → padel-score-mgti: PADEL_DEPLOYMENT_TIER=staging
 * En Vercel → padel-score:       PADEL_DEPLOYMENT_TIER=production
 */
export function isStagingDeployment(): boolean {
  const tier = process.env.PADEL_DEPLOYMENT_TIER?.trim().toLowerCase();
  if (tier === 'staging') return true;
  if (tier === 'production') return false;

  const url = deploymentPublicUrl().toLowerCase();
  return url.includes('mgti') || url.includes('-staging.') || url.includes('staging.');
}

export function isPrimaryProductionDeployment(): boolean {
  return !isStagingDeployment();
}

export function deploymentPublicUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, '')}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '')}` : '')
  );
}
