import type { SupportedLanguage, AIEngineId } from '../config';

export const LANGUAGE_META: Record<
  SupportedLanguage,
  { code: SupportedLanguage; nativeName: string; shortCode: string; dir: 'rtl' | 'ltr' }
> = {
  ar: { code: 'ar', nativeName: 'العربية', shortCode: 'AR', dir: 'rtl' },
  en: { code: 'en', nativeName: 'English', shortCode: 'EN', dir: 'ltr' },
  pt: { code: 'pt', nativeName: 'Português', shortCode: 'PT', dir: 'ltr' },
  fr: { code: 'fr', nativeName: 'Français', shortCode: 'FR', dir: 'ltr' },
};

export function resolveLanguage(value: string | null | undefined): SupportedLanguage {
  if (value === 'ar' || value === 'en' || value === 'pt' || value === 'fr') {
    return value;
  }
  return 'ar';
}

export function getLanguageDirection(lang: SupportedLanguage): 'rtl' | 'ltr' {
  return LANGUAGE_META[lang].dir;
}

export interface TranslationSchema {
  nav: {
    singleStudio: string;
    bulkCutout: string;
    howItWorks: string;
    faq: string;
    startEditing: string;
  };
  engines: Record<
    AIEngineId,
    {
      name: string;
      badge: string;
      description: string;
    }
  >;
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadSubtitle: string;
    uploadButton: string;
    supportedFormats: string;
    trySampleLabel: string;
    samplePortrait: string;
    sampleSneaker: string;
    sampleWatch: string;
    sampleCat: string;
    privacyGuarantee: string;
  };
  processing: {
    initializingModel: string;
    downloadingWeights: string;
    segmentingImage: string;
    refiningEdges: string;
    cloudConnecting: string;
    cloudFallbackNotice: string;
    engineFallbackNotice: string;
    completedIn: string;
    errorTitle: string;
    retryButton: string;
  };
  studio: {
    compareView: string;
    designView: string;
    beforeLabel: string;
    afterLabel: string;
    newPhoto: string;
    reprocess: string;
    undo: string;
    redo: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    tabs: {
      background: string;
      text: string;
      effects: string;
      brush: string;
      export: string;
    };
    bg: {
      transparent: string;
      solidColors: string;
      gradients: string;
      customImage: string;
      uploadBg: string;
      clearBgImage: string;
      dslrBokehTitle: string;
      dslrBokehDesc: string;
      bokehIntensity: string;
      bgAmazonWhite: string;
      bgStudioGray: string;
      bgWarmIvory: string;
      bgObsidian: string;
      bgEmerald: string;
      bgSlate: string;
      gradAlabaster: string;
      gradEmerald: string;
      gradTravertine: string;
      gradSky: string;
      gradGraphite: string;
      gradAmber: string;
    };
    text: {
      addText: string;
      emptyState: string;
      layerLabel: string;
      contentPlaceholder: string;
      defaultText: string;
      placementLabel: string;
      placeBehind: string;
      placeFront: string;
      fontFamily: string;
      fontSize: string;
      color: string;
      strokeWidth: string;
      strokeColor: string;
      rotation: string;
      opacity: string;
      shadow: string;
      deleteLayer: string;
      dragHint: string;
    };
    effects: {
      stickerTitle: string;
      stickerDesc: string;
      stickerWidth: string;
      stickerColor: string;
      shadowTitle: string;
      shadowEnable: string;
      shadowOffsetX: string;
      shadowOffsetY: string;
      shadowBlur: string;
      shadowOpacity: string;
      shadowColor: string;
      adjustSubjectTitle: string;
      adjustBgTitle: string;
      brightness: string;
      contrast: string;
      saturation: string;
      warmth: string;
      resetAdjustments: string;
    };
    brush: {
      title: string;
      desc: string;
      eraseMode: string;
      restoreMode: string;
      brushSize: string;
      brushSoftness: string;
      resetMask: string;
      hint: string;
    };
    export: {
      aspectTitle: string;
      aspectOriginal: string;
      aspectSquare: string;
      aspectYouTube: string;
      aspectReels: string;
      aspectPassport: string;
      formatTitle: string;
      quality: string;
      estimatedSize: string;
      dimensions: string;
      downloadButton: string;
      downloading: string;
    };
  };
  bulk: {
    title: string;
    subtitle: string;
    dropTitle: string;
    dropSubtitle: string;
    selectFiles: string;
    loadSamples: string;
    startQueue: string;
    pauseQueue: string;
    clearAll: string;
    downloadZip: string;
    packingZip: string;
    globalSettingsTitle: string;
    globalBackground: string;
    globalAspect: string;
    watermarkText: string;
    watermarkPlaceholder: string;
    watermarkOpacity: string;
    statusQueued: string;
    statusProcessing: string;
    statusDone: string;
    statusError: string;
    downloadSingle: string;
    removeItem: string;
    summaryCount: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  ads: {
    sponsoredLabel: string;
    topBannerPlaceholder: string;
    nativeBannerPlaceholder: string;
  };
  landing: {
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    steps: Array<{ num: string; title: string; desc: string }>;
    privacyTitle: string;
    privacySubtitle: string;
    features: Array<{ title: string; desc: string }>;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
    footerRights: string;
    footerPrivacy: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationSchema> = {
  ar: {
    nav: {
      singleStudio: 'الاستوديو الفردي',
      bulkCutout: 'معالجة جماعية',
      howItWorks: 'كيف يعمل',
      faq: 'الأسئلة الشائعة',
      startEditing: 'ارفع صورة الآن',
    },
    engines: {
      rmbg: {
        name: 'الذكاء المحلي السريع (RMBG-1.4)',
        badge: 'موصى به · يعمل محلياً',
        description: 'قص فائق الدقة للشعر والحواف داخل متصفحك مجاناً وبدون رفع صورك لأي خادم.',
      },
      imgly: {
        name: 'عزل الاستوديو (IMG.LY ISNet)',
        badge: 'دقة منتجات',
        description: 'نموذج شبكي محلي متخصص لعزل المنتجات والأشخاص بمرونة عالية.',
      },
      cloud: {
        name: 'سحابة فائقة (not-lain ZeroGPU)',
        badge: 'سحابي مجاني',
        description: 'معالجة سحابية عبر Hugging Face مع تحوّل تلقائي للمحرك المحلي عند الازدحام.',
      },
    },
    hero: {
      kicker: 'معالجة محلية ١٠٠٪ داخل المتصفح · بدون اشتراكات أو خوادم',
      title: 'أزل الخلفيات بدقة احترافية وصمّم صورك في ثوانٍ',
      subtitle:
        'استوديو متكامل لعزل الصور الفردية والدفعات الكبيرة حتى 50 صورة، مع كتابة النصوص خلف العنصر، حدود الستيكر، وعزل البورتريه DSLR مباشرة على جهازك.',
      uploadTitle: 'اسحب وأفلت الصورة هنا أو انقر للاختيار',
      uploadSubtitle: 'يدعم صور 4K عالية الدقة بدون فقدان الجودة',
      uploadButton: 'اختر صورة من جهازك',
      supportedFormats: 'JPG · PNG · WebP · AVIF',
      trySampleLabel: 'أو جرّب فوراً بإحدى صور الاستوديو الجاهزة:',
      samplePortrait: 'بورتريه',
      sampleSneaker: 'حذاء',
      sampleWatch: 'ساعة فاخرة',
      sampleCat: 'قط بفرو',
      privacyGuarantee: 'صورك لا تغادر جهازك عند استخدام المحركات المحلية',
    },
    processing: {
      initializingModel: 'جاري تهيئة محرك الذكاء الاصطناعي لأول مرة فقط - يعمل مجاناً للأبد...',
      downloadingWeights: 'جاري تحميل أوزان النموذج الذكي إلى ذاكرة المتصفح...',
      segmentingImage: 'جاري تحليل العناصر وفصل الخلفية بالشبكة العصبية...',
      refiningEdges: 'جاري تنعيم الحواف واستخراج قناة الشفافية...',
      cloudConnecting: 'جاري الاتصال بمحرك السحابة المجاني (not-lain)...',
      cloudFallbackNotice: 'السحابة مشغولة حالياً؛ تم التحويل تلقائياً للمحرك المحلي السريع لإتمام القص بنجاح.',
      engineFallbackNotice: 'تم التبديل التلقائي للمحرك المحلي الاحتياطي لضمان نجاح القص على متصفحك.',
      completedIn: 'تم العزل بنجاح خلال',
      errorTitle: 'تعذّر إتمام المعالجة',
      retryButton: 'إعادة المحاولة',
    },
    studio: {
      compareView: 'مقارنة قبل / بعد',
      designView: 'استوديو التصميم',
      beforeLabel: 'الأصلية',
      afterLabel: 'بعد العزل',
      newPhoto: 'صورة جديدة',
      reprocess: 'إعادة العزل',
      undo: 'تراجع',
      redo: 'إعادة',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      resetView: 'ملاءمة الشاشة',
      tabs: {
        background: 'الخلفية',
        text: 'النصوص',
        effects: 'التأثيرات',
        brush: 'الفرشاة',
        export: 'التصدير',
      },
      bg: {
        transparent: 'شفافة (PNG)',
        solidColors: 'ألوان استوديو ومتاجر',
        gradients: 'تدرجات فاخرة',
        customImage: 'خلفية مخصصة',
        uploadBg: 'رفع صورة خلفية',
        clearBgImage: 'إزالة الخلفية المخصصة',
        dslrBokehTitle: 'عزل البورتريه (DSLR Bokeh)',
        dslrBokehDesc: 'تمويه الخلفية الأصلية مع إبقاء العنصر حاداً كعدسات التصوير الاحترافية.',
        bokehIntensity: 'قوة التمويه (Bokeh)',
        bgAmazonWhite: 'أبيض أمازون',
        bgStudioGray: 'رمادي استوديو',
        bgWarmIvory: 'عاجي دافئ',
        bgObsidian: 'أسود داكن',
        bgEmerald: 'زمردي',
        bgSlate: 'أردوازي',
        gradAlabaster: 'مرمر نقي',
        gradEmerald: 'زمرد هادئ',
        gradTravertine: 'رملي دافئ',
        gradSky: 'سماء صافية',
        gradGraphite: 'جرافيت ليلي',
        gradAmber: 'شفق عنبري',
      },
      text: {
        addText: 'إضافة نص جديد',
        emptyState: 'أضف نصاً وضعْه خلف العنصر لإنشاء أغلفة يوتيوب وبوسترات احترافية.',
        layerLabel: 'طبقة النص',
        contentPlaceholder: 'اكتب النص هنا...',
        defaultText: 'تصميم احترافي',
        placementLabel: 'ترتيب الطبقة',
        placeBehind: 'خلف العنصر',
        placeFront: 'أمام العنصر',
        fontFamily: 'نوع الخط',
        fontSize: 'حجم الخط',
        color: 'لون النص',
        strokeWidth: 'حدود النص',
        strokeColor: 'لون الحدود',
        rotation: 'الدوران',
        opacity: 'الشفافية',
        shadow: 'ظل النص',
        deleteLayer: 'حذف الطبقة',
        dragHint: 'اسحب النص مباشرة فوق الصورة لتغيير موضعه',
      },
      effects: {
        stickerTitle: 'حدود الستيكر (YouTube Outline)',
        stickerDesc: 'إطار أبيض أو ملون ناعم حول العنصر المعزول.',
        stickerWidth: 'سماكة الحدود',
        stickerColor: 'لون الإطار',
        shadowTitle: 'ظل الاستوديو الواقعي',
        shadowEnable: 'تفعيل الظل',
        shadowOffsetX: 'الإزاحة الأفقية',
        shadowOffsetY: 'الإزاحة العمودية',
        shadowBlur: 'نعومة الظل',
        shadowOpacity: 'شفافية الظل',
        shadowColor: 'لون الظل',
        adjustSubjectTitle: 'تعديل إضاءة العنصر',
        adjustBgTitle: 'تعديل إضاءة الخلفية',
        brightness: 'السطوع',
        contrast: 'التباين',
        saturation: 'التشبع اللوني',
        warmth: 'الدفء اللوني',
        resetAdjustments: 'إعادة ضبط الألوان',
      },
      brush: {
        title: 'فرشاة التعديل السحرية',
        desc: 'ارسم مباشرة على الصورة لمسح أجزاء زائدة أو استعادة تفاصيل من الصورة الأصلية.',
        eraseMode: 'مسح (إخفاء)',
        restoreMode: 'استعادة الأصل',
        brushSize: 'حجم الفرشاة',
        brushSoftness: 'نعومة الحواف',
        resetMask: 'إرجاع القناع التلقائي',
        hint: 'استخدم Ctrl+Z للتراجع و Ctrl+Y للإعادة',
      },
      export: {
        aspectTitle: 'مقاسات المتاجر والمنصات',
        aspectOriginal: 'المقاس الأصلي',
        aspectSquare: 'مربع متجر / أمازون (1:1)',
        aspectYouTube: 'غلاف يوتيوب (16:9)',
        aspectReels: 'ريلز / تيك توك (9:16)',
        aspectPassport: 'صورة شخصية / جواز (3.5×4.5)',
        formatTitle: 'صيغة التصدير والجودة',
        quality: 'جودة الضغط',
        estimatedSize: 'الحجم التقديري',
        dimensions: 'الأبعاد',
        downloadButton: 'تحميل التصميم النهائي',
        downloading: 'جاري تجهيز الملف...',
      },
    },
    bulk: {
      title: 'المعالجة الجماعية للصور (Bulk Cutout)',
      subtitle: 'ارفع عشرات الصور دفعة واحدة، طبّق خلفية ومقاساً موحداً، وحمّلها كلها في ملف ZIP واحد.',
      dropTitle: 'اسحب مجموعة صورك هنا أو انقر للاختيار',
      dropSubtitle: 'معالجة متسلسلة ذكية تحافظ على سرعة جهازك وذاكرته',
      selectFiles: 'اختيار عدة صور',
      loadSamples: 'تحميل 4 صور تجريبية',
      startQueue: 'بدء المعالجة الجماعية',
      pauseQueue: 'إيقاف مؤقت',
      clearAll: 'مسح القائمة',
      downloadZip: 'تحميل الكل كملف ZIP',
      packingZip: 'جاري ضغط ملف ZIP...',
      globalSettingsTitle: 'إعدادات موحّدة لجميع الصور',
      globalBackground: 'الخلفية الموحدة',
      globalAspect: 'المقاس الموحّد',
      watermarkText: 'علامة مائية نصية (اختياري)',
      watermarkPlaceholder: 'مثال: اسم متجرك',
      watermarkOpacity: 'وضوح العلامة المائية',
      statusQueued: 'في الانتظار',
      statusProcessing: 'جاري العزل...',
      statusDone: 'جاهزة',
      statusError: 'خطأ',
      downloadSingle: 'تحميل',
      removeItem: 'إزالة',
      summaryCount: 'صورة في القائمة',
      emptyTitle: 'لم يتم إضافة صور للمعالجة الجماعية بعد',
      emptyDesc: 'أضف صور منتجاتك أو صورك الشخصية وسيتولى الاستوديو عزلها وتصديرها دفعة واحدة.',
    },
    ads: {
      sponsoredLabel: 'مساحة إعلانية',
      topBannerPlaceholder: 'مساحة إعلان بانر علوي (728×90) — جاهزة لـ Google AdSense',
      nativeBannerPlaceholder: 'مساحة إعلان مدمجة (Responsive AdSense Unit)',
    },
    landing: {
      howItWorksTitle: 'من صورة خام إلى تصميم استوديو في 3 خطوات',
      howItWorksSubtitle: 'تجربة تحرير سريعة تعمل بالكامل على جهازك بدون انتظار أو قيود.',
      steps: [
        {
          num: '01',
          title: 'ارفع صورة أو مجموعة صور',
          desc: 'اسحب صورة منتجك أو بورتريه شخصي أو حتى 50 صورة دفعة واحدة بصيغ JPG أو PNG أو WebP أو AVIF.',
        },
        {
          num: '02',
          title: 'عزل ذكي بالشبكة العصبية',
          desc: 'يحسب المحرك قناع الشفافية بدقة عالية للشعر والفرو والحواف مع إمكانية التعديل اليدوي بالفرشاة.',
        },
        {
          num: '03',
          title: 'صمّم وصدّر بالمقاس المناسب',
          desc: 'أضف نصوصاً خلف العنصر، حدود ستيكر، أو تمويه DSLR ثم حمّل فوراً بدقة عالية أو بملف ZIP.',
        },
      ],
      privacyTitle: 'خصوصية تامة وبلا تكاليف خوادم',
      privacySubtitle: 'مصمم ليعمل مباشرة في متصفح الزائر أو على أي استضافة مواقع ثابتة.',
      features: [
        {
          title: 'تشغيل محلي بالمتصفح',
          desc: 'المحركات المحلية تعمل بـ WebAssembly و WebGPU وتُحفظ في ذاكرة المتصفح بعد أول تحميل.',
        },
        {
          title: 'نص خلف العنصر بضغطة واحدة',
          desc: 'افصل النصوص بين الخلفية والعنصر الأمامي لإنتاج صور مصغرة وبوسترات جذابة.',
        },
        {
          title: 'مقاسات التجارة الإلكترونية',
          desc: 'قوالب جاهزة لأمازون (أبيض نقي 1:1)، يوتيوب (16:9)، ريلز (9:16)، وصور الهوية.',
        },
        {
          title: 'تصدير ذكي مع معاينة الحجم',
          desc: 'اختر PNG أو WebP أو JPG وشاهد حجم الملف النهائي قبل التحميل.',
        },
      ],
      faqTitle: 'الأسئلة الشائعة',
      faqs: [
        {
          q: 'هل تُرفع صوري إلى خادم خارجي عند استخدام الاستوديو؟',
          a: 'عند اختيار المحرك المحلي (RMBG-1.4 أو IMG.LY ISNet)، تتم المعالجة بالكامل داخل متصفحك ولا تغادر صورك جهازك مطلقاً. محرك السحابة اختياري ويقوم بالتحويل التلقائي للمحرك المحلي عند الانشغال.',
        },
        {
          q: 'لماذا يستغرق التشغيل الأول بضع ثوانٍ إضافية؟',
          a: 'في أول استخدام فقط، يقوم المتصفح بتحميل ملفات نموذج الذكاء الاصطناعي وتخزينها محلياً (Cache)، وبعدها يعمل العزل بشكل فوري في كل مرة تفتح فيها الموقع.',
        },
        {
          q: 'هل يدعم الاستوديو النصوص العربية والخطوط الحديثة؟',
          a: 'نعم، يوفر الاستوديو خطوط Cairo و Tajawal و Readex Pro إلى جانب الخطوط اللاتينية، مع دعم كامل لوضع النص خلف العنصر والتحكم في الحدود والظل والدوران.',
        },
        {
          q: 'كم صورة يمكنني معالجتها في وضع المعالجة الجماعية؟',
          a: 'يمكنك إضافة 50 صورة أو أكثر؛ يقوم المحرك بمعالجتها بالتتابع لحماية ذاكرة الجهاز ثم ضغطها جميعاً في ملف ZIP واحد.',
        },
      ],
      footerRights: 'جميع الحقوق محفوظة.',
      footerPrivacy: 'معالجة محلية ١٠٠٪ داخل المتصفح · لا يتم تخزين أي صور.',
    },
  },
  en: {
    nav: {
      singleStudio: 'Single Studio',
      bulkCutout: 'Bulk Cutout',
      howItWorks: 'How It Works',
      faq: 'FAQ',
      startEditing: 'Upload Image',
    },
    engines: {
      rmbg: {
        name: 'Smart Local AI (RMBG-1.4)',
        badge: 'Recommended · On-Device',
        description: 'High-precision hair and edge matting running privately in your browser at zero server cost.',
      },
      imgly: {
        name: 'Studio Matting (IMG.LY ISNet)',
        badge: 'Product Precision',
        description: 'On-device ISNet neural segmentation tailored for products, portraits, and clean cutouts.',
      },
      cloud: {
        name: 'Cloud Ultra AI (not-lain ZeroGPU)',
        badge: 'Free Cloud',
        description: 'ZeroGPU cloud inference via Hugging Face with automatic local fallback if busy.',
      },
    },
    hero: {
      kicker: '100% Client-Side Processing · Zero Server Costs or Subscriptions',
      title: 'Remove Backgrounds & Design Studio-Grade Visuals in Seconds',
      subtitle:
        'All-in-one cutout studio for single 4K photos and 50+ bulk batches, featuring Text Behind Subject, sticker outlines, DSLR portrait bokeh, and manual brush refinement.',
      uploadTitle: 'Drag & drop your image here, or click to browse',
      uploadSubtitle: 'Supports high-resolution 4K photos with full edge preservation',
      uploadButton: 'Choose Image',
      supportedFormats: 'JPG · PNG · WebP · AVIF',
      trySampleLabel: 'Or test instantly with a studio sample:',
      samplePortrait: 'Portrait',
      sampleSneaker: 'Sneaker',
      sampleWatch: 'Watch',
      sampleCat: 'Tabby Cat',
      privacyGuarantee: 'Your images stay on your device with local AI engines',
    },
    processing: {
      initializingModel: 'Initializing local AI engine for first use only — free forever...',
      downloadingWeights: 'Caching neural matting model weights in browser...',
      segmentingImage: 'Analyzing subject silhouette and isolating background...',
      refiningEdges: 'Refining alpha transparency edges at full resolution...',
      cloudConnecting: 'Connecting to not-lain Cloud ZeroGPU space...',
      cloudFallbackNotice: 'Cloud space is currently busy; seamlessly completed via Local Smart AI.',
      engineFallbackNotice: 'Automatically switched to backup local AI engine for uninterrupted matting.',
      completedIn: 'Cutout ready in',
      errorTitle: 'Could not complete processing',
      retryButton: 'Try Again',
    },
    studio: {
      compareView: 'Before / After',
      designView: 'Creative Studio',
      beforeLabel: 'Original',
      afterLabel: 'Cutout',
      newPhoto: 'New Photo',
      reprocess: 'Re-run AI',
      undo: 'Undo',
      redo: 'Redo',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Fit Screen',
      tabs: {
        background: 'Backdrop',
        text: 'Text',
        effects: 'Effects',
        brush: 'Brush',
        export: 'Export',
      },
      bg: {
        transparent: 'Transparent (PNG)',
        solidColors: 'Marketplace & Studio Solids',
        gradients: 'Studio Gradients',
        customImage: 'Custom Backdrop',
        uploadBg: 'Upload Background Image',
        clearBgImage: 'Remove Custom Backdrop',
        dslrBokehTitle: 'Portrait DSLR Bokeh',
        dslrBokehDesc: 'Blur the original photo background while keeping your cutout subject tack-sharp.',
        bokehIntensity: 'Bokeh Blur Radius',
        bgAmazonWhite: 'Amazon White',
        bgStudioGray: 'Studio Gray',
        bgWarmIvory: 'Warm Ivory',
        bgObsidian: 'Obsidian',
        bgEmerald: 'Emerald',
        bgSlate: 'Slate',
        gradAlabaster: 'Alabaster Mist',
        gradEmerald: 'Emerald Editorial',
        gradTravertine: 'Warm Travertine',
        gradSky: 'Sky Studio',
        gradGraphite: 'Slate Graphite',
        gradAmber: 'Amber Sunset',
      },
      text: {
        addText: 'Add Text Layer',
        emptyState: 'Add a headline and place it behind your subject for thumbnails and editorial posters.',
        layerLabel: 'Text Layer',
        contentPlaceholder: 'Enter headline text...',
        defaultText: 'STUDIO CUT',
        placementLabel: 'Layer Depth',
        placeBehind: 'Behind Subject',
        placeFront: 'In Front',
        fontFamily: 'Font Family',
        fontSize: 'Font Size',
        color: 'Text Color',
        strokeWidth: 'Outline Width',
        strokeColor: 'Outline Color',
        rotation: 'Rotation',
        opacity: 'Opacity',
        shadow: 'Drop Shadow',
        deleteLayer: 'Delete Layer',
        dragHint: 'Drag text directly on the canvas to reposition',
      },
      effects: {
        stickerTitle: 'Sticker Outline (YouTube Style)',
        stickerDesc: 'Smooth alpha-dilated border around your subject silhouette.',
        stickerWidth: 'Border Width',
        stickerColor: 'Border Color',
        shadowTitle: 'Studio Drop Shadow',
        shadowEnable: 'Enable Shadow',
        shadowOffsetX: 'Horizontal Offset',
        shadowOffsetY: 'Vertical Offset',
        shadowBlur: 'Softness Blur',
        shadowOpacity: 'Opacity',
        shadowColor: 'Shadow Color',
        adjustSubjectTitle: 'Subject Color Grade',
        adjustBgTitle: 'Background Color Grade',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturation: 'Saturation',
        warmth: 'Warmth',
        resetAdjustments: 'Reset Adjustments',
      },
      brush: {
        title: 'Magic Touch-Up Brush',
        desc: 'Paint directly on the cutout mask to erase stray pixels or restore original details.',
        eraseMode: 'Erase Mask',
        restoreMode: 'Restore Original',
        brushSize: 'Brush Size',
        brushSoftness: 'Edge Softness',
        resetMask: 'Reset to AI Mask',
        hint: 'Press Ctrl+Z to undo and Ctrl+Y to redo',
      },
      export: {
        aspectTitle: 'E-Commerce & Social Presets',
        aspectOriginal: 'Original Size',
        aspectSquare: 'Amazon / Store Square (1:1)',
        aspectYouTube: 'YouTube Thumbnail (16:9)',
        aspectReels: 'Reels / TikTok (9:16)',
        aspectPassport: 'ID / Passport (3.5×4.5)',
        formatTitle: 'Format & Compression',
        quality: 'Quality',
        estimatedSize: 'Estimated File Size',
        dimensions: 'Dimensions',
        downloadButton: 'Download Final Image',
        downloading: 'Exporting...',
      },
    },
    bulk: {
      title: 'Bulk Batch Cutout Processor',
      subtitle: 'Drop dozens of product or portrait photos, apply unified backgrounds and sizes, and export as one ZIP.',
      dropTitle: 'Drop multiple images here or click to select',
      dropSubtitle: 'Sequential queue processing keeps browser memory safe up to 50+ photos',
      selectFiles: 'Select Multiple Files',
      loadSamples: 'Load 4 Sample Images',
      startQueue: 'Process All Images',
      pauseQueue: 'Pause Queue',
      clearAll: 'Clear Queue',
      downloadZip: 'Download All as ZIP',
      packingZip: 'Building ZIP archive...',
      globalSettingsTitle: 'Global Batch Output Settings',
      globalBackground: 'Global Background',
      globalAspect: 'Global Aspect Ratio',
      watermarkText: 'Watermark Text (Optional)',
      watermarkPlaceholder: 'e.g. Your Brand Name',
      watermarkOpacity: 'Watermark Opacity',
      statusQueued: 'Queued',
      statusProcessing: 'Processing...',
      statusDone: 'Ready',
      statusError: 'Failed',
      downloadSingle: 'Download',
      removeItem: 'Remove',
      summaryCount: 'images in queue',
      emptyTitle: 'Your batch queue is empty',
      emptyDesc: 'Add product catalogs, portraits, or load the 4 studio samples to test sequential batch matting.',
    },
    ads: {
      sponsoredLabel: 'Advertisement',
      topBannerPlaceholder: 'Top Leaderboard Slot (728×90) — Google AdSense Ready',
      nativeBannerPlaceholder: 'In-Content Native Ad Slot — Google AdSense Ready',
    },
    landing: {
      howItWorksTitle: 'From Raw Photo to Studio Asset in 3 Steps',
      howItWorksSubtitle: 'Designed for zero-latency creative work directly in your browser.',
      steps: [
        {
          num: '01',
          title: 'Upload Single or Bulk Photos',
          desc: 'Drop a high-resolution 4K portrait, product shot, or a folder of 50+ images in JPG, PNG, WebP, or AVIF.',
        },
        {
          num: '02',
          title: 'Neural Alpha Matting',
          desc: 'On-device neural networks isolate hair, fur, and sharp product edges, with manual brush touch-ups.',
        },
        {
          num: '03',
          title: 'Compose & Export Instantly',
          desc: 'Place text behind the subject, add sticker outlines or DSLR blur, and download in PNG, WebP, JPG, or ZIP.',
        },
      ],
      privacyTitle: 'Built for Privacy & Zero-Backend Hosting',
      privacySubtitle: 'Runs natively via WebAssembly and WebGPU without paid API keys or server storage.',
      features: [
        {
          title: 'Local Browser Caching',
          desc: 'Model weights download once and cache locally so subsequent cutouts finish in seconds.',
        },
        {
          title: 'One-Click Text Behind Subject',
          desc: 'Layer crisp Arabic and Latin typography behind your cutout for thumbnails and editorial graphics.',
        },
        {
          title: 'Marketplace Ready Presets',
          desc: 'Export 1:1 Amazon pure white, 16:9 YouTube banners, 9:16 Reels, or 3.5×4.5 ID photos.',
        },
        {
          title: 'Live File Size Estimator',
          desc: 'Dial in WebP or JPG compression quality with real-time byte size feedback before downloading.',
        },
      ],
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'Are my photos uploaded to an external server?',
          a: 'No when using our default Local Browser AI (RMBG-1.4) or IMG.LY ISNet engines—everything runs inside your browser memory. The optional Cloud Ultra engine uses Hugging Face ZeroGPU and falls back locally if busy.',
        },
        {
          q: 'Why does the first cutout take a little longer?',
          a: 'On your first run, the browser downloads and caches the neural network weights (~40–80 MB). Every image after that starts immediately from local browser cache.',
        },
        {
          q: 'Can I edit the cutout manually if hair or small objects need tweaking?',
          a: 'Yes! Open the Magic Brush tab to erase stray areas or restore original details with adjustable brush size, softness, and full Ctrl+Z / Ctrl+Y undo history.',
        },
        {
          q: 'How many images can I process in Bulk Mode?',
          a: 'You can queue 50+ images at once. The sequential queue processes one image at a time to protect device RAM and lets you export the entire batch in one ZIP archive.',
        },
      ],
      footerRights: 'All rights reserved.',
      footerPrivacy: '100% browser-based studio · Zero server image storage.',
    },
  },
  pt: {
    nav: {
      singleStudio: 'Estúdio Individual',
      bulkCutout: 'Corte em Lote',
      howItWorks: 'Como Funciona',
      faq: 'Perguntas Frequentes',
      startEditing: 'Enviar Imagem',
    },
    engines: {
      rmbg: {
        name: 'IA Local Inteligente (RMBG-1.4)',
        badge: 'Recomendado · No Dispositivo',
        description: 'Recorte preciso de cabelos e bordas diretamente no navegador, grátis e sem enviar fotos.',
      },
      imgly: {
        name: 'Recorte Estúdio (IMG.LY ISNet)',
        badge: 'Precisão Comercial',
        description: 'Segmentação neural local otimizada para produtos de e-commerce e retratos.',
      },
      cloud: {
        name: 'Nuvem Ultra IA (not-lain ZeroGPU)',
        badge: 'Nuvem Gratuita',
        description: 'Inferência em nuvem via Hugging Face com retorno automático para IA local se ocupada.',
      },
    },
    hero: {
      kicker: 'Processamento 100% no Navegador · Sem Assinaturas ou Servidores',
      title: 'Remova Fundos com Precisão e Crie Artes de Estúdio em Segundos',
      subtitle:
        'Estúdio completo para fotos 4K individuais e lotes de até 50+ imagens, com texto atrás do sujeito, borda estilo sticker, desfoque DSLR e pincel mágico.',
      uploadTitle: 'Arraste e solte sua imagem aqui ou clique para escolher',
      uploadSubtitle: 'Suporta fotos em alta resolução 4K preservando detalhes finos',
      uploadButton: 'Escolher Imagem',
      supportedFormats: 'JPG · PNG · WebP · AVIF',
      trySampleLabel: 'Ou teste agora com uma foto de estúdio:',
      samplePortrait: 'Retrato',
      sampleSneaker: 'Tênis',
      sampleWatch: 'Relógio',
      sampleCat: 'Gato',
      privacyGuarantee: 'Suas imagens nunca saem do dispositivo nos motores locais',
    },
    processing: {
      initializingModel: 'Inicializando motor de IA local pela primeira vez — gratuito para sempre...',
      downloadingWeights: 'Armazenando modelo neural no cache do navegador...',
      segmentingImage: 'Analisando sujeito e isolando o fundo com rede neural...',
      refiningEdges: 'Suavizando bordas e canal alfa em resolução total...',
      cloudConnecting: 'Conectando ao servidor gratuito not-lain ZeroGPU...',
      cloudFallbackNotice: 'Nuvem ocupada no momento; concluído automaticamente via IA Local.',
      engineFallbackNotice: 'Alternado automaticamente para o motor local de backup.',
      completedIn: 'Recorte concluído em',
      errorTitle: 'Não foi possível processar',
      retryButton: 'Tentar Novamente',
    },
    studio: {
      compareView: 'Antes / Depois',
      designView: 'Estúdio Criativo',
      beforeLabel: 'Original',
      afterLabel: 'Recorte',
      newPhoto: 'Nova Foto',
      reprocess: 'Reprocessar',
      undo: 'Desfazer',
      redo: 'Refazer',
      zoomIn: 'Ampliar',
      zoomOut: 'Reduzir',
      resetView: 'Ajustar à Tela',
      tabs: {
        background: 'Fundo',
        text: 'Texto',
        effects: 'Efeitos',
        brush: 'Pincel',
        export: 'Exportar',
      },
      bg: {
        transparent: 'Transparente (PNG)',
        solidColors: 'Cores Sólidas e Lojas',
        gradients: 'Gradientes de Estúdio',
        customImage: 'Fundo Personalizado',
        uploadBg: 'Enviar Imagem de Fundo',
        clearBgImage: 'Remover Fundo Personalizado',
        dslrBokehTitle: 'Desfoque Retrato DSLR',
        dslrBokehDesc: 'Desfoca o fundo original mantendo o sujeito recortado totalmente nítido.',
        bokehIntensity: 'Intensidade do Bokeh',
        bgAmazonWhite: 'Branco Amazon',
        bgStudioGray: 'Cinza Estúdio',
        bgWarmIvory: 'Marfim Quente',
        bgObsidian: 'Obsidiana',
        bgEmerald: 'Esmeralda',
        bgSlate: 'Ardósia',
        gradAlabaster: 'Alabastro Suave',
        gradEmerald: 'Esmeralda Editorial',
        gradTravertine: 'Travertino Quente',
        gradSky: 'Céu Estúdio',
        gradGraphite: 'Grafite Noturno',
        gradAmber: 'Âmbar Solar',
      },
      text: {
        addText: 'Adicionar Texto',
        emptyState: 'Adicione um título e coloque-o atrás do sujeito para capas de YouTube e pôsteres.',
        layerLabel: 'Camada de Texto',
        contentPlaceholder: 'Digite seu texto...',
        defaultText: 'ESTÚDIO PRO',
        placementLabel: 'Posição da Camada',
        placeBehind: 'Atrás do Sujeito',
        placeFront: 'Na Frente',
        fontFamily: 'Fonte',
        fontSize: 'Tamanho',
        color: 'Cor do Texto',
        strokeWidth: 'Espessura da Borda',
        strokeColor: 'Cor da Borda',
        rotation: 'Rotação',
        opacity: 'Opacidade',
        shadow: 'Sombra',
        deleteLayer: 'Excluir Camada',
        dragHint: 'Arraste o texto diretamente na tela para posicionar',
      },
      effects: {
        stickerTitle: 'Borda Sticker (Estilo YouTube)',
        stickerDesc: 'Contorno suave ao redor da silhueta recortada.',
        stickerWidth: 'Largura da Borda',
        stickerColor: 'Cor da Borda',
        shadowTitle: 'Sombra de Estúdio',
        shadowEnable: 'Ativar Sombra',
        shadowOffsetX: 'Deslocamento X',
        shadowOffsetY: 'Deslocamento Y',
        shadowBlur: 'Suavidade',
        shadowOpacity: 'Opacidade',
        shadowColor: 'Cor da Sombra',
        adjustSubjectTitle: 'Ajustes do Sujeito',
        adjustBgTitle: 'Ajustes do Fundo',
        brightness: 'Brilho',
        contrast: 'Contraste',
        saturation: 'Saturação',
        warmth: 'Temperatura',
        resetAdjustments: 'Redefinir Cores',
      },
      brush: {
        title: 'Pincel Mágico de Retoque',
        desc: 'Pinte diretamente na máscara para apagar sobras ou restaurar detalhes originais.',
        eraseMode: 'Apagar',
        restoreMode: 'Restaurar Original',
        brushSize: 'Tamanho do Pincel',
        brushSoftness: 'Suavidade',
        resetMask: 'Restaurar Máscara da IA',
        hint: 'Use Ctrl+Z para desfazer e Ctrl+Y para refazer',
      },
      export: {
        aspectTitle: 'Proporções para Lojas e Redes',
        aspectOriginal: 'Tamanho Original',
        aspectSquare: 'Quadrado Amazon / Loja (1:1)',
        aspectYouTube: 'Capa YouTube (16:9)',
        aspectReels: 'Reels / TikTok (9:16)',
        aspectPassport: 'Foto Documento (3.5×4.5)',
        formatTitle: 'Formato e Qualidade',
        quality: 'Qualidade',
        estimatedSize: 'Tamanho Estimado',
        dimensions: 'Dimensões',
        downloadButton: 'Baixar Imagem Final',
        downloading: 'Exportando...',
      },
    },
    bulk: {
      title: 'Processamento em Lote (Bulk Cutout)',
      subtitle: 'Envie dezenas de imagens de uma vez, aplique fundo e tamanho padrão e baixe tudo em um único ZIP.',
      dropTitle: 'Arraste várias imagens aqui ou clique para selecionar',
      dropSubtitle: 'Fila sequencial inteligente que protege a memória RAM até 50+ fotos',
      selectFiles: 'Selecionar Imagens',
      loadSamples: 'Carregar 4 Amostras',
      startQueue: 'Processar Todas',
      pauseQueue: 'Pausar Fila',
      clearAll: 'Limpar Lista',
      downloadZip: 'Baixar Tudo em ZIP',
      packingZip: 'Gerando arquivo ZIP...',
      globalSettingsTitle: 'Configurações Globais do Lote',
      globalBackground: 'Fundo Global',
      globalAspect: 'Proporção Global',
      watermarkText: 'Marca d’Água (Opcional)',
      watermarkPlaceholder: 'Ex: Sua Loja',
      watermarkOpacity: 'Opacidade da Marca',
      statusQueued: 'Na fila',
      statusProcessing: 'Recortando...',
      statusDone: 'Pronta',
      statusError: 'Erro',
      downloadSingle: 'Baixar',
      removeItem: 'Remover',
      summaryCount: 'imagens na fila',
      emptyTitle: 'Nenhuma imagem adicionada ao lote',
      emptyDesc: 'Envie fotos do seu catálogo ou carregue as 4 amostras para testar o processamento em massa.',
    },
    ads: {
      sponsoredLabel: 'Publicidade',
      topBannerPlaceholder: 'Espaço Banner Superior (728×90) — Pronto para Google AdSense',
      nativeBannerPlaceholder: 'Espaço Anúncio Nativo Responsivo — Google AdSense',
    },
    landing: {
      howItWorksTitle: 'Da Foto Bruta à Arte de Estúdio em 3 Passos',
      howItWorksSubtitle: 'Fluxo criativo instantâneo diretamente no navegador.',
      steps: [
        {
          num: '01',
          title: 'Envie uma ou várias fotos',
          desc: 'Arraste fotos 4K ou até 50+ arquivos em JPG, PNG, WebP ou AVIF.',
        },
        {
          num: '02',
          title: 'Recorte Neural Preciso',
          desc: 'Redes neurais isolam cabelos, pelos e produtos com ajuste fino pelo pincel.',
        },
        {
          num: '03',
          title: 'Personalize e Exporte',
          desc: 'Adicione texto atrás do sujeito, bordas sticker, desfoque DSLR e baixe em PNG, WebP ou ZIP.',
        },
      ],
      privacyTitle: 'Privacidade Total Sem Custos de Servidor',
      privacySubtitle: 'Executa nativamente via WebAssembly e WebGPU no seu navegador.',
      features: [
        {
          title: 'Cache Local Rápido',
          desc: 'Os pesos do modelo são baixados apenas uma vez e salvos no cache do navegador.',
        },
        {
          title: 'Texto Atrás do Sujeito',
          desc: 'Crie camadas atrás ou na frente da pessoa recortada com fontes modernas.',
        },
        {
          title: 'Formatos de E-Commerce',
          desc: 'Predefinições prontas para Amazon (1:1 branco), YouTube (16:9), Reels (9:16) e documentos.',
        },
        {
          title: 'Estimativa de Tamanho Real',
          desc: 'Ajuste a qualidade WebP/JPG vendo o tamanho exato em KB/MB antes de baixar.',
        },
      ],
      faqTitle: 'Perguntas Frequentes',
      faqs: [
        {
          q: 'Minhas fotos são enviadas para algum servidor?',
          a: 'Não nos motores locais (RMBG-1.4 e IMG.LY ISNet): tudo acontece na memória do seu navegador. O motor em nuvem é opcional e alterna para o modo local se estiver ocupado.',
        },
        {
          q: 'Por que o primeiro recorte demora alguns segundos a mais?',
          a: 'No primeiro uso, o navegador baixa e salva o modelo de IA em cache local. Os recortes seguintes começam instantaneamente.',
        },
        {
          q: 'Posso corrigir detalhes manualmente após o recorte?',
          a: 'Sim, use a aba Pincel Mágico para apagar ou restaurar áreas com histórico completo de desfazer (Ctrl+Z).',
        },
        {
          q: 'Quantas imagens posso processar no modo em lote?',
          a: 'Você pode enfileirar 50+ imagens; o processamento sequencial protege a memória RAM e gera um único arquivo ZIP.',
        },
      ],
      footerRights: 'Todos os direitos reservados.',
      footerPrivacy: 'Estúdio 100% no navegador · Zero armazenamento em servidor.',
    },
  },
  fr: {
    nav: {
      singleStudio: 'Studio Solo',
      bulkCutout: 'Traitement par Lot',
      howItWorks: 'Fonctionnement',
      faq: 'FAQ',
      startEditing: 'Importer une Image',
    },
    engines: {
      rmbg: {
        name: 'IA Locale Rapide (RMBG-1.4)',
        badge: 'Recommandé · Sur Appareil',
        description: 'Détourage haute précision des cheveux et contours dans votre navigateur, 100 % gratuit.',
      },
      imgly: {
        name: 'Détourage Studio (IMG.LY ISNet)',
        badge: 'Précision Produit',
        description: 'Segmentation neuronale locale dédiée aux fiches produits et portraits.',
      },
      cloud: {
        name: 'Cloud Ultra IA (not-lain ZeroGPU)',
        badge: 'Cloud Gratuit',
        description: 'Inférence cloud via Hugging Face avec bascule automatique locale en cas de saturation.',
      },
    },
    hero: {
      kicker: 'Traitement 100 % Local dans le Navigateur · Zéro Serveur Requis',
      title: 'Supprimez les Arrière-Plans et Créez des Visuels Studio en Secondes',
      subtitle:
        'Studio complet pour photos 4K et lots jusqu’à 50+ images, avec texte derrière le sujet, contour sticker, flou portrait DSLR et pinceau de retouche.',
      uploadTitle: 'Glissez-déposez votre image ici ou cliquez pour parcourir',
      uploadSubtitle: 'Prend en charge les photos 4K haute résolution sans perte',
      uploadButton: 'Choisir une Image',
      supportedFormats: 'JPG · PNG · WebP · AVIF',
      trySampleLabel: 'Ou testez immédiatement avec nos exemples studio :',
      samplePortrait: 'Portrait',
      sampleSneaker: 'Basket',
      sampleWatch: 'Montre',
      sampleCat: 'Chat',
      privacyGuarantee: 'Vos photos ne quittent jamais votre appareil avec les moteurs locaux',
    },
    processing: {
      initializingModel: 'Initialisation du moteur IA local (première fois uniquement)...',
      downloadingWeights: 'Mise en cache du modèle neuronal dans le navigateur...',
      segmentingImage: 'Analyse du sujet et séparation de l’arrière-plan...',
      refiningEdges: 'Lissage des contours et extraction de la transparence...',
      cloudConnecting: 'Connexion au service gratuit not-lain ZeroGPU...',
      cloudFallbackNotice: 'Le cloud est saturé ; détourage terminé automatiquement via l’IA locale.',
      engineFallbackNotice: 'Bascule automatique vers le moteur local de secours.',
      completedIn: 'Détourage terminé en',
      errorTitle: 'Échec du traitement',
      retryButton: 'Réessayer',
    },
    studio: {
      compareView: 'Avant / Après',
      designView: 'Studio Créatif',
      beforeLabel: 'Original',
      afterLabel: 'Détouré',
      newPhoto: 'Nouvelle Photo',
      reprocess: 'Relancer IA',
      undo: 'Annuler',
      redo: 'Rétablir',
      zoomIn: 'Zoom +',
      zoomOut: 'Zoom -',
      resetView: 'Ajuster',
      tabs: {
        background: 'Fond',
        text: 'Texte',
        effects: 'Effets',
        brush: 'Pinceau',
        export: 'Export',
      },
      bg: {
        transparent: 'Transparent (PNG)',
        solidColors: 'Couleurs Unies & Boutiques',
        gradients: 'Dégradés Studio',
        customImage: 'Fond Personnalisé',
        uploadBg: 'Importer une Image de Fond',
        clearBgImage: 'Supprimer le Fond',
        dslrBokehTitle: 'Flou Portrait DSLR (Bokeh)',
        dslrBokehDesc: 'Floutez l’arrière-plan d’origine tout en gardant le sujet parfaitement net.',
        bokehIntensity: 'Intensité du Flou',
        bgAmazonWhite: 'Blanc Amazon',
        bgStudioGray: 'Gris Studio',
        bgWarmIvory: 'Ivoire Doux',
        bgObsidian: 'Obsidienne',
        bgEmerald: 'Émeraude',
        bgSlate: 'Ardoise',
        gradAlabaster: 'Brume Albâtre',
        gradEmerald: 'Émeraude Éditorial',
        gradTravertine: 'Travertin Chaud',
        gradSky: 'Ciel Studio',
        gradGraphite: 'Graphite Nuit',
        gradAmber: 'Ambre Solaire',
      },
      text: {
        addText: 'Ajouter un Texte',
        emptyState: 'Ajoutez un titre derrière votre sujet pour créer des miniatures YouTube et affiches.',
        layerLabel: 'Calque Texte',
        contentPlaceholder: 'Saisissez votre texte...',
        defaultText: 'STUDIO PRO',
        placementLabel: 'Profondeur du Calque',
        placeBehind: 'Derrière le Sujet',
        placeFront: 'Devant le Sujet',
        fontFamily: 'Police',
        fontSize: 'Taille',
        color: 'Couleur',
        strokeWidth: 'Épaisseur Contour',
        strokeColor: 'Couleur Contour',
        rotation: 'Rotation',
        opacity: 'Opacité',
        shadow: 'Ombre Portée',
        deleteLayer: 'Supprimer le Calque',
        dragHint: 'Glissez le texte directement sur le canevas pour le placer',
      },
      effects: {
        stickerTitle: 'Contour Sticker (Style YouTube)',
        stickerDesc: 'Bordure lisse autour de la silhouette détourée.',
        stickerWidth: 'Épaisseur du Contour',
        stickerColor: 'Couleur du Contour',
        shadowTitle: 'Ombre Studio Réaliste',
        shadowEnable: 'Activer l’Ombre',
        shadowOffsetX: 'Décalage X',
        shadowOffsetY: 'Décalage Y',
        shadowBlur: 'Douceur du Flou',
        shadowOpacity: 'Opacité',
        shadowColor: 'Couleur de l’Ombre',
        adjustSubjectTitle: 'Réglages du Sujet',
        adjustBgTitle: 'Réglages du Fond',
        brightness: 'Luminosité',
        contrast: 'Contraste',
        saturation: 'Saturation',
        warmth: 'Chaleur',
        resetAdjustments: 'Réinitialiser',
      },
      brush: {
        title: 'Pinceau de Retouche',
        desc: 'Peignez directement sur le masque pour effacer des résidus ou restaurer l’original.',
        eraseMode: 'Effacer',
        restoreMode: 'Restaurer l’Original',
        brushSize: 'Taille du Pinceau',
        brushSoftness: 'Douceur',
        resetMask: 'Réinitialiser le Masque IA',
        hint: 'Utilisez Ctrl+Z pour annuler et Ctrl+Y pour rétablir',
      },
      export: {
        aspectTitle: 'Formats E-Commerce & Réseaux',
        aspectOriginal: 'Format d’Origine',
        aspectSquare: 'Carré Boutique / Amazon (1:1)',
        aspectYouTube: 'Miniature YouTube (16:9)',
        aspectReels: 'Reels / TikTok (9:16)',
        aspectPassport: 'Photo d’Identité (3.5×4.5)',
        formatTitle: 'Format & Compression',
        quality: 'Qualité',
        estimatedSize: 'Taille Estimée',
        dimensions: 'Dimensions',
        downloadButton: 'Télécharger l’Image',
        downloading: 'Exportation...',
      },
    },
    bulk: {
      title: 'Détourage par Lot (Bulk Cutout)',
      subtitle: 'Importez des dizaines d’images, appliquez un fond et un format communs et exportez en un seul ZIP.',
      dropTitle: 'Déposez plusieurs images ici ou cliquez pour choisir',
      dropSubtitle: 'File séquentielle intelligente préservant la mémoire jusqu’à 50+ photos',
      selectFiles: 'Sélectionner des Fichiers',
      loadSamples: 'Charger 4 Exemples',
      startQueue: 'Tout Traiter',
      pauseQueue: 'Mettre en Pause',
      clearAll: 'Tout Effacer',
      downloadZip: 'Tout Télécharger en ZIP',
      packingZip: 'Création de l’archive ZIP...',
      globalSettingsTitle: 'Paramètres Globaux du Lot',
      globalBackground: 'Fond Global',
      globalAspect: 'Format Global',
      watermarkText: 'Filigrane Texte (Optionnel)',
      watermarkPlaceholder: 'Ex : Votre Boutique',
      watermarkOpacity: 'Opacité du Filigrane',
      statusQueued: 'En attente',
      statusProcessing: 'Détourage...',
      statusDone: 'Prêt',
      statusError: 'Erreur',
      downloadSingle: 'Télécharger',
      removeItem: 'Retirer',
      summaryCount: 'images dans la file',
      emptyTitle: 'Aucune image dans la file pour le moment',
      emptyDesc: 'Ajoutez vos photos produits ou chargez les 4 exemples pour tester le traitement par lot.',
    },
    ads: {
      sponsoredLabel: 'Sponsorisé',
      topBannerPlaceholder: 'Emplacement Bannière Haute (728×90) — Prêt pour Google AdSense',
      nativeBannerPlaceholder: 'Emplacement Annonce Native Responsive — Google AdSense',
    },
    landing: {
      howItWorksTitle: 'De la Photo Brute au Visuel Studio en 3 Étapes',
      howItWorksSubtitle: 'Un flux créatif fluide exécuté directement dans votre navigateur.',
      steps: [
        {
          num: '01',
          title: 'Importez une ou plusieurs photos',
          desc: 'Déposez un portrait 4K ou jusqu’à 50+ photos en JPG, PNG, WebP ou AVIF.',
        },
        {
          num: '02',
          title: 'Détourage Neuronal Précis',
          desc: 'Les réseaux neuronaux isolent cheveux, pelages et produits avec retouche au pinceau.',
        },
        {
          num: '03',
          title: 'Composez et Exportez',
          desc: 'Placez du texte derrière le sujet, ajoutez un contour sticker ou un flou DSLR et exportez en ZIP ou PNG.',
        },
      ],
      privacyTitle: 'Confidentialité Totale Sans Coût Serveur',
      privacySubtitle: 'Propulsé par WebAssembly et WebGPU directement côté client.',
      features: [
        {
          title: 'Mise en Cache Locale',
          desc: 'Les poids IA se téléchargent une fois puis restent en cache navigateur.',
        },
        {
          title: 'Texte Derrière le Sujet',
          desc: 'Superposez des titres derrière ou devant le sujet avec polices arabes et latines.',
        },
        {
          title: 'Préréglages E-Commerce',
          desc: 'Formats 1:1 Amazon, 16:9 YouTube, 9:16 Reels et photos d’identité 3.5×4.5.',
        },
        {
          title: 'Estimation en Temps Réel',
          desc: 'Visualisez le poids exact du fichier PNG, WebP ou JPG avant le téléchargement.',
        },
      ],
      faqTitle: 'Questions Fréquentes',
      faqs: [
        {
          q: 'Mes photos sont-elles envoyées sur un serveur externe ?',
          a: 'Non avec les moteurs locaux (RMBG-1.4 et IMG.LY ISNet) : tout reste dans votre navigateur. Le moteur Cloud est optionnel avec repli automatique local.',
        },
        {
          q: 'Pourquoi la première utilisation prend-elle quelques secondes ?',
          a: 'Le navigateur télécharge et met en cache les poids du modèle lors de la première session ; les suivantes sont instantanées.',
        },
        {
          q: 'Puis-je corriger manuellement les bords après le détourage ?',
          a: 'Oui, grâce à l’onglet Pinceau Magique avec gomme, restauration et historique Ctrl+Z / Ctrl+Y.',
        },
        {
          q: 'Combien d’images puis-je traiter en mode par lot ?',
          a: 'Vous pouvez importer 50+ photos ; le traitement séquentiel protège la RAM et génère une archive ZIP unique.',
        },
      ],
      footerRights: 'Tous droits réservés.',
      footerPrivacy: 'Studio 100 % navigateur · Aucun stockage serveur.',
    },
  },
};
