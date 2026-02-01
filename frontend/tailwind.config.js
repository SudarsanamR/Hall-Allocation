/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                accent: {
                    500: '#22c55e', // Vibrant Green
                    600: '#16a34a',
                },
                gray: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    850: '#162032', // Custom for better depth
                    900: '#0f172a',
                    950: '#020617',
                }
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
                'neon': '0 0 10px rgba(34, 197, 94, 0.5)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateX(-50%) translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
