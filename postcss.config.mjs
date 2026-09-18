// StyleX doit s'exécuter AVANT Tailwind et ses options doivent être identiques
// à celles de .babelrc pour que les hachages de classes correspondent.
const config = {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      useCSSLayers: true,
      styleResolution: "property-specificity",
      runtimeInjection: false,
      aliases: { "@/*": ["/ROOT/src/*"] },
      unstable_moduleResolution: { type: "commonJS", rootDir: process.cwd() },
    },
    "@tailwindcss/postcss": {},
  },
};

export default config;
