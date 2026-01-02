import React from 'react';

export const CategoryIcon: React.FC<{ category: string; className?: string }> = ({ category, className = "w-6 h-6" }) => {
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = normalize(category);

    const icons: Record<string, React.ReactNode> = {
        // Bovinos (Bull/Cow)
        'bovinos': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M12 2C8.69 2 6 4.69 6 8v3h2V8c0-2.21 1.79-4 4-4s4 1.79 4 4v3h2V8c0-3.31-2.69-6-6-6zm-5 7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H7z" />
                <path d="M17 19h-2v-3h-6v3H7c-1.1 0-2 .9-2 2v1h14v-1c0-1.1-.9-2-2-2z" />
            </svg>
        ),
        'bovino': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M12 2C8.69 2 6 4.69 6 8v3h2V8c0-2.21 1.79-4 4-4s4 1.79 4 4v3h2V8c0-3.31-2.69-6-6-6zm-5 7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H7z" />
                <path d="M17 19h-2v-3h-6v3H7c-1.1 0-2 .9-2 2v1h14v-1c0-1.1-.9-2-2-2z" />
            </svg>
        ),

        // Suínos (Pig)
        'suinos': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M12 4c-4.42 0-8 2.69-8 6 0 1.4.64 2.68 1.71 3.68C5.25 15.36 5 17.5 5 17.5s2.5 0 4.14-1.35C10.06 16.59 11.01 16.8 12 16.8c.99 0 1.94-.21 2.86-.65C16.5 17.5 19 17.5 19 17.5s-.25-2.14-.71-3.82C19.36 12.68 20 11.4 20 10c0-3.31-3.58-6-8-6zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
        ),
        'suino': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M12 4c-4.42 0-8 2.69-8 6 0 1.4.64 2.68 1.71 3.68C5.25 15.36 5 17.5 5 17.5s2.5 0 4.14-1.35C10.06 16.59 11.01 16.8 12 16.8c.99 0 1.94-.21 2.86-.65C16.5 17.5 19 17.5 19 17.5s-.25-2.14-.71-3.82C19.36 12.68 20 11.4 20 10c0-3.31-3.58-6-8-6zm0 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
        ),

        // Aves (Chicken/Rooster)
        'aves': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M14 6c-2 0-3.5 1.5-3.5 3.5S12 13 14 13s3.5-1.5 3.5-3.5S16 6 14 6zm-1.5-3c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2 .9-2-2h2zM9 13.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm9.5 1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM12 16c-1.3 0-2.4.8-2.8 2h5.6c-.4-1.2-1.5-2-2.8-2z" />
                {/* Simplified representation */}
                <circle cx="7" cy="18" r="2" />
            </svg>
        ),
        'ave': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M19 10c0-2-2.5-3-2.5-3s-1-3-3-3-3 1-3 1S9.5 5 8 5C7 5 6 6 6 6s-2 0-2 2c0 2 2 3 2 3l1-1c1 1 2 1 3 1v5l-3 3h7v-4c1 0 5-3 5-5z" />
            </svg>
        ),
        'frango': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M19 10c0-2-2.5-3-2.5-3s-1-3-3-3-3 1-3 1S9.5 5 8 5C7 5 6 6 6 6s-2 0-2 2c0 2 2 3 2 3l1-1c1 1 2 1 3 1v5l-3 3h7v-4c1 0 5-3 5-5z" />
            </svg>
        ),

        // Linguica (Sausage)
        'linguica': (
            <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                <path d="M16.24 6.34l-1.41 1.41c-.78-.78-2.05-.78-2.83 0l-1.41 1.41c-.78.78-.78 2.05 0 2.83l1.41 1.41c.78.78 2.05.78 2.83 0l1.41-1.41c.78-.78.78-2.05 0-2.83l-1.41-1.41c-.78-.79-2.05-.79-2.83 0z" />
                <path d="M18.82 17.65c-1.04 1.04-2.57 1.35-3.9 1.03l-1.01 1.01c-.39.39-1.02.39-1.41 0l-1.41-1.41c-.39-.39-.39-1.02 0-1.41l1.01-1.01c-.32-1.33-.01-2.87 1.03-3.91 1.56-1.56 4.09-1.56 5.66 0 1.56 1.56 1.56 4.09.03 5.7z" />
                <path d="M7.76 13.41l1.41-1.41c.78-.78.78-2.05 0-2.83l-1.41-1.41c-.78-.78-2.05-.78-2.83 0l-1.41 1.41c-.78.78-.78 2.05 0 2.83l1.41 1.41c.78.78 2.05.78 2.83 0z" />
            </svg>
        ),
    };

    // Partial match check
    const matchedKey = Object.keys(icons).find(iconKey => key.includes(iconKey));

    if (matchedKey) {
        return <>{icons[matchedKey]}</>;
    }

    return null;
};
