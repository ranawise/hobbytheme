import { useCallback, useEffect, useRef, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'panel:theme';

const applyTheme = (theme: Theme) => {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
};

export const initTheme = (): void => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored) applyTheme(stored);
    } catch {
        // localStorage unavailable
    }
};

export const useTheme = (): { theme: Theme; toggle: () => void } => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'dark';
        } catch {
            return 'dark';
        }
    });

    // Always reflects latest theme value without stale closure in toggle.
    const themeRef = useRef(theme);
    themeRef.current = theme;

    // Keep DOM in sync on mount (initTheme may have already run, but this is safe).
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggle = useCallback(() => {
        const next = themeRef.current === 'dark' ? 'light' : 'dark';
        // Apply the DOM attribute BEFORE setState so the browser can repaint
        // with the new theme in the same frame as the icon change — no flash.
        applyTheme(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // ignore
        }
        setTheme(next);
    }, []);

    return { theme, toggle };
};
