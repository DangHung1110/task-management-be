import { DataSource } from "typeorm";
import { User, Account } from "../../entities";
import { UserRepo } from "../user/repository";
import { AccountRepository } from "./repository";

export class AuthRepository {
    private userRepo: UserRepo;
    private accountRepo: AccountRepository;

    constructor(ds: DataSource) {
        this.userRepo = new UserRepo(ds);
        this.accountRepo = new AccountRepository(ds);
    }

    async findByEmail(email: string) {
        return this.userRepo.findByEmail(email);
    }

    async findAccountByUsername(username: string) {
        return this.accountRepo.findByUsername(username);
    }

    async createUserWithAccount(userData: { name: string; email: string }, accountData: { username: string; passwordHash: string }) {
        // Create user first
        const user = await this.userRepo.createAndSave(userData);
        
        // Create account linked to user
        await this.accountRepo.createAndSave({
            user,
            username: accountData.username,
            passwordHash: accountData.passwordHash
        });

        return user;
    }

    async save(user: User) {
        return this.userRepo.update(user.id, user);
    }

    async findByValidResetToken(token: string, currentDate: Date) {
        // This needs custom query - for now, return null
        // You can extend UserRepo to add this method
        return null;
    }
}
