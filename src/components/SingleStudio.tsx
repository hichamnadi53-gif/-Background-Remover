'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Type,
  SlidersHorizontal,
  Paintbrush,
  Download,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Trash2,
  Layers,
  Eraser,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  SplitSquareHorizontal,
  Palette,
} from 'lucide-react';
import {
  ASPECT_RATIO_PRESETS,
  STUDIO_FONTS,
  STUDIO_GRADIENT_PRESETS,
  STUDIO_SOLID_PRESETS,
  type AIEngineId,
  type AspectPresetId,
  type SupportedLanguage,
} from '../config';
import type { TranslationSchema } from '../i18n/translations';
import { STUDIO_SAMPLES, type StudioSample } from '../data/samples';
import {
  removeBackgroundWithFallback,
  type AIProgressEvent,
  type CutoutResult,
} from '../services/aiBgEngine';
import {
  applyBrushStrokeOnMask,
  buildCutoutSubjectCanvas,
  computeExportDimensions,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_STICKER_SHADOW,
  exportCompositeToBlob,
  formatBytes,
  hitTestTextLayer,
  renderStudioComposite,
  type BackgroundConfig,
  type ColorAdjustments,
  type CompositeState,
  type StickerAndShadowConfig,
  type TextLayer,
} from '../utils/canvasCompositor';
import { BeforeAfterCurtain } from './BeforeAfterCurtain';

type StudioTab = 'background' | 'text' | 'effects' | 'brush' | 'export';
type ViewportMode = 'design' | 'compare';

interface SingleStudioProps {
  lang: SupportedLanguage;
  engine: AIEngineId;
  t: TranslationSchema;
}

export function SingleStudio({ lang, engine, t }: SingleStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Source & AI Result
  const [sourceFile, setSourceFile] = useState<Blob | string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('noorcut-design');
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutPreviewUrl, setCutoutPreviewUrl] = useState<string | null>(null);
  const [cutoutResult, setCutoutResult] = useState<CutoutResult | null>(null);

  // Offscreen working canvases
  const initialMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workingMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Undo / Redo Mask History (stores ImageData snapshots)
  const maskHistoryRef = useRef<ImageData[]>([]);
  const maskHistoryIndexRef = useRef<number>(-1);
  const [historyMeta, setHistoryMeta] = useState({ index: -1, total: 0 });

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<AIProgressEvent>({ stage: 'init', progress: 0 });
  const [fallbackNotice, setFallbackNotice] = useState<'cloudFallbackNotice' | 'engineFallbackNotice' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Editor State
  const [activeTab, setActiveTab] = useState<StudioTab>('background');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('design');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Composite Layers State
  const [background, setBackground] = useState<BackgroundConfig>({
    mode: 'transparent',
    solidColor: '#FFFFFF',
    gradient: null,
    customImage: null,
    bokehBlur: 14,
  });
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [stickerShadow, setStickerShadow] = useState<StickerAndShadowConfig>(DEFAULT_STICKER_SHADOW);
  const [subjectAdjust, setSubjectAdjust] = useState<ColorAdjustments>(DEFAULT_ADJUSTMENTS);
  const [bgAdjust, setBgAdjust] = useState<ColorAdjustments>(DEFAULT_ADJUSTMENTS);
  const [aspectPreset, setAspectPreset] = useState<AspectPresetId>('original');

  // Brush State
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState<number>(36);
  const [brushSoftness, setBrushSoftness] = useState<number>(0.45);
  const isPaintingRef = useRef(false);
  const draggingTextIdRef = useRef<string | null>(null);
  const dragTextOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Export State
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [estimatedSizeText, setEstimatedSizeText] = useState<string>('—');
  const [isExporting, setIsExporting] = useState(false);

  const buildCompositeState = useCallback((): CompositeState => {
    return {
      background,
      textLayers,
      stickerShadow,
      subjectAdjust,
      bgAdjust,
      aspectPreset,
    };
  }, [background, textLayers, stickerShadow, subjectAdjust, bgAdjust, aspectPreset]);

  const refreshCutoutPreviewUrl = useCallback(
    (origCanvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement) => {
      const cutout = buildCutoutSubjectCanvas(origCanvas, maskCanvas);
      setCutoutPreviewUrl(cutout.toDataURL('image/png'));
    },
    []
  );

  const pushMaskSnapshot = useCallback((maskCanvas: HTMLCanvasElement) => {
    const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const nextHistory = maskHistoryRef.current.slice(0, maskHistoryIndexRef.current + 1);
    nextHistory.push(snap);
    if (nextHistory.length > 20) {
      nextHistory.shift();
    }
    maskHistoryRef.current = nextHistory;
    maskHistoryIndexRef.current = nextHistory.length - 1;
    setHistoryMeta({ index: maskHistoryIndexRef.current, total: nextHistory.length });
  }, []);

  const handleUndo = useCallback(() => {
    if (maskHistoryIndexRef.current <= 0 || !workingMaskCanvasRef.current || !cutoutResult) return;
    maskHistoryIndexRef.current -= 1;
    const snap = maskHistoryRef.current[maskHistoryIndexRef.current];
    const ctx = workingMaskCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (ctx && snap) {
      ctx.putImageData(snap, 0, 0);
      setHistoryMeta({ index: maskHistoryIndexRef.current, total: maskHistoryRef.current.length });
      refreshCutoutPreviewUrl(cutoutResult.originalCanvas, workingMaskCanvasRef.current);
    }
  }, [cutoutResult, refreshCutoutPreviewUrl]);

  const handleRedo = useCallback(() => {
    if (
      maskHistoryIndexRef.current >= maskHistoryRef.current.length - 1 ||
      !workingMaskCanvasRef.current ||
      !cutoutResult
    ) {
      return;
    }
    maskHistoryIndexRef.current += 1;
    const snap = maskHistoryRef.current[maskHistoryIndexRef.current];
    const ctx = workingMaskCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (ctx && snap) {
      ctx.putImageData(snap, 0, 0);
      setHistoryMeta({ index: maskHistoryIndexRef.current, total: maskHistoryRef.current.length });
      refreshCutoutPreviewUrl(cutoutResult.originalCanvas, workingMaskCanvasRef.current);
    }
  }, [cutoutResult, refreshCutoutPreviewUrl]);

  // Keyboard shortcuts Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!cutoutResult) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cutoutResult, handleUndo, handleRedo]);

  // Process image through selected AI engine
  const processInput = useCallback(
    async (input: Blob | string, displayName: string) => {
      setSourceFile(input);
      setSourceFileName(displayName.replace(/\.[^.]+$/, '') || 'noorcut-design');
      setIsProcessing(true);
      setErrorMsg(null);
      setFallbackNotice(null);
      setProgress({ stage: 'init', progress: 6 });

      if (typeof input === 'string') {
        setOriginalUrl(input);
      } else {
        const objUrl = URL.createObjectURL(input);
        setOriginalUrl(objUrl);
      }

      try {
        const result = await removeBackgroundWithFallback(input, engine, (ev) => {
          setProgress(ev);
        });

        // Clone initial mask for reset & working mask for brush editing
        const initMask = document.createElement('canvas');
        initMask.width = result.maskCanvas.width;
        initMask.height = result.maskCanvas.height;
        initMask.getContext('2d')?.drawImage(result.maskCanvas, 0, 0);
        initialMaskCanvasRef.current = initMask;

        const workMask = document.createElement('canvas');
        workMask.width = result.maskCanvas.width;
        workMask.height = result.maskCanvas.height;
        workMask.getContext('2d', { willReadFrequently: true })?.drawImage(result.maskCanvas, 0, 0);
        workingMaskCanvasRef.current = workMask;

        maskHistoryRef.current = [];
        maskHistoryIndexRef.current = -1;
        pushMaskSnapshot(workMask);

        setCutoutResult(result);
        setFallbackNotice(result.fallbackNoticeKey);
        refreshCutoutPreviewUrl(result.originalCanvas, workMask);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unexpected processing error';
        setErrorMsg(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [engine, pushMaskSnapshot, refreshCutoutPreviewUrl]
  );

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    processInput(file, file.name);
  };

  const handleSampleClick = (sample: StudioSample) => {
    processInput(sample.src, sample.fileName);
  };

  // Re-render live composite canvas whenever state changes
  const redrawCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const maskCanvas = workingMaskCanvasRef.current;
    if (!canvas || !cutoutResult || !maskCanvas) return;

    renderStudioComposite(canvas, cutoutResult.originalCanvas, maskCanvas, buildCompositeState(), {
      drawCheckerboardWhenTransparent: true,
      maxPreviewDimension: 1400,
    });
  }, [cutoutResult, buildCompositeState]);

  useEffect(() => {
    redrawCanvas();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      let active = true;
      document.fonts.ready.then(() => {
        if (active) redrawCanvas();
      });
      return () => {
        active = false;
      };
    }
  }, [redrawCanvas, viewportMode, historyMeta]);

  // Estimate export file size on export tab or state changes
  useEffect(() => {
    if (!cutoutResult || !workingMaskCanvasRef.current) return;
    if (activeTab !== 'export') return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { blob } = await exportCompositeToBlob(
          cutoutResult.originalCanvas,
          workingMaskCanvasRef.current!,
          buildCompositeState(),
          exportFormat,
          exportQuality
        );
        if (!cancelled) {
          setEstimatedSizeText(formatBytes(blob.size));
        }
      } catch {
        if (!cancelled) setEstimatedSizeText('—');
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTab, cutoutResult, buildCompositeState, exportFormat, exportQuality, historyMeta]);

  // Canvas pointer interaction: Magic Brush OR Text Layer Dragging
  const getCanvasNormalizedAndMaskCoords = (clientX: number, clientY: number) => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !cutoutResult) return null;
    const rect = canvas.getBoundingClientRect();
    const xNorm = (clientX - rect.left) / Math.max(1, rect.width);
    const yNorm = (clientY - rect.top) / Math.max(1, rect.height);

    // Map normalized preview coordinates into mask coordinates
    const maskX = xNorm * cutoutResult.width;
    const maskY = yNorm * cutoutResult.height;
    return { xNorm, yNorm, maskX, maskY };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cutoutResult || !workingMaskCanvasRef.current) return;
    const coords = getCanvasNormalizedAndMaskCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (activeTab === 'brush') {
      isPaintingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      const scaledRadius = (brushSize / 600) * Math.max(cutoutResult.width, cutoutResult.height) * 0.5;
      applyBrushStrokeOnMask(
        workingMaskCanvasRef.current,
        coords.maskX,
        coords.maskY,
        scaledRadius,
        brushSoftness,
        brushMode
      );
      redrawCanvas();
      return;
    }

    // Check if user grabbed a text layer
    const canvas = previewCanvasRef.current;
    if (canvas) {
      const hit = hitTestTextLayer(
        textLayers,
        coords.xNorm,
        coords.yNorm,
        canvas.width,
        canvas.height
      );
      if (hit) {
        draggingTextIdRef.current = hit.id;
        setSelectedTextId(hit.id);
        dragTextOffsetRef.current = {
          dx: hit.xNorm - coords.xNorm,
          dy: hit.yNorm - coords.yNorm,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cutoutResult || !workingMaskCanvasRef.current) return;
    const coords = getCanvasNormalizedAndMaskCoords(e.clientX, e.clientY);
    if (!coords) return;

    if (activeTab === 'brush' && isPaintingRef.current) {
      const scaledRadius = (brushSize / 600) * Math.max(cutoutResult.width, cutoutResult.height) * 0.5;
      applyBrushStrokeOnMask(
        workingMaskCanvasRef.current,
        coords.maskX,
        coords.maskY,
        scaledRadius,
        brushSoftness,
        brushMode
      );
      redrawCanvas();
      return;
    }

    if (draggingTextIdRef.current) {
      const nextX = Math.max(0.05, Math.min(0.95, coords.xNorm + dragTextOffsetRef.current.dx));
      const nextY = Math.max(0.05, Math.min(0.95, coords.yNorm + dragTextOffsetRef.current.dy));
      const dragId = draggingTextIdRef.current;
      setTextLayers((prev) =>
        prev.map((layer) => (layer.id === dragId ? { ...layer, xNorm: nextX, yNorm: nextY } : layer))
      );
    }
  };

  const handleCanvasPointerUp = () => {
    if (isPaintingRef.current && workingMaskCanvasRef.current && cutoutResult) {
      isPaintingRef.current = false;
      pushMaskSnapshot(workingMaskCanvasRef.current);
      refreshCutoutPreviewUrl(cutoutResult.originalCanvas, workingMaskCanvasRef.current);
    }
    draggingTextIdRef.current = null;
  };

  const handleAddTextLayer = () => {
    const id = `txt-${Date.now()}`;
    const newLayer: TextLayer = {
      id,
      text: t.studio.text.defaultText,
      placement: 'behind',
      fontFamily: lang === 'ar' ? 'Cairo' : 'Anton',
      fontSize: 150,
      color: '#1E293B',
      strokeWidth: 0,
      strokeColor: '#FFFFFF',
      shadow: false,
      rotation: 0,
      opacity: 1,
      xNorm: 0.5,
      yNorm: 0.28,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextId(id);
    setViewportMode('design');
  };

  const selectedTextLayer = textLayers.find((l) => l.id === selectedTextId) || textLayers[0] || null;

  const updateSelectedText = (patch: Partial<TextLayer>) => {
    if (!selectedTextLayer) return;
    setTextLayers((prev) =>
      prev.map((l) => (l.id === selectedTextLayer.id ? { ...l, ...patch } : l))
    );
  };

  const handleUploadCustomBackground = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBackground((prev) => ({
        ...prev,
        mode: 'image',
        customImage: img,
      }));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleResetMaskToAI = () => {
    if (!initialMaskCanvasRef.current || !workingMaskCanvasRef.current || !cutoutResult) return;
    const ctx = workingMaskCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, workingMaskCanvasRef.current.width, workingMaskCanvasRef.current.height);
    ctx.drawImage(initialMaskCanvasRef.current, 0, 0);
    pushMaskSnapshot(workingMaskCanvasRef.current);
    refreshCutoutPreviewUrl(cutoutResult.originalCanvas, workingMaskCanvasRef.current);
    redrawCanvas();
  };

  const handleDownloadExport = async () => {
    if (!cutoutResult || !workingMaskCanvasRef.current) return;
    setIsExporting(true);
    try {
      const { blob } = await exportCompositeToBlob(
        cutoutResult.originalCanvas,
        workingMaskCanvasRef.current,
        buildCompositeState(),
        exportFormat,
        exportQuality
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sourceFileName}-noorcut.${exportFormat === 'jpeg' ? 'jpg' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetToUpload = () => {
    setCutoutResult(null);
    setSourceFile(null);
    setOriginalUrl(null);
    setCutoutPreviewUrl(null);
    setErrorMsg(null);
    setFallbackNotice(null);
    setTextLayers([]);
    setStickerShadow(DEFAULT_STICKER_SHADOW);
    setSubjectAdjust(DEFAULT_ADJUSTMENTS);
    setBgAdjust(DEFAULT_ADJUSTMENTS);
    setAspectPreset('original');
    setBackground({
      mode: 'transparent',
      solidColor: '#FFFFFF',
      gradient: null,
      customImage: null,
      bokehBlur: 14,
    });
  };

  const progressStageLabel =
    progress.stage === 'init'
      ? t.processing.initializingModel
      : progress.stage === 'downloading'
      ? t.processing.downloadingWeights
      : progress.stage === 'cloud'
      ? t.processing.cloudConnecting
      : progress.stage === 'segmenting'
      ? t.processing.segmentingImage
      : t.processing.refiningEdges;

  const outputDimensions = cutoutResult
    ? computeExportDimensions(cutoutResult.width, cutoutResult.height, aspectPreset)
    : { width: 0, height: 0 };

  // ==========================================
  // 1. HERO & UPLOAD DROPZONE (When no cutout yet)
  // ==========================================
  if (!cutoutResult && !isProcessing) {
    return (
      <section className="mx-auto max-w-[1200px] px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left/Start Editorial Proposition */}
          <div className="lg:col-span-6">
            <p className="text-xs sm:text-sm font-semibold text-[#0D9488]">
              {t.hero.kicker}
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-[#111827] leading-[1.15] text-balance">
              {t.hero.title}
            </h1>
            <p className="mt-4 text-base text-[#4B5563] leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* Active Engine Description Strip */}
            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#111827]">
                  {t.engines[engine].name}
                </span>
                <span className="text-xs font-medium text-[#0D9488]">
                  {t.engines[engine].badge}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-[#4B5563]">
                {t.engines[engine].description}
              </p>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">{t.processing.errorTitle}</p>
                    <p className="mt-0.5 text-xs text-red-700">{errorMsg}</p>
                  </div>
                </div>
                {sourceFile && (
                  <button
                    type="button"
                    onClick={() => processInput(sourceFile, sourceFileName)}
                    className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
                  >
                    {t.processing.retryButton}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right/End Tactile Dropzone & Instant Samples */}
          <div className="lg:col-span-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                handleFileChange(e.dataTransfer.files);
              }}
              className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-colors ${
                isDraggingFile
                  ? 'border-[#0D9488] bg-[#0D9488]/5'
                  : 'border-[#D1D5DB] bg-white shadow-sm'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D9488]/10 text-[#0D9488]">
                <Upload className="w-7 h-7" aria-hidden="true" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#111827]">{t.hero.uploadTitle}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">{t.hero.uploadSubtitle}</p>

              <div className="mt-5 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0F766E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{t.hero.uploadButton}</span>
                </button>
                <span className="text-xs text-[#6B7280]">{t.hero.supportedFormats}</span>
              </div>

              {/* 4 Built-In Studio Samples */}
              <div className="mt-7 border-t border-[#E5E7EB] pt-5 text-start">
                <p className="text-xs font-semibold text-[#4B5563] mb-3">
                  {t.hero.trySampleLabel}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STUDIO_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSampleClick(sample)}
                      className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-start transition-all hover:border-[#0D9488] hover:shadow-xs cursor-pointer"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-[#E5E7EB]">
                        <img
                          src={sample.src}
                          alt={t.hero[sample.labelKey]}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <span className="block truncate px-2 py-1.5 text-[11px] font-semibold text-[#111827]">
                        {t.hero[sample.labelKey]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-[#6B7280]">{t.hero.privacyGuarantee}</p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 2. REAL-TIME AI LOADING / PROGRESS SCREEN
  // ==========================================
  if (isProcessing) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm text-center">
          {originalUrl && (
            <div className="mx-auto mb-6 h-40 w-40 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]">
              <img
                src={originalUrl}
                alt="Source preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          )}

          <p className="text-base font-bold text-[#111827]">{progressStageLabel}</p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full rounded-full bg-[#0D9488] transition-all duration-300"
              style={{ width: `${Math.max(8, progress.progress)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 text-xs font-mono text-[#6B7280] tabular-nums">
            <span>{progress.progress}%</span>
            {progress.loadedMB !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {progress.loadedMB} MB
                  {progress.totalMB ? ` / ${progress.totalMB} MB` : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // 3. STUDIO EDITOR WORKSPACE (After Cutout)
  // ==========================================
  return (
    <section
      data-testid="single-studio-workspace"
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Top Studio Utility Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetToUpload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.studio.newPhoto}</span>
          </button>

          {sourceFile && (
            <button
              type="button"
              onClick={() => processInput(sourceFile, sourceFileName)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.studio.reprocess}</span>
            </button>
          )}

          {/* View Switcher: Creative Studio vs Before/After Curtain */}
          <div className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] p-1">
            <button
              type="button"
              onClick={() => setViewportMode('design')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewportMode === 'design'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.studio.designView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('compare')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewportMode === 'compare'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              <span>{t.studio.compareView}</span>
            </button>
          </div>
        </div>

        {/* Status & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {cutoutResult && (
            <span className="inline-flex items-center gap-1.5 text-[#0D9488] font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t.processing.completedIn}{' '}
                <strong className="font-mono tabular-nums">
                  {(cutoutResult.durationMs / 1000).toFixed(1)}s
                </strong>
              </span>
            </span>
          )}

          <div className="flex items-center gap-1 border-s border-[#E5E7EB] ps-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyMeta.index <= 0}
              aria-label={t.studio.undo}
              title={t.studio.undo}
              className="rounded-lg p-1.5 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-35 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyMeta.index >= historyMeta.total - 1}
              aria-label={t.studio.redo}
              title={t.studio.redo}
              className="rounded-lg p-1.5 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-35 cursor-pointer"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
              aria-label={t.studio.zoomOut}
              className="rounded-lg p-1.5 text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-[#4B5563] tabular-nums w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
              aria-label={t.studio.zoomIn}
              className="rounded-lg p-1.5 text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              aria-label={t.studio.resetView}
              title={t.studio.resetView}
              className="rounded-lg p-1.5 text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? t.studio.export.downloading : t.studio.export.downloadButton}</span>
          </button>
        </div>
      </div>

      {/* Fallback Notice Banner if Cloud or Secondary Engine fell back */}
      {fallbackNotice && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900">
          {t.processing[fallbackNotice]}
        </div>
      )}

      {/* Main Two-Column Studio Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Inspector Sidebar (Left in LTR / Right in RTL) */}
        <aside className="lg:col-span-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          {/* 5 Segmented Studio Tabs */}
          <div role="tablist" className="grid grid-cols-5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            {(
              [
                { id: 'background', icon: Palette, label: t.studio.tabs.background },
                { id: 'text', icon: Type, label: t.studio.tabs.text },
                { id: 'effects', icon: SlidersHorizontal, label: t.studio.tabs.effects },
                { id: 'brush', icon: Paintbrush, label: t.studio.tabs.brush },
                { id: 'export', icon: Download, label: t.studio.tabs.export },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setViewportMode('design');
                  }}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[11px] font-semibold border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-[#0D9488] bg-white text-[#0D9488]'
                      : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-full">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inspector Panel Content */}
          <div className="p-5 space-y-6 max-h-[640px] overflow-y-auto">
            {/* TAB 1: BACKGROUND & DSLR BOKEH */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                {/* Transparent & DSLR Bokeh Quick Modes */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBackground((b) => ({ ...b, mode: 'transparent' }))}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                      background.mode === 'transparent'
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {t.studio.bg.transparent}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackground((b) => ({ ...b, mode: 'bokeh' }))}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                      background.mode === 'bokeh'
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {t.studio.bg.dslrBokehTitle}
                  </button>
                </div>

                {/* DSLR Bokeh Slider */}
                {background.mode === 'bokeh' && (
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#111827]">{t.studio.bg.bokehIntensity}</span>
                      <span className="font-mono text-[#0D9488] tabular-nums">
                        {background.bokehBlur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={32}
                      value={background.bokehBlur}
                      onChange={(e) =>
                        setBackground((b) => ({ ...b, bokehBlur: Number(e.target.value) }))
                      }
                      className="studio-slider w-full"
                    />
                    <p className="text-[11px] text-[#6B7280]">{t.studio.bg.dslrBokehDesc}</p>
                  </div>
                )}

                {/* Solid Marketplace Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#111827]">
                      {t.studio.bg.solidColors}
                    </span>
                    <input
                      type="color"
                      aria-label="Custom background color"
                      value={background.solidColor}
                      onChange={(e) =>
                        setBackground((b) => ({
                          ...b,
                          mode: 'solid',
                          solidColor: e.target.value,
                        }))
                      }
                      className="h-6 w-8 cursor-pointer rounded border border-[#E5E7EB] bg-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {STUDIO_SOLID_PRESETS.map((preset) => {
                      const active =
                        background.mode === 'solid' && background.solidColor === preset.color;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            setBackground((b) => ({
                              ...b,
                              mode: 'solid',
                              solidColor: preset.color,
                            }))
                          }
                          className={`flex items-center gap-2 rounded-lg border p-2 text-start text-[11px] font-medium transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0D9488] bg-[#0D9488]/5 text-[#111827]'
                              : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-[#D1D5DB] shrink-0"
                            style={{ backgroundColor: preset.color }}
                          />
                          <span className="truncate">{t.studio.bg[preset.labelKey]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Studio Gradients */}
                <div>
                  <span className="block text-xs font-bold text-[#111827] mb-2">
                    {t.studio.bg.gradients}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {STUDIO_GRADIENT_PRESETS.map((grad) => {
                      const active =
                        background.mode === 'gradient' && background.gradient?.id === grad.id;
                      const cssGrad = `linear-gradient(${grad.angleDeg}deg, ${grad.stops.join(', ')})`;
                      return (
                        <button
                          key={grad.id}
                          type="button"
                          onClick={() =>
                            setBackground((b) => ({
                              ...b,
                              mode: 'gradient',
                              gradient: grad,
                            }))
                          }
                          className={`rounded-lg border p-1.5 text-start transition-colors cursor-pointer ${
                            active ? 'border-[#0D9488] ring-1 ring-[#0D9488]' : 'border-[#E5E7EB]'
                          }`}
                        >
                          <div
                            className="h-8 w-full rounded-md border border-black/5"
                            style={{ background: cssGrad }}
                          />
                          <span className="mt-1 block truncate text-[11px] font-medium text-[#374151]">
                            {t.studio.bg[grad.labelKey as keyof typeof t.studio.bg]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Background Image */}
                <div>
                  <span className="block text-xs font-bold text-[#111827] mb-2">
                    {t.studio.bg.customImage}
                  </span>
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadCustomBackground(e.target.files)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#0D9488]" />
                      <span>{t.studio.bg.uploadBg}</span>
                    </button>
                    {background.customImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setBackground((b) => ({ ...b, mode: 'transparent', customImage: null }))
                        }
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEXT BEHIND SUBJECT */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAddTextLayer}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0F172A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.studio.text.addText}</span>
                </button>

                {textLayers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-5 text-center text-xs text-[#6B7280] leading-relaxed">
                    {t.studio.text.emptyState}
                  </div>
                ) : (
                  <>
                    {/* Layer selector chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {textLayers.map((layer, idx) => (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => setSelectedTextId(layer.id)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                            selectedTextLayer?.id === layer.id
                              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                              : 'border-[#E5E7EB] text-[#4B5563]'
                          }`}
                        >
                          {t.studio.text.layerLabel} {idx + 1}
                        </button>
                      ))}
                    </div>

                    {selectedTextLayer && (
                      <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
                        <input
                          type="text"
                          value={selectedTextLayer.text}
                          placeholder={t.studio.text.contentPlaceholder}
                          onChange={(e) => updateSelectedText({ text: e.target.value })}
                          className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm font-semibold text-[#111827] focus:border-[#0D9488] focus:outline-none"
                        />

                        {/* 1-Click Behind vs Front toggle */}
                        <div>
                          <span className="block text-xs font-bold text-[#111827] mb-1.5">
                            {t.studio.text.placementLabel}
                          </span>
                          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F3F4F6] p-1">
                            <button
                              type="button"
                              onClick={() => updateSelectedText({ placement: 'behind' })}
                              className={`rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                                selectedTextLayer.placement === 'behind'
                                  ? 'bg-[#0D9488] text-white shadow-xs'
                                  : 'text-[#4B5563]'
                              }`}
                            >
                              {t.studio.text.placeBehind}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedText({ placement: 'front' })}
                              className={`rounded-lg py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                                selectedTextLayer.placement === 'front'
                                  ? 'bg-[#1E293B] text-white shadow-xs'
                                  : 'text-[#4B5563]'
                              }`}
                            >
                              {t.studio.text.placeFront}
                            </button>
                          </div>
                        </div>

                        {/* Font Family */}
                        <div>
                          <label className="block text-xs font-bold text-[#111827] mb-1">
                            {t.studio.text.fontFamily}
                          </label>
                          <select
                            value={selectedTextLayer.fontFamily}
                            onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                            className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#111827] focus:border-[#0D9488] focus:outline-none"
                          >
                            {STUDIO_FONTS.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Font Size & Color */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold">{t.studio.text.fontSize}</span>
                              <span className="font-mono tabular-nums text-[#0D9488]">
                                {selectedTextLayer.fontSize}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={40}
                              max={340}
                              value={selectedTextLayer.fontSize}
                              onChange={(e) =>
                                updateSelectedText({ fontSize: Number(e.target.value) })
                              }
                              className="studio-slider w-full"
                            />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold mb-1">
                              {t.studio.text.color}
                            </span>
                            <input
                              type="color"
                              value={selectedTextLayer.color}
                              onChange={(e) => updateSelectedText({ color: e.target.value })}
                              className="h-8 w-full cursor-pointer rounded-lg border border-[#D1D5DB]"
                            />
                          </div>
                        </div>

                        {/* Stroke & Rotation */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold">{t.studio.text.strokeWidth}</span>
                              <span className="font-mono tabular-nums">
                                {selectedTextLayer.strokeWidth}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={24}
                              value={selectedTextLayer.strokeWidth}
                              onChange={(e) =>
                                updateSelectedText({ strokeWidth: Number(e.target.value) })
                              }
                              className="studio-slider w-full"
                            />
                          </div>
                          <div>
                            <span className="block text-xs font-semibold mb-1">
                              {t.studio.text.strokeColor}
                            </span>
                            <input
                              type="color"
                              value={selectedTextLayer.strokeColor}
                              onChange={(e) => updateSelectedText({ strokeColor: e.target.value })}
                              className="h-8 w-full cursor-pointer rounded-lg border border-[#D1D5DB]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold">{t.studio.text.rotation}</span>
                              <span className="font-mono tabular-nums">
                                {selectedTextLayer.rotation}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min={-45}
                              max={45}
                              value={selectedTextLayer.rotation}
                              onChange={(e) =>
                                updateSelectedText({ rotation: Number(e.target.value) })
                              }
                              className="studio-slider w-full"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold">{t.studio.text.opacity}</span>
                              <span className="font-mono tabular-nums">
                                {Math.round(selectedTextLayer.opacity * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.1}
                              max={1}
                              step={0.05}
                              value={selectedTextLayer.opacity}
                              onChange={(e) =>
                                updateSelectedText({ opacity: Number(e.target.value) })
                              }
                              className="studio-slider w-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTextLayer.shadow}
                              onChange={(e) => updateSelectedText({ shadow: e.target.checked })}
                              className="h-4 w-4 accent-[#0D9488]"
                            />
                            <span>{t.studio.text.shadow}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setTextLayers((prev) =>
                                prev.filter((l) => l.id !== selectedTextLayer.id)
                              );
                              setSelectedTextId(null);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.studio.text.deleteLayer}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-[#6B7280]">{t.studio.text.dragHint}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: STICKER OUTLINE, DROP SHADOW & COLOR ADJUSTMENTS */}
            {activeTab === 'effects' && (
              <div className="space-y-5">
                {/* Sticker Stroke */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#111827]">
                        {t.studio.effects.stickerTitle}
                      </h3>
                      <p className="text-[11px] text-[#6B7280]">{t.studio.effects.stickerDesc}</p>
                    </div>
                    <input
                      type="color"
                      aria-label={t.studio.effects.stickerColor}
                      value={stickerShadow.stickerColor}
                      onChange={(e) =>
                        setStickerShadow((s) => ({ ...s, stickerColor: e.target.value }))
                      }
                      className="h-7 w-9 cursor-pointer rounded border border-[#D1D5DB]"
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{t.studio.effects.stickerWidth}</span>
                    <span className="font-mono tabular-nums text-[#0D9488]">
                      {stickerShadow.stickerWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={stickerShadow.stickerWidth}
                    onChange={(e) =>
                      setStickerShadow((s) => ({ ...s, stickerWidth: Number(e.target.value) }))
                    }
                    className="studio-slider w-full"
                  />
                </div>

                {/* Studio Drop Shadow */}
                <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">
                      {t.studio.effects.shadowTitle}
                    </span>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stickerShadow.shadowEnabled}
                        onChange={(e) =>
                          setStickerShadow((s) => ({ ...s, shadowEnabled: e.target.checked }))
                        }
                        className="h-4 w-4 accent-[#0D9488]"
                      />
                      <span>{t.studio.effects.shadowEnable}</span>
                    </label>
                  </div>

                  {stickerShadow.shadowEnabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{t.studio.effects.shadowOffsetX}</span>
                          <span className="font-mono tabular-nums">
                            {stickerShadow.shadowOffsetX}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={stickerShadow.shadowOffsetX}
                          onChange={(e) =>
                            setStickerShadow((s) => ({
                              ...s,
                              shadowOffsetX: Number(e.target.value),
                            }))
                          }
                          className="studio-slider w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{t.studio.effects.shadowOffsetY}</span>
                          <span className="font-mono tabular-nums">
                            {stickerShadow.shadowOffsetY}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={stickerShadow.shadowOffsetY}
                          onChange={(e) =>
                            setStickerShadow((s) => ({
                              ...s,
                              shadowOffsetY: Number(e.target.value),
                            }))
                          }
                          className="studio-slider w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{t.studio.effects.shadowBlur}</span>
                          <span className="font-mono tabular-nums">{stickerShadow.shadowBlur}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={70}
                          value={stickerShadow.shadowBlur}
                          onChange={(e) =>
                            setStickerShadow((s) => ({
                              ...s,
                              shadowBlur: Number(e.target.value),
                            }))
                          }
                          className="studio-slider w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>{t.studio.effects.shadowOpacity}</span>
                          <span className="font-mono tabular-nums">
                            {Math.round(stickerShadow.shadowOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.05}
                          max={0.95}
                          step={0.05}
                          value={stickerShadow.shadowOpacity}
                          onChange={(e) =>
                            setStickerShadow((s) => ({
                              ...s,
                              shadowOpacity: Number(e.target.value),
                            }))
                          }
                          className="studio-slider w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject Color Adjustments */}
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827]">
                      {t.studio.effects.adjustSubjectTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubjectAdjust(DEFAULT_ADJUSTMENTS);
                        setBgAdjust(DEFAULT_ADJUSTMENTS);
                      }}
                      className="text-[11px] font-semibold text-[#0D9488] hover:underline cursor-pointer"
                    >
                      {t.studio.effects.resetAdjustments}
                    </button>
                  </div>

                  {(
                    [
                      { key: 'brightness', label: t.studio.effects.brightness, min: 60, max: 140 },
                      { key: 'contrast', label: t.studio.effects.contrast, min: 60, max: 140 },
                      { key: 'saturation', label: t.studio.effects.saturation, min: 0, max: 180 },
                      { key: 'warmth', label: t.studio.effects.warmth, min: -40, max: 40 },
                    ] as const
                  ).map((ctrl) => (
                    <div key={ctrl.key}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-[#4B5563]">{ctrl.label}</span>
                        <span className="font-mono tabular-nums text-[#111827]">
                          {subjectAdjust[ctrl.key]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        value={subjectAdjust[ctrl.key]}
                        onChange={(e) =>
                          setSubjectAdjust((prev) => ({
                            ...prev,
                            [ctrl.key]: Number(e.target.value),
                          }))
                        }
                        className="studio-slider w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Background Color Adjustments */}
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2.5">
                  <span className="block text-xs font-bold text-[#111827]">
                    {t.studio.effects.adjustBgTitle}
                  </span>
                  {(
                    [
                      { key: 'brightness', label: t.studio.effects.brightness, min: 60, max: 140 },
                      { key: 'contrast', label: t.studio.effects.contrast, min: 60, max: 140 },
                      { key: 'saturation', label: t.studio.effects.saturation, min: 0, max: 180 },
                    ] as const
                  ).map((ctrl) => (
                    <div key={ctrl.key}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-[#4B5563]">{ctrl.label}</span>
                        <span className="font-mono tabular-nums text-[#111827]">
                          {bgAdjust[ctrl.key]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        value={bgAdjust[ctrl.key]}
                        onChange={(e) =>
                          setBgAdjust((prev) => ({
                            ...prev,
                            [ctrl.key]: Number(e.target.value),
                          }))
                        }
                        className="studio-slider w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MAGIC BRUSH (ERASE & RESTORE) */}
            {activeTab === 'brush' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">{t.studio.brush.title}</h3>
                  <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                    {t.studio.brush.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBrushMode('erase')}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold cursor-pointer ${
                      brushMode === 'erase'
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] text-[#374151]'
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span>{t.studio.brush.eraseMode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrushMode('restore')}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold cursor-pointer ${
                      brushMode === 'restore'
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] text-[#374151]'
                    }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{t.studio.brush.restoreMode}</span>
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">{t.studio.brush.brushSize}</span>
                    <span className="font-mono tabular-nums text-[#0D9488]">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={120}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="studio-slider w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">{t.studio.brush.brushSoftness}</span>
                    <span className="font-mono tabular-nums text-[#0D9488]">
                      {Math.round(brushSoftness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={brushSoftness}
                    onChange={(e) => setBrushSoftness(Number(e.target.value))}
                    className="studio-slider w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetMaskToAI}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] py-2 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  {t.studio.brush.resetMask}
                </button>

                <p className="text-[11px] text-[#6B7280]">{t.studio.brush.hint}</p>
              </div>
            )}

            {/* TAB 5: ASPECT RATIO RESIZER & SMART EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-5">
                <div>
                  <span className="block text-xs font-bold text-[#111827] mb-2">
                    {t.studio.export.aspectTitle}
                  </span>
                  <div className="space-y-1.5">
                    {ASPECT_RATIO_PRESETS.map((preset) => {
                      const active = aspectPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setAspectPreset(preset.id)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                              : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                          }`}
                        >
                          <span>
                            {t.studio.export[preset.labelKey as keyof typeof t.studio.export]}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums opacity-80">
                            {preset.ratioLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                  <span className="block text-xs font-bold text-[#111827]">
                    {t.studio.export.formatTitle}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setExportFormat(fmt)}
                        className={`rounded-xl border py-2 text-xs font-bold uppercase cursor-pointer ${
                          exportFormat === fmt
                            ? 'border-[#1E293B] bg-[#1E293B] text-white'
                            : 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {fmt === 'jpeg' ? 'JPG' : fmt}
                      </button>
                    ))}
                  </div>

                  {exportFormat !== 'png' && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">{t.studio.export.quality}</span>
                        <span className="font-mono tabular-nums text-[#0D9488]">
                          {Math.round(exportQuality * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={1}
                        step={0.02}
                        value={exportQuality}
                        onChange={(e) => setExportQuality(Number(e.target.value))}
                        className="studio-slider w-full"
                      />
                    </div>
                  )}

                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">{t.studio.export.dimensions}</span>
                      <span className="font-mono font-semibold text-[#111827] tabular-nums">
                        {outputDimensions.width} × {outputDimensions.height} px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">{t.studio.export.estimatedSize}</span>
                      <span className="font-mono font-semibold text-[#0D9488] tabular-nums">
                        {estimatedSizeText}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadExport}
                    disabled={isExporting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0F766E] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isExporting ? t.studio.export.downloading : t.studio.export.downloadButton}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Central Canvas / Before-After Curtain Viewport */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] p-4 sm:p-6 min-h-[520px] overflow-hidden">
          {viewportMode === 'compare' && originalUrl && cutoutPreviewUrl && cutoutResult ? (
            <BeforeAfterCurtain
              beforeUrl={originalUrl}
              afterUrl={cutoutPreviewUrl}
              beforeLabel={t.studio.beforeLabel}
              afterLabel={t.studio.afterLabel}
              aspectRatio={cutoutResult.width / Math.max(1, cutoutResult.height)}
            />
          ) : (
            <div
              className="relative flex items-center justify-center overflow-auto max-w-full max-h-[600px] rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                data-testid="studio-composite-canvas"
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                className={`max-h-[560px] max-w-full w-auto h-auto block touch-none ${
                  activeTab === 'brush'
                    ? 'cursor-crosshair'
                    : textLayers.length > 0
                    ? 'cursor-move'
                    : 'cursor-default'
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
