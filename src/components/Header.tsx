import React from "react";
import { UserProfile, ActiveTab, AppLanguage } from "../types";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Sun, 
  Bell, 
  BookOpen,
  User
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { translations } from "../lib/i18n";

interface HeaderProps {
  profile: UserProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serverStatus: { online: boolean; hasApiKey: boolean };
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language?: AppLanguage;
  setLanguage?: (val: AppLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  setActiveTab,
  serverStatus,
  darkMode,
  setDarkMode,
  language = "ar",
  setLanguage,
}) => {
  const t = translations[language] || translations.ar;

  const getGreeting = () => {
    const teacherName = profile.name?.trim() || "";
    if (language === "fr") {
      const p = profile.gender === "female" ? "Professeure" : "Professeur";
      return `Bienvenue, ${p} ${teacherName}`;
    }
    if (language === "en") {
      const p = profile.gender === "female" ? "Teacher" : "Teacher";
      return `Welcome, ${p} ${teacherName}`;
    }
    // Arabic specification: "مرحبا بك ايها الاستاذ او الاستاذة زائد اسمه"
    const prefix = profile.gender === "female" ? "مرحباً بكِ أيتها الأستاذة" : "مرحباً بك أيها الأستاذ";
    return `${prefix} ${teacherName}`;
  };

  const cycleLanguage = () => {
    if (!setLanguage) return;
    if (language === "ar") setLanguage("fr");
    else if (language === "fr") setLanguage("en");
    else setLanguage("ar");
  };

  const defaultSubject = language === "fr" ? "Matière Principale" : language === "en" ? "Primary Subject" : "المادة الأساسية";
  const defaultSchool = language === "fr" ? "Établissement Scolaire" : language === "en" ? "Educational Institution" : "المؤسسة التعليمية";

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
      {/* 3-Color Top Accent Stripe [Gold | Navy | Burgundy] */}
      <TricolorStripe rounded={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Teacher Greeting and Avatar */}
          <div 
            onClick={() => setActiveTab("settings")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0E1B2E] dark:text-white flex items-center justify-center font-black text-sm border-2 border-[#C89B3C]/50 shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || "Teacher"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#C89B3C] text-[#0E1B2E] rounded-full flex items-center justify-center shadow-xs text-[9px] font-bold">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Greeting Text */}
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <h2 className="text-sm sm:text-base font-black text-[#0E1B2E] dark:text-white tracking-tight">
                {getGreeting()}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#7A142A] dark:text-[#E8829A] font-bold mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>{profile.subject || defaultSubject}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {profile.schoolName || defaultSchool}
                </span>
              </div>
            </div>
          </div>

          {/* Left / Action Controls: Server status (Dev only), Language Switcher, Dark Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Status indicator - Strictly hidden in production, visible only in local development */}
            {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[#F0F4F8] dark:bg-slate-800 text-[#0E1B2E] dark:text-slate-200 border border-[#D1DEEC] dark:border-slate-700">
                {serverStatus.online && serverStatus.hasApiKey ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C89B3C]" />
                    <span className="font-bold">
                      {language === "fr" ? "IA Active" : language === "en" ? "AI Connected" : "الذكاء الاصطناعي متصل"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {language === "fr" ? "Configuration IA" : language === "en" ? "AI Standby" : "تجهيز النموذج"}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Language Quick Switcher */}
            {setLanguage && (
              <button
                type="button"
                onClick={cycleLanguage}
                title={language === "fr" ? "Changer de langue" : language === "en" ? "Change language" : "تغيير لغة التطبيق"}
                aria-label="Language switch"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                <span>{language === "ar" ? "🇩🇿" : language === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                <span className="text-[11px] uppercase font-black">{language}</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              aria-label={language === "fr" ? "Rapports & Notifications" : language === "en" ? "Reports & Notifications" : "الإشعارات والتقارير"}
              className="relative p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7A142A]" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={language === "fr" ? "Basculer le thème" : language === "en" ? "Toggle theme" : "تبديل المظهر"}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#C89B3C]" /> : <Moon className="w-4 h-4 text-[#0E1B2E]" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
