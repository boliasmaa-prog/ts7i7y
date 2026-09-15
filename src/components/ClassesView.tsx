import React, { useState, useRef } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Camera, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { ExcelImportModal } from "./ExcelImportModal";
import { CameraModal } from "./CameraModal";
import { ClassRoom, Student, UserProfile, AppLanguage } from "../types";
import { saveStoredClasses, optimizeImageFile } from "../lib/storage";
import { translations } from "../lib/i18n";

interface ClassesViewProps {
  classes: ClassRoom[];
  profile?: UserProfile;
  language?: AppLanguage;
  onUpdateClasses: (classes: ClassRoom[]) => void;
  onSelectStudentToGrade: (classId: string, studentId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  profile,
  language = "ar",
  onUpdateClasses,
  onSelectStudentToGrade,
}) => {
  const t = translations[language] || translations.ar;

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [newClassName, setNewClassName] = useState<string>("");
  const [newClassSubject, setNewClassSubject] = useState<string>(profile?.subject || "");
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);

  const [newStudentName, setNewStudentName] = useState<string>("");
  const [bulkNamesText, setBulkNamesText] = useState<string>("");
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState<boolean>(false);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);

  // OCR Roster state
  const [isExtractingNames, setIsExtractingNames] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Add a new classroom
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: ClassRoom = {
      id: "class_" + Date.now(),
      name: newClassName.trim(),
      subject: newClassSubject.trim() || profile?.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "عام"),
      academic_year: "2025/2026",
      students: [],
      created_at: new Date().toISOString(),
    };

    const updated = [...classes, newClass];
    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setSelectedClassId(newClass.id);
    setNewClassName("");
    setNewClassSubject("");
    setShowAddClassModal(false);
  };

  // Delete a class
  const handleDeleteClass = (classId: string) => {
    const confirmMsg =
      language === "fr"
        ? "Voulez-vous vraiment supprimer cette classe et toutes ses notes ?"
        : language === "en"
        ? "Are you sure you want to delete this class and all student scores?"
        : "هل أنت متأكد من حذف هذا القسم وجميع نقاط تلاميذه؟";
    if (!window.confirm(confirmMsg)) return;
    const updated = classes.filter((c) => c.id !== classId);
    onUpdateClasses(updated);
    saveStoredClasses(updated);
    if (selectedClassId === classId) {
      setSelectedClassId(updated[0]?.id || "");
    }
  };

  // Add single student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !currentClass) return;

    const newStudent: Student = {
      id: "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name: newStudentName.trim(),
    };

    const updated = classes.map((cls) => {
      if (cls.id !== currentClass.id) return cls;
      return {
        ...cls,
        students: [...cls.students, newStudent],
      };
    });

    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setNewStudentName("");
  };

  // Bulk add students by pasting text
  const handleAddBulkStudents = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNamesText.trim() || !currentClass) return;

    const lines = bulkNamesText
      .split("\n")
      .map((l) => l.replace(/^[0-9]+[-.)\s]+/, "").trim())
      .filter((l) => l.length > 1);

    if (lines.length === 0) return;

    const newStudents: Student[] = lines.map((name) => ({
      id: "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      name,
    }));

    const updated = classes.map((cls) => {
      if (cls.id !== currentClass.id) return cls;
      return {
        ...cls,
        students: [...cls.students, ...newStudents],
      };
    });

    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setBulkNamesText("");
    setShowBulkModal(false);
  };

  // Handle Excel Students Import
  const handleImportExcelStudents = (imported: Student[]) => {
    if (!currentClass || imported.length === 0) return;

    const updated = classes.map((cls) => {
      if (cls.id !== currentClass.id) return cls;
      return {
        ...cls,
        students: [...cls.students, ...imported],
      };
    });

    onUpdateClasses(updated);
    saveStoredClasses(updated);
    setShowExcelImportModal(false);
  };

  // Delete student
  const handleDeleteStudent = (studentId: string) => {
    if (!currentClass) return;
    const updated = classes.map((cls) => {
      if (cls.id !== currentClass.id) return cls;
      return {
        ...cls,
        students: cls.students.filter((s) => s.id !== studentId),
      };
    });
    onUpdateClasses(updated);
    saveStoredClasses(updated);
  };

  // Scan paper roster image to extract names via AI
  const processRosterImages = async (imageUrls: string[]) => {
    if (!currentClass || imageUrls.length === 0) return;
    setIsExtractingNames(true);
    setOcrError(null);

    try {
      const response = await fetch("/api/extract-roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imageUrls }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `${t.common.error} (${response.status})`);
      }

      const data = await response.json();
      const extractedNames: string[] = data.names || [];

      if (extractedNames.length === 0) {
        throw new Error(
          language === "fr"
            ? "Aucun nom détecté sur la photo."
            : language === "en"
            ? "No student names found in this image."
            : "لم يتم العثور على أي أسماء تلاميذ واضحة في الصورة."
        );
      }

      const newStudents: Student[] = extractedNames.map((name) => ({
        id: "st_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        name,
      }));

      const updated = classes.map((cls) => {
        if (cls.id !== currentClass.id) return cls;
        return {
          ...cls,
          students: [...cls.students, ...newStudents],
        };
      });

      onUpdateClasses(updated);
      saveStoredClasses(updated);
    } catch (err: any) {
      console.error("OCR extraction error:", err);
      setOcrError(err?.message || t.common.error);
    } finally {
      setIsExtractingNames(false);
      setShowCameraModal(false);
    }
  };

  // File upload input handler for paper roster
  const handleExtractNamesFromPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentClass) return;
    try {
      const file = e.target.files[0];
      const dataUrl = await optimizeImageFile(file);
      await processRosterImages([dataUrl]);
    } catch (err: any) {
      setOcrError(err?.message || t.common.error);
    }
  };

  return (
    <div dir={t.dir} className="space-y-6">
      {/* Header with Title and Add Class Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0E1B2E] dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#7A142A] dark:text-[#E8829A]" />
            <span>{t.classes.title}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.classes.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddClassModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C89B3C]" />
          <span>{t.classes.addClassBtn}</span>
        </button>
      </div>

      {/* Classrooms List / Tabs */}
      {classes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {t.classes.noClassesTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
            {t.classes.noClassesDesc}
          </p>
          <button
            type="button"
            onClick={() => setShowAddClassModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#7A142A] text-white text-xs font-bold cursor-pointer"
          >
            {t.classes.createFirstClass}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Class Select Pills */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0E1B2E] text-white dark:bg-white dark:text-[#0E1B2E] shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{cls.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-black font-extrabold"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {cls.students.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Class Details Card */}
          {currentClass && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {currentClass.name}
                    </h3>
                    {currentClass.subject && (
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#FDF2F4] text-[#7A142A] border border-[#F5CCD4] dark:bg-[#32121D] dark:text-[#E8829A] font-bold">
                        {currentClass.subject}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === "fr"
                      ? `Total: ${currentClass.students.length} élèves | Corrigés: ${currentClass.students.filter((s) => s.result).length}`
                      : language === "en"
                      ? `Total: ${currentClass.students.length} students | Graded: ${currentClass.students.filter((s) => s.result).length}`
                      : `إجمالي التلاميذ: ${currentClass.students.length} | تم تصحيح: ${currentClass.students.filter((s) => s.result).length} تلميذ`}
                  </p>
                </div>

                {/* Actions for current class */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FDF8EB] hover:bg-[#FAF0D6] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B] text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                      isExtractingNames ? "opacity-50 pointer-events-none" : ""
                    }`}
                    title={t.classes.scanRosterCamera}
                  >
                    {isExtractingNames ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-[#C89B3C]" />
                    )}
                    <span>{t.classes.scanRosterCamera}</span>
                  </button>

                  <label
                    htmlFor="class-list-photo-upload"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer ${
                      isExtractingNames ? "opacity-50 pointer-events-none" : ""
                    }`}
                    title={t.classes.uploadRosterPhoto}
                  >
                    <span>{t.classes.uploadRosterPhoto}</span>
                  </label>
                  <input
                    id="class-list-photo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={handleExtractNamesFromPhoto}
                  />

                  <button
                    type="button"
                    onClick={() => setShowExcelImportModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFF] dark:bg-[#0E243A] dark:hover:bg-[#153452] text-[#1B578E] dark:text-[#64B5F6] border border-[#BFDBFE] dark:border-[#1E4976] text-xs font-bold transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    title={t.classes.importExcel}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#1B578E] dark:text-[#64B5F6]" />
                    <span>{t.classes.importExcel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>{t.classes.pasteNames}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClass(currentClass.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    title={t.classes.deleteClass}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* OCR Error notification */}
              {ocrError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ocrError}</span>
                </div>
              )}

              {/* Quick Add Single Student Input */}
              <form onSubmit={handleAddStudent} className="flex gap-2">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder={t.classes.studentNamePlaceholder}
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0E1B2E] hover:bg-[#1A2E4C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>{t.classes.addStudentBtn}</span>
                </button>
              </form>

              {/* Students Roster Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className={`py-3 px-4 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                        {t.classes.studentNameCol}
                      </th>
                      <th className={`py-3 px-4 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                        {t.classes.statusCol}
                      </th>
                      <th className={`py-3 px-4 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
                        {t.classes.scoreCol}
                      </th>
                      <th className="py-3 px-4 text-center">
                        {t.classes.actionsCol}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {currentClass.students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {t.classes.noStudentsInClass}
                        </td>
                      </tr>
                    ) : (
                      currentClass.students.map((student, idx) => {
                        const hasResult = Boolean(student.result);
                        const score = student.result?.score ?? 0;
                        const total = student.result?.total ?? 20;
                        const isSuccess = hasResult && score >= total / 2;

                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                              {student.name}
                            </td>
                            <td className="py-3 px-4">
                              {hasResult ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#875C12] dark:text-[#E0B256]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C89B3C]" />
                                  <span>{t.classes.gradedStatus}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{t.classes.pendingStatus}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {hasResult ? (
                                <span
                                  className={`font-black text-xs px-2.5 py-0.5 rounded-md border ${
                                    isSuccess
                                      ? "bg-[#FDF8EB] text-[#875C12] border-[#EADBB8] dark:bg-[#241B0E] dark:text-[#E0B256] dark:border-[#4D3A1B]"
                                      : "bg-[#FDF2F4] text-[#7A142A] border-[#F5CCD4] dark:bg-[#2A101A] dark:text-[#E8829A] dark:border-[#521C2B]"
                                  }`}
                                >
                                  {score} / {total}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onSelectStudentToGrade(currentClass.id, student.id)}
                                  className="px-2.5 py-1 rounded-lg bg-[#FDF2F4] hover:bg-[#FBE4E8] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] font-bold text-[11px] transition-colors border border-[#F5CCD4]/60 cursor-pointer"
                                >
                                  {hasResult ? t.classes.regradeAction : t.classes.gradeAction}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                  title={t.common.delete}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-xl overflow-hidden">
            <TricolorStripe />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-[#0E1B2E] dark:text-white">
                {t.classes.modalCreateClassTitle}
              </h3>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.classes.classNameField} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder={t.classes.classNamePlaceholder}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.classes.classSubjectField}
                  </label>
                  <input
                    type="text"
                    value={newClassSubject}
                    onChange={(e) => setNewClassSubject(e.target.value)}
                    placeholder={t.classes.classSubjectPlaceholder}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7A142A] hover:bg-[#681123] text-white shadow-xs cursor-pointer"
                  >
                    {t.classes.createClassSubmit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Add Students */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-xl overflow-hidden">
            <TricolorStripe />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-[#0E1B2E] dark:text-white">
                {t.classes.modalBulkTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.classes.modalBulkDesc}
              </p>
              <form onSubmit={handleAddBulkStudents} className="space-y-3">
                <textarea
                  rows={8}
                  value={bulkNamesText}
                  onChange={(e) => setBulkNamesText(e.target.value)}
                  placeholder={`1. Mohamed Ali\n2. Sarah Benali\n3. Yacine Brahimi\n...`}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A] font-mono"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7A142A] hover:bg-[#681123] text-white shadow-xs cursor-pointer"
                  >
                    {t.classes.bulkSubmit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excel Roster Import with Clean Formatting */}
      {currentClass && (
        <ExcelImportModal
          isOpen={showExcelImportModal}
          onClose={() => setShowExcelImportModal(false)}
          className={currentClass.name}
          language={language}
          onImportStudents={handleImportExcelStudents}
        />
      )}

      {/* Modal: Live Camera Roster Capture */}
      {currentClass && (
        <CameraModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          language={language}
          title={
            language === "fr"
              ? `Capturer la liste des élèves (${currentClass.name})`
              : language === "en"
              ? `Capture student roster (${currentClass.name})`
              : `تصوير ورقة لائحة تلاميذ ${currentClass.name}`
          }
          helperText={
            language === "fr"
              ? "Positionnez la caméra sur la liste des noms imprimée ou manuscrite"
              : language === "en"
              ? "Hold camera flat over the printed or handwritten name list"
              : "وجّه الكاميرا فوق قائمة الأسماء وتأكد من وضوح الكلمات"
          }
          onCapture={(dataUrl) => {
            processRosterImages([dataUrl]);
          }}
        />
      )}
    </div>
  );
};
