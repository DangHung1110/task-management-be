import { Repository } from "typeorm";
import { AppDataSource } from "../../../config";
import { Account, User } from "../../../entities";

export class AccountsRepository extends Repository<Account> {
  constructor() {
    super(Account, AppDataSource.createEntityManager());
  }

  async findByUsername(username: string): Promise<Account | null> {
    return await this.findOne({ 
      where: { username },
      relations: ['user']
    });
  }

  async findByUserId(userId: string): Promise<Account | null> {
    return await this.findOne({ 
      where: { user: { id: userId } },
      relations: ['user']
    });
  }

  async createAndSave(accountData: {
    user: User;
    username: string;
    passwordHash: string;
  }): Promise<Account> {
    const account = this.create({
      user: accountData.user,
      username: accountData.username,
      passwordHash: accountData.passwordHash,
    });
    return await this.save(account);
  }
}
