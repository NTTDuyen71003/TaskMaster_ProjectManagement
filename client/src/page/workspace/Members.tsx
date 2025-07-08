import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { useTranslation } from "react-i18next";
import PermissionsGuard from "../../components/resuable/permission-guard";
import { Permissions } from "@/constant/index";

export default function Members() {
  const { t } = useTranslation();


  return (
    <div className="w-full h-auto pt-2">
      <WorkspaceHeader />
      <main className="w-full max-w-4xl mx-auto px-2 card card-body bg-sidebar rounded-2xl">
        <section className="card-body">
          <h2 className="text-xl font-semibold text-sidebar-text mb-1">{t("memberdashboard-workspace")}</h2>
          <p className="text-sm text-muted mb-4">{t("memberdashboard-workspace-description")}</p>
          <Separator className="my-3" />
          <PermissionsGuard requiredPermission={Permissions.ADD_MEMBER}>
            <InviteMember />
            <Separator className="my-6 h-[1px]" />
          </PermissionsGuard>
          <AllMembers />
        </section>
      </main>
    </div>
  );
}
