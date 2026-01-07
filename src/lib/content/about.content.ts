import { t, type Dictionary } from "intlayer";

const aboutContent = {
  key: "about",
  content: {
    title: t({
      en: "About Local Snow",
      es: "Acerca de Local Snow",
    }),
    meta_description: t({
      en: "Local Snow is built by a ski instructor with experience across Argentina, New Zealand, Spain, and Chile. A fair platform that gives instructors ownership while connecting clients directly with the people who teach them.",
      es: "Local Snow fue creado por un instructor de esquí con experiencia en Argentina, Nueva Zelanda, España y Chile. Una plataforma justa que da propiedad a los instructores mientras conecta a los clientes directamente con las personas que les enseñan.",
    }),
    who_built_title: t({
      en: "Who Built This",
      es: "Quién Construyó Esto",
    }),
    who_built_p1: t({
      en: "I'm a ski instructor. I've worked in Argentina, New Zealand, Spain, Chile—different continents, different resort cultures, different approaches to the same job. That perspective showed me something: the current system has fundamental problems that hurt instructors, clients, and the snowsports industry as a whole.",
      es: "Soy instructor de esquí. He trabajado en Argentina, Nueva Zelanda, España, Chile—diferentes continentes, diferentes culturas de estaciones, diferentes enfoques para el mismo trabajo. Esa perspectiva me mostró algo: el sistema actual tiene problemas fundamentales que perjudican a instructores, clientes y a la industria de deportes de nieve en general.",
    }),
    economic_title: t({
      en: "The Economic Reality",
      es: "La Realidad Económica",
    }),
    economic_p1: t({
      en: "Ski schools operate like managers or representatives for instructors. And like any management relationship, they take a cut. But in what other industry does a manager take more than 50% of the talent's earnings?",
      es: "Las escuelas de esquí operan como gerentes o representantes de instructores. Y como cualquier relación de gestión, toman una comisión. Pero ¿en qué otra industria un gerente toma más del 50% de las ganancias del talento?",
    }),
    economic_p2: t({
      en: "In many school setups, the school gets paid per person per hour while instructors get paid a flat hourly rate regardless of how many students they teach. A group lesson with 6 people? The school might charge €60/hour per person (€360 total) while the instructor earns €25/hour. The math doesn't add up for the people doing the actual work.",
      es: "En muchas configuraciones de escuelas, la escuela cobra por persona por hora mientras los instructores reciben un salario por hora fijo sin importar cuántos estudiantes enseñen. ¿Una clase grupal con 6 personas? La escuela puede cobrar 60€/hora por persona (360€ total) mientras el instructor gana 25€/hora. Las matemáticas no cuadran para las personas que hacen el trabajo real.",
    }),
    economic_p3: t({
      en: "And booking platforms? They charge 15-20% commissions on top of that, plus subscription fees for basic features like managing your own calendar or setting your own pricing. Tools that should be standard are locked behind paywalls.",
      es: "¿Y las plataformas de reservas? Cobran comisiones del 15-20% además de eso, más tarifas de suscripción por funciones básicas como gestionar tu propio calendario o establecer tus propios precios. Herramientas que deberían ser estándar están bloqueadas detrás de muros de pago.",
    }),
    visibility_title: t({
      en: "The Visibility Problem",
      es: "El Problema de Visibilidad",
    }),
    visibility_p1: t({
      en: "Schools often act as a screen between clients and instructors. But clients aren't just buying a lesson—they're trusting someone with their safety, or more importantly, their kids' safety. They have every right to know who that person is, see their qualifications, and make an informed choice.",
      es: "Las escuelas a menudo actúan como una pantalla entre clientes e instructores. Pero los clientes no solo están comprando una clase—están confiando en alguien con su seguridad, o más importante, la seguridad de sus hijos. Tienen todo el derecho de saber quién es esa persona, ver sus calificaciones y tomar una decisión informada.",
    }),
    visibility_p2: t({
      en: "The best instructors deserve to be visible. The system shouldn't hide talent behind institutional branding.",
      es: "Los mejores instructores merecen ser visibles. El sistema no debería ocultar el talento detrás de marcas institucionales.",
    }),
    risk_title: t({
      en: "Risk vs. Reward",
      es: "Riesgo vs. Recompensa",
    }),
    risk_p1: t({
      en: "Being a ski instructor comes with real risks. Physical injury, liability exposure, unpredictable income, seasonal uncertainty. We take on all of that, and yet most of us can't make a comfortable living from it. That's not sustainable, and it's not fair.",
      es: "Ser instructor de esquí conlleva riesgos reales. Lesiones físicas, exposición a responsabilidad, ingresos impredecibles, incertidumbre estacional. Asumimos todo eso, y sin embargo la mayoría de nosotros no puede ganarse la vida cómodamente con ello. Eso no es sostenible, y no es justo.",
    }),
    risk_p2: t({
      en: "Instructors need tools that help them manage their business, own their client relationships, and earn what they're worth—without sacrificing half their income to middlemen.",
      es: "Los instructores necesitan herramientas que les ayuden a gestionar su negocio, poseer sus relaciones con clientes y ganar lo que valen—sin sacrificar la mitad de sus ingresos a intermediarios.",
    }),
    what_is_title: t({
      en: "What Local Snow Is",
      es: "Qué es Local Snow",
    }),
    what_is_p1: t({
      en: "Local Snow is a curated directory where instructors list their profiles and clients discover them directly. Think Páginas Amarillas (Yellow Pages) for ski instructors—searchable, transparent, and built for local discovery. No commissions on lessons. No subscription fees. Completely free.",
      es: "Local Snow es un directorio gratuito donde los instructores publican sus perfiles y los clientes los encuentran directamente. Sin comisiones en clases. Sin tarifas de suscripción. Sin costos ocultos. Solo una pequeña tarifa de lead de 5€ cuando un instructor elige responder a una solicitud de reserva.",
    }),
    what_is_p2: t({
      en: "I'm not trying to destroy ski schools or booking platforms. Schools serve a purpose—they provide structure, insurance, training programs, and consistent work. But there should also be space for independent instructors to get discovered fairly, and for schools to use the directory for referrals when managing overflow or finding specialists.",
      es: "No estoy tratando de destruir escuelas de esquí o plataformas de reservas. Las escuelas sirven un propósito—proporcionan estructura, seguro, programas de capacitación y trabajo constante para instructores que quieren eso. Pero también debería haber espacio para que instructores independientes operen justamente, y para que instructores de escuelas construyan su propia reputación y base de clientes.",
    }),
    what_is_p3: t({
      en: "This isn't a war between independents and schools. It's about building a bridge—a directory that works for everyone.",
      es: "Esto no es una guerra entre independientes y escuelas. Se trata de construir un puente.",
    }),
    verification_title: t({
      en: "The Verification Process",
      es: "El Proceso de Verificación",
    }),
    verification_p1: t({
      en: "I manually review every instructor who applies for verification. I check certifications, qualifications, and professional credentials. The badge doesn't mean someone is the best instructor in the world—it confirms they're legitimate, qualified, and take their work seriously.",
      es: "Reviso manualmente a cada instructor que solicita verificación. Verifico certificaciones, calificaciones y credenciales profesionales. La insignia no significa que alguien es el mejor instructor del mundo—confirma que son legítimos, calificados y toman su trabajo en serio.",
    }),
    verification_p2: t({
      en: "Clients deserve to know who they're working with. Instructors deserve to be recognized for their qualifications. That's what verification is for.",
      es: "Los clientes merecen saber con quién están trabajando. Los instructores merecen ser reconocidos por sus calificaciones. Para eso es la verificación.",
    }),
    spain_title: t({
      en: "Why Spain First",
      es: "Por Qué España Primero",
    }),
    spain_p1: t({
      en: "I've worked here. I know the resorts, the instructors, the local dynamics. Starting focused made more sense than trying to build a worldwide directory on day one. If this works in Spain and helps instructors make a better living while giving clients better access to great instruction, maybe it expands. If not, at least I tried.",
      es: "He trabajado aquí. Conozco las estaciones, los instructores, las dinámicas locales. Comenzar enfocado tenía más sentido que tratar de construir un directorio mundial desde el primer día. Si esto funciona en España y ayuda a los instructores a ganarse mejor la vida mientras da a los clientes mejor acceso a excelente instrucción, tal vez se expanda. Si no, al menos lo intenté.",
    }),
    goal_title: t({
      en: "The Goal",
      es: "El Objetivo",
    }),
    goal_p1: t({
      en: "I want instructors—independent and school-affiliated—to have affordable tools that give them ownership over their work. I want clients to connect directly with the people who teach them. I want the snowsports industry to be a place where talented instructors can build sustainable careers doing what they love.",
      es: "Quiero que los instructores—independientes y afiliados a escuelas—tengan herramientas asequibles que les den propiedad sobre su trabajo. Quiero que los clientes se conecten directamente con las personas que les enseñan. Quiero que la industria de deportes de nieve sea un lugar donde instructores talentosos puedan construir carreras sostenibles haciendo lo que aman.",
    }),
    goal_p2: t({
      en: "This isn't about getting rich or scaling into some venture-backed startup. It's about fixing something broken. If Local Snow helps even a handful of instructors earn more and a handful of clients find better instruction, it's worth it.",
      es: "Esto no se trata de hacerse rico o escalar en alguna startup respaldada por capital de riesgo. Se trata de arreglar algo roto. Si Local Snow ayuda aunque sea a un puñado de instructores a ganar más y a un puñado de clientes a encontrar mejor instrucción, vale la pena.",
    }),
    contact_title: t({
      en: "Get in Touch",
      es: "Ponte en Contacto",
    }),
    contact_p1: t({
      en: "If you're an instructor in Spain—independent or working for a school—{createProfile}. If you have feedback or questions, email me at {email}.",
      es: "Si eres instructor en España—independiente o trabajando para una escuela—{createProfile}. Si tienes comentarios o preguntas, envíame un correo a {email}.",
    }),
    contact_p2: t({
      en: "That's it. No manifesto, no corporate mission statement. Just trying to do better.",
      es: "Eso es todo. Sin manifiestos, sin declaraciones de misión corporativas. Solo tratando de hacerlo mejor.",
    }),
    contact_create_profile: t({
      en: "create a profile",
      es: "crea un perfil",
    }),
    contact_email: t({
      en: "support@localsnow.org",
      es: "support@localsnow.org",
    }),
    intro: t({
      en: "Local Snow is a free directory connecting clients with independent ski and snowboard instructors across Spain.",
      es: "Local Snow es un directorio gratuito que conecta clientes con instructores independientes de esquí y snowboard en toda España.",
    }),
    mission_title: t({
      en: "Our Mission",
      es: "Nuestra Misión",
    }),
    mission_text: t({
      en: "We believe ski lessons should be accessible without expensive booking fees. Our platform lets instructors set their own prices and keep 100% of their lesson fees.",
      es: "Creemos que las clases de esquí deben ser accesibles sin costosas comisiones de reserva. Nuestra plataforma permite a los instructores fijar sus propios precios y quedarse el 100% de sus tarifas de clases.",
    }),
    how_different_title: t({
      en: "How We're Different",
      es: "En Qué Somos Diferentes",
    }),
    how_different_text: t({
      en: "Unlike booking platforms that charge 15-20% commissions, we only charge a small lead fee (5€) to instructors. Clients browse for free and pay a refundable deposit to prevent spam.",
      es: "A diferencia de plataformas de reserva que cobran 15-20% de comisión, nosotros solo cobramos una pequeña tarifa por contacto (5€) a los instructores. Los clientes buscan gratis y pagan un depósito reembolsable para prevenir spam.",
    }),
    story_title: t({
      en: "Our Story",
      es: "Nuestra Historia",
    }),
    story_text: t({
      en: "Founded by a working ski instructor who was frustrated with expensive booking platforms that take large cuts from every lesson.",
      es: "Fundado por un instructor de esquí en activo que estaba frustrado con plataformas de reserva caras que se llevan grandes porcentajes de cada clase.",
    }),
  },
} satisfies Dictionary;

export default aboutContent;
