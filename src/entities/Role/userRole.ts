import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "../User";
import { Role } from "./role";

@Entity("user_roles")
export class UserRole {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, user => user.roles)
    user!: User;

    @ManyToOne(() => Role)
    role!: Role;
}
