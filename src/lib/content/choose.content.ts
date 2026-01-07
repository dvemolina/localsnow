import { t, type Dictionary } from "intlayer";

const chooseContent = {
  key: "choose",
  content: {
    role_welcome: t({
      en: "Welcome, {name}!",
      es: "¡Bienvenido, {name}!",
    }),
    role_subtitle: t({
      en: "Choose your account type to get started on Local Snow",
      es: "Elige tu tipo de cuenta para empezar en Local Snow",
    }),
    role_note_heading: t({
      en: "Note:",
      es: "Nota:",
    }),
    role_note_text: t({
      en: "You won't be able to change your account type later. If you need to change it, please contact our support team.",
      es: "No podrás cambiar tu tipo de cuenta después. Si necesitas cambiarlo, contacta con nuestro equipo de soporte.",
    }),
    role_student_title: t({
      en: "Student / Client",
      es: "Estudiante / Cliente",
    }),
    role_student_description: t({
      en: "Browse our directory and find instructors for your snow sports lessons",
      es: "Encuentra y reserva instructores para tus clases de deportes de nieve",
    }),
    role_student_features_title: t({
      en: "What you can do:",
      es: "Lo que puedes hacer:",
    }),
    role_student_feature_1: t({
      en: "Browse and search our curated directory of certified instructors",
      es: "Navegar y buscar instructores certificados",
    }),
    role_student_feature_2: t({
      en: "Send lesson requests and connect directly with instructors",
      es: "Enviar solicitudes de reserva y gestionar tus clases",
    }),
    role_student_feature_3: t({
      en: "Leave reviews and track your lesson request history",
      es: "Dejar reseñas y seguir tu historial de reservas",
    }),
    role_confirm: t({
      en: "Confirm Role",
      es: "Confirmar Rol",
    }),
    role_confirming: t({
      en: "Confirming...",
      es: "Confirmando...",
    }),
  },
} satisfies Dictionary;

export default chooseContent;
