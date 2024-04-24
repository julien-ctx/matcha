import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-r-main': 'linear-gradient(to right, #de6262, #ffb88c)',
        'gradient-to-r-secondary': 'linear-gradient(to right, #dae2f8, #d6a4a4)',
      },
      fontFamily: {
        'jersey10': ['Jersey10', 'sans-serif'], 
        'jersey10Charted': ['Jersey10Charted', 'sans-serif'],
        'jersey15': ['Jersey15', 'sans-serif'],
        'jersey15Charted': ['Jersey15Charted', 'sans-serif'],
        'jersey20': ['Jersey20', 'sans-serif'],
        'jersey20Charted': ['Jersey20Charted', 'sans-serif'],
        'jersey25': ['Jersey25', 'sans-serif'],
        'yarndings12': ['Yarndings12', 'sans-serif'],
        'yarndings12Charted': ['Yarndings12Charted', 'sans-serif'],
        'yarndings20': ['Yarndings20', 'sans-serif'],
        'yarndings20Charted': ['Yarndings20Charted', 'sans-serif'],
        'micro5Charted': ['Micro5Charted', 'sans-serif'],
        'jacquarda9Charted': ['Jacquarda9Charted', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
