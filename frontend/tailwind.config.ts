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
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
