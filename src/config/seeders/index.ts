import { seedRBAC } from "./rbac.seeder";
import { seedAdminUser } from "./adminUser.seeder";
import { verifyExistingUsers } from "./verifyExistingUsers.seeder";

export async function runAllSeeders() {
    console.log("Starting seeders...\n");

    try {

        await seedRBAC();

        await seedAdminUser();

        await verifyExistingUsers();

        console.log("All seeders completed successfully!\n");
    } catch (error) {
        console.error("Seeder failed:", error);
        throw error;
    }
}

export { seedRBAC, seedAdminUser, verifyExistingUsers };
