import { t, type Dictionary } from "intlayer";

const reviewsContent = {
  key: "reviews",
  content: {
    submit: t({
      en: "Submit Review",
      es: "Enviar Reseña",
    }),
    rating: t({
      en: "Rating",
      es: "Calificación",
    }),
    comment: t({
      en: "Comment",
      es: "Comentario",
    }),
    thank_you: t({
      en: "Thank you for your review!",
      es: "¡Gracias por tu reseña!",
    }),
  },
} satisfies Dictionary;

export default reviewsContent;
