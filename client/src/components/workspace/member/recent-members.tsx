import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-member";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getDateFnsLocale } from "@/languages/getDateFnsLocale";
import i18n from "@/languages/i18n";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

const RecentMembers = () => {
  const workspaceId = useWorkspaceId();
  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const lang = i18n.language;
  const dateLocale = getDateFnsLocale();
  const { t } = useTranslation();


  const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";


  return (
    <div className="preview-list mt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}

      <div role="list">
        {members.map((member, index) => {
          const name = member?.userId?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);

          return (
            <div
              key={index}
              role="listitem"
              className="flex items-center gap-4 p-3 rounded-lg
              hover:bg-dropdown-hover-bg border-b border-border last:border-b-0"
            >
              {/* Avatar */}
              <div className="preview-thumbnail">
                <Avatar className="h-9 w-9 sm:flex">
                  <AvatarImage src={member.userId?.profilePicture || ""} alt="Avatar" />
                  <AvatarFallback className={avatarColor}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="preview-item-content d-flex flex-grow">
                <div className="flex-grow">
                  <div className="d-flex d-md-block d-xl-flex justify-content-between">
                    <h6 className="preview-subject">{member.userId.name}</h6>
                    <p className="text-muted text-small">{t("dashboard-member-joinday")}</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                  <p className="text-muted">{t(`dashboard-${member.role.name.toLowerCase()}`)}</p>
                    <p className="text-muted text-small">
                      {member.joinedAt
                        ? format(new Date(member.joinedAt), formatStr, { locale: dateLocale })
                        : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentMembers;
