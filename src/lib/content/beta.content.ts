import { t, type Dictionary } from "intlayer";

const betaContent = {
  key: "beta",
  content: {
    launch_badge: t({
      en: "Beta Launch - Season 2025/26",
      es: "Lanzamiento Beta - Temporada 2025/26",
    }),
    launch_title: t({
      en: "Free Access for Early Adopters",
      es: "Acceso Gratuito para Early Adopters",
    }),
    launch_description: t({
      en: "Join our beta and help shape the future of ski instruction booking. Check your email after signup for your free access code.",
      es: "Únete a nuestra beta y ayúdanos a dar forma al futuro de la reserva de clases de esquí. Revisa tu email después de registrarte para obtener tu código de acceso gratuito.",
    }),
    launch_valid_until: t({
      en: "Valid until March 31, 2026",
      es: "Válido hasta el 31 de marzo de 2026",
    }),
    launch_no_fees: t({
      en: "No deposits, no fees",
      es: "Sin depósitos, sin tarifas",
    }),
    launch_client_info: t({
      en: "🎉 Beta Launch Special",
      es: "🎉 Especial Lanzamiento Beta",
    }),
    launch_client_message: t({
      en: "Check your email after signup for code BETA2025 - gives you free booking requests until March 2026. Normal pricing (€15 refundable deposit) starts next season.",
      es: "Revisa tu email después de registrarte para obtener el código BETA2025 - te da solicitudes de reserva gratis hasta marzo de 2026. Los precios normales (depósito reembolsable de 15€) comienzan la próxima temporada.",
    }),
    launch_instructor_info: t({
      en: "🎉 Beta Launch Special",
      es: "🎉 Especial Lanzamiento Beta",
    }),
    launch_instructor_message: t({
      en: "Check your email after signup for code BETA2025 - gives you free lead unlocks until March 2026. Normal pricing (€5 per lead) starts next season.",
      es: "Revisa tu email después de registrarte para obtener el código BETA2025 - te da desbloqueos de leads gratis hasta marzo de 2026. Los precios normales (5€ por lead) comienzan la próxima temporada.",
    }),
  },
} satisfies Dictionary;

export default betaContent;
