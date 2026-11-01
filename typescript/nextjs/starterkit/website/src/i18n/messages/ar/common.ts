import type { CommonMessages } from '../en/common';

export const common = {
  theme: 'المظهر',
  direction: 'الاتجاه',
  toggleTheme: 'تبديل المظهر',
  toggleDirection: 'تبديل الاتجاه',
  toggleNavigation: 'تبديل قائمة التنقل',
  breadcrumbs: 'مسار التنقل',
  light: 'فاتح',
  dark: 'داكن',
  system: 'النظام',
  search: 'بحث...',
  close: 'إغلاق',
  back: 'رجوع',
  next: 'التالي',
  save: 'حفظ',
  cancel: 'إلغاء',
  language: 'اللغة',
  retry: 'إعادة المحاولة',
  goHome: 'الانتقال إلى الرئيسية',
  status: 'الحالة',
  lastModified: 'آخر تعديل',
  filter: 'تصفية',
  exportReport: 'تصدير التقرير',
  loading: 'جارٍ التحميل...',
  demo: 'عرض توضيحي',
  submit: 'إرسال',
  reset: 'إعادة ضبط',
  refresh: 'تحديث',
  delete: 'حذف',
  edit: 'تعديل',
  exportSuccess: 'تم تصدير التقرير بنجاح (عرض تجريبي)',
  simulatedSuccess: 'اكتملت العملية التجريبية بنجاح',
  simulatedPending: 'جارٍ معالجة الطلب...',
  gallery: {
    title: 'معرض مكوّن الزر (Button)',
    subtitle:
      'التحقق البصري التفاعلي والمواصفات الفنية لزر واجهة المستخدم القياسي.',
    overviewTitle: '١. نظرة عامة',
    overviewDesc:
      'يُشغّل الزر إجراءً محلياً (حفظ، إرسال، إلغاء، فتح نافذة أو تنفيذ أمر). تم بناؤه بدون مكتبات خارجية ويدعم كل السمات والاتجاهات.',
    variantsTitle: '٢. المتغيرات الدلالية',
    variantsDesc:
      'خمسة متغيرات دلالية توضح التدرج الهرمي للإجراءات دون تقييد بألوان ثابتة.',
    sizesTitle: '٣. مقياس الأحجام ذو الخطوات الست',
    sizesDesc:
      'الأحجام الصريحة من xs إلى 2xl توفر ارتفاعات متطابقة عبر جميع التطبيقات.',
    defaultsTitle: '٤. الإعدادات الافتراضية للمنتج',
    defaultsDesc:
      'عند حذف خاصية الحجم، يستخدم الزر الحجم الافتراضي للمنتج (لوحة التحكم = md / ٣٦ بكسل، الموقع = xl / ٤٨ بكسل).',
    statesTitle: '٥. حالات التفاعل',
    statesDesc:
      'استعراض حالات السكون، والتعطيل، والتحميل، ومؤشر التركيز عالي التباين للوحة المفاتيح.',
    iconsTitle: '٦. خانات الأيقونات والأزرار ذات الأيقونة فقط',
    iconsDesc:
      'تنعكس خانات startIcon و endIcon تلقائياً في اللغة العربية. تتطلب الأزرار ذات الأيقونة وحدها تسمية وصول aria-label.',
    loadingTitle: '٧. التحميل وثبات الأبعاد',
    loadingDesc:
      'عرض تفاعلي لنفس الزر قبل وأثناء وبعد التحميل غير المتزامن مع ثبات تام للأبعاد دون أي إزاحة تخطيط.',
    formTitle: '٨. سلوك النماذج والأمان',
    formDesc:
      'القيمة الافتراضية هي type="button" لمنع الإرسال العرضي. الاستخدام الصريح لـ type="submit" يُفعّل معالج النموذج.',
    localizationTitle: '٩. التوطين والنصوص الطويلة',
    localizationDesc:
      'يتكيف الزر مع الإنجليزية والفرنسية والعربية RTL ويستوعب النصوص الطويلة دون اقتطاع.',
    themeTitle: '١٠. توافق المظهر والسمات',
    themeDesc:
      'تتبدل الرموز بسلاسة بين الوضعين الفاتح والداكن مع الحفاظ على الأبعاد والتباين.',
    responsiveTitle: '١١. استجابة أهداف اللمس',
    responsiveDesc:
      'تتوسع الأزرار الصغيرة تلقائياً على الشاشات التي تعمل باللمس إلى هدف تفاعل لا يقل عن ٤٨×٤٨ بكسل.',
    usageTitle: '١٢. أمثلة برمجية للاستخدام',
    usageDesc: 'مقتطفات برمجية دقيقة وقابلة للنسخ للاستخدام في الإنتاج.',
    metaTitle: 'معرض مكوّن الزر | White Label UI Kit',
    metaDescription:
      'عرض توضيحي ومواصفات فنية لمكوّن الزر الأساسي في حزمة واجهة المستخدم.',
    variantPrimary: 'أساسي',
    variantSecondary: 'ثانوي',
    variantSubtle: 'خفيف',
    variantGhost: 'شفاف',
    defaultOmitted: 'الافتراضي للمنتج (حجم غير محدد)',
    secondaryDefault: 'ثانوي افتراضي',
    restingLabel: 'سكون',
    restingState: 'حالة السكون',
    disabledLabel: 'معطّل',
    disabledState: 'حالة التعطيل',
    staticLoadingLabel: 'تحميل ثابت',
    loadingState: 'حالة التحميل',
    leadingIcon: 'أيقونة أولى',
    trailingDirectionalIcon: 'أيقونة اتجاهية ختامية',
    bothIcons: 'كلا الأيقونتين',
    submissions: 'مرات الإرسال',
    lastEvent: 'آخر حدث',
    eventNone: 'لا يوجد',
    eventSubmit: 'تم إرسال النموذج عبر type="submit"',
    eventNonSubmit: 'تم النقر على إجراء غير مُرسل (لم يُرسل النموذج)',
    exportReportLong: 'تصدير التقرير المالي المفصل لشهر أكتوبر',
    proceedNextStep: 'الانتقال إلى الخطوة التالية',
    primaryBrandSurface: 'سطح العلامة التجارية الأساسي',
    subtleAccent: 'تمييز خفيف',
    neutralSurfaceStep: 'مستوى سطح محايد',
    xsAuto: 'XS تلقائي (يتوسع على شاشات اللمس)',
    xsComfortable: 'XS مريح (يفرض ٤٨ بكسل)',
  },
  inputGallery: {
    title: 'معرض مكوّن الإدخال (Input)',
    subtitle:
      'التحقق البصري التفاعلي والمواصفات الفنية لحقل الإدخال النصي القياسي.',
    metaTitle: 'معرض مكوّن الإدخال | White Label UI Kit',
    metaDescription:
      'عرض توضيحي ومواصفات فنية لمكوّن إدخال النصوص الأساسي في حزمة واجهة المستخدم.',
    overviewTitle: '١. نظرة عامة',
    overviewDesc:
      'يلتقط حقل الإدخال البيانات النصية أحادية السطر. تم بناؤه كمكوّن أصلي خالص يدعم كل السمات والاتجاهات والإعدادات الافتراضية.',
    sizesTitle: '٢. مقياس الأحجام ذو الخطوات الست',
    sizesDesc:
      'الأحجام الصريحة من xs إلى 2xl توفر ارتفاعات متطابقة عبر جميع التطبيقات.',
    defaultsTitle: '٣. الإعدادات الافتراضية للمنتج',
    defaultsDesc:
      'عند حذف خاصية الحجم، يستخدم الحقل الإعداد الافتراضي للمنتج (لوحة التحكم = md / ٣٦ بكسل، الموقع = xl / ٤٨ بكسل).',
    typesTitle: '٤. أنواع النصوص الأصلية',
    typesDesc:
      'الأنواع النصية الأصلية للمتصفح تحافظ على تخطيط لوحة المفاتيح والتمويه الأصلي لكلمات المرور.',
    statesTitle: '٥. الحالات التشغيلية',
    statesDesc:
      'استعراض حالات السكون، والتحويم، والتركيز، والتعطيل، والقراءة فقط، والإلزام، والخطأ.',
    helpErrorTitle: '٦. علاقات المساعدة والخطأ',
    helpErrorDesc:
      'تسمية الحقل والنصوص التوضيحية مرتبطة عبر htmlFor و aria-describedby مفصولة بمسافات.',
    modesTitle: '٧. وضع التحكم مقابل غير المتحكم به',
    modesDesc:
      'الوضع المتحكم به يدير الحالة عبر المكوّن الأب، والوضع غير المتحكم به يعتمد على إدارة المتصفح وإعادة الضبط.',
    localizationTitle: '٨. التوطين والنصوص الطويلة',
    localizationDesc:
      'يتكيف الحقل بسلاسة مع الإنجليزية والفرنسية والعربية مع تسميات وتوضيحات مترجمة.',
    directionTitle: '٩. اتجاه النص والبيانات المختلطة',
    directionDesc:
      'يرث الحقل اتجاه المستند تلقائياً، مع دعم الاتجاه الصريح للرموز التقنية والأرقام.',
    themeTitle: '١٠. توافق المظهر والسمات',
    themeDesc:
      'أبعاد وحدود ونسب تباين متطابقة بين الوضعين الفاتح والداكن.',
    responsiveTitle: '١١. استجابة أهداف اللمس',
    responsiveDesc:
      'تطبق الحقول على شاشات اللمس هدف تفاعل لا يقل عن ٤٨×٤٨ بكسل.',
    formDemoTitle: '١٢. عرض توضيحي لنموذج حقيقي',
    formDemoDesc:
      'نموذج تفاعلي يجمع بين حقل الإدخال والزر مع التحقق وإعادة الضبط. عرض محلي؛ لا يوجد حفظ في الخادم.',
    usageTitle: '١٣. أمثلة برمجية للاستخدام',
    usageDesc:
      'مقتطفات برمجية دقيقة وقابلة للنسخ للاستخدام في الإنتاج.',
    defaultOmittedLabel: 'الافتراضي للمنتج (حجم غير محدد)',
    defaultOmittedPlaceholder: 'أدخل النص...',
    usernameLabel: 'اسم المستخدم',
    usernamePlaceholder: 'مثال: alex_doe',
    usernameHelp: 'يجب أن يكون بين ٣ و ٢٠ حرفاً.',
    usernameError: 'اسم المستخدم مطلوب ولا يمكن تركه فارغاً.',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'alex@example.com',
    telLabel: 'رقم الهاتف',
    telPlaceholder: '+1 (555) 019-2834',
    urlLabel: 'رابط الموقع',
    urlPlaceholder: 'https://example.com',
    searchLabel: 'عبارة البحث',
    searchPlaceholder: 'بحث في المستندات...',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••••••',
    restingLabel: 'حالة السكون',
    disabledLabel: 'حالة التعطيل',
    disabledValue: 'قيمة معطلة (غير قابلة للتعديل أو الإرسال)',
    readOnlyLabel: 'حالة القراءة فقط',
    readOnlyValue: 'قيمة للقراءة فقط (قابلة للتحديد والإرسال)',
    requiredLabel: 'حقل إلزامي',
    requiredPlaceholder: 'قيمة مطلوبة...',
    invalidLabel: 'حالة الخطأ (aria-invalid="true")',
    invalidPlaceholder: 'إدخال غير صالح...',
    controlledLabel: 'الحالة المتحكم بها',
    uncontrolledLabel: 'الحالة غير المتحكم بها',
    uncontrolledDefaultValue: 'القيمة الافتراضية الأولية',
    arabicNameLabel: 'الاسم الكامل',
    arabicNamePlaceholder: 'أدخل الاسم بالكامل...',
    mixedCodeLabel: 'رمز التتبع (LTR صريح في واجهة عربية)',
    mixedCodePlaceholder: 'TRK-984210-X',
    formDisclaimer:
      'عرض تجريبي محلي للنموذج؛ لا يتم الحفظ في الخادم.',
    formFullNameLabel: 'الاسم الكامل',
    formFullNamePlaceholder: 'Jane Doe',
    formEmailLabel: 'البريد الإلكتروني',
    formEmailPlaceholder: 'jane.doe@company.com',
    formEmailHelp:
      'سنستخدم هذا العنوان لإرسال إشعارات الحساب.',
    formEmailError: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
    formSubmitButton: 'إنشاء الحساب',
    formResetButton: 'إعادة ضبط النموذج',
    formEventNone: 'لم يتم الإرسال بعد.',
    formEventPending: 'جارٍ معالجة التسجيل (تجريبي)...',
    formEventSuccess:
      'تم إرسال النموذج بنجاح! (عرض تجريبي؛ لا يوجد حفظ في الخادم)',
    formEventReset: 'تمت إعادة ضبط النموذج إلى قيمه الافتراضية.',
    formStatusPrefix: 'حالة النموذج',
  },
  textareaGallery: {
    title: 'معرض مكوّن مساحة النص (Textarea)',
    subtitle:
      'التحقق البصري التفاعلي والمواصفات الفنية لحقل إدخال النصوص متعدد الأسطر.',
    metaTitle: 'معرض مكوّن مساحة النص | White Label UI Kit',
    metaDescription:
      'عرض توضيحي ومواصفات فنية والتحقق من الكثافة لمكوّن مساحة النص (Textarea).',
    overviewTitle: '١. نظرة عامة',
    overviewDesc:
      'يلتقط مكوّن مساحة النص البيانات النصية متعددة الأسطر. تم بناؤه كمكوّن أصلي خالص يدعم كل السمات والاتجاهات والإعدادات الافتراضية.',
    densityTitle: '٢. مقياس الكثافة ذو الخطوات الست',
    densityDesc:
      'خطوات الكثافة الصريحة من xs إلى 2xl توفر طباعة وهوامش متطابقة عبر جميع التطبيقات لنفس عدد الأسطر.',
    defaultsTitle: '٣. الإعدادات الافتراضية للمنتج',
    defaultsDesc:
      'عند حذف خاصية الحجم، يستخدم الحقل الإعداد الافتراضي للمنتج (لوحة التحكم = md، الموقع = xl) مع ٤ أسطر افتراضية.',
    rowsTitle: '٤. أعداد الأسطر الأصلية',
    rowsDesc:
      'الارتفاع الأولي يستمد طبيعياً من خاصية الأسطر (مثال: سطرين، ٤ أسطر، ٦ أسطر) بدلاً من ارتفاع ثابت.',
    statesTitle: '٥. الحالات التشغيلية',
    statesDesc:
      'استعراض حالات السكون، والتحويم، والتركيز، والتعطيل (مع تعطيل مقبض التحجيم)، والقراءة فقط (مع الحفاظ على التحجيم الرأسي).',
    helpErrorTitle: '٦. علاقات المساعدة والخطأ',
    helpErrorDesc:
      'تسمية الحقل والنصوص التوضيحية مرتبطة عبر label htmlFor و aria-describedby مفصولة بمسافات.',
    modesTitle: '٧. وضع التحكم مقابل غير المتحكم به',
    modesDesc:
      'الوضع المتحكم به يدير الحالة عبر المكوّن الأب، والوضع غير المتحكم به يعتمد على إدارة المتصفح وإعادة الضبط.',
    multilineTitle: '٨. التحرير متعدد الأسطر والتفاف النص',
    multilineDesc:
      'الحفاظ على فواصل الأسطر، والالتفاف التلقائي، والتحديد المتعدد، والحافظة دون إرسال تلقائي عند الضغط على Enter.',
    resizeTitle: '٩. التحجيم اليدوي',
    resizeDesc:
      'التحجيم الرأسي مفعّل افتراضياً للسماح بتوسيع المحتوى مع الحفاظ الصارم على حدود عرض الحاوية.',
    localizationTitle: '١٠. التوطين ومسافات الخط العربي',
    localizationDesc:
      'تتكيف المساحات النصية بسلاسة مع الإنجليزية والفرنسية والعربية مع ارتفاع سطر كافٍ لتفادي قص علامات التشكيل.',
    directionTitle: '١١. اتجاه النص والبيانات المختلطة',
    directionDesc:
      'ترث المساحة النصية اتجاه المستند تلقائياً، مع دعم الاتجاه الصريح من اليسار لليمين للأكواد وتتبعات الأخطاء.',
    themeTitle: '١٢. توافق المظهر والسمات',
    themeDesc:
      'أبعاد وحدود ونسب تباين متطابقة بين الوضعين الفاتح والداكن.',
    formDemoTitle: '١٣. عرض توضيحي لنموذج محلي',
    formDemoDesc:
      'نموذج تفاعلي يجمع بين مساحة النص والزر مع التحقق وإعادة الضبط. عرض محلي؛ لا يوجد حفظ في الخادم.',
    usageTitle: '١٤. أمثلة برمجية للاستخدام',
    usageDesc:
      'مقتطفات برمجية دقيقة وقابلة للنسخ للاستخدام في الإنتاج.',
    defaultOmittedLabel: 'الافتراضي للمنتج (حجم غير محدد، ٤ أسطر)',
    defaultOmittedPlaceholder: 'أدخل الوصف أو الملاحظات...',
    descriptionLabel: 'وصف المشروع',
    descriptionPlaceholder: 'صف نطاق عمل المشروع...',
    descriptionHelp: 'أدخل حتى ٥٠٠ حرف تصف مخرجات المشروع.',
    descriptionError: 'وصف المشروع مطلوب ولا يمكن تركه فارغاً.',
    rowsTwoLabel: 'مساحة نصية مدمجة (سطران rows={2})',
    rowsFourLabel: 'مساحة نصية قياسية (٤ أسطر rows={4})',
    rowsSixLabel: 'مساحة نصية موسعة (٦ أسطر rows={6})',
    restingLabel: 'حالة السكون',
    disabledLabel: 'حالة التعطيل (التحجيم معطل)',
    disabledValue:
      'محتوى معطل (غير قابل للتعديل أو الإرسال، مقبض التحجيم مخفي)',
    readOnlyLabel: 'حالة القراءة فقط (التحجيم متاح)',
    readOnlyValue:
      'محتوى للقراءة فقط (قابل للتحديد والإرسال، مع الحفاظ على التحجيم الرأسي لقراءة السجلات الطويلة)',
    requiredLabel: 'حقل إلزامي',
    requiredPlaceholder: 'ملاحظات مطلوبة...',
    invalidLabel: 'حالة الخطأ (aria-invalid="true")',
    invalidPlaceholder: 'ملاحظات غير صالحة...',
    controlledLabel: 'الوضع المتحكم به',
    uncontrolledLabel: 'الوضع غير المتحكم به',
    uncontrolledDefaultValue:
      'محتوى أولي غير متحكم به\nمع سطر جديد.',
    arabicFeedbackLabel: 'ملاحظات تفصيلية (نموذج بالخط العربي)',
    arabicFeedbackPlaceholder:
      'أدخل ملاحظاتك وتفاصيل الطلب هنا مع علامات التشكيل...',
    mixedCodeLabel: 'تكوين JSON (اتجاه LTR صريح)',
    formDisclaimer: 'عرض تجريبي لنموذج محلي؛ لا يوجد حفظ في الخادم.',
    formMessageLabel: 'رسالة الملاحظات',
    formMessagePlaceholder: 'اكتب ملاحظاتك ومقترحاتك هنا...',
    formMessageHelp: 'أدخل ملاحظات مفصلة لفريق تطوير المنتج.',
    formMessageError: 'رسالة الملاحظات مطلوبة ولا يمكن تركها فارغة.',
    formSubmitButton: 'إرسال الملاحظات',
    formResetButton: 'إعادة ضبط النموذج',
    formEventNone: 'لم يتم الإرسال بعد.',
    formEventPending: 'جارٍ إرسال الملاحظات (تجريبي)...',
    formEventSuccess:
      'تم إرسال الملاحظات بنجاح! (عرض محلي؛ لا يوجد حفظ في الخادم)',
    formEventReset: 'تمت إعادة ضبط النموذج إلى قيمه الافتراضية.',
    formStatusPrefix: 'حالة النموذج',
  },
} satisfies CommonMessages;
