import type { MetadataRoute } from 'next';
import { PUBLIC_APP_ORIGIN } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api/', '/marker/', '/dev/'],
        },
        sitemap: `${PUBLIC_APP_ORIGIN}/sitemap.xml`,
    };
}
