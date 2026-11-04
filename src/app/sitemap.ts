import type { MetadataRoute } from 'next';
import { PUBLIC_APP_ORIGIN } from '@/lib/brand';

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const paths = ['/', '/login', '/tournaments', '/politica-privacidad', '/terminos-inscripcion'];
    return paths.map((path) => ({
        url: `${PUBLIC_APP_ORIGIN}${path === '/' ? '' : path}`,
        lastModified,
        changeFrequency: path === '/tournaments' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.6,
    }));
}
