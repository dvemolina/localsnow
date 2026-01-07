import { t, type Dictionary } from "intlayer";

const homeContent = {
  key: "home",
  content: {
    hero_title: t({
      en: "Find the Right Ski Instructor in Spain",
      es: "Encuentra Profesores de Esquí y Snowboard en España",
    }),
    hero_subtitle: t({
      en: "A curated directory of local instructors at Spanish resorts. Browse profiles, check specialties, and send lesson requests directly.",
      es: "Contacto directo con instructores locales en estaciones españolas. Pagas lo que cobran - nada más.",
    }),
    hero_cta: t({
      en: "Browse Directory",
      es: "Buscar Instructores",
    }),
    how_it_works: t({
      en: "How It Works",
      es: "Cómo Funciona",
    }),
    for_instructors: t({
      en: "Are you an instructor?",
      es: "¿Eres instructor?",
    }),
    join_cta: t({
      en: "Join Local Snow",
      es: "Únete a Local Snow",
    }),
    resorts_title: t({
      en: "Popular Spanish Ski Resorts",
      es: "Estaciones de Esquí Populares en España",
    }),
    resorts_subtitle: t({
      en: "Browse instructors at Spain's top ski destinations",
      es: "Busca instructores en los mejores destinos de esquí de España",
    }),
    resorts_view_all: t({
      en: "View All Spanish Resorts",
      es: "Ver Todas las Estaciones Españolas",
    }),
    resorts_view_instructors: t({
      en: "View Instructors",
      es: "Ver Instructores",
    }),
    resort_descriptions_baqueira: t({
      en: "Spain's most prestigious resort",
      es: "La estación más prestigiosa de España",
    }),
    resort_descriptions_formigal: t({
      en: "Largest ski area in Spain",
      es: "La zona de esquí más grande de España",
    }),
    resort_descriptions_cerler: t({
      en: "Highest resort in the Pyrenees",
      es: "La estación más alta de los Pirineos",
    }),
    resort_descriptions_sierra_nevada: t({
      en: "Ski with views of the Mediterranean",
      es: "Esquía con vistas al Mediterráneo",
    }),
    trust_title: t({
      en: "A Curated Directory, Not a Booking Platform",
      es: "Sin Comisiones de Reserva. De Verdad.",
    }),
    trust_subtitle: t({
      en: "Unlike traditional booking platforms, we're a trusted directory. Find the right instructor, see real details, and connect directly.",
      es: "A diferencia de CheckYeti y Skibro, no cobramos comisiones por tus clases. Los instructores fijan sus propios precios.",
    }),
    trust_free_title: t({
      en: "Free Directory Access",
      es: "Gratis para Clientes",
    }),
    trust_free_desc: t({
      en: "Browse instructor listings for free. See specialties, languages, rates, and availability hints before you reach out.",
      es: "Sin comisiones de reserva, sin cargos por servicio. Paga al instructor directamente por tus clases.",
    }),
    trust_verified_title: t({
      en: "Verified Profiles",
      es: "Instructores Verificados",
    }),
    trust_verified_desc: t({
      en: "Look for the verified badge. We check qualifications and certifications so you can trust who you're contacting.",
      es: "Busca la insignia de verificado. Comprobamos las cualificaciones para que tú no tengas que hacerlo.",
    }),
    trust_built_title: t({
      en: "Built for Local Discovery",
      es: "Creado por Instructores",
    }),
    trust_built_desc: t({
      en: "Like Páginas Amarillas for mountain pros. Created by instructors, for instructors and clients who value transparency.",
      es: "Creado por un instructor de esquí en activo que estaba cansado de plataformas de reserva caras.",
    }),
    instructors_title: t({
      en: "List Your Instructor Profile",
      es: "¿Eres Instructor de Esquí?",
    }),
    instructors_subtitle: t({
      en: "Join our curated directory and get discovered by clients. Perfect for independent instructors and schools looking to refer overflow.",
      es: "Únete a Local Snow y conecta directamente con clientes. Sin comisiones en tus clases - solo una pequeña tarifa por contacto.",
    }),
    instructors_keep_fees_title: t({
      en: "Be Discoverable",
      es: "Quédate el 100% de Tus Tarifas",
    }),
    instructors_keep_fees_desc: t({
      en: "Your profile appears in local searches. Clients find you by resort, specialty, language, and availability—not random algorithms.",
      es: "Sin comisiones, sin porcentajes. Tú fijas tus precios y te quedas todo lo que ganas de las clases.",
    }),
    instructors_pay_leads_title: t({
      en: "Great for Referrals",
      es: "Solo Paga por Contactos Cualificados",
    }),
    instructors_pay_leads_desc: t({
      en: "Schools and fellow instructors can easily find you to refer clients. Build your network while keeping full control of your rates.",
      es: "Solo 5€ por solicitud de reserva que elijas responder. Sin cuotas mensuales, sin cargos ocultos.",
    }),
    instructors_online_title: t({
      en: "List Your Profile in 5 Minutes",
      es: "Online en 5 Minutos",
    }),
    instructors_online_desc: t({
      en: "Free directory listing. Add your qualifications, specialties, languages, and rates. Clients can request lessons and check availability directly.",
      es: "Configuración de perfil gratuita. Añade tus cualificaciones, fija tus tarifas y empieza a recibir solicitudes de reserva inmediatamente.",
    }),
    instructors_cta: t({
      en: "List Your Profile",
      es: "Crea Tu Perfil de Instructor",
    }),
    instructors_cta_note: t({
      en: "Free forever. No credit card required. Takes less than 5 minutes.",
      es: "No se requiere tarjeta de crédito. Toma menos de 5 minutos.",
    }),
    testimonials_title: t({
      en: "Trusted by Instructors and Clients",
      es: "Confianza de Instructores y Clientes",
    }),
    testimonials_subtitle: t({
      en: "See what our community has to say about Local Snow",
      es: "Mira lo que nuestra comunidad dice sobre Local Snow",
    }),
    testimonials_maria_text: t({
      en: "Finally, a platform that doesn't take 20% of my earnings. I love the simplicity - just pay per lead and keep everything else. My income has increased significantly.",
      es: "Por fin, una plataforma que no se lleva el 20% de mis ingresos. Me encanta la simplicidad - solo pago por contacto y me quedo con todo lo demás. Mis ingresos han aumentado significativamente.",
    }),
    testimonials_maria_name: t({
      en: "Maria Costa",
      es: "María Costa",
    }),
    testimonials_maria_role: t({
      en: "Ski Instructor, Baqueira Beret",
      es: "Instructora de Esquí, Baqueira Beret",
    }),
    testimonials_james_text: t({
      en: "Found an amazing instructor for my family at Sierra Nevada. No hidden fees, direct contact, and the instructor was exactly as described. Will definitely use again!",
      es: "Encontré un instructor increíble para mi familia en Sierra Nevada. Sin cargos ocultos, contacto directo, y el instructor era exactamente como se describía. ¡Definitivamente lo usaré de nuevo!",
    }),
    testimonials_james_name: t({
      en: "James Miller",
      es: "James Miller",
    }),
    testimonials_james_role: t({
      en: "Client from London",
      es: "Cliente de Londres",
    }),
    testimonials_pablo_text: t({
      en: "As a snowboard instructor in Formigal, this platform has been a game changer. More clients, less hassle, and I control my schedule completely. Highly recommended!",
      es: "Como instructor de snowboard en Formigal, esta plataforma ha sido revolucionaria. Más clientes, menos complicaciones, y controlo mi horario completamente. ¡Muy recomendado!",
    }),
    testimonials_pablo_name: t({
      en: "Pablo García",
      es: "Pablo García",
    }),
    testimonials_pablo_role: t({
      en: "Snowboard Instructor, Formigal",
      es: "Instructor de Snowboard, Formigal",
    }),
    cta_title: t({
      en: "Ready to Get Started?",
      es: "¿Listo para Empezar?",
    }),
    cta_subtitle: t({
      en: "Browse our directory of trusted local instructors or list your profile to get discovered.",
      es: "Únete a Local Snow hoy y disfruta del esquí sin comisiones de reserva.",
    }),
    cta_find_instructor: t({
      en: "Browse Directory",
      es: "Buscar un Instructor",
    }),
    cta_list_instructor: t({
      en: "List Your Profile",
      es: "Registrarse como Instructor",
    }),
    how_it_works_title: t({
      en: "How It Works",
      es: "Cómo Funciona",
    }),
    how_it_works_step1_title: t({
      en: "Browse",
      es: "Busca",
    }),
    how_it_works_step1_desc: t({
      en: "Search our directory by resort and sport. View instructor profiles with qualifications, languages, specialties, and rates.",
      es: "Elige tu estación y deporte. Consulta perfiles de instructores con cualificaciones y precios reales.",
    }),
    how_it_works_step2_title: t({
      en: "Request",
      es: "Solicita",
    }),
    how_it_works_step2_desc: t({
      en: "Found the right instructor? Send a lesson request with your dates and details. They'll respond directly.",
      es: "Envía una solicitud de reserva con tus fechas y detalles. Recibe respuesta directa del instructor.",
    }),
    how_it_works_step3_title: t({
      en: "Connect",
      es: "Conecta",
    }),
    how_it_works_step3_desc: t({
      en: "Arrange your lesson directly with the instructor. No platform fees, no middleman—just direct contact.",
      es: "Organiza tu clase directamente con el instructor. Les pagas directamente - nosotros no nos llevamos nada.",
    }),
    how_it_works_cta: t({
      en: "See Full Guide: How the Directory Works",
      es: "Ver Guía Detallada para Clientes e Instructores",
    }),
    free_banner_badge: t({
      en: "100% FREE DIRECTORY",
      es: "DIRECTORIO 100% GRATUITO",
    }),
    free_banner_title: t({
      en: "A Directory Built for Discovery, Not Profit",
      es: "Un Directorio Construido para Descubrimiento, No para Beneficio",
    }),
    free_banner_description: t({
      en: "Unlike booking platforms that charge 10-30% commission per lesson, our directory is completely free. Browse instructor profiles, check specialties, and send lesson requests at no cost. Built for the community, not investors.",
      es: "A diferencia de plataformas de reservas que cobran comisiones del 10-30% por clase, nuestro directorio es completamente gratuito. Explora perfiles de instructores, consulta especialidades y envía solicitudes de clase sin coste. Construido para la comunidad, no para inversores.",
    }),
    free_banner_booking_fees: t({
      en: "€0",
      es: "€0",
    }),
    free_banner_booking_fees_label: t({
      en: "Directory Access",
      es: "Acceso al Directorio",
    }),
    free_banner_commission: t({
      en: "0%",
      es: "0%",
    }),
    free_banner_commission_label: t({
      en: "Commission",
      es: "Comisión",
    }),
    free_banner_unlimited: t({
      en: "∞",
      es: "∞",
    }),
    free_banner_unlimited_label: t({
      en: "Browse & Request",
      es: "Explorar y Solicitar",
    }),
    free_banner_tagline: t({
      en: "A curated directory for local discovery. Community-driven, instructor-first.",
      es: "Un directorio curado para descubrimiento local. Impulsado por la comunidad, instructores primero.",
    }),
    why_free_title: t({
      en: "Why LocalSnow is a Free Directory",
      es: "Por Qué LocalSnow es un Directorio Gratuito",
    }),
    why_free_subtitle: t({
      en: "We're building the directory we wish existed.",
      es: "Estamos construyendo el directorio que deseábamos que existiera.",
    }),
    why_free_problem_title: t({
      en: "The Problem",
      es: "El Problema",
    }),
    why_free_problem_desc: t({
      en: "Booking platforms take 15-30% commission from every lesson and hide instructors behind paywalls. Instructors work hard, students pay premium prices, but a middleman profits the most. Discovery should be transparent, not extractive.",
      es: "Las plataformas de reservas cobran comisiones del 15-30% de cada clase y esconden instructores detrás de muros de pago. Los instructores trabajan duro, los estudiantes pagan precios premium, pero el intermediario se lleva la mayor parte. El descubrimiento debe ser transparente, no extractivo.",
    }),
    why_free_solution_title: t({
      en: "Our Solution",
      es: "Nuestra Solución",
    }),
    why_free_solution_desc: t({
      en: "LocalSnow is a curated directory—like Páginas Amarillas (Yellow Pages) for ski instructors. Browse profiles with real details (languages, specialties, rates, availability). Send lesson requests. Connect directly. No commissions, no middleman fees.",
      es: "LocalSnow es un directorio curado—como Páginas Amarillas para instructores de esquí. Explora perfiles con detalles reales (idiomas, especialidades, tarifas, disponibilidad). Envía solicitudes de clase. Conecta directamente. Sin comisiones, sin tarifas de intermediario.",
    }),
    why_free_community_title: t({
      en: "Community First",
      es: "La Comunidad Primero",
    }),
    why_free_community_desc: t({
      en: "We're community-driven and built by instructors. No venture capital, no investors demanding profits. This directory is built for local discovery—schools can find instructors for referrals, clients can find the right fit fast.",
      es: "Somos impulsados por la comunidad y construidos por instructores. Sin capital de riesgo, sin inversores exigiendo beneficios. Este directorio está construido para descubrimiento local—escuelas pueden encontrar instructores para referencias, clientes pueden encontrar el adecuado rápido.",
    }),
    why_free_forever_title: t({
      en: "Free Right Now",
      es: "Gratis Ahora Mismo",
    }),
    why_free_forever_desc: t({
      en: "We mean it. No \"freemium\" bait-and-switch. No \"introductory pricing.\" LocalSnow's directory is 100% free while we grow. If we need revenue in the future, we'll give plenty of notice and keep fees minimal—never the 15-30% commissions booking platforms charge.",
      es: "Lo decimos en serio. Sin truco de \"freemium\". Sin \"precios de introducción\". El directorio de LocalSnow es 100% gratis mientras crecemos. Si necesitamos ingresos en el futuro, avisaremos con antelación y mantendremos las tarifas mínimas—nunca las comisiones del 15-30% que cobran las plataformas de reservas.",
    }),
    why_free_sound_good_title: t({
      en: "Sound too good to be true?",
      es: "¿Suena demasiado bueno para ser verdad?",
    }),
    why_free_sound_good_desc: t({
      en: "We get it. But we're serious. See how our directory works or check our mission. No tricks, no hidden agenda—just a better way to discover local instructors.",
      es: "Lo entendemos. Pero vamos en serio. Mira cómo funciona nuestro directorio o consulta nuestra misión. Sin trucos, sin agenda oculta—solo una mejor manera de descubrir instructores locales.",
    }),
  },
} satisfies Dictionary;

export default homeContent;
