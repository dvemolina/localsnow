import { t, type Dictionary } from "intlayer";

const clientContent = {
  key: "client",
  content: {
    my_bookings: t({
      en: "My Lesson Requests",
      es: "Mis Solicitudes de Reserva",
    }),
    my_bookings_desc: t({
      en: "View and manage all lesson requests you've sent to instructors from the directory",
      es: "Ver y gestionar todas tus solicitudes de reserva a instructores",
    }),
    filter_all: t({
      en: "All",
      es: "Todas",
    }),
    filter_active: t({
      en: "Active",
      es: "Activas",
    }),
    filter_completed: t({
      en: "Completed",
      es: "Completadas",
    }),
    filter_cancelled: t({
      en: "Cancelled",
      es: "Canceladas",
    }),
    table_instructor: t({
      en: "Instructor",
      es: "Instructor",
    }),
    table_students: t({
      en: "Students",
      es: "Estudiantes",
    }),
    table_sports: t({
      en: "Sports",
      es: "Deportes",
    }),
    no_bookings_found: t({
      en: "No lesson requests found",
      es: "No se encontraron solicitudes de reserva",
    }),
    no_bookings_title: t({
      en: "No Lesson Requests Yet",
      es: "Aún No Tienes Solicitudes de Reserva",
    }),
    no_bookings_subtitle: t({
      en: "Browse the directory to find an instructor and send your first lesson request",
      es: "Comienza buscando un instructor y enviando una solicitud de reserva",
    }),
    find_instructors: t({
      en: "Browse Directory",
      es: "Buscar Instructores",
    }),
    cancel_booking_title: t({
      en: "Cancel Lesson Request?",
      es: "¿Cancelar Solicitud de Reserva?",
    }),
    cancel_booking_desc: t({
      en: "Are you sure you want to cancel this lesson request? This action cannot be undone.",
      es: "¿Estás seguro de que quieres cancelar esta solicitud de reserva? Esta acción no se puede deshacer.",
    }),
    status_viewed: t({
      en: "Viewed by Instructor",
      es: "Vista por el Instructor",
    }),
    status_cancelled: t({
      en: "Cancelled",
      es: "Cancelada",
    }),
    back_to_bookings: t({
      en: "Back to My Lesson Requests",
      es: "Volver a Mis Reservas",
    }),
    booking_request: t({
      en: "Lesson Request",
      es: "Solicitud de Reserva",
    }),
    created_on: t({
      en: "Created on {date}",
      es: "Creada el {date}",
    }),
    instructor_info: t({
      en: "Instructor Information",
      es: "Información del Instructor",
    }),
    contact_locked_title: t({
      en: "Contact Information Locked",
      es: "Información de Contacto Bloqueada",
    }),
    contact_locked_desc: t({
      en: "The instructor will unlock contact information when they review your request",
      es: "El instructor desbloqueará la información de contacto cuando revise tu solicitud",
    }),
    booking_details: t({
      en: "Booking Details",
      es: "Detalles de la Reserva",
    }),
    requested_times: t({
      en: "Requested Time Slots",
      es: "Horarios Solicitados",
    }),
    beta_access_used: t({
      en: "Beta Access Used",
      es: "Acceso Beta Utilizado",
    }),
    beta_code: t({
      en: "Code",
      es: "Código",
    }),
    status_info: t({
      en: "Status Information",
      es: "Información de Estado",
    }),
    status_pending_desc: t({
      en: "Your request has been sent and is waiting for the instructor to review it.",
      es: "Tu solicitud ha sido enviada y está esperando a que el instructor la revise.",
    }),
    status_viewed_desc: t({
      en: "The instructor has viewed your request and will respond soon.",
      es: "El instructor ha visto tu solicitud y responderá pronto.",
    }),
    status_accepted_title: t({
      en: "Request Accepted!",
      es: "¡Solicitud Aceptada!",
    }),
    status_accepted_desc: t({
      en: "The instructor has accepted your request. Contact information is now unlocked.",
      es: "El instructor ha aceptado tu solicitud. La información de contacto ahora está desbloqueada.",
    }),
    status_rejected_title: t({
      en: "Request Declined",
      es: "Solicitud Rechazada",
    }),
    status_rejected_desc: t({
      en: "Unfortunately, the instructor was unable to accommodate your request.",
      es: "Desafortunadamente, el instructor no pudo atender tu solicitud.",
    }),
    status_cancelled_desc: t({
      en: "You cancelled this booking request.",
      es: "Cancelaste esta solicitud de reserva.",
    }),
    status_expired_desc: t({
      en: "This booking request has expired.",
      es: "Esta solicitud de reserva ha expirado.",
    }),
  },
} satisfies Dictionary;

export default clientContent;
