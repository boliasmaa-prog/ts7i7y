import { ClassRoom, RubricTemplate, UserProfile, TeacherDoc, TeacherNote } from "../types";

const DB_NAME = "TashihAIDB";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("classes")) {
        db.createObjectStore("classes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("rubrics")) {
        db.createObjectStore("rubrics", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("documents")) {
        db.createObjectStore("documents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback in-memory/localStorage for non-heavy metadata if needed
const PROFILE_KEY = "tashihai:profile";

export async function getStoredProfile(): Promise<UserProfile> {
  try {
    const db = await openDB();
    const tx = db.transaction("meta", "readonly");
    const store = tx.objectStore("meta");
    const req = store.get(PROFILE_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result?.value) {
          resolve(req.result.value);
        } else {
          // Check localstorage fallback
          const local = localStorage.getItem(PROFILE_KEY);
          if (local) {
            try {
              resolve(JSON.parse(local));
              return;
            } catch {
              // ignore
            }
          }
          resolve({
            name: "",
            title: "أستاذ",
            gender: "male",
            schoolName: "",
            subject: "",
            isRegistered: false,
          });
        }
      };
      req.onerror = () => {
        resolve({
          name: "",
          title: "أستاذ",
          gender: "male",
          isRegistered: false,
        });
      };
    });
  } catch {
    return {
      name: "",
      title: "أستاذ",
      gender: "male",
      isRegistered: false,
    };
  }
}

export async function saveStoredProfile(profile: UserProfile): Promise<void> {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    const db = await openDB();
    const tx = db.transaction("meta", "readwrite");
    const store = tx.objectStore("meta");
    store.put({ key: PROFILE_KEY, value: profile });
  } catch (err) {
    console.warn("Could not persist profile in IndexedDB:", err);
  }
}

export async function getStoredClasses(): Promise<ClassRoom[]> {
  try {
    const db = await openDB();
    const tx = db.transaction("classes", "readonly");
    const store = tx.objectStore("classes");
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveStoredClasses(classes: ClassRoom[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("classes", "readwrite");
    const store = tx.objectStore("classes");
    store.clear();
    for (const c of classes) {
      store.put(c);
    }
  } catch (err) {
    console.error("Failed to save classes to IndexedDB:", err);
  }
}

export async function getStoredRubrics(): Promise<RubricTemplate[]> {
  try {
    const db = await openDB();
    const tx = db.transaction("rubrics", "readonly");
    const store = tx.objectStore("rubrics");
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveStoredRubric(rubric: RubricTemplate): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("rubrics", "readwrite");
    const store = tx.objectStore("rubrics");
    store.put(rubric);
  } catch (err) {
    console.error("Failed to save rubric:", err);
  }
}

export async function deleteStoredRubric(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("rubrics", "readwrite");
    const store = tx.objectStore("rubrics");
    store.delete(id);
  } catch (err) {
    console.error("Failed to delete rubric:", err);
  }
}

export async function getStoredDocs(): Promise<TeacherDoc[]> {
  try {
    const db = await openDB();
    const tx = db.transaction("documents", "readonly");
    const store = tx.objectStore("documents");
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveStoredDoc(doc: TeacherDoc): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("documents", "readwrite");
    const store = tx.objectStore("documents");
    store.put(doc);
  } catch (err) {
    console.error("Failed to save doc:", err);
  }
}

export async function deleteStoredDoc(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("documents", "readwrite");
    const store = tx.objectStore("documents");
    store.delete(id);
  } catch (err) {
    console.error("Failed to delete doc:", err);
  }
}

export async function getStoredNotes(): Promise<TeacherNote[]> {
  try {
    const db = await openDB();
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveStoredNote(note: TeacherNote): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    store.put(note);
  } catch (err) {
    console.error("Failed to save note:", err);
  }
}

export async function deleteStoredNote(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    store.delete(id);
  } catch (err) {
    console.error("Failed to delete note:", err);
  }
}

/**
 * Optimizes an image file for OCR:
 * - Resizes very large phone photos to max 1920px (optimal for Gemini OCR resolution)
 * - Compresses to crisp high quality JPEG (0.88 quality)
 * - Returns clean Base64 data URL
 * - Prevents crashing with 15MB+ camera files
 */
export async function optimizeImageFile(file: File, maxDim = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(e.target?.result));
          return;
        }

        // Draw with white background for transparency safety
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("فشل تحميل الصورة"));
      img.src = String(e.target?.result);
    };
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsDataURL(file);
  });
}
