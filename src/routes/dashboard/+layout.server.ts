import { requireAuth } from "$src/lib/utils/auth"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => {

    const user = requireAuth(event, 'Login to access the Dashboard')
    return { user }
}