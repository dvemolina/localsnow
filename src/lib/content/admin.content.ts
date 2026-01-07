import { t, type Dictionary } from "intlayer";

const adminContent = {
  key: "admin",
  content: {
    dashboard_title: t({
      en: "Platform Overview",
      es: "Resumen de la Plataforma",
    }),
    dashboard_subtitle: t({
      en: "Monitor key metrics and platform health",
      es: "Monitorea métricas clave y estado de la plataforma",
    }),
    metric_total_users: t({
      en: "Total Users",
      es: "Total de Usuarios",
    }),
    metric_last_30_days: t({
      en: "+{count} in last 30 days",
      es: "+{count} en los últimos 30 días",
    }),
    metric_instructors: t({
      en: "Instructors",
      es: "Instructores",
    }),
    metric_pending_verification: t({
      en: "{count} pending verification",
      es: "{count} pendiente de verificación",
    }),
    metric_bookings: t({
      en: "Bookings",
      es: "Reservas",
    }),
    metric_completed_and_pending: t({
      en: "{completed} completed, {pending} pending",
      es: "{completed} completadas, {pending} pendientes",
    }),
    metric_revenue: t({
      en: "Revenue",
      es: "Ingresos",
    }),
    metric_reviews: t({
      en: "{count} reviews submitted",
      es: "{count} reseñas enviadas",
    }),
    pending_instructors_title: t({
      en: "{count} Instructor(s) Pending Verification",
      es: "{count} Instructor(es) Pendiente(s) de Verificación",
    }),
    suspended_users_title: t({
      en: "{count} Suspended User(s)",
      es: "{count} Usuario(s) Suspendido(s)",
    }),
    recent_bookings_title: t({
      en: "Recent Bookings",
      es: "Reservas Recientes",
    }),
    recent_reviews_title: t({
      en: "Recent Reviews",
      es: "Reseñas Recientes",
    }),
    users_by_role_title: t({
      en: "Users by Role",
      es: "Usuarios por Rol",
    }),
    bookings_by_status_title: t({
      en: "Bookings by Status",
      es: "Reservas por Estado",
    }),
    review_metrics_title: t({
      en: "Review Metrics",
      es: "Métricas de Reseñas",
    }),
    total_reviews_label: t({
      en: "Total Reviews",
      es: "Total de Reseñas",
    }),
    average_rating_label: t({
      en: "Average Rating",
      es: "Calificación Promedio",
    }),
    platform_overview: t({
      en: "Platform Overview",
      es: "Resumen de la Plataforma",
    }),
    platform_overview_desc: t({
      en: "Monitor key metrics and manage your platform",
      es: "Monitorea métricas clave y gestiona tu plataforma",
    }),
    total_users: t({
      en: "Total Users",
      es: "Total de Usuarios",
    }),
    in_last_30_days: t({
      en: "in last 30 days",
      es: "en los últimos 30 días",
    }),
    instructors: t({
      en: "Instructors",
      es: "Instructores",
    }),
    pending_verification: t({
      en: "pending verification",
      es: "pendiente de verificación",
    }),
    bookings: t({
      en: "Bookings",
      es: "Reservas",
    }),
    revenue: t({
      en: "Revenue",
      es: "Ingresos",
    }),
    reviews_submitted: t({
      en: "reviews submitted",
      es: "reseñas enviadas",
    }),
    instructors_pending_verification: t({
      en: "Instructor(s) Pending Verification",
      es: "Instructor(es) Pendiente(s) de Verificación",
    }),
    registered: t({
      en: "Registered",
      es: "Registrado",
    }),
    suspended_users: t({
      en: "Suspended User(s)",
      es: "Usuario(s) Suspendido(s)",
    }),
    recent_bookings: t({
      en: "Recent Bookings",
      es: "Reservas Recientes",
    }),
    recent_reviews: t({
      en: "Recent Reviews",
      es: "Reseñas Recientes",
    }),
    users_by_role: t({
      en: "Users by Role",
      es: "Usuarios por Rol",
    }),
    bookings_by_status: t({
      en: "Bookings by Status",
      es: "Reservas por Estado",
    }),
    review_metrics: t({
      en: "Review Metrics",
      es: "Métricas de Reseñas",
    }),
    total_reviews: t({
      en: "Total Reviews",
      es: "Total de Reseñas",
    }),
    average_rating: t({
      en: "Average Rating",
      es: "Calificación Promedio",
    }),
    no_role: t({
      en: "No role",
      es: "Sin rol",
    }),
    account_status: t({
      en: "Account Status",
      es: "Estado de la Cuenta",
    }),
    all_roles: t({
      en: "All Roles",
      es: "Todos los Roles",
    }),
    all_statuses: t({
      en: "All Statuses",
      es: "Todos los Estados",
    }),
    booking_management: t({
      en: "Booking Management",
      es: "Gestión de Reservas",
    }),
    booking_management_desc: t({
      en: "View and manage all platform bookings",
      es: "Ver y gestionar todas las reservas de la plataforma",
    }),
    filters: t({
      en: "Filters",
      es: "Filtros",
    }),
    instructor_management: t({
      en: "Instructor Management",
      es: "Gestión de Instructores",
    }),
    instructor_management_desc: t({
      en: "Manage and verify instructor accounts",
      es: "Gestionar y verificar cuentas de instructores",
    }),
    no_image: t({
      en: "No image",
      es: "Sin imagen",
    }),
    page_of: t({
      en: "Page {page} of {totalPages}",
      es: "Página {page} de {totalPages}",
    }),
    resort_management: t({
      en: "Resort Management",
      es: "Gestión de Estaciones",
    }),
    resort_management_desc: t({
      en: "View and manage ski resorts",
      es: "Ver y gestionar estaciones de esquí",
    }),
    review_management: t({
      en: "Review Management",
      es: "Gestión de Reseñas",
    }),
    review_management_desc: t({
      en: "View and moderate platform reviews",
      es: "Ver y moderar reseñas de la plataforma",
    }),
    search_client_placeholder: t({
      en: "Search client name or email...",
      es: "Buscar nombre o email del cliente...",
    }),
    search_name_email: t({
      en: "Search name or email...",
      es: "Buscar nombre o email...",
    }),
    set: t({
      en: "Set",
      es: "Establecido",
    }),
    showing_of: t({
      en: "Showing {count} of {total}",
      es: "Mostrando {count} de {total}",
    }),
    user_management: t({
      en: "User Management",
      es: "Gestión de Usuarios",
    }),
    user_management_desc: t({
      en: "Manage all platform users",
      es: "Gestionar todos los usuarios de la plataforma",
    }),
    users: t({
      en: "Users",
      es: "Usuarios",
    }),
    verification_status: t({
      en: "Verification Status",
      es: "Estado de Verificación",
    }),
    bookings_page_title: t({
      en: "Booking Management",
      es: "Gestión de Reservas",
    }),
    bookings_page_subtitle: t({
      en: "View and manage all platform bookings",
      es: "Ver y gestionar todas las reservas de la plataforma",
    }),
    showing_of_total: t({
      en: "Showing {shown} of {total} bookings",
      es: "Mostrando {shown} de {total} reservas",
    }),
    instructors_page_title: t({
      en: "Instructor Management",
      es: "Gestión de Instructores",
    }),
    instructors_page_subtitle: t({
      en: "Manage and verify instructor accounts",
      es: "Gestionar y verificar cuentas de instructores",
    }),
    showing_of_total_instructors: t({
      en: "Showing {shown} of {total} instructors",
      es: "Mostrando {shown} de {total} instructores",
    }),
    users_page_title: t({
      en: "User Management",
      es: "Gestión de Usuarios",
    }),
    users_page_subtitle: t({
      en: "Manage all platform users",
      es: "Gestionar todos los usuarios de la plataforma",
    }),
    showing_of_total_users: t({
      en: "Showing {shown} of {total} users",
      es: "Mostrando {shown} de {total} usuarios",
    }),
    resorts_page_title: t({
      en: "Resort Management",
      es: "Gestión de Estaciones",
    }),
    resorts_page_subtitle: t({
      en: "View and manage ski resorts ({count} total)",
      es: "Ver y gestionar estaciones de esquí ({count} total)",
    }),
    sports_page_subtitle: t({
      en: "View platform sports and instructor distribution",
      es: "Ver deportes de la plataforma y distribución de instructores",
    }),
    basic_information_title: t({
      en: "Basic Information",
      es: "Información Básica",
    }),
    certification_title: t({
      en: "Certification",
      es: "Certificación",
    }),
    sidebar_overview: t({
      en: "Overview",
      es: "Resumen",
    }),
    sidebar_instructors: t({
      en: "Instructors",
      es: "Instructores",
    }),
    sidebar_bookings: t({
      en: "Bookings",
      es: "Reservas",
    }),
    sidebar_users: t({
      en: "Users",
      es: "Usuarios",
    }),
    sidebar_reviews: t({
      en: "Reviews",
      es: "Reseñas",
    }),
    sidebar_resorts: t({
      en: "Resorts",
      es: "Estaciones",
    }),
    sidebar_sports: t({
      en: "Sports",
      es: "Deportes",
    }),
    sidebar_launch_codes: t({
      en: "Launch Codes",
      es: "Códigos de Lanzamiento",
    }),
    sidebar_payments: t({
      en: "Payments",
      es: "Pagos",
    }),
    panel: t({
      en: "Admin Panel",
      es: "Panel de Admin",
    }),
    dashboard: t({
      en: "Admin Dashboard",
      es: "Panel de Administración",
    }),
    back_to_dashboard: t({
      en: "Back to Dashboard",
      es: "Volver al Dashboard",
    }),
    basic_information: t({
      en: "Basic Information",
      es: "Información Básica",
    }),
    not_provided: t({
      en: "Not provided",
      es: "No proporcionado",
    }),
    no_bio: t({
      en: "No bio provided",
      es: "Sin biografía",
    }),
    certification: t({
      en: "Certification",
      es: "Certificación",
    }),
    certification_uploaded: t({
      en: "Certification document uploaded",
      es: "Documento de certificación subido",
    }),
    no_certification: t({
      en: "No certification uploaded",
      es: "Sin certificación subida",
    }),
    no_resorts: t({
      en: "No resorts assigned",
      es: "Sin estaciones asignadas",
    }),
    no_sports: t({
      en: "No sports assigned",
      es: "Sin deportes asignados",
    }),
    suspension_details: t({
      en: "Suspension Details",
      es: "Detalles de Suspensión",
    }),
    reason: t({
      en: "Reason",
      es: "Motivo",
    }),
    suspended_at: t({
      en: "Suspended at",
      es: "Suspendido el",
    }),
    booking_history: t({
      en: "Booking History",
      es: "Historial de Reservas",
    }),
    no_bookings: t({
      en: "No bookings found",
      es: "No se encontraron reservas",
    }),
    reviews: t({
      en: "Reviews",
      es: "Reseñas",
    }),
    no_comment: t({
      en: "No comment provided",
      es: "Sin comentario",
    }),
    by: t({
      en: "by",
      es: "por",
    }),
    no_reviews: t({
      en: "No reviews yet",
      es: "Sin reseñas aún",
    }),
    actions_history: t({
      en: "Actions History",
      es: "Historial de Acciones",
    }),
    system: t({
      en: "System",
      es: "Sistema",
    }),
    no_actions: t({
      en: "No actions recorded",
      es: "Sin acciones registradas",
    }),
    suspend_instructor: t({
      en: "Suspend Instructor",
      es: "Suspender Instructor",
    }),
    suspend_description: t({
      en: "This will prevent the instructor from receiving new bookings.",
      es: "Esto impedirá que el instructor reciba nuevas reservas.",
    }),
    reason_placeholder: t({
      en: "Enter reason for suspension...",
      es: "Ingresa el motivo de la suspensión...",
    }),
    reject_verification: t({
      en: "Reject Verification",
      es: "Rechazar Verificación",
    }),
    reject_description: t({
      en: "Provide a reason for rejecting this instructor's verification.",
      es: "Proporciona un motivo para rechazar la verificación de este instructor.",
    }),
    rejection_reason_placeholder: t({
      en: "Enter reason for rejection...",
      es: "Ingresa el motivo del rechazo...",
    }),
    sport_management: t({
      en: "Sport Management",
      es: "Gestión de Deportes",
    }),
    sport_management_desc: t({
      en: "View platform sports and instructor distribution",
      es: "Ver deportes de la plataforma y distribución de instructores",
    }),
    instructors_teaching: t({
      en: "Instructors Teaching",
      es: "Instructores Enseñando",
    }),
    payment_overview: t({
      en: "Payment Overview",
      es: "Resumen de Pagos",
    }),
    payment_overview_desc: t({
      en: "Monitor platform payments and revenue",
      es: "Monitorear pagos e ingresos de la plataforma",
    }),
    total_revenue: t({
      en: "Total Revenue",
      es: "Ingresos Totales",
    }),
    transactions: t({
      en: "transactions",
      es: "transacciones",
    }),
    client_deposits: t({
      en: "Client Deposits",
      es: "Depósitos de Clientes",
    }),
    deposits: t({
      en: "deposits",
      es: "depósitos",
    }),
    lead_payments: t({
      en: "Lead Payments",
      es: "Pagos por Leads",
    }),
    instructor_payments: t({
      en: "instructor payments",
      es: "pagos de instructores",
    }),
    recent_client_deposits: t({
      en: "Recent Client Deposits",
      es: "Depósitos Recientes de Clientes",
    }),
    stripe_id: t({
      en: "Stripe ID",
      es: "ID de Stripe",
    }),
    recent_lead_payments: t({
      en: "Recent Lead Payments",
      es: "Pagos Recientes por Leads",
    }),
    launch_codes_title: t({
      en: "Launch Codes Management",
      es: "Gestión de Códigos de Lanzamiento",
    }),
    launch_codes_desc: t({
      en: "Create and manage promotional launch codes",
      es: "Crear y gestionar códigos promocionales de lanzamiento",
    }),
    create_launch_code: t({
      en: "Create Launch Code",
      es: "Crear Código de Lanzamiento",
    }),
    create_launch_code_desc: t({
      en: "Create a new promotional code for users",
      es: "Crear un nuevo código promocional para usuarios",
    }),
    edit_launch_code: t({
      en: "Edit Launch Code",
      es: "Editar Código de Lanzamiento",
    }),
    edit_launch_code_desc: t({
      en: "Update launch code details",
      es: "Actualizar detalles del código de lanzamiento",
    }),
    back_to_launch_codes: t({
      en: "Back to Launch Codes",
      es: "Volver a Códigos de Lanzamiento",
    }),
    all_launch_codes: t({
      en: "All Launch Codes",
      es: "Todos los Códigos de Lanzamiento",
    }),
    no_launch_codes: t({
      en: "No launch codes created yet",
      es: "No hay códigos de lanzamiento creados aún",
    }),
    code_details: t({
      en: "Code Details",
      es: "Detalles del Código",
    }),
    code_help: t({
      en: "Only letters and numbers allowed. Will be converted to uppercase.",
      es: "Solo se permiten letras y números. Se convertirá a mayúsculas.",
    }),
    description_placeholder: t({
      en: "e.g., Beta launch access code for early adopters",
      es: "ej., Código de acceso para beta launch de early adopters",
    }),
    valid_until_help: t({
      en: "Code will not work after this date and time",
      es: "El código no funcionará después de esta fecha y hora",
    }),
    unlimited: t({
      en: "Unlimited",
      es: "Ilimitado",
    }),
    max_uses_help: t({
      en: "Leave empty for unlimited uses",
      es: "Dejar vacío para usos ilimitados",
    }),
    activate_immediately: t({
      en: "Activate immediately",
      es: "Activar inmediatamente",
    }),
    create_code: t({
      en: "Create Code",
      es: "Crear Código",
    }),
    no_description: t({
      en: "No description",
      es: "Sin descripción",
    }),
    total_uses: t({
      en: "total uses",
      es: "usos totales",
    }),
    bookings_lowercase: t({
      en: "bookings",
      es: "reservas",
    }),
    leads_lowercase: t({
      en: "leads",
      es: "leads",
    }),
    total_codes: t({
      en: "Total Codes",
      es: "Total de Códigos",
    }),
    total_code_uses: t({
      en: "Total Code Uses",
      es: "Usos Totales de Códigos",
    }),
    across_all_codes: t({
      en: "Across all codes",
      es: "A través de todos los códigos",
    }),
    expired_codes: t({
      en: "Expired Codes",
      es: "Códigos Expirados",
    }),
    need_renewal: t({
      en: "Need renewal",
      es: "Necesitan renovación",
    }),
    confirm_delete_code: t({
      en: "Are you sure you want to delete this code? This action cannot be undone.",
      es: "¿Estás seguro de que quieres eliminar este código? Esta acción no se puede deshacer.",
    }),
    current_uses: t({
      en: "Current uses",
      es: "Usos actuales",
    }),
    code_active: t({
      en: "Code is active",
      es: "El código está activo",
    }),
    create_resort: t({
      en: "Create Resort",
      es: "Crear Estación",
    }),
    search_resorts: t({
      en: "Search resorts by name or slug...",
      es: "Buscar estaciones por nombre o slug...",
    }),
    filter_country: t({
      en: "Filter by country",
      es: "Filtrar por país",
    }),
    all_countries: t({
      en: "All Countries",
      es: "Todos los Países",
    }),
    filter_region: t({
      en: "Filter by region",
      es: "Filtrar por región",
    }),
    all_regions: t({
      en: "All Regions",
      es: "Todas las Regiones",
    }),
    no_resorts_found: t({
      en: "No resorts found",
      es: "No se encontraron estaciones",
    }),
    showing_results: t({
      en: "Showing {start}-{end} of {total} results",
      es: "Mostrando {start}-{end} de {total} resultados",
    }),
    back_to_resorts: t({
      en: "Back to Resorts",
      es: "Volver a Estaciones",
    }),
    create_resort_desc: t({
      en: "Add a new ski resort to the platform",
      es: "Añadir una nueva estación de esquí a la plataforma",
    }),
    resort_details: t({
      en: "Resort Details",
      es: "Detalles de la Estación",
    }),
    select_country: t({
      en: "Select a country",
      es: "Selecciona un país",
    }),
    select_region: t({
      en: "Select a region",
      es: "Selecciona una región",
    }),
    no_region: t({
      en: "No Region",
      es: "Sin Región",
    }),
    edit_resort: t({
      en: "Edit Resort",
      es: "Editar Estación",
    }),
    edit_resort_desc: t({
      en: "Update resort information and images",
      es: "Actualizar información e imágenes de la estación",
    }),
    resort_image: t({
      en: "Resort Image",
      es: "Imagen de la Estación",
    }),
    current_image: t({
      en: "Current Image",
      es: "Imagen Actual",
    }),
    preview: t({
      en: "Preview",
      es: "Vista Previa",
    }),
    upload_new_image: t({
      en: "Upload New Image",
      es: "Subir Nueva Imagen",
    }),
    image_guidelines: t({
      en: "Recommended: 1200x800px or larger. Max 10MB. JPG, PNG, or WebP.",
      es: "Recomendado: 1200x800px o mayor. Máx 10MB. JPG, PNG o WebP.",
    }),
    danger_zone: t({
      en: "Danger Zone",
      es: "Zona de Peligro",
    }),
    delete_resort_warning: t({
      en: "Deleting a resort is permanent and will remove it from all instructor profiles. This action cannot be undone.",
      es: "Eliminar una estación es permanente y la eliminará de todos los perfiles de instructores. Esta acción no se puede deshacer.",
    }),
    confirm_delete_resort: t({
      en: "Are you sure?",
      es: "¿Estás seguro?",
    }),
    delete_resort_confirmation: t({
      en: "This will permanently delete {name} and all associated data. This action cannot be undone.",
      es: "Esto eliminará permanentemente {name} y todos los datos asociados. Esta acción no se puede deshacer.",
    }),
    back_to_sports: t({
      en: "Back to Sports",
      es: "Volver a Deportes",
    }),
    create_sport: t({
      en: "Create Sport",
      es: "Crear Deporte",
    }),
    create_sport_desc: t({
      en: "Add a new sport to the platform",
      es: "Añadir un nuevo deporte a la plataforma",
    }),
    sport_details: t({
      en: "Sport Details",
      es: "Detalles del Deporte",
    }),
    edit_sport: t({
      en: "Edit Sport",
      es: "Editar Deporte",
    }),
    edit_sport_desc: t({
      en: "Update sport information",
      es: "Actualizar información del deporte",
    }),
    delete_sport_warning: t({
      en: "Deleting a sport will remove it from all instructor profiles. This action cannot be undone.",
      es: "Eliminar un deporte lo eliminará de todos los perfiles de instructores. Esta acción no se puede deshacer.",
    }),
    confirm_delete_sport: t({
      en: "Are you sure?",
      es: "¿Estás seguro?",
    }),
    delete_sport_confirmation: t({
      en: "This will permanently delete {name}. This action cannot be undone.",
      es: "Esto eliminará permanentemente {name}. Esta acción no se puede deshacer.",
    }),
    no_sports_found: t({
      en: "No sports found",
      es: "No se encontraron deportes",
    }),
  },
} satisfies Dictionary;

export default adminContent;
