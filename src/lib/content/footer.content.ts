import { t, type Dictionary } from "intlayer";

const footerContent = {
  key: "footer",
  content: {
    tagline: t({
      en: "A curated directory of ski instructors - find local pros, send lesson requests, connect directly",
      es: "Directorio gratuito de instructores de esquí en España",
    }),
    navigation: t({
      en: "Navigation",
      es: "Navegación",
    }),
    legal: t({
      en: "Legal",
      es: "Legal",
    }),
    privacy: t({
      en: "Privacy Policy",
      es: "Política de Privacidad",
    }),
    terms: t({
      en: "Terms of Service",
      es: "Términos de Servicio",
    }),
    cookies: t({
      en: "Cookie Policy",
      es: "Política de Cookies",
    }),
  },
} satisfies Dictionary;

export default footerContent;
