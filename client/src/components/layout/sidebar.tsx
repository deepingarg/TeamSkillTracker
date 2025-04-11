import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: "ri-dashboard-line",
  },
  {
    path: "/skills-matrix",
    label: "Skills Matrix",
    icon: "ri-table-line",
  },
  {
    path: "/team-members",
    label: "Team Members",
    icon: "ri-team-line",
  },
  {
    path: "/skills",
    label: "Skill Sets",
    icon: "ri-bookmark-line",
  },
  {
    path: "/reports",
    label: "Reports",
    icon: "ri-line-chart-line",
  },
  {
    path: "/settings",
    label: "Settings",
    icon: "ri-settings-4-line",
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="bg-gray-800 text-white md:w-64 w-full md:min-h-screen">
      <div className="p-4 flex items-center gap-3 border-b border-gray-700">
        <i className="ri-bar-chart-grouped-line text-xl text-blue-400"></i>
        <h1 className="text-xl font-semibold">Team Skills Matrix</h1>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-gray-700",
                location === item.path && "bg-gray-700"
              )}>
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 w-full md:w-64 p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-white font-medium">JD</span>
          </div>
          <div>
            <div className="text-sm font-medium">Team Manager</div>
            <div className="text-xs text-gray-400">Skills Tracker</div>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white">
            <i className="ri-logout-box-r-line"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
