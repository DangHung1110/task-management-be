import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Account, AccountProvider, Token, Otp } from "../entities/User";
import { Role, UserRole, Permission } from "../entities/Role";
import { WorkSpaces, WorkspaceMembers, WorkspaceInvitation } from "../entities/Workspaces";
import { Board, BoardMember } from "../entities/Boards";
import { List } from "../entities/Lists";
import { Card, CardMember } from "../entities/Cards";
import { Label } from "../entities/Labels";
import { Checklist, ChecklistItem } from "../entities/Checklists";
import { Comment } from "../entities/Comments";
import { Attachment } from "../entities/Attachments";
import { Activity } from "../entities/Activities";
import { Notification } from "../entities/Notifications";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  synchronize: true, 
  logging: true,
  entities: [
    User,
    Account,
    AccountProvider,
    Token,
    Otp,
    Role,
    UserRole,
    Permission,
    WorkSpaces,
    WorkspaceMembers,
    WorkspaceInvitation,
    Board,
    BoardMember,
    List,
    Card,
    CardMember,
    Label,
    Checklist,
    ChecklistItem,
    Comment,
    Attachment,
    Activity,
    Notification,
  ],
  migrations: [
    "src/migrations/**/*.ts",
    "dist/migrations/**/*.js"
  ],
  subscribers: [
    "src/subscribers/**/*.ts",
    "dist/subscribers/**/*.js"
  ],
});
