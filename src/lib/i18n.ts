import { AppLanguage } from "../types";

export interface Translations {
  dir: "rtl" | "ltr";
  common: {
    save: string;
    cancel: string;
    delete: string;
    deleteAll: string;
    close: string;
    back: string;
    confirm: string;
    edit: string;
    add: string;
    all: string;
    filter: string;
    search: string;
    loading: string;
    success: string;
    error: string;
    actions: string;
    download: string;
    upload: string;
    preview: string;
    total: string;
    none: string;
    yes: string;
    no: string;
    view: string;
    retry: string;
  };
  tabs: {
    grading: string;
    classes: string;
    reports: string;
    rubrics: string;
    settings: string;
  };
  nav: {
    grading: string;
    classes: string;
    reports: string;
    rubrics: string;
    settings: string;
  };
  header: {
    welcomeMale: string;
    welcomeFemale: string;
    subject: string;
    school: string;
    aiConnected: string;
    preparingModel: string;
    notifications: string;
    toggleTheme: string;
    toggleLanguage: string;
  };
  footer: {
    copyright: string;
    features: string;
  };
  grading: {
    heroTitle: string;
    heroDesc: string;
    heroAction: string;
    mainTitle: string;
    mainSubtitle: string;
    targetClass: string;
    selectClassPrompt: string;
    targetStudent: string;
    selectStudentPrompt: string;
    allStudentsGraded: string;
    noClassesWarning: string;
    goToClasses: string;
    answerKeyTitle: string;
    manageRubrics: string;
    selectRubricPrompt: string;
    orUploadNew: string;
    uploadKeyTitle: string;
    uploadKeyDesc: string;
    chooseFromDevice: string;
    openCamera: string;
    registeredSubject: string;
    studentSheetTitle: string;
    uploadStudentTitle: string;
    uploadStudentDesc: string;
    ocrTolerance: string;
    startGrading: string;
    gradingInProgress: string;
    clearAndGradeNew: string;
    finalResult: string;
    from: string;
    excellent: string;
    average: string;
    belowAverage: string;
    detectedName: string;
    savedToRoster: string;
    saveToRoster: string;
    nextStudentAction: string;
    questionBreakdown: string;
    manualEditHint: string;
    finishManualEdit: string;
    editPointsManual: string;
    modelAnswer: string;
    studentAnswer: string;
    pedagogicalReasoning: string;
    step1Title: string;
    step1Subtitle: string;
    chooseSavedRubric: string;
    noSavedRubrics: string;
    customKeyUpload: string;
    dropKeyPrompt: string;
    step2Title: string;
    step2Subtitle: string;
    dropStudentPrompt: string;
    cameraCapture: string;
    cameraKey: string;
    cameraStudent: string;
    analyzing: string;
    analyzingDetail: string;
    resultTitle: string;
    scoreOutOf: string;
    percentage: string;
    strengths: string;
    weaknesses: string;
    pedagogicalNote: string;
    question: string;
    earned: string;
    max: string;
    notes: string;
    manualEdit: string;
    saveEdit: string;
    saveToStudent: string;
    savedSuccess: string;
    clearAndNew: string;
    studentNameDetected: string;
    confidence: string;
    classroom: string;
    student: string;
    addClass: string;
    addStudent: string;
    selectClassPlaceholder: string;
    selectStudentPlaceholder: string;
    quickImport: string;
    nextStudent: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  classes: {
    title: string;
    subtitle: string;
    mainTitle: string;
    mainSubtitle: string;
    addClass: string;
    addClassBtn: string;
    noClassesTitle: string;
    noClassesDesc: string;
    createFirstClass: string;
    scanRosterCamera: string;
    uploadRosterPhoto: string;
    importExcel: string;
    importExcelBtn: string;
    pasteNames: string;
    deleteClass: string;
    deleteClassConfirm: string;
    deleteStudentConfirm: string;
    studentNamePlaceholder: string;
    addStudentBtn: string;
    addStudent: string;
    studentNameCol: string;
    statusCol: string;
    scoreCol: string;
    actionsCol: string;
    noStudentsInClass: string;
    gradedStatus: string;
    pendingStatus: string;
    gradeAction: string;
    regradeAction: string;
    modalCreateClassTitle: string;
    classNameField: string;
    classNamePlaceholder: string;
    classSubjectField: string;
    classSubjectPlaceholder: string;
    createClassSubmit: string;
    modalBulkTitle: string;
    modalBulkDesc: string;
    bulkSubmit: string;
    classesList: string;
    students: string;
    studentNameInput: string;
    bulkAdd: string;
    bulkAddPlaceholder: string;
    tableNum: string;
    tableName: string;
    tableGrades: string;
    tableAverage: string;
    tableActions: string;
    gradeBtn: string;
    noStudents: string;
    noStudentsDesc: string;
    modalAddClassTitle: string;
    classNameLabel: string;
    classSubjectLabel: string;
    academicYearLabel: string;
    saveClassBtn: string;
  };
  rubrics: {
    mainTitle: string;
    mainSubtitle: string;
    tabRubrics: string;
    tabLessons: string;
    tabNotes: string;
    createRubric: string;
    newRubricBtn: string;
    newNoteBtn: string;
    newLessonBtn: string;
    noRubrics: string;
    noRubricsDesc: string;
    maxScore: string;
    viewDetails: string;
    useForGrading: string;
    useInGrading: string;
    criteriaCount: string;
    newRubricModalTitle: string;
    rubricTitlePlaceholder: string;
    rubricSubjectPlaceholder: string;
    totalScoreLabel: string;
    gradingCriteria: string;
    addCriterion: string;
    criterionTitlePlaceholder: string;
    pointsPlaceholder: string;
    criterionDescPlaceholder: string;
    saveRubricBtn: string;
    searchLessons: string;
    allClasses: string;
    uploadLessonBtn: string;
    noLessons: string;
    noLessonsDesc: string;
    previewDoc: string;
    downloadDoc: string;
    lessonTitlePlaceholder: string;
    lessonSubjectSelect: string;
    lessonTermSelect: string;
    lessonClassSelect: string;
    chooseFilePdfImg: string;
    saveLessonBtn: string;
    noNotes: string;
    noNotesDesc: string;
    deleteRubricConfirm: string;
    deleteNoteConfirm: string;
    addRubricTitle: string;
    rubricTitleInput: string;
    rubricSubjectInput: string;
    rubricClassSelect: string;
    rubricImagesUpload: string;
    rubricTextGuidelines: string;
    addNoteTitle: string;
    noteTitleInput: string;
    noteContentInput: string;
    saveNoteBtn: string;
  };
  lessons: {
    mainTitle: string;
    mainSubtitle: string;
    uploadLessonBtn: string;
    allFilter: string;
    pdfFilter: string;
    imageFilter: string;
    searchPlaceholder: string;
    noLessons: string;
    noLessonsDesc: string;
    addLessonTitle: string;
    lessonTitleInput: string;
    lessonSubjectInput: string;
    lessonClassSelect: string;
    lessonTermSelect: string;
    lessonFileType: string;
    uploadPdfOrImage: string;
    uploadPdfPrompt: string;
    uploadImagePrompt: string;
    captureWithCamera: string;
    saveLessonBtn: string;
    downloadBtn: string;
    previewBtn: string;
    deleteConfirm: string;
    pdfFile: string;
    imageFile: string;
    semester1: string;
    semester2: string;
    semester3: string;
  };
  reports: {
    mainTitle: string;
    mainSubtitle: string;
    selectClass: string;
    exportExcel: string;
    classStats: string;
    totalCount: string;
    testedCount: string;
    classAvg: string;
    passRate: string;
    maxGrade: string;
    minGrade: string;
    distributionTitle: string;
    levelExcellent: string;
    levelGood: string;
    levelMedium: string;
    levelNeedsSupport: string;
    gradebookTable: string;
    colRank: string;
    colStudent: string;
    colGradesCount: string;
    colAverage: string;
    colAppreciation: string;
    exportSuccess: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profileSection: string;
    roleLabel: string;
    teacherMale: string;
    teacherFemale: string;
    namePlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    schoolLabel: string;
    schoolPlaceholder: string;
    saveProfileBtn: string;
    savedNotification: string;
    languageSection: string;
    languageSubtitle: string;
    themeSection: string;
    themeSubtitle: string;
    lightModeTitle: string;
    lightModeDesc: string;
    darkModeTitle: string;
    darkModeDesc: string;
    darkModeOn: string;
    darkModeOff: string;
    backupSection: string;
    backupSubtitle: string;
    exportBackupBtn: string;
    importBackupBtn: string;
    diagnosticsSection: string;
    diagnosticsSubtitle: string;
    statusHealthy: string;
    statusIssue: string;
    handwritingGuideTitle: string;
    guideTip1Title: string;
    guideTip1Desc: string;
    guideTip2Title: string;
    guideTip2Desc: string;
    guideTip3Title: string;
    guideTip3Desc: string;
  };
}

export const translations: Record<AppLanguage, Translations> = {
  ar: {
    dir: "rtl",
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      deleteAll: "حذف الكل",
      close: "إغلاق",
      back: "رجوع",
      confirm: "تأكيد",
      edit: "تعديل",
      add: "إضافة",
      all: "الكل",
      filter: "تصفية",
      search: "بحث",
      loading: "جاري التحميل...",
      success: "تمت العملية بنجاح",
      error: "حدث خطأ غير متوقع",
      actions: "الإجراءات",
      download: "تحميل",
      upload: "رفع",
      preview: "معاينة",
      total: "المجموع",
      none: "لا يوجد",
      yes: "نعم",
      no: "لا",
      view: "عرض",
      retry: "إعادة المحاولة",
    },
    tabs: {
      grading: "التصحيح",
      classes: "الأقسام",
      reports: "التقارير",
      rubrics: "النماذج ومفكرتي",
      settings: "الإعدادات",
    },
    nav: {
      grading: "التصحيح",
      classes: "الأقسام",
      reports: "التقارير",
      rubrics: "النماذج ومفكرتي",
      settings: "الإعدادات",
    },
    header: {
      welcomeMale: "مرحباً بك أيها الأستاذ الفاضل",
      welcomeFemale: "مرحباً بك أيتها الأستاذة الفاضلة",
      subject: "المادة التعليمية",
      school: "المؤسسة التعليمية",
      aiConnected: "الذكاء الاصطناعي متصل",
      preparingModel: "تجهيز النموذج",
      notifications: "الإشعارات والتقارير",
      toggleTheme: "تبديل المظهر",
      toggleLanguage: "تغيير لغة التطبيق",
    },
    footer: {
      copyright: "Tashihy (تصحيحي) © 2026 — نظام تصحيح أوراق الامتحانات بخط اليد بالذكاء الاصطناعي",
      features: "تخزين آمن بدون حدود (IndexedDB) • خط الرقعة والنسخ والفرنسية • متوافق مع النشر المباشر",
    },
    grading: {
      heroTitle: "تصحيح أوراق الامتحانات بالذكاء الاصطناعي",
      heroDesc: "التعرف البصري الدقيق على الخط اليدوي للغة العربية، الفرنسية والإنجليزية مع سلّم التنقيط",
      heroAction: "تصحيح ورقة الآن",
      mainTitle: "تصحيح أوراق الامتحانات بالذكاء الاصطناعي",
      mainSubtitle: "التعرف البصري الدقيق على الخط اليدوي للغة العربية، الفرنسية والإنجليزية مع سلّم التنقيط",
      targetClass: "القسم المستهدف",
      selectClassPrompt: "اختر القسم أولاً...",
      targetStudent: "التلميذ المعني",
      selectStudentPrompt: "اختر التلميذ المراد تقييمه...",
      allStudentsGraded: "تم تصحيح أوراق جميع التلاميذ في هذا القسم!",
      noClassesWarning: "لا توجد أقسام مسجلة حتى الآن. يجب إنشاء قسم أولاً.",
      goToClasses: "الانتقال للأقسام لإنشاء قسم",
      answerKeyTitle: "نموذج الإجابة الرسمي وسلّم التنقيط",
      manageRubrics: "إدارة النماذج والدروس",
      selectRubricPrompt: "اختيار من النماذج وسلالم التنقيط المحفوظة",
      orUploadNew: "أو رفع نموذج إجابة جديد من الجهاز أو بالكاميرا",
      uploadKeyTitle: "ارفع صورة نموذج الإجابة أو سلّم التنقيط",
      uploadKeyDesc: "يدعم صور JPG / PNG الواضحة ونماذج الاختبارات",
      chooseFromDevice: "اختيار من الجهاز",
      openCamera: "فتح الكاميرا",
      registeredSubject: "المادة المسجلة",
      studentSheetTitle: "ورقة إجابة التلميذ (بخط اليد)",
      uploadStudentTitle: "ارفع صفحات إجابة التلميذ",
      uploadStudentDesc: "التقط صوراً لورقة التلميذ أو ارفع ملفات مصورة",
      ocrTolerance: "يتعرف الذكاء الاصطناعي بدقة على خط اليد باللغة العربية والفرنسية والأرقام والرسومات",
      startGrading: "بدء التصحيح الذكي",
      gradingInProgress: "جاري قراءة خط اليد والتصحيح بالذكاء الاصطناعي...",
      clearAndGradeNew: "مسح وتصحيح ورقة جديدة",
      finalResult: "نتيجة التقييم النهائي",
      from: "من",
      excellent: "ممتاز",
      average: "متوسط",
      belowAverage: "دون المتوسط",
      detectedName: "الاسم المكتشف على الورقة",
      savedToRoster: "تم الحفظ والتثبيت لكشف",
      saveToRoster: "حفظ وتثبيت الدرجة في الكشف",
      nextStudentAction: "الانتقال للتلميذ التالي",
      questionBreakdown: "تحليل الأسئلة والبنود",
      manualEditHint: "يمكنك تعديل أي درجة يدوياً",
      finishManualEdit: "إنهاء التعديل",
      editPointsManual: "تعديل النقاط يدوياً",
      modelAnswer: "الإجابة النموذجية",
      studentAnswer: "إجابة التلميذ المستخرجة",
      pedagogicalReasoning: "التعليل والتقييم التربوي",
      step1Title: "الخطوة 1: نموذج الإجابة وسلّم التنقيط",
      step1Subtitle: "حدد نموذج التصحيح مع النقاط لكل سؤال",
      chooseSavedRubric: "اختر من النماذج المحفوظة",
      noSavedRubrics: "لا توجد نماذج محفوظة",
      customKeyUpload: "أو رفع نموذج إجابة جديد",
      dropKeyPrompt: "اسحب صورة نموذج الإجابة هنا أو انقر للاختيار",
      step2Title: "الخطوة 2: ورقة إجابة التلميذ بخط اليد",
      step2Subtitle: "التقط أو ارفع صورة ورقة التلميذ لمطابقتها",
      dropStudentPrompt: "اسحب ورقة إجابة التلميذ هنا أو انقر للاختيار",
      cameraCapture: "تصوير بالكاميرا",
      cameraKey: "تصوير نموذج الإجابة",
      cameraStudent: "تصوير ورقة التلميذ",
      analyzing: "جاري تحليل ورقة التلميذ...",
      analyzingDetail: "قراءة خط اليد بدقة ومطابقته مع سلّم التنقيط النموذجي",
      resultTitle: "نتيجة تقييم الورقة",
      scoreOutOf: "العلامة من",
      percentage: "النسبة المئوية",
      strengths: "نقاط القوة والإتقان",
      weaknesses: "الأخطاء ومواطن التعثر",
      pedagogicalNote: "ملاحظات وتوجيهات الأستاذ",
      question: "السؤال",
      earned: "الدرجة المستحقة",
      max: "الدرجة القصوى",
      notes: "الملاحظات",
      manualEdit: "تعديل الدرجات يدوياً",
      saveEdit: "حفظ التعديلات",
      saveToStudent: "تثبيت الدرجة للتلميذ",
      savedSuccess: "تم حفظ النتيجة في كشف القسم بنجاح!",
      clearAndNew: "تصحيح ورقة تلميذ آخر",
      studentNameDetected: "الاسم المستخرج من الورقة",
      confidence: "مستوى الثقة في القراءة",
      classroom: "القسم",
      student: "التلميذ",
      addClass: "إضافة قسم",
      addStudent: "إضافة تلميذ",
      selectClassPlaceholder: "اختيار القسم",
      selectStudentPlaceholder: "اختيار التلميذ",
      quickImport: "استيراد سريع",
      nextStudent: "التلميذ التالي",
      step1: "تجهيز وفحص الصور...",
      step2: "إرسال الأوراق لنموذج الذكاء الاصطناعي...",
      step3: "قراءة خط اليد ومطابقة سلم التنقيط...",
      step4: "استخراج وتدقيق النتائج النهائية...",
    },
    classes: {
      title: "إدارة الأقسام وقوائم التلاميذ",
      subtitle: "إضافة الأقسام، تسجيل التلاميذ، متابعة كشوف النقاط، وحساب المعدلات",
      mainTitle: "إدارة الأقسام وقوائم التلاميذ",
      mainSubtitle: "إضافة الأقسام، تسجيل التلاميذ، متابعة كشوف النقاط، وحساب المعدلات",
      addClass: "إضافة قسم جديد",
      addClassBtn: "إضافة قسم جديد",
      noClassesTitle: "لا توجد أقسام مسجلة حتى الآن",
      noClassesDesc: "أنشئ قسمك الأول لبدء إضافة التلاميذ وتصحيح الامتحانات.",
      createFirstClass: "إنشاء القسم الأول",
      scanRosterCamera: "تصوير القائمة بالكاميرا",
      uploadRosterPhoto: "رفع صورة القائمة",
      importExcel: "استيراد من Excel",
      importExcelBtn: "استيراد من Excel",
      pasteNames: "لصق أسماء",
      deleteClass: "حذف القسم",
      deleteClassConfirm: "هل أنت متأكد من رغبتك في حذف هذا القسم وجميع تلاميذه؟",
      deleteStudentConfirm: "هل أنت متأكد من حذف هذا التلميذ؟",
      studentNamePlaceholder: "اسم ولقب التلميذ الجديد...",
      addStudentBtn: "إضافة التلميذ",
      addStudent: "إضافة التلميذ",
      studentNameCol: "اسم ولقب التلميذ",
      statusCol: "حالة التصحيح",
      scoreCol: "العلامة / المعدل",
      actionsCol: "الإجراءات",
      noStudentsInClass: "لا يوجد تلاميذ في هذا القسم حتى الآن",
      gradedStatus: "تم التصحيح",
      pendingStatus: "في الانتظار",
      gradeAction: "تصحيح ورقة",
      regradeAction: "إعادة التصحيح",
      modalCreateClassTitle: "إنشاء قسم دراسي جديد",
      classNameField: "اسم القسم",
      classNamePlaceholder: "مثال: 4 متوسط 2 / 2 ثانوي",
      classSubjectField: "المادة التعليمية",
      classSubjectPlaceholder: "مثال: الرياضيات، اللغة العربية، العلوم",
      createClassSubmit: "إنشاء القسم",
      modalBulkTitle: "إضافة جماعية لأسماء التلاميذ",
      modalBulkDesc: "الصق قائمة الأسماء هنا (اسم ولقب في كل سطر)، وسيتم تنظيفها وتنظيمها تلقائياً.",
      bulkSubmit: "إضافة التلاميذ الآن",
      classesList: "قائمة الأقسام",
      students: "التلاميذ",
      studentNameInput: "اسم التلميذ الكامل",
      bulkAdd: "إضافة جماعية",
      bulkAddPlaceholder: "الصق قائمة الأسماء هنا (اسم في كل سطر)...",
      tableNum: "الرقم",
      tableName: "اسم التلميذ",
      tableGrades: "النتائج",
      tableAverage: "المعدل",
      tableActions: "الإجراءات",
      gradeBtn: "تصحيح ورقة",
      noStudents: "لا يوجد تلاميذ",
      noStudentsDesc: "أضف أسماء التلاميذ يدوياً أو استورد القائمة من ملف Excel أو بصورة بالكاميرا.",
      modalAddClassTitle: "إضافة قسم جديد",
      classNameLabel: "اسم القسم (مثال: 4 متوسط 1)",
      classSubjectLabel: "المادة (مثال: علوم الطبيعة والحياة)",
      academicYearLabel: "السنة الدراسية",
      saveClassBtn: "حفظ القسم",
    },
    rubrics: {
      mainTitle: "نماذج التصحيح، الدروس والمفكرة البيداغوجية",
      mainSubtitle: "إدارة سلالم التنقيط ونماذج الإجابة، مستودع الدروس بصيغة PDF وصور، وملاحظات الأستاذ",
      tabRubrics: "نماذج التصحيح وسلالم التنقيط",
      tabLessons: "دروسي ومذكراتي",
      tabNotes: "دفتر نصوص وملاحظات الأستاذ",
      createRubric: "نموذج تصحيح جديد",
      newRubricBtn: "نموذج تصحيح جديد",
      newNoteBtn: "ملاحظة بيداغوجية جديدة",
      newLessonBtn: "رفع درس أو مذكرة (PDF)",
      noRubrics: "لا توجد نماذج إجابة محفوظة بعد",
      noRubricsDesc: "أنشئ نموذج تصحيح مع سلّم التنقيط لاستخدامه فوراً في تصحيح أوراق التلاميذ.",
      maxScore: "العلامة الكاملة",
      viewDetails: "عرض التفاصيل",
      useForGrading: "استخدام في التصحيح",
      useInGrading: "استخدام في التصحيح",
      criteriaCount: "عدد عناصر التقييم",
      newRubricModalTitle: "إضافة نموذج تصحيح جديد",
      rubricTitlePlaceholder: "عنوان الاختبار أو الفرض...",
      rubricSubjectPlaceholder: "المادة التعليمية...",
      totalScoreLabel: "مجموع نقاط الامتحان",
      gradingCriteria: "عناصر وسلّم التنقيط",
      addCriterion: "إضافة معيار / سؤال",
      criterionTitlePlaceholder: "السؤال / العنصر...",
      pointsPlaceholder: "النقاط",
      criterionDescPlaceholder: "شروط الحصول على العلامة والإجابة النموذجية...",
      saveRubricBtn: "حفظ نموذج التصحيح",
      searchLessons: "ابحث عن درس أو مذكرة...",
      allClasses: "جميع الأقسام",
      uploadLessonBtn: "رفع درس أو مذكرة",
      noLessons: "لا توجد دروس أو مذكرات محفوظة",
      noLessonsDesc: "يمكنك رفع وتخزين دروسك ومذكراتك بصيغة PDF أو صور ملتقطة لمراجعتها في أي وقت.",
      previewDoc: "معاينة",
      downloadDoc: "تحميل",
      lessonTitlePlaceholder: "عنوان الدرس أو المذكرة...",
      lessonSubjectSelect: "المادة",
      lessonTermSelect: "الفصل الدراسي / الوحدة",
      lessonClassSelect: "القسم المعني (اختياري)",
      chooseFilePdfImg: "ملف الدرس (PDF أو صور)",
      saveLessonBtn: "حفظ في مكتبة الدروس",
      noNotes: "لا توجد ملاحظات مسجلة حتى الآن",
      noNotesDesc: "سجل ملاحظاتك ومذكراتك البيداغوجية لكل قسم.",
      deleteRubricConfirm: "هل أنت متأكد من حذف هذا النموذج؟",
      deleteNoteConfirm: "هل أنت متأكد من حذف هذه الملاحظة؟",
      addRubricTitle: "إضافة نموذج تصحيح رسمي جديد",
      rubricTitleInput: "عنوان الاختبار أو الفرض",
      rubricSubjectInput: "المادة التعليمية",
      rubricClassSelect: "القسم المعني (اختياري)",
      rubricImagesUpload: "صور نموذج الإجابة وسلّم التنقيط",
      rubricTextGuidelines: "تعليمات وتوجيهات التصحيح النصية (اختياري)",
      addNoteTitle: "إضافة ملاحظة إلى مفكرة الأستاذ",
      noteTitleInput: "عنوان الملاحظة",
      noteContentInput: "نص الملاحظة أو التذكير البيداغوجي...",
      saveNoteBtn: "حفظ الملاحظة",
    },
    lessons: {
      mainTitle: "مكتبة الدروس والوثائق البيداغوجية",
      mainSubtitle: "رفع وتنزيل ومراجعة مذكرات الدروس والملخصات بصيغة PDF أو صور ملتقطة",
      uploadLessonBtn: "رفع درس أو مذكرة (PDF)",
      allFilter: "الكل",
      pdfFilter: "ملفات PDF فقط",
      imageFilter: "صور فقط",
      searchPlaceholder: "ابحث عن درس أو مذكرة...",
      noLessons: "لا توجد دروس أو وثائق محفوظة حتى الآن",
      noLessonsDesc: "ارفع وخزن دروسك ومذكراتك بصيغة PDF أو صور للاطلاع عليها وتنزيلها في أي وقت.",
      addLessonTitle: "إضافة درس أو وثيقة بيداغوجية جديدة",
      lessonTitleInput: "عنوان الدرس أو المذكرة",
      lessonSubjectInput: "المادة التعليمية",
      lessonClassSelect: "القسم المعني (اختياري)",
      lessonTermSelect: "الفصل الدراسي",
      lessonFileType: "نوع الملف",
      uploadPdfOrImage: "رفع ملف الدرس (PDF أو صور عالية الدقة)",
      uploadPdfPrompt: "انقر لاختيار ملف PDF من جهازك",
      uploadImagePrompt: "انقر لاختيار صورة من جهازك",
      captureWithCamera: "التقاط صورة للدرس بالكاميرا",
      saveLessonBtn: "حفظ في مكتبة الدروس",
      downloadBtn: "تحميل",
      previewBtn: "معاينة",
      deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا الدرس؟",
      pdfFile: "وثيقة PDF",
      imageFile: "صورة",
      semester1: "الفصل الأول",
      semester2: "الفصل الثاني",
      semester3: "الفصل الثالث",
    },
    reports: {
      mainTitle: "التقارير الإحصائية وكشوف النقاط",
      mainSubtitle: "تحليل مستوى القسم، نسب النجاح وتصدير كشف النقاط الرسمي إلى Excel",
      selectClass: "اختر القسم",
      exportExcel: "تصدير كشف النقاط (Excel)",
      classStats: "إحصائيات القسم",
      totalCount: "إجمالي التلاميذ",
      testedCount: "الأوراق المصححة",
      classAvg: "معدل القسم العام",
      passRate: "نسبة النجاح",
      maxGrade: "أعلى علامة",
      minGrade: "أدنى علامة",
      distributionTitle: "توزيع العلامات والمستويات",
      levelExcellent: "ممتاز (≥16)",
      levelGood: "جيد (14-16)",
      levelMedium: "متوسط (10-14)",
      levelNeedsSupport: "دون المعدل (<10)",
      gradebookTable: "كشف نقاط القسم",
      colRank: "الرقم",
      colStudent: "اسم ولقب التلميذ",
      colGradesCount: "الدرجة / المجموع",
      colAverage: "المعدل / 20",
      colAppreciation: "التقدير البيداغوجي",
      exportSuccess: "تم تصدير كشف النقاط بنجاح!",
    },
    settings: {
      title: "إعدادات التطبيق وهوية الأستاذ",
      subtitle: "تخصيص الهوية البيداغوجية، اللغة، المظهر، وإدارة النسخ الاحتياطية",
      profileSection: "الملف التعريفي للأستاذ",
      roleLabel: "الصفة / اللقب الأكاديمي",
      teacherMale: "الأستاذ الفاضل",
      teacherFemale: "الأستاذة الفاضلة",
      namePlaceholder: "الاسم واللقب الكامل...",
      subjectLabel: "المادة التعليمية الأساسية",
      subjectPlaceholder: "مثال: علوم الطبيعة والحياة، الرياضيات، اللغة العربية...",
      schoolLabel: "المؤسسة التعليمية / الثانوية / المتوسطة",
      schoolPlaceholder: "مثال: ثانوية الأمير عبد القادر...",
      saveProfileBtn: "حفظ الملف التعريفي",
      savedNotification: "تم حفظ الإعدادات بنجاح",
      languageSection: "لغة التطبيق (اللغة / Langue)",
      languageSubtitle: "اختر لغة الواجهة المفضلة لك وللتلاميذ",
      themeSection: "المظهر والوضع الليلي",
      themeSubtitle: "تفعيل الوضع المظلم لراحة العينين أثناء جلسات التصحيح الليلية",
      lightModeTitle: "الوضع النهاري (الفاتح)",
      lightModeDesc: "مظهر ناصع ومريح للعمل في ضوء النهار",
      darkModeTitle: "الوضع الليلي (الداكن)",
      darkModeDesc: "خلفية داكنة تحمي عينيك من الإجهاد في المساء",
      darkModeOn: "الوضع الليلي مفعّل",
      darkModeOff: "الوضع النهاري مفعّل",
      backupSection: "النسخ الاحتياطي وإدارة البيانات",
      backupSubtitle: "تصدير نسخة احتياطية شاملة لكافة الأقسام، التلاميذ، النماذج والدروس",
      exportBackupBtn: "تصدير نسخة احتياطية (JSON)",
      importBackupBtn: "استرجاع نسخة احتياطية",
      diagnosticsSection: "فحص الاتصال وخادم الذكاء الاصطناعي",
      diagnosticsSubtitle: "حالة جاهزية نموذج Gemini Vision للتعرف على خط اليد",
      statusHealthy: "الخادم والذكاء الاصطناعي في حالة تشغيل ممتازة",
      statusIssue: "يرجى التحقق من اتصال الخادم أو مفتاح API",
      handwritingGuideTitle: "إرشادات الحصول على أفضل دقة في قراءة خط اليد",
      guideTip1Title: "الإضاءة وزاوية التصوير",
      guideTip1Desc: "التقط الصورة مباشرة من الأعلى بزاوية 90° مع تجنب الظلال الكثيفة فوق الورقة.",
      guideTip2Title: "وضوح ترقيم الأسئلة",
      guideTip2Desc: "ترقيم الأسئلة بوضوح يساعد النموذج على مطابقة كل إجابة مع معيارها في سلّم التنقيط.",
      guideTip3Title: "دعم العربية والفرنسية والرموز",
      guideTip3Desc: "النموذج مدرب على قراءة خط الرقعة والنسخ والفرنسية والإنجليزية والمعادلات الرياضية.",
    },
  },

  fr: {
    dir: "ltr",
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      deleteAll: "Tout supprimer",
      close: "Fermer",
      back: "Retour",
      confirm: "Confirmer",
      edit: "Modifier",
      add: "Ajouter",
      all: "Tout",
      filter: "Filtrer",
      search: "Rechercher",
      loading: "Chargement en cours...",
      success: "Opération réussie",
      error: "Une erreur est survenue",
      actions: "Actions",
      download: "Télécharger",
      upload: "Téléverser",
      preview: "Aperçu",
      total: "Total",
      none: "Aucun",
      yes: "Oui",
      no: "Non",
      view: "Afficher",
      retry: "Réessayer",
    },
    tabs: {
      grading: "Correction",
      classes: "Classes",
      reports: "Rapports",
      rubrics: "Barèmes & Fiches",
      settings: "Paramètres",
    },
    nav: {
      grading: "Correction",
      classes: "Classes",
      reports: "Rapports",
      rubrics: "Barèmes & Fiches",
      settings: "Paramètres",
    },
    header: {
      welcomeMale: "Bienvenue, Cher Professeur",
      welcomeFemale: "Bienvenue, Chère Professeure",
      subject: "Discipline Principale",
      school: "Établissement Scolaire",
      aiConnected: "IA Connectée",
      preparingModel: "Initialisation IA",
      notifications: "Rapports & Alertes",
      toggleTheme: "Changer de thème",
      toggleLanguage: "Changer de langue",
    },
    footer: {
      copyright: "Tashihy (تصحيحي) © 2026 — Système de correction manuscrite par Intelligence Artificielle",
      features: "Stockage sécurisé sans limite (IndexedDB) • Arabe, Français & Symboles • Prêt pour le déploiement",
    },
    grading: {
      heroTitle: "Correction d'Examens par Intelligence Artificielle",
      heroDesc: "Reconnaissance manuscrite avancée en Arabe, Français et Anglais avec application directe du barème",
      heroAction: "Corriger une copie maintenant",
      mainTitle: "Correction d'Examens par Intelligence Artificielle",
      mainSubtitle: "Reconnaissance manuscrite avancée en Arabe, Français et Anglais avec application directe du barème",
      targetClass: "Classe Cible",
      selectClassPrompt: "Sélectionnez une classe...",
      targetStudent: "Élève à Évaluer",
      selectStudentPrompt: "Sélectionnez l'élève...",
      allStudentsGraded: "Toutes les copies des élèves de cette classe ont été corrigées !",
      noClassesWarning: "Aucune classe enregistrée pour le moment. Veuillez créer une classe d'abord.",
      goToClasses: "Aller aux Classes pour créer",
      answerKeyTitle: "Corrigé Type Officiel & Barème de Notation",
      manageRubrics: "Gérer les barèmes et cours",
      selectRubricPrompt: "Choisir parmi les barèmes enregistrés",
      orUploadNew: "Ou importer un nouveau corrigé / prendre une photo",
      uploadKeyTitle: "Importer le corrigé type ou le barème",
      uploadKeyDesc: "Prend en charge les formats JPG / PNG nets et sujets officiels",
      chooseFromDevice: "Parcourir l'appareil",
      openCamera: "Ouvrir la caméra",
      registeredSubject: "Discipline enregistrée",
      studentSheetTitle: "Copie de l'Élève (Écriture Manuscrite)",
      uploadStudentTitle: "Importer les pages de la copie élève",
      uploadStudentDesc: "Prenez en photo la feuille de l'élève ou importez des fichiers image",
      ocrTolerance: "L'IA reconnaît fidèlement l'écriture manuscrite en arabe, français, anglais, chiffres et schémas",
      startGrading: "Lancer la Correction Intelligente",
      gradingInProgress: "Analyse manuscrite et correction par l'IA en cours...",
      clearAndGradeNew: "Effacer et corriger une autre copie",
      finalResult: "Résultat de l'Évaluation Finale",
      from: "sur",
      excellent: "Excellent",
      average: "Moyen",
      belowAverage: "Insuffisant",
      detectedName: "Nom détecté sur la copie",
      savedToRoster: "Enregistré pour le carnet de",
      saveToRoster: "Enregistrer la note dans le carnet",
      nextStudentAction: "Passer à l'élève suivant",
      questionBreakdown: "Détail et Analyse par Question",
      manualEditHint: "Vous pouvez ajuster n'importe quelle note manuellement",
      finishManualEdit: "Terminer l'ajustement",
      editPointsManual: "Modifier les points",
      modelAnswer: "Réponse type officielle",
      studentAnswer: "Réponse extraite de l'élève",
      pedagogicalReasoning: "Raisonnement et appréciation pédagogique",
      step1Title: "Étape 1 : Corrigé type et barème de notation",
      step1Subtitle: "Définissez le barème officiel avec les points par critère",
      chooseSavedRubric: "Choisir parmi les modèles enregistrés",
      noSavedRubrics: "Aucun modèle enregistré",
      customKeyUpload: "Ou téléverser un nouveau barème",
      dropKeyPrompt: "Glissez l'image du corrigé ici ou cliquez pour choisir",
      step2Title: "Étape 2 : Copie manuscrite de l'élève",
      step2Subtitle: "Capturez ou téléversez la photo de la copie",
      dropStudentPrompt: "Glissez la copie de l'élève ici ou cliquez pour choisir",
      cameraCapture: "Prendre une photo",
      cameraKey: "Photographier le corrigé",
      cameraStudent: "Photographier la copie élève",
      analyzing: "Analyse de la copie de l'élève en cours...",
      analyzingDetail: "Lecture manuscrite de haute précision et comparaison avec le barème",
      resultTitle: "Résultat de l'évaluation",
      scoreOutOf: "Note sur",
      percentage: "Pourcentage",
      strengths: "Points forts et acquis",
      weaknesses: "Erreurs et lacunes constatées",
      pedagogicalNote: "Observations et conseils du professeur",
      question: "Question",
      earned: "Points obtenus",
      max: "Barème max",
      notes: "Remarques",
      manualEdit: "Ajuster les notes manuellement",
      saveEdit: "Valider les modifications",
      saveToStudent: "Enregistrer la note pour l'élève",
      savedSuccess: "Note enregistrée dans le carnet de la classe !",
      clearAndNew: "Corriger la copie d'un autre élève",
      studentNameDetected: "Nom extrait de la copie",
      confidence: "Indice de confiance de lecture",
      classroom: "Classe",
      student: "Élève",
      addClass: "Ajouter une classe",
      addStudent: "Ajouter un élève",
      selectClassPlaceholder: "Choisir une classe",
      selectStudentPlaceholder: "Choisir un élève",
      quickImport: "Import rapide",
      nextStudent: "Élève suivant",
      step1: "Préparation et analyse des images...",
      step2: "Envoi des copies au modèle d'IA...",
      step3: "Lecture manuscrite et alignement du barème...",
      step4: "Extraction et vérification des résultats...",
    },
    classes: {
      title: "Gestion des Classes & Listes d'Élèves",
      subtitle: "Création des classes, gestion des élèves, suivi des notes et calcul des moyennes",
      mainTitle: "Gestion des Classes & Listes d'Élèves",
      mainSubtitle: "Création des classes, gestion des élèves, suivi des notes et calcul des moyennes",
      addClass: "Ajouter une classe",
      addClassBtn: "Ajouter une classe",
      noClassesTitle: "Aucune classe enregistrée pour le moment",
      noClassesDesc: "Créez votre première classe pour commencer à ajouter des élèves et corriger des copies.",
      createFirstClass: "Créer la première classe",
      scanRosterCamera: "Scanner la liste par caméra",
      uploadRosterPhoto: "Importer photo de la liste",
      importExcel: "Importer depuis Excel",
      importExcelBtn: "Importer depuis Excel",
      pasteNames: "Coller des noms",
      deleteClass: "Supprimer la classe",
      deleteClassConfirm: "Êtes-vous sûr de vouloir supprimer cette classe et tous ses élèves ?",
      deleteStudentConfirm: "Êtes-vous sûr de vouloir supprimer cet élève ?",
      studentNamePlaceholder: "Nom et prénom du nouvel élève...",
      addStudentBtn: "Ajouter l'élève",
      addStudent: "Ajouter l'élève",
      studentNameCol: "Nom & Prénom de l'élève",
      statusCol: "Statut de correction",
      scoreCol: "Note / Barème",
      actionsCol: "Actions",
      noStudentsInClass: "Aucun élève dans cette classe pour le moment",
      gradedStatus: "Corrigé",
      pendingStatus: "En attente",
      gradeAction: "Corriger la copie",
      regradeAction: "Re-corriger",
      modalCreateClassTitle: "Créer une nouvelle classe",
      classNameField: "Nom de la classe",
      classNamePlaceholder: "Ex: 4ème Année Moyenne 2 / 2ème Secondaire",
      classSubjectField: "Matière d'enseignement",
      classSubjectPlaceholder: "Ex: Mathématiques, Sciences, Français, Arabe...",
      createClassSubmit: "Créer la classe",
      modalBulkTitle: "Ajout groupé d'élèves",
      modalBulkDesc: "Collez la liste des noms (un par ligne), le système les nettoie et formate automatiquement.",
      bulkSubmit: "Ajouter les élèves maintenant",
      classesList: "Liste des classes",
      students: "Élèves",
      studentNameInput: "Nom complet de l'élève",
      bulkAdd: "Ajout groupé",
      bulkAddPlaceholder: "Collez les noms ici (un nom par ligne)...",
      tableNum: "N°",
      tableName: "Nom de l'élève",
      tableGrades: "Notes",
      tableAverage: "Moyenne",
      tableActions: "Actions",
      gradeBtn: "Corriger la copie",
      noStudents: "Aucun élève enregistré",
      noStudentsDesc: "Ajoutez des élèves manuellement, importez un fichier Excel ou prenez en photo la liste.",
      modalAddClassTitle: "Ajouter une classe",
      classNameLabel: "Nom de la classe (Ex: 4 Moyenne 1)",
      classSubjectLabel: "Discipline (Ex: Sciences Naturelles)",
      academicYearLabel: "Année scolaire",
      saveClassBtn: "Enregistrer la classe",
    },
    rubrics: {
      mainTitle: "Barèmes de Correction, Cours & Cahier de Textes",
      mainSubtitle: "Gérez vos corrigés types, fiches de cours PDF/photos et notes pédagogiques",
      tabRubrics: "Modèles de Correction & Barèmes",
      tabLessons: "Mes Cours & Fiches",
      tabNotes: "Cahier de Textes & Remarques",
      createRubric: "Nouveau barème",
      newRubricBtn: "Nouveau barème",
      newNoteBtn: "Nouvelle remarque",
      newLessonBtn: "Téléverser cours (PDF)",
      noRubrics: "Aucun barème sauvegardé pour le moment",
      noRubricsDesc: "Créez un corrigé officiel avec barème pour corriger rapidement les copies de vos élèves.",
      maxScore: "Note maximale",
      viewDetails: "Voir détails",
      useForGrading: "Utiliser pour corriger",
      useInGrading: "Utiliser pour corriger",
      criteriaCount: "Critères d'évaluation",
      newRubricModalTitle: "Créer un nouveau barème de notation",
      rubricTitlePlaceholder: "Titre de l'examen ou du devoir...",
      rubricSubjectPlaceholder: "Matière d'enseignement...",
      totalScoreLabel: "Total des points de l'épreuve",
      gradingCriteria: "Critères d'évaluation et barème",
      addCriterion: "Ajouter une question / critère",
      criterionTitlePlaceholder: "Titre de la question...",
      pointsPlaceholder: "Points",
      criterionDescPlaceholder: "Réponse type et conditions d'attribution des points...",
      saveRubricBtn: "Enregistrer le barème",
      searchLessons: "Rechercher un cours ou une fiche...",
      allClasses: "Toutes les classes",
      uploadLessonBtn: "Importer un cours ou fiche",
      noLessons: "Aucun cours ou fiche enregistré",
      noLessonsDesc: "Téléversez et organisez vos cours et fiches de révision au format PDF ou photos.",
      previewDoc: "Aperçu",
      downloadDoc: "Télécharger",
      lessonTitlePlaceholder: "Titre du cours ou du document...",
      lessonSubjectSelect: "Discipline",
      lessonTermSelect: "Trimestre / Période",
      lessonClassSelect: "Classe cible (facultatif)",
      chooseFilePdfImg: "Fichier du cours (PDF ou images)",
      saveLessonBtn: "Enregistrer dans la bibliothèque",
      noNotes: "Aucune remarque enregistrée pour le moment",
      noNotesDesc: "Consignez vos observations pédagogiques et rappels pour chaque classe.",
      deleteRubricConfirm: "Êtes-vous sûr de vouloir supprimer ce barème ?",
      deleteNoteConfirm: "Êtes-vous sûr de vouloir supprimer cette remarque ?",
      addRubricTitle: "Ajouter un corrigé officiel avec barème",
      rubricTitleInput: "Titre du sujet d'examen",
      rubricSubjectInput: "Discipline",
      rubricClassSelect: "Classe concernée (facultatif)",
      rubricImagesUpload: "Photos du corrigé type et barème",
      rubricTextGuidelines: "Consignes de notation textuelles (facultatif)",
      addNoteTitle: "Ajouter une note au cahier de textes",
      noteTitleInput: "Titre de la note",
      noteContentInput: "Contenu de la note ou observation pédagogique...",
      saveNoteBtn: "Enregistrer la note",
    },
    lessons: {
      mainTitle: "Bibliothèque de Cours & Ressources Pédagogiques",
      mainSubtitle: "Consultez, téléchargez et organisez vos fiches de cours et résumés en PDF ou photos",
      uploadLessonBtn: "Téléverser cours / PDF",
      allFilter: "Tous les documents",
      pdfFilter: "Fichiers PDF uniquement",
      imageFilter: "Photos uniquement",
      searchPlaceholder: "Rechercher un cours...",
      noLessons: "Aucune ressource enregistrée",
      noLessonsDesc: "Stockez vos fiches pédagogiques en PDF ou photos pour les consulter et télécharger à tout moment.",
      addLessonTitle: "Ajouter un nouveau cours ou document",
      lessonTitleInput: "Titre du document",
      lessonSubjectInput: "Discipline",
      lessonClassSelect: "Classe cible (facultatif)",
      lessonTermSelect: "Trimestre scolaire",
      lessonFileType: "Format du fichier",
      uploadPdfOrImage: "Téléverser le document (PDF ou photos haute définition)",
      uploadPdfPrompt: "Cliquez pour sélectionner un fichier PDF depuis votre appareil",
      uploadImagePrompt: "Cliquez pour sélectionner une photo depuis votre appareil",
      captureWithCamera: "Photographier le document par caméra",
      saveLessonBtn: "Enregistrer dans la bibliothèque",
      downloadBtn: "Télécharger",
      previewBtn: "Aperçu",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce cours ?",
      pdfFile: "Document PDF",
      imageFile: "Image / Photo",
      semester1: "1er Trimestre",
      semester2: "2ème Trimestre",
      semester3: "3ème Trimestre",
    },
    reports: {
      mainTitle: "Rapports Statistiques & Relevés de Notes",
      mainSubtitle: "Analyse globale de la classe, taux de réussite et export officiel vers Excel",
      selectClass: "Sélectionner la classe",
      exportExcel: "Exporter vers Excel (Relevé)",
      classStats: "Bilan Statistique de la Classe",
      totalCount: "Effectif Total",
      testedCount: "Copies Corrigées",
      classAvg: "Moyenne Générale / 20",
      passRate: "Taux de Réussite",
      maxGrade: "Meilleure Note",
      minGrade: "Note Minimale",
      distributionTitle: "Répartition des Niveaux et Mentions",
      levelExcellent: "Très Bien (≥16)",
      levelGood: "Bien (14-16)",
      levelMedium: "Moyen (10-14)",
      levelNeedsSupport: "Insuffisant (<10)",
      gradebookTable: "Relevé de Notes Détaillé",
      colRank: "N°",
      colStudent: "Nom et Prénom de l'Élève",
      colGradesCount: "Note / Total",
      colAverage: "Moyenne / 20",
      colAppreciation: "Appréciation Pédagogique",
      exportSuccess: "Relevé de notes exporté avec succès !",
    },
    settings: {
      title: "Paramètres & Profil de l'Enseignant",
      subtitle: "Identité pédagogique, langue de travail, thème et gestion des sauvegardes",
      profileSection: "Profil de l'Enseignant",
      roleLabel: "Titre / Civilité",
      teacherMale: "Monsieur le Professeur",
      teacherFemale: "Madame la Professeure",
      namePlaceholder: "Nom et prénom complet...",
      subjectLabel: "Discipline d'enseignement principale",
      subjectPlaceholder: "Ex: Sciences de la Vie et de la Terre, Mathématiques, Français...",
      schoolLabel: "Établissement scolaire / Lycée / Collège",
      schoolPlaceholder: "Ex: Lycée Émir Abdelkader...",
      saveProfileBtn: "Enregistrer le profil",
      savedNotification: "Modifications enregistrées avec succès",
      languageSection: "Langue de l'Application (اللغة / Langue)",
      languageSubtitle: "Choisissez la langue d'affichage de l'interface",
      themeSection: "Apparence & Mode Sombre",
      themeSubtitle: "Activez le mode nuit pour préserver vos yeux lors des corrections tardives",
      lightModeTitle: "Mode Jour (Clair)",
      lightModeDesc: "Palette lumineuse pour une utilisation optimale en plein jour",
      darkModeTitle: "Mode Nuit (Sombre)",
      darkModeDesc: "Palette sombre reposante pour corriger confortablement le soir",
      darkModeOn: "Mode sombre activé",
      darkModeOff: "Mode clair activé",
      backupSection: "Sauvegarde & Données Locales",
      backupSubtitle: "Exportez une copie intégrale de vos classes, élèves, barèmes et cours",
      exportBackupBtn: "Exporter la sauvegarde (JSON)",
      importBackupBtn: "Restaurer une sauvegarde",
      diagnosticsSection: "Diagnostic Serveur & Moteur IA",
      diagnosticsSubtitle: "État de fonctionnement du modèle Gemini Vision pour l'écriture manuscrite",
      statusHealthy: "Serveur Express et IA opérationnels",
      statusIssue: "Veuillez vérifier la connexion au serveur ou la clé API",
      handwritingGuideTitle: "Conseils pour une Précision Maximale en Reconnaissance Manuscrite",
      guideTip1Title: "Éclairage homogène et prise de vue à 90°",
      guideTip1Desc: "Tenez la caméra bien à plat au-dessus de la copie en évitant les ombres portées.",
      guideTip2Title: "Numérotation nette des questions",
      guideTip2Desc: "Des numéros clairs permettent à l'IA d'attribuer précisément chaque réponse au bon critère.",
      guideTip3Title: "Compatibilité Arabe, Français et Formules",
      guideTip3Desc: "Le modèle prend en charge les écritures arabes (Rouq'a, Naskh), latines et équations scientifiques.",
    },
  },

  en: {
    dir: "ltr",
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteAll: "Delete all",
      close: "Close",
      back: "Back",
      confirm: "Confirm",
      edit: "Edit",
      add: "Add",
      all: "All",
      filter: "Filter",
      search: "Search",
      loading: "Loading...",
      success: "Operation successful",
      error: "An unexpected error occurred",
      actions: "Actions",
      download: "Download",
      upload: "Upload",
      preview: "Preview",
      total: "Total",
      none: "None",
      yes: "Yes",
      no: "No",
      view: "View",
      retry: "Retry",
    },
    tabs: {
      grading: "Grading",
      classes: "Classes",
      reports: "Reports",
      rubrics: "Rubrics & Notes",
      settings: "Settings",
    },
    nav: {
      grading: "Grading",
      classes: "Classes",
      reports: "Reports",
      rubrics: "Rubrics & Notes",
      settings: "Settings",
    },
    header: {
      welcomeMale: "Welcome, Teacher",
      welcomeFemale: "Welcome, Teacher",
      subject: "Primary Subject",
      school: "School / Institution",
      aiConnected: "AI Online",
      preparingModel: "Initializing AI",
      notifications: "Reports & Alerts",
      toggleTheme: "Toggle theme",
      toggleLanguage: "Switch language",
    },
    footer: {
      copyright: "Tashihy (تصحيحي) © 2026 — AI Handwritten Exam & Quiz Grading System",
      features: "Unlimited offline-first IndexedDB • Arabic, French & Equations OCR • Production ready",
    },
    grading: {
      heroTitle: "AI Handwritten Exam & Quiz Grading",
      heroDesc: "Precision handwriting OCR for Arabic, French, and English sheets aligned with official rubrics",
      heroAction: "Grade an exam paper now",
      mainTitle: "AI Handwritten Exam & Quiz Grading",
      mainSubtitle: "Precision handwriting OCR for Arabic, French, and English sheets aligned with official rubrics",
      targetClass: "Target Class",
      selectClassPrompt: "Select a class...",
      targetStudent: "Student to Evaluate",
      selectStudentPrompt: "Select a student...",
      allStudentsGraded: "All students in this class have been graded!",
      noClassesWarning: "No classes registered yet. Please create a class first.",
      goToClasses: "Go to Classes to create one",
      answerKeyTitle: "Official Answer Key & Grading Rubric",
      manageRubrics: "Manage rubrics & lesson files",
      selectRubricPrompt: "Choose from saved rubrics & answer keys",
      orUploadNew: "Or upload a new answer key / take photo",
      uploadKeyTitle: "Upload answer key or rubric image",
      uploadKeyDesc: "Supports clear JPG / PNG photos and exam sheet scans",
      chooseFromDevice: "Choose from device",
      openCamera: "Open camera",
      registeredSubject: "Subject",
      studentSheetTitle: "Student Handwritten Answer Sheet",
      uploadStudentTitle: "Upload student answer pages",
      uploadStudentDesc: "Take photos of student sheet or upload image files",
      ocrTolerance: "AI accurately reads handwritten Arabic, French, English, numbers, and diagrams",
      startGrading: "Start AI Grading",
      gradingInProgress: "Analyzing handwriting and grading with AI...",
      clearAndGradeNew: "Clear & grade another sheet",
      finalResult: "Final Evaluation Result",
      from: "out of",
      excellent: "Excellent",
      average: "Average",
      belowAverage: "Needs Improvement",
      detectedName: "Name detected on paper",
      savedToRoster: "Saved to gradebook for",
      saveToRoster: "Save grade to student gradebook",
      nextStudentAction: "Proceed to next student",
      questionBreakdown: "Question by Question Breakdown",
      manualEditHint: "You can adjust any score manually",
      finishManualEdit: "Done adjusting",
      editPointsManual: "Edit points manually",
      modelAnswer: "Official Model Answer",
      studentAnswer: "Student's Extracted Answer",
      pedagogicalReasoning: "Pedagogical Reasoning & Feedback",
      step1Title: "Step 1: Answer key and scoring rubric",
      step1Subtitle: "Define the official model answers and points per question",
      chooseSavedRubric: "Choose from saved rubrics",
      noSavedRubrics: "No saved rubrics yet",
      customKeyUpload: "Or upload new answer key",
      dropKeyPrompt: "Drop answer key image here or click to browse",
      step2Title: "Step 2: Student handwritten answer sheet",
      step2Subtitle: "Capture or upload student exam pages",
      dropStudentPrompt: "Drop student sheet here or click to browse",
      cameraCapture: "Take Photo",
      cameraKey: "Take photo of answer key",
      cameraStudent: "Take photo of student sheet",
      analyzing: "Analyzing student exam paper...",
      analyzingDetail: "Reading handwriting and matching answers with the rubric",
      resultTitle: "Paper Evaluation Result",
      scoreOutOf: "Score out of",
      percentage: "Percentage",
      strengths: "Strengths & Correct Answers",
      weaknesses: "Errors & Areas for Improvement",
      pedagogicalNote: "Teacher Observations & Notes",
      question: "Question",
      earned: "Earned Points",
      max: "Max Points",
      notes: "Remarks",
      manualEdit: "Adjust scores manually",
      saveEdit: "Save changes",
      saveToStudent: "Save score to student",
      savedSuccess: "Grade successfully saved to student roster!",
      clearAndNew: "Grade another student's paper",
      studentNameDetected: "Detected student name",
      confidence: "OCR confidence level",
      classroom: "Classroom",
      student: "Student",
      addClass: "Add Class",
      addStudent: "Add Student",
      selectClassPlaceholder: "Select a class",
      selectStudentPlaceholder: "Select a student",
      quickImport: "Quick import",
      nextStudent: "Next student",
      step1: "Preparing and inspecting images...",
      step2: "Sending sheets to AI model...",
      step3: "Reading handwriting & aligning rubric...",
      step4: "Extracting and verifying final results...",
    },
    classes: {
      title: "Classrooms & Student Rosters",
      subtitle: "Manage classes, student rosters, grade tracking, and averages",
      mainTitle: "Classrooms & Student Rosters",
      mainSubtitle: "Manage classes, student rosters, grade tracking, and averages",
      addClass: "Add New Class",
      addClassBtn: "Add New Class",
      noClassesTitle: "No classes registered yet",
      noClassesDesc: "Create your first class to start adding students and grading exam sheets.",
      createFirstClass: "Create First Class",
      scanRosterCamera: "Scan Roster with Camera",
      uploadRosterPhoto: "Upload Roster Photo",
      importExcel: "Import from Excel",
      importExcelBtn: "Import from Excel",
      pasteNames: "Paste Names",
      deleteClass: "Delete Class",
      deleteClassConfirm: "Are you sure you want to delete this class and all its students?",
      deleteStudentConfirm: "Are you sure you want to delete this student?",
      studentNamePlaceholder: "Student full name...",
      addStudentBtn: "Add Student",
      addStudent: "Add Student",
      studentNameCol: "Student Full Name",
      statusCol: "Grading Status",
      scoreCol: "Score / Total",
      actionsCol: "Actions",
      noStudentsInClass: "No students in this class yet",
      gradedStatus: "Graded",
      pendingStatus: "Pending",
      gradeAction: "Grade Paper",
      regradeAction: "Re-grade",
      modalCreateClassTitle: "Create New Classroom",
      classNameField: "Class Name",
      classNamePlaceholder: "e.g., 9th Grade B / 10th Science",
      classSubjectField: "Subject",
      classSubjectPlaceholder: "e.g., Natural Science, Math, Arabic...",
      createClassSubmit: "Create Class",
      modalBulkTitle: "Bulk Add Student Names",
      modalBulkDesc: "Paste the list of student names (one per line). Formatting will be auto-cleaned.",
      bulkSubmit: "Add Students Now",
      classesList: "Classes List",
      students: "Students",
      studentNameInput: "Full student name",
      bulkAdd: "Bulk Add",
      bulkAddPlaceholder: "Paste names here (one name per line)...",
      tableNum: "#",
      tableName: "Student Name",
      tableGrades: "Grades",
      tableAverage: "Average",
      tableActions: "Actions",
      gradeBtn: "Grade Paper",
      noStudents: "No students",
      noStudentsDesc: "Add students manually, import from an Excel sheet, or capture the roster with your camera.",
      modalAddClassTitle: "Add New Class",
      classNameLabel: "Class Name (e.g., 9th Grade B)",
      classSubjectLabel: "Subject (e.g., Natural Sciences)",
      academicYearLabel: "School Year",
      saveClassBtn: "Save Class",
    },
    rubrics: {
      mainTitle: "Correction Rubrics, Lessons & Teacher Notebook",
      mainSubtitle: "Manage grading rubrics, lesson library with PDF/images, and teacher notes",
      tabRubrics: "Grading Rubrics & Keys",
      tabLessons: "My Lessons & Documents",
      tabNotes: "Teacher Notebook",
      createRubric: "New Rubric",
      newRubricBtn: "New Rubric",
      newNoteBtn: "New Note",
      newLessonBtn: "Upload Lesson / PDF",
      noRubrics: "No grading rubrics saved yet",
      noRubricsDesc: "Create answer keys and rubrics to quickly reuse when grading student papers.",
      maxScore: "Max Score",
      viewDetails: "View Details",
      useForGrading: "Use for Grading",
      useInGrading: "Use for Grading",
      criteriaCount: "Criteria count",
      newRubricModalTitle: "Add New Grading Rubric",
      rubricTitlePlaceholder: "Exam or quiz title...",
      rubricSubjectPlaceholder: "Teaching subject...",
      totalScoreLabel: "Total exam points",
      gradingCriteria: "Grading criteria & rubric",
      addCriterion: "Add question / criterion",
      criterionTitlePlaceholder: "Question title...",
      pointsPlaceholder: "Points",
      criterionDescPlaceholder: "Model answer and scoring conditions...",
      saveRubricBtn: "Save Rubric",
      searchLessons: "Search lessons or docs...",
      allClasses: "All classes",
      uploadLessonBtn: "Upload Lesson / Doc",
      noLessons: "No lessons or docs saved yet",
      noLessonsDesc: "Upload and store your lessons, sheets, and summaries as PDF or photos to review anytime.",
      previewDoc: "Preview",
      downloadDoc: "Download",
      lessonTitlePlaceholder: "Lesson or document title...",
      lessonSubjectSelect: "Subject",
      lessonTermSelect: "Semester / Term",
      lessonClassSelect: "Target class (optional)",
      chooseFilePdfImg: "Lesson file (PDF or images)",
      saveLessonBtn: "Save to Lesson Library",
      noNotes: "No notes saved yet",
      noNotesDesc: "Jot down remarks and pedagogical reminders for each class.",
      deleteRubricConfirm: "Are you sure you want to delete this rubric?",
      deleteNoteConfirm: "Are you sure you want to delete this note?",
      addRubricTitle: "Add New Grading Rubric",
      rubricTitleInput: "Exam / Quiz Title",
      rubricSubjectInput: "Subject",
      rubricClassSelect: "Target Class (optional)",
      rubricImagesUpload: "Answer key and rubric photos",
      rubricTextGuidelines: "Textual rubric guidelines (optional)",
      addNoteTitle: "Add Note to Teacher Notebook",
      noteTitleInput: "Note Title",
      noteContentInput: "Note text or pedagogical reminder...",
      saveNoteBtn: "Save Note",
    },
    lessons: {
      mainTitle: "Lesson Library & Pedagogical Material",
      mainSubtitle: "Upload, download, and review lesson notes and summaries in PDF or photos",
      uploadLessonBtn: "Upload Lesson / PDF",
      allFilter: "All",
      pdfFilter: "PDF Only",
      imageFilter: "Images Only",
      searchPlaceholder: "Search for a lesson...",
      noLessons: "No lessons or materials saved yet",
      noLessonsDesc: "Upload and store your lessons, sheets, and summaries as PDF or photos to view and download anytime.",
      addLessonTitle: "Add New Lesson or Pedagogical Document",
      lessonTitleInput: "Lesson / Document Title",
      lessonSubjectInput: "Subject",
      lessonClassSelect: "Target Class (optional)",
      lessonTermSelect: "Semester / Term",
      lessonFileType: "Document Type",
      uploadPdfOrImage: "Upload Lesson File (PDF or High-Res Images)",
      uploadPdfPrompt: "Click to select a PDF file from your device",
      uploadImagePrompt: "Click to select an image from your device",
      captureWithCamera: "Capture lesson photo with camera",
      saveLessonBtn: "Save to Lesson Library",
      downloadBtn: "Download",
      previewBtn: "Preview",
      deleteConfirm: "Are you sure you want to delete this lesson?",
      pdfFile: "PDF Document",
      imageFile: "Image",
      semester1: "First Semester",
      semester2: "Second Semester",
      semester3: "Third Semester",
    },
    reports: {
      mainTitle: "Statistical Reports & Gradebooks",
      mainSubtitle: "Classroom analytics, pass rates, and official Excel gradebook export",
      selectClass: "Select Class",
      exportExcel: "Export Gradebook (Excel)",
      classStats: "Classroom Statistics",
      totalCount: "Total Students",
      testedCount: "Graded Papers",
      classAvg: "Class Average / 20",
      passRate: "Pass Rate",
      maxGrade: "Highest Score",
      minGrade: "Lowest Score",
      distributionTitle: "Score & Level Distribution",
      levelExcellent: "Excellent (≥16)",
      levelGood: "Good (14-16)",
      levelMedium: "Average (10-14)",
      levelNeedsSupport: "Under Average (<10)",
      gradebookTable: "Student Gradebook Table",
      colRank: "#",
      colStudent: "Student Full Name",
      colGradesCount: "Score / Total",
      colAverage: "Average / 20",
      colAppreciation: "Teacher Evaluation",
      exportSuccess: "Grade report exported successfully!",
    },
    settings: {
      title: "Application & Teacher Settings",
      subtitle: "Customize pedagogical identity, language, theme, and local backups",
      profileSection: "Teacher Profile",
      roleLabel: "Title / Honorific",
      teacherMale: "Mr. / Professor",
      teacherFemale: "Mrs. / Professor",
      namePlaceholder: "Full Name...",
      subjectLabel: "Primary Subject",
      subjectPlaceholder: "e.g., Natural Sciences, Mathematics, Arabic, Physics...",
      schoolLabel: "School / Institution / High School",
      schoolPlaceholder: "e.g., Emir Abdelkader High School...",
      saveProfileBtn: "Save Profile",
      savedNotification: "Settings saved successfully",
      languageSection: "Application Language (اللغة / Langue)",
      languageSubtitle: "Select your preferred user interface language",
      themeSection: "Appearance & Dark Mode",
      themeSubtitle: "Enable dark mode for eye comfort during night grading sessions",
      lightModeTitle: "Light Mode",
      lightModeDesc: "Bright clean background for daylight work",
      darkModeTitle: "Dark Mode",
      darkModeDesc: "Eye-safe dark palette for night grading",
      darkModeOn: "Dark Mode (Enabled)",
      darkModeOff: "Light Mode (Enabled)",
      backupSection: "Data Backup & Management",
      backupSubtitle: "Export a full local backup of your classes, students, rubrics, and lessons",
      exportBackupBtn: "Export Backup (JSON)",
      importBackupBtn: "Restore Backup",
      diagnosticsSection: "Server & AI Diagnostics",
      diagnosticsSubtitle: "Connection state of Gemini Vision handwriting recognition model",
      statusHealthy: "Server and AI are online and ready",
      statusIssue: "Check server connection or API key",
      handwritingGuideTitle: "Tips to Optimize Handwriting Recognition",
      guideTip1Title: "Even Lighting & Flat Angle",
      guideTip1Desc: "Take photos directly from above at 90° avoiding heavy shadows on the paper.",
      guideTip2Title: "Clear Question Numbers",
      guideTip2Desc: "Clear question numbering helps AI map each answer directly to the rubric.",
      guideTip3Title: "Support for Arabic, French, and Equations",
      guideTip3Desc: "Trained on Arabic handwriting (Naskh & Ruq'ah), French, English, and scientific formulas.",
    },
  },
};
