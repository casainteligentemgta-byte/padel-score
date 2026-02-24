/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
