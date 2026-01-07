import { t, type Dictionary } from "intlayer";

const bookingsContent = {
  key: "bookings",
  content: {
    page_title: t({
      en: "Lesson Requests",
      es: "Solicitudes de Reserva",
    }),
    page_subtitle: t({
      en: "Manage incoming lesson requests from clients who found you in the directory",
      es: "Gestiona tus solicitudes de clases y conecta con clientes",
    }),
    empty_state_title: t({
      en: "No Lesson Requests Yet",
      es: "Sin Solicitudes de Reserva",
    }),
    empty_state_all: t({
      en: "You don't have any lesson requests yet. When clients find your profile and send requests, they'll appear here.",
      es: "No tienes solicitudes de reserva aún. Cuando los clientes soliciten clases, aparecerán aquí.",
    }),
    empty_state_pending: t({
      en: "No pending requests waiting for review.",
      es: "No hay solicitudes pendientes de pago.",
    }),
    empty_state_unlocked: t({
      en: "No unlocked requests at the moment.",
      es: "No hay reservas desbloqueadas en este momento.",
    }),
    empty_state_rejected: t({
      en: "No rejected requests.",
      es: "No hay reservas rechazadas.",
    }),
    how_it_works_title: t({
      en: "How Lesson Requests Work",
      es: "Cómo Funciona",
    }),
    unlock_info: t({
      en: "Pay €5 to unlock a client's contact information and respond to their request. This one-time fee gives you direct access to connect with potential students.",
      es: "Paga 5€ para desbloquear la información de contacto del cliente. Esta tarifa única te da acceso directo para conectar con estudiantes potenciales. Una vez desbloqueado, puedes aceptar o rechazar la reserva.",
    }),
  },
} satisfies Dictionary;

export default bookingsContent;
