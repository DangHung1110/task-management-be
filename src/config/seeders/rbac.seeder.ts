import { AppDataSource } from "../db.config";
import { Permission, Role } from "../../entities/Role";

export const permissionEnum = {
        USER: {
            CREATE: "create_user",
            READ: "read_user",
            UPDATE: "update_user",
            DELETE: "delete_user"
        },
        WORKSPACE: {
            CREATE: "create_workspace",
            READ: "read_workspace",
            UPDATE: "update_workspace",
            DELETE: "delete_workspace"
        },

        BOARD: {
            CREATE: "create_board",
            READ: "read_board",
            UPDATE: "update_board",
            DELETE: "delete_board"
        },

        LIST: {
            CREATE: "create_list",
            READ: "read_list",
            UPDATE: "update_list",
            DELETE: "delete_list"
        },
    }
    
export async function seedRBAC() {
    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);

    console.log("Seeding RBAC data...");

    try {
        const rolesData = [
            { 
                name: "admin", 
                description: "System administrator with full access to all resources" 
            },
            { 
                name: "manager", 
                description: "Manager with access to manage workspaces and teams" 
            },
            { 
                name: "user", 
                description: "Regular user with limited access" 
            }
        ];

        const roles: Record<string, Role> = {};
        
        for (const roleData of rolesData) {
            let role = await roleRepo.findOne({ 
                where: { name: roleData.name }
            });
            
            if (!role) {
                role = await roleRepo.save(roleData);
                console.log(`Created role: ${roleData.name}`);
            } else {
                console.log(`Role already exists: ${roleData.name}`);
            }
            
            roles[roleData.name] = role;
        }

        const permissionsData = [
            // Admin Role Permissions
            { role: "admin", permissionName: permissionEnum.USER.CREATE, description: "Create new users" },
            { role: "admin", permissionName: permissionEnum.USER.READ, description: "View all users" },
            { role: "admin", permissionName: permissionEnum.USER.UPDATE, description: "Update any user" },
            { role: "admin", permissionName: permissionEnum.USER.DELETE, description: "Delete any user" },
            { role: "admin", permissionName: permissionEnum.BOARD.CREATE, description: "Create board" },
            { role: "admin", permissionName: permissionEnum.BOARD.READ, description: "View all boards" },
            { role: "admin", permissionName: permissionEnum.BOARD.UPDATE, description: "Update any board" },
            { role: "admin", permissionName: permissionEnum.BOARD.DELETE, description: "Delete any board" },

            // Owner Role Permissions
            { role: "owner", permissionName: permissionEnum.WORKSPACE.CREATE, description: "Create workspace" },
            { role: "owner", permissionName: permissionEnum.WORKSPACE.READ, description: "View workspaces" },
            { role: "owner", permissionName: permissionEnum.WORKSPACE.UPDATE, description: "Update workspaces" },
            { role: "owner", permissionName: permissionEnum.WORKSPACE.DELETE, description: "Delete workspaces" },
            { role: "owner", permissionName: permissionEnum.BOARD.CREATE, description: "Create board" },
            { role: "owner", permissionName: permissionEnum.BOARD.READ, description: "View boards" },
            { role: "owner", permissionName: permissionEnum.BOARD.UPDATE, description: "Update boards" },
            { role: "owner", permissionName: permissionEnum.BOARD.DELETE, description: "Delete boards" },
            { role: "owner", permissionName: permissionEnum.LIST.CREATE, description: "Create list" },
            { role: "owner", permissionName: permissionEnum.LIST.READ, description: "View lists" },
            { role: "owner", permissionName: permissionEnum.LIST.UPDATE, description: "Update lists" },
            { role: "owner", permissionName: permissionEnum.LIST.DELETE, description: "Delete lists" },

            // User Role Permissions
            { role: "user", permissionName: permissionEnum.WORKSPACE.CREATE, description: "Create workspace" },
            { role: "user", permissionName: permissionEnum.WORKSPACE.READ, description: "View assigned workspaces" },
            { role: "user", permissionName: permissionEnum.BOARD.CREATE, description: "Create board" },
            { role: "user", permissionName: permissionEnum.BOARD.READ, description: "View assigned boards" },
            { role: "user", permissionName: permissionEnum.LIST.READ, description: "View lists" },
        ]


        for (const permData of permissionsData) {
            const role = roles[permData.role];
            
            if (!role) {
                console.error(`  Role not found: ${permData.role}`);
                continue;
            }

            let permission = await permissionRepo.findOne({ 
                where: { 
                    permissionName: permData.permissionName,
                    roleId: role.id
                } 
            });
            
            if (!permission) {
                permission = await permissionRepo.save({
                    permissionName: permData.permissionName,
                    description: permData.description,
                    roleId: role.id,
                    role: role
                });
                console.log(` Created permission: ${permData.role}:${permData.permissionName}`);
            } else {
                console.log(`  Permission already exists: ${permData.role}:${permData.permissionName}`);
            }
        }

        console.log("\nRBAC data seeded successfully\n");
        return true;
    } catch (error) {
        console.error("Error seeding RBAC data:", error);
        throw error;
    }
}
