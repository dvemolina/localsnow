import { t, type Dictionary } from "intlayer";

const badgeContent = {
  key: "badge",
  content: {
    no_reviews: t({
      en: "No reviews",
      es: "Sin reseñas",
    }),
    set: t({
      en: "Set",
      es: "Establecido",
    }),
    from: t({
      en: "From",
      es: "Desde",
    }),
    independent_instructor: t({
      en: "Independent Instructor",
      es: "Instructor Independiente",
    }),
    school_instructor: t({
      en: "School Instructor",
      es: "Instructor de Escuela",
    }),
  },
} satisfies Dictionary;

export default badgeContent;
