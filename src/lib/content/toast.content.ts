import { t, type Dictionary } from "intlayer";

const toastContent = {
  key: "toast",
  content: {
    instructor_profile_updated: t({
      en: "Instructor profile updated successfully",
      es: "Perfil de instructor actualizado correctamente",
    }),
    instructor_profile_error: t({
      en: "Error updating instructor profile",
      es: "Error al actualizar el perfil de instructor",
    }),
  },
} satisfies Dictionary;

export default toastContent;
