import { type InsertUser, type User } from "$src/lib/server/db/schema";
import { UserRepository } from "$src/features/Users/lib/UserRepository";
import type { UserGoogleData, UserSignupData } from "./validations/userSchemas";
import { hashPassword } from "$src/lib/utils/auth";

//Possibility of leveraging dependency Injection for db and contracts switching.
export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUserWithPassword(userData: UserSignupData): Promise<User> {

        if (userData.password) {
            const hash = await hashPassword(userData.password);
            delete userData.password;
            userData.passwordHash = hash
        }

        

        console.log('User data after processing: ', userData )
        
        const user = await this.userRepository.createUser(userData); 
        console.log('New User created with Data: ', user)
        return user
    }

    async createUserWithGoogle(userData: UserGoogleData): Promise<User> {
        console.log('User data after processing: ', userData )
        
        const user = await this.userRepository.createUser(userData); 
        console.log('New User created with Data: ', user)
        return user
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
