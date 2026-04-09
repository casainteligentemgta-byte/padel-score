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
        // Pantalla única temporal de pizarra: todo el tráfico legacy va a /dev/pizarra-concept
        return [
            { source: '/p', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/pizarra', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/pizarra/:path*', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/tv', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/p/:court', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/marker/:canchaId', destination: '/dev/pizarra-concept', permanent: false },
            {
                source: '/display/court/:courtId',
                destination: '/dev/pizarra-concept?courtId=:courtId',
                permanent: false,
            },
            { source: '/display/tv/:courtId', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/display/stream/court/:courtId', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/display/ads', destination: '/dev/pizarra-concept', permanent: false },
            { source: '/display/:id', destination: '/dev/pizarra-concept', permanent: false },
            {
                source: '/tournaments/:id/display/bracket',
                destination: '/dev/pizarra-concept?tournamentId=:id&view=bracket',
                permanent: false,
            },
            {
                source: '/tournaments/:id/display/court/:courtId',
                destination: '/dev/pizarra-concept?tournamentId=:id&courtId=:courtId',
                permanent: false,
            },
            {
                source: '/tournaments/:id/display/:matchId',
                destination: '/dev/pizarra-concept?tournamentId=:id&matchId=:matchId',
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [];
    }
};

export default nextConfig;
