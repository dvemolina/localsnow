import { t, type Dictionary } from "intlayer";

const sidebarContent = {
  key: "sidebar",
  content: {
    home: t({
      en: "Home",
      es: "Inicio",
    }),
    profile: t({
      en: "Profile",
      es: "Perfil",
    }),
    lessons: t({
      en: "Lessons",
      es: "Clases",
    }),
    bookings: t({
      en: "Bookings",
      es: "Reservas",
    }),
    availability: t({
      en: "Availability",
      es: "Disponibilidad",
    }),
    application: t({
      en: "Application",
      es: "Aplicación",
    }),
    language: t({
      en: "Language",
      es: "Idioma",
    }),
  },
} satisfies Dictionary;

export default sidebarContent;
