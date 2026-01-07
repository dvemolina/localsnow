import { t, type Dictionary } from "intlayer";

const formContent = {
  key: "form",
  content: {
    label_email: t({
      en: "Email",
      es: "Email",
    }),
    label_password: t({
      en: "Password",
      es: "Contraseña",
    }),
    label_name: t({
      en: "Name",
      es: "Nombre",
    }),
    label_last_name: t({
      en: "Last Name",
      es: "Apellido",
    }),
    label_first_name: t({
      en: "First Name",
      es: "Nombre",
    }),
    label_phone_optional: t({
      en: "Phone (optional)",
      es: "Teléfono (opcional)",
    }),
    label_phone_number: t({
      en: "Phone Number",
      es: "Número de Teléfono",
    }),
    label_email_address: t({
      en: "Email Address",
      es: "Dirección de Correo",
    }),
    label_accept_terms: t({
      en: "Accept terms and conditions",
      es: "Aceptar términos y condiciones",
    }),
    label_profile_image: t({
      en: "Professional Profile Image",
      es: "Imagen de Perfil Profesional",
    }),
    label_your_name: t({
      en: "Your Name",
      es: "Tu Nombre",
    }),
    label_preferred_date: t({
      en: "Preferred Date",
      es: "Fecha Preferida",
    }),
    label_lesson_type: t({
      en: "Lesson Type",
      es: "Tipo de Clase",
    }),
    label_number_of_people: t({
      en: "Number of People",
      es: "Número de Personas",
    }),
    label_skill_level: t({
      en: "Skill Level",
      es: "Nivel de Habilidad",
    }),
    label_additional_information: t({
      en: "Additional Information",
      es: "Información Adicional",
    }),
    label_hours: t({
      en: "Hours",
      es: "Horas",
    }),
    placeholder_first_name: t({
      en: "John",
      es: "Juan",
    }),
    placeholder_last_name: t({
      en: "Doe",
      es: "García",
    }),
    placeholder_email: t({
      en: "john.doe@example.com",
      es: "juan.garcia@ejemplo.com",
    }),
    placeholder_phone: t({
      en: "123 456 7890",
      es: "123 456 7890",
    }),
    placeholder_phone_intl: t({
      en: "+1 234 567 8900",
      es: "+34 612 345 678",
    }),
    placeholder_full_name: t({
      en: "John Doe",
      es: "Juan García",
    }),
    placeholder_lesson_type: t({
      en: "Select lesson type",
      es: "Selecciona tipo de clase",
    }),
    placeholder_skill_level: t({
      en: "Select your level",
      es: "Selecciona tu nivel",
    }),
    placeholder_additional_info: t({
      en: "Any special requests, goals, or questions...",
      es: "Cualquier solicitud especial, objetivos o preguntas...",
    }),
    placeholder_search_client: t({
      en: "Search client name or email...",
      es: "Buscar nombre o email del cliente...",
    }),
    placeholder_name_email: t({
      en: "Name, email...",
      es: "Nombre, email...",
    }),
    placeholder_search_user: t({
      en: "Search name or email...",
      es: "Buscar nombre o email...",
    }),
    placeholder_suspension_reason: t({
      en: "Reason for suspension...",
      es: "Motivo de la suspensión...",
    }),
    placeholder_rejection_reason: t({
      en: "Reason for rejection...",
      es: "Motivo del rechazo...",
    }),
    placeholder_search_resorts: t({
      en: "Search resorts...",
      es: "Buscar estaciones...",
    }),
    placeholder_duration_name: t({
      en: "e.g., Half Day, Full Day",
      es: "ej., Medio Día, Día Completo",
    }),
    placeholder_duration_description: t({
      en: "e.g., 4 hours on the slopes",
      es: "ej., 4 horas en las pistas",
    }),
    placeholder_promo_code: t({
      en: "Enter promo code",
      es: "Ingresa código promocional",
    }),
    placeholder_review_comment: t({
      en: "Share your experience with this instructor...",
      es: "Comparte tu experiencia con este instructor...",
    }),
    help_phone_example: t({
      en: "E.g: (+44)6870979153.",
      es: "Ej: (+34)687097915.",
    }),
    terms_agreement_text: t({
      en: "You agree to our Terms of Service and Privacy Policy.",
      es: "Aceptas nuestros Términos de Servicio y Política de Privacidad.",
    }),
    help_email: t({
      en: "This email will be used for account notifications",
      es: "Este correo se usará para notificaciones de la cuenta",
    }),
    help_phone: t({
      en: "Your personal contact number",
      es: "Tu número de contacto personal",
    }),
    help_profile_image: t({
      en: "This image will appear in your Instructor Card for clients to see.",
      es: "Esta imagen aparecerá en tu Tarjeta de Instructor para que los clientes la vean.",
    }),
    section_basic_information: t({
      en: "Basic Information",
      es: "Información Básica",
    }),
    placeholder_your_name: t({
      en: "Enter your full name",
      es: "Ingresa tu nombre completo",
    }),
    placeholder_select_lesson_type: t({
      en: "Select lesson type",
      es: "Selecciona tipo de clase",
    }),
    placeholder_select_level: t({
      en: "Select your level",
      es: "Selecciona tu nivel",
    }),
    label_additional_info: t({
      en: "Additional Information",
      es: "Información Adicional",
    }),
    help_additional_info: t({
      en: "Include any special requirements, goals, or questions you have.",
      es: "Incluye requisitos especiales, objetivos o preguntas que tengas.",
    }),
    characters: t({
      en: "characters",
      es: "caracteres",
    }),
    label_bio: t({
      en: "Bio",
      es: "Biografía",
    }),
    label_professional_phone: t({
      en: "Professional Phone",
      es: "Teléfono Profesional",
    }),
    label_phone: t({
      en: "Phone",
      es: "Teléfono",
    }),
    label_country_prefix: t({
      en: "Country Prefix",
      es: "Prefijo de País",
    }),
    label_currency: t({
      en: "Currency",
      es: "Moneda",
    }),
    label_instructor_type: t({
      en: "Instructor Type",
      es: "Tipo de Instructor",
    }),
    label_base_price: t({
      en: "Base Price (1 Hour)",
      es: "Precio Base (1 Hora)",
    }),
    label_qualification: t({
      en: "Qualification File",
      es: "Archivo de Certificación",
    }),
    label_contact_phone: t({
      en: "Professional Contact Phone",
      es: "Teléfono de Contacto Profesional",
    }),
    label_biography: t({
      en: "Biography",
      es: "Biografía",
    }),
    label_school_name: t({
      en: "School Name",
      es: "Nombre de la Escuela",
    }),
    label_school_logo: t({
      en: "School Logo Image",
      es: "Logo de la Escuela",
    }),
    label_school_email: t({
      en: "School Contact Email",
      es: "Email de Contacto de la Escuela",
    }),
    label_school_phone: t({
      en: "School Contact Phone",
      es: "Teléfono de Contacto de la Escuela",
    }),
    label_promo_code: t({
      en: "Promo Code",
      es: "Código Promocional",
    }),
    label_message: t({
      en: "Message",
      es: "Mensaje",
    }),
    label_search: t({
      en: "Search",
      es: "Buscar",
    }),
    label_code: t({
      en: "Code",
      es: "Código",
    }),
    label_description: t({
      en: "Description",
      es: "Descripción",
    }),
    label_valid_until: t({
      en: "Valid Until",
      es: "Válido Hasta",
    }),
    label_max_uses: t({
      en: "Max Uses",
      es: "Máximo de Usos",
    }),
    placeholder_message: t({
      en: "Tell the instructor about your goals, experience, or special requirements...",
      es: "Cuéntale al instructor sobre tus objetivos, experiencia o requisitos especiales...",
    }),
    placeholder_min_price: t({
      en: "Min €",
      es: "Mín €",
    }),
    placeholder_max_price: t({
      en: "Max €",
      es: "Máx €",
    }),
    placeholder_review: t({
      en: "Share your experience with this instructor...",
      es: "Comparte tu experiencia con este instructor...",
    }),
    placeholder_promo_example: t({
      en: "WINTER2025",
      es: "INVIERNO2025",
    }),
    description_base_price: t({
      en: "Base Hourly Rate. You'll be able to add Discounts and Promotions later.",
      es: "Tarifa Base por Hora. Podrás agregar Descuentos y Promociones después.",
    }),
    description_save_details: t({
      en: "Save your details for faster future bookings",
      es: "Guardar tus datos para reservas más rápidas en el futuro",
    }),
    placeholder_select_currency: t({
      en: "Select a currency",
      es: "Selecciona una moneda",
    }),
    placeholder_country_prefix: t({
      en: "Country Prefix",
      es: "Prefijo de País",
    }),
    placeholder_select_instructor_type: t({
      en: "Select your type",
      es: "Selecciona tu tipo",
    }),
    description_profile_image: t({
      en: "This image will appear in your Instructor Card for clients to see.",
      es: "Esta imagen aparecerá en tu Tarjeta de Instructor para que los clientes la vean.",
    }),
    description_qualification: t({
      en: "The qualification has to be in PDF format.",
      es: "La certificación debe estar en formato PDF.",
    }),
    description_contact_phone: t({
      en: "This number will be shown to clients",
      es: "Este número se mostrará a los clientes",
    }),
    description_biography: t({
      en: "Short description of yourself and what you offer",
      es: "Breve descripción de ti mismo y lo que ofreces",
    }),
    description_school_logo: t({
      en: "This image will appear in your School Card for clients to see.",
      es: "Esta imagen aparecerá en tu Tarjeta de Escuela para que los clientes la vean.",
    }),
    description_school_email: t({
      en: "School Contact details for the Clients",
      es: "Datos de contacto de la escuela para los clientes",
    }),
    description_school_bio: t({
      en: "Short description of what sets you apart, services or packages you offer, your values/style and types of professionals you have.",
      es: "Breve descripción de lo que te diferencia, servicios o paquetes que ofreces, tus valores/estilo y tipos de profesionales que tienes.",
    }),
  },
} satisfies Dictionary;

export default formContent;
