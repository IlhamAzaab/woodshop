/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        qasr: {
          night: '#0F0C0A',
          charcoal: '#191410',
          gold: '#D0A15B',
          beige: '#E8D9C5',
          sand: '#B99562',
        },
      },
      boxShadow: {
        luxe: '0 20px 60px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      backgroundImage: {
        arabesque:
          'radial-gradient(circle at 12% 20%, rgba(208, 161, 91, 0.16), transparent 26%), radial-gradient(circle at 88% 10%, rgba(255, 235, 201, 0.08), transparent 30%), linear-gradient(135deg, #0F0C0A 0%, #191410 55%, #221A14 100%)',
      },
    },
  },
  plugins: [],
}
