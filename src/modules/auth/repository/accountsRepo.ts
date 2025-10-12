import { DataSource } from "typeorm";
import { Account } from "../../../entities";

export class AccountRepository {
    private repo;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(Account);
    }

    findByUsername(username: string) {
        return this.repo.findOne({ where: { username }, relations: ["user"] });
    }

    createAndSave(data: Partial<Account>) {
        const account = this.repo.create(data);
        return this.repo.save(account);
    }

    updatePassword(id: string, passwordHash: string) {
        return this.repo.update({ id }, { passwordHash });
    }
}
