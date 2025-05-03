import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavMain } from "./nav-main";
import useWorkspaceId from "@/hooks/use-workspace-id";

const Asidebar = () => {
  // const { isLoading, user } = useAuthContext();
  const workspaceId = useWorkspaceId();


  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <div className="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
        <a className="brand-logo" href={`/workspace/${workspaceId}`}>
          <img src="/images/taskmaster_logo2.png" alt="logo" />
        </a>
        <a className="sidebar-brand brand-logo-mini" href={`/workspace/${workspaceId}`}><img src="/taskmaster.png" alt="logo" /></a>
      </div>
      <ul className="nav">
      <WorkspaceSwitcher/>
        <li className="nav-item nav-category">
          <span className="nav-link">Navigation</span>
        </li>
        <NavMain />
      </ul>
    </nav>
  );
};

export default Asidebar;
