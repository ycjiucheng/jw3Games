/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        jx3: {
          primary: "#8B4513", // 深褐
          secondary: "#DAA520", // 金色
          gold: "#FFD700", // 亮金
          bg: "#FDFBF7", // 纸张背景色
          paper: "#F0E6D2", // 陈旧纸张色
          ink: "#2C1810", // 水墨深色
          accent: "#C0392B", // 丹红
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
        title: ['"ZCOOL QingKe HuangYou"', "cursive"], // 站酷庆科黄油体
      },
      backgroundImage: {
        'paper-texture': "url('/paper-texture.png')", // 预留
      }
    },
  },
  plugins: [],
};
