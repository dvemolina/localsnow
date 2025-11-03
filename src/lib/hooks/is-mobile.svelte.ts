import { MediaQuery } from "svelte/reactivity";
import { readable } from "svelte/store";

const MOBILE_BREAKPOINT = 768;

export class IsMobile extends MediaQuery {
	constructor() {
		super(`max-width: ${MOBILE_BREAKPOINT - 1}px`);
	}
}


export const isMobile = readable(false, (set) => {
	if (typeof window === 'undefined') return;

	const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

	// Set the initial value
	set(media.matches);

	// Listen for changes
	const update = () => set(media.matches);
	media.addEventListener('change', update);

	// Cleanup
	return () => media.removeEventListener('change', update);
});
