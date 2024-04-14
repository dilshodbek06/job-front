// eslint-disable-next-line no-undef
const withMT = require("@material-tailwind/react/utils/withMT");

// eslint-disable-next-line no-undef
module.exports = withMT({
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {},
        screens: {
            'pl': "500px",

            'sm': '600px',

            'md': '768px',

            'lg': '1024px',

            'lg2': '770px',

            'xl': '1055px',

            '2xl': '1536px',
        }
    },
    plugins: [],
});

