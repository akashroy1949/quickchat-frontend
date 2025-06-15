/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'dark-bg': '#181924',
                'dark-card': '#23243a',
                'dark-accent': '#6366f1',
                'dark-secondary': '#2e2f47',
                'dark-text': '#e5e7eb',
                'dark-muted': '#a1a1aa',
            },
            backgroundImage: {
                'dark-gradient': 'linear-gradient(120deg, #23243a 0%, #181924 100%)',
            },
        },
    },
    plugins: [],
};
