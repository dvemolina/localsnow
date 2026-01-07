import { t, type Dictionary } from "intlayer";

const roleContent = {
  key: "role",
  content: {
    student: t({
      en: "Student",
      es: "Estudiante",
    }),
    instructor: t({
      en: "Instructor",
      es: "Instructor",
    }),
    school_admin: t({
      en: "School Admin",
      es: "Admin de Escuela",
    }),
    instructor_account: t({
      en: "Instructor Account",
      es: "Cuenta de Instructor",
    }),
    school_admin_account: t({
      en: "School Admin Account",
      es: "Cuenta de Admin de Escuela",
    }),
    client_account: t({
      en: "Client Account",
      es: "Cuenta de Cliente",
    }),
    client: t({
      en: "Client",
      es: "Cliente",
    }),
    instructor_independent: t({
      en: "Instructor (Independent)",
      es: "Instructor (Independiente)",
    }),
    instructor_school: t({
      en: "Instructor (School)",
      es: "Instructor (Escuela)",
    }),
    admin: t({
      en: "Admin",
      es: "Admin",
    }),
    no_role: t({
      en: "No role",
      es: "Sin rol",
    }),
  },
} satisfies Dictionary;

export default roleContent;
