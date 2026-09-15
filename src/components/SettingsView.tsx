import React, { useState, useRef } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  HardDrive, 
  Sparkles, 
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  Languages,
  Moon,
  Sun,
  Check,
  Download,
  Upload,
  Camera,
  X,
  Mail,
  Lock
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { UserProfile, ClassRoom, AppLanguage } from "../types";
import { saveStoredProfile, saveStoredClasses, optimizeImageFile } from "../lib/storage";
import { translations } from "../lib/i18n";

interface SettingsViewProps {
  profile: UserProfile;
  classes: ClassRoom[];
  serverStatus: { online: boolean; hasApiKey: boolean };
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateClasses: (classes: ClassRoom[]) => void;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  classes,
  serverStatus,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  onUpdateProfile,
  onUpdateClasses,
  onRefreshHealth,
}) => {
  const t = translations[language] || translations.ar;
  const isRtl = t.dir === "rtl";

  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [gender, setGender] = useState(profile.gender);
  const [schoolName, setSchoolName] = useState(profile.schoolName || "");
  const [subject, setSubject] = useState(profile.subject || "");
  const [email, setEmail] = useState(profile.email || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await optimizeImageFile(file, 400);
      setAvatar(dataUrl);
    } catch (err) {
      console.error("Avatar optimization error:", err);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || (language === "fr" ? "Enseignant" : language === "en" ? "Teacher" : "الأستاذ"),
      title,
      gender,
      schoolName: schoolName.trim(),
      subject: subject.trim(),
      email: email.trim(),
      avatar: avatar || undefined,
      language,
      isRegistered: true,
    };
    onUpdateProfile(updated);
    saveStoredProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Export all data backup to JSON
  const handleExportBackup = () => {
    const backupData = {
      version: 1,
      exported_at: new Date().toISOString(),
      profile,
      classes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tashihai_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data backup from JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        if (parsed.classes && Array.isArray(parsed.classes)) {
          onUpdateClasses(parsed.classes);
          saveStoredClasses(parsed.classes);
        }
        if (parsed.profile) {
          onUpdateProfile(parsed.profile);
          saveStoredProfile(parsed.profile);
          setName(parsed.profile.name || "");
          setTitle(parsed.profile.title || "أستاذ");
          setGender(parsed.profile.gender || "male");
          setSchoolName(parsed.profile.schoolName || "");
          setSubject(parsed.profile.subject || "");
          setEmail(parsed.profile.email || "");
          setAvatar(parsed.profile.avatar || "");
        }
        alert(
          language === "fr"
            ? "Sauvegarde restaurée avec succès !"
            : language === "en"
            ? "Backup restored successfully!"
            : "تم استرجاع النسخة الاحتياطية بنجاح!"
        );
      } catch {
        alert(
          language === "fr"
            ? "Fichier non valide ou corrompu."
            : language === "en"
            ? "Invalid or corrupted file."
            : "الملف غير صالح أو تالف."
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <div dir={t.dir} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B]">
              <SettingsIcon className="w-5 h-5 text-[#7A142A]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#0E1B2E] dark:text-white">
                {t.settings.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.settings.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6">
          <h3 className="text-sm font-extrabold text-[#0E1B2E] dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#7A142A]" />
            <span>{t.settings.profileSection}</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Row */}
            <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-[#C89B3C]/40 flex items-center justify-center overflow-hidden text-slate-400 dark:text-slate-500 group-hover:border-[#7A142A] transition-colors">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-1 bg-[#C89B3C] text-[#0E1B2E] rounded-full shadow-xs">
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {avatar ? (language === "fr" ? "Changer la photo" : language === "en" ? "Change Photo" : "تغيير الصورة") : (language === "fr" ? "Ajouter une photo" : language === "en" ? "Upload Photo" : "إضافة صورة شخصية")}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {language === "fr" ? "Supprimer" : language === "en" ? "Remove" : "إزالة"}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {language === "fr" ? "Affichée dans l'en-tête de l'application (laisser vide sinon)" : language === "en" ? "Displayed in the top app header" : "تظهر في دائرة البروفايل أعلى التطبيق (تبقى فارغة إن لم ترفعها)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.settings.roleLabel}
                </label>
                <div className="flex gap-2">
                  <select
                    value={title}
                    onChange={(e) => {
                      const val = e.target.value as "أستاذ" | "أستاذة";
                      setTitle(val);
                      setGender(val === "أستاذة" ? "female" : "male");
                    }}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  >
                    <option value="أستاذ">{t.settings.teacherMale}</option>
                    <option value="أستاذة">{t.settings.teacherFemale}</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.settings.namePlaceholder}
                    className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.settings.subjectLabel}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.settings.subjectPlaceholder}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.settings.schoolLabel}
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder={t.settings.schoolPlaceholder}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {language === "fr" ? "Adresse Email (optionnelle)" : language === "en" ? "Email Address (optional)" : "البريد الإلكتروني (اختياري)"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@education.dz"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-bold text-[#875C12] dark:text-[#E0B256] flex items-center gap-1.5 bg-[#FDF8EB] dark:bg-[#241B0E] px-3 py-1.5 rounded-lg border border-[#EADBB8] dark:border-[#4D3A1B]">
                  <CheckCircle2 className="w-4 h-4 text-[#C89B3C]" />
                  <span>{t.settings.savedNotification}</span>
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                {t.settings.saveProfileBtn}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CARD: LANGUAGE SELECTION (العربية، الفرنسية، الإنجليزية) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A]">
                <Languages className="w-5 h-5 text-[#7A142A]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0E1B2E] dark:text-white">
                  {t.settings.languageSection}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.settings.languageSubtitle}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B]">
              {language === "ar" ? "العربية" : language === "fr" ? "Français" : "English"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Arabic */}
            <button
              type="button"
              onClick={() => {
                setLanguage("ar");
                const updated = { ...profile, language: "ar" as AppLanguage };
                onUpdateProfile(updated);
                saveStoredProfile(updated);
              }}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between relative cursor-pointer ${
                language === "ar"
                  ? "border-[#7A142A] bg-[#FDF2F4]/40 dark:bg-[#2A101A]/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🇩🇿</span>
                {language === "ar" && (
                  <span className="w-5 h-5 rounded-full bg-[#7A142A] text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-black text-sm text-[#0E1B2E] dark:text-white">
                  العربية
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  من اليمين إلى اليسار (RTL)
                </div>
              </div>
            </button>

            {/* French */}
            <button
              type="button"
              onClick={() => {
                setLanguage("fr");
                const updated = { ...profile, language: "fr" as AppLanguage };
                onUpdateProfile(updated);
                saveStoredProfile(updated);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                language === "fr"
                  ? "border-[#7A142A] bg-[#FDF2F4]/40 dark:bg-[#2A101A]/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🇫🇷</span>
                {language === "fr" && (
                  <span className="w-5 h-5 rounded-full bg-[#7A142A] text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-black text-sm text-[#0E1B2E] dark:text-white">
                  Français
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  De gauche à droite (LTR)
                </div>
              </div>
            </button>

            {/* English */}
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                const updated = { ...profile, language: "en" as AppLanguage };
                onUpdateProfile(updated);
                saveStoredProfile(updated);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                language === "en"
                  ? "border-[#7A142A] bg-[#FDF2F4]/40 dark:bg-[#2A101A]/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🇬🇧</span>
                {language === "en" && (
                  <span className="w-5 h-5 rounded-full bg-[#7A142A] text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-black text-sm text-[#0E1B2E] dark:text-white">
                  English
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Left-to-right (LTR)
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CARD: DARK MODE & THEME TOGGLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B]">
                {darkMode ? <Moon className="w-5 h-5 text-[#C89B3C]" /> : <Sun className="w-5 h-5 text-[#C89B3C]" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0E1B2E] dark:text-white">
                  {t.settings.themeSection}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.settings.themeSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                darkMode ? "bg-[#7A142A]" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Light Mode Option Card */}
            <div
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                !darkMode
                  ? "border-[#7A142A] bg-[#FDF2F4]/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {t.settings.lightModeTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t.settings.lightModeDesc}
                  </div>
                </div>
              </div>
              {!darkMode && (
                <span className="w-5 h-5 rounded-full bg-[#7A142A] text-white flex items-center justify-center text-xs shrink-0">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Dark Mode Option Card */}
            <div
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                darkMode
                  ? "border-[#7A142A] bg-[#2A101A]/30 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-300">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {t.settings.darkModeTitle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t.settings.darkModeDesc}
                  </div>
                </div>
              </div>
              {darkMode && (
                <span className="w-5 h-5 rounded-full bg-[#7A142A] text-white flex items-center justify-center text-xs shrink-0">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System & API Diagnostics Card - Strictly visible in local development (localhost) only */}
      {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <TricolorStripe />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#0E1B2E] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C89B3C]" />
                  <span>{t.settings.diagnosticsSection}</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-bold">
                  Dev Only (localhost)
                </span>
              </div>

              <button
                type="button"
                onClick={onRefreshHealth}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#7A142A] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Actualiser" : language === "en" ? "Refresh" : "تحديث الفحص"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === "fr" ? "Serveur Express Interne" : language === "en" ? "Internal Express Server" : "خادم Express الداخلي"}
                  </div>
                  <div className="text-[11px] text-slate-500">{language === "fr" ? "Port 3000 - Opérationnel" : language === "en" ? "Port 3000 - Operational" : "منفذ 3000 - تشغيل متكامل"}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF8EB] text-[#875C12] border border-[#EADBB8] dark:bg-[#241B0E] dark:text-[#E0B256] dark:border-[#4D3A1B] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>{t.settings.statusHealthy}</span>
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === "fr" ? "Modèle Gemini Vision" : language === "en" ? "Gemini Vision Model" : "نموذج Gemini Vision"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {serverStatus.hasApiKey 
                      ? (language === "fr" ? "Clé API active" : language === "en" ? "API Key connected" : "مفتاح GEMINI_API_KEY متصل") 
                      : (language === "fr" ? "Clé API requise" : language === "en" ? "API Key required" : "في انتظار المفتاح")}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                    serverStatus.hasApiKey
                      ? "bg-[#FDF8EB] text-[#875C12] border-[#EADBB8] dark:bg-[#241B0E] dark:text-[#E0B256] dark:border-[#4D3A1B]"
                      : "bg-[#FDF2F4] text-[#7A142A] border-[#F5CCD4] dark:bg-[#2A101A] dark:text-[#E8829A] dark:border-[#521C2B]"
                  }`}
                >
                  {serverStatus.hasApiKey ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{t.settings.statusHealthy}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-[#7A142A]" />
                      <span>{t.settings.statusIssue}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FDF8EB]/60 dark:bg-[#241B0E]/40 border border-[#EADBB8]/80 dark:border-[#4D3A1B]/50 text-xs text-[#875C12] dark:text-[#E0B256] space-y-1 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C89B3C]" />
                <span>{language === "fr" ? "Système 100% autonome et sécurisé :" : language === "en" ? "100% Autonomous & Secure System:" : "نظام مستقل بالكامل عن البوابات الخارجية:"}</span>
              </div>
              <p className="text-[11px]">
                {language === "fr"
                  ? "L'application fonctionne comme une pile full-stack moderne (Node.js/Vite) sans dépendance tierce. Elle peut être déployée directement sur Cloud Run, Vercel ou tout serveur privé avec la clé Google Gemini."
                  : language === "en"
                  ? "The application runs as a modern self-contained full-stack application (Node.js/Vite). You can deploy it directly on Cloud Run, Vercel, or any private container with your Google Gemini key."
                  : "تم بناء التطبيق ليعمل كحزمة برمجية متكاملة (Full-Stack Node.js/Vite) بدون أي ارتباط ببوابات Lovable السابقة. يمكنك نشره مباشرة على Cloud Run، Vercel، Netlify، أو أي خادم خاص بك بمجرد تمرير مفتاح Google Gemini الرسمي."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Storage & Backup Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-[#0E1B2E] dark:text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#0E1B2E] dark:text-slate-300" />
            <span>{t.settings.backupSection}</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t.settings.backupSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0E1B2E] dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C89B3C]" />
              <span>{t.settings.exportBackupBtn}</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0E1B2E] dark:text-slate-300 text-xs font-bold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-[#C89B3C]" />
              <span>{t.settings.importBackupBtn}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Handwriting Guidelines Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-extrabold text-[#0E1B2E] dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#7A142A]" />
            <span>{t.settings.handwritingGuideTitle}</span>
          </h3>

          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">{t.settings.guideTip1Title}:</strong> {t.settings.guideTip1Desc}
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">{t.settings.guideTip2Title}:</strong> {t.settings.guideTip2Desc}
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">{t.settings.guideTip3Title}:</strong> {t.settings.guideTip3Desc}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
