import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : false;
    });

    const lightTheme = {
        mode: 'light',
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
            card: '#fafafa',
            hover: 'rgba(0, 0, 0, 0.04)'
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666'
        },
        accent: {
            main: '#3f51b5',
            dark: '#303f9f',
            light: '#7986cb'
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        action: {
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(0, 0, 0, 0.08)',
            disabled: 'rgba(0, 0, 0, 0.26)'
        }
    };

    const darkTheme = {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1e1e1e',
            card: '#2d2d2d',
            hover: 'rgba(255, 255, 255, 0.08)'
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3'
        },
        accent: {
            main: '#7986cb',
            dark: '#5c6bc0',
            light: '#9fa8da'
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        action: {
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(255, 255, 255, 0.16)',
            disabled: 'rgba(255, 255, 255, 0.3)'
        }
    };

    const toggleTheme = () => {
        setDarkMode(prev => {
            const newTheme = !prev;
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return newTheme;
        });
    };

    useEffect(() => {
        document.body.style.backgroundColor = darkMode ? darkTheme.background.default : lightTheme.background.default;
        document.body.style.color = darkMode ? darkTheme.text.primary : lightTheme.text.primary;
    }, [darkMode]);

    const theme = darkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, darkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext; 