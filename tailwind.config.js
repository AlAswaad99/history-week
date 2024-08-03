/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

export const darkMode = ["class"];
export const content = [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
];
export const prefix = "";
export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",
    },
  },
  // fontFamily: {
  //   NokiaBold: ["Nokia Bold"],
  //   NokiaLight: ["Nokia Light"],
  //   Droid: ["Droid"],
  //   Yanon: ["Yanon"],
  //   Klavika: ["Klavika"],
  // },
  extend: {
    fontFamily: {
      sans: ['var(--font-nokia-bold)', ...fontFamily.sans],
      'nokia-light': ['var(--font-nokia-light)'],
      droid: ['var(--font-droid)'],
      yanon: ['var(--font-yanon)'],
      klavika: ['var(--font-klavika)'],
      'habesha-distort': ['var(--font-habesha-distort)'],
      'habesha-black': ['var(--font-habesha-black)'],
      'habesha-bold': ['var(--font-habesha-bold)'],
      'habesha-light': ['var(--font-habesha-light)'],
      'habesha-outline': ['var(--font-habesha-outline)'],
      'habesha-regular': ['var(--font-habesha-regular)'],
      'habesha-thin': ['var(--font-habesha-thin)'],
      'habesha-typewriter': ['var(--font-habesha-typewriter)'],


    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  },
};
export const plugins = [require("tailwindcss-animate")];