import React, { useState, useRef } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  UploadCloud, 
  Camera, 
  Search, 
  X, 
  Calendar,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { TeacherDoc, ClassRoom, UserProfile, AppLanguage } from "../types";
import { CameraModal } from "./CameraModal";
import { optimizeImageFile, saveStoredDoc, deleteStoredDoc } from "../lib/storage";
import { translations } from "../lib/i18n";

interface LessonsManagerProps {
  docs: TeacherDoc[];
  classes: ClassRoom[];
  profile: UserProfile;
  language?: AppLanguage;
  onUpdateDocs: (docs: TeacherDoc[]) => void;
}

export const LessonsManager: React.FC<LessonsManagerProps> = ({
  docs,
  classes,
  profile,
  language = "ar",
  onUpdateDocs,
}) => {
  const t = translations[language] || translations.ar;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "pdf" | "image">("all");
  const [filterClass, setFilterClass] = useState<string>("all");

  // New Lesson Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonSubject, setLessonSubject] = useState<string>(profile.subject || "");
  const [lessonClass, setLessonClass] = useState<string>("");
  const [lessonTerm, setLessonTerm] = useState<string>(
    language === "fr" ? "1er Trimestre" : language === "en" ? "Term 1" : "الفصل الأول"
  );
  const [fileType, setFileType] = useState<"pdf" | "image">("pdf");
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Camera modal state
  const [showCamera, setShowCamera] = useState<boolean>(false);

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<TeacherDoc | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size nicely
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = language === "fr" 
      ? ["Octets", "Ko", "Mo"] 
      : language === "en" 
      ? ["Bytes", "KB", "MB"] 
      : ["بايت", "ك.بايت", "م.بايت"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle PDF or Image file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    setFileType(isPdf ? "pdf" : "image");

    try {
      if (isPdf) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = String(event.target?.result);
          setFileDataUrl(result);
          setIsProcessingFile(false);
        };
        reader.onerror = () => setIsProcessingFile(false);
        reader.readAsDataURL(file);
      } else {
        const optimized = await optimizeImageFile(file, 2048);
        setFileDataUrl(optimized);
        setIsProcessingFile(false);
      }
    } catch (err) {
      console.error("Error processing file:", err);
      setIsProcessingFile(false);
    }
  };

  // Save new Lesson / Doc
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !fileDataUrl) return;

    const newDoc: TeacherDoc = {
      id: "doc_" + Date.now(),
      title: lessonTitle.trim(),
      type: fileType,
      dataUrl: fileDataUrl,
      fileName: fileName || (fileType === "pdf" ? "document.pdf" : "image.jpg"),
      fileSize: fileSize || undefined,
      subject: lessonSubject.trim() || profile.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "عام"),
      className: lessonClass || undefined,
      term: lessonTerm || undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [newDoc, ...docs];
    onUpdateDocs(updated);
    saveStoredDoc(newDoc);

    setShowAddModal(false);
    setLessonTitle("");
    setFileDataUrl("");
    setFileName("");
    setFileSize("");
  };

  // Delete Doc
  const handleDeleteDoc = (id: string) => {
    const confirmMsg =
      language === "fr"
        ? "Voulez-vous vraiment supprimer ce cours / document ?"
        : language === "en"
        ? "Are you sure you want to delete this lesson/document?"
        : "هل أنت متأكد من حذف هذا الدرس / المستند نهائياً؟";
    if (!window.confirm(confirmMsg)) return;
    const updated = docs.filter((d) => d.id !== id);
    onUpdateDocs(updated);
    deleteStoredDoc(id);
    if (previewDoc?.id === id) {
      setPreviewDoc(null);
    }
  };

  // Download File to Device
  const handleDownload = (doc: TeacherDoc) => {
    const link = document.createElement("a");
    link.href = doc.dataUrl;
    link.download = doc.fileName || `${doc.title}.${doc.type === "pdf" ? "pdf" : "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.subject && doc.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.className && doc.className.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" ? true : doc.type === filterType;
    const matchesClass = filterClass === "all" ? true : doc.className === filterClass;

    return matchesSearch && matchesType && matchesClass;
  });

  return (
    <div dir={t.dir} className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${t.dir === "rtl" ? "right-3.5" : "left-3.5"}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.rubrics.searchLessons}
            className={`w-full text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A] ${
              t.dir === "rtl" ? "pr-10 pl-4" : "pl-10 pr-4"
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-[#7A142A] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {language === "fr" ? "Tous" : language === "en" ? "All" : "الكل"} ({docs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("pdf")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === "pdf"
                  ? "bg-[#7A142A] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>PDF ({docs.filter((d) => d.type === "pdf").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("image")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === "image"
                  ? "bg-[#7A142A] text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === "fr" ? "Images" : language === "en" ? "Images" : "صور"} ({docs.filter((d) => d.type === "image").length})</span>
            </button>
          </div>

          {/* Class Filter if classes exist */}
          {classes.length > 0 && (
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-semibold focus:outline-[#7A142A]"
            >
              <option value="all">{t.rubrics.allClasses}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add Lesson Button */}
        <button
          type="button"
          onClick={() => {
            setLessonTitle("");
            setFileDataUrl("");
            setFileName("");
            setFileSize("");
            setLessonSubject(profile.subject || "");
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-black transition-all shadow-xs shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C89B3C]" />
          <span>{t.rubrics.uploadLessonBtn}</span>
        </button>
      </div>

      {/* Content: Empty State vs Cards Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 text-center text-slate-500 overflow-hidden shadow-xs">
          <TricolorStripe />
          <div className="pt-8 max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8 text-[#7A142A]" />
            </div>
            <h4 className="text-base font-black text-[#0E1B2E] dark:text-white">
              {docs.length === 0 ? t.rubrics.noLessons : (language === "fr" ? "Aucun résultat trouvé" : language === "en" ? "No matching results" : "لا توجد نتائج تطابق بحثك")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {docs.length === 0
                ? t.rubrics.noLessonsDesc
                : (language === "fr" ? "Essayez de modifier vos filtres ou termes de recherche." : language === "en" ? "Try adjusting your filters or search terms." : "جرب تغيير نوع الملف أو مسح كلمات البحث لعرض باقي الدروس.")}
            </p>
            {docs.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C89B3C]" />
                <span>{t.rubrics.uploadLessonBtn}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-[#C89B3C]/50 transition-all flex flex-col justify-between group"
            >
              <TricolorStripe />
              <div className="p-4 space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        doc.type === "pdf"
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900"
                      }`}
                    >
                      {doc.type === "pdf" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <ImageIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#0E1B2E] dark:text-white truncate">
                        {doc.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {doc.subject && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                            {doc.subject}
                          </span>
                        )}
                        {doc.className && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FDF8EB] text-[#875C12] border border-[#EADBB8] dark:bg-[#241B0E] dark:text-[#E0B256] dark:border-[#4D3A1B] font-bold">
                            {doc.className}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail / Preview Snapshot */}
                <div
                  onClick={() => setPreviewDoc(doc)}
                  className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer group-hover:opacity-95 transition-all flex items-center justify-center"
                >
                  {doc.type === "pdf" ? (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <FileText className="w-10 h-10 text-rose-500 mb-1" />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300 line-clamp-1">
                        {doc.fileName || "PDF"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {doc.fileSize || "مستند PDF"}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={doc.dataUrl}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.rubrics.previewDoc}</span>
                    </span>
                  </div>
                </div>

                {/* Date & Term */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{doc.term || ""}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>{t.rubrics.previewDoc}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="py-2 px-3 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] hover:bg-[#FBE4E8] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title={t.rubrics.downloadDoc}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.rubrics.downloadDoc}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD NEW LESSON / DOCUMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            <TricolorStripe />
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B]">
                    <BookOpen className="w-5 h-5 text-[#7A142A]" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#0E1B2E] dark:text-white">
                    {t.rubrics.uploadLessonBtn}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-3.5">
                {/* Lesson Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.lessonTitlePlaceholder} *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder={t.rubrics.lessonTitlePlaceholder}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                {/* Subject & Term Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.rubrics.lessonSubjectSelect}
                    </label>
                    <input
                      type="text"
                      value={lessonSubject}
                      onChange={(e) => setLessonSubject(e.target.value)}
                      placeholder={profile.subject || (language === "fr" ? "Matière" : language === "en" ? "Subject" : "المادة")}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.rubrics.lessonTermSelect}
                    </label>
                    <select
                      value={lessonTerm}
                      onChange={(e) => setLessonTerm(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                    >
                      <option value={language === "fr" ? "1er Trimestre" : language === "en" ? "Term 1" : "الفصل الأول"}>
                        {language === "fr" ? "1er Trimestre" : language === "en" ? "Term 1" : "الفصل الأول"}
                      </option>
                      <option value={language === "fr" ? "2ème Trimestre" : language === "en" ? "Term 2" : "الفصل الثاني"}>
                        {language === "fr" ? "2ème Trimestre" : language === "en" ? "Term 2" : "الفصل الثاني"}
                      </option>
                      <option value={language === "fr" ? "3ème Trimestre" : language === "en" ? "Term 3" : "الفصل الثالث"}>
                        {language === "fr" ? "3ème Trimestre" : language === "en" ? "Term 3" : "الفصل الثالث"}
                      </option>
                      <option value={language === "fr" ? "Général" : language === "en" ? "General" : "مذكرة عامة"}>
                        {language === "fr" ? "Général" : language === "en" ? "General" : "مذكرة عامة"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Target Class if available */}
                {classes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.rubrics.lessonClassSelect}
                    </label>
                    <select
                      value={lessonClass}
                      onChange={(e) => setLessonClass(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                    >
                      <option value="">{t.rubrics.allClasses}</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* File Upload / Camera Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.rubrics.chooseFilePdfImg} *
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />

                  {fileDataUrl ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {fileType === "pdf" ? (
                          <FileText className="w-6 h-6 text-rose-500" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                            {fileName || (fileType === "pdf" ? "document.pdf" : "image.jpg")}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {fileSize || "OK"} • {fileType === "pdf" ? "PDF" : "Image"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFileDataUrl("");
                          setFileName("");
                          setFileSize("");
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        {t.common.delete}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingFile}
                        className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#7A142A] dark:hover:border-[#7A142A] bg-slate-50 dark:bg-slate-800/40 hover:bg-[#FDF2F4]/30 dark:hover:bg-[#2A101A]/30 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-[#7A142A] transition-colors shadow-2xs">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {language === "fr" ? "Choisir PDF ou Image" : language === "en" ? "Select PDF or Image" : "اختيار PDF أو صورة"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {language === "fr" ? "Depuis votre appareil" : language === "en" ? "From device storage" : "من ملفات الهاتف أو الحاسوب"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="p-4 rounded-2xl border-2 border-dashed border-[#EADBB8] dark:border-[#4D3A1B] hover:border-[#C89B3C] bg-[#FDF8EB]/50 dark:bg-[#241B0E]/40 hover:bg-[#FDF8EB] dark:hover:bg-[#241B0E] flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-[#875C12] dark:text-[#E0B256] transition-colors shadow-2xs">
                          <Camera className="w-5 h-5 text-[#C89B3C]" />
                        </div>
                        <span className="text-xs font-black text-[#875C12] dark:text-[#E0B256]">
                          {language === "fr" ? "Prendre une photo" : language === "en" ? "Capture with Camera" : "تصوير الدرس بالكاميرا"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {language === "fr" ? "Feuille du cours" : language === "en" ? "Lesson sheet directly" : "التقاط ورقة الدرس مباشرة"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={!lessonTitle.trim() || !fileDataUrl || isProcessingFile}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#7A142A] hover:bg-[#681123] text-white transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {isProcessingFile ? t.common.loading : t.rubrics.saveLessonBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DOCUMENT (PDF or High-Res Image) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <TricolorStripe />
            {/* Modal Header */}
            <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                {previewDoc.type === "pdf" ? (
                  <FileText className="w-5 h-5 text-rose-500" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                )}
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[#0E1B2E] dark:text-white line-clamp-1">
                    {previewDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{previewDoc.subject || ""}</span>
                    {previewDoc.className && <span>• {previewDoc.className}</span>}
                    {previewDoc.term && <span>• {previewDoc.term}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] hover:bg-[#FBE4E8] text-xs font-bold transition-all border border-[#F5CCD4] dark:border-[#521C2B] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.rubrics.downloadDoc}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {previewDoc.type === "pdf" ? (
                <div className="w-full h-full flex flex-col">
                  <iframe
                    src={previewDoc.dataUrl}
                    title={previewDoc.title}
                    className="w-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                  />
                  <div className="mt-2 text-center">
                    <a
                      href={previewDoc.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A142A] dark:text-[#E8829A] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === "fr" ? "Ouvrir dans un nouvel onglet" : language === "en" ? "Open in new window" : "فتح ملف PDF في نافذة جديدة أو قارئ المستندات"}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={previewDoc.dataUrl}
                    alt={previewDoc.title}
                    className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL FOR LESSON CAPTURE */}
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        language={language}
        title={
          language === "fr"
            ? "Capturer la feuille de cours ou fiche"
            : language === "en"
            ? "Capture lesson page"
            : "تصوير ورقة الدرس أو المذكرة"
        }
        helperText={
          language === "fr"
            ? "Maintenez l'appareil stable au-dessus du document"
            : language === "en"
            ? "Hold camera steady above lesson sheet"
            : "وجّه الكاميرا بشكل مستوٍ وثابت فوق ورقة الدرس مع إضاءة واضحة"
        }
        onCapture={(dataUrl) => {
          setFileType("image");
          setFileDataUrl(dataUrl);
          setFileName(`lesson_${new Date().toISOString().slice(0, 10)}.jpg`);
          setFileSize(language === "fr" ? "Photo capturée" : language === "en" ? "Captured photo" : "صورة ملتقطة");
          setShowCamera(false);
        }}
      />
    </div>
  );
};
