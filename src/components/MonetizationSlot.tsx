'use client';

import React from 'react';
import { BRAND_CONFIG } from '../config';
import type { TranslationSchema } from '../i18n/translations';

interface MonetizationSlotProps {
  variant: 'topLeaderboard' | 'inContentNative';
  t: TranslationSchema;
}

export function MonetizationSlot({ variant, t }: MonetizationSlotProps) {
  if (!BRAND_CONFIG.adsense.enabled) return null;

  const isTop = variant === 'topLeaderboard';
  const slotId = BRAND_CONFIG.adsense.slots[variant];

  return (
    <aside
      aria-label={t.ads.sponsoredLabel}
      data-ad-client={BRAND_CONFIG.adsense.publisherId}
      data-ad-slot={slotId}
      className={`mx-auto w-full ${isTop ? 'max-w-[728px]' : 'max-w-4xl'} rounded-xl border border-dashed border-[#D1D5DB] bg-[#F3F4F6]/70 px-4 py-3 text-center`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs text-[#6B7280]">
        <span className="font-semibold text-[#374151]">{t.ads.sponsoredLabel}</span>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span>{isTop ? t.ads.topBannerPlaceholder : t.ads.nativeBannerPlaceholder}</span>
      </div>
    </aside>
  );
}
