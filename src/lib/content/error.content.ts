import { t, type Dictionary } from "intlayer";

const errorContent = {
  key: "error",
  content: {
    heading: t({
      en: "Error",
      es: "Error",
    }),
    no_session_title: t({
      en: "Payment Session Not Found",
      es: "Sesión de Pago No Encontrada",
    }),
    no_session_desc: t({
      en: "We couldn't find your payment session. Please try submitting your booking request again.",
      es: "No pudimos encontrar tu sesión de pago. Por favor intenta enviar tu solicitud de reserva de nuevo.",
    }),
    payment_failed_title: t({
      en: "Payment Failed",
      es: "Pago Fallido",
    }),
    payment_failed_desc: t({
      en: "Your payment could not be processed. Please check your card details and try again.",
      es: "Tu pago no pudo ser procesado. Por favor verifica los datos de tu tarjeta e intenta de nuevo.",
    }),
    processing_title: t({
      en: "Processing Error",
      es: "Error de Procesamiento",
    }),
    processing_desc: t({
      en: "There was an error processing your payment. Please try again or contact support if the problem persists.",
      es: "Hubo un error procesando tu pago. Por favor intenta de nuevo o contacta a soporte si el problema persiste.",
    }),
    need_help_title: t({
      en: "Need Help?",
      es: "¿Necesitas Ayuda?",
    }),
    need_help_text: t({
      en: "If you continue to experience issues, please contact our support team and we'll help you complete your booking.",
      es: "Si continúas experimentando problemas, por favor contacta a nuestro equipo de soporte y te ayudaremos a completar tu reserva.",
    }),
    title: t({
      en: "Error",
      es: "Error",
    }),
  },
} satisfies Dictionary;

export default errorContent;
