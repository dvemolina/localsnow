import { t, type Dictionary } from "intlayer";

const levelsContent = {
  key: "levels",
  content: {
    beginner: t({
      en: "Beginner",
      es: "Principiante",
    }),
    intermediate: t({
      en: "Intermediate",
      es: "Intermedio",
    }),
    advanced: t({
      en: "Advanced",
      es: "Avanzado",
    }),
    expert: t({
      en: "Expert",
      es: "Experto",
    }),
  },
} satisfies Dictionary;

export default levelsContent;
