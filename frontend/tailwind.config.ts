import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // ── Greeva Color Palette ─────────────────────────────────────────────
      // Sumber kebenaran: CLAUDE.md section 3.2
      // JANGAN ubah nilai hex ini tanpa diskusi — ini design token resmi Greeva
      colors: {
        greeva: {
          emerald: '#006242',         // Hero section, navbar, impact strip
          'starbucks-green': '#00754A', // Links, hover states
          forest: '#16A34A',          // CTA buttons (primary), icon aktif
          'forest-dark': '#32462F',   // Button primary dark, teks di bg terang
          leaf: '#4ADE80',            // Badge, highlight, tag aktif (JANGAN untuk body text)
          'mint-light': '#D1FAE5',    // Card surface, section bg
          'sand-warm': '#F5F0E8',     // Section alternatif hangat (analog cream Starbucks)
          black: '#1C1C1C',           // Headline text
          'text-body': '#212121',     // Body text
          'ocean-blue': '#1D4ED8',    // Identitas teknologi, secondary accent
          white: '#FFFFFF',           // Background utama
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      // Font stack mendekati SoDo Sans (font Starbucks), semua free
      fontFamily: {
        sans: ['Inter', 'DM Sans', '-apple-system', 'system-ui', 'sans-serif'],
      },

      // Skala font sesuai CLAUDE.md section 3.3
      fontSize: {
        // Caption: 12px, weight 500, tracking lebar (untuk label/badge ALL-CAPS)
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
        // Small: 14px
        sm: ['0.875rem', { lineHeight: '1.5' }],
        // Body: 16px
        base: ['1rem', { lineHeight: '1.6' }],
        // Body Large: 18px
        lg: ['1.125rem', { lineHeight: '1.6' }],
        // H3: 24px, weight 600
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        // H2: 32px, weight 600
        h2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        // H1: 40–48px, weight 700
        h1: ['clamp(2.5rem,4vw,3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        // Display (hero): 56–72px, weight 700
        display: ['clamp(3.5rem,6vw,4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
      },

      // ── Spacing Tokens ────────────────────────────────────────────────────
      spacing: {
        'section-desktop': '80px',
        'section-mobile': '48px',
        'container-px-mobile': '16px',
        'container-px-tablet': '24px',
        'container-px-desktop': '32px',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        pill: '9999px',   // Untuk primary CTA buttons
        card: '12px',     // Untuk product cards
        input: '8px',     // Untuk form inputs
      },

      // ── Max Width ─────────────────────────────────────────────────────────
      maxWidth: {
        container: '1280px',
      },

      // ── Box Shadow ────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [forms],
};

export default config;
