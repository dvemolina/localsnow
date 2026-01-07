import { t, type Dictionary } from "intlayer";

const dayContent = {
  key: "day",
  content: {
    sunday: t({
      en: "Sunday",
      es: "Domingo",
    }),
    monday: t({
      en: "Monday",
      es: "Lunes",
    }),
    tuesday: t({
      en: "Tuesday",
      es: "Martes",
    }),
    wednesday: t({
      en: "Wednesday",
      es: "Miércoles",
    }),
    thursday: t({
      en: "Thursday",
      es: "Jueves",
    }),
    friday: t({
      en: "Friday",
      es: "Viernes",
    }),
    saturday: t({
      en: "Saturday",
      es: "Sábado",
    }),
  },
} satisfies Dictionary;

export default dayContent;
