import { ResortRepository } from "./ResortsRepository";


export class ResortService {
    private resortRepository: ResortRepository;

        constructor() {
            this.resortRepository = new ResortRepository();
        }

	/**
	 * Get resort suggestions based on search query
	 * @param q - Search query string
	 * @param countryId - Optional country ID to filter results
	 * @returns Array of matching resorts
	 */
	async getSuggestions(q: string, countryId?: number) {
		return await this.resortRepository.searchByName(q, 10, countryId);
	}
}