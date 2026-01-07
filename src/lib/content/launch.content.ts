import { t, type Dictionary } from "intlayer";

const launchContent = {
  key: "launch",
  content: {
    code_label: t({
      en: "Launch Code",
      es: "Código de Lanzamiento",
    }),
    code_optional: t({
      en: "Optional",
      es: "Opcional",
    }),
    code_placeholder: t({
      en: "Enter your beta code",
      es: "Ingresa tu código beta",
    }),
    code_help_booking: t({
      en: "Have a launch code? Enter it to skip the €15 deposit.",
      es: "¿Tienes un código de lanzamiento? Ingrésalo para omitir el depósito de 15€.",
    }),
    code_help_instructor: t({
      en: "Have a launch code? Enter it to unlock contact info for free.",
      es: "¿Tienes un código de lanzamiento? Ingrésalo para desbloquear la info de contacto gratis.",
    }),
    code_learn_more: t({
      en: "Learn more",
      es: "Más información",
    }),
    code_invalid: t({
      en: "Invalid or expired launch code",
      es: "Código de lanzamiento inválido o expirado",
    }),
    code_applied: t({
      en: "Beta code applied - no payment required!",
      es: "¡Código beta aplicado - no se requiere pago!",
    }),
    code_button: t({
      en: "Use Launch Code",
      es: "Usar Código de Lanzamiento",
    }),
    code_or_pay: t({
      en: "Or pay €5 to unlock",
      es: "O paga 5€ para desbloquear",
    }),
  },
} satisfies Dictionary;

export default launchContent;
