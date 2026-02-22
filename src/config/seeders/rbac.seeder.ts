import { AppDataSource } from "../db.config";
import { Permission, Role, ResourcePermission } from "../../entities/Role";

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

        CARD: {
            CREATE: "create_card",
            READ: "read_card",
            UPDATE: "update_card",
            DELETE: "delete_card"
        }
    }
    
export async function seedRBAC() {
    const permissionRepo = AppDataSource.getRepository(Permission);
    const roleRepo = AppDataSource.getRepository(Role);
    const resourcePermissionRepo = AppDataSource.getRepository(ResourcePermission);

    console.log("Seeding RBAC data...");

    try {
        // System roles - chỉ dùng cho admin hệ thống
        // User thông thường KHÔNG CÓ system role khi đăng ký
        // Role được quản lý ở cấp workspace (owner, member) và board (owner, admin, member)
        const rolesData = [
            { 
                name: "admin", 
                description: "System administrator with full access to all resources and user management" 
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
            // Admin Role Permissions - FULL ACCESS cho admin hệ thống
            // Admin có thể quản lý users và bypass mọi workspace/board permissions
            { role: "admin", permissionName: permissionEnum.USER.CREATE, description: "Create new users" },
            { role: "admin", permissionName: permissionEnum.USER.READ, description: "View all users" },
            { role: "admin", permissionName: permissionEnum.USER.UPDATE, description: "Update any user" },
            { role: "admin", permissionName: permissionEnum.USER.DELETE, description: "Delete any user" },
            { role: "admin", permissionName: permissionEnum.WORKSPACE.CREATE, description: "Create workspace" },
            { role: "admin", permissionName: permissionEnum.WORKSPACE.READ, description: "View all workspaces" },
            { role: "admin", permissionName: permissionEnum.WORKSPACE.UPDATE, description: "Update any workspace" },
            { role: "admin", permissionName: permissionEnum.WORKSPACE.DELETE, description: "Delete any workspace" },
            { role: "admin", permissionName: permissionEnum.BOARD.CREATE, description: "Create board" },
            { role: "admin", permissionName: permissionEnum.BOARD.READ, description: "View all boards" },
            { role: "admin", permissionName: permissionEnum.BOARD.UPDATE, description: "Update any board" },
            { role: "admin", permissionName: permissionEnum.BOARD.DELETE, description: "Delete any board" },
            { role: "admin", permissionName: permissionEnum.LIST.CREATE, description: "Create list" },
            { role: "admin", permissionName: permissionEnum.LIST.READ, description: "View all lists" },
            { role: "admin", permissionName: permissionEnum.LIST.UPDATE, description: "Update any list" },
            { role: "admin", permissionName: permissionEnum.LIST.DELETE, description: "Delete any list" },
            { role: "admin", permissionName: permissionEnum.CARD.CREATE, description: "Create card" },
            { role: "admin", permissionName: permissionEnum.CARD.READ, description: "View all cards" },
            { role: "admin", permissionName: permissionEnum.CARD.UPDATE, description: "Update any card" },
            { role: "admin", permissionName: permissionEnum.CARD.DELETE, description: "Delete any card" },
        ]


        for (const permData of permissionsData) {
            const role = roles[permData.role];
            
            if (!role) {
                throw new Error(`Role not found: ${permData.role}. Cannot create permissions for non-existent role.`);
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

        // ========================================
        // SEED RESOURCE-LEVEL PERMISSIONS (Workspace & Board)
        // ========================================
        console.log("\n📋 Seeding Resource Permissions...");

        // Workspace Permissions
        const workspacePermissions = [
            // OWNER permissions
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canView', isGranted: true, description: 'View workspace details' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canUpdate', isGranted: true, description: 'Update workspace settings' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canDelete', isGranted: true, description: 'Delete workspace' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canInviteMembers', isGranted: true, description: 'Invite members to workspace' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canRemoveMembers', isGranted: true, description: 'Remove members from workspace' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canCreateBoard', isGranted: true, description: 'Create boards in workspace' },
            { resourceType: 'workspace', roleName: 'owner', permissionName: 'canManageSettings', isGranted: true, description: 'Manage workspace settings' },
            
            // MEMBER permissions
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canView', isGranted: true, description: 'View workspace details' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canUpdate', isGranted: false, description: 'Update workspace settings' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canDelete', isGranted: false, description: 'Delete workspace' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canInviteMembers', isGranted: false, description: 'Invite members to workspace' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canRemoveMembers', isGranted: false, description: 'Remove members from workspace' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canCreateBoard', isGranted: true, description: 'Create boards in workspace' },
            { resourceType: 'workspace', roleName: 'member', permissionName: 'canManageSettings', isGranted: false, description: 'Manage workspace settings' },
        ];

        // Board Permissions
        const boardPermissions = [
            // OWNER permissions
            { resourceType: 'board', roleName: 'owner', permissionName: 'canView', isGranted: true, description: 'View board details' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canUpdate', isGranted: true, description: 'Update board settings' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canDelete', isGranted: true, description: 'Delete board' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canInviteMembers', isGranted: true, description: 'Invite members to board' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canRemoveMembers', isGranted: true, description: 'Remove members from board' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canManageSettings', isGranted: true, description: 'Manage board settings' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canArchive', isGranted: true, description: 'Archive/restore board' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canManageLists', isGranted: true, description: 'Create/update/delete lists' },
            { resourceType: 'board', roleName: 'owner', permissionName: 'canManageCards', isGranted: true, description: 'Create/update/delete cards' },
            
            // ADMIN permissions
            { resourceType: 'board', roleName: 'admin', permissionName: 'canView', isGranted: true, description: 'View board details' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canUpdate', isGranted: true, description: 'Update board settings' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canDelete', isGranted: false, description: 'Delete board' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canInviteMembers', isGranted: true, description: 'Invite members to board' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canRemoveMembers', isGranted: false, description: 'Remove members from board' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canManageSettings', isGranted: true, description: 'Manage board settings' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canArchive', isGranted: true, description: 'Archive/restore board' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canManageLists', isGranted: true, description: 'Create/update/delete lists' },
            { resourceType: 'board', roleName: 'admin', permissionName: 'canManageCards', isGranted: true, description: 'Create/update/delete cards' },
            
            // MEMBER permissions
            { resourceType: 'board', roleName: 'member', permissionName: 'canView', isGranted: true, description: 'View board details' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canUpdate', isGranted: false, description: 'Update board settings' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canDelete', isGranted: false, description: 'Delete board' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canInviteMembers', isGranted: false, description: 'Invite members to board' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canRemoveMembers', isGranted: false, description: 'Remove members from board' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canManageSettings', isGranted: false, description: 'Manage board settings' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canArchive', isGranted: false, description: 'Archive/restore board' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canManageLists', isGranted: true, description: 'Create/update/delete lists' },
            { resourceType: 'board', roleName: 'member', permissionName: 'canManageCards', isGranted: true, description: 'Create/update/delete cards' },
        ];

        const allResourcePermissions = [...workspacePermissions, ...boardPermissions];

        for (const permData of allResourcePermissions) {
            let resourcePerm = await resourcePermissionRepo.findOne({
                where: {
                    resourceType: permData.resourceType,
                    roleName: permData.roleName,
                    permissionName: permData.permissionName
                }
            });

            if (!resourcePerm) {
                await resourcePermissionRepo.save(permData);
                console.log(`Created: ${permData.resourceType}:${permData.roleName}:${permData.permissionName} = ${permData.isGranted}`);
            } else {
                resourcePerm.isGranted = permData.isGranted;
                resourcePerm.description = permData.description;
                await resourcePermissionRepo.save(resourcePerm);
                console.log(`Updated: ${permData.resourceType}:${permData.roleName}:${permData.permissionName} = ${permData.isGranted}`);
            }
        }

        console.log("\nRBAC data seeded successfully");
        
        try {
            const { rbacCacheService } = await import('../../common/cache/strategies/rbac.cache');
            await rbacCacheService.invalidateAll();
            console.log("RBAC cache refreshed");
        } catch (error) {
            console.error("Failed to refresh RBAC cache:", error);
        }
        
        return true;
    } catch (error) {
        console.error("Error seeding RBAC data:", error);
        throw error;
    }
}
