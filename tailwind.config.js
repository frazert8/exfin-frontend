import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        text: 'var(--text)',
        'text-light': 'var(--text-light)',
        'card-bg': 'var(--card-bg)',
        border: 'var(--border)',
        success: 'var(--success)',
        danger: 'var(--danger)',
      }
    },
  },
  plugins: [
    forms,
  ],
}
