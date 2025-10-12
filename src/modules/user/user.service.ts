import { UserRepo } from "./repository";
import { User } from "../../entities";
import { NotFoundException, InternalServerException } from "../../common";
import { 
  CreateUserDto, 
  CreateUserDtoType, 
  UpdateUserDto, 
  UpdateUserDtoType,
  GetUsersPaginationQueryDtoType,
  GetUsersResponseDto,
  GetUsersResponseDtoType,
  UserItemDto
} from "./dtos";


export class UserService {
    constructor(
        private readonly userRepo: UserRepo
    ) {}

    async getUsers(query: GetUsersPaginationQueryDtoType): Promise<GetUsersResponseDtoType> {
        const paginationInput = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 10,
            search: query.search,
            total: undefined 
        };

        const { users, pagination: paginationInfo } = await this.userRepo.findUsers(paginationInput);
        
        if (!users || users.length === 0) {
            throw new NotFoundException('Users not found');
        }

        const result = GetUsersResponseDto.parse({
            data: users,
            pagination: paginationInfo
        });

        return result;
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async createUser(data: CreateUserDtoType): Promise<User> {
        const validated = CreateUserDto.parse(data);
        const newUser = await this.userRepo.createAndSave(validated);
        return newUser;
    }

    async updateUser(id: string, data: UpdateUserDtoType): Promise<User> {
        const validated = UpdateUserDto.parse(data);
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const updatedUser = await this.userRepo.update(user.id, validated);
        if (!updatedUser) {
            throw new InternalServerException();
        }
        return updatedUser;
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepo.delete(id);
    }
}