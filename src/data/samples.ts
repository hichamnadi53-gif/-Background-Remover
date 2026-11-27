import samplePortrait from '../assets/images/sample_portrait_studio_1795731607013.jpg';
import sampleSneaker from '../assets/images/sample_sneaker_product_1795731607265.jpg';
import sampleWatch from '../assets/images/sample_watch_luxury_1795731608377.jpg';
import sampleCat from '../assets/images/sample_cat_studio_1795731607896.jpg';

export interface StudioSample {
  id: string;
  labelKey: 'samplePortrait' | 'sampleSneaker' | 'sampleWatch' | 'sampleCat';
  src: string;
  fileName: string;
  suggestedText: {
    ar: string;
    en: string;
    pt: string;
    fr: string;
  };
}

export const STUDIO_SAMPLES: StudioSample[] = [
  {
    id: 'portrait',
    labelKey: 'samplePortrait',
    src: samplePortrait.src,
    fileName: 'studio-portrait.jpg',
    suggestedText: {
      ar: 'أسلوب عصري',
      en: 'EDITORIAL',
      pt: 'EDITORIAL',
      fr: 'ÉDITORIAL',
    },
  },
  {
    id: 'sneaker',
    labelKey: 'sampleSneaker',
    src: sampleSneaker.src,
    fileName: 'sneaker-product.jpg',
    suggestedText: {
      ar: 'إصدار محدود',
      en: 'LIMITED DROP',
      pt: 'EDIÇÃO LIMITADA',
      fr: 'ÉDITION LIMITÉE',
    },
  },
  {
    id: 'watch',
    labelKey: 'sampleWatch',
    src: sampleWatch.src,
    fileName: 'luxury-watch.jpg',
    suggestedText: {
      ar: 'دقة سويسرية',
      en: 'CHRONOGRAPH',
      pt: 'CRONÓGRAFO',
      fr: 'CHRONOGRAPHE',
    },
  },
  {
    id: 'cat',
    labelKey: 'sampleCat',
    src: sampleCat.src,
    fileName: 'ginger-cat.jpg',
    suggestedText: {
      ar: 'صورة ذكية',
      en: 'PURE FOCUS',
      pt: 'FOCO TOTAL',
      fr: 'FOCUS PUR',
    },
  },
];
