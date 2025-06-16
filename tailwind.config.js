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
                'dark-bg': '#0a0a0a',
                'dark-card': '#121212',
                'dark-accent': '#6366f1',
                'dark-secondary': '#1a1a1a',
                'dark-text': '#ffffff',
                'dark-muted': '#a1a1aa',
            },
            backgroundImage: {
                'dark-gradient': 'linear-gradient(120deg, #0a0a0a 0%, #121212 100%)',
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
                'display': ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
