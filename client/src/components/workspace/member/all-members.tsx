import { ChevronDown, Loader } from "lucide-react";
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
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import { useState } from "react";
import { useTranslation } from "react-i18next";


const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();
  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const [openPopoverMemberId, setOpenPopoverMemberId] = useState<string | null>(null);


  const filteredMembers = members.filter((member) =>
    member.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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


  return (
    <div className="grid gap-6 pt-2">
      <input
        type="text"
        className="form-control bg-navbar border-sidebar-border rounded disabled:opacity-100 disabled:pointer-events-none text-des"
        placeholder={t("memberdashboard-search-placeholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}
      {filteredMembers.map((member) => {
        const name = member.userId?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);
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
            <div className="flex sm:items-center sm:justify-end">
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
                    {member.userId._id !== user?._id && (
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
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;
