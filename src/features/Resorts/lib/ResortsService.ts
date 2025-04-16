import { ResortRepository } from "./ResortsRepository";


export class ResortService {
    private resortRepository: ResortRepository;
    
        constructor() {
            this.resortRepository = new ResortRepository();
        }

	async getSuggestions(q: string) {
		return await this.resortRepository.searchByName(q);
	}
}