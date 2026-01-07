import { t, type Dictionary } from "intlayer";

const filterContent = {
  key: "filter",
  content: {
    sport: t({
      en: "Sport",
      es: "Deporte",
    }),
    resort: t({
      en: "Resort",
      es: "Estación",
    }),
    dates: t({
      en: "Availability Dates",
      es: "Fechas de Disponibilidad",
    }),
    date_from: t({
      en: "From",
      es: "Desde",
    }),
    date_to: t({
      en: "To",
      es: "Hasta",
    }),
    price_range: t({
      en: "Price Range (€/hour)",
      es: "Rango de Precio (€/hora)",
    }),
    price_min: t({
      en: "Min",
      es: "Mín",
    }),
    price_max: t({
      en: "Max",
      es: "Máx",
    }),
    group_size: t({
      en: "Group Size",
      es: "Tamaño del Grupo",
    }),
    select_sport: t({
      en: "Select a sport",
      es: "Selecciona un deporte",
    }),
    select_resort: t({
      en: "Select resort",
      es: "Selecciona estación",
    }),
    choose_resort: t({
      en: "Choose Resort",
      es: "Elegir Estación",
    }),
    choose_sport: t({
      en: "Choose Sport",
      es: "Elegir Deporte",
    }),
    search_resorts_placeholder: t({
      en: "Type to search resorts...",
      es: "Escribe para buscar estaciones...",
    }),
    all: t({
      en: "All",
      es: "Todos",
    }),
    pending: t({
      en: "Pending",
      es: "Pendiente",
    }),
    unlocked: t({
      en: "Unlocked",
      es: "Desbloqueado",
    }),
    rejected: t({
      en: "Rejected",
      es: "Rechazado",
    }),
    all_statuses: t({
      en: "All Statuses",
      es: "Todos los Estados",
    }),
    viewed: t({
      en: "Viewed",
      es: "Visto",
    }),
    accepted: t({
      en: "Accepted",
      es: "Aceptado",
    }),
    completed: t({
      en: "Completed",
      es: "Completado",
    }),
    verified: t({
      en: "Verified",
      es: "Verificado",
    }),
    active: t({
      en: "Active",
      es: "Activo",
    }),
    suspended: t({
      en: "Suspended",
      es: "Suspendido",
    }),
    all_roles: t({
      en: "All Roles",
      es: "Todos los Roles",
    }),
  },
} satisfies Dictionary;

export default filterContent;
