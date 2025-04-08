import { requireAuth } from "$src/lib/utils/auth"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {

   const user = requireAuth(event, 'Login to access the Dashboard')
    
    return { user }
}