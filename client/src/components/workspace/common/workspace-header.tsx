import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

const WorkspaceHeader = () => {
  const { workspaceLoading, workspace } = useAuthContext();
  const { t } = useTranslation();


  return (
    <div className="w-full max-w-4xl mx-auto pb-4">
      {workspaceLoading ? (
        <Loader className="w-8 h-8 animate-spin" />
      ) : (
        <div className="flex items-center gap-4 p-4 bg-sidebar shadow-md rounded-xl top-space">
          <Avatar className="size-[60px] rounded-xl font-bold">
            <AvatarFallback className="rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#F9A8D4] text-[26px] text-white">
              {workspace?.name?.charAt(0).toUpperCase() || "W"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-sidebar-text">{workspace?.name}</h1>
            <span className="text-sm text-muted">{t("sub-title-workspace")}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;
