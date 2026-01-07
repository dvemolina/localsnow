import { t, type Dictionary } from "intlayer";

const resortContent = {
  key: "resort",
  content: {
    instructors_in: t({
      en: "{sport} Instructors in {resort}",
      es: "Profesores de {sport} en {resort}",
    }),
    typical_prices: t({
      en: "Typical Lesson Prices",
      es: "Precios Típicos de Clases",
    }),
    about_lessons: t({
      en: "Finding {sport} Instructors at {resort}",
      es: "Acerca de las Clases de {sport} en {resort}",
    }),
    no_instructors: t({
      en: "No Listings Yet",
      es: "Sin Instructores Aún",
    }),
    no_instructors_desc: t({
      en: "We don't have any {sport} instructors listed at {resort} yet. Check back soon or browse other resorts.",
      es: "Todavía no tenemos instructores de {sport} en {resort}.",
    }),
    browse_all: t({
      en: "Browse All Listings",
      es: "Ver Todos los Instructores",
    }),
    are_you_instructor: t({
      en: "Are you a {sport} instructor at {resort}?",
      es: "¿Eres instructor de {sport} en {resort}?",
    }),
    join_desc: t({
      en: "List your profile in our directory and get discovered by clients and schools. Free listing, no commissions.",
      es: "Únete a Local Snow y comienza a recibir reservas directas de clientes. Sin comisiones, sin tarifas.",
    }),
    become_instructor: t({
      en: "List Your Profile",
      es: "Conviértete en Instructor",
    }),
    visit_website: t({
      en: "Visit resort website",
      es: "Visitar sitio web de la estación",
    }),
    view_all_filters: t({
      en: "View All Filters",
      es: "Ver Todos los Filtros",
    }),
    instructors_available_none: t({
      en: "No Instructors Found",
      es: "No se Encontraron Instructores",
    }),
    instructors_available_one: t({
      en: "1 Instructor Available",
      es: "1 Instructor Disponible",
    }),
    instructors_available_many: t({
      en: "{count} Instructors Available",
      es: "{count} Instructores Disponibles",
    }),
  },
} satisfies Dictionary;

export default resortContent;
