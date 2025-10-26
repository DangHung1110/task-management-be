import { AppDataSource } from "../db.config";
import { Permission, Role } from "../../entities/Role";
export async function seedRBAC() {
    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);

    console.log("Seeding RBAC data...");

    try {
        // Only system-level role: admin
        // Note: Workspace/Board roles (owner, member) are managed in workspace_members and board_members tables
        const rolesData = [
            { 
                name: "admin", 
                description: "System administrator with full access to all resources" 
            }
        ];

        const roles: Record<string, Role> = {};
        
        for (const roleData of rolesData) {
            let role = await roleRepo.findOne({ 
                where: { name: roleData.name }
            });
            
            if (!role) {
                role = await roleRepo.save(roleData);
                console.log(`✓ Created role: ${roleData.name}`);
            } else {
                console.log(`  Role already exists: ${roleData.name}`);
            }
            
            roles[roleData.name] = role;
        }

        // System admin permissions - full access to all system resources
        // Note: Workspace/Board level permissions are checked via workspace_members/board_members tables
        const permissionsData = [
            // Users management
            { role: "admin", resource: "users", action: "create", description: "Create new user" },
            { role: "admin", resource: "users", action: "read", description: "View all users" },
            { role: "admin", resource: "users", action: "update", description: "Update any user" },
            { role: "admin", resource: "users", action: "delete", description: "Delete any user" },
            
            // Workspaces management (view all workspaces)
            { role: "admin", resource: "workspaces", action: "read", description: "View all workspaces" },
            { role: "admin", resource: "workspaces", action: "delete", description: "Delete any workspace" },
            
            // Boards management (view all boards)
            { role: "admin", resource: "boards", action: "read", description: "View all boards" },
            { role: "admin", resource: "boards", action: "delete", description: "Delete any board" },
            
            // Lists management
            { role: "admin", resource: "lists", action: "read", description: "View all lists" },
            { role: "admin", resource: "lists", action: "delete", description: "Delete any list" },
            
            // Cards management
            { role: "admin", resource: "cards", action: "read", description: "View all cards" },
            { role: "admin", resource: "cards", action: "delete", description: "Delete any card" },
        ];

        for (const permData of permissionsData) {
            const role = roles[permData.role];
            
            if (!role) {
                console.error(`  Role not found: ${permData.role}`);
                continue;
            }

            let permission = await permissionRepo.findOne({ 
                where: { 
                    resource: permData.resource, 
                    action: permData.action,
                    roleId: role.id
                } 
            });
            
            if (!permission) {
                permission = await permissionRepo.save({
                    resource: permData.resource,
                    action: permData.action,
                    roleId: role.id,
                    role: role
                });
                console.log(`✓ Created permission: ${permData.role}:${permData.resource}:${permData.action}`);
            } else {
                console.log(`  Permission already exists: ${permData.role}:${permData.resource}:${permData.action}`);
            }
        }

        console.log("\n✓ RBAC data seeded successfully\n");
        return true;
    } catch (error) {
        console.error("Error seeding RBAC data:", error);
        throw error;
    }
}
