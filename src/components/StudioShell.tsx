'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_CONFIG, type AIEngineId, type SupportedLanguage } from '../config';
import {
  getLanguageDirection,
  resolveLanguage,
  TRANSLATIONS,
} from '../i18n/translations';
import { Header, type WorkspaceMode } from './Header';
import { SingleStudio } from './SingleStudio';
import { BulkBatchStudio } from './BulkBatchStudio';
import { MonetizationSlot } from './MonetizationSlot';
import { LandingSeoSection } from './LandingSeoSection';

const STORAGE_LANG_KEY = 'noorcut_lang';
const STORAGE_ENGINE_KEY = 'noorcut_engine';

export function StudioShell() {
  const [lang, setLang] = useState<SupportedLanguage>(BRAND_CONFIG.defaultLanguage);
  const [engine, setEngine] = useState<AIEngineId>(BRAND_CONFIG.defaultEngine);
  const [mode, setMode] = useState<WorkspaceMode>('single');

  // Hydrate persisted preferences safely after mount
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const savedLang = localStorage.getItem(STORAGE_LANG_KEY);
        if (savedLang) {
          setLang(resolveLanguage(savedLang));
        }
        const savedEngine = localStorage.getItem(STORAGE_ENGINE_KEY);
        if (savedEngine === 'rmbg' || savedEngine === 'imgly' || savedEngine === 'cloud') {
          setEngine(savedEngine);
        }
      } catch {
        // Ignore storage access restriction
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Synchronize <html dir="..." lang="..."> dynamically on every language switch
  useEffect(() => {
    const dir = getLanguageDirection(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const handleChangeLang = (nextLang: SupportedLanguage) => {
    setLang(nextLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, nextLang);
    } catch {
      // Ignore storage failure
    }
  };

  const handleChangeEngine = (nextEngine: AIEngineId) => {
    setEngine(nextEngine);
    try {
      localStorage.setItem(STORAGE_ENGINE_KEY, nextEngine);
    } catch {
      // Ignore storage failure
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827]">
      <Header
        lang={lang}
        onChangeLang={handleChangeLang}
        engine={engine}
        onChangeEngine={handleChangeEngine}
        mode={mode}
        onChangeMode={setMode}
        t={t}
      />

      <main className="flex-1">
        {/* Top Monetization Banner Slot */}
        <div className="mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-8">
          <MonetizationSlot variant="topLeaderboard" t={t} />
        </div>

        <AnimatePresence initial={false} mode="wait">
          {mode === 'single' ? (
            <motion.div
              key="single-mode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              <SingleStudio lang={lang} engine={engine} t={t} />
            </motion.div>
          ) : (
            <motion.div
              key="bulk-mode"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16 }}
            >
              <BulkBatchStudio engine={engine} t={t} />
            </motion.div>
          )}
        </AnimatePresence>

        <LandingSeoSection lang={lang} t={t} />
      </main>
    </div>
  );
}
