import { t, type Dictionary } from "intlayer";

const statusContent = {
  key: "status",
  content: {
    verified: t({
      en: "Verified",
      es: "Verificado",
    }),
    pending: t({
      en: "Pending",
      es: "Pendiente",
    }),
    pending_verification: t({
      en: "Pending Verification",
      es: "Pendiente de Verificación",
    }),
    completed: t({
      en: "Completed",
      es: "Completado",
    }),
    active: t({
      en: "Active",
      es: "Activo",
    }),
    suspended: t({
      en: "Suspended",
      es: "Suspendido",
    }),
    connected: t({
      en: "Connected",
      es: "Conectado",
    }),
    not_connected: t({
      en: "Not Connected",
      es: "No Conectado",
    }),
    configured: t({
      en: "Configured",
      es: "Configurado",
    }),
    not_set: t({
      en: "Not Set",
      es: "No Establecido",
    }),
    expired: t({
      en: "Expired",
      es: "Expirado",
    }),
    inactive: t({
      en: "Inactive",
      es: "Inactivo",
    }),
    max_uses_reached: t({
      en: "Max Uses Reached",
      es: "Máximo de Usos Alcanzado",
    }),
    pending_review: t({
      en: "Pending Review",
      es: "Pendiente de Revisión",
    }),
    pending_payment: t({
      en: "Pending Payment",
      es: "Pendiente de Pago",
    }),
    accepted: t({
      en: "Accepted",
      es: "Aceptado",
    }),
    rejected: t({
      en: "Rejected",
      es: "Rechazado",
    }),
    unlocked: t({
      en: "Unlocked",
      es: "Desbloqueado",
    }),
    viewed: t({
      en: "Viewed",
      es: "Visto",
    }),
  },
} satisfies Dictionary;

export default statusContent;
