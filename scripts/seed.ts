import "reflect-metadata";
import { AppDataSource } from "../src/config";
import { runAllSeeders, seedRBAC, seedAdminUser } from "../src/config/seeders";

const runSeeder = async () => {
    try {
        console.log("Connecting to database...");
        await AppDataSource.initialize();
        console.log("Database connected\n");

        const command = process.argv[2];

        switch (command) {
            case "rbac":
                await seedRBAC();
                break;
            case "admin":
                await seedAdminUser();
                break;
            default:
                await runAllSeeders();
        }

        await AppDataSource.destroy();
        console.log(" Database connection closed");
        process.exit(0);
    } catch (error) {
        console.error(" Seeder error:", error);
        await AppDataSource.destroy();
        process.exit(1);
    }
};

runSeeder();
