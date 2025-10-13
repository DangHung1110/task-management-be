import { UserRepo } from "../../modules/user/repository";
import { AppDataSource } from "../../config/db.config";
import { PaginationDto } from "../../common";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";

describe(" Test User Repository", () => {
    let userRepo: UserRepo;
    
    beforeAll( async () =>{
        await AppDataSource.initialize();
        userRepo = new UserRepo(AppDataSource);
    })

    afterAll( async () =>{
        await AppDataSource.destroy();
    })

    it("shoud fecth users with pagination", async() => {
        const pagniation: PaginationDto = { page: 1, limit: 10, search: "" };
        const result = await userRepo.findUsers(pagniation);

        expect(result).toHaveProperty("users")
        expect(Array.isArray(result.users)).toBe(true);
        expect(result.pagination).toHaveProperty("page");
        expect(result.pagination).toHaveProperty("limit");
        expect(result.pagination).toHaveProperty("search");
    })

    it("should fetch users filtered by search term", async () => {
        const pagniation: PaginationDto = { page: 1, limit: 10, search: "danghung" };
        const result = await userRepo.findUsers(pagniation);

        expect(result.users.some(u => u.name.includes("Thanh Bình"))).toBe(true);
    })
})