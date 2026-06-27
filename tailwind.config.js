const colors = require('tailwindcss/colors');

const coral = {
    50: '#fbf1ee',
    100: '#f7dfd9',
    200: '#f5bfb3',
    300: '#ef9d8a',
    400: '#ea7e67',
    500: '#e4593a',
    600: '#cf3d1c',
    700: '#a23016',
    800: '#702615',
    900: '#4e1a0f',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#09090b',
                primary: coral,
                gray: colors.zinc,
                neutral: colors.zinc,
                cyan: colors.cyan,
                surface: {
                    DEFAULT: '#101013',
                    hover: '#15151a',
                },
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
