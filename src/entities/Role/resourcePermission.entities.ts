import { Entity, Column } from "typeorm";
import { BaseEntity } from "../Base";

/**
 * ResourcePermission - Lưu permissions cho từng role trong workspace/board
 * Đây là TRUE RBAC - permissions được define trong DB, không hardcode
 */

@Entity("resource_permissions")
export class ResourcePermission extends BaseEntity {
    /**
     * Resource type: 'workspace' hoặc 'board'
     */
    @Column({ type: "varchar", length: 50 })
    resourceType!: string;

    /**
     * Role name trong resource đó: 
     * - Workspace: 'owner', 'member'
     * - Board: 'owner', 'admin', 'member'
     */
    @Column({ type: "varchar", length: 50 })
    roleName!: string;

    /**
     * Permission name:
     * - Workspace: 'canView', 'canUpdate', 'canDelete', 'canInviteMembers', etc.
     * - Board: 'canView', 'canUpdate', 'canDelete', 'canManageLists', etc.
     */
    @Column({ type: "varchar", length: 100 })
    permissionName!: string;

    /**
     * Permission value: true = có quyền, false = không có quyền
     */
    @Column({ type: "boolean", default: false })
    isGranted!: boolean;

    /**
     * Description của permission này
     */
    @Column({ type: "text", nullable: true })
    description!: string;
}
