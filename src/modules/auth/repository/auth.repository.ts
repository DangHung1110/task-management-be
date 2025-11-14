import { DataSource } from "typeorm";
import { User, Account } from "../../../entities";
import { UserRepo } from "../../user/repository";
import { AccountsRepository } from ".";

export class AuthRepository {
    private userRepo: UserRepo;
    private accountRepo: AccountsRepository;

    constructor(ds: DataSource) {
        this.userRepo = new UserRepo(ds);
        this.accountRepo = new AccountsRepository();
    }

    async findByEmail(email: string) {
        return this.userRepo.findByEmail(email);
    }

    async findById(userId: string) {
        return this.userRepo.findById(userId);
    }

    async findAccountByUsername(username: string) {
        return this.accountRepo.findByUsername(username);
    }

    async createUserWithAccount(userData: { name: string; email: string; isVerified?: boolean }, accountData: { username: string; passwordHash: string }) {
        const user = await this.userRepo.createAndSave(userData);
        
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
        return null;
    }
}
