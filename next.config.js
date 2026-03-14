/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async redirects() {
        return [
            { source: '/p', destination: '/pizarra', permanent: false },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/pizarra/cancha:id',
                destination: '/display/tv/:id',
            },
            {
                source: '/pizarra/scort',
                destination: '/live?tv=true',
            },
            {
                source: '/pizarra/publicidad',
                destination: '/display/ads',
            }
        ];
    }
};

export default nextConfig;
