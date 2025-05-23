import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";
import { useTranslation } from "react-i18next";


const Settings = () => {
  const { t } = useTranslation();


  return (
    <div className="w-full min-h-screen py-6 px-4 bg-background text-foreground">
      <WorkspaceHeader />

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("settingboard-title")}</h1>
          <p className="text-muted text-sm">
            {t("settingboard-title-desc")}
          </p>
        </div>
        <Separator />

        <div className="content-wrapper bg-sidebar card card-body rounded-2xl">
          <div className="row">
            <div className="col-md-12 grid-margin stretch-card">
              <EditWorkspaceForm />
            </div>
          </div>
        </div>
        <Separator />

        <div className="content-wrapper bg-sidebar card card-body rounded-2xl border-destructive">
          <div className="row">
            <div className="col-md-12 grid-margin stretch-card">
              <DeleteWorkspaceCard />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
