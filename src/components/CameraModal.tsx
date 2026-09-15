import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  SwitchCamera, 
  Plus, 
  AlertCircle, 
  Sparkles,
  UploadCloud
} from "lucide-react";
import { TricolorStripe } from "./TricolorStripe";
import { AppLanguage } from "../types";
import { translations } from "../lib/i18n";
import { optimizeImageFile } from "../lib/storage";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title: string;
  helperText?: string;
  language?: AppLanguage;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
  helperText,
  language = "ar",
}) => {
  const t = translations[language] || translations.ar;
  const isRtl = t.dir === "rtl";

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  // Stop camera stream safely
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream with resilient fallback
  const startCamera = async (mode: "environment" | "user") => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        language === "fr"
          ? "L'accès direct à la webcam n'est pas supporté dans ce navigateur. Utilisez le bouton appareil photo ci-dessous."
          : language === "en"
          ? "Direct webcam access is not supported in this browser environment. Use the device camera button below."
          : "متصفحك الحالي أو بيئة العمل لا تدعم الوصول المباشر للويبكام. يمكنك استخدام كاميرا الجهاز من خلال الزر أدناه."
      );
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          });
        } catch {
          // Final fallback: any video
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) throw new Error("No stream acquired");

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check device count
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Ignore enumerate devices errors
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      let msg =
        language === "fr"
          ? "Impossible d'ouvrir la caméra."
          : language === "en"
          ? "Unable to open the camera."
          : "تعذر فتح الكاميرا.";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg =
          language === "fr"
            ? "L'accès à la caméra a été refusé par le navigateur. Veuillez autoriser la caméra ou utiliser le bouton natif ci-dessous."
            : language === "en"
            ? "Camera access was denied by the browser. Please grant camera permission or use the device camera button below."
            : "تم رفض إذن الكاميرا من قِبل المتصفح. يرجى منح الإذن للكاميرا أو استخدام زر الالتقاط بالجهاز أدناه.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg =
          language === "fr"
            ? "Aucune caméra détectée sur cet appareil."
            : language === "en"
            ? "No camera found on this device."
            : "لم يتم العثور على كاميرا متصلة بجهازك.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg =
          language === "fr"
            ? "La caméra est déjà utilisée par une autre application."
            : language === "en"
            ? "The camera is currently in use by another application."
            : "الكاميرا قيد الاستخدام بواسطة تطبيق آخر في جهازك.";
      }
      setCameraError(msg);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setPageCount(0);
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  // Flip between front/back cameras
  const toggleFacingMode = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
  };

  // Capture current video frame
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.90);
      setCapturedImage(dataUrl);
    }
    setIsCapturing(false);
  };

  // Confirm image and finish
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopStream();
      onClose();
    }
  };

  // Multi-page: Add current page and continue capturing next page
  const handleAddPageAndContinue = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setPageCount((prev) => prev + 1);
      setCapturedImage(null);
      if (videoRef.current && streamRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Retake
  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Fallback upload via system camera input with optimization
  const handleFallbackFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsOptimizing(true);
      try {
        const file = e.target.files[0];
        const optimized = await optimizeImageFile(file, 1920);
        onCapture(optimized);
        stopStream();
        onClose();
      } catch (err) {
        console.error("Failed to process fallback image:", err);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  if (!isOpen) return null;

  const defaultHelperText =
    language === "fr"
      ? "Positionnez la caméra à plat au-dessus de la feuille avec un bon éclairage."
      : language === "en"
      ? "Hold the camera flat above the paper with adequate lighting."
      : "وجّه الكاميرا بشكل مستوٍ فوق الورقة مع إضاءة جيدة.";

  return (
    <div
      dir={t.dir}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-[#0E1B2E] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <TricolorStripe />

        {/* Modal Header */}
        <div className="p-4 bg-[#0A1424] border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7A142A] text-white">
              <Camera className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {helperText || defaultHelperText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasMultipleCameras && !capturedImage && !cameraError && (
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={language === "fr" ? "Changer de caméra" : language === "en" ? "Switch Camera" : "تبديل الكاميرا (أمامية/خلفية)"}
              >
                <SwitchCamera className="w-4 h-4 text-[#C89B3C]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={t.common.cancel}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[400px] overflow-hidden">
          {flash && <div className="absolute inset-0 bg-white z-20 animate-ping opacity-75" />}

          {pageCount > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-[#7A142A] text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>
                {language === "fr"
                  ? `${pageCount} page(s) ajoutée(s)`
                  : language === "en"
                  ? `${pageCount} page(s) added`
                  : `تمت إضافة ${pageCount} صفحة`}
              </span>
            </div>
          )}

          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">
                  {language === "fr"
                    ? "Accès direct à la caméra indisponible"
                    : language === "en"
                    ? "Direct camera access unavailable"
                    : "تعذر الوصول المباشر للكاميرا"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  disabled={isOptimizing}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#7A142A]/30 transition-all cursor-pointer active:scale-98"
                >
                  <Camera className="w-4 h-4 text-[#C89B3C]" />
                  <span>
                    {isOptimizing
                      ? t.common.loading
                      : language === "fr"
                      ? "Prendre une photo avec l'appareil"
                      : language === "en"
                      ? "Take photo with device camera"
                      : "التقاط صورة عبر كاميرا النظام / المتصفح"}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400">
                  {language === "fr"
                    ? "Ouvre directement l'appareil photo de votre smartphone ou tablette"
                    : language === "en"
                    ? "Directly opens the camera app on your phone or tablet"
                    : "يفتح تطبيق الكاميرا بهاتفك أو حاسوبك فوراً وبدقة عالية"}
                </p>
                <input
                  ref={fileFallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFallbackFile}
                />
              </div>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/90 p-2">
              <img
                src={capturedImage}
                alt="Captured exam page"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-700"
              />
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#F4D068] border border-[#F4D068]/30 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>
                  {language === "fr"
                    ? "Aperçu de la photo capturée"
                    : language === "en"
                    ? "Captured image preview"
                    : "معاينة الصورة المُلتقطة"}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain max-h-[60vh]"
              />

              {/* Viewfinder Target Guidelines */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-r-4 border-[#C89B3C] rounded-tr-lg" />
                  <div className="w-6 h-6 border-t-4 border-l-4 border-[#C89B3C] rounded-tl-lg" />
                </div>
                <div className="text-center">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                    {language === "fr"
                      ? "Placez la feuille d'examen dans le cadre"
                      : language === "en"
                      ? "Place exam sheet inside the frame"
                      : "ضع ورقة الامتحان داخل الإطار"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-r-4 border-[#C89B3C] rounded-br-lg" />
                  <div className="w-6 h-6 border-b-4 border-l-4 border-[#C89B3C] rounded-bl-lg" />
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Controls Footer */}
        <div className="p-4 sm:p-5 bg-[#0A1424] border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>
                  {language === "fr"
                    ? "Reprendre"
                    : language === "en"
                    ? "Retake"
                    : "إعادة الالتقاط"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddPageAndContinue}
                  className="px-4 py-2.5 rounded-xl bg-[#0E1B2E] hover:bg-[#1A2E4C] border border-[#C89B3C]/50 text-[#F4D068] text-xs font-bold flex items-center gap-1.5 transition-all"
                  title={
                    language === "fr"
                      ? "Ajouter une autre page à ce devoir"
                      : language === "en"
                      ? "Add another page to this exam"
                      : "حفظ هذه الصفحة والتقاط صفحة تالية إضافية لنفس الورقة"
                  }
                >
                  <Plus className="w-4 h-4 text-[#C89B3C]" />
                  <span>
                    {language === "fr"
                      ? "Autre page (+)"
                      : language === "en"
                      ? "Add page (+)"
                      : "صفحة ثانية (+)"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-xl bg-[#7A142A] hover:bg-[#681123] text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-[#7A142A]/40 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#C89B3C]" />
                  <span>
                    {language === "fr"
                      ? "Confirmer et utiliser"
                      : language === "en"
                      ? "Confirm & Use"
                      : "تأكيد واستخدام"}
                  </span>
                </button>
              </div>
            </>
          ) : !cameraError ? (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                {t.common.cancel}
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={isCapturing}
                onClick={takeSnapshot}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-white/20 border-4 border-slate-700 cursor-pointer"
                title={language === "fr" ? "Prendre la photo" : language === "en" ? "Take snapshot" : "التقاط صورة"}
              >
                <div className="w-12 h-12 rounded-full bg-[#7A142A] group-hover:bg-[#681123] transition-colors flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#C89B3C]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={
                  language === "fr"
                    ? "Utiliser l'appareil photo natif"
                    : language === "en"
                    ? "Use native device camera"
                    : "استخدام كاميرا الجهاز الافتراضية"
                }
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>
                  {language === "fr"
                    ? "Appareil photo"
                    : language === "en"
                    ? "Phone Cam"
                    : "كاميرا الهاتف"}
                </span>
              </button>

              <input
                ref={fileFallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackFile}
              />
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                {t.common.cancel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
