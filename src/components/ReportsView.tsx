import React, { useState } from "react";
import * as XLSX from "xlsx";
import { 
  BarChart3, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Users, 
  ArrowLeft, 
  BookOpen, 
  Search,
  FileSpreadsheet,
  Calendar,
  Check,
  Clock
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { ClassRoom, UserProfile, AppLanguage } from "../types";
import { translations } from "../lib/i18n";

interface ReportsViewProps {
  classes: ClassRoom[];
  profile?: UserProfile;
  language?: AppLanguage;
  onOpenClassesTab?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  classes, 
  profile, 
  language = "ar",
  onOpenClassesTab 
}) => {
  const t = translations[language] || translations.ar;
  const isRtl = t.dir === "rtl";

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "");
  const [studentSearch, setStudentSearch] = useState<string>("");

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  if (!currentClass) {
    return (
      <div dir={t.dir} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500 shadow-xs">
        <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          {language === "fr" 
            ? "Aucune classe enregistrée pour le moment." 
            : language === "en" 
            ? "No classes registered yet." 
            : "لا توجد أقسام مسجلة حتى الآن."}
        </p>
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          {language === "fr" 
            ? "Créez une classe dans l'onglet 'Classes & Élèves' pour afficher les rapports." 
            : language === "en" 
            ? "Create a class in 'Classes & Students' tab to view reports." 
            : "أنشئ قسماً في تبويب 'الأقسام والتلاميذ' لعرض التقارير وتصدير كشف النقاط."}
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalStudents = currentClass.students.length;
  const gradedStudents = currentClass.students.filter((s) => s.result);
  const gradedCount = gradedStudents.length;

  const normalizedScores = gradedStudents.map((s) => {
    const score = s.result!.score;
    const total = s.result!.total || 20;
    return (score / total) * 20;
  });

  const average =
    normalizedScores.length > 0
      ? Math.round((normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length) * 100) / 100
      : 0;

  const maxScore = normalizedScores.length > 0 ? Math.max(...normalizedScores) : 0;
  const minScore = normalizedScores.length > 0 ? Math.min(...normalizedScores) : 0;
  const passCount = normalizedScores.filter((s) => s >= 10).length;
  const passRate = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 0;

  // Distribution
  const distExcellent = normalizedScores.filter((s) => s >= 16).length;
  const distGood = normalizedScores.filter((s) => s >= 14 && s < 16).length;
  const distMedium = normalizedScores.filter((s) => s >= 10 && s < 14).length;
  const distLow = normalizedScores.filter((s) => s < 10).length;

  // Evaluation Label Helper
  const getEvaluationLabel = (norm20: number): string => {
    if (norm20 >= 16) {
      return language === "fr" ? "Très bien / Excellent" : language === "en" ? "Excellent" : "ممتاز";
    }
    if (norm20 >= 14) {
      return language === "fr" ? "Bien" : language === "en" ? "Very Good" : "جيد جداً";
    }
    if (norm20 >= 12) {
      return language === "fr" ? "Assez bien" : language === "en" ? "Good" : "جيد";
    }
    if (norm20 >= 10) {
      return language === "fr" ? "Passable" : language === "en" ? "Pass" : "مقبول";
    }
    return language === "fr" ? "Insuffisant" : language === "en" ? "Needs Support" : "دون المعدل";
  };

  // Export to Excel file - Highly Structured, Clean, and Organized
  const handleExportExcel = () => {
    const teacherName = profile?.name ? `${profile.title || ""} ${profile.name}`.trim() : (language === "fr" ? "Enseignant" : language === "en" ? "Teacher" : "الأستاذ");
    const subjectName = currentClass.subject || profile?.subject || (language === "fr" ? "Matière" : language === "en" ? "Subject" : "التعليم العام");
    const schoolName = profile?.schoolName || (language === "fr" ? "Établissement Scolaire" : language === "en" ? "School" : "المؤسسة التعليمية");
    const exportDate = new Date().toLocaleDateString(language === "fr" ? "fr-FR" : language === "en" ? "en-US" : "ar-DZ");

    // Clean text helper
    const clean = (val: any): string => {
      if (val === null || val === undefined) return "";
      return String(val).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
    };

    const isFr = language === "fr";
    const isEn = language === "en";

    // Row definitions based on language
    const rows: (string | number)[][] = [
      // Row 1: Republic Header
      [isFr ? "RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE" : isEn ? "PEOPLE'S DEMOCRATIC REPUBLIC OF ALGERIA" : "الجمهورية الجزائرية الديمقراطية الشعبية"],
      // Row 2: Ministry Subtitle
      [isFr ? "MINISTÈRE DE L'ÉDUCATION NATIONALE - RELEVÉ DE NOTES OFFICIEL" : isEn ? "MINISTRY OF NATIONAL EDUCATION - OFFICIAL GRADE REPORT" : "وزارة التربية الوطنية - كشف النقاط والمعدلات التقييمية"],
      // Row 3: Blank
      [],
      // Row 4: Class metadata
      [
        isFr ? "Établissement :" : isEn ? "School:" : "المؤسسة :",
        schoolName,
        "",
        isFr ? "Classe :" : isEn ? "Class:" : "القسم :",
        currentClass.name,
        "",
        isFr ? "Matière :" : isEn ? "Subject:" : "المادة :",
        subjectName,
      ],
      // Row 5: Teacher metadata
      [
        isFr ? "Enseignant(e) :" : isEn ? "Teacher:" : "الأستاذ(ة) :",
        teacherName,
        "",
        isFr ? "Année Scolaire :" : isEn ? "School Year:" : "السنة الدراسية :",
        currentClass.academic_year || "2025/2026",
        "",
        isFr ? "Date d'export :" : isEn ? "Export Date:" : "تاريخ التصدير :",
        exportDate,
      ],
      // Row 6: Blank
      [],
      // Row 7: Main Table Header
      [
        isFr ? "N°" : isEn ? "#" : "الرقم",
        isFr ? "Nom et Prénom de l'Élève" : isEn ? "Student Full Name" : "اسم ولقب التلميذ",
        isFr ? "Note Obtenue" : isEn ? "Raw Score" : "العلامة",
        isFr ? "Sur" : isEn ? "Out of" : "من",
        isFr ? "Moyenne / 20" : isEn ? "Grade / 20" : "المعدل / 20",
        isFr ? "Pourcentage %" : isEn ? "Percentage %" : "النسبة %",
        isFr ? "Appréciation" : isEn ? "Evaluation" : "التقدير التربوي",
        isFr ? "Statut" : isEn ? "Status" : "حالة التصحيح",
        isFr ? "Date de Correction" : isEn ? "Grading Date" : "تاريخ التصحيح",
      ],
    ];

    // Data rows
    currentClass.students.forEach((student, idx) => {
      const hasResult = Boolean(student.result);
      const score = hasResult ? Number(student.result!.score) : "";
      const total = hasResult ? Number(student.result!.total || 20) : "";
      const norm20 = hasResult && total ? Number(((student.result!.score / student.result!.total) * 20).toFixed(2)) : "";
      const pct = hasResult && total ? `${Number(((student.result!.score / student.result!.total) * 100).toFixed(1))}%` : "";

      const evalLabel = hasResult && typeof norm20 === "number" ? getEvaluationLabel(norm20) : "—";
      const statusLabel = hasResult 
        ? (isFr ? "Corrigé" : isEn ? "Graded" : "تم التصحيح") 
        : (isFr ? "Non corrigé" : isEn ? "Pending" : "غير مصحح");

      const dateStr = student.result?.graded_at
        ? new Date(student.result.graded_at).toLocaleDateString(isFr ? "fr-FR" : isEn ? "en-US" : "ar-DZ")
        : "—";

      rows.push([
        idx + 1,
        clean(student.name),
        score,
        total,
        norm20,
        pct,
        evalLabel,
        statusLabel,
        dateStr,
      ]);
    });

    // Statistical summary rows at bottom
    rows.push([]);
    rows.push([isFr ? "BILAN STATISTIQUE DE LA CLASSE :" : isEn ? "CLASS STATISTICAL SUMMARY:" : "الملخص الإحصائي الشامل للقسم :"]);
    rows.push([
      isFr ? "Effectif Total :" : isEn ? "Total Students:" : "إجمالي التلاميذ :",
      totalStudents,
      "",
      isFr ? "Copies Corrigées :" : isEn ? "Graded Papers:" : "الأوراق المصححة :",
      gradedCount,
      "",
      isFr ? "Copies Restantes :" : isEn ? "Pending Papers:" : "أوراق غير مصححة :",
      totalStudents - gradedCount,
    ]);
    rows.push([
      isFr ? "Moyenne de la Classe / 20 :" : isEn ? "Class Average / 20:" : "معدل القسم / 20 :",
      average,
      "",
      isFr ? "Taux de Réussite (≥ 10) :" : isEn ? "Pass Rate (≥ 10):" : "نسبة النجاح (≥10) :",
      `${passRate}%`,
      "",
      isFr ? "Meilleure Note / 20 :" : isEn ? "Highest Score / 20:" : "أعلى علامة / 20 :",
      maxScore ? Number(maxScore.toFixed(2)) : 0,
    ]);
    rows.push([
      isFr ? "Mention Très Bien (≥16) :" : isEn ? "Excellent (≥16):" : "ممتاز (≥16) :",
      distExcellent,
      "",
      isFr ? "Mention Bien (14-16) :" : isEn ? "Good (14-16):" : "جيد (14-16) :",
      distGood,
      "",
      isFr ? "Moins de la Moyenne (<10) :" : isEn ? "Under Average (<10):" : "دون المعدل (<10) :",
      distLow,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Set Sheet View (RTL for Arabic, LTR for French/English)
    worksheet["!views"] = [{ RTL: language === "ar" }];

    // Carefully proportioned column widths
    worksheet["!cols"] = [
      { wch: 8 },  // #
      { wch: 32 }, // Student Name
      { wch: 14 }, // Score
      { wch: 10 }, // Out of
      { wch: 15 }, // Grade / 20
      { wch: 14 }, // %
      { wch: 22 }, // Evaluation
      { wch: 16 }, // Status
      { wch: 18 }, // Date
    ];

    // Merge title banner rows
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = currentClass.name.replace(/[:\\/?*[\]]/g, "_").slice(0, 30);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const filePrefix = isFr ? "Releve_Notes" : isEn ? "Grade_Report" : "كشف_نقاط";
    const fileName = `${filePrefix}_${currentClass.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Filter students for the on-screen table
  const filteredStudents = currentClass.students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div dir={t.dir} className="space-y-6">
      {/* Top Selector & Export bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B]">
                <BarChart3 className="w-5 h-5 text-[#7A142A]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0E1B2E] dark:text-white">
                  {t.reports.mainTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.reports.mainSubtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Class Picker */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200 focus:outline-[#7A142A] cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.students.length} {language === "fr" ? "élèves" : language === "en" ? "students" : "تلميذ"})
                  </option>
                ))}
              </select>

              {/* Export Excel Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#C89B3C]" />
                <span>{t.reports.exportExcel}</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>{t.reports.classAvg}</span>
            <TrendingUp className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <div className="text-2xl font-black text-[#0E1B2E] dark:text-white">
            {average}{" "}
            <span className="text-xs font-bold text-slate-400">/ 20</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {language === "fr" 
              ? `Sur ${gradedCount} copies corrigées` 
              : language === "en" 
              ? `Based on ${gradedCount} graded papers` 
              : `بناءً على ${gradedCount} ورقة مصححة`}
          </p>
        </div>

        {/* Card 2: Pass Rate */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>{t.reports.passRate}</span>
            <Award className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <div className="text-2xl font-black text-[#0E1B2E] dark:text-white">
            {passRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {language === "fr" 
              ? `${passCount} sur ${gradedCount} élèves` 
              : language === "en" 
              ? `${passCount} of ${gradedCount} students` 
              : `${passCount} من أصل ${gradedCount} تلميذ`}
          </p>
        </div>

        {/* Card 3: Max Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>{t.reports.maxGrade}</span>
            <CheckCircle2 className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <div className="text-2xl font-black text-[#7A142A] dark:text-[#E8829A]">
            {maxScore ? maxScore.toFixed(1) : "—"}{" "}
            <span className="text-xs font-bold text-slate-400">/ 20</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t.reports.minGrade}: {minScore ? minScore.toFixed(1) : "—"}
          </p>
        </div>

        {/* Card 4: Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>{language === "fr" ? "Progression" : language === "en" ? "Progress" : "نسبة تقدم التصحيح"}</span>
            <Users className="w-4 h-4 text-[#0E1B2E] dark:text-slate-300" />
          </div>
          <div className="text-2xl font-black text-[#0E1B2E] dark:text-white">
            {totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {language === "fr" 
              ? `${gradedCount} / ${totalStudents} terminés` 
              : language === "en" 
              ? `${gradedCount} of ${totalStudents} done` 
              : `تم إنجاز ${gradedCount} من ${totalStudents}`}
          </p>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      {gradedCount > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <TricolorStripe />
          <div className="p-5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              {t.reports.distributionTitle}
            </h4>
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {distExcellent > 0 && (
                <div
                  style={{ width: `${(distExcellent / gradedCount) * 100}%` }}
                  className="bg-[#C89B3C] h-full flex items-center justify-center text-[10px] text-white font-black"
                  title={`${t.reports.levelExcellent}: ${distExcellent}`}
                >
                  {distExcellent}
                </div>
              )}
              {distGood > 0 && (
                <div
                  style={{ width: `${(distGood / gradedCount) * 100}%` }}
                  className="bg-[#0E1B2E] dark:bg-slate-700 h-full flex items-center justify-center text-[10px] text-white font-bold"
                  title={`${t.reports.levelGood}: ${distGood}`}
                >
                  {distGood}
                </div>
              )}
              {distMedium > 0 && (
                <div
                  style={{ width: `${(distMedium / gradedCount) * 100}%` }}
                  className="bg-amber-400 h-full flex items-center justify-center text-[10px] text-slate-900 font-bold"
                  title={`${t.reports.levelMedium}: ${distMedium}`}
                >
                  {distMedium}
                </div>
              )}
              {distLow > 0 && (
                <div
                  style={{ width: `${(distLow / gradedCount) * 100}%` }}
                  className="bg-[#7A142A] h-full flex items-center justify-center text-[10px] text-white font-bold"
                  title={`${t.reports.levelNeedsSupport}: ${distLow}`}
                >
                  {distLow}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C] inline-block" />
                {t.reports.levelExcellent}: {distExcellent}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E1B2E] dark:bg-slate-400 inline-block" />
                {t.reports.levelGood}: {distGood}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                {t.reports.levelMedium}: {distMedium}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A142A] inline-block" />
                {t.reports.levelNeedsSupport}: {distLow}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* On-screen Student Gradebook Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-[#0E1B2E] dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#7A142A] dark:text-[#E8829A]" />
                <span>{t.reports.gradebookTable} ({currentClass.name})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "fr" 
                  ? "Aperçu complet des notes et appréciations avant export" 
                  : language === "en" 
                  ? "Full overview of scores and evaluations before export" 
                  : "معاينة شاملة لعلامات وتقديرات التلاميذ قبل التصدير"}
              </p>
            </div>

            {/* Student Search */}
            <div className="relative w-full sm:w-64">
              <Search className={`w-3.5 h-3.5 text-slate-400 absolute top-3 ${isRtl ? "right-3" : "left-3"}`} />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={language === "fr" ? "Rechercher un élève..." : language === "en" ? "Search student..." : "بحث عن تلميذ..."}
                className={`w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 text-slate-800 dark:text-slate-200 focus:outline-[#7A142A] ${
                  isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">{t.reports.colRank}</th>
                  <th className={`py-2.5 px-3 ${isRtl ? "text-right" : "text-left"}`}>{t.reports.colStudent}</th>
                  <th className="py-2.5 px-3 text-center">{t.reports.colGradesCount}</th>
                  <th className="py-2.5 px-3 text-center">{t.reports.colAverage}</th>
                  <th className="py-2.5 px-3 text-center">{t.reports.colAppreciation}</th>
                  <th className="py-2.5 px-3 text-center">{language === "fr" ? "Statut" : language === "en" ? "Status" : "الحالة"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      {language === "fr" ? "Aucun élève trouvé" : language === "en" ? "No student found" : "لا يوجد تلاميذ مطابقون"}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const hasResult = Boolean(student.result);
                    const norm20 = hasResult
                      ? ((student.result!.score / (student.result!.total || 20)) * 20).toFixed(2)
                      : null;
                    const evalText = norm20 ? getEvaluationLabel(Number(norm20)) : "—";

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className={`py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}>
                          {student.name}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">
                          {hasResult ? (
                            <span className="font-semibold">
                              {student.result!.score} / {student.result!.total || 20}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {norm20 ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                              Number(norm20) >= 10
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            }`}>
                              {norm20} / 20
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {evalText}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {hasResult ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>{language === "fr" ? "Corrigé" : language === "en" ? "Graded" : "مصحح"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{language === "fr" ? "En attente" : language === "en" ? "Pending" : "في الانتظار"}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Executive Pedagogical Analysis & Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <TricolorStripe />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B] shrink-0">
                <BookOpen className="w-6 h-6 text-[#C89B3C]" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-[#0E1B2E] dark:text-white">
                  {language === "fr"
                    ? `Analyse Pédagogique : ${currentClass.name}`
                    : language === "en"
                    ? `Pedagogical Analysis: ${currentClass.name}`
                    : `التحليل البيداغوجي لنتائج ${currentClass.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
                  {gradedCount === 0
                    ? (language === "fr" 
                        ? "Aucune copie n'a été corrigée dans cette classe pour le moment. Commencez la correction pour voir les analyses."
                        : language === "en"
                        ? "No copies graded yet in this class. Start grading to view pedagogical recommendations."
                        : "لم يتم تصحيح أي ورقة في هذا القسم حتى الآن. ابدأ بتصحيح أوراق التلاميذ لتظهر التحليلات والتوصيات البيداغوجية الدقيقة.")
                    : passRate >= 70
                    ? (language === "fr"
                        ? `Le niveau global de la classe est très satisfaisant avec un taux de réussite de ${passRate}%.`
                        : language === "en"
                        ? `Class performance is strong with a pass rate of ${passRate}%.`
                        : `مستوى القسم مستقر ومبشر بنسبة نجاح بلغت ${passRate}%. ينصح بالتركيز على التمارين التركيبية والوضعيات الإدماجية لدعم التلاميذ المتفوقين.`)
                    : passRate >= 50
                    ? (language === "fr"
                        ? `Niveau moyen avec ${passRate}% de réussite. Il est recommandé de programmer des séances de remédiation ciblées.`
                        : language === "en"
                        ? `Average performance with ${passRate}% pass rate. Remediation sessions are advised for challenging topics.`
                        : `مستوى القسم متوسط بنسبة نجاح ${passRate}%. يوصى ببرمجة حصص دعم واستدراك استهدفت المفاهيم التي تعثر فيها معظم التلاميذ.`)
                    : (language === "fr"
                        ? `Le taux de réussite (${passRate}%) nécessite un plan d'urgence pédagogique et un soutien intensif.`
                        : language === "en"
                        ? `Pass rate (${passRate}%) indicates urgent need for pedagogical support and targeted review.`
                        : `نسبة النجاح (${passRate}%) تتطلب خطة معالجة بيداغوجية عاجلة ودعم مكثف للتعثرات الأساسية في مادة ${currentClass.subject || "التعليم"}.`)}
                </p>
              </div>
            </div>

            {onOpenClassesTab && (
              <button
                type="button"
                onClick={onOpenClassesTab}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E1B2E] hover:bg-[#1A2E4C] text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <span>{language === "fr" ? "Détails des élèves" : language === "en" ? "Student Details" : "عرض أوراق وتفاصيل التلاميذ"}</span>
                <ArrowLeft className={`w-4 h-4 text-[#C89B3C] ${isRtl ? "" : "rotate-180"}`} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">
                {language === "fr" ? "Au-dessus de la moyenne :" : language === "en" ? "Above average:" : "تلاميذ فوق المعدل:"}
              </span>
              <span className="text-sm font-black text-[#875C12] dark:text-[#E0B256]">
                {passCount} ({passRate}%)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">
                {language === "fr" ? "Besoin d'accompagnement :" : language === "en" ? "Needs remediation:" : "تلاميذ بحاجة لمرافقة:"}
              </span>
              <span className="text-sm font-black text-[#7A142A] dark:text-[#E8829A]">
                {gradedCount - passCount} ({100 - passRate}%)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-0.5">
                {language === "fr" ? "État du travail :" : language === "en" ? "Completion status:" : "جاهزية التصدير:"}
              </span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                {gradedCount === totalStudents && totalStudents > 0 
                  ? (language === "fr" ? "Correction complète ✓" : language === "en" ? "Completed 100% ✓" : "اكتمل التصحيح بالكامل ✓") 
                  : (language === "fr" ? `${totalStudents - gradedCount} copie(s) restante(s)` : language === "en" ? `${totalStudents - gradedCount} pending` : `متبقي ${totalStudents - gradedCount} ورقة`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
