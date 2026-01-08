import { type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: ["en", "es"],
    defaultLocale: "en",
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
