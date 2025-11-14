import { UserService } from "./user.service";
import { Request, Response } from "express";
import { NotFoundException } from "../../common";
import { 
  GetUsersPaginationQueryDto,
  GetUsersPaginationQueryDtoType,
  GetUsersResponseDtoType,
  GetUserResponseDtoType,
  CreateUserDtoType,
  CreateUserResponseDtoType,
  UpdateUserDtoType,
  UpdateUserResponseDtoType
} from "./dtos";
import { HttpResponseDto } from "../../common";

export class UserController {
    constructor(private readonly userService: UserService) {}
    
    async getUsers(req: Request, res: Response): Promise<Response> {
        const queryData = GetUsersPaginationQueryDto.parse(req.query);
        const result = await this.userService.getUsers(queryData);
        return new HttpResponseDto().success<GetUsersResponseDtoType>({ data: result });
    }

    async getUserById(req: Request): Promise<Response> {
        const user = await this.userService.getUserById(req.params.id);
        return new HttpResponseDto().success<GetUserResponseDtoType>({ data: user });
    }

    async createUser(req: Request): Promise<Response> {
        const userData: CreateUserDtoType = req.body;
        const newUser = await this.userService.createUser(userData);
        return new HttpResponseDto().created<CreateUserResponseDtoType>({ data: newUser });
    }

    async updateUser(req: Request): Promise<Response> {
        const userId = req.params.id;
        const userData: UpdateUserDtoType = req.body;
        const updatedUser = await this.userService.updateUser(userId, userData);
        return new HttpResponseDto().success<UpdateUserResponseDtoType>({ data: updatedUser });
    }

    async deleteUser(req: Request): Promise<Response> {
        const userId = req.params.id;
        await this.userService.deleteUser(userId);
        return new HttpResponseDto().success({ data: { message: "User deleted successfully" } });
    }
}