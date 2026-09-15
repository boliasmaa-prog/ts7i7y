import React, { useState, useRef } from "react";
import { 
  FolderArchive, 
  Plus, 
  Trash2, 
  Play, 
  UploadCloud, 
  BookOpen, 
  StickyNote, 
  Edit3, 
  Calendar,
  GraduationCap
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { LessonsManager } from "./LessonsManager";
import { RubricTemplate, TeacherNote, ClassRoom, TeacherDoc, UserProfile, AppLanguage } from "../types";
import { 
  saveStoredRubric, 
  deleteStoredRubric, 
  saveStoredNote, 
  deleteStoredNote,
  optimizeImageFile 
} from "../lib/storage";
import { translations } from "../lib/i18n";

interface RubricsViewProps {
  rubrics: RubricTemplate[];
  notes: TeacherNote[];
  docs?: TeacherDoc[];
  classes: ClassRoom[];
  profile?: UserProfile;
  language?: AppLanguage;
  onUpdateRubrics: (rubrics: RubricTemplate[]) => void;
  onUpdateNotes: (notes: TeacherNote[]) => void;
  onUpdateDocs?: (docs: TeacherDoc[]) => void;
  onUseRubricForGrading: (rubric: RubricTemplate) => void;
}

export const RubricsView: React.FC<RubricsViewProps> = ({
  rubrics,
  notes,
  docs = [],
  classes,
  profile = { name: "الأستاذ الفاضل", title: "أستاذ", gender: "male", subject: "عام" },
  language = "ar",
  onUpdateRubrics,
  onUpdateNotes,
  onUpdateDocs = () => {},
  onUseRubricForGrading,
}) => {
  const t = translations[language] || translations.ar;
  const [activeSection, setActiveSection] = useState<"rubrics" | "lessons" | "notes">("rubrics");

  // New Rubric Form state
  const [showAddRubric, setShowAddRubric] = useState<boolean>(false);
  const [rubricTitle, setRubricTitle] = useState<string>("");
  const [rubricSubject, setRubricSubject] = useState<string>("");
  const [rubricImages, setRubricImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Note Form state
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [noteContent, setNoteContent] = useState<string>("");
  const [noteClassId, setNoteClassId] = useState<string>("");

  // Handle uploading images for new rubric
  const handleUploadRubricImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const files = Array.from(e.target.files) as File[];
      const optimized: string[] = [];
      for (const file of files) {
        const url = await optimizeImageFile(file);
        optimized.push(url);
      }
      setRubricImages((prev) => [...prev, ...optimized]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubricTitle.trim() || rubricImages.length === 0) return;

    const newRubric: RubricTemplate = {
      id: "rubric_" + Date.now(),
      title: rubricTitle.trim(),
      subject: rubricSubject.trim() || profile.subject || (language === "fr" ? "Général" : language === "en" ? "General" : "عام"),
      images: rubricImages,
      created_at: new Date().toISOString(),
    };

    const updated = [...rubrics, newRubric];
    onUpdateRubrics(updated);
    saveStoredRubric(newRubric);

    setRubricTitle("");
    setRubricSubject("");
    setRubricImages([]);
    setShowAddRubric(false);
  };

  const handleDeleteRubric = (id: string) => {
    const confirmMsg =
      language === "fr"
        ? "Voulez-vous vraiment supprimer ce corrigé type ?"
        : language === "en"
        ? "Are you sure you want to delete this rubric?"
        : "هل أنت متأكد من حذف هذا النموذج؟";
    if (!window.confirm(confirmMsg)) return;
    const updated = rubrics.filter((r) => r.id !== id);
    onUpdateRubrics(updated);
    deleteStoredRubric(id);
  };

  // Notes handling
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: TeacherNote = {
      id: "note_" + Date.now(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      classId: noteClassId || undefined,
      updated_at: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    onUpdateNotes(updated);
    saveStoredNote(newNote);

    setNoteTitle("");
    setNoteContent("");
    setNoteClassId("");
    setShowAddNote(false);
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    onUpdateNotes(updated);
    deleteStoredNote(id);
  };

  return (
    <div dir={t.dir} className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B]">
                <FolderArchive className="w-5 h-5 text-[#7A142A]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0E1B2E] dark:text-white">
                  {t.rubrics.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.rubrics.subtitle}
                </p>
              </div>
            </div>

            {/* Section Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveSection("rubrics")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSection === "rubrics"
                      ? "bg-[#7A142A] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.rubrics.tabRubrics} ({rubrics.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("lessons")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSection === "lessons"
                      ? "bg-[#7A142A] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#C89B3C]" />
                  <span>{t.rubrics.tabLessons} ({docs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("notes")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSection === "notes"
                      ? "bg-[#7A142A] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>{t.rubrics.tabNotes} ({notes.length})</span>
                </button>
              </div>

              {activeSection === "rubrics" && (
                <button
                  type="button"
                  onClick={() => setShowAddRubric(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>{t.rubrics.addRubricBtn}</span>
                </button>
              )}

              {activeSection === "notes" && (
                <button
                  type="button"
                  onClick={() => setShowAddNote(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>{t.rubrics.addNoteBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: RUBRICS */}
      {activeSection === "rubrics" && (
        <div>
          {rubrics.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 overflow-hidden">
              <TricolorStripe />
              <div className="pt-6">
                <BookOpen className="w-12 h-12 mx-auto text-[#0E1B2E]/30 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.rubrics.noRubricsTitle}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {t.rubrics.noRubricsDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddRubric(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.rubrics.createFirstRubric}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rubrics.map((rubric) => (
                <div
                  key={rubric.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-[#C89B3C]/50 transition-all flex flex-col justify-between"
                >
                  <TricolorStripe />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#0E1B2E] dark:text-white">
                          {rubric.title}
                        </h4>
                        {rubric.subject && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold mt-1 inline-block">
                            {rubric.subject}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRubric(rubric.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Thumbnails preview */}
                    <div className="mt-3 flex gap-2 overflow-x-auto py-1">
                      {rubric.images.map((img, i) => (
                        <div
                          key={i}
                          className="w-16 h-20 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0"
                        >
                          <img
                            src={img}
                            alt={`p.${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400">
                      {t.rubrics.pages}: {rubric.images.length} | {new Date(rubric.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onUseRubricForGrading(rubric)}
                      className="w-full py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#C89B3C] text-[#C89B3C]" />
                      <span>{t.rubrics.useForGrading}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: LESSONS (PDF & IMAGES) */}
      {activeSection === "lessons" && (
        <LessonsManager
          docs={docs}
          classes={classes}
          profile={profile}
          language={language}
          onUpdateDocs={onUpdateDocs}
        />
      )}

      {/* SECTION 3: TEACHER NOTES */}
      {activeSection === "notes" && (
        <div>
          {notes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 overflow-hidden">
              <TricolorStripe />
              <div className="pt-6">
                <StickyNote className="w-12 h-12 mx-auto text-[#0E1B2E]/30 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.rubrics.noNotesTitle}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {t.rubrics.noNotesDesc}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddNote(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.rubrics.createFirstNote}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notes.map((note) => {
                const assignedClass = classes.find((c) => c.id === note.classId);
                return (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-extrabold text-sm text-[#0E1B2E] dark:text-white">
                          {note.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title={t.common.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {assignedClass ? assignedClass.name : t.rubrics.allClasses}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Rubric */}
      {showAddRubric && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-xl overflow-hidden">
            <TricolorStripe />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-[#0E1B2E] dark:text-white">
                {t.rubrics.modalNewRubric}
              </h3>

              <form onSubmit={handleSaveRubric} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.rubricTitleField} *
                  </label>
                  <input
                    type="text"
                    required
                    value={rubricTitle}
                    onChange={(e) => setRubricTitle(e.target.value)}
                    placeholder={t.rubrics.rubricTitlePlaceholder}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.rubricSubjectField}
                  </label>
                  <input
                    type="text"
                    value={rubricSubject}
                    onChange={(e) => setRubricSubject(e.target.value)}
                    placeholder={t.rubrics.rubricSubjectPlaceholder}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.rubricImagesField} * ({rubricImages.length})
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={handleUploadRubricImages}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#7A142A] rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <UploadCloud className="w-6 h-6 text-[#7A142A] dark:text-[#E8829A] mx-auto mb-1" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                      {isUploading ? t.common.loading : t.rubrics.chooseFilePdfImg}
                    </span>
                  </div>

                  {rubricImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto py-1">
                      {rubricImages.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-14 h-16 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0"
                        >
                          <img
                            src={img}
                            alt="thumb"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setRubricImages(rubricImages.filter((_, idx) => idx !== i))
                            }
                            className="absolute top-0.5 left-0.5 bg-red-600 text-white rounded p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRubric(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || rubricImages.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7A142A] hover:bg-[#681123] disabled:opacity-50 text-white shadow-xs cursor-pointer"
                  >
                    {t.rubrics.saveRubricBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Note */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-xl overflow-hidden">
            <TricolorStripe />
            <div className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-[#0E1B2E] dark:text-white">
                {t.rubrics.modalNewNote}
              </h3>

              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.noteTitleField} *
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="مثال: ملاحظات حول اختبار الفصل الثاني..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.relatedClass}
                  </label>
                  <select
                    value={noteClassId}
                    onChange={(e) => setNoteClassId(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  >
                    <option value="">{t.rubrics.allClasses}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.rubrics.noteContentField} *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="اكتب ملاحظاتك التربوية أو النقاط التي لاحظت صعوبة التلاميذ فيها..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNote(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7A142A] hover:bg-[#681123] text-white shadow-xs cursor-pointer"
                  >
                    {t.rubrics.saveNoteBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
