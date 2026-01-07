import { t, type Dictionary } from "intlayer";

const seoContent = {
  key: "seo",
  content: {
    meta_home_title: t({
      en: "Local Snow | Curated Directory of Ski Instructors in Spain",
      es: "Local Snow | Encuentra Instructores de Esquí en Estaciones Españolas",
    }),
    meta_home_description: t({
      en: "A trusted directory of ski and snowboard instructors across Spain. Browse profiles, check specialties and languages, and send lesson requests directly. Free to use at 25+ Spanish resorts including Baqueira, Formigal, Cerler, and Sierra Nevada.",
      es: "Conecta directamente con instructores de esquí y snowboard en toda España. Sin comisiones de reserva, sin intermediarios. Encuentra instructores en más de 25 estaciones españolas incluyendo Baqueira, Formigal, Cerler y Sierra Nevada.",
    }),
    meta_instructors_title: t({
      en: "Browse Ski & Snowboard Instructors | Local Snow Directory",
      es: "Encuentra Profesores de Esquí y Snowboard | Local Snow",
    }),
    meta_instructors_description: t({
      en: "Browse our curated directory of certified ski and snowboard instructors. Filter by resort, language, specialty, and availability. Connect directly with local professionals.",
      es: "Navega profesores certificados de esquí y snowboard en las mejores estaciones. Reserva directamente con instructores profesionales - sin comisiones.",
    }),
    meta_how_it_works_title: t({
      en: "How It Works | Local Snow Directory",
      es: "Cómo Funciona | Local Snow",
    }),
    meta_how_it_works_description: t({
      en: "Learn how Local Snow's directory helps you find ski instructors in Spain. Browse profiles, send lesson requests, and connect directly with local instructors.",
      es: "Aprende cómo Local Snow conecta clientes con instructores de esquí en España. Proceso simple para reservar clases y publicar tu perfil de instructor.",
    }),
    meta_contact_title: t({
      en: "Contact Us | Local Snow Directory",
      es: "Contacto | Local Snow",
    }),
    meta_contact_description: t({
      en: "Get in touch with Local Snow. Questions about our directory of ski instructors in Spain? Need help with your instructor profile listing? We're here to assist you.",
      es: "Ponte en contacto con Local Snow. ¿Preguntas sobre cómo reservar instructores de esquí en España? ¿Necesitas ayuda con tu perfil de instructor? Estamos aquí para ayudarte.",
    }),
  },
} satisfies Dictionary;

export default seoContent;
