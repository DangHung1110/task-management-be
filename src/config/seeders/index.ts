import { seedRBAC } from "./rbac.seeder";
import { seedAdminUser } from "./adminUser.seeder";

export async function runAllSeeders() {
    console.log("Starting seeders...\n");

    try {

        await seedRBAC();

        await seedAdminUser();

        console.log("All seeders completed successfully!\n");
    } catch (error) {
        console.error("Seeder failed:", error);
        throw error;
    }
}

export { seedRBAC, seedAdminUser };
