'use client';

import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Layers, Maximize2, FileArchive } from 'lucide-react';
import { BRAND_CONFIG, type SupportedLanguage } from '../config';
import type { TranslationSchema } from '../i18n/translations';
import { NoorCutLogo } from './NoorCutLogo';
import { MonetizationSlot } from './MonetizationSlot';

interface LandingSeoSectionProps {
  lang: SupportedLanguage;
  t: TranslationSchema;
}

export function LandingSeoSection({ lang, t }: LandingSeoSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const featureIcons = [ShieldCheck, Layers, Maximize2, FileArchive];

  return (
    <div className="border-t border-[#E5E7EB] bg-white">
      {/* 3-Step Workflow Section */}
      <section id="how-it-works" className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance">
            {t.landing.howItWorksTitle}
          </h2>
          <p className="mt-3 text-base text-[#4B5563] leading-relaxed">
            {t.landing.howItWorksSubtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.landing.steps.map((step) => (
            <div
              key={step.num}
              className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-6"
            >
              <span className="font-mono text-sm font-bold text-[#0D9488] tabular-nums">
                {step.num}
              </span>
              <h3 className="mt-3 text-lg font-bold text-[#111827]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Native In-Content Monetization Slot */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <MonetizationSlot variant="inContentNative" t={t} />
      </div>

      {/* Capabilities & Privacy Section */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-balance">
            {t.landing.privacyTitle}
          </h2>
          <p className="mt-3 text-base text-[#4B5563] leading-relaxed">
            {t.landing.privacySubtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.landing.features.map((feat, idx) => {
            const Icon = featureIcons[idx % featureIcons.length];
            return (
              <div
                key={feat.title}
                className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors hover:border-[#0D9488]/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D9488]/10 text-[#0D9488]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#111827]">{feat.title}</h3>
                <p className="mt-1.5 text-sm text-[#4B5563] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] text-center">
            {t.landing.faqTitle}
          </h2>

          <div className="mt-8 divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white">
            {t.landing.faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm sm:text-base font-semibold text-[#111827] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[#6B7280] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0D9488]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-[#4B5563] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col sm:flex-row items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <NoorCutLogo className="w-6 h-6" />
            <span className="text-sm font-bold text-[#111827]">
              {BRAND_CONFIG.brandName[lang]}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] text-center">{t.landing.footerPrivacy}</p>
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} {BRAND_CONFIG.brandName[lang]} · {t.landing.footerRights}
          </p>
        </div>
      </footer>
    </div>
  );
}
