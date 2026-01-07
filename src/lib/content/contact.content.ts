import { t, type Dictionary } from "intlayer";

const contactContent = {
  key: "contact",
  content: {
    page_title: t({
      en: "Contact Us",
      es: "Contacto",
    }),
    page_subtitle: t({
      en: "Have questions about our directory or need assistance? We're here to help.",
      es: "¿Tienes preguntas o necesitas ayuda? Estamos aquí para ayudarte.",
    }),
    page_general_title: t({
      en: "General Inquiries",
      es: "Consultas Generales",
    }),
    page_general_desc: t({
      en: "For general questions, feedback, or partnership opportunities:",
      es: "Para preguntas generales, comentarios u oportunidades de colaboración:",
    }),
    page_email_label: t({
      en: "Email",
      es: "Correo Electrónico",
    }),
    page_instructors_title: t({
      en: "For Instructors",
      es: "Para Instructores",
    }),
    page_instructors_desc: t({
      en: "Are you a ski or snowboard instructor in Spain? List your profile in our directory and get discovered by clients.",
      es: "¿Eres instructor de esquí o snowboard en España? Únete a nuestra plataforma para conectar directamente con clientes.",
    }),
    page_instructors_benefits: t({
      en: "Why list your profile?",
      es: "¿Por qué unirse a Local Snow?",
    }),
    page_benefit_1: t({
      en: "Get discovered - appear in local searches by resort, language, and specialty",
      es: "Contacto directo con clientes - sin intermediarios",
    }),
    page_benefit_2: t({
      en: "Referral-friendly - great for schools and instructors managing overflow",
      es: "Bajo coste por lead - solo 5€ para desbloquear información del cliente",
    }),
    page_benefit_3: t({
      en: "No commission on lessons - keep 100% of your lesson fees",
      es: "Sin comisión en reservas - quédate con el 100% de tus tarifas",
    }),
    page_benefit_4: t({
      en: "Free directory listing - manage your profile at no cost",
      es: "Gestiona tus propios precios y disponibilidad",
    }),
    page_join_button: t({
      en: "List Your Profile",
      es: "Crear Perfil de Instructor",
    }),
    page_clients_title: t({
      en: "For Clients",
      es: "Para Clientes",
    }),
    page_clients_desc: t({
      en: "Looking for ski or snowboard instructors at Spanish resorts?",
      es: "¿Buscas clases de esquí o snowboard en estaciones españolas?",
    }),
    page_find_button: t({
      en: "Browse Directory",
      es: "Encontrar Instructores",
    }),
    page_support_title: t({
      en: "Support",
      es: "Soporte",
    }),
    page_support_desc: t({
      en: "Need help with a lesson request or have technical issues? Email us at {email} and we'll respond within 24 hours.",
      es: "¿Necesitas ayuda con una reserva existente o tienes problemas técnicos? Envíanos un correo a {email} y te responderemos en 24 horas.",
    }),
    page_faq_title: t({
      en: "Frequently Asked Questions",
      es: "Preguntas Frecuentes",
    }),
    page_faq_cta: t({
      en: "Visit our How It Works page for answers to common questions about using the directory and sending lesson requests.",
      es: "Visita nuestra página Cómo Funciona para encontrar respuestas a preguntas comunes sobre reservas y uso de la plataforma.",
    }),
    page_how_it_works_button: t({
      en: "How It Works",
      es: "Cómo Funciona",
    }),
  },
} satisfies Dictionary;

export default contactContent;
