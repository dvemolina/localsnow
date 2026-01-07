import { t, type Dictionary } from "intlayer";

const availabilityContent = {
  key: "availability",
  content: {
    page_title: t({
      en: "Availability Settings",
      es: "Configuración de Disponibilidad",
    }),
    page_subtitle: t({
      en: "Manage your calendar sync and availability settings",
      es: "Gestiona la sincronización de tu calendario y configuración de disponibilidad",
    }),
    google_calendar_title: t({
      en: "Google Calendar Integration",
      es: "Integración con Google Calendar",
    }),
    google_calendar_desc: t({
      en: "Sync your Google Calendar to automatically block unavailable times",
      es: "Sincroniza tu Google Calendar para bloquear automáticamente los tiempos no disponibles",
    }),
    calendar_connected_title: t({
      en: "Calendar Connected",
      es: "Calendario Conectado",
    }),
    calendar_connected_message: t({
      en: "Your Google Calendar is synced. Events will automatically block availability slots for clients.",
      es: "Tu Google Calendar está sincronizado. Los eventos bloquearán automáticamente los espacios de disponibilidad para los clientes.",
    }),
    last_synced: t({
      en: "Last synced:",
      es: "Última sincronización:",
    }),
    connect_calendar_heading: t({
      en: "Connect Your Google Calendar",
      es: "Conecta Tu Google Calendar",
    }),
    connect_calendar_desc: t({
      en: "Automatically sync your calendar events to show accurate availability to clients",
      es: "Sincroniza automáticamente tus eventos del calendario para mostrar disponibilidad precisa a los clientes",
    }),
    why_connect_title: t({
      en: "Why connect your calendar?",
      es: "¿Por qué conectar tu calendario?",
    }),
    benefit1: t({
      en: "Automatically block times when you're busy",
      es: "Bloquea automáticamente los tiempos cuando estés ocupado",
    }),
    benefit2: t({
      en: "Prevent double bookings",
      es: "Evita reservas dobles",
    }),
    benefit3: t({
      en: "Keep your availability always up-to-date",
      es: "Mantén tu disponibilidad siempre actualizada",
    }),
    benefit4: t({
      en: "Save time - no manual updates needed",
      es: "Ahorra tiempo - sin actualizaciones manuales",
    }),
    calendar_disclaimer: t({
      en: "We only read your calendar events to check availability. We never modify or delete your events.",
      es: "Solo leemos tus eventos del calendario para verificar disponibilidad. Nunca modificamos ni eliminamos tus eventos.",
    }),
    working_hours_title: t({
      en: "Working Hours",
      es: "Horario de Trabajo",
    }),
    working_hours_desc: t({
      en: "Set your regular working hours and seasonal availability",
      es: "Establece tu horario regular de trabajo y disponibilidad estacional",
    }),
    working_hours_set: t({
      en: "Working Hours Set",
      es: "Horario de Trabajo Establecido",
    }),
    working_hours_configured_message: t({
      en: "You have configured your working hours. Clients can now book lessons during your available times.",
      es: "Has configurado tu horario de trabajo. Los clientes ahora pueden reservar clases durante tus horarios disponibles.",
    }),
    set_working_hours_heading: t({
      en: "Set Your Working Hours",
      es: "Establece Tu Horario de Trabajo",
    }),
    set_working_hours_desc: t({
      en: "Define your available hours for each day of the week to let clients know when they can book lessons",
      es: "Define tus horas disponibles para cada día de la semana para que los clientes sepan cuándo pueden reservar clases",
    }),
  },
} satisfies Dictionary;

export default availabilityContent;
