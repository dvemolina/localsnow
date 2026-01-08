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
    watch: true,
    baseDir: "./src",
  },
};

export default config;
