import { ASPECT_RATIO_PRESETS, type AspectPresetId, type GradientPreset } from '../config';

export interface ColorAdjustments {
  brightness: number; // 50..150 (100 = neutral)
  contrast: number; // 50..150 (100 = neutral)
  saturation: number; // 0..200 (100 = neutral)
  warmth: number; // -50..50 (0 = neutral)
}

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
};

export interface TextLayer {
  id: string;
  text: string;
  placement: 'behind' | 'front';
  fontFamily: string;
  fontSize: number; // percentage of canvas min dimension * scale (or px relative to 1000px)
  color: string;
  strokeWidth: number;
  strokeColor: string;
  shadow: boolean;
  rotation: number; // degrees -45..45
  opacity: number; // 0.1..1
  xNorm: number; // 0..1 normalized center X
  yNorm: number; // 0..1 normalized center Y
}

export interface StickerAndShadowConfig {
  stickerWidth: number; // 0..36
  stickerColor: string;
  shadowEnabled: boolean;
  shadowOffsetX: number; // -60..60
  shadowOffsetY: number; // -60..60
  shadowBlur: number; // 0..80
  shadowOpacity: number; // 0..1
  shadowColor: string;
}

export const DEFAULT_STICKER_SHADOW: StickerAndShadowConfig = {
  stickerWidth: 0,
  stickerColor: '#FFFFFF',
  shadowEnabled: false,
  shadowOffsetX: 0,
  shadowOffsetY: 18,
  shadowBlur: 28,
  shadowOpacity: 0.32,
  shadowColor: '#0F172A',
};

export type BackgroundMode = 'transparent' | 'solid' | 'gradient' | 'image' | 'bokeh';

export interface BackgroundConfig {
  mode: BackgroundMode;
  solidColor: string;
  gradient: GradientPreset | null;
  customImage: HTMLImageElement | null;
  bokehBlur: number; // 0..36 px
}

export interface WatermarkConfig {
  text: string;
  opacity: number; // 0..1
}

export interface CompositeState {
  background: BackgroundConfig;
  textLayers: TextLayer[];
  stickerShadow: StickerAndShadowConfig;
  subjectAdjust: ColorAdjustments;
  bgAdjust: ColorAdjustments;
  aspectPreset: AspectPresetId;
  watermark?: WatermarkConfig;
}

export function computeExportDimensions(
  sourceWidth: number,
  sourceHeight: number,
  presetId: AspectPresetId
): { width: number; height: number } {
  if (presetId === 'original') {
    return { width: Math.max(1, sourceWidth), height: Math.max(1, sourceHeight) };
  }
  const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === presetId);
  if (!preset || preset.width <= 0 || preset.height <= 0) {
    return { width: Math.max(1, sourceWidth), height: Math.max(1, sourceHeight) };
  }
  return { width: preset.width, height: preset.height };
}

export function computeContainRect(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  paddingFactor = 1
): { x: number; y: number; width: number; height: number } {
  const safeSrcW = Math.max(1, srcW);
  const safeSrcH = Math.max(1, srcH);
  const scale = Math.min(dstW / safeSrcW, dstH / safeSrcH) * paddingFactor;
  const width = safeSrcW * scale;
  const height = safeSrcH * scale;
  return {
    x: (dstW - width) / 2,
    y: (dstH - height) / 2,
    width,
    height,
  };
}

export function computeCoverRect(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): { x: number; y: number; width: number; height: number } {
  const safeSrcW = Math.max(1, srcW);
  const safeSrcH = Math.max(1, srcH);
  const scale = Math.max(dstW / safeSrcW, dstH / safeSrcH);
  const width = safeSrcW * scale;
  const height = safeSrcH * scale;
  return {
    x: (dstW - width) / 2,
    y: (dstH - height) / 2,
    width,
    height,
  };
}

export function buildCssFilterString(adj: ColorAdjustments, extraBlurPx = 0): string {
  const parts: string[] = [];
  if (adj.brightness !== 100) parts.push(`brightness(${adj.brightness}%)`);
  if (adj.contrast !== 100) parts.push(`contrast(${adj.contrast}%)`);
  if (adj.saturation !== 100) parts.push(`saturate(${adj.saturation}%)`);
  if (adj.warmth > 0) parts.push(`sepia(${Math.min(100, adj.warmth * 1.2)}%)`);
  if (adj.warmth < 0) parts.push(`hue-rotate(${Math.round(adj.warmth * 0.45)}deg)`);
  if (extraBlurPx > 0) parts.push(`blur(${extraBlurPx}px)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function hitTestTextLayer(
  layers: TextLayer[],
  xNorm: number,
  yNorm: number,
  canvasWidth: number,
  canvasHeight: number
): TextLayer | null {
  const minDim = Math.min(canvasWidth, canvasHeight);
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    const pxSize = (layer.fontSize / 1000) * minDim;
    const halfH = Math.max(0.05, (pxSize * 0.8) / canvasHeight);
    const approxChars = Math.max(3, layer.text.length);
    const halfW = Math.max(0.08, (pxSize * approxChars * 0.35) / canvasWidth);
    if (Math.abs(xNorm - layer.xNorm) <= halfW && Math.abs(yNorm - layer.yNorm) <= halfH) {
      return layer;
    }
  }
  return null;
}

export function buildCutoutSubjectCanvas(
  originalCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  targetCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = targetCanvas || document.createElement('canvas');
  if (canvas.width !== originalCanvas.width || canvas.height !== originalCanvas.height) {
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(originalCanvas, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
) {
  if (!layer.text.trim()) return;
  const minDim = Math.min(canvasWidth, canvasHeight);
  const pxSize = Math.max(12, Math.round((layer.fontSize / 1000) * minDim));

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, layer.opacity));
  ctx.translate(layer.xNorm * canvasWidth, layer.yNorm * canvasHeight);
  ctx.rotate((layer.rotation * Math.PI) / 180);

  ctx.font = `700 ${pxSize}px "${layer.fontFamily}", "Cairo", "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (layer.shadow) {
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = Math.max(6, pxSize * 0.14);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(2, pxSize * 0.06);
  }

  if (layer.strokeWidth > 0) {
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(1, (layer.strokeWidth / 1000) * minDim * 2);
    ctx.strokeStyle = layer.strokeColor;
    ctx.strokeText(layer.text, 0, 0);
  }

  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, 0, 0);
  ctx.restore();
}

function buildStickerSilhouetteCanvas(
  maskCanvas: HTMLCanvasElement,
  color: string
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = maskCanvas.width;
  c.height = maskCanvas.height;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

export function renderStudioComposite(
  targetCanvas: HTMLCanvasElement,
  originalCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  state: CompositeState,
  options?: { drawCheckerboardWhenTransparent?: boolean; maxPreviewDimension?: number }
) {
  const { width: fullW, height: fullH } = computeExportDimensions(
    originalCanvas.width,
    originalCanvas.height,
    state.aspectPreset
  );

  let renderW = fullW;
  let renderH = fullH;
  if (options?.maxPreviewDimension && Math.max(fullW, fullH) > options.maxPreviewDimension) {
    const scale = options.maxPreviewDimension / Math.max(fullW, fullH);
    renderW = Math.max(1, Math.round(fullW * scale));
    renderH = Math.max(1, Math.round(fullH * scale));
  }

  if (targetCanvas.width !== renderW || targetCanvas.height !== renderH) {
    targetCanvas.width = renderW;
    targetCanvas.height = renderH;
  }

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, renderW, renderH);

  // 1. Background Layer
  const { background } = state;
  if (background.mode === 'transparent') {
    if (options?.drawCheckerboardWhenTransparent) {
      const tile = 14;
      for (let y = 0; y < renderH; y += tile) {
        for (let x = 0; x < renderW; x += tile) {
          const even = ((x / tile) + (y / tile)) % 2 === 0;
          ctx.fillStyle = even ? '#FFFFFF' : '#EEF2F6';
          ctx.fillRect(x, y, tile, tile);
        }
      }
    }
  } else {
    ctx.save();
    const bgFilter = buildCssFilterString(
      state.bgAdjust,
      background.mode === 'bokeh' ? background.bokehBlur : 0
    );
    ctx.filter = bgFilter;

    if (background.mode === 'solid') {
      ctx.fillStyle = background.solidColor;
      ctx.fillRect(0, 0, renderW, renderH);
    } else if (background.mode === 'gradient' && background.gradient) {
      const rad = (background.gradient.angleDeg * Math.PI) / 180;
      const cx = renderW / 2;
      const cy = renderH / 2;
      const len = Math.sqrt(renderW * renderW + renderH * renderH) / 2;
      const grad = ctx.createLinearGradient(
        cx - Math.cos(rad) * len,
        cy - Math.sin(rad) * len,
        cx + Math.cos(rad) * len,
        cy + Math.sin(rad) * len
      );
      const stops = background.gradient.stops;
      grad.addColorStop(0, stops[0]);
      if (stops[2]) {
        grad.addColorStop(0.5, stops[1]);
        grad.addColorStop(1, stops[2]);
      } else {
        grad.addColorStop(1, stops[1]);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, renderW, renderH);
    } else if (background.mode === 'image' && background.customImage) {
      const rect = computeCoverRect(
        background.customImage.naturalWidth,
        background.customImage.naturalHeight,
        renderW,
        renderH
      );
      ctx.drawImage(background.customImage, rect.x, rect.y, rect.width, rect.height);
    } else if (background.mode === 'bokeh') {
      const rect = computeCoverRect(originalCanvas.width, originalCanvas.height, renderW, renderH);
      // Slight scale up so edge blur never reveals blank margins
      const pad = background.bokehBlur * 1.4;
      ctx.drawImage(
        originalCanvas,
        rect.x - pad,
        rect.y - pad,
        rect.width + pad * 2,
        rect.height + pad * 2
      );
    }
    ctx.restore();
  }

  // 2. Text Behind Subject Layer
  for (const layer of state.textLayers) {
    if (layer.placement === 'behind') {
      drawTextLayer(ctx, layer, renderW, renderH);
    }
  }

  // Subject geometry
  const subjectRect =
    state.aspectPreset === 'original'
      ? { x: 0, y: 0, width: renderW, height: renderH }
      : computeContainRect(originalCanvas.width, originalCanvas.height, renderW, renderH, 0.92);

  const scaleFactor = renderW / Math.max(1, fullW);

  // Build masked subject cutout offscreen
  const subjectCutout = buildCutoutSubjectCanvas(originalCanvas, maskCanvas);

  // 3. Shadow & Sticker Stroke Layer
  const { stickerShadow } = state;
  if (stickerShadow.shadowEnabled && stickerShadow.shadowOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = stickerShadow.shadowOpacity;
    ctx.shadowColor = stickerShadow.shadowColor;
    ctx.shadowBlur = stickerShadow.shadowBlur * scaleFactor;
    ctx.shadowOffsetX = stickerShadow.shadowOffsetX * scaleFactor;
    ctx.shadowOffsetY = stickerShadow.shadowOffsetY * scaleFactor;
    ctx.drawImage(
      subjectCutout,
      subjectRect.x,
      subjectRect.y,
      subjectRect.width,
      subjectRect.height
    );
    ctx.restore();
  }

  if (stickerShadow.stickerWidth > 0) {
    const strokeRadius = Math.max(1, stickerShadow.stickerWidth * scaleFactor);
    const silhouette = buildStickerSilhouetteCanvas(maskCanvas, stickerShadow.stickerColor);
    const steps = 16;
    ctx.save();
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * strokeRadius;
      const dy = Math.sin(angle) * strokeRadius;
      ctx.drawImage(
        silhouette,
        subjectRect.x + dx,
        subjectRect.y + dy,
        subjectRect.width,
        subjectRect.height
      );
    }
    ctx.restore();
  }

  // 4. Subject Cutout Layer with independent color grade
  ctx.save();
  ctx.filter = buildCssFilterString(state.subjectAdjust);
  ctx.drawImage(
    subjectCutout,
    subjectRect.x,
    subjectRect.y,
    subjectRect.width,
    subjectRect.height
  );
  ctx.restore();

  // 5. Foreground Text & Watermark Layer
  for (const layer of state.textLayers) {
    if (layer.placement === 'front') {
      drawTextLayer(ctx, layer, renderW, renderH);
    }
  }

  if (state.watermark && state.watermark.text.trim()) {
    ctx.save();
    const minDim = Math.min(renderW, renderH);
    const fontSize = Math.max(14, Math.round(minDim * 0.032));
    ctx.globalAlpha = Math.max(0.05, Math.min(1, state.watermark.opacity));
    ctx.font = `600 ${fontSize}px "Cairo", "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = Math.max(2, fontSize * 0.12);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const margin = Math.max(16, minDim * 0.03);
    ctx.strokeText(state.watermark.text, renderW - margin, renderH - margin);
    ctx.fillText(state.watermark.text, renderW - margin, renderH - margin);
    ctx.restore();
  }
}

export async function exportCompositeToBlob(
  originalCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  state: CompositeState,
  format: 'png' | 'webp' | 'jpeg',
  quality = 0.92
): Promise<{ blob: Blob; width: number; height: number }> {
  const exportCanvas = document.createElement('canvas');
  // For JPEG without transparency, ensure white background if mode is transparent
  const exportState: CompositeState =
    format === 'jpeg' && state.background.mode === 'transparent'
      ? {
          ...state,
          background: { ...state.background, mode: 'solid', solidColor: '#FFFFFF' },
        }
      : state;

  renderStudioComposite(exportCanvas, originalCanvas, maskCanvas, exportState, {
    drawCheckerboardWhenTransparent: false,
  });

  const mime =
    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';

  const blob = await new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode exported image.'));
      },
      mime,
      format === 'png' ? undefined : quality
    );
  });

  return {
    blob,
    width: exportCanvas.width,
    height: exportCanvas.height,
  };
}

export function applyBrushStrokeOnMask(
  maskCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  softness: number, // 0..1
  mode: 'erase' | 'restore'
) {
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';

  const innerR = Math.max(0, radius * (1 - softness * 0.85));
  const grad = ctx.createRadialGradient(x, y, innerR, x, y, Math.max(1, radius));
  if (mode === 'erase') {
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
  } else {
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
