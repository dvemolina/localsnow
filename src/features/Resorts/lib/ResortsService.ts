import { ResortRepository } from "./ResortsRepository";


export class ResortsService {
    private resortRepository: ResortRepository;

        constructor() {
            this.resortRepository = new ResortRepository();
        }

	async getSuggestions(q: string) {
		return await this.resortRepository.searchByName(q);
	}

	async getAllResorts() {
		return await this.resortRepository.getAllResorts();
	}

	async getResortBySlug(slug: string) {
		return await this.resortRepository.getResortBySlug(slug);
	}

	async getResortById(id: number) {
		return await this.resortRepository.getResortById(id);
	}
}