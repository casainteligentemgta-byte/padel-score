/** @type {import('tailwindcss').Config} */
export default {
    corePlugins: {
        preflight: false, // Evita que Tailwind resetee el fondo y deje todo blanco
    },
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#ec5b13',
                neon: '#CCFF00',
                padel: {
                    primary: '#ccff00',
                    secondary: '#1a1a1a',
                    accent: '#00ccff',
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
                outfit: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
                display: ['var(--font-public-sans)', 'Public Sans', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
