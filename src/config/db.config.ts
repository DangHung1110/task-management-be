import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, Account, AccountProvider, Token } from "../entities/User";
import { Role, UserRole } from "../entities/Role";
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
    Role,
    UserRole
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
