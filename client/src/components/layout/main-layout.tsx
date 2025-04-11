import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

export function MainLayout({ children, title, actions }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            {actions}
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
