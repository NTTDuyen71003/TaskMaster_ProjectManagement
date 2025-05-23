import React from "react";
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import { useTranslation } from "react-i18next";

type PermissionsGuardProps = {
  requiredPermission: PermissionType;
  children: React.ReactNode;
  showMessage?: boolean;
};

const PermissionsGuard: React.FC<PermissionsGuardProps> = ({
  requiredPermission,
  showMessage = false,
  children,
}) => {
  const { hasPermission } = useAuthContext();
  const { t } = useTranslation();

  if (!hasPermission(requiredPermission)) {
    return (
      showMessage && (
        <div
          className="text-center 
        text-sm pt-3
        italic
        w-full
        text-muted"
        >
          {t("role-accouncement")}
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default PermissionsGuard;
