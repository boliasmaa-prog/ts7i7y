import React, { useState, useRef } from "react";
import {
  GraduationCap,
  Sparkles,
  Camera,
  Upload,
  User,
  Mail,
  Lock,
  Building2,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { UserProfile, AppLanguage } from "../types";
import { optimizeImageFile } from "../lib/storage";

interface AuthModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  language?: AppLanguage;
  initialProfile?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onComplete,
  language = "ar",
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name && initialProfile.name !== "الأستاذ الفاضل" ? initialProfile.name : "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [password, setPassword] = useState(initialProfile?.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState<"أستاذ" | "أستاذة">(initialProfile?.title || "أستاذ");
  const [gender, setGender] = useState<"male" | "female">(initialProfile?.gender || "male");
  const [subject, setSubject] = useState(initialProfile?.subject || "");
  const [schoolName, setSchoolName] = useState(initialProfile?.schoolName || "");
  const [avatar, setAvatar] = useState<string>(initialProfile?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState<string>(initialProfile?.avatar || "");
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isAr = language === "ar";
  const isFr = language === "fr";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingAvatar(true);
    try {
      const dataUrl = await optimizeImageFile(file, 400);
      setAvatar(dataUrl);
      setAvatarPreview(dataUrl);
    } catch (err) {
      console.error("Avatar optimization error:", err);
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatar("");
    setAvatarPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isAr ? "يرجى كتابة الاسم واللقب" : isFr ? "Veuillez entrer votre nom complet" : "Please enter your full name");
      return;
    }
    if (!subject.trim()) {
      setError(isAr ? "يرجى تحديد المادة التعليمية" : isFr ? "Veuillez préciser la matière enseignée" : "Please specify your subject");
      return;
    }
    if (!schoolName.trim()) {
      setError(isAr ? "يرجى كتابة اسم المؤسسة التعليمية" : isFr ? "Veuillez indiquer l'établissement scolaire" : "Please enter your school name");
      return;
    }

    const newProfile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      password: password,
      title,
      gender,
      subject: subject.trim(),
      schoolName: schoolName.trim(),
      avatar: avatar || undefined,
      language: (language || "ar") as AppLanguage,
      isRegistered: true,
      createdAt: new Date().toISOString(),
    };

    onComplete(newProfile);
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <TricolorStripe />

        {/* Modal Top Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] mb-2 shadow-xs">
            <GraduationCap className="w-6 h-6 text-[#7A142A]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0E1B2E] dark:text-white">
            {isAr ? "مرحباً بك في منصة Tashihy" : isFr ? "Bienvenue sur Tashihy" : "Welcome to Tashihy"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {isAr
              ? "أنشئ حسابك التعليمي للبدء في تصحيح أوراق الامتحانات وإدارة الأقسام والنتائج مباشرة"
              : isFr
              ? "Créez votre profil enseignant pour corriger vos copies et gérer vos classes dès maintenant"
              : "Create your teacher profile to grade student exam sheets and manage your classrooms"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Picture Picker (Circle) */}
          <div className="flex flex-col items-center justify-center pb-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0E1B2E] to-[#7A142A] text-white flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md overflow-hidden relative transition-transform group-hover:scale-105">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Teacher Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-200">
                    <User className="w-8 h-8 opacity-80" />
                  </div>
                )}
              </div>

              {/* Edit/Camera Floating Badge */}
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#C89B3C] text-[#0E1B2E] border-2 border-white dark:border-slate-900 shadow-xs flex items-center justify-center transition-transform group-hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
              </div>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow-sm hover:bg-rose-700 transition-colors"
                  title={isAr ? "حذف الصورة" : "Supprimer la photo"}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              {avatarPreview
                ? (isAr ? "تم تحديد الصورة بنجاح (انقر للتغيير)" : "Photo sélectionnée (cliquez pour changer)")
                : (isAr ? "صورة الأستاذ(ة) (اختياري، تبقى فارغة إذا لم ترفعها)" : "Photo de profil (optionnelle)")}
            </span>
          </div>

          {/* Gender / Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isAr ? "الصفة والجنس" : isFr ? "Titre & Civilité" : "Title & Gender"} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTitle("أستاذ");
                  setGender("male");
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gender === "male"
                    ? "bg-[#FDF8EB] text-[#875C12] border-[#C89B3C] dark:bg-[#241B0E] dark:text-[#E0B256] shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${gender === "male" ? "text-[#C89B3C]" : "opacity-30"}`} />
                <span>{isAr ? "أستاذ (معلم)" : isFr ? "Professeur (H)" : "Teacher (Male)"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle("أستاذة");
                  setGender("female");
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  gender === "female"
                    ? "bg-[#FDF2F4] text-[#7A142A] border-[#7A142A] dark:bg-[#2A101A] dark:text-[#E8829A] shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${gender === "female" ? "text-[#7A142A]" : "opacity-30"}`} />
                <span>{isAr ? "أستاذة (معلمة)" : isFr ? "Professeure (F)" : "Teacher (Female)"}</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAr ? "الاسم واللقب الكامل" : isFr ? "Nom & Prénom" : "Full Name"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "مثال: عبد القادر الجزائري / مريم بن عيسى" : isFr ? "Ex: Mohammed Ali" : "e.g. John Doe"}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-[#7A142A] font-medium"
              />
            </div>
          </div>

          {/* Subject & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? "المادة التعليمية" : isFr ? "Matière enseignée" : "Subject"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isAr ? "مثال: الرياضيات، اللغة العربية، العلوم" : isFr ? "Ex: Mathématiques, Français" : "e.g. Mathematics, Science"}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-[#7A142A] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? "المؤسسة التعليمية" : isFr ? "Établissement scolaire" : "School / Institution"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder={isAr ? "مثال: ثانوية ابن باديس / متوسطة الفداء" : isFr ? "Ex: Lycée Ibn Badis" : "e.g. Lincoln High School"}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-[#7A142A] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? "البريد الإلكتروني (اختياري)" : isFr ? "Adresse Email (optionnel)" : "Email (optional)"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@education.dz"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-[#7A142A] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? "كلمة المرور (اختياري)" : isFr ? "Mot de passe (optionnel)" : "Password (optional)"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-9 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-[#7A142A] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A142A] to-[#9E1B38] hover:from-[#6B1124] hover:to-[#881730] text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{isAr ? "إتمام التسجيل والدخول إلى التطبيق" : isFr ? "Créer mon compte et commencer" : "Register & Start Grading"}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
