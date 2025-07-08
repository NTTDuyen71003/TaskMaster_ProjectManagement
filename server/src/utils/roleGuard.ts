import { PermissionType } from "../enums/role.enum";
import { UnauthorizedException } from "./appError";
import { RolePermissions } from "./role-permission";

export const roleGuard = (
    role: keyof typeof RolePermissions,
    requiredPermissions: PermissionType[]
) => {
    const permissions = RolePermissions[role];
    // Kiểm tra xem người dùng có đủ quyền để thực hiện hành động này không
    const hasPermission = requiredPermissions.every((permission) =>
        permissions.includes(permission)
    );

    if (!hasPermission) {
        throw new UnauthorizedException(
            "You do not have the necessary permissions to perform this action"
        );
    }
};
