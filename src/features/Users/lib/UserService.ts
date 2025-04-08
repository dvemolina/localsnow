import { type User } from "$src/lib/server/db/schema";
import { UserRepository } from "$src/features/Users/lib/UserRepository";

//Possibility of leveraging dependency Injection for db and contracts switching.
export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(userData: InsertUser): Promise<User> {
        return await this.userRepository.createUser(userData);
    }

    async getUserById(userId: number): Promise<User | null> {
        return await this.userRepository.getUserById(userId);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.getUserByEmail(email);
    }

    async getUserByGoogleId(googleId: string): Promise<User | null> {
        return await this.userRepository.getUserByEmail(googleId);
    }

    async updateUser(userId: number, updatedFields: Partial<InsertUser>): Promise<User | null> {
        return await this.userRepository.updateUser(userId, updatedFields);
    }
}
