import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Trash2
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { Student, AppLanguage } from "../types";
import { translations } from "../lib/i18n";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (students: Student[]) => void;
  className: string;
  language?: AppLanguage;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  className,
  language = "ar",
}) => {
  const t = translations[language] || translations.ar;
  const [parsedStudents, setParsedStudents] = useState<{ name: string; score?: number }[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean raw cell string: remove random line breaks, extra spaces, and leading numbers
  const cleanCellText = (val: any): string => {
    if (val === null || val === undefined) return "";
    let str = String(val);
    str = str.replace(/[\r\n\t]+/g, " ");
    str = str.replace(/\s+/g, " ");
    str = str.replace(/^[0-9]{1,3}\s*[-.)/\\_]\s*/, "");
    return str.trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Read data as 2D array
        const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (!rawData || rawData.length === 0) {
          throw new Error(
            language === "fr"
              ? "Le fichier Excel est vide ou illisible."
              : language === "en"
              ? "The Excel file is empty or unreadable."
              : "ملف الإكسل فارغ أو لا يحتوي على بيانات مقروءة."
          );
        }

        // Find columns for Name, Surname, or Score
        let nameColIdx = -1;
        let surnameColIdx = -1;
        let scoreColIdx = -1;
        let dataStartRow = 0;

        // Scan header rows
        for (let r = 0; r < Math.min(rawData.length, 10); r++) {
          const row = rawData[r];
          for (let c = 0; c < row.length; c++) {
            const val = cleanCellText(row[c]).toLowerCase();
            if (
              val.includes("اللقب") ||
              val.includes("nom") ||
              val.includes("last name") ||
              val.includes("surname")
            ) {
              surnameColIdx = c;
              dataStartRow = Math.max(dataStartRow, r + 1);
            }
            if (
              (val.includes("الاسم") ||
                val.includes("prénom") ||
                val.includes("prenom") ||
                val.includes("first name")) &&
              !val.includes("اللقب")
            ) {
              nameColIdx = c;
              dataStartRow = Math.max(dataStartRow, r + 1);
            }
            if (
              val.includes("الاسم واللقب") ||
              val.includes("الاسم الكامل") ||
              val.includes("nom et prenom") ||
              val.includes("full name") ||
              val.includes("تلميذ") ||
              val.includes("eleve")
            ) {
              nameColIdx = c;
              surnameColIdx = -1;
              dataStartRow = Math.max(dataStartRow, r + 1);
            }
            if (
              val.includes("علامة") ||
              val.includes("نقطة") ||
              val.includes("ملاحظة") ||
              val.includes("note") ||
              val.includes("score") ||
              val.includes("grade")
            ) {
              scoreColIdx = c;
              dataStartRow = Math.max(dataStartRow, r + 1);
            }
          }
        }

        // Fallback column index
        if (nameColIdx === -1 && surnameColIdx === -1) {
          for (let c = 0; c < (rawData[0]?.length || 1); c++) {
            for (let r = 0; r < Math.min(rawData.length, 5); r++) {
              const str = cleanCellText(rawData[r][c]);
              if (str.length > 3 && !/^[0-9.]+$/.test(str)) {
                nameColIdx = c;
                break;
              }
            }
            if (nameColIdx !== -1) break;
          }
        }

        const extracted: { name: string; score?: number }[] = [];
        const seenNames = new Set<string>();

        for (let r = dataStartRow; r < rawData.length; r++) {
          const row = rawData[r];
          if (!row || row.length === 0) continue;

          let fullName = "";
          if (surnameColIdx !== -1 && nameColIdx !== -1 && surnameColIdx !== nameColIdx) {
            const surname = cleanCellText(row[surnameColIdx]);
            const firstname = cleanCellText(row[nameColIdx]);
            if (surname || firstname) {
              fullName = `${surname} ${firstname}`.trim();
            }
          } else if (nameColIdx !== -1) {
            fullName = cleanCellText(row[nameColIdx]);
          } else if (row[0]) {
            fullName = cleanCellText(row[0]);
          }

          if (
            fullName.length < 2 ||
            /^(تلميذ|الرقم|المجموع|المعدل|الملاحظة|nom|prenom|note|total|moyenne)$/i.test(fullName) ||
            /^[0-9]+$/.test(fullName)
          ) {
            continue;
          }

          let scoreVal: number | undefined = undefined;
          if (scoreColIdx !== -1 && row[scoreColIdx] !== undefined && row[scoreColIdx] !== "") {
            const rawScore = String(row[scoreColIdx]).replace(",", ".");
            const parsed = parseFloat(rawScore);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
              scoreVal = parsed;
            }
          }

          if (!seenNames.has(fullName)) {
            seenNames.add(fullName);
            extracted.push({ name: fullName, score: scoreVal });
          }
        }

        if (extracted.length === 0) {
          throw new Error(
            language === "fr"
              ? "Aucun nom d'élève valide détecté dans le fichier."
              : language === "en"
              ? "No valid student names detected in the file."
              : "لم يتم التعرف على أي أسماء تلاميذ صالحة في ملف الإكسل. تأكد من احتواء الملف على عمود للأسماء."
          );
        }

        setParsedStudents(extracted);
      } catch (err: any) {
        setError(err.message || t.common.error);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError(
        language === "fr"
          ? "Échec de lecture du fichier sélectionné."
          : language === "en"
          ? "Failed to read the selected file."
          : "تعذر قراءة الملف المحدد من جهازك."
      );
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (parsedStudents.length === 0) return;

    const newStudents: Student[] = parsedStudents.map((st) => {
      const student: Student = {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: st.name,
      };

      if (st.score !== undefined) {
        student.result = {
          score: st.score,
          total: 20,
          questions: [],
          feedback: language === "fr" ? "Note importée depuis Excel" : language === "en" ? "Grade imported from Excel" : "علامة مستوردة من ملف كشف النقاط",
          graded_at: new Date().toISOString(),
        };
      }

      return student;
    });

    onImportStudents(newStudents);
    onClose();
  };

  const handleRemoveItem = (idx: number) => {
    setParsedStudents(parsedStudents.filter((_, i) => i !== idx));
  };

  return (
    <div dir={t.dir} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <TricolorStripe />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FDF2F4] dark:bg-[#2A101A] text-[#7A142A] dark:text-[#E8829A] border border-[#F5CCD4] dark:border-[#521C2B]">
              <FileSpreadsheet className="w-5 h-5 text-[#7A142A]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0E1B2E] dark:text-white">
                {language === "fr" ? "Importer depuis Excel / CSV" : language === "en" ? "Import from Excel / CSV" : "استيراد قائمة التلاميذ من ملف Excel / CSV"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === "fr" ? "Classe:" : language === "en" ? "Class:" : "إلى قسم:"} <strong className="text-[#0E1B2E] dark:text-slate-200">{className}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#7A142A] dark:hover:border-[#C89B3C] rounded-2xl p-6 text-center cursor-pointer bg-slate-50/70 dark:bg-slate-800/40 transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onClick={(e) => {
                (e.target as HTMLInputElement).value = "";
              }}
              onChange={handleFileUpload}
            />

            <div className="w-12 h-12 rounded-2xl bg-[#FDF8EB] dark:bg-[#241B0E] text-[#875C12] dark:text-[#E0B256] border border-[#EADBB8] dark:border-[#4D3A1B] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6 text-[#C89B3C]" />
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#0E1B2E] dark:text-white">
              {language === "fr" ? "Cliquez pour choisir un fichier Excel (.xlsx / .xls) ou CSV" : language === "en" ? "Click to select an Excel (.xlsx / .xls) or CSV file" : "اضغط لاختيار ملف Excel (.xlsx / .xls) أو CSV"}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {language === "fr"
                ? "Nettoie automatiquement les sauts de lignes et numéros superflus"
                : language === "en"
                ? "Automatically removes numbering and random delimiters"
                : "يقوم النظام بتنظيم الأسطر وإزالة التكرارات والأرقام والفواصل العشوائية داخل الخانات تلقائياً"}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="p-4 text-center text-xs text-slate-500">
              <div className="inline-block animate-spin w-5 h-5 border-2 border-[#7A142A] border-t-transparent rounded-full mb-2" />
              <p>{t.common.loading}</p>
            </div>
          )}

          {/* Parsed List Preview */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0E1B2E] dark:text-white">
                <span>
                  {language === "fr" 
                    ? `Élèves extraits (${parsedStudents.length}):` 
                    : language === "en" 
                    ? `Extracted students (${parsedStudents.length}):` 
                    : `الأسماء المنظمة المستخرجة (${parsedStudents.length} تلميذ):`}
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {fileName}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                {parsedStudents.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-[#0E1B2E] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#0E1B2E] dark:text-white truncate">
                        {st.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {st.score !== undefined && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FDF8EB] text-[#875C12] border border-[#EADBB8] dark:bg-[#241B0E] dark:text-[#E0B256] text-[10px] font-black">
                          {st.score} / 20
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t.common.cancel}
          </button>

          <button
            type="button"
            disabled={parsedStudents.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] active:scale-98 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#7A142A]/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#C89B3C]" />
            <span>
              {language === "fr"
                ? `Confirmer l'importation (${parsedStudents.length} élèves)`
                : language === "en"
                ? `Confirm import (${parsedStudents.length} students)`
                : `تأكيد استيراد (${parsedStudents.length}) تلميذ للقسم`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
