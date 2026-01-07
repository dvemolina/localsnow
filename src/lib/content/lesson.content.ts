import { t, type Dictionary } from "intlayer";

const lessonContent = {
  key: "lesson",
  content: {
    type_private: t({
      en: "Private Lesson",
      es: "Clase Privada",
    }),
    type_group: t({
      en: "Group Lesson",
      es: "Clase Grupal",
    }),
    type_half_day: t({
      en: "Half Day",
      es: "Medio Día",
    }),
    type_full_day: t({
      en: "Full Day",
      es: "Día Completo",
    }),
  },
} satisfies Dictionary;

export default lessonContent;
