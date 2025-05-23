import * as React from "react";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import { useTranslation } from "react-i18next";

type WorkspaceType = {
  _id: string;
  name: string;
};

export function WorkspaceSwitcher() {
  const navigate = useNavigate()
  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();
  const [activeWorkspace, setActiveWorkspace] = React.useState<WorkspaceType>();
  const { t } = useTranslation();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: 1,
    refetchOnMount: true,
  });
  const workspaces = data?.workspaces;

  React.useEffect(() => {
    if (workspaces?.length) {
      const workspace = workspaceId
        ? workspaces.find((ws) => ws._id === workspaceId)
        : workspaces[0];

      if (workspace) {
        setActiveWorkspace(workspace);
        if (!workspaceId) navigate(`/workspace/${workspace._id}`);
      }
    }
  }, [workspaceId, workspaces, navigate]);

  const onSelect = (workspace: WorkspaceType) => {
    setActiveWorkspace(workspace);
    navigate(`/workspace/${workspace._id}`);
  };


  return (
    <li className="nav-item profile">
      <div className="profile-desc">
        {activeWorkspace ? (
          <>
            <div className="profile-pic">
              <div className="count-indicator">
                <div className="flex aspect-square size-8 items-center font-semibold 
                justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeWorkspace?.name?.split(" ")?.[0]?.charAt(0)}
                </div>
              </div>
              <div className="profile-name">
                <h5 className="mb-0 font-semibold">{activeWorkspace?.name}</h5>
                <span>{t("sub-title-workspace")}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="profile-name">
            <h5 className="mb-0 font-weight-normal">{t("workspace-not-select")}</h5>
          </div>
        )}
        <a href="" id="profile-dropdown" data-toggle="dropdown">
          <i className="mdi mdi-dots-vertical"></i>
        </a>
        <div className="dropdown-menu bg-sidebar text-sidebar-text border-sidebar-border dropdown-menu-right sidebar-dropdown preview-list" aria-labelledby="profile-dropdown">
          <div className="workspace-title-siderbar">
            <div className="preview-item-content">
              <h6 className="p-3 mb-0">{t("workspace-dialog-title")}</h6>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          {isPending ? <Loader className=" w-5 h-5 animate-spin" /> : null}
          {workspaces?.map((workspace) => (
            <React.Fragment key={workspace._id}>
              <a
                className="dropdown-item preview-item cursor-pointer 
                hover:bg-dropdown-hover-bg"
                onClick={() => onSelect(workspace)}
              >
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                    {workspace?.name?.split(" ")?.[0]?.charAt(0)}
                  </div>
                </div>
                <div className="preview-item-content text-sidebar-text">
                  <p className="preview-subject ellipsis mb-1 text-small">
                    {workspace.name}
                  </p>
                </div>
              </a>
              <div className="dropdown-divider"></div>
            </React.Fragment>
          ))}
          <a className="dropdown-item hover:bg-dropdown-hover-bg preview-item cursor-pointer"
            onClick={onOpen}>
            <div className="preview-item-content text-sidebar-text">
              <p className="p-3 mb-0 text-center ellipsis">{t("workspace-dialog-add")}</p>
            </div>
          </a>
        </div>
      </div>
    </li>
  );
}
