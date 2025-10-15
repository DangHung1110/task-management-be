import { AppDataSource } from "../db.config";
import { Permission, Role } from "../../entities/Role";
export async function seedRBAC() {
    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);

    console.log("Seeding RBAC data...");

    try {
        const permissionsData = [

            // Users permissions
            { 
                name: "users:create", 
                resource: "users", 
                action: "create", 
                description: "Create new user" 
            },
            { 
                name: "users:read", 
                resource: "users", 
                action: "read", 
                description: "View all users" 
            },
            { 
                name: "users:update", 
                resource: "users", 
                action: "update", 
                description: "Update user information" 
            },
            { 
                name: "users:delete", 
                resource: "users", 
                action: "delete", 
                description: "Delete user" 
            },
                        { 
                name: "workspaces:create", 
                resource: "workspaces", 
                action: "create", 
                description: "Create workspace" 
            },

            // Workspaces permissions
            { 
                name: "workspaces:read", 
                resource: "workspaces", 
                action: "read", 
                description: "View workspaces" 
            },
            { 
                name: "workspaces:update", 
                resource: "workspaces", 
                action: "update", 
                description: "Update workspace" 
            },
            { 
                name: "workspaces:delete", 
                resource: "workspaces", 
                action: "delete", 
                description: "Delete workspace" 
            },
            
            // Boards permissions
            { 
                name: "boards:create", 
                resource: "boards", 
                action: "create", 
                description: "Create board" 
            },
            { 
                name: "boards:read", 
                resource: "boards", 
                action: "read", 
                description: "View boards" 
            },
            { 
                name: "boards:update", 
                resource: "boards", 
                action: "update", 
                description: "Update board" 
            },
            { 
                name: "boards:delete", 
                resource: "boards", 
                action: "delete", 
                description: "Delete board" 
            },
            
            // Cards permissions
            { 
                name: "cards:create", 
                resource: "cards", 
                action: "create", 
                description: "Create card" 
            },
            { 
                name: "cards:read", 
                resource: "cards", 
                action: "read", 
                description: "View cards" 
            },
            { 
                name: "cards:update", 
                resource: "cards", 
                action: "update", 
                description: "Update card" 
            },
            { 
                name: "cards:delete", 
                resource: "cards", 
                action: "delete", 
                description: "Delete card" 
            },
            
            // Lists permissions
            { 
                name: "lists:create", 
                resource: "lists", 
                action: "create", 
                description: "Create list" 
            },
            { 
                name: "lists:read", 
                resource: "lists", 
                action: "read", 
                description: "View lists" 
            },
            { 
                name: "lists:update", 
                resource: "lists", 
                action: "update", 
                description: "Update list" 
            },
            { 
                name: "lists:delete", 
                resource: "lists", 
                action: "delete", 
                description: "Delete list" 
            },
        ];

        const permissions: Permission[] = [];
        for (const permData of permissionsData) {
            let permission = await permissionRepo.findOne({ 
                where: { name: permData.name } 
            });
            
            if (!permission) {
                permission = await permissionRepo.save(permData);
                console.log(`Created permission: ${permData.name}`);
            } else {
                console.log(` Permission already exists: ${permData.name}`);
            }
            
            permissions.push(permission);
        }

        const rolesData = [
            { 
                name: "admin", 
                description: "System administrator with full access" 
            },
            { 
                name: "manager", 
                description: "Team manager with limited admin access" 
            },
            { 
                name: "member", 
                description: "Regular team member" 
            },
            { 
                name: "viewer", 
                description: "Read-only access" 
            }
        ];

        for (const roleData of rolesData) {
            let role = await roleRepo.findOne({ 
                where: { name: roleData.name },
                relations: ["permissions"]
            });
            
            if (!role) {
                role = roleRepo.create(roleData);
                console.log(`Created role: ${roleData.name}`);
            } else {
                console.log(`Role already exists: ${roleData.name}`);
            }

            switch (roleData.name) {
                case "admin":
                    role.permissions = permissions;
                    console.log(`Assigned ${permissions.length} permissions to admin`);
                    break;
                    
                case "manager":
                    role.permissions = permissions.filter(p => 
                        p.resource === "workspaces" || 
                        p.resource === "boards" || 
                        p.resource === "cards" ||
                        p.resource === "lists"
                    );
                    console.log(`  ✓ Assigned ${role.permissions.length} permissions to manager`);
                    break;
                    
                case "member":
                    role.permissions = permissions.filter(p => 
                        p.action === "read" ||
                        ((p.resource === "boards" || p.resource === "cards" || p.resource === "lists") && 
                         (p.action === "create" || p.action === "update"))
                    );
                    console.log(`  ✓ Assigned ${role.permissions.length} permissions to member`);
                    break;
                    
                case "viewer":
                    role.permissions = permissions.filter(p => p.action === "read");
                    console.log(`  ✓ Assigned ${role.permissions.length} permissions to viewer`);
                    break;
            }

            await roleRepo.save(role);
        }

        console.log("RBAC data seeded successfully\n");
        return true;
    } catch (error) {
        console.error("Error seeding RBAC data:", error);
        throw error;
    }
}
