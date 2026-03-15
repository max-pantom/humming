import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        panel: "#141414",
        panelSoft: "#1c1c1c",
      },
      boxShadow: {
        stage: "0 32px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
