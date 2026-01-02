/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./gerador-de-ofertas/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Catch root files like App.tsx
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#E11D48", // Rose-600 (Modern Tech Red)
                secondary: "#fbbf24", // Amber-400
                "background-light": "#FAFAFA", // Gray-50
                "background-dark": "#000000",
                "paper-light": "#ffffff",
                "paper-dark": "#0a0a0a",
            },
            fontFamily: {
                display: ["Lilita One", "cursive"],
                body: ["Inter", "sans-serif"], // Inter is the new default
            },
        },
    },
    plugins: [],
}
