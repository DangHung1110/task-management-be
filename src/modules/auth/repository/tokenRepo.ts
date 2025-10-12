import { DataSource } from "typeorm";
import { Token } from "../../../entities";

export class TokenRepository {
    private repo;

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(Token);
    }

    createAndSave(data: Partial<Token>) {
        const token = this.repo.create(data);
        return this.repo.save(token);
    }

    findByToken(refreshToken: string) {
        return this.repo.findOne({ where: { refreshToken }, relations: ["user"] });
    }

    deleteByToken(refreshToken: string) {
        return this.repo.delete({ refreshToken });
    }

    deleteAllByUser(userId: string) {
        return this.repo.delete({ user: { id: userId } });
    }
}
