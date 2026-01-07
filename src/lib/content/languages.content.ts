import { t, type Dictionary } from "intlayer";

const languagesContent = {
  key: "languages",
  content: {
    spoken: t({
      en: "Languages Spoken",
      es: "Idiomas Hablados",
    }),
  },
} satisfies Dictionary;

export default languagesContent;
