import { t, type Dictionary } from "intlayer";

const commonContent = {
  key: "common",
  content: {
    search: t({
      en: "Search",
      es: "Buscar",
    }),
    filter: t({
      en: "Filter",
      es: "Filtrar",
    }),
    filters: t({
      en: "Filters",
      es: "Filtros",
    }),
    apply: t({
      en: "Apply",
      es: "Aplicar",
    }),
    clear: t({
      en: "Clear",
      es: "Limpiar",
    }),
    cancel: t({
      en: "Cancel",
      es: "Cancelar",
    }),
    save: t({
      en: "Save",
      es: "Guardar",
    }),
    edit: t({
      en: "Edit",
      es: "Editar",
    }),
    delete: t({
      en: "Delete",
      es: "Eliminar",
    }),
    view: t({
      en: "View",
      es: "Ver",
    }),
    back: t({
      en: "Back",
      es: "Atrás",
    }),
    next: t({
      en: "Next",
      es: "Siguiente",
    }),
    submit: t({
      en: "Submit",
      es: "Enviar",
    }),
    loading: t({
      en: "Loading...",
      es: "Cargando...",
    }),
    error: t({
      en: "Error",
      es: "Error",
    }),
    success: t({
      en: "Success",
      es: "Éxito",
    }),
    per_hour: t({
      en: "per hour",
      es: "por hora",
    }),
    currency_eur: t({
      en: "€",
      es: "€",
    }),
    or: t({
      en: "or",
      es: "o",
    }),
    and: t({
      en: "and",
      es: "y",
    }),
    yes: t({
      en: "Yes",
      es: "Sí",
    }),
    no: t({
      en: "No",
      es: "No",
    }),
    close: t({
      en: "Close",
      es: "Cerrar",
    }),
    open: t({
      en: "Open",
      es: "Abrir",
    }),
    select: t({
      en: "Select",
      es: "Seleccionar",
    }),
    required: t({
      en: "Required",
      es: "Obligatorio",
    }),
    optional: t({
      en: "Optional",
      es: "Opcional",
    }),
  },
} satisfies Dictionary;

export default commonContent;
