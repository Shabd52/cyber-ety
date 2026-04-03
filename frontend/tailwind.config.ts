import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyber theme - Neon colors
        'cyber-black': '#0a0e27',
        'cyber-dark': '#1a1f3a',
        'cyber-blue': '#00d4ff',
        'cyber-green': '#00ff41',
        'cyber-purple': '#b300ff',
        'cyber-pink': '#ff006e',
      },
      fontFamily: {
        'cyber': ['Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 212, 255, 0.5)',
        'neon-green': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-purple': '0 0 10px rgba(179, 0, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
export default config;
