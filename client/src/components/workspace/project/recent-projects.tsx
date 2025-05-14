import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { Loader } from "lucide-react";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import i18n from "@/languages/i18n";
import { getDateFnsLocale } from "@/languages/getDateFnsLocale";

const RecentProjects = () => {
  const workspaceId = useWorkspaceId();
  const { t } = useTranslation();
  const lang = i18n.language;
  const dateLocale = getDateFnsLocale();

  const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";

  const { data, isPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 10,
  });
  const projects = data?.projects || [];


  return (
    <div className="flex flex-col pt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}
      {projects.length === 0 && (
        <div className="font-semibold text-sm text-muted text-center py-5  ">
          {t("dashboard-project-announce")}
        </div>
      )}

      {/* hiển thị ng dùng tạo project */}
      <ul role="list">
        {projects.map((project) => {
          const name = project.createdBy.name;
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);


          return (
            <Link
              key={project._id}
              to={`/workspace/${workspaceId}/project/${project._id}`}
              className="preview-item no-underline text-inherit hover:no-underline 
              hover:text-inherit hover:bg-dropdown-hover-bg border-b border-border last:border-b-0
              group transition-all duration-300 ease-in-out block relative"
            >
              <div className="flex w-full">
                <div className="flex flex-grow items-start transition-transform duration-300 ease-in-out group-hover:translate-x-4">
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dashboard-icon mt-2.5">
                      <i className="mdi not-italic">{project.emoji}</i>
                    </div>
                  </div>
                  <div className="preview-item-content d-sm-flex flex-grow">
                    <div className="flex-grow mt-2.5">
                      <h6 className="preview-subject font-bold">{project.name}</h6>
                      <p className="text-muted mb-0 mt-2">
                        {project.createdAt
                          ? format(new Date(project.createdAt), formatStr, { locale: dateLocale })
                          : null}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right block: dịch sang trái */}
                <div className="ml-auto text-right pt-2 pt-sm-0 transition-transform duration-300 ease-in-out group-hover:-translate-x-4">
                  <p className="text-muted">{t("dashboard-project-created")}</p>
                  <div className="flex items-center space-x-2 justify-end">
                    <p className="text-muted mb-0">{project.createdBy.name}</p>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={project.createdBy.profilePicture || ""} alt="Avatar" />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </ul>
    </div>
  );
};

export default RecentProjects;