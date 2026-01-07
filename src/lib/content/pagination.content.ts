import { t, type Dictionary } from "intlayer";

const paginationContent = {
  key: "pagination",
  content: {
    page_of: t({
      en: "Page {page} of {totalPages}",
      es: "Página {page} de {totalPages}",
    }),
  },
} satisfies Dictionary;

export default paginationContent;
