'use client';

import React from 'react';
import { Globe, Cpu } from 'lucide-react';
import { BRAND_CONFIG, type AIEngineId, type SupportedLanguage } from '../config';
import { LANGUAGE_META, type TranslationSchema } from '../i18n/translations';
import { NoorCutLogo } from './NoorCutLogo';

export type WorkspaceMode = 'single' | 'bulk';

interface HeaderProps {
  lang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  engine: AIEngineId;
  onChangeEngine: (engine: AIEngineId) => void;
  mode: WorkspaceMode;
  onChangeMode: (mode: WorkspaceMode) => void;
  t: TranslationSchema;
}

export function Header({
  lang,
  onChangeLang,
  engine,
  onChangeEngine,
  mode,
  onChangeMode,
  t,
}: HeaderProps) {
  const brandTitle = BRAND_CONFIG.brandName[lang];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] frosted-panel">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 sm:gap-6 lg:gap-8 px-3 py-2.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Title (single-line wordmark + flat 2D geometric mark) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onChangeMode('single');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg"
        >
          <NoorCutLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
          <span className="text-sm sm:text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0">
            {brandTitle}
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]">
          <button
            type="button"
            onClick={() => {
              onChangeMode('single');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              mode === 'single'
                ? 'border-[#0D9488] text-[#111827] font-semibold'
                : 'border-transparent hover:text-[#111827]'
            }`}
          >
            {t.nav.singleStudio}
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeMode('bulk');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              mode === 'bulk'
                ? 'border-[#0D9488] text-[#111827] font-semibold'
                : 'border-transparent hover:text-[#111827]'
            }`}
          >
            {t.nav.bulkCutout}
          </button>
          <a
            href="#how-it-works"
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-[#111827] transition-colors"
          >
            {t.nav.howItWorks}
          </a>
          <a
            href="#faq"
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:text-[#111827] transition-colors"
          >
            {t.nav.faq}
          </a>
        </nav>

        {/* Zone 3: Engine Selector + Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 sm:px-2.5 py-1.5 shadow-xs">
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488] shrink-0" aria-hidden="true" />
            <label htmlFor="ai-engine-select" className="sr-only">
              AI Engine
            </label>
            <select
              id="ai-engine-select"
              aria-label="AI Engine"
              value={engine}
              onChange={(e) => onChangeEngine(e.target.value as AIEngineId)}
              className="bg-transparent text-[11px] sm:text-xs font-semibold text-[#111827] focus:outline-none cursor-pointer max-w-[92px] sm:max-w-[195px] truncate"
            >
              <option value="rmbg">{t.engines.rmbg.name}</option>
              <option value="imgly">{t.engines.imgly.name}</option>
              <option value="cloud">{t.engines.cloud.name}</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 sm:px-2.5 py-1.5 shadow-xs">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E293B] shrink-0" aria-hidden="true" />
            <label htmlFor="language-select" className="sr-only">
              Language
            </label>
            <select
              id="language-select"
              aria-label="Language"
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as SupportedLanguage)}
              className="bg-transparent text-[11px] sm:text-xs font-semibold text-[#111827] focus:outline-none cursor-pointer max-w-[68px] sm:max-w-none truncate"
            >
              {(Object.keys(LANGUAGE_META) as SupportedLanguage[]).map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_META[code].nativeName} ({LANGUAGE_META[code].shortCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile compact mode switcher row (<768px) */}
      <div className="flex md:hidden items-center justify-center gap-2 border-t border-[#E5E7EB] bg-white/90 px-4 py-1.5">
        <button
          type="button"
          onClick={() => onChangeMode('single')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            mode === 'single' ? 'bg-[#1E293B] text-white' : 'text-[#4B5563]'
          }`}
        >
          {t.nav.singleStudio}
        </button>
        <button
          type="button"
          onClick={() => onChangeMode('bulk')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            mode === 'bulk' ? 'bg-[#1E293B] text-white' : 'text-[#4B5563]'
          }`}
        >
          {t.nav.bulkCutout}
        </button>
      </div>
    </header>
  );
}
