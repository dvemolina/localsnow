import { t, type Dictionary } from "intlayer";

const howContent = {
  key: "how",
  content: {
    it_works_page_title: t({
      en: "How It Works",
      es: "Cómo Funciona",
    }),
    it_works_page_intro: t({
      en: "Local Snow is a curated directory of ski and snowboard instructors. Browse profiles, check availability, and send lesson requests directly. No booking platform fees, no middlemen.",
      es: "Local Snow conecta clientes directamente con instructores de esquí y snowboard. Sin comisiones de reserva, sin comisiones abusivas. Así funciona para ambas partes.",
    }),
    it_works_page_clients_title: t({
      en: "For Clients Looking for Instructors",
      es: "Para Clientes que Buscan Clases",
    }),
    it_works_page_clients_step1_title: t({
      en: "Browse the Directory",
      es: "Busca Instructores",
    }),
    it_works_page_clients_step1_desc: t({
      en: "Start on the homepage. Select your resort and sport (skiing or snowboarding). Browse our curated directory of instructors who work at that resort.",
      es: "Empieza en la página principal. Selecciona tu estación y deporte (esquí o snowboard). Verás una lista de instructores que trabajan en esa estación.",
    }),
    it_works_page_clients_step2_title: t({
      en: "Compare Profiles",
      es: "Explora Perfiles",
    }),
    it_works_page_clients_step2_desc: t({
      en: "Check instructor qualifications, languages spoken, specialties, and pricing. Look for the verified badge - it means we've confirmed their certifications.",
      es: "Consulta cualificaciones de instructores, idiomas, experiencia y precios. Busca la insignia de verificado - significa que hemos comprobado sus certificaciones.",
    }),
    it_works_page_clients_step3_title: t({
      en: "Send a Lesson Request",
      es: "Solicita una Clase",
    }),
    it_works_page_clients_step3_desc: t({
      en: "Found the right fit? Send a lesson request with your preferred dates, skill level, number of students, and any special requirements directly through their profile.",
      es: "Completa una solicitud de reserva con tus fechas, nivel, número de estudiantes y requisitos especiales. Envíala a través del perfil del instructor.",
    }),
    it_works_page_clients_step3_note: t({
      en: "Refundable deposit: You'll pay a €15 deposit to secure your booking and prevent spam. This is returned after your confirmed lesson.",
      es: "Depósito reembolsable: Pagarás un depósito de 15€ para asegurar tu reserva y prevenir spam. Se devuelve después de tu clase confirmada.",
    }),
    it_works_page_clients_step4_title: t({
      en: "Connect Directly",
      es: "Conecta Directamente",
    }),
    it_works_page_clients_step4_desc: t({
      en: "The instructor receives your request and responds with availability and pricing. You arrange lesson details directly with them - no middleman.",
      es: "El instructor recibe tu solicitud y responde con disponibilidad y precios. Organizas los detalles de la clase directamente con ellos - sin intermediarios.",
    }),
    it_works_page_clients_step5_title: t({
      en: "Pay the Instructor Directly",
      es: "Paga al Instructor Directamente",
    }),
    it_works_page_clients_step5_desc: t({
      en: "You pay the instructor directly for the lessons - not through our platform. Cash, bank transfer, or however you agree. We don't handle lesson payments, so there are no booking fees.",
      es: "Pagas al instructor directamente por las clases - no a través de nuestra plataforma. Efectivo, transferencia bancaria o como acordéis. No gestionamos pagos de clases, así que no hay comisiones de reserva.",
    }),
    it_works_page_clients_step6_title: t({
      en: "Leave a Review",
      es: "Deja una Reseña",
    }),
    it_works_page_clients_step6_desc: t({
      en: "After your lesson, leave an honest review. It helps other clients find great instructors and gives instructors feedback.",
      es: "Después de tu clase, deja una reseña honesta. Ayuda a otros clientes a encontrar buenos instructores y da retroalimentación a los instructores.",
    }),
    it_works_page_clients_cost_title: t({
      en: "Cost for Clients",
      es: "Coste para Clientes",
    }),
    it_works_page_clients_cost_no_fees: t({
      en: "No booking fees - browse and request lessons for free",
      es: "Sin comisiones de reserva - busca y solicita clases gratis",
    }),
    it_works_page_clients_cost_deposit: t({
      en: "15€ refundable deposit - required per booking request, returned after your confirmed lesson",
      es: "Depósito reembolsable de 15€ - requerido por solicitud de reserva, se devuelve después de tu clase confirmada",
    }),
    it_works_page_clients_cost_unlimited: t({
      en: "Unlimited instructors - contact as many instructors as you need",
      es: "Instructores ilimitados - contacta con tantos instructores como necesites",
    }),
    it_works_page_instructors_title: t({
      en: "For Instructors: Get Listed in the Directory",
      es: "Para Instructores que Ofrecen Clases",
    }),
    it_works_page_instructors_step1_title: t({
      en: "List Your Profile",
      es: "Crea Tu Perfil",
    }),
    it_works_page_instructors_step1_desc: t({
      en: "Sign up and create your directory listing. Add your qualifications, languages, resorts you work at, sports you teach, and base pricing. Your profile becomes searchable immediately.",
      es: "Regístrate y completa tu perfil de instructor. Añade tus cualificaciones, idiomas, estaciones donde trabajas, deportes que enseñas y precios base.",
    }),
    it_works_page_instructors_step1_note: t({
      en: "Takes 5 minutes. Your listing goes live immediately and appears in local searches.",
      es: "Toma 5 minutos. Tu perfil estará activo inmediatamente.",
    }),
    it_works_page_instructors_step2_title: t({
      en: "Get Verified (Recommended)",
      es: "Verifica Tu Perfil (Opcional)",
    }),
    it_works_page_instructors_step2_desc: t({
      en: "Upload your certification documents to get verified. A verified badge appears on your profile, which helps you stand out and builds trust when clients or schools are browsing the directory.",
      es: "Sube tus documentos de certificación para solicitar la verificación. Una insignia de verificado aparece en tu perfil, lo que te ayuda a destacar y genera confianza con los clientes.",
    }),
    it_works_page_instructors_step3_title: t({
      en: "Receive Lesson Requests",
      es: "Recibe Solicitudes de Reserva",
    }),
    it_works_page_instructors_step3_desc: t({
      en: "When a client finds you in the directory and sends a lesson request, you get an email notification with their dates, skill level, and requirements.",
      es: "Cuando un cliente solicita una clase, recibes una notificación por email. Verás sus fechas, nivel y requisitos.",
    }),
    it_works_page_instructors_step4_title: t({
      en: "Pay 5€ to Access Contact Info",
      es: "Paga 5€ para Acceder a la Info de Contacto",
    }),
    it_works_page_instructors_step4_desc: t({
      en: "To view the client's contact information and respond, you pay a one-time 5€ lead fee per request. This covers platform costs and prevents spam requests.",
      es: "Para ver la información de contacto del cliente y responder, pagas una tarifa única de 5€ por solicitud. Esto cubre costes de plataforma y previene solicitudes spam.",
    }),
    it_works_page_instructors_step4_note: t({
      en: "You only pay if you want to respond. You can decline requests at no cost.",
      es: "Solo pagas si quieres responder. Puedes rechazar solicitudes sin coste.",
    }),
    it_works_page_instructors_step5_title: t({
      en: "Arrange Lessons Directly",
      es: "Organiza las Clases Directamente",
    }),
    it_works_page_instructors_step5_desc: t({
      en: "Contact the client, confirm availability, and agree on lesson details. You handle scheduling, location, and pricing on your terms.",
      es: "Contacta con el cliente, confirma disponibilidad y acuerda los detalles de la clase. Tú gestionas horarios, ubicación y precios según tus términos.",
    }),
    it_works_page_instructors_step6_title: t({
      en: "Get Paid Directly",
      es: "Cobra Directamente",
    }),
    it_works_page_instructors_step6_desc: t({
      en: "The client pays you directly for the lessons. Cash, bank transfer, Bizum - however you prefer. We don't process payments, so there are no commissions or fees on your lessons.",
      es: "El cliente te paga directamente por las clases. Efectivo, transferencia bancaria, Bizum - como prefieras. No procesamos pagos, así que no hay comisiones en tus clases.",
    }),
    it_works_page_instructors_step6_note: t({
      en: "You keep 100% of what you charge for lessons.",
      es: "Te quedas el 100% de lo que cobras por las clases.",
    }),
    it_works_page_instructors_cost_title: t({
      en: "Cost for Instructors",
      es: "Coste para Instructores",
    }),
    it_works_page_instructors_cost_free: t({
      en: "Free directory listing - create and maintain your profile at no cost, forever",
      es: "Listado de perfil gratuito - crea y mantén tu perfil sin coste",
    }),
    it_works_page_instructors_cost_lead: t({
      en: "5€ per lead - only pay when you want to access contact info from a lesson request",
      es: "5€ por contacto - solo pagas cuando quieras responder a una solicitud de reserva",
    }),
    it_works_page_instructors_cost_no_commission: t({
      en: "No commissions - keep 100% of your lesson fees, always",
      es: "Sin comisiones - quédate el 100% de tus tarifas de clases",
    }),
    it_works_page_instructors_cost_no_monthly: t({
      en: "No monthly fees - pay only for leads you choose to pursue, great for schools managing referrals",
      es: "Sin cuotas mensuales - paga solo por los contactos que elijas",
    }),
    it_works_page_faq_title: t({
      en: "Common Questions",
      es: "Preguntas Frecuentes",
    }),
    it_works_page_faq_deposit_q: t({
      en: "Is this a booking platform or a directory?",
      es: "¿Por qué el depósito de 15€ para clientes?",
    }),
    it_works_page_faq_deposit_a: t({
      en: "It's a directory first. We help you find the right instructor by browsing profiles with real details (languages, specialties, pricing, availability hints). You can send lesson requests and coordinate directly, but the main value is discovering local instructors fast—like Páginas Amarillas for ski pros.",
      es: "Previene spam y solicitudes falsas. El depósito es totalmente reembolsable después de tu clase confirmada con el instructor. Cada solicitud de reserva requiere un depósito, que protege a los instructores de no-shows y asegura consultas serias.",
    }),
    it_works_page_faq_lead_fee_q: t({
      en: "Can schools use this to refer clients?",
      es: "¿Por qué la tarifa de 5€ por contacto para instructores?",
    }),
    it_works_page_faq_lead_fee_a: t({
      en: "Absolutely! Schools and instructors use our directory to find each other when managing overflow or referrals. Browse by resort and specialty to connect clients with the right instructor fast. No complicated booking system—just a searchable directory of trusted pros.",
      es: "Cubre costes de servidor, notificaciones por email y mantenimiento de la plataforma. A diferencia de plataformas de reserva que cobran 15-20% de comisión, nosotros solo cobramos por la conexión inicial - no por las clases en sí.",
    }),
    it_works_page_faq_payments_q: t({
      en: "How do payments work?",
      es: "¿Cómo funcionan los pagos?",
    }),
    it_works_page_faq_payments_a: t({
      en: "Clients pay instructors directly for lessons - we're not involved. The only payments processed through our platform are the client deposit (refundable) and instructor lead fees (5€ per request). Both are handled securely through Stripe.",
      es: "Los clientes pagan a los instructores directamente por las clases - nosotros no estamos involucrados. Los únicos pagos procesados a través de nuestra plataforma son el depósito del cliente (reembolsable) y las tarifas de contacto del instructor (5€ por solicitud). Ambos se gestionan de forma segura a través de Stripe.",
    }),
    it_works_page_faq_no_response_q: t({
      en: "What if an instructor doesn't respond?",
      es: "¿Qué pasa si un instructor no responde?",
    }),
    it_works_page_faq_no_response_a: t({
      en: "Try another instructor. Instructors aren't obligated to respond to every request - they might be fully booked or unavailable for your dates. Your 15€ deposit remains valid for future requests.",
      es: "Prueba con otro instructor. Los instructores no están obligados a responder a todas las solicitudes - pueden estar completos o no disponibles para tus fechas. Tu depósito de 15€ sigue válido para futuras solicitudes.",
    }),
    it_works_page_faq_contact_q: t({
      en: "Can instructors see my contact info before paying?",
      es: "¿Pueden los instructores ver mi información de contacto antes de pagar?",
    }),
    it_works_page_faq_contact_a: t({
      en: "No. Instructors see your dates, skill level, and requirements, but contact information is hidden until they pay the 5€ lead fee. This protects both parties from spam.",
      es: "No. Los instructores ven tus fechas, nivel y requisitos, pero la información de contacto está oculta hasta que pagan la tarifa de 5€. Esto protege a ambas partes del spam.",
    }),
    it_works_page_cta_title: t({
      en: "Ready to Get Started?",
      es: "¿Listo para Empezar?",
    }),
    it_works_page_cta_find_instructor: t({
      en: "Browse Directory",
      es: "Buscar un Instructor",
    }),
    it_works_page_cta_list_instructor: t({
      en: "List Your Profile",
      es: "Registrarse como Instructor",
    }),
    works_free_forever_badge: t({
      en: "100% Free Directory",
      es: "100% Gratis Ahora Mismo.",
    }),
    works_free_forever_desc: t({
      en: "No \"trial periods.\" No \"premium plans.\" No catch. Our directory is community-driven and free while we grow. We don't take commissions or charge platform fees.",
      es: "Sin \"períodos de prueba\". Sin \"planes premium\". Sin trampa. LocalSnow es impulsado por la comunidad y gratis mientras crecemos. No cobramos comisiones ni tarifas.",
    }),
    works_students_step1_title: t({
      en: "Browse the Directory",
      es: "Busca Instructores",
    }),
    works_students_step1_desc: t({
      en: "Search our curated directory of certified ski and snowboard instructors. Filter by resort, sport, language, and experience level. All profiles are free to view with real details.",
      es: "Explora nuestro directorio de instructores certificados de esquí y snowboard. Filtra por estación, deporte, idioma y nivel de experiencia. Todos los perfiles son gratis para ver.",
    }),
    works_students_step2_title: t({
      en: "Send a Lesson Request",
      es: "Envía una Solicitud de Reserva",
    }),
    works_students_step2_desc: t({
      en: "Found the right instructor? Send them a lesson request with your preferred dates, times, and details. No payment required—just fill out the form and submit.",
      es: "¿Encontraste el instructor perfecto? Envíales una solicitud de reserva con tus fechas, horarios y detalles de la clase preferidos. Sin pago requerido—solo completa el formulario y envíalo.",
    }),
    works_students_step3_title: t({
      en: "Get Contact Info Immediately",
      es: "Obtén la Info de Contacto Inmediatamente",
    }),
    works_students_step3_desc: t({
      en: "The instructor receives your request instantly and can view your contact information. They'll reach out to you directly to confirm availability and discuss lesson details.",
      es: "El instructor recibe tu información de contacto al instante. Se pondrán en contacto contigo directamente para confirmar disponibilidad, discutir detalles de la clase y acordar el pago.",
    }),
    works_students_step4_title: t({
      en: "Arrange Your Lesson",
      es: "Organiza Tu Clase",
    }),
    works_students_step4_desc: t({
      en: "Work directly with your instructor to finalize dates, times, meeting location, and payment. Our directory doesn't process payments—you arrange everything directly.",
      es: "Trabaja directamente con tu instructor para finalizar fechas, horarios, lugar de encuentro y pago. LocalSnow no procesa pagos—pagas al instructor directamente usando su método preferido.",
    }),
    works_students_step5_title: t({
      en: "Enjoy Your Lesson!",
      es: "¡Disfruta Tu Clase!",
    }),
    works_students_step5_desc: t({
      en: "Hit the slopes with your instructor and have an amazing time. After your lesson, leave a review to help other people browsing the directory.",
      es: "Ve a las pistas con tu instructor y pásalo genial. Después de tu clase, considera dejar una reseña para ayudar a futuros estudiantes.",
    }),
    works_students_pay_title: t({
      en: "Students Pay:",
      es: "Los Estudiantes Pagan:",
    }),
    works_students_pay_1: t({
      en: "€0 directory access - browse all instructor profiles for free",
      es: "€0 tarifas de reserva",
    }),
    works_students_pay_2: t({
      en: "Unlimited requests - contact as many instructors as you need",
      es: "Solicitudes ilimitadas - contacta con tantos instructores como quieras",
    }),
    works_students_pay_3: t({
      en: "No platform fees - we don't charge for discovery",
      es: "Sin depósitos - no retenemos ningún dinero",
    }),
    works_students_pay_4: t({
      en: "Direct payment - arrange rates and payment with your instructor",
      es: "Pago directo - negocia tarifas y paga a tu instructor directamente",
    }),
    works_instructors_step1_title: t({
      en: "List Your Profile in the Directory",
      es: "Crea Tu Perfil Gratis",
    }),
    works_instructors_step1_desc: t({
      en: "Sign up and create your directory listing with certifications, experience, languages, specialties, and pricing. Your profile becomes searchable immediately. 100% free—no subscriptions, no setup fees.",
      es: "Regístrate y crea tu perfil de instructor con tus certificaciones, experiencia, idiomas y precios. Añade fotos y establece tu disponibilidad. 100% gratis—sin suscripciones, sin tarifas de configuración.",
    }),
    works_instructors_step2_title: t({
      en: "Receive Lesson Requests",
      es: "Recibe Solicitudes de Reserva",
    }),
    works_instructors_step2_desc: t({
      en: "When a client finds you in the directory and sends a lesson request, you'll get an instant email notification with all their details: dates, times, skill level, and contact information.",
      es: "Cuando un estudiante te envía una solicitud de reserva, recibirás una notificación instantánea por email con todos sus detalles: fechas, horarios, nivel de habilidad e información de contacto completa.",
    }),
    works_instructors_step3_title: t({
      en: "View Contact Info For Free",
      es: "Ve la Info de Contacto Gratis",
    }),
    works_instructors_step3_desc: t({
      en: "No lead fees! See the client's email and phone number immediately in your dashboard. No payment required to unlock contact information.",
      es: "¡Sin tarifas por contacto! Ve el email y teléfono del estudiante inmediatamente en tu panel. Sin pago requerido para desbloquear información de contacto.",
    }),
    works_instructors_step4_title: t({
      en: "Contact Clients Directly",
      es: "Contacta a Estudiantes Directamente",
    }),
    works_instructors_step4_desc: t({
      en: "Reach out via email or phone to confirm your availability, discuss lesson details, and arrange payment. You're in control of your schedule and rates—great for referrals from schools too.",
      es: "Ponte en contacto con el estudiante por email o teléfono para confirmar tu disponibilidad, discutir detalles de la clase y acordar el pago. Tú controlas tu horario y tarifas.",
    }),
    works_instructors_step5_title: t({
      en: "Teach & Get Paid Directly",
      es: "Enseña y Cobra Directamente",
    }),
    works_instructors_step5_desc: t({
      en: "Conduct the lesson and receive payment directly from the client using your preferred method (cash, bank transfer, payment app). Our directory takes 0% commission—you keep every euro you earn.",
      es: "Imparte la clase y recibe el pago directamente del estudiante usando tu método preferido (efectivo, transferencia bancaria, app de pago). LocalSnow cobra 0% de comisión—te quedas cada euro que ganas.",
    }),
    works_instructors_pay_title: t({
      en: "Instructors Pay:",
      es: "Los Instructores Pagan:",
    }),
    works_instructors_pay_1: t({
      en: "€0 directory listing - create and maintain your profile for free",
      es: "€0 tarifas de listado - crea tu perfil gratis",
    }),
    works_instructors_pay_2: t({
      en: "€0 per lesson request - no lead fees or unlock fees",
      es: "€0 por solicitud de reserva - sin tarifas por contacto o desbloqueo",
    }),
    works_instructors_pay_3: t({
      en: "0% commission - keep 100% of your lesson fees",
      es: "0% comisión - quédate el 100% de tus tarifas de clases",
    }),
    works_instructors_pay_4: t({
      en: "No monthly subscriptions - free directory access while we grow",
      es: "Sin suscripciones mensuales - completamente gratis mientras crecemos",
    }),
    works_faq_really_free_q: t({
      en: "Is LocalSnow's directory really 100% free?",
      es: "¿LocalSnow es realmente 100% gratis?",
    }),
    works_faq_really_free_a: t({
      en: "Yes! Our directory is completely free for both clients and instructors. Browse profiles, send lesson requests, no hidden costs. We're a discovery tool, not a booking platform—you arrange payment and scheduling directly.",
      es: "¡Sí! LocalSnow es completamente gratis tanto para estudiantes como para instructores. Sin tarifas de reserva, sin comisiones, sin costes ocultos. Te conectamos directamente—tú manejas el pago y la programación vosotros mismos.",
    }),
    works_faq_how_money_q: t({
      en: "How do you make money if the directory is free?",
      es: "¿Cómo ganan dinero si todo es gratis?",
    }),
    works_faq_how_money_a: t({
      en: "Currently, we don't. LocalSnow is community-driven. In the future, we may explore optional premium features or ads, but the core directory will always remain free. We're building the directory we wish existed—not maximizing profit.",
      es: "Actualmente, no lo hacemos. LocalSnow es impulsado por la comunidad. En el futuro, podemos explorar funciones premium opcionales o anuncios, pero la plataforma principal siempre permanecerá 100% gratis. Estamos construyendo la plataforma que deseábamos que existiera—no maximizando beneficios.",
    }),
    works_faq_instructors_pay_q: t({
      en: "Do instructors pay to be listed or receive requests?",
      es: "¿Los instructores pagan algo por recibir solicitudes de reserva?",
    }),
    works_faq_instructors_pay_a: t({
      en: "No. Directory listings are free. Instructors receive all lesson request contact information immediately and for free. No lead fees, no subscriptions, no payment required. Just discoverable profiles and direct access to potential clients.",
      es: "No. Los instructores reciben toda la información de contacto inmediatamente y gratis. Sin tarifas por contacto, sin suscripciones, sin pago requerido. Solo acceso directo a estudiantes potenciales.",
    }),
    works_faq_students_pay_q: t({
      en: "How do students pay for lessons?",
      es: "¿Cómo pagan los estudiantes por las clases?",
    }),
    works_faq_students_pay_a: t({
      en: "Students find instructors in our directory, send a lesson request, then arrange payment and details directly with the instructor. We don't process any payments—instructors keep 100% of their lesson fees. Common methods include cash, bank transfer, or payment apps like Bizum.",
      es: "Los estudiantes contactan a los instructores directamente a través de la plataforma, luego acuerdan el pago y detalles de la clase fuera de LocalSnow. No procesamos ningún pago—los instructores se quedan el 100% de sus tarifas de clases. Los métodos comunes incluyen efectivo, transferencia bancaria o apps de pago como Bizum.",
    }),
    works_faq_no_response_q: t({
      en: "What if an instructor doesn't respond to my request?",
      es: "¿Qué pasa si un instructor no responde a mi solicitud?",
    }),
    works_faq_no_response_a: t({
      en: "Instructors manage their own schedules and availability. If you don't hear back within 24-48 hours, browse the directory and try another instructor. You can send unlimited lesson requests at no cost.",
      es: "Los instructores manejan sus propios horarios y disponibilidad. Si no recibes respuesta en 24-48 horas, prueba contactar a otro instructor. Puedes enviar solicitudes de reserva ilimitadas sin coste.",
    }),
    works_faq_safe_q: t({
      en: "Is LocalSnow safe?",
      es: "¿Es seguro LocalSnow?",
    }),
    works_faq_safe_a: t({
      en: "We verify instructor certifications when possible, but ultimately you're responsible for vetting your instructor. Read reviews in their directory profile, ask for credentials, and trust your instincts. Since we don't process payments, there's no financial risk using our directory.",
      es: "Verificamos las certificaciones de instructores cuando es posible, pero en última instancia eres responsable de evaluar a tu instructor. Lee reseñas, pide credenciales y confía en tu instinto. Como LocalSnow no procesa pagos, no hay riesgo financiero al usar nuestra plataforma.",
    }),
    works_why_different_title: t({
      en: "Why Our Directory is Different",
      es: "Por Qué Nuestro Directorio es Diferente",
    }),
    works_traditional_title: t({
      en: "Traditional Booking Platforms",
      es: "Plataformas de Reservas Tradicionales",
    }),
    works_traditional_1: t({
      en: "15-30% commission per lesson",
      es: "15-30% de comisión por clase",
    }),
    works_traditional_2: t({
      en: "Platform fees and booking charges",
      es: "Tarifas de plataforma y cargos de reserva",
    }),
    works_traditional_3: t({
      en: "Mandatory payment processing",
      es: "Procesamiento de pago obligatorio",
    }),
    works_traditional_4: t({
      en: "Profit-driven, VC-funded model",
      es: "Enfocado en beneficios, modelo financiado por VC",
    }),
    works_traditional_5: t({
      en: "Complex pricing and paywalls",
      es: "Precios complejos y muros de pago",
    }),
    works_localsnow_title: t({
      en: "LocalSnow Directory",
      es: "Directorio LocalSnow",
    }),
    works_localsnow_1: t({
      en: "0% commission - instructors keep everything",
      es: "0% comisión - los instructores se quedan todo",
    }),
    works_localsnow_2: t({
      en: "€0 directory access - completely free",
      es: "€0 acceso al directorio - completamente gratis",
    }),
    works_localsnow_3: t({
      en: "Direct contact - you arrange everything",
      es: "Contacto directo - tú organizas todo",
    }),
    works_localsnow_4: t({
      en: "Community-driven - directory for discovery",
      es: "Impulsado por la comunidad - directorio para descubrimiento",
    }),
    works_localsnow_5: t({
      en: "Simple & transparent - like Páginas Amarillas",
      es: "Simple y transparente - como Páginas Amarillas",
    }),
    works_cta_no_credit_card: t({
      en: "100% free directory. No credit card required. No hidden fees.",
      es: "Directorio 100% gratuito. No se requiere tarjeta de crédito. Sin tarifas ocultas.",
    }),
  },
} satisfies Dictionary;

export default howContent;
