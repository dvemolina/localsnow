import { t, type Dictionary } from "intlayer";

const loginContent = {
  key: "login",
  content: {
    already_have_account: t({
      en: "I already have an account",
      es: "Ya tengo una cuenta",
    }),
    no_account: t({
      en: "I don't have an account",
      es: "No tengo una cuenta",
    }),
  },
} satisfies Dictionary;

export default loginContent;
