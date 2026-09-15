import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { GradingView } from "./components/GradingView";
import { ClassesView } from "./components/ClassesView";
import { ReportsView } from "./components/ReportsView";
import { RubricsView } from "./components/RubricsView";
import { SettingsView } from "./components/SettingsView";
import { AuthModal } from "./components/AuthModal";
import { 
  ActiveTab, 
  ClassRoom, 
  RubricTemplate, 
  TeacherNote, 
  TeacherDoc,
  UserProfile,
  AppLanguage 
} from "./types";
import { 
  getStoredClasses, 
  saveStoredClasses, 
  getStoredRubrics, 
  getStoredNotes, 
  getStoredDocs,
  getStoredProfile,
  saveStoredProfile
} from "./lib/storage";
import { translations } from "./lib/i18n";

const DEFAULT_SAMPLE_CLASSES: ClassRoom[] = [
  {
    id: "sample_class_1",
    name: "4 متوسط 1",
    subject: "علوم الطبيعة والحياة",
    academic_year: "2026/2027",
    created_at: new Date().toISOString(),
    students: [
      { id: "st_1", name: "محمد الأمين بن سالم" },
      { id: "st_2", name: "فاطمة الزهراء قاسمي" },
      { id: "st_3", name: "ياسين شريفي" },
      { id: "st_4", name: "خديجة بوعبد الله" },
      { id: "st_5", name: "عبد الرحمن بلحاج" },
    ],
  },
  {
    id: "sample_class_2",
    name: "1 ثانوي علمي 2",
    subject: "الرياضيات",
    academic_year: "2026/2027",
    created_at: new Date().toISOString(),
    students: [
      { id: "st_201", name: "إلياس رحماني" },
      { id: "st_202", name: "مريم بن عيسى" },
      { id: "st_203", name: "أيوب مرابط" },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("grading");
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [rubrics, setRubrics] = useState<RubricTemplate[]>([]);
  const [notes, setNotes] = useState<TeacherNote[]>([]);
  const [docs, setDocs] = useState<TeacherDoc[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    title: "أستاذ",
    gender: "male",
    subject: "",
    isRegistered: false,
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState<boolean>(false);

  const [language, setLanguage] = useState<AppLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tashihai:lang") as AppLanguage;
      if (saved === "ar" || saved === "fr" || saved === "en") return saved;
    }
    return "ar";
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tashihai:theme") === "dark";
    }
    return false;
  });

  const [serverStatus, setServerStatus] = useState<{ online: boolean; hasApiKey: boolean }>({
    online: true,
    hasApiKey: true,
  });

  // Language direction and attribute sync
  useEffect(() => {
    localStorage.setItem("tashihai:lang", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tashihai:theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tashihai:theme", "light");
    }
  }, [darkMode]);

  // Load from IndexedDB on startup
  useEffect(() => {
    async function loadData() {
      try {
        const storedClasses = await getStoredClasses();
        if (storedClasses.length > 0) {
          setClasses(storedClasses);
        } else {
          // Seed initial default classroom so teacher sees an active space immediately
          setClasses(DEFAULT_SAMPLE_CLASSES);
          await saveStoredClasses(DEFAULT_SAMPLE_CLASSES);
        }

        const storedRubrics = await getStoredRubrics();
        setRubrics(storedRubrics);

        const storedNotes = await getStoredNotes();
        setNotes(storedNotes);

        const storedDocs = await getStoredDocs();
        setDocs(storedDocs);

        const storedProfile = await getStoredProfile();
        setProfile(storedProfile);
        if (storedProfile.language) {
          setLanguage(storedProfile.language);
        }

        // Check if user has completed initial profile registration
        if (!storedProfile.isRegistered && (!storedProfile.name || storedProfile.name === "الأستاذ الفاضل")) {
          setShowAuthModal(true);
        }
        setHasCheckedProfile(true);
      } catch (err) {
        console.warn("Error loading data from IndexedDB:", err);
        setHasCheckedProfile(true);
      }
    }

    loadData();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setServerStatus({
          online: true,
          hasApiKey: Boolean(data.hasApiKey),
        });
      } else {
        setServerStatus({ online: false, hasApiKey: false });
      }
    } catch {
      setServerStatus({ online: false, hasApiKey: false });
    }
  };

  // Switch to grading tab with a specific student selected
  const handleSelectStudentToGrade = (_classId: string, _studentId: string) => {
    setActiveTab("grading");
  };

  // Use a saved rubric for grading
  const handleUseRubricForGrading = (_rubric: RubricTemplate) => {
    setActiveTab("grading");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A101D] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Header
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-32">
        {activeTab === "grading" && (
          <GradingView
            classes={classes}
            rubrics={rubrics}
            profile={profile}
            language={language}
            onUpdateClasses={setClasses}
            onOpenRubricsTab={() => setActiveTab("rubrics")}
            onOpenClassesTab={() => setActiveTab("classes")}
          />
        )}

        {activeTab === "classes" && (
          <ClassesView
            classes={classes}
            profile={profile}
            language={language}
            onUpdateClasses={setClasses}
            onSelectStudentToGrade={handleSelectStudentToGrade}
          />
        )}

        {activeTab === "reports" && (
          <ReportsView
            classes={classes}
            profile={profile}
            language={language}
            onOpenClassesTab={() => setActiveTab("classes")}
          />
        )}

        {activeTab === "rubrics" && (
          <RubricsView
            rubrics={rubrics}
            notes={notes}
            docs={docs}
            classes={classes}
            profile={profile}
            language={language}
            onUpdateRubrics={setRubrics}
            onUpdateNotes={setNotes}
            onUpdateDocs={setDocs}
            onUseRubricForGrading={handleUseRubricForGrading}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            profile={profile}
            classes={classes}
            serverStatus={serverStatus}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
            onUpdateProfile={(updatedProfile) => {
              setProfile(updatedProfile);
              if (updatedProfile.language && updatedProfile.language !== language) {
                setLanguage(updatedProfile.language);
              }
            }}
            onUpdateClasses={setClasses}
            onRefreshHealth={checkHealth}
          />
        )}
      </main>

      {/* Footer (placed above bottom navigation bar) */}
      <footer className="mb-16 sm:mb-18 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {translations[language]?.footer?.copyright || "Tashihy (تصحيحي) © 2026"}
          </span>
          <span className="text-[11px] text-slate-400">
            {translations[language]?.footer?.features || "IndexedDB • OCR"}
          </span>
        </div>
      </footer>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classesCount={classes.length}
        language={language}
      />

      {/* Initial Registration / Sign Up Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          initialProfile={profile}
          language={language}
          onComplete={async (newProfile) => {
            setProfile(newProfile);
            setShowAuthModal(false);
            await saveStoredProfile(newProfile);
          }}
        />
      )}
    </div>
  );
}
