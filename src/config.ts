export type SupportedLanguage = 'ar' | 'en' | 'pt' | 'fr';

export type AIEngineId = 'rmbg' | 'imgly' | 'cloud';

export const BRAND_CONFIG = {
  brandName: {
    ar: 'نور كات ستوديو',
    en: 'NoorCut Studio',
    pt: 'NoorCut Studio',
    fr: 'NoorCut Studio',
  },
  shortName: 'NoorCut',
  tagline: {
    ar: 'استوديو إزالة الخلفية والتصميم الإبداعي بالذكاء الاصطناعي',
    en: 'AI Background Remover & Creative Photo Studio',
    pt: 'Removedor de Fundo com IA e Estúdio Criativo',
    fr: 'Suppression d’Arrière-Plan IA & Studio Photo Créatif',
  },
  domain: 'https://noorcut.studio',
  contactEmail: 'hello@noorcut.studio',
  accentHex: '#0D9488',
  slateHex: '#1E293B',
  defaultLanguage: 'ar' as SupportedLanguage,
  defaultEngine: 'rmbg' as AIEngineId,
  adsense: {
    enabled: true,
    publisherId: 'ca-pub-0000000000000000',
    slots: {
      topLeaderboard: '1234567890',
      inContentNative: '0987654321',
    },
  },
} as const;

export const AI_CDN_URLS = {
  transformers: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3',
  transformersWasm: 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/dist/',
  imgly: 'https://esm.sh/@imgly/background-removal@1.5.5',
  imglyData: 'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/',
  gradioClient: 'https://cdn.jsdelivr.net/npm/@gradio/client/+esm',
} as const;

export interface GradientPreset {
  id: string;
  labelKey: string;
  stops: [string, string, string?];
  angleDeg: number;
}

export const STUDIO_GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'alabaster-mist', labelKey: 'gradAlabaster', stops: ['#FFFFFF', '#E2E8F0'], angleDeg: 135 },
  { id: 'emerald-editorial', labelKey: 'gradEmerald', stops: ['#ECFDF5', '#99F6E4', '#0D9488'], angleDeg: 145 },
  { id: 'warm-travertine', labelKey: 'gradTravertine', stops: ['#FEFCE8', '#F5EFE6', '#D6C7B2'], angleDeg: 120 },
  { id: 'sky-studio', labelKey: 'gradSky', stops: ['#F0F9FF', '#BAE6FD', '#0284C7'], angleDeg: 135 },
  { id: 'slate-graphite', labelKey: 'gradGraphite', stops: ['#334155', '#1E293B', '#0F172A'], angleDeg: 160 },
  { id: 'sunset-amber', labelKey: 'gradAmber', stops: ['#FFF7ED', '#FED7AA', '#EA580C'], angleDeg: 135 },
];

export const STUDIO_SOLID_PRESETS = [
  { id: 'amazon-white', color: '#FFFFFF', labelKey: 'bgAmazonWhite' },
  { id: 'studio-gray', color: '#F3F4F6', labelKey: 'bgStudioGray' },
  { id: 'warm-ivory', color: '#FAF7F2', labelKey: 'bgWarmIvory' },
  { id: 'obsidian', color: '#111827', labelKey: 'bgObsidian' },
  { id: 'emerald', color: '#0D9488', labelKey: 'bgEmerald' },
  { id: 'slate-blue', color: '#1E293B', labelKey: 'bgSlate' },
] as const;

export type AspectPresetId = 'original' | 'square' | 'youtube' | 'reels' | 'passport';

export interface AspectPreset {
  id: AspectPresetId;
  width: number;
  height: number;
  ratioLabel: string;
  labelKey: string;
}

export const ASPECT_RATIO_PRESETS: AspectPreset[] = [
  { id: 'original', width: 0, height: 0, ratioLabel: 'Auto', labelKey: 'aspectOriginal' },
  { id: 'square', width: 1080, height: 1080, ratioLabel: '1:1', labelKey: 'aspectSquare' },
  { id: 'youtube', width: 1920, height: 1080, ratioLabel: '16:9', labelKey: 'aspectYouTube' },
  { id: 'reels', width: 1080, height: 1920, ratioLabel: '9:16', labelKey: 'aspectReels' },
  { id: 'passport', width: 1050, height: 1350, ratioLabel: '3.5×4.5', labelKey: 'aspectPassport' },
];

export const STUDIO_FONTS = [
  { id: 'Cairo', label: 'Cairo (عربي / Latin)' },
  { id: 'Tajawal', label: 'Tajawal (عربي / Latin)' },
  { id: 'Readex Pro', label: 'Readex Pro (عربي / Latin)' },
  { id: 'Anton', label: 'Anton (YouTube Impact)' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { id: 'Playfair Display', label: 'Playfair Display (Editorial)' },
] as const;
