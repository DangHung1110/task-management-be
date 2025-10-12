import { DataSource } from "typeorm";
import { AccountProvider, ProviderType } from "../../../entities";

export class AccountProviderRepository {
    private repo;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(AccountProvider);
    }

    findByProviderId(provider: ProviderType, providerId: string) {
        return this.repo.findOne({ where: { provider, providerId }, relations: ["user"] });
    }

    createAndSave(data: Partial<AccountProvider>) {
        const provider = this.repo.create(data);
        return this.repo.save(provider);
    }

    updateTokens(id: string, accessToken?: string, refreshToken?: string) {
        return this.repo.update({ id }, { accessToken, refreshToken });
    }

    unlink(id: string) {
        return this.repo.delete({ id });
    }
}
