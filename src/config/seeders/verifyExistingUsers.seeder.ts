import { AppDataSource } from "../db.config";
import { User } from "../../entities/User/user";

export async function verifyExistingUsers() {
    const userRepo = AppDataSource.getRepository(User);
    
    console.log(" Verifying existing users...");
    
    try {
        const result = await userRepo.update(
            { isVerified: false },
            { isVerified: true }
        );
        
        console.log(`Verified ${result.affected || 0} existing user(s)\n`);
    } catch (error) {
        console.error("Failed to verify existing users:", error);
        throw error;
    }
}

