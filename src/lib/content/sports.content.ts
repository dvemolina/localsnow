import { t, type Dictionary } from "intlayer";

const sportsContent = {
  key: "sports",
  content: {
    ski: t({
      en: "Ski",
      es: "Esquí",
    }),
    snowboard: t({
      en: "Snowboard",
      es: "Snowboard",
    }),
    both: t({
      en: "Ski & Snowboard",
      es: "Esquí y Snowboard",
    }),
    telemark: t({
      en: "Telemark",
      es: "Telemark",
    }),
  },
} satisfies Dictionary;

export default sportsContent;
