import { t, type Dictionary } from "intlayer";

const skillContent = {
  key: "skill",
  content: {
    level_beginner: t({
      en: "Beginner",
      es: "Principiante",
    }),
    level_intermediate: t({
      en: "Intermediate",
      es: "Intermedio",
    }),
    level_advanced: t({
      en: "Advanced",
      es: "Avanzado",
    }),
    level_expert: t({
      en: "Expert",
      es: "Experto",
    }),
  },
} satisfies Dictionary;

export default skillContent;
