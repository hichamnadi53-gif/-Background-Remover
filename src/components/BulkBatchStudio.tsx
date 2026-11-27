'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  Play,
  Pause,
  Trash2,
  Download,
  FileArchive,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Images,
} from 'lucide-react';
import {
  ASPECT_RATIO_PRESETS,
  type AIEngineId,
  type AspectPresetId,
} from '../config';
import type { TranslationSchema } from '../i18n/translations';
import { STUDIO_SAMPLES } from '../data/samples';
import { removeBackgroundWithFallback, type CutoutResult } from '../services/aiBgEngine';
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_STICKER_SHADOW,
  exportCompositeToBlob,
  renderStudioComposite,
  type CompositeState,
} from '../utils/canvasCompositor';

type BatchItemStatus = 'queued' | 'processing' | 'done' | 'error';

interface BatchItem {
  id: string;
  name: string;
  source: Blob | string;
  sourceUrl: string;
  status: BatchItemStatus;
  cutout?: CutoutResult;
  errorMsg?: string;
}

function BatchItemThumbnail({
  item,
  compositeState,
}: {
  item: BatchItem;
  compositeState: CompositeState;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (item.status !== 'done' || !item.cutout || !canvasRef.current) return;
    renderStudioComposite(
      canvasRef.current,
      item.cutout.originalCanvas,
      item.cutout.maskCanvas,
      compositeState,
      {
        drawCheckerboardWhenTransparent: true,
        maxPreviewDimension: 360,
      }
    );
  }, [item.status, item.cutout, compositeState]);

  if (item.status === 'done' && item.cutout) {
    return (
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain"
      />
    );
  }

  return (
    <img
      src={item.sourceUrl}
      alt={item.name}
      referrerPolicy="no-referrer"
      className={`h-full w-full object-contain ${
        item.status === 'processing' ? 'opacity-50' : ''
      }`}
    />
  );
}

interface BulkBatchStudioProps {
  engine: AIEngineId;
  t: TranslationSchema;
}

export function BulkBatchStudio({ engine, t }: BulkBatchStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const itemsRef = useRef<BatchItem[]>([]);

  // Global Batch Settings
  const [globalBgMode, setGlobalBgMode] = useState<'transparent' | 'solid'>('transparent');
  const [globalBgColor, setGlobalBgColor] = useState<string>('#FFFFFF');
  const [globalAspect, setGlobalAspect] = useState<AspectPresetId>('original');
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.45);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const batchCompositeState = useMemo<CompositeState>(
    () => ({
      background: {
        mode: globalBgMode,
        solidColor: globalBgColor,
        gradient: null,
        customImage: null,
        bokehBlur: 0,
      },
      textLayers: [],
      stickerShadow: DEFAULT_STICKER_SHADOW,
      subjectAdjust: DEFAULT_ADJUSTMENTS,
      bgAdjust: DEFAULT_ADJUSTMENTS,
      aspectPreset: globalAspect,
      watermark: watermarkText.trim()
        ? { text: watermarkText.trim(), opacity: watermarkOpacity }
        : undefined,
    }),
    [globalBgMode, globalBgColor, globalAspect, watermarkText, watermarkOpacity]
  );

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: BatchItem[] = Array.from(files).map((file, idx) => ({
      id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      source: file,
      sourceUrl: URL.createObjectURL(file),
      status: 'queued',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleLoadSamples = () => {
    const sampleItems: BatchItem[] = STUDIO_SAMPLES.map((s, idx) => ({
      id: `sample-${Date.now()}-${idx}`,
      name: s.fileName,
      source: s.src,
      sourceUrl: s.src,
      status: 'queued',
    }));
    setItems((prev) => [...prev, ...sampleItems]);
  };

  const processQueue = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setIsRunning(true);

    try {
      while (isRunningRef.current) {
        const nextItem = itemsRef.current.find((i) => i.status === 'queued');
        if (!nextItem) break;

        setItems((prev) =>
          prev.map((i) => (i.id === nextItem.id ? { ...i, status: 'processing' } : i))
        );

        try {
          const result = await removeBackgroundWithFallback(nextItem.source, engine);

          setItems((prev) =>
            prev.map((i) =>
              i.id === nextItem.id
                ? { ...i, status: 'done', cutout: result }
                : i
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error';
          setItems((prev) =>
            prev.map((i) =>
              i.id === nextItem.id ? { ...i, status: 'error', errorMsg: msg } : i
            )
          );
        }
      }
    } finally {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  }, [engine]);

  const handlePauseQueue = () => {
    isRunningRef.current = false;
    setIsRunning(false);
  };

  const handleClearAll = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setItems([]);
  };

  const handleDownloadSingle = async (item: BatchItem) => {
    if (!item.cutout) return;
    const { blob } = await exportCompositeToBlob(
      item.cutout.originalCanvas,
      item.cutout.maskCanvas,
      batchCompositeState,
      'png',
      1
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name.replace(/\.[^.]+$/, '')}-noorcut.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.cutout);
    if (doneItems.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (let idx = 0; idx < doneItems.length; idx++) {
        const item = doneItems[idx];
        const { blob } = await exportCompositeToBlob(
          item.cutout!.originalCanvas,
          item.cutout!.maskCanvas,
          batchCompositeState,
          'png',
          1
        );
        const baseName = item.name.replace(/\.[^.]+$/, '') || `image-${idx + 1}`;
        zip.file(`${baseName}-noorcut.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noorcut-batch-${doneItems.length}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  const queuedCount = items.filter((i) => i.status === 'queued').length;
  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <section
      data-testid="bulk-batch-studio"
      className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-6"
    >
      {/* Header & Dropzone */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] text-balance">
            {t.bulk.title}
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
            {t.bulk.subtitle}
          </p>

          {/* Global Batch Controls Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-[#111827]">{t.bulk.globalSettingsTitle}</h2>

            {/* Global Background */}
            <div>
              <span className="block text-xs font-semibold text-[#4B5563] mb-2">
                {t.bulk.globalBackground}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGlobalBgMode('transparent')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    globalBgMode === 'transparent'
                      ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                      : 'border-[#E5E7EB] text-[#374151]'
                  }`}
                >
                  {t.studio.bg.transparent}
                </button>
                {[
                  { color: '#FFFFFF', label: t.studio.bg.bgAmazonWhite },
                  { color: '#F3F4F6', label: t.studio.bg.bgStudioGray },
                  { color: '#111827', label: t.studio.bg.bgObsidian },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => {
                      setGlobalBgMode('solid');
                      setGlobalBgColor(preset.color);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                      globalBgMode === 'solid' && globalBgColor === preset.color
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#111827]'
                        : 'border-[#E5E7EB] text-[#374151]'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-[#D1D5DB]"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
                <input
                  type="color"
                  aria-label="Global custom color"
                  value={globalBgColor}
                  onChange={(e) => {
                    setGlobalBgMode('solid');
                    setGlobalBgColor(e.target.value);
                  }}
                  className="h-8 w-8 cursor-pointer rounded border border-[#D1D5DB]"
                />
              </div>
            </div>

            {/* Global Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-[#4B5563] mb-1.5">
                {t.bulk.globalAspect}
              </label>
              <select
                value={globalAspect}
                onChange={(e) => setGlobalAspect(e.target.value as AspectPresetId)}
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#111827]"
              >
                {ASPECT_RATIO_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t.studio.export[p.labelKey as keyof typeof t.studio.export]} ({p.ratioLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Global Watermark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#4B5563] mb-1">
                  {t.bulk.watermarkText}
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  placeholder={t.bulk.watermarkPlaceholder}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#111827]"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#4B5563]">{t.bulk.watermarkOpacity}</span>
                  <span className="font-mono tabular-nums text-[#0D9488]">
                    {Math.round(watermarkOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="studio-slider w-full mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-file Dropzone + Action Bar */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
              isDragging
                ? 'border-[#0D9488] bg-[#0D9488]/5'
                : 'border-[#D1D5DB] bg-white shadow-xs'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
              <Images className="w-6 h-6" />
            </div>
            <h2 className="mt-3 text-base font-bold text-[#111827]">{t.bulk.dropTitle}</h2>
            <p className="mt-1 text-xs text-[#6B7280]">{t.bulk.dropSubtitle}</p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0F172A] cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                <span>{t.bulk.selectFiles}</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSamples}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] cursor-pointer whitespace-nowrap"
              >
                <span>{t.bulk.loadSamples}</span>
              </button>
            </div>
          </div>

          {/* Queue Controls */}
          {items.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-xs">
              <span className="text-xs font-semibold text-[#374151] font-mono tabular-nums">
                {doneCount} / {items.length} {t.bulk.summaryCount}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {!isRunning ? (
                  <button
                    type="button"
                    disabled={queuedCount === 0}
                    onClick={processQueue}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t.bulk.startQueue}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePauseQueue}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer whitespace-nowrap"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{t.bulk.pauseQueue}</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={doneCount === 0 || isZipping}
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E293B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F172A] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <FileArchive className="w-3.5 h-3.5" />
                  <span>{isZipping ? t.bulk.packingZip : t.bulk.downloadZip}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.bulk.clearAll}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Queue Grid */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-10 text-center">
          <p className="text-sm font-bold text-[#111827]">{t.bulk.emptyTitle}</p>
          <p className="mt-1 text-xs text-[#6B7280]">{t.bulk.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              data-testid="batch-item-card"
              className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs flex flex-col"
            >
              <div className="relative aspect-square w-full overflow-hidden studio-checkerboard border-b border-[#E5E7EB] flex items-center justify-center">
                <BatchItemThumbnail item={item} compositeState={batchCompositeState} />

                {item.status === 'processing' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-xs">
                    <Loader2 className="w-7 h-7 animate-spin text-[#0D9488]" />
                  </div>
                )}
              </div>

              <div className="p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#111827]">{item.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    {item.status === 'queued' && (
                      <>
                        <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span className="text-[#6B7280]">{t.bulk.statusQueued}</span>
                      </>
                    )}
                    {item.status === 'processing' && (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0D9488]" />
                        <span className="text-[#0D9488] font-semibold">{t.bulk.statusProcessing}</span>
                      </>
                    )}
                    {item.status === 'done' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span className="text-[#0D9488] font-semibold">{t.bulk.statusDone}</span>
                      </>
                    )}
                    {item.status === 'error' && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-red-600 font-semibold">{t.bulk.statusError}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.status === 'done' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      aria-label={`${t.bulk.downloadSingle} ${item.name}`}
                      className="rounded-lg bg-[#0D9488]/10 p-2 text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    aria-label={`${t.bulk.removeItem} ${item.name}`}
                    className="rounded-lg p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
