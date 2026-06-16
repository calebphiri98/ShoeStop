
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#000000",
//         secondary: "#FFFFFF",
//         accent: "#D4AF37",      // Gold
//         hoverAccent: "#B8860B", // Darker Gold for hover states
//         neutralBg: "#F5F5F5",
//         textDark: "#1A1A1A",
//         success: "#25D366"      // WhatsApp Green
//       },
//       fontFamily: {
//         sans: ['Inter', 'sans-serif'], // Premium clean sans-serif
//         heading: ['Playfair Display', 'serif'], // Optional: for luxury headers
//       }
//     },
//   },
//   plugins: [],
// }



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})