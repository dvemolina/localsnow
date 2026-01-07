import { t, type Dictionary } from "intlayer";

const helloContent = {
  key: "hello",
  content: {
    world: t({
      en: "Hello, {name} from en!",
      es: "¡Hola, {name} desde es!",
    }),
  },
} satisfies Dictionary;

export default helloContent;
