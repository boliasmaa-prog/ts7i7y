import React from "react";
import { ActiveTab, AppLanguage } from "../types";
import { 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  FolderArchive, 
  Settings as SettingsIcon 
} from "lucide-react";
import { translations } from "../lib/i18n";

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  classesCount?: number;
  language?: AppLanguage;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  classesCount = 0,
  language = "ar",
}) => {
  const t = translations[language] || translations.ar;

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    {
      id: "grading",
      label: t?.tabs?.grading || "التصحيح",
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    {
      id: "classes",
      label: t?.tabs?.classes || "الأقسام",
      icon: <Users className="w-5 h-5" />,
      badge: classesCount > 0 ? classesCount : undefined,
    },
    {
      id: "reports",
      label: t?.tabs?.reports || "التقارير",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "rubrics",
      label: t?.tabs?.rubrics || "النماذج ومفكرتي",
      icon: <FolderArchive className="w-5 h-5" />,
    },
    {
      id: "settings",
      label: t?.tabs?.settings || "الإعدادات",
      icon: <SettingsIcon className="w-5 h-5" />,
    },
  ];


  return (
    <nav 
      id="bottom-navigation-bar"
      aria-label="شريط التبويبات السفلي"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] transition-colors"
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-2xl transition-all duration-150 select-none ${
                  isActive
                    ? "text-[#0E1B2E] dark:text-slate-100 font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-[#0E1B2E] dark:hover:text-slate-200"
                }`}
              >
                {/* Active Tab Container with 3-color stripe */}
                {isActive ? (
                  <div className="flex flex-col items-center px-3 py-1 rounded-2xl border border-[#C89B3C]/50 dark:border-[#C89B3C]/40 bg-[#FDF8F9] dark:bg-[#2A101A] shadow-sm">
                    {/* Tricolor mini stripe on top */}
                    <div className="w-7 h-1 flex overflow-hidden rounded-full mb-1">
                      <div className="w-1/3 bg-[#C89B3C]" />
                      <div className="w-1/3 bg-[#0E1B2E] dark:bg-slate-300" />
                      <div className="w-1/3 bg-[#7A142A]" />
                    </div>

                    <div className="text-[#7A142A] dark:text-[#E8829A]">
                      {tab.icon}
                    </div>

                    <span className="text-[11px] font-black text-[#0E1B2E] dark:text-white mt-0.5 whitespace-nowrap">
                      {tab.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-1">
                    <div className="relative p-1">
                      {tab.icon}
                      {tab.badge !== undefined && (
                        <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#7A142A] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs mt-0.5 whitespace-nowrap tracking-tight font-medium">
                      {tab.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
