import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        canvas: "#f4f1ea",
        accent: "#0f766e",
        warm: "#f59e0b",
        mist: "#dbeafe"
      },
      boxShadow: {
        panel: "0 16px 40px -24px rgba(20, 33, 61, 0.35)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
