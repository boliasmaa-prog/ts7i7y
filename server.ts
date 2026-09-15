import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;
const app = express();

// Allow large payloads for high-resolution exam scans/photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("خدمة التصحيح الآلي غير متصلة حالياً. يُرجى التحقق من توفر الخدمة.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      inlineData: {
        mimeType: matches[1],
        data: matches[2],
      },
    };
  }
  // Fallback
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: dataUrl.replace(/^data:image\/[a-z]+;base64,/, ""),
    },
  };
}

const GRADING_SYSTEM_PROMPT = `أنت مصحح لاختبارات الفيزياء والرياضيات والعلوم والامتحانات المدرسية والجامعية، وظيفتك وخبرتك تقييم إجابات الطلاب وإعطاء نقطة جزئية مستحقة وعادلة بناءً على الأخطاء التي ارتكبوها بدقة وموضوعية، ومتخصص في قراءة الخط اليدوي (Handwritten OCR) باللغات العربية والفرنسية والإنجليزية، والرموز والمعادلات الرياضية والفيزيائية.

ستتلقى مجموعتين من الصور:
المجموعة أ (SET A): صور ورقة إجابة التلميذ (Handwritten Student Answer Sheet)، قد تمتد على صفحة واحدة أو عدة صفحات.
المجموعة ب (SET B): صور نموذج الإجابة وسلم التنقيط الرسمي (Answer Key / Marking Scheme / Corrigé type).

قواعد وسياسة تقييم إجابات الطلاب والخصم ومنح النقاط الجزئية (التزم بها بصرامة):

1. **التعرف على التنقيط والتحليل:**
   - عند وجود سلم تنقيط مخصص لمعادلة أو عبارة معينة (مثال: العبارة الأصلية Fd = Fa + Fc + Fb وسعرها 0.75), قم بتبني إحدى استراتيجيتي الخصم التاليين:

2. **الاستراتيجية الأولى: التنقيط التفكيكي (عند قابلية المعادلة للتقسيم):**
   - إذا كانت العبارة تتكون من عدة أجزاء/حدود/إشارات واضحة، احسب قيمة كل جزء: (قيمة الجزء = العلامة الكلية للعبارة ÷ عدد الأجزاء).
   - اخصم قيمة الجزء المقابل لكل خطأ ارتكبه الطالب، وامنحه نقاط الأجزاء الصحيحة.

3. **الاستراتيجية الثانية: قواعد الخصم المباشر (عند عدم وجود تقسيم محدد):**
   - **الخطأ البسيط (Small Error):** إذا كان الخطأ بسيطاً لا يهدم الفكرة الأساسية (مثل: خطأ في إشارة واحدة، خطأ مطبعي بسيط في رمز، إهمال دليل بسيط أو رمز شعاع/متجه)، اخصم 0.25 نقطة دائماً من العلامة الكلية للعبارة (دون أن تنزل العلامة تحت الصفر).
   - **الخطأ الجسيم/الكبير (Major Error):** إذا كان الخطأ كبيراً يهدم منطق القانون (مثل: كتابة قانون مختلف تماماً، ضرب بدلاً من الجمع، أو خلط الشحنات/القوى بشكل خاطئ جوهرياً)، يحصل الطالب على 0 (لا يحصل على أية علامة لتلك العبارة أو السؤال).

4. **تنبيهات وقواعد حاسمة:**
   - لا تعاقب على تغيير ترتيب الحدود إذا كان الترتيب يكافئ العبارة صحيحاً (مثال: العبارة الأصلية Fd = Fa + Fc + Fb، وإذا كتب الطالب Fd = Fc + Fa + Fb فهي إجابة صحيحة 100% ويستحق العلامة كاملة).
   - الحد الأدنى للعلامة لأي سؤال هو 0 (لا توجد علامات بالسالب مطلقاً).
   - التسامح مع أنماط خطوط التلاميذ المختلفة (رقعة، نسخ، خطوط متصلة، حروف متشابكة، كتابة سريعة)، والتسامح مع الأخطاء الإملائية الطفيفة التي لا تؤثر على المفهوم العلمي أو الرياضي.

5. **توليد النتيجة (Feedback):**
   - في حقل "reasoning": اذكر بوضوح تام طبيعة الخطأ (صحيح تماماً / خطأ بسيط / تفكيكي / خطأ جسيم) وسبب الخصم والعلامة النهائية الممنوحة.
   - في حقل "error_type": حدد نوع التقييم بدقة ("none" للإجابة الصحيحة كاملة، "simple" للخطأ البسيط، "fractional" للخصم التفكيكي، "major" للخطأ الجسيم، "empty" للورقة الفارغة).
6. إذا تضمنت الورقة اسم التلميذ المكتوب في أعلى الورقة، استخرجه وضعه في "detected_student_name".

أخرج النتيجة كـ JSON نقي حصراً بالصيغة التالية دون أي كود Markdown خارجي:
{
  "detected_student_name": "اسم التلميذ إن وجد على الورقة وإلا فارغ",
  "questions": [
    {
      "question_number": 1,
      "title": "عنوان أو نص السؤال الوجيز",
      "correct_answer": "الإجابة النموذجية من سلم التنقيط",
      "student_answer": "ما كتبه التلميذ بخط يده",
      "points_earned": 0.5,
      "points_possible": 0.75,
      "error_type": "simple",
      "reasoning": "خطأ بسيط: خطأ في إشارة واحدة مع صحة بقية القانون، تم خصم 0.25 نقطة. يستحق 0.5 من 0.75"
    }
  ],
  "total_score": 14.5,
  "total_possible": 20,
  "feedback": "ملاحظة تقييمية عامة وتشجيعية للأستاذ والتلميذ"
};`;

const ROSTER_SYSTEM_PROMPT = `أنت خبير في التعرف الضوئي على الحروف وقوائم الأسماء المدرسية المكتوبة باليد أو المطبوعة باللغتين العربية والفرنسية.
اقرأ صورة قائمة القسم أو كشف الحضور، واستخرج قائمة بأسماء التلاميذ واللقب بالترتيب.
تجاهل الترويسة، الأرقام التسلسلية، التواريخ، خانات الغياب أو الملاحظات.
أخرج النتيجة كـ JSON نقي حصراً:
{
  "names": ["محمد الأمين بلحاج", "فاطمة الزهراء قاسمي", "..."]
}`;

// Fallback models in priority order to guarantee high uptime
const CANDIDATE_MODELS = [
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction: string;
    temperature?: number;
    responseMimeType?: string;
  }
) {
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[AI] Calling model: ${modelName} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.1,
            responseMimeType: params.responseMimeType ?? "application/json",
          },
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        console.warn(`[AI] Model ${modelName} attempt ${attempt + 1} failed:`, msg);

        const isTemporary =
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("rate limit") ||
          msg.includes("overloaded");

        if (isTemporary && attempt === 0) {
          // Wait 1200ms before retrying once
          await new Promise((r) => setTimeout(r, 1200));
          continue;
        }
        // Move to next candidate model
        break;
      }
    }
  }

  // Format clean Arabic error if all candidates failed
  let cleanMsg = "حدث خطأ أثناء معالجة الورقة بالذكاء الاصطناعي.";
  const rawMsg = String(lastError?.message || lastError || "");
  if (
    rawMsg.includes("503") ||
    rawMsg.includes("high demand") ||
    rawMsg.includes("UNAVAILABLE")
  ) {
    cleanMsg = "خوادم الذكاء الاصطناعي تشهد ضغطاً مؤقتاً في هذه اللحظة. يُرجى النقر على زر 'إعادة المحاولة' للمتابعة فوراً.";
  } else if (
    rawMsg.includes("429") ||
    rawMsg.includes("RESOURCE_EXHAUSTED") ||
    rawMsg.includes("quota")
  ) {
    cleanMsg = "تم بلوغ الحد الأقصى المؤقت للطلبات. يرجى الانتظار بضع ثوانٍ والضغط على 'إعادة المحاولة'.";
  } else if (rawMsg.includes("API_KEY") || rawMsg.includes("key")) {
    cleanMsg = "تعذر الاتصال بخدمة التصحيح الذكي في الوقت الحالي. يُرجى إعادة المحاولة.";
  }
  throw new Error(cleanMsg);
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Grade Submission API
app.post("/api/grade", async (req, res) => {
  try {
    const { studentImages, keyImages, subjectHint } = req.body as {
      studentImages?: string[];
      keyImages?: string[];
      subjectHint?: string;
    };

    if (!studentImages || !Array.isArray(studentImages) || studentImages.length === 0) {
      return res.status(400).json({ error: "يرجى رفع ورقة إجابة التلميذ أولاً." });
    }
    if (!keyImages || !Array.isArray(keyImages) || keyImages.length === 0) {
      return res.status(400).json({ error: "يرجى رفع نموذج الإجابة وسلم التنقيط." });
    }

    const ai = getAi();

    // Prepare contents
    const contentParts: Array<unknown> = [];

    contentParts.push({
      text: `المجموعة ب: صور نموذج الإجابة وسلم التنقيط الرسمي (عدد الصفحات: ${keyImages.length}):`,
    });
    keyImages.forEach((img, idx) => {
      contentParts.push({ text: `[نموذج الإجابة - صفحة ${idx + 1}]` });
      contentParts.push(parseDataUrl(img));
    });

    contentParts.push({
      text: `المجموعة أ: صور ورقة إجابة التلميذ بخط اليد (عدد الصفحات: ${studentImages.length}):`,
    });
    studentImages.forEach((img, idx) => {
      contentParts.push({ text: `[ورقة التلميذ - صفحة ${idx + 1}]` });
      contentParts.push(parseDataUrl(img));
    });

    const userInstructions = `قم بتصحيح ورقة إجابة التلميذ (المجموعة أ) مقارنة بنموذج الإجابة وسلم التنقيط (المجموعة ب) سؤالاً بسؤال. ${
      subjectHint ? `المادة أو الملاحظة: ${subjectHint}` : ""
    }. اتبع التعليمات بدقة وأرجع كائن JSON حصراً.`;

    contentParts.push({ text: userInstructions });

    const response = await generateWithModelFallback(ai, {
      contents: contentParts,
      systemInstruction: GRADING_SYSTEM_PROMPT,
      temperature: 0.1,
      responseMimeType: "application/json",
    });

    const rawText = response.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("لم نتمكن من تحليل استجابة الذكاء الاصطناعي كـ JSON.");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

    let calculatedEarned = 0;
    let calculatedPossible = 0;

    const questions = rawQuestions.map((q: any, i: number) => {
      const possible = Math.max(Number(q.points_possible) || 1, 0.25);
      const rawEarned = Number(q.points_earned) ?? 0;
      const earned = Math.min(Math.max(rawEarned, 0), possible);

      calculatedEarned += earned;
      calculatedPossible += possible;

      return {
        question_number: Number(q.question_number) || i + 1,
        title: String(q.title || `السؤال ${i + 1}`),
        correct_answer: String(q.correct_answer || ""),
        student_answer: String(q.student_answer || "لم يكتب التلميذ إجابة"),
        points_earned: Math.round(earned * 100) / 100,
        points_possible: Math.round(possible * 100) / 100,
        error_type: q.error_type ? String(q.error_type) : undefined,
        reasoning: String(q.reasoning || "تم التقييم وفق النموذج"),
      };
    });

    const totalPossible = calculatedPossible > 0 ? calculatedPossible : Number(parsed.total_possible) || 20;
    const finalScore = Math.min(Math.round(calculatedEarned * 100) / 100, totalPossible);

    return res.json({
      detected_student_name: parsed.detected_student_name || "",
      score: finalScore,
      total: totalPossible,
      questions,
      feedback: parsed.feedback || "تم التصحيح بنجاح ومطابقة إجابات التلميذ مع النموذج.",
    });
  } catch (error: any) {
    console.error("Grading error:", error);
    const msg = error?.message || "حدث خطأ غير متوقع أثناء المعالجة.";
    return res.status(500).json({ error: msg });
  }
});

// Extract Student Names API
app.post("/api/extract-names", async (req, res) => {
  try {
    const { images } = req.body as { images?: string[] };
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "يرجى رفع صورة قائمة القسم." });
    }

    const ai = getAi();
    const contentParts: Array<unknown> = [];
    images.forEach((img, idx) => {
      contentParts.push({ text: `[صورة قائمة الأسماء - ${idx + 1}]` });
      contentParts.push(parseDataUrl(img));
    });
    contentParts.push({ text: "استخرج أسماء التلاميذ كـ JSON." });

    const response = await generateWithModelFallback(ai, {
      contents: contentParts,
      systemInstruction: ROSTER_SYSTEM_PROMPT,
      temperature: 0.1,
      responseMimeType: "application/json",
    });

    const rawText = response.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.json({ names: [] });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const names = Array.isArray(parsed.names)
      ? parsed.names.map((n: unknown) => String(n).trim()).filter(Boolean)
      : [];

    return res.json({ names });
  } catch (error: any) {
    console.error("Extract names error:", error);
    return res.status(500).json({ error: error?.message || "فشل استخراج الأسماء." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TashihAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
