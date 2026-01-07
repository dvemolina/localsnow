import { t, type Dictionary } from "intlayer";

const lessonsContent = {
  key: "lessons",
  content: {
    page_title: t({
      en: "Base Lesson Configuration",
      es: "Configuración de Clase Base",
    }),
    page_subtitle: t({
      en: "Set your standard hourly rate and available sports. This will be shown to potential clients.",
      es: "Establece tu tarifa por hora estándar y deportes disponibles. Esto se mostrará a clientes potenciales.",
    }),
    base_lesson_config: t({
      en: "Base Lesson Configuration",
      es: "Configuración de Clase Base",
    }),
    base_lesson_config_desc: t({
      en: "Your standard hourly rate and available sports",
      es: "Tu tarifa por hora estándar y deportes disponibles",
    }),
    hourly_rate_label: t({
      en: "Hourly Rate",
      es: "Tarifa por Hora",
    }),
    rate_help_text: t({
      en: "For 1-2 students per hour",
      es: "Para 1-2 estudiantes por hora",
    }),
    available_sports: t({
      en: "Available Sports",
      es: "Deportes Disponibles",
    }),
    flexible_pricing_info: t({
      en: "Flexible Pricing: This base rate applies to all your sports. You can offer group discounts and special packages below, or discuss custom pricing directly with clients.",
      es: "Precios Flexibles: Esta tarifa base se aplica a todos tus deportes. Puedes ofrecer descuentos de grupo y paquetes especiales abajo, o discutir precios personalizados directamente con los clientes.",
    }),
    advanced_pricing: t({
      en: "Advanced Pricing Options",
      es: "Opciones de Precios Avanzados",
    }),
    advanced_pricing_desc: t({
      en: "Add group discounts, duration packages, and promo codes (all optional)",
      es: "Añade descuentos de grupo, paquetes de duración y códigos promocionales (todos opcionales)",
    }),
    edit_base_lesson: t({
      en: "Edit Base Lesson",
      es: "Editar Clase Base",
    }),
    create_base_lesson: t({
      en: "Create Base Lesson",
      es: "Crear Clase Base",
    }),
    form_description: t({
      en: "Set your hourly rate and select which sports you teach",
      es: "Establece tu tarifa por hora y selecciona qué deportes enseñas",
    }),
    sports_label: t({
      en: "Sports You Teach",
      es: "Deportes que Enseñas",
    }),
    sports_help: t({
      en: "Select all sports you're qualified to teach",
      es: "Selecciona todos los deportes para los que estás cualificado",
    }),
    hourly_rate_help: t({
      en: "Your standard rate for a 1-hour private lesson",
      es: "Tu tarifa estándar para una clase privada de 1 hora",
    }),
    about_base_lesson: t({
      en: "About your base lesson",
      es: "Sobre tu clase base",
    }),
    about_base_lesson_text: t({
      en: "This represents your standard hourly rate. Clients will see this on your profile. You can teach any of the sports you selected - perfect for multi-disciplinary instructors!",
      es: "Esto representa tu tarifa por hora estándar. Los clientes verán esto en tu perfil. Puedes enseñar cualquiera de los deportes que seleccionaste - ¡perfecto para instructores multidisciplinarios!",
    }),
    button_update: t({
      en: "Update Base Lesson",
      es: "Actualizar Clase Base",
    }),
    button_save: t({
      en: "Save Base Lesson",
      es: "Guardar Clase Base",
    }),
    multi_sport_title: t({
      en: "Multi-Sport Instructors",
      es: "Instructores Multi-Deporte",
    }),
    multi_sport_desc: t({
      en: "You can select multiple sports if you're qualified to teach them:",
      es: "Puedes seleccionar múltiples deportes si estás cualificado para enseñarlos:",
    }),
    multi_sport_bullet1: t({
      en: "One base hourly rate applies to all sports you teach",
      es: "Una tarifa base por hora se aplica a todos los deportes que enseñas",
    }),
    multi_sport_bullet2: t({
      en: "Clients can see all sports you're certified for",
      es: "Los clientes pueden ver todos los deportes para los que estás certificado",
    }),
    multi_sport_bullet3: t({
      en: "Perfect for instructors who teach skiing and snowboarding",
      es: "Perfecto para instructores que enseñan esquí y snowboard",
    }),
    multi_sport_tip: t({
      en: "Tip: Your base rate is the same across all sports. If you want to charge differently per sport, you can discuss custom pricing directly with clients.",
      es: "Consejo: Tu tarifa base es la misma para todos los deportes. Si quieres cobrar diferente por deporte, puedes discutir precios personalizados directamente con los clientes.",
    }),
  },
} satisfies Dictionary;

export default lessonsContent;
