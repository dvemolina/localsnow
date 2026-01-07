import { t, type Dictionary } from "intlayer";

const legalContent = {
  key: "legal",
  content: {
    privacy_title: t({
      en: "Privacy Policy",
      es: "Política de Privacidad",
    }),
    privacy_last_updated: t({
      en: "Last updated",
      es: "Última actualización",
    }),
    terms_title: t({
      en: "Terms of Service",
      es: "Términos de Servicio",
    }),
    terms_last_updated: t({
      en: "Last updated",
      es: "Última actualización",
    }),
    cookies_title: t({
      en: "Cookie Policy",
      es: "Política de Cookies",
    }),
    cookies_last_updated: t({
      en: "Last updated",
      es: "Última actualización",
    }),
  },
} satisfies Dictionary;

export default legalContent;
