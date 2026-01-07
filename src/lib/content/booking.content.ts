import { t, type Dictionary } from "intlayer";

const bookingContent = {
  key: "booking",
  content: {
    request_lesson: t({
      en: "Request Lesson",
      es: "Solicitar Clase",
    }),
    student_info: t({
      en: "Student Information",
      es: "Información del Estudiante",
    }),
    lesson_details: t({
      en: "Lesson Details",
      es: "Detalles de la Clase",
    }),
    contact_info: t({
      en: "Your Contact Information",
      es: "Información de Contacto",
    }),
    number_of_students: t({
      en: "Number of Students",
      es: "Número de Estudiantes",
    }),
    start_date: t({
      en: "Preferred Start Date",
      es: "Fecha de Inicio",
    }),
    end_date: t({
      en: "Preferred End Date",
      es: "Fecha de Fin",
    }),
    hours_per_day: t({
      en: "Hours per Day",
      es: "Horas por Día",
    }),
    skill_level: t({
      en: "Skill Level",
      es: "Nivel de Habilidad",
    }),
    message: t({
      en: "Message to Instructor",
      es: "Mensaje al Instructor",
    }),
    estimated_price: t({
      en: "Estimated Price",
      es: "Precio Estimado",
    }),
    submit_request: t({
      en: "Send Request",
      es: "Enviar Solicitud de Reserva",
    }),
    request_title: t({
      en: "Request a Lesson",
      es: "Solicitar una Clase",
    }),
    request_description: t({
      en: "Fill out the form below and {instructorName} will get back to you to confirm availability and finalize details.",
      es: "Completa el formulario y {instructorName} te contactará para confirmar disponibilidad y finalizar los detalles.",
    }),
    request_success_title: t({
      en: "Request Sent Successfully!",
      es: "¡Solicitud Enviada Exitosamente!",
    }),
    request_success_message: t({
      en: "{instructorName} will contact you within 24 hours to confirm your lesson details.",
      es: "{instructorName} te contactará en 24 horas para confirmar los detalles de tu clase.",
    }),
    type_private: t({
      en: "Private Lesson",
      es: "Clase Privada",
    }),
    type_group: t({
      en: "Group Lesson",
      es: "Clase Grupal",
    }),
    type_half_day: t({
      en: "Half Day",
      es: "Medio Día",
    }),
    type_full_day: t({
      en: "Full Day",
      es: "Día Completo",
    }),
    skill_beginner: t({
      en: "Beginner",
      es: "Principiante",
    }),
    skill_intermediate: t({
      en: "Intermediate",
      es: "Intermedio",
    }),
    skill_advanced: t({
      en: "Advanced",
      es: "Avanzado",
    }),
    skill_expert: t({
      en: "Expert",
      es: "Experto",
    }),
    success_page_title: t({
      en: "Booking Request Sent",
      es: "Solicitud de Reserva Enviada",
    }),
    success_heading: t({
      en: "Booking Request Sent Successfully!",
      es: "¡Solicitud de Reserva Enviada Exitosamente!",
    }),
    success_message: t({
      en: "Your booking request has been sent to the instructor. You will be notified when they respond.",
      es: "Tu solicitud de reserva ha sido enviada al instructor. Serás notificado cuando respondan.",
    }),
    success_subtitle: t({
      en: "Your €15 deposit has been secured and your booking request has been sent to the instructor.",
      es: "Tu depósito de 15€ ha sido asegurado y tu solicitud de reserva ha sido enviada al instructor.",
    }),
    success_next_steps: t({
      en: "What Happens Next?",
      es: "¿Qué Sucede Ahora?",
    }),
    success_step1: t({
      en: "The instructor will review your request within 24 hours",
      es: "El instructor revisará tu solicitud en 24 horas",
    }),
    success_step2: t({
      en: "If they accept, you'll receive their contact information via email",
      es: "Si acepta, recibirás su información de contacto por email",
    }),
    success_step3: t({
      en: "After the lesson is completed, your €15 deposit will be refunded",
      es: "Después de completar la clase, tu depósito de 15€ será reembolsado",
    }),
    success_step4: t({
      en: "If no instructor accepts within 48 hours, you'll receive an automatic refund",
      es: "Si ningún instructor acepta en 48 horas, recibirás un reembolso automático",
    }),
    success_deposit_title: t({
      en: "About Your €15 Deposit",
      es: "Acerca de Tu Depósito de 15€",
    }),
    success_deposit_info: t({
      en: "Your deposit is held temporarily and will be automatically refunded after the lesson is completed or if the request is not accepted within 48 hours.",
      es: "Tu depósito se retiene temporalmente y será reembolsado automáticamente después de que se complete la clase o si la solicitud no es aceptada en 48 horas.",
    }),
    what_happens_next_title: t({
      en: "What Happens Next?",
      es: "¿Qué Sucede Ahora?",
    }),
    step1: t({
      en: "The instructor will review your request within 24 hours",
      es: "El instructor revisará tu solicitud en 24 horas",
    }),
    step2: t({
      en: "If they accept, you'll receive their contact information via email",
      es: "Si acepta, recibirás su información de contacto por email",
    }),
    step3: t({
      en: "After the lesson is completed, your €15 deposit will be refunded",
      es: "Después de completar la clase, tu depósito de 15€ será reembolsado",
    }),
    step4: t({
      en: "If no instructor accepts within 48 hours, you'll receive an automatic refund",
      es: "Si ningún instructor acepta en 48 horas, recibirás un reembolso automático",
    }),
    deposit_info_title: t({
      en: "About Your Deposit",
      es: "Sobre Tu Depósito",
    }),
    deposit_info_text: t({
      en: "Your €15 deposit is held securely by Stripe and will be automatically refunded based on the outcome of your booking.",
      es: "Tu depósito de 15€ está guardado de forma segura por Stripe y será reembolsado automáticamente según el resultado de tu reserva.",
    }),
    reference: t({
      en: "Booking Reference",
      es: "Referencia de Reserva",
    }),
    reference_label: t({
      en: "Booking Reference: #{bookingId}",
      es: "Referencia de Reserva: #{bookingId}",
    }),
    form_title: t({
      en: "Request a Lesson",
      es: "Solicitar una Clase",
    }),
    form_subtitle: t({
      en: "Send a lesson request to {name}. They'll get back to you to confirm availability and arrange details directly.",
      es: "Completa el formulario y {name} te contactará para confirmar disponibilidad y finalizar detalles.",
    }),
    form_success: t({
      en: "Request Sent Successfully!",
      es: "¡Solicitud Enviada con Éxito!",
    }),
    form_success_message: t({
      en: "{name} will contact you within 24 hours to discuss your lesson and confirm availability.",
      es: "{name} te contactará en 24 horas para confirmar los detalles de tu clase.",
    }),
    form_disclaimer: t({
      en: "By submitting this request, you agree to our Terms of Service. The instructor will contact you directly to arrange scheduling and payment.",
      es: "Al enviar este formulario, aceptas nuestros Términos de Servicio. El instructor te contactará directamente para coordinar el pago.",
    }),
  },
} satisfies Dictionary;

export default bookingContent;
