import React, { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Edit3,
  User,
  Camera,
  FolderOpen,
  Building2,
  Upload,
  Plus,
  X
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { CameraModal } from "./CameraModal";
import { ClassRoom, Student, RubricTemplate, GradingResult, UserProfile, AppLanguage } from "../types";
import { optimizeImageFile, saveStoredClasses } from "../lib/storage";
import { translations } from "../lib/i18n";

interface GradingViewProps {
  classes: ClassRoom[];
  rubrics: RubricTemplate[];
  profile: UserProfile;
  language?: AppLanguage;
  onUpdateClasses: (classes: ClassRoom[]) => void;
  onOpenRubricsTab: () => void;
  onOpenClassesTab?: () => void;
}

export const GradingView: React.FC<GradingViewProps> = ({
  classes,
  rubrics,
  profile,
  language = "ar",
  onUpdateClasses,
  onOpenRubricsTab,
  onOpenClassesTab = () => {},
}) => {
  const t = translations[language] || translations.ar;
  const isRtl = t.dir === "rtl";
  const ArrowNext = isRtl ? ArrowLeft : ArrowRight;

  // Selection state
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Upload state
  const [studentImages, setStudentImages] = useState<string[]>([]);
  const [keyImages, setKeyImages] = useState<string[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [cameraMode, setCameraMode] = useState<"key" | "student" | null>(null);
  const [isDraggingStudent, setIsDraggingStudent] = useState<boolean>(false);
  const [isDraggingKey, setIsDraggingKey] = useState<boolean>(false);

  // Processing state
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingStep, setGradingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [currentResult, setCurrentResult] = useState<GradingResult | null>(null);
  const [isSavedToRoster, setIsSavedToRoster] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Quick Add Class / Student modals
  const [showQuickAddClass, setShowQuickAddClass] = useState<boolean>(false);
  const [quickClassName, setQuickClassName] = useState<string>("");
  const [quickClassSubject, setQuickClassSubject] = useState<string>("");

  const [showQuickAddStudent, setShowQuickAddStudent] = useState<boolean>(false);
  const [quickStudentName, setQuickStudentName] = useState<string>("");

  const studentInputRef = useRef<HTMLInputElement>(null);
  const studentCameraInputRef = useRef<HTMLInputElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const keyCameraInputRef = useRef<HTMLInputElement>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentStudent = currentClass?.students.find((s) => s.id === selectedStudentId);

  // Handle student images upload
  const handleStudentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);
    try {
      const files = Array.from(e.target.files) as File[];
      const optimized: string[] = [];
      for (const file of files) {
        const dataUrl = await optimizeImageFile(file);
        optimized.push(dataUrl);
      }
      setStudentImages((prev) => [...prev, ...optimized].slice(0, 10));
    } catch (err: any) {
      setError(err?.message || t.common.error);
    }
  };

  // Handle student drop
  const handleStudentDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingStudent(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    setError(null);
    try {
      const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith("image/"));
      if (files.length === 0) return;
      const optimized: string[] = [];
      for (const file of files) {
        const dataUrl = await optimizeImageFile(file);
        optimized.push(dataUrl);
      }
      setStudentImages((prev) => [...prev, ...optimized].slice(0, 10));
    } catch (err: any) {
      setError(err?.message || t.common.error);
    }
  };

  // Handle key images upload
  const handleKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);
    try {
      const files = Array.from(e.target.files) as File[];
      const optimized: string[] = [];
      for (const file of files) {
        const dataUrl = await optimizeImageFile(file);
        optimized.push(dataUrl);
      }
      setKeyImages((prev) => [...prev, ...optimized].slice(0, 10));
      setSelectedRubricId("");
    } catch (err: any) {
      setError(err?.message || t.common.error);
    }
  };

  // Handle key drop
  const handleKeyDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingKey(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    setError(null);
    try {
      const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) => f.type.startsWith("image/"));
      if (files.length === 0) return;
      const optimized: string[] = [];
      for (const file of files) {
        const dataUrl = await optimizeImageFile(file);
        optimized.push(dataUrl);
      }
      setKeyImages((prev) => [...prev, ...optimized].slice(0, 10));
      setSelectedRubricId("");
    } catch (err: any) {
      setError(err?.message || t.common.error);
    }
  };

  // When picking a saved rubric
  const handleSelectRubric = (rubricId: string) => {
    setSelectedRubricId(rubricId);
    if (!rubricId) {
      setKeyImages([]);
      return;
    }
    const found = rubrics.find((r) => r.id === rubricId);
    if (found) {
      setKeyImages(found.images);
    }
  };

  // Execute AI Grading
  const startGrading = async () => {
    if (studentImages.length === 0) {
      setError(t.grading.uploadStudentTitle);
      return;
    }
    if (keyImages.length === 0) {
      setError(t.grading.uploadKeyTitle);
      return;
    }

    setIsGrading(true);
    setError(null);
    setCurrentResult(null);
    setIsSavedToRoster(false);

    try {
      setGradingStep(t.grading.step1);
      await new Promise((r) => setTimeout(r, 350));

      setGradingStep(t.grading.step2);
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentImages,
          keyImages,
          subjectHint: currentClass?.subject || profile?.subject || "",
        }),
      });

      setGradingStep(t.grading.step3);
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `${t.common.error} (${response.status})`);
      }

      const data = await response.json();
      setGradingStep(t.grading.step4);

      const result: GradingResult = {
        score: data.score,
        total: data.total,
        questions: data.questions || [],
        feedback: data.feedback,
        detected_student_name: data.detected_student_name,
        graded_at: new Date().toISOString(),
      };

      setCurrentResult(result);

      // Trigger celebratory confetti if passed
      if (result.score >= result.total / 2) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      // If a student is selected in a class, automatically offer to save
      if (currentClass && currentStudent) {
        saveResultToStudent(result, currentClass.id, currentStudent.id);
      }
    } catch (err: any) {
      console.error("Grading error:", err);
      let msg = err?.message || t.common.error;
      if (
        typeof msg === "string" &&
        (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE"))
      ) {
        msg = language === "fr" 
          ? "Les serveurs connaissent une forte demande momentanée. Cliquez sur 'Réessayer' ci-dessous."
          : language === "en"
          ? "AI servers are experiencing high demand. Please click 'Retry' below."
          : "خوادم الذكاء الاصطناعي تشهد ضغطاً مؤقتاً في هذه اللحظة. يُرجى النقر على زر 'إعادة المحاولة الآن' أدناه.";
      } else if (
        typeof msg === "string" &&
        (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED"))
      ) {
        msg = language === "fr"
          ? "Limite de requêtes atteinte. Attendez quelques secondes puis cliquez sur Réessayer."
          : language === "en"
          ? "Rate limit reached. Please wait a few seconds and click Retry."
          : "تم تجاوز حد الطلبات المؤقت. يُرجى الانتظار بضع ثوانٍ ثم النقر على 'إعادة المحاولة'.";
      }
      setError(msg);
    } finally {
      setIsGrading(false);
      setGradingStep("");
    }
  };

  // Save result to the selected student in roster
  const saveResultToStudent = (
    resultToSave: GradingResult,
    classId: string,
    studentId: string
  ) => {
    const updated = classes.map((cls) => {
      if (cls.id !== classId) return cls;
      return {
        ...cls,
        students: cls.students.map((st) => {
          if (st.id !== studentId) return st;
          return {
            ...st,
            result: resultToSave,
            updated_at: new Date().toISOString(),
          };
        }),
      };
    });

    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setIsSavedToRoster(true);
  };

  // Move to next student in the list
  const handleNextStudent = () => {
    if (!currentClass || currentClass.students.length === 0) return;
    const idx = currentClass.students.findIndex((s) => s.id === selectedStudentId);
    if (idx >= 0 && idx < currentClass.students.length - 1) {
      setSelectedStudentId(currentClass.students[idx + 1].id);
      setStudentImages([]);
      setCurrentResult(null);
      setIsSavedToRoster(false);
    } else if (idx === -1 && currentClass.students.length > 0) {
      setSelectedStudentId(currentClass.students[0].id);
      setStudentImages([]);
      setCurrentResult(null);
      setIsSavedToRoster(false);
    }
  };

  // Update question score in manual edit mode
  const handleUpdateQuestionScore = (questionIndex: number, newScore: number) => {
    if (!currentResult) return;
    const updatedQuestions = [...currentResult.questions];
    const q = updatedQuestions[questionIndex];
    if (!q) return;

    const clampedScore = Math.max(0, Math.min(q.points_possible, newScore));
    updatedQuestions[questionIndex] = { ...q, points_earned: clampedScore };

    const newTotalScore = updatedQuestions.reduce((sum, item) => sum + item.points_earned, 0);

    const updatedResult: GradingResult = {
      ...currentResult,
      questions: updatedQuestions,
      score: Math.round(newTotalScore * 100) / 100,
    };

    setCurrentResult(updatedResult);

    if (currentClass && currentStudent && isSavedToRoster) {
      saveResultToStudent(updatedResult, currentClass.id, currentStudent.id);
    }
  };

  // Quick create class handler
  const handleQuickCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClassName.trim()) return;
    const newClass: ClassRoom = {
      id: "class_" + Date.now(),
      name: quickClassName.trim(),
      subject: quickClassSubject.trim() || profile?.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "التعليم العام"),
      academic_year: "2026/2027",
      students: [],
      created_at: new Date().toISOString(),
    };
    const updated = [...classes, newClass];
    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setSelectedClassId(newClass.id);
    setSelectedStudentId("");
    setQuickClassName("");
    setQuickClassSubject("");
    setShowQuickAddClass(false);
  };

  // Quick create student handler
  const handleQuickCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStudentName.trim() || !currentClass) return;
    const newStudentId = "st_" + Date.now();
    const newStudent: Student = {
      id: newStudentId,
      name: quickStudentName.trim(),
    };
    const updated = classes.map((c) => {
      if (c.id === currentClass.id) {
        return {
          ...c,
          students: [...c.students, newStudent],
        };
      }
      return c;
    });
    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setSelectedStudentId(newStudentId);
    setQuickStudentName("");
    setShowQuickAddStudent(false);
  };

  return (
    <div dir={t.dir} className="space-y-6">
      {/* Brand Title: Tashihy with Ornamental Calligraphy and Tricolor Wave */}
      <div className="text-center pt-2 pb-2">
        <div className="inline-flex flex-col items-center">
          {/* Top subtle ornamental flourish */}
          <div className="flex items-center justify-center gap-2 mb-1.5 opacity-80">
            <span className="w-6 h-[1.5px] bg-gradient-to-r from-transparent to-[#C89B3C]" />
            <svg
              className="w-3.5 h-3.5 text-[#C89B3C] animate-pulse"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            <span className="w-6 h-[1.5px] bg-gradient-to-l from-transparent to-[#7A142A]" />
          </div>

          {/* Main Tashihy Typography with unique font, fixed LTR direction to prevent RTL inversion, and tricolor gradient wave */}
          <div dir="ltr" className="relative inline-flex items-center justify-center px-4 py-0.5">
            <span
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wide select-none drop-shadow-xs inline-flex items-baseline"
              dir="ltr"
              style={{
                direction: "ltr",
                unicodeBidi: "isolate",
                fontFamily: "'Reem Kufi', 'Cinzel Decorative', 'Cairo', serif",
                letterSpacing: "0.04em",
              }}
            >
              {/* Tashih in Deep Navy / Ivory Dark */}
              <span className="text-[#0E1B2E] dark:text-slate-100 transition-colors">
                Tashih
              </span>
              {/* y always at the end with stylized character and tricolor gradient */}
              <span
                className="font-black italic ml-0.5 bg-gradient-to-br from-[#C89B3C] via-[#7A142A] to-[#C89B3C] bg-clip-text text-transparent"
                style={{
                  fontFamily: "'Amiri', 'Cinzel Decorative', serif",
                  display: "inline-block",
                  transform: "translateY(-1px) scale(1.08)",
                }}
              >
                y
              </span>
            </span>

            {/* Subtle decorative dot/sparkle */}
            <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] absolute -top-0.5 -right-1 shadow-xs" />
          </div>

          {/* Smooth Tricolor Wave Stripe Underneath (Gold / Navy / Burgundy) */}
          <div className="w-32 sm:w-44 h-1.5 mt-1.5 relative flex items-center justify-center">
            <svg
              className="w-full h-2 overflow-visible"
              viewBox="0 0 160 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="tashihyWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C89B3C" stopOpacity="0.2" />
                  <stop offset="25%" stopColor="#C89B3C" />
                  <stop offset="50%" stopColor="#0E1B2E" />
                  <stop offset="75%" stopColor="#7A142A" />
                  <stop offset="100%" stopColor="#7A142A" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d="M 0 4 Q 40 0, 80 4 T 160 4"
                stroke="url(#tashihyWaveGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          {t.grading.selectClassPrompt}
        </p>
      </div>

      {/* Class and Student Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Classroom */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <TricolorStripe />
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#FDF2F4] text-[#7A142A] border border-[#F5CCD4] dark:bg-[#32121D] dark:text-[#E8829A] dark:border-[#521C2B]">
                {classes.find((c) => c.id === selectedClassId)?.subject || profile?.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "التعليم العام")}
              </span>
              <div className="flex items-center gap-2 text-base font-black text-[#0E1B2E] dark:text-white">
                <Building2 className="w-5 h-5 text-[#C89B3C]" />
                <span>{t.grading.classroom || (language === "fr" ? "Classe" : language === "en" ? "Classroom" : "القسم")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQuickAddClass(true)}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#FDF2F4] dark:bg-[#2A101A] hover:bg-[#FBE4E8] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.grading.addClass || (language === "fr" ? "Ajouter une classe" : language === "en" ? "Add Class" : "إضافة قسم")}</span>
            </button>

            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId("");
              }}
              className="w-full text-xs sm:text-sm bg-[#F4F7FB] dark:bg-slate-800 border border-[#D1DEEC] dark:border-slate-700 rounded-xl px-3 py-2.5 font-bold text-[#0E1B2E] dark:text-white focus:outline-[#7A142A]"
            >
              <option value="">-- {t.grading.selectClassPlaceholder || (language === "fr" ? "Choisir une classe" : language === "en" ? "Select a class" : "اختيار القسم")} --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.students.length} {language === "fr" ? "élèves" : language === "en" ? "students" : "تلميذ"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card 2: Student */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <TricolorStripe />
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {currentClass 
                  ? `${currentClass.students.length} ${language === "fr" ? "élèves inscrits" : language === "en" ? "registered students" : "تلميذ مسجل"}` 
                  : (language === "fr" ? "Aucune classe choisie" : language === "en" ? "No class selected" : "لم يتم تحديد قسم")}
              </span>
              <div className="flex items-center gap-2 text-base font-black text-[#0E1B2E] dark:text-white">
                <User className="w-5 h-5 text-[#C89B3C]" />
                <span>{t.grading.student || (language === "fr" ? "Élève" : language === "en" ? "Student" : "التلميذ")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!currentClass) {
                  setShowQuickAddClass(true);
                } else {
                  setShowQuickAddStudent(true);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#F0F4F8] dark:bg-slate-800 hover:bg-[#E4ECF4] text-[#0E1B2E] dark:text-white border border-[#D1DEEC] dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.grading.addStudent || (language === "fr" ? "Ajouter un élève" : language === "en" ? "Add Student" : "إضافة تلميذ")}</span>
            </button>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!currentClass || currentClass.students.length === 0}
              className="w-full text-xs sm:text-sm bg-[#F4F7FB] dark:bg-slate-800 border border-[#D1DEEC] dark:border-slate-700 rounded-xl px-3 py-2.5 font-bold text-[#0E1B2E] dark:text-white focus:outline-[#7A142A] disabled:opacity-50"
            >
              <option value="">-- {t.grading.selectStudentPlaceholder || (language === "fr" ? "Choisir un élève" : language === "en" ? "Select a student" : "اختيار التلميذ")} --</option>
              {currentClass?.students.map((st, i) => (
                <option key={st.id} value={st.id}>
                  {i + 1}. {st.name} {st.result ? `(${st.result.score}/${st.result.total})` : "⚪"}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onOpenClassesTab}
                className="py-1.5 px-3.5 rounded-xl text-xs font-black bg-[#FDF8EB] dark:bg-[#241B0E] hover:bg-[#FAF0D6] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.grading.quickImport}</span>
              </button>

              {currentClass && currentClass.students.length > 0 && selectedStudentId && (
                <button
                  type="button"
                  onClick={handleNextStudent}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  <span>{t.grading.nextStudent}</span>
                  <ArrowNext className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden bg-gradient-to-br from-[#0E1B2E] via-[#162238] to-[#5C1020] text-white">
        <TricolorStripe />
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl border border-[#C89B3C]/50 bg-white/5 text-[#C89B3C]">
              <Camera className="w-7 h-7" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F4D068] border border-[#F4D068]/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>Tashihy Assistant</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.grading.heroTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-lg">
              {t.grading.heroDesc}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("grading-upload-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm bg-[#C89B3C] hover:bg-[#B88B2E] active:scale-98 text-[#0E1B2E] flex items-center justify-center gap-2 shadow-lg shadow-[#C89B3C]/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.grading.heroAction}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Upload Columns (Answer Key vs Student Sheet) */}
      <div id="grading-upload-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Answer Key & Rubric Column */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden">
          <TricolorStripe />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7A142A] text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-[#0E1B2E] dark:text-white">
                  {t.grading.answerKeyTitle}
                </h3>
              </div>

              {rubrics.length > 0 && (
                <button
                  type="button"
                  onClick={onOpenRubricsTab}
                  className="text-xs text-[#7A142A] dark:text-[#E8829A] hover:underline font-bold cursor-pointer"
                >
                  {t.grading.manageRubrics}
                </button>
              )}
            </div>

            {/* Quick Rubric Picker dropdown if rubrics exist */}
            {rubrics.length > 0 && (
              <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.grading.selectRubricPrompt}
                </label>
                <select
                  value={selectedRubricId}
                  onChange={(e) => handleSelectRubric(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 font-medium text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                >
                  <option value="">-- {t.grading.orUploadNew} --</option>
                  {rubrics.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.images.length} {language === "fr" ? "pages" : language === "en" ? "pages" : "صفحة"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingKey(true);
              }}
              onDragLeave={() => setIsDraggingKey(false)}
              onDrop={handleKeyDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDraggingKey
                  ? "border-[#7A142A] bg-[#FDF2F4] dark:bg-[#2A101A] scale-[1.01]"
                  : "border-slate-300 dark:border-slate-700 hover:border-[#7A142A] dark:hover:border-[#C89B3C] bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              {/* Standard file input */}
              <input
                id="key-file-upload"
                ref={keyInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={handleKeyUpload}
              />
              {/* Camera direct input */}
              <input
                id="key-camera-upload"
                ref={keyCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={handleKeyUpload}
              />

              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-2xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] mb-2">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.grading.uploadKeyTitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
                  {t.grading.uploadKeyDesc}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-xs">
                  <label
                    htmlFor="key-file-upload"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold cursor-pointer shadow-sm shadow-[#7A142A]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{t.grading.chooseFromDevice}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setCameraMode("key")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FDF8EB] hover:bg-[#FAF0D6] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] text-xs font-bold cursor-pointer border border-[#EADBB8] dark:border-[#4D3A1B] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Camera className="w-4 h-4 text-[#C89B3C]" />
                    <span>{t.grading.openCamera}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded key thumbnails */}
            {keyImages.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  <span>{language === "fr" ? `Pages du corrigé (${keyImages.length}):` : language === "en" ? `Answer key pages (${keyImages.length}):` : `صفحات النموذج (${keyImages.length}):`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyImages([]);
                      setSelectedRubricId("");
                    }}
                    className="text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                  >
                    {t.common.deleteAll}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keyImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group w-16 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={img}
                        alt={`Key page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                        p.{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeyImages(keyImages.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 left-1 bg-red-600 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Teacher Subject automatically retrieved from Profile/Classroom */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-[#FDF8EB]/60 dark:bg-[#241B0E]/40 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {t.grading.registeredSubject}:
            </span>
            <span className="font-black px-3 py-1 rounded-full bg-white dark:bg-[#0E1B2E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B] shadow-2xs">
              {currentClass?.subject || profile?.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "التعليم العام")}
            </span>
          </div>
        </div>

        {/* 2. Student Handwritten Answer Sheet Column */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between overflow-hidden">
          <TricolorStripe />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0E1B2E] dark:bg-slate-200 text-white dark:text-[#0E1B2E] font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-[#0E1B2E] dark:text-white">
                  {t.grading.studentSheetTitle}
                </h3>
              </div>
              {currentStudent && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F0F4F8] dark:bg-slate-800 text-[#0E1B2E] dark:text-slate-200 border border-[#D1DEEC] dark:border-slate-700">
                  {currentStudent.name}
                </span>
              )}
            </div>

            {/* Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingStudent(true);
              }}
              onDragLeave={() => setIsDraggingStudent(false)}
              onDrop={handleStudentDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDraggingStudent
                  ? "border-[#0E1B2E] dark:border-[#C89B3C] bg-[#F0F4F8] dark:bg-slate-800 scale-[1.01]"
                  : "border-slate-300 dark:border-slate-700 hover:border-[#0E1B2E] dark:hover:border-[#C89B3C] bg-slate-50/50 dark:bg-slate-800/30"
              }`}
            >
              {/* Standard file input */}
              <input
                id="student-file-upload"
                ref={studentInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={handleStudentUpload}
              />
              {/* Camera direct input */}
              <input
                id="student-camera-upload"
                ref={studentCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={handleStudentUpload}
              />

              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-2xl bg-[#F0F4F8] dark:bg-slate-800 text-[#0E1B2E] dark:text-slate-200 border border-[#D1DEEC] dark:border-slate-700 mb-2">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.grading.uploadStudentTitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
                  {t.grading.uploadStudentDesc}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-xs">
                  <label
                    htmlFor="student-file-upload"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0E1B2E] hover:bg-[#1A2E4C] text-white text-xs font-bold cursor-pointer shadow-sm shadow-[#0E1B2E]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>{t.grading.chooseFromDevice}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setCameraMode("student")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FDF2F4] hover:bg-[#FBE4E8] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] text-xs font-bold cursor-pointer border border-[#F5CCD4] dark:border-[#521C2B] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Camera className="w-4 h-4 text-[#7A142A] dark:text-[#E8829A]" />
                    <span>{t.grading.openCamera}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded student thumbnails */}
            {studentImages.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  <span>{language === "fr" ? `Pages de l'élève (${studentImages.length}):` : language === "en" ? `Student pages (${studentImages.length}):` : `صفحات ورقة التلميذ (${studentImages.length}):`}</span>
                  <button
                    type="button"
                    onClick={() => setStudentImages([])}
                    className="text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                  >
                    {t.common.deleteAll}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {studentImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group w-16 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src={img}
                        alt={`Student page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-bold">
                        p.{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentImages(studentImages.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 left-1 bg-red-600 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#C89B3C] shrink-0" />
            <span>{t.grading.ocrTolerance}</span>
          </div>
        </div>
      </div>

      {/* Error alert with retry action */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-800 dark:text-red-300 animate-fadeIn">
          <div className="flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <span className="font-bold">{t.common.error}: </span>
              <span>{error}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={startGrading}
            disabled={isGrading}
            className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.common.retry}</span>
          </button>
        </div>
      )}

      {/* Action Button: Start Grading */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
        <button
          type="button"
          disabled={isGrading || studentImages.length === 0 || keyImages.length === 0}
          onClick={startGrading}
          className={`w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-3 transition-all shadow-md ${
            isGrading || studentImages.length === 0 || keyImages.length === 0
              ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-[#7A142A] hover:bg-[#681123] active:scale-98 text-white shadow-lg shadow-[#7A142A]/30 cursor-pointer"
          }`}
        >
          {isGrading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-[#C89B3C]" />
              <span>{t.grading.gradingInProgress}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#C89B3C]" />
              <span>{t.grading.startGrading}</span>
            </>
          )}
        </button>

        {currentResult && (
          <button
            type="button"
            onClick={() => {
              setStudentImages([]);
              setCurrentResult(null);
              setIsSavedToRoster(false);
            }}
            className="text-xs font-bold px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.grading.clearAndGradeNew}
          </button>
        )}
      </div>

      {/* Animated Grading Progress State */}
      {isGrading && (
        <div className="bg-[#FDF2F4] dark:bg-[#2A101A] border border-[#F5CCD4] dark:border-[#521C2B] rounded-2xl p-6 text-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#7A142A] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#7A142A]/30">
            <Sparkles className="w-6 h-6 animate-spin text-[#C89B3C]" />
          </div>
          <h4 className="font-extrabold text-base text-[#0E1B2E] dark:text-white mb-1">
            {t.grading.gradingInProgress}
          </h4>
          <p className="text-xs font-bold text-[#7A142A] dark:text-[#E8829A]">
            {gradingStep || t.common.loading}
          </p>
          <div className="w-48 h-1.5 bg-[#F5CCD4] dark:bg-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#C89B3C] via-[#7A142A] to-[#0E1B2E] rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* RESULT CARD: Displayed when grading finishes */}
      {currentResult && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 overflow-hidden animate-fadeIn">
          <TricolorStripe />
          <div className="p-6 space-y-6">
            {/* Header of Result */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {/* Score Circle */}
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-black shadow-inner ${
                    currentResult.score >= currentResult.total * 0.75
                      ? "bg-[#FDF8EB] dark:bg-[#241B0E] border-[#EADBB8] dark:border-[#4D3A1B] text-[#875C12] dark:text-[#E0B256]"
                      : currentResult.score >= currentResult.total * 0.5
                      ? "bg-[#F0F4F8] dark:bg-slate-800 border-[#D1DEEC] dark:border-slate-700 text-[#0E1B2E] dark:text-slate-200"
                      : "bg-[#FDF2F4] dark:bg-[#2A101A] border-[#F5CCD4] dark:border-[#521C2B] text-[#7A142A] dark:text-[#E8829A]"
                  }`}
                >
                  <span className="text-2xl">{currentResult.score}</span>
                  <span className="text-[11px] opacity-70 font-bold">
                    {t.grading.from} {currentResult.total}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-[#0E1B2E] dark:text-white">
                      {t.grading.finalResult}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        currentResult.score >= currentResult.total * 0.75
                          ? "bg-[#FDF8EB] text-[#875C12] dark:bg-[#241B0E] dark:text-[#E0B256] border border-[#EADBB8]"
                          : currentResult.score >= currentResult.total * 0.5
                          ? "bg-[#F0F4F8] text-[#0E1B2E] dark:bg-slate-800 dark:text-slate-200 border border-[#D1DEEC]"
                          : "bg-[#FDF2F4] text-[#7A142A] dark:bg-[#2A101A] dark:text-[#E8829A] border border-[#F5CCD4]"
                      }`}
                    >
                      {currentResult.score >= currentResult.total * 0.75
                        ? t.grading.excellent
                        : currentResult.score >= currentResult.total * 0.5
                        ? t.grading.average
                        : t.grading.belowAverage}
                    </span>
                  </div>

                  {currentResult.detected_student_name && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{t.grading.detectedName}: </span>
                      <strong className="text-slate-900 dark:text-white font-black">
                        {currentResult.detected_student_name}
                      </strong>
                    </p>
                  )}

                  {currentResult.feedback && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                      {currentResult.feedback}
                    </p>
                  )}
                </div>
              </div>

              {/* Save to Roster & Next Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {currentClass && currentStudent && (
                  <button
                    type="button"
                    onClick={() =>
                      saveResultToStudent(currentResult, currentClass.id, currentStudent.id)
                    }
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors active:scale-98 cursor-pointer ${
                      isSavedToRoster
                        ? "bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B]"
                        : "bg-[#C89B3C] hover:bg-[#B88B2E] text-[#0E1B2E] shadow-sm shadow-[#C89B3C]/30"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {isSavedToRoster
                        ? `${t.grading.savedToRoster}: ${currentStudent.name}`
                        : `${t.grading.saveToRoster} (${currentStudent.name})`}
                    </span>
                  </button>
                )}

                {currentClass && currentClass.students.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextStudent}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-[#0E1B2E] hover:bg-[#1A2E4C] text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-98 cursor-pointer"
                  >
                    <span>{t.grading.nextStudentAction}</span>
                    <ArrowNext className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question by question detailed analysis */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-[#0E1B2E] dark:text-white flex items-center gap-2">
                  <span>
                    {t.grading.questionBreakdown} ({currentResult.questions.length})
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {t.grading.manualEditHint}
                  </span>
                </h4>

                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className="text-xs flex items-center gap-1 font-bold text-[#7A142A] dark:text-[#E8829A] hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editMode ? t.grading.finishManualEdit : t.grading.editPointsManual}</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentResult.questions.map((q, idx) => {
                  const isFull = q.points_earned === q.points_possible;
                  const isZero = q.points_earned === 0;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 transition-all ${
                        isFull
                          ? "border-[#EADBB8] dark:border-[#4D3A1B] bg-[#FDF8EB]/60 dark:bg-[#241B0E]/30"
                          : isZero
                          ? "border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10"
                          : "border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isFull
                                ? "bg-[#FDF8EB] text-[#875C12] dark:bg-[#241B0E] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B]"
                                : isZero
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            }`}
                          >
                            {q.question_number || idx + 1}
                          </span>
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {q.title || `${language === "fr" ? "Question" : language === "en" ? "Question" : "السؤال"} ${q.question_number || idx + 1}`}
                          </h5>
                          {q.error_type === "simple" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                              {language === "fr" ? "Erreur mineure (-0.25)" : language === "en" ? "Minor error (-0.25)" : "خطأ بسيط (-0.25)"}
                            </span>
                          )}
                          {q.error_type === "fractional" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800">
                              {language === "fr" ? "Barème décomposé" : language === "en" ? "Part-based grading" : "تنقيط تفكيكي"}
                            </span>
                          )}
                          {q.error_type === "major" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800">
                              {language === "fr" ? "Erreur majeure (0)" : language === "en" ? "Major error (0)" : "خطأ جسيم (0)"}
                            </span>
                          )}
                          {q.error_type === "none" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                              {language === "fr" ? "Réponse exacte" : language === "en" ? "Correct" : "إجابة صحيحة"}
                            </span>
                          )}
                        </div>

                        {/* Score control */}
                        <div className="flex items-center gap-2">
                          {editMode ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.25"
                                min="0"
                                max={q.points_possible}
                                value={q.points_earned}
                                onChange={(e) =>
                                  handleUpdateQuestionScore(idx, parseFloat(e.target.value) || 0)
                                }
                                className="w-16 text-center text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1"
                              />
                              <span className="text-xs text-slate-500">/ {q.points_possible}</span>
                            </div>
                          ) : (
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                                isFull
                                  ? "bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B]"
                                  : isZero
                                  ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {q.points_earned} / {q.points_possible}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Answers Comparison & Reasoning */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Model Answer */}
                        <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t.grading.modelAnswer}:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {q.correct_answer || "—"}
                          </p>
                        </div>

                        {/* Student's handwritten answer */}
                        <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {t.grading.studentAnswer}:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {q.student_answer || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Reasoning explanation */}
                      {q.reasoning && (
                        <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-slate-700 dark:text-slate-300">
                              {t.grading.pedagogicalReasoning}:{" "}
                            </strong>
                            {q.reasoning}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Class Modal */}
      {showQuickAddClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden shadow-2xl">
            <TricolorStripe />
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] dark:bg-[#32121D] text-[#7A142A] dark:text-[#E8829A] flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#0E1B2E] dark:text-white">
                    {t.grading.addClass || (language === "fr" ? "Ajouter une classe" : language === "en" ? "Add Class" : "إضافة قسم")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickAddClass(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickCreateClass} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "fr" ? "Nom de la classe *" : language === "en" ? "Class Name *" : "اسم القسم *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={quickClassName}
                    onChange={(e) => setQuickClassName(e.target.value)}
                    placeholder={language === "fr" ? "Ex: 4ème Année Moyenne 1" : language === "en" ? "e.g. 4th Grade Group A" : "مثال: 4 متوسط 1"}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-[#7A142A]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "fr" ? "Discipline / Matière" : language === "en" ? "Subject" : "المادة التعليمية"}
                  </label>
                  <input
                    type="text"
                    value={quickClassSubject}
                    onChange={(e) => setQuickClassSubject(e.target.value)}
                    placeholder={profile?.subject || (language === "fr" ? "Ex: Mathématiques, Sciences..." : language === "en" ? "e.g. Math, Science..." : "مثال: الرياضيات، علوم الطبيعة والحياة...")}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-[#7A142A]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddClass(false);
                      onOpenClassesTab();
                    }}
                    className="text-xs text-[#7A142A] dark:text-[#E8829A] font-bold hover:underline cursor-pointer"
                  >
                    {language === "fr" ? "Page complète des classes →" : language === "en" ? "Full classes page →" : "الانتقال لصفحة الأقسام الكاملة ←"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddClass(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7A142A] hover:bg-[#681123] text-white transition-colors cursor-pointer"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Student Modal */}
      {showQuickAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden shadow-2xl">
            <TricolorStripe />
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F0F4F8] dark:bg-slate-800 text-[#0E1B2E] dark:text-white flex items-center justify-center">
                    <User className="w-4 h-4 text-[#C89B3C]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#0E1B2E] dark:text-white">
                      {t.grading.addStudent || (language === "fr" ? "Ajouter un élève" : language === "en" ? "Add Student" : "إضافة تلميذ")}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {currentClass ? `${t.grading.classroom || (language === "fr" ? "Classe" : language === "en" ? "Class" : "القسم")}: ${currentClass.name}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickAddStudent(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickCreateStudent} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === "fr" ? "Nom et prénom de l'élève *" : language === "en" ? "Student Full Name *" : "اسم ولقب التلميذ *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={quickStudentName}
                    onChange={(e) => setQuickStudentName(e.target.value)}
                    placeholder={language === "fr" ? "Ex: Mohamed Amine Ben Salem" : language === "en" ? "e.g. John Doe" : "مثال: محمد الأمين بن سالم"}
                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-[#7A142A]"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickAddStudent(false);
                      onOpenClassesTab();
                    }}
                    className="text-xs text-[#7A142A] dark:text-[#E8829A] font-bold hover:underline cursor-pointer"
                  >
                    {language === "fr" ? "Import Excel / Caméra →" : language === "en" ? "Excel / Camera Import →" : "استيراد Excel أو بالكاميرا ←"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddStudent(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E1B2E] hover:bg-[#1A2E4C] text-white transition-colors cursor-pointer"
                    >
                      {t.common.add}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Interactive Camera Modal */}
      <CameraModal
        isOpen={cameraMode !== null}
        onClose={() => setCameraMode(null)}
        language={language}
        title={
          cameraMode === "key"
            ? (language === "fr" ? "Capturer le corrigé type" : language === "en" ? "Capture Answer Key" : "تصوير نموذج الإجابة وسلّم التنقيط")
            : (language === "fr" 
                ? `Capturer la copie de l'élève ${currentStudent ? `(${currentStudent.name})` : ""}`
                : language === "en"
                ? `Capture Student Exam ${currentStudent ? `(${currentStudent.name})` : ""}`
                : `تصوير ورقة إجابة التلميذ ${currentStudent ? `(${currentStudent.name})` : ""}`)
        }
        helperText={
          cameraMode === "key"
            ? (language === "fr" ? "Placez le corrigé officiel bien à plat" : language === "en" ? "Place official answer key flat" : "وجّه الكاميرا بشكل مستوٍ فوق نموذج الإجابة الرسمي")
            : (language === "fr" ? "Assurez-vous que l'écriture manuscrite est lisible" : language === "en" ? "Ensure handwriting is clear and legible" : "وجّه الكاميرا فوق ورقة التلميذ وتأكد من وضوح خط اليد")
        }
        onCapture={(imageDataUrl) => {
          if (cameraMode === "key") {
            setKeyImages((prev) => [...prev, imageDataUrl].slice(0, 10));
          } else if (cameraMode === "student") {
            setStudentImages((prev) => [...prev, imageDataUrl].slice(0, 10));
          }
        }}
      />
    </div>
  );
};
