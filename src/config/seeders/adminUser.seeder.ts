import { AppDataSource } from "../db.config";
import { User } from "../../entities/User/user";
import { Account } from "../../entities/User/account";
import { UserRole } from "../../entities/Role/userRole";
import { Role } from "../../entities/Role/role";
import bcrypt from "bcryptjs";

export async function seedAdminUser() {
    const userRepo = AppDataSource.getRepository(User);
    const accountRepo = AppDataSource.getRepository(Account);
    const roleRepo = AppDataSource.getRepository(Role);
    const userRoleRepo = AppDataSource.getRepository(UserRole);

    console.log(" Seeding admin user...");

    try {
        const existingAdmin = await userRepo.findOne({ 
            where: { email: "admin@example.com" } 
        });

        if (existingAdmin) {
            console.log(" Admin user already exists\n");
            return existingAdmin;
        }

        const user = await userRepo.save({
            email: "admin@example.com",
            name: "Admin User",
            isActive: true,
            isVerified: true
        });
        console.log(" Created admin user");

        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        await accountRepo.save({
            user: user,
            username: user.email,
            passwordHash: hashedPassword
        });
        console.log("Created admin account");

        const adminRole = await roleRepo.findOne({ 
            where: { name: "admin" } 
        });

        if (!adminRole) {
            throw new Error("Admin role not found. Please run RBAC seeder first.");
        }

        await userRoleRepo.save({
            userId: user.id,
            roleId: adminRole.id
        });
        console.log("Assigned admin role");
        console.log("Admin user created successfully");
        console.log("Email: admin@example.com");
        console.log("Password: Admin@123\n");

        return user;
    } catch (error) {
        console.error("Error seeding admin user:", error);
        throw error;
    }
}
