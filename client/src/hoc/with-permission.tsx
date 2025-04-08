/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withPermission = (
  WrappedComponent: React.ComponentType,
  requiredPermission: PermissionType
) => {
  const WithPermission = (props: any) => {
    const { user, hasPermission, isLoading } = useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    useEffect(() => {
      if (!user || !hasPermission(requiredPermission)) {
        navigate(`/workspace/${workspaceId}`);
      }
    }, [user, hasPermission, navigate, workspaceId]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    // Kiểm tra xem người dùng có quyền truy cập hay không
    if (!user || !hasPermission(requiredPermission)) {
      return;
    }
    // Nếu người dùng có quyền, render component gốc
    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};

export default withPermission;
