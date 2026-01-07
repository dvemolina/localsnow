import { t, type Dictionary } from "intlayer";

const dashboardContent = {
  key: "dashboard",
  content: {
    title: t({
      en: "Dashboard",
      es: "Panel",
    }),
    bookings: t({
      en: "Lesson Requests",
      es: "Reservas",
    }),
    profile: t({
      en: "Profile",
      es: "Perfil",
    }),
    lessons: t({
      en: "Lessons",
      es: "Clases",
    }),
    availability: t({
      en: "Availability",
      es: "Disponibilidad",
    }),
    working_hours: t({
      en: "Working Hours",
      es: "Horario de Trabajo",
    }),
    greeting_morning: t({
      en: "Good morning",
      es: "Buenos días",
    }),
    greeting_afternoon: t({
      en: "Good afternoon",
      es: "Buenas tardes",
    }),
    greeting_evening: t({
      en: "Good evening",
      es: "Buenas noches",
    }),
    action_view_profile: t({
      en: "View Profile",
      es: "Ver Perfil",
    }),
    action_view_profile_desc: t({
      en: "Update your personal information",
      es: "Actualiza tu información personal",
    }),
    action_view_bookings: t({
      en: "View Lesson Requests",
      es: "Ver Reservas",
    }),
    action_view_bookings_desc: t({
      en: "See incoming requests from clients who found you in the directory",
      es: "Consulta tus solicitudes de clases",
    }),
    action_manage_lessons: t({
      en: "Manage Lessons",
      es: "Gestionar Clases",
    }),
    action_manage_lessons_desc: t({
      en: "Configure your lesson rates and offerings shown in your directory listing",
      es: "Crea y edita tus ofertas de clases",
    }),
    choose_role_greeting: t({
      en: "Hey {name}, Let's Choose Your Account Type",
      es: "Hola {name}, Elige Tu Tipo de Cuenta",
    }),
    choose_role_button: t({
      en: "Choose Account Type",
      es: "Elegir Tipo de Cuenta",
    }),
    welcome_subtitle: t({
      en: "Welcome to your Local Snow dashboard",
      es: "Bienvenido a tu panel de Local Snow",
    }),
    account_status: t({
      en: "Account Status",
      es: "Estado de la Cuenta",
    }),
    review_in_progress: t({
      en: "Review in progress",
      es: "Revisión en curso",
    }),
    total_bookings: t({
      en: "Total Bookings",
      es: "Total de Reservas",
    }),
    no_bookings_yet: t({
      en: "No bookings yet",
      es: "Sin reservas aún",
    }),
    active_lessons: t({
      en: "Active Lessons",
      es: "Clases Activas",
    }),
    create_first_lesson: t({
      en: "Create your first lesson",
      es: "Crea tu primera clase",
    }),
    quick_actions: t({
      en: "Quick Actions",
      es: "Acciones Rápidas",
    }),
    complete_profile: t({
      en: "Complete Your Profile",
      es: "Completa Tu Perfil",
    }),
    profile_verification_notice: t({
      en: "Your instructor profile is under review. To speed up verification:",
      es: "Tu perfil de instructor está en revisión. Para acelerar la verificación:",
    }),
    profile_verification_item1: t({
      en: "Ensure your certification documents are clear and valid",
      es: "Asegúrate de que tus documentos de certificación sean claros y válidos",
    }),
    profile_verification_item2: t({
      en: "Add a professional profile photo",
      es: "Añade una foto de perfil profesional",
    }),
    profile_verification_item3: t({
      en: "Complete your biography with teaching experience",
      es: "Completa tu biografía con experiencia docente",
    }),
    go_to_profile_button: t({
      en: "Go to Profile",
      es: "Ir al Perfil",
    }),
    action_my_bookings: t({
      en: "My Lesson Requests",
      es: "Mis Solicitudes de Reserva",
    }),
    action_my_bookings_desc: t({
      en: "View and manage lesson requests you've sent to instructors",
      es: "Ver y gestionar tus solicitudes de reserva",
    }),
  },
} satisfies Dictionary;

export default dashboardContent;
