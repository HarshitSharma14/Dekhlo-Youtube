/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "youtube-dark-red": "#350101c4",
        "youtube-dark-blue": "#070321a3",
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      screens: {
        xs: '500px', // Custom breakpoint
        xxs: '420px',
      },
    },
  },
  plugins: [],
};
