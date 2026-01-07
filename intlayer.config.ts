import { Locales, type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [Locales.ENGLISH, Locales.SPANISH],
    defaultLocale: Locales.ENGLISH,
  },
  middleware: {
    headerName: "Accept-Language",
    cookieName: "locale",
  },
  content: {
    // Watch all content files in src directory
    watch: true,
    // Content files will be co-located with components
    baseDir: "./src",
    // Specific patterns for content files
    include: ["**/*.content.{ts,tsx,js,jsx,mjs,cjs}"],
    exclude: ["**/node_modules/**"],
  },
};

export default config;
