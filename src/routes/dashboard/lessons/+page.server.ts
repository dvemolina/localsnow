import { superValidate } from "sveltekit-superforms";
import type { PageServerLoad } from "./$types";
import { zod } from "sveltekit-superforms/adapters";
import { redirect } from "@sveltejs/kit";
import { lessonSchema } from "$src/features/Lessons/lib/lessonSchema";

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
        if(!user) redirect(302, '/login')
        
        const lessonForm = await superValidate(zod(lessonSchema));
    
        return { lessonForm }

};