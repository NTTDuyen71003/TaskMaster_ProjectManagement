import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecentProjects from "@/components/workspace/project/recent-projects";
import RecentTasks from "@/components/workspace/task/recent-tasks";
import RecentMembers from "@/components/workspace/member/recent-members";
import { useTranslation } from "react-i18next";
import { useState } from "react";


const WorkspaceDashboard = () => {

  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("projects");


  return (
    <div className="main-panel">
      <WorkspaceAnalytics />
      
      <div className="mt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="card-body bg-sidebar card-border">
          <TabsList className="d-flex flex-wrap align-items-center">
            <TabsTrigger className="py-2" value="projects">
              <h4 className="card-title mb-1 title-font">{t("dashboard-recent-projects")}</h4>
            </TabsTrigger>
            <TabsTrigger className="py-2" value="tasks">
              <h4 className="card-title mb-1 title-font">{t("dashboard-recent-tasks")}</h4>
            </TabsTrigger>
            <TabsTrigger className="py-2" value="members">
              <h4 className="card-title mb-1 title-font">{t("dashboard-recent-members")}</h4>
            </TabsTrigger>
            {activeTab === "projects" && (
              <p className="text-muted mb-1 py-2 ms-auto">{t("dashboard-data-status")}</p>
            )}
          </TabsList>

          <div className="row">
            <TabsContent value="projects" className="preview-list">
              <RecentProjects />
            </TabsContent>
            <TabsContent value="tasks" className="preview-list">
              <RecentTasks />
            </TabsContent>
            <TabsContent value="members" className="preview-list">
              <RecentMembers />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
