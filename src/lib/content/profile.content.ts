import { t, type Dictionary } from "intlayer";

const profileContent = {
  key: "profile",
  content: {
    page_title: t({
      en: "Profile Settings",
      es: "Configuración del Perfil",
    }),
    page_subtitle: t({
      en: "Manage your account information and preferences",
      es: "Gestiona la información de tu cuenta y preferencias",
    }),
    tab_personal: t({
      en: "Personal Information",
      es: "Información Personal",
    }),
    tab_professional: t({
      en: "Professional Details",
      es: "Detalles Profesionales",
    }),
    tab_school: t({
      en: "School Details",
      es: "Detalles de la Escuela",
    }),
    section_personal: t({
      en: "Personal Information",
      es: "Información Personal",
    }),
    section_personal_desc: t({
      en: "Update your basic account information and contact details",
      es: "Actualiza la información básica de tu cuenta y datos de contacto",
    }),
    section_instructor: t({
      en: "Independent Instructor Profile",
      es: "Perfil de Instructor Independiente",
    }),
    section_school_instructor: t({
      en: "School Instructor Profile",
      es: "Perfil de Instructor de Escuela",
    }),
    section_instructor_desc: t({
      en: "Manage your professional credentials, certifications, and teaching information",
      es: "Gestiona tus credenciales profesionales, certificaciones e información de enseñanza",
    }),
    verification_pending_notice: t({
      en: "Your instructor profile is pending verification. We'll review your credentials within 24-48 hours.",
      es: "Tu perfil de instructor está pendiente de verificación. Revisaremos tus credenciales en 24-48 horas.",
    }),
    section_school: t({
      en: "School Profile",
      es: "Perfil de Escuela",
    }),
    section_school_desc: t({
      en: "Manage your school's information, contact details, and instructors",
      es: "Gestiona la información de tu escuela, datos de contacto e instructores",
    }),
    verification_pending_notice_school: t({
      en: "Your school profile is pending verification. We'll review your credentials within 24-48 hours.",
      es: "Tu perfil de escuela está pendiente de verificación. Revisaremos tus credenciales en 24-48 horas.",
    }),
    school_coming_soon: t({
      en: "School profile management coming soon...",
      es: "Gestión del perfil de escuela próximamente...",
    }),
  },
} satisfies Dictionary;

export default profileContent;
