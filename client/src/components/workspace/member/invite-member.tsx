import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";
import { CheckIcon, CopyIcon, Loader } from "lucide-react";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";
import { useTranslation } from "react-i18next";

const InviteMember = () => {
  const { workspace, workspaceLoading } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();


  const inviteUrl = workspace
    ? `${window.location.origin}${BASE_ROUTE.INVITE_URL.replace(
      ":inviteCode",
      workspace.inviteCode
    )}`
    : "";

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        toast({
          title: t("memberdashboard-link-title"),
          description: t("memberdashboard-link-description"),
          variant: "success",
          duration: 2500,
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };


  return (
    <div className="flex flex-col pt-0.5 px-0 ">
      <h5 className="text-lg  leading-[30px] font-semibold mb-1">
        {t("memberdashboard-invite-title")}
      </h5>
      <p className="text-muted leading-tight">
        {t("memberdashboard-invite-description")}
      </p>

      <PermissionsGuard showMessage requiredPermission={Permissions.ADD_MEMBER}>
        {workspaceLoading ? (
          <Loader
            className="w-8 h-8 
        animate-spin
        place-self-center
        flex"
          />
        ) : (
          <div className="flex py-3 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <input
              type="text"
              id="link"
              disabled
              readOnly
              value={inviteUrl}
              className="form-control bg-navbar border-sidebar-border text-sidebar-text rounded disabled:opacity-100 disabled:pointer-events-none"
              placeholder={t("navbar-search-placeholder")}
            />
            <Button
              variant="create"
              disabled={false}
              className="shrink-0"
              size="icon"
              onClick={handleCopy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        )}
      </PermissionsGuard>
    </div>
  );
};

export default InviteMember;
