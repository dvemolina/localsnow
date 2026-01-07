import { t, type Dictionary } from "intlayer";

const calendarContent = {
  key: "calendar",
  content: {
    available: t({
      en: "Available",
      es: "Disponible",
    }),
    unavailable: t({
      en: "Unavailable",
      es: "No Disponible",
    }),
    selected: t({
      en: "Selected",
      es: "Seleccionado",
    }),
  },
} satisfies Dictionary;

export default calendarContent;
