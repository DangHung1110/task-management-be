"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const config_1 = require("../src/config");
const seeders_1 = require("../src/config/seeders");
const runSeeder = async () => {
    try {
        console.log("Connecting to database...");
        await config_1.AppDataSource.initialize();
        console.log("Database connected\n");
        const command = process.argv[2];
        switch (command) {
            case "rbac":
                await (0, seeders_1.seedRBAC)();
                break;
            case "admin":
                await (0, seeders_1.seedAdminUser)();
                break;
            default:
                await (0, seeders_1.runAllSeeders)();
        }
        await config_1.AppDataSource.destroy();
        console.log(" Database connection closed");
        process.exit(0);
    }
    catch (error) {
        console.error(" Seeder error:", error);
        await config_1.AppDataSource.destroy();
        process.exit(1);
    }
};
runSeeder();
