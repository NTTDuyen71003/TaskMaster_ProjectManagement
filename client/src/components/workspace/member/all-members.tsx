import { ChevronDown, Loader, Search, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import {
  changeWorkspaceMemberRoleMutationFn,
  deleteWorkspaceMemberMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/ui/sidebar";
import useConfirmDialog from "@/hooks/use-confirm-dialog";
import clsx from "clsx";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();
  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const [openPopoverMemberId, setOpenPopoverMemberId] = useState<string | null>(null);
  const [openRemoveDialog, setOpenRemoveDialog] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [] = useState(false);
  useSidebar();
  useConfirmDialog();
  const { isMobile } = useSidebar();
  const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);

  const filteredMembers = members.filter((member) =>
    member.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Query to check if member has tasks - removed the enabled: false and refetch
  // const { data: memberTasksData, isLoading: isCheckingMemberTasks } = useQuery({
  //   queryKey: ["member-tasks", workspaceId, memberToRemove?.userId._id],
  //   queryFn: () => checkMemberHasTasksQueryFn({
  //     workspaceId,
  //     memberId: memberToRemove?.userId._id
  //   }),
  //   enabled: !!memberToRemove?.userId._id, // Only run when we have a member to check
  // });

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  // Change role member
  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast({
          title: t("memberdashboard-changerole-success"),
          description: t("memberdashboard-changerole-success-description"),
          variant: "success",
          duration: 2500,
        });
        setOpenPopoverMemberId(null);
      },
      onError: () => {
        toast({
          title: t("memberdashboard-changerole-error"),
          description: t("memberdashboard-changerole-error-description"),
          variant: "destructive",
          duration: 2500,
        });
      },
    });
  };

  const { mutate: deleteMember, isPending: isDeleting } = useMutation({
    mutationFn: deleteWorkspaceMemberMutationFn,
  });

  // Handle remove member click - just set the member and open dialog
  const handleRemoveMemberClick = (member: any) => {
    setMemberToRemove(member);
    setOpenRemoveDialog(member.userId._id);
  };

  // Modified handleConfirm to accept memberId parameter
  const handleConfirm = (memberId: string) => {
    if (!memberId) return;

    // If member has tasks, don't proceed with deletion
    // if (memberTasksData?.hasTasks) {
    //   toast({
    //     title: t("memberdashboard-remove-user-error-title"),
    //     description: `${t("memberdashboard-remove-user-error-desc")} ${memberTasksData.tasksCount} ${t("memberdashboard-remove-user-error-desc1")}`,
    //     variant: "destructive",
    //     duration: 2500,
    //   });
    //   return;
    // }

    // Only proceed with deletion if member has no tasks
    deleteMember(
      {
        workspaceId,
        memberId: memberId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["members", workspaceId],
          });
          queryClient.invalidateQueries({
            queryKey: ["all-members", workspaceId],
          });
          toast({
            title: t("memberdashboard-changerole-success"),
            description: t("memberdashboard-remove-user-success-desc"),
            variant: "success",
            duration: 2500,
          });
          setTimeout(() => {
            setOpenRemoveDialog(null);
            setMemberToRemove(null);
          }, 100);
        },
        onError: () => {
          toast({
            title: t("memberdashboard-changerole-error"),
            description: t("memberdashboard-remove-user-error-title"),
            variant: "destructive",
            duration: 2500,
          });
        },
      }
    );
  };

  // Get dialog content based on whether member has tasks
  const getDialogContent = (member: any) => {
    // Show loading state while checking tasks
    // if (isCheckingMemberTasks) {
    //   return {
    //     title: `${t("memberdashboard-member-task-checking")} ${member.userId?.name}...`,
    //     description: t("memberdashboard-member-task-checking-desc"),
    //     confirmText: t("sidebar-projects-delete"),
    //     showConfirmButton: false,
    //   };
    // }

    // const hasTasks = memberTasksData?.hasTasks;
    // const tasksCount = memberTasksData?.tasksCount || 0;

    // if (hasTasks) {
    //   const description = t('tasks.memberdashboard-member-has-pending-tasks', {
    //     count: tasksCount,
    //   });

    //   return {
    //     title: `${t("memberdashboard-member-has-task-error-title")} "${member.userId?.name}"`,
    //     description: description,
    //     showConfirmButton: false,
    //   };
    // }

    return {
      title: `${t("memberdashboard-remove-user")} "${member.userId?.name}"?`,
      description: `${t("memberdashboard-remove-user-deletedescription1")} ${t("sidebar-project-deletedescription3")}`,
      confirmText: t("sidebar-projects-delete"),
      showConfirmButton: true,
    };
  };


  return (
    <div className="grid gap-6 pt-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sidebar-text">
          <Search className="w-4 h-4 mt-1 text-muted" />
        </span>
        <input
          type="text"
          className="pl-10 w-full form-control bg-navbar border-sidebar-border rounded disabled:opacity-100 disabled:pointer-events-none text-des"
          placeholder={t("memberdashboard-search-placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : filteredMembers.length === 0 ? (
        <p className="text-center text-muted">{t("taskboard-create-task-no-member")}</p>
      ) : (
        filteredMembers.map((member) => {
          const name = member.userId?.name;
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          const isOwner = member.role.name === "OWNER";

          return (
            <div
              key={member.userId._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Avatar and Name/Email */}
              <div className="flex items-start sm:items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.userId?.profilePicture || ""}
                    alt="Image"
                  />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none break-words">
                    {name}
                  </p>
                  <p className="text-sm text-muted break-all">
                    {member.userId.email}
                  </p>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="flex sm:items-center sm:justify-end gap-2">
                <Popover
                  open={openPopoverMemberId === member.userId._id}
                  onOpenChange={(open) =>
                    setOpenPopoverMemberId(open ? member.userId._id : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                      disabled={
                        isLoading ||
                        !canChangeMemberRole ||
                        member.userId._id === user?._id
                      }
                    >
                      {t(`role.${member.role.name?.toLowerCase()}`)}{" "}
                      {canRemoveMember && member.userId._id !== user?._id && (
                        <ChevronDown className="text-muted-foreground ml-1" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput placeholder={t("memberdashboard-role-search")} />
                      <CommandList>
                        {isLoading ? (
                          <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                        ) : (
                          <>
                            <CommandEmpty>
                              {t("memberdashboard-role-notfound")}
                            </CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role) =>
                                  role.name !== "OWNER" && (
                                    <CommandItem
                                      key={role._id}
                                      disabled={isLoading}
                                      className="gap-1 mb-1 flex flex-col items-start px-4 py-2 cursor-pointer"
                                      onSelect={() =>
                                        handleSelect(role._id, member.userId._id)
                                      }
                                    >
                                      <p className="capitalize">
                                        {t(`role.${role.name.toLowerCase()}`)}
                                      </p>
                                      <p className="text-sm text-muted">
                                        {role.name === "ADMIN" &&
                                          t("memberdashboard-admin-desc")}
                                        {role.name === "MEMBER" &&
                                          t("memberdashboard-member-desc")}
                                        {role.name === "OWNER" &&
                                          t("memberdashboard-owner-desc")}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Remove member dropdown - Only show if not owner */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <a
                      id="profile-dropdown"
                      data-toggle="dropdown"
                      className={clsx(
                        "p-2 rounded-md transition-colors text-muted",
                      )}
                      aria-label="More options"
                      onClick={(e) => e.preventDefault()}
                    >
                      {canRemoveMember && !isOwner && member.userId._id !== user?._id && (
                        <i className="mdi mdi-dots-vertical" />
                      )}
                    </a>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >

                    {/* Show remove option */}
                    {canRemoveMember && !isOwner && member.userId._id !== user?._id && (
                      <>
                        <DropdownMenuItem
                          className="text-red-500 dark:text-white cursor-pointer"
                          onClick={() => handleRemoveMemberClick(member)}
                        >
                          <UserMinus className="mr-2" />
                          <span>{t("memberdashboard-remove-user")}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })
      )}

      {/* Move the dialog outside the map and only show when needed */}
      {memberToRemove && (
        <ConfirmDialog
          isOpen={!!openRemoveDialog}
          isLoading={isDeleting}
          onClose={() => {
            setOpenRemoveDialog(null);
            setMemberToRemove(null);
          }}
          onConfirm={() => handleConfirm(memberToRemove.userId._id)}
          title={getDialogContent(memberToRemove).title}
          description={getDialogContent(memberToRemove).description}
          confirmText={getDialogContent(memberToRemove).confirmText}
          cancelText={t("sidebar-createworkspace-cancelbtn")}
          showConfirmButton={getDialogContent(memberToRemove).showConfirmButton}
        />
      )}
    </div>
  );
};

export default AllMembers;