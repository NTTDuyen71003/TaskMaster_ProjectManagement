import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Permissions } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteWorkspaceMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const DeleteWorkspaceCard = () => {
  const { workspace, hasPermission } = useAuthContext();
  const canDeleteWorkspace = hasPermission(Permissions.DELETE_WORKSPACE);
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { open, onOpenDialog, onCloseDialog } = useConfirmDialog();
  const { t } = useTranslation();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteWorkspaceMutationFn,
  });
  const handleConfirm = () => {
    mutate(workspaceId, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["userWorkspaces"],
        });
        toast({
          title: t("settingboard-delete-workspace-success"),
          description: t("settingboard-delete-workspace-success-desc"),
          variant: "success",
          duration: 2500,
        });
        navigate(`/workspace/${data.currentWorkspace}`);
        setTimeout(() => onCloseDialog(), 100);
      },
      onError: () => {
        toast({
          title: t("settingboard-edit-error"),
          description: t("settingboard-edit-error-description"),
          variant: "destructive",
          duration: 2500,
        });
      },
    });
  };


  return (
    <>
      <div className="col-md-12">
        <h4 className="card-title font-bold">{t("settingboard-delete-title")}</h4>
        <h6 className="mb-3">{t("settingboard-delete-desc")}</h6>
        <button
          type="submit"
          onClick={onOpenDialog}
          disabled={!canDeleteWorkspace}
          className="btn bg-red-500 mr-2 rounded-lg"
        >
          {isPending && <Loader />}
          {t("settingboard-delete-btn")}
        </button>
      </div>

      <ConfirmDialog
        isOpen={open}
        isLoading={isPending}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title={`${t("sidebar-project-deletebtn")} ${t("settingboard-delete-workspace-title")} "${workspace?.name}"`}
        description={t("settingboard-delete-workspace-desc")}
        confirmText={t("sidebar-project-deletebtn")}
        cancelText={t("sidebar-createworkspace-cancelbtn")}
      />

    </>
  );
};

export default DeleteWorkspaceCard;
