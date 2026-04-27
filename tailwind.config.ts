import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          ...defaultTheme.fontFamily.sans
        ]
      },
      colors: {
        ink: "#0f172a",
        canvas: "#f6f8fb",
        accent: "#2563eb",
        accentSoft: "#dbeafe",
        successSoft: "#dcfce7",
        warningSoft: "#fef3c7",
        roseSoft: "#ffe4e6",
        panel: "#ffffff",
        line: "#e2e8f0"
      },
      boxShadow: {
        panel: "0 24px 60px -28px rgba(15, 23, 42, 0.24)",
        soft: "0 10px 30px -18px rgba(15, 23, 42, 0.16)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
