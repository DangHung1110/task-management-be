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

    console.log("👤 Seeding system admin user...");

    try {
        // Get admin credentials from environment variables
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
        const adminName = process.env.ADMIN_NAME || "System Administrator";

        const existingAdmin = await userRepo.findOne({ 
            where: { email: adminEmail } 
        });

        if (existingAdmin) {
            console.log("   • Admin user already exists");
            console.log(`   • Email: ${adminEmail}\n`);
            return existingAdmin;
        }

        // Create admin user
        const user = await userRepo.save({
            email: adminEmail,
            name: adminName,
            isActive: true,
            isVerified: true
        });
        console.log("   ✓ Created admin user");

        // Create admin account with hashed password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        await accountRepo.save({
            user: user,
            username: user.email,
            passwordHash: hashedPassword
        });
        console.log("   ✓ Created admin account");

        // Assign admin role
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
        console.log("   ✓ Assigned system admin role");
        console.log("\n✅ System admin created successfully:");
        console.log(`   📧 Email: ${adminEmail}`);
        console.log(`   🔑 Password: ${adminPassword}`);
        console.log(`   ⚠️  Please change the password after first login!\n`);

        return user;
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
        throw error;
    }
}
