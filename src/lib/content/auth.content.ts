import { t, type Dictionary } from "intlayer";

const authContent = {
  key: "auth",
  content: {
    email: t({
      en: "Email",
      es: "Correo Electrónico",
    }),
    password: t({
      en: "Password",
      es: "Contraseña",
    }),
    name: t({
      en: "Name",
      es: "Nombre",
    }),
    last_name: t({
      en: "Last Name",
      es: "Apellido",
    }),
    phone: t({
      en: "Phone",
      es: "Teléfono",
    }),
    country_code: t({
      en: "Country Code",
      es: "Código de País",
    }),
    accept_terms: t({
      en: "I accept the terms and conditions",
      es: "Acepto los términos y condiciones",
    }),
    have_account: t({
      en: "Already have an account?",
      es: "¿Ya tienes una cuenta?",
    }),
    no_account: t({
      en: "Don't have an account?",
      es: "¿No tienes cuenta?",
    }),
    sign_in: t({
      en: "Sign In",
      es: "Iniciar Sesión",
    }),
    sign_up: t({
      en: "Sign Up",
      es: "Registrarse",
    }),
    forgot_password: t({
      en: "Forgot password?",
      es: "¿Olvidaste tu contraseña?",
    }),
    reset_password: t({
      en: "Reset Password",
      es: "Restablecer Contraseña",
    }),
    or_continue_with: t({
      en: "Or continue with",
      es: "O continuar con",
    }),
    google: t({
      en: "Google",
      es: "Google",
    }),
    join_network: t({
      en: "Join Local Snow International Network",
      es: "Únete a la Red Internacional de Local Snow",
    }),
    signup_google: t({
      en: "Signup With Google Account",
      es: "Registrarse con Google",
    }),
    or_create_account: t({
      en: "or create an account",
      es: "o crear una cuenta",
    }),
    access_google: t({
      en: "Access With Google Account",
      es: "Acceder con Google",
    }),
    or: t({
      en: "or",
      es: "o",
    }),
    no_account_link: t({
      en: "I don't have an account",
      es: "No tengo una cuenta",
    }),
    have_account_link: t({
      en: "I already have an account",
      es: "Ya tengo una cuenta",
    }),
  },
} satisfies Dictionary;

export default authContent;
