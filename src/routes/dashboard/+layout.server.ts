import { requireAuth } from "$src/lib/utils/auth"
import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => {

    const user = requireAuth(event, 'Login to access the Dashboard')
    if (!user.user.role) redirect(302, '/dashboard/choose-role')
    return { user }
}