import { t, type Dictionary } from "intlayer";

const navContent = {
  key: "nav",
  content: {
    home: t({
      en: "Home",
      es: "Inicio",
    }),
    instructors: t({
      en: "Instructors",
      es: "Instructores",
    }),
    about: t({
      en: "About",
      es: "Acerca de",
    }),
    contact: t({
      en: "Contact",
      es: "Contacto",
    }),
    login: t({
      en: "Login",
      es: "Iniciar sesión",
    }),
    signup: t({
      en: "Sign Up",
      es: "Registrarse",
    }),
    dashboard: t({
      en: "Dashboard",
      es: "Panel",
    }),
    logout: t({
      en: "Logout",
      es: "Cerrar sesión",
    }),
    resorts: t({
      en: "Resorts",
      es: "Estaciones",
    }),
    how_it_works: t({
      en: "How It Works",
      es: "Cómo Funciona",
    }),
  },
} satisfies Dictionary;

export default navContent;
