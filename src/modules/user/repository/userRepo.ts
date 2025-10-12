import { DataSource, Repository, UpdateResult, DeleteResult } from "typeorm";
import { User } from "../../../entities";
import { paginationUtils } from "../../../common";
import { PaginationDto } from "../../../common";

export class UserRepo {
    private repo: Repository<User>;
    private pagination = new paginationUtils();

    constructor(ds: DataSource) {
        this.repo = ds.getRepository(User);
    }

    async findById(id: string, withRelations: boolean = false): Promise<User | null> {
        if (withRelations) {
            return this.repo.findOne({
                where: { id },
                relations: ["accounts", "accountProviders", "roles", "tokens"]
            });
        }
        return this.repo.findOne({ where: { id } });
    }

    async findByEmail(email: string, withRelations: boolean = false): Promise<User | null> {
        if (withRelations) {
            return this.repo.findOne({
                where: { email },
                relations: ["accounts", "accountProviders", "roles", "tokens"]
            });
        }
        return this.repo.findOne({ where: { email } });
    }

    async findUsers(pagination: PaginationDto): Promise<{
        users: User[];
        pagination: PaginationDto;
    }> {
        const { skip, take } = this.pagination.extractTakeSkip(pagination);
        const query = this.repo.createQueryBuilder("user")
            .leftJoinAndSelect("user.roles", "userRoles")
            .leftJoinAndSelect("userRoles.role", "role")
            .skip(skip)
            .take(take)
            .orderBy("user.createdAt", "DESC");

        if (pagination.search) {
            query.andWhere(
                "user.name ILIKE :search OR user.email ILIKE :search",
                { search: `%${pagination.search}%` }
            );
        }

        const [users, total] = await query.getManyAndCount();
        const paginationInfo = this.pagination.convertToPaginationDto(total);

        return { users, pagination: paginationInfo };
    }

    async createAndSave(data: Partial<User>): Promise<User> {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }

    async update(id: string, patch: Partial<User>): Promise<User | null> {
        await this.repo.update({ id }, patch);
        return this.findById(id);
    }

    async delete(id: string, soft: boolean = true): Promise<DeleteResult | UpdateResult> {
        if (soft) {
            return this.repo.update({ id }, { isActive: false });
        }
        return this.repo.delete({ id });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.repo.count({ where: { email } });
        return count > 0;
    }

    async existsById(id: string): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
        return count > 0;
    }

    async findByIdWithRoles(id: string): Promise<User | null> {
        return this.repo.findOne({
            where: { id },
            relations: ["roles", "roles.role"]
        });
    }

    async findByIdWithAccounts(id: string): Promise<User | null> {
        return this.repo.findOne({
            where: { id },
            relations: ["accounts"]
        });
    }
}