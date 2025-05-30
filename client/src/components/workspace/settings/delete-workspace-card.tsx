import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { Permissions } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import { toast } from "@/hooks/use-toast";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteWorkspaceMutationFn, getOwnerWorkspacesCountQueryFn } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const { data: ownerWorkspaceCountData, isLoading: isCountingWorkspaces } = useQuery({
    queryKey: ["owner-workspaces-count"],
    queryFn: getOwnerWorkspacesCountQueryFn,
    enabled: canDeleteWorkspace,
  });

  const { mutate: deleteWorkspace, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkspaceMutationFn,
  });


  const isLastWorkspace = (ownerWorkspaceCountData?.count || 0) <= 1;
  const isDisabled = isLastWorkspace;

  const handleConfirm = () => {
    if (isLastWorkspace) {
      return {
        title: t("settingboard-cannot-delete-last-workspace-title"),
        description: t("settingboard-cannot-delete-last-workspace-desc"),
        showConfirmButton: false,
      };
    }

    deleteWorkspace(workspaceId, {
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
      onError: (error: any) => {
        // Handle specific error message for members existing
        const errorMessage = error?.response?.data?.message || t("settingboard-edit-error-description");
        toast({
          title: t("settingboard-edit-error"),
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
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
          type="button"
          onClick={onOpenDialog}
          disabled={!canDeleteWorkspace || isDisabled}
          className="btn bg-red-500 mr-2 rounded-lg"
        >
          {(isDeleting || isCountingWorkspaces) && <Loader />}
          {t("settingboard-delete-btn")}
        </button>
      </div>

      <ConfirmDialog
        isOpen={open}
        isLoading={isDeleting}
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
