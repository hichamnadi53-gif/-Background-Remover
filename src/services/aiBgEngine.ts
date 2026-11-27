import { AI_CDN_URLS, type AIEngineId } from '../config';

export interface AIProgressEvent {
  stage: 'init' | 'downloading' | 'segmenting' | 'refining' | 'cloud' | 'fallback';
  progress: number; // 0 to 100
  loadedMB?: number;
  totalMB?: number;
  detail?: string;
}

export interface CutoutResult {
  originalCanvas: HTMLCanvasElement;
  maskCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  requestedEngine: AIEngineId;
  usedEngine: AIEngineId;
  fallbackNoticeKey: 'cloudFallbackNotice' | 'engineFallbackNotice' | null;
  durationMs: number;
}

// Native un-bundled dynamic ESM loader — prevents Vite/Rollup/Webpack from mangling WASM/WebGPU exports
const importModule = new Function('url', 'return import(url)') as (url: string) => Promise<any>;

interface CachedTransformersModel {
  model: any;
  processor: any;
  RawImage: any;
  modelId: string;
}

let cachedTransformers: CachedTransformersModel | null = null;
let transformersLoadingPromise: Promise<CachedTransformersModel> | null = null;

export async function loadImageElementFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode uploaded image.'));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function imageToCanvas(img: HTMLImageElement, maxDimension = 4096): HTMLCanvasElement {
  let { naturalWidth: width, naturalHeight: height } = img;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function buildMaskCanvasFromCutoutImage(
  cutoutImg: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = targetWidth;
  tempCanvas.height = targetHeight;
  const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tCtx) throw new Error('Canvas 2D context unavailable.');
  tCtx.drawImage(cutoutImg, 0, 0, targetWidth, targetHeight);
  const imgData = tCtx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Store alpha mask as white RGB with alpha channel so destination-in / brush editing works smoothly
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = a;
  }

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = targetWidth;
  maskCanvas.height = targetHeight;
  const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!mCtx) throw new Error('Mask Canvas 2D context unavailable.');
  mCtx.putImageData(imgData, 0, 0);
  return maskCanvas;
}

async function getTransformersEngine(onProgress?: (ev: AIProgressEvent) => void): Promise<CachedTransformersModel> {
  if (cachedTransformers) return cachedTransformers;
  if (transformersLoadingPromise) return transformersLoadingPromise;

  transformersLoadingPromise = (async () => {
    onProgress?.({ stage: 'init', progress: 5 });
    const transformers = await importModule(AI_CDN_URLS.transformers);
    const { env, AutoModel, AutoProcessor, RawImage } = transformers;

    env.allowLocalModels = false;
    env.useBrowserCache = true;
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.wasmPaths = AI_CDN_URLS.transformersWasm;
      const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 1;
      env.backends.onnx.wasm.numThreads = typeof window !== 'undefined' && window.crossOriginIsolated ? Math.min(4, cores) : 1;
    }

    const fileProgressMap = new Map<string, { loaded: number; total: number }>();

    const handleDownloadProgress = (info: any) => {
      if (!info) return;
      if (info.status === 'progress' && info.file) {
        fileProgressMap.set(info.file, {
          loaded: Number(info.loaded) || 0,
          total: Number(info.total) || 0,
        });
        let sumLoaded = 0;
        let sumTotal = 0;
        fileProgressMap.forEach((v) => {
          sumLoaded += v.loaded;
          sumTotal += v.total;
        });
        const pct = sumTotal > 0 ? Math.min(82, 10 + Math.round((sumLoaded / sumTotal) * 72)) : 35;
        onProgress?.({
          stage: 'downloading',
          progress: pct,
          loadedMB: Number((sumLoaded / (1024 * 1024)).toFixed(1)),
          totalMB: sumTotal > 0 ? Number((sumTotal / (1024 * 1024)).toFixed(1)) : undefined,
        });
      }
    };

    // Safely verify WebGPU or default explicitly to 'wasm'
    const selectedDevice: 'wasm' = 'wasm';
    const candidates: Array<{ id: string; dtype: string }> = [
      { id: 'briaai/RMBG-1.4', dtype: 'fp16' },
      { id: 'briaai/RMBG-1.4', dtype: 'q8' },
      { id: 'Xenova/modnet', dtype: 'fp32' },
    ];

    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        const model = await AutoModel.from_pretrained(candidate.id, {
          device: selectedDevice,
          dtype: candidate.dtype,
          progress_callback: handleDownloadProgress,
        });
        const processor = await AutoProcessor.from_pretrained(candidate.id, {
          config: {
            do_normalize: true,
            do_pad: false,
            do_rescale: true,
            do_resize: true,
            image_mean: [0.5, 0.5, 0.5],
            feature_extractor_type: 'ImageFeatureExtractor',
            image_std: [1, 1, 1],
            resample: 2,
            rescale_factor: 0.00392156862745098,
            size: { width: 1024, height: 1024 },
          },
        });
        cachedTransformers = { model, processor, RawImage, modelId: candidate.id };
        return cachedTransformers;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Failed to load Transformers.js RMBG model.');
  })();

  try {
    return await transformersLoadingPromise;
  } finally {
    transformersLoadingPromise = null;
  }
}

async function runRmbgEngine(
  blob: Blob,
  originalCanvas: HTMLCanvasElement,
  onProgress?: (ev: AIProgressEvent) => void
): Promise<HTMLCanvasElement> {
  const { model, processor, RawImage } = await getTransformersEngine(onProgress);

  onProgress?.({ stage: 'segmenting', progress: 85 });
  const rawImage = await RawImage.fromBlob(blob);
  const { pixel_values } = await processor(rawImage);
  const outputs = await model({ input: pixel_values });
  const outputTensor = outputs.output ?? outputs[Object.keys(outputs)[0]];

  onProgress?.({ stage: 'refining', progress: 94 });
  const dims = outputTensor.dims as number[];
  const maskH = dims[dims.length - 2];
  const maskW = dims[dims.length - 1];
  const rawData = outputTensor.data as Float32Array;

  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < rawData.length; i++) {
    const v = rawData[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }
  const span = maxVal - minVal > 1e-5 ? maxVal - minVal : 1;

  const smallMaskCanvas = document.createElement('canvas');
  smallMaskCanvas.width = maskW;
  smallMaskCanvas.height = maskH;
  const sCtx = smallMaskCanvas.getContext('2d');
  if (!sCtx) throw new Error('Mask 2D context unavailable.');

  const smallImgData = sCtx.createImageData(maskW, maskH);
  const px = smallImgData.data;
  for (let i = 0; i < maskW * maskH; i++) {
    const normalized = Math.max(0, Math.min(1, (rawData[i] - minVal) / span));
    const alpha = Math.round(normalized * 255);
    const o = i * 4;
    px[o] = 255;
    px[o + 1] = 255;
    px[o + 2] = 255;
    px[o + 3] = alpha;
  }
  sCtx.putImageData(smallImgData, 0, 0);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = originalCanvas.width;
  maskCanvas.height = originalCanvas.height;
  const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!mCtx) throw new Error('Mask 2D context unavailable.');
  mCtx.imageSmoothingEnabled = true;
  mCtx.imageSmoothingQuality = 'high';
  mCtx.drawImage(smallMaskCanvas, 0, 0, maskCanvas.width, maskCanvas.height);

  return maskCanvas;
}

async function runImglyEngine(
  blob: Blob,
  originalCanvas: HTMLCanvasElement,
  onProgress?: (ev: AIProgressEvent) => void
): Promise<HTMLCanvasElement> {
  onProgress?.({ stage: 'init', progress: 10 });
  const imglyMod = await importModule(AI_CDN_URLS.imgly);
  const removeBackground = imglyMod.removeBackground || imglyMod.default;
  if (typeof removeBackground !== 'function') {
    throw new Error('IMG.LY removeBackground export unavailable.');
  }

  const resultBlob: Blob = await removeBackground(blob, {
    publicPath: AI_CDN_URLS.imglyData,
    device: 'cpu',
    model: 'isnet_fp16',
    output: { format: 'image/png', quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const ratio = total > 0 ? Math.min(1, current / total) : 0.4;
      const stage = key.includes('fetch') ? 'downloading' : 'segmenting';
      onProgress?.({
        stage,
        progress: Math.min(92, 15 + Math.round(ratio * 75)),
        loadedMB: total > 0 ? Number((current / (1024 * 1024)).toFixed(1)) : undefined,
        totalMB: total > 0 ? Number((total / (1024 * 1024)).toFixed(1)) : undefined,
      });
    },
  });

  onProgress?.({ stage: 'refining', progress: 95 });
  const cutoutImg = await loadImageElementFromBlob(resultBlob);
  return buildMaskCanvasFromCutoutImage(cutoutImg, originalCanvas.width, originalCanvas.height);
}

async function runCloudGradioEngine(
  blob: Blob,
  originalCanvas: HTMLCanvasElement,
  onProgress?: (ev: AIProgressEvent) => void
): Promise<HTMLCanvasElement> {
  onProgress?.({ stage: 'cloud', progress: 20 });

  const timeoutMs = 25000;
  const cloudPromise = (async () => {
    const { Client } = await importModule(AI_CDN_URLS.gradioClient);
    const client = await Client.connect('not-lain/background-removal');
    onProgress?.({ stage: 'segmenting', progress: 55 });

    let result: any;
    try {
      result = await client.predict('/png', { f: blob });
    } catch {
      try {
        result = await client.predict('/png', [blob]);
      } catch {
        result = await client.predict('/image', [blob]);
      }
    }

    const first = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const outputUrl: string | undefined =
      typeof first === 'string' ? first : first?.url || first?.path;
    if (!outputUrl) {
      throw new Error('ZeroGPU Cloud response missing image URL.');
    }

    onProgress?.({ stage: 'refining', progress: 88 });
    const response = await fetch(outputUrl);
    if (!response.ok) {
      throw new Error(`ZeroGPU image fetch failed (${response.status}).`);
    }
    const cutoutBlob = await response.blob();
    const cutoutImg = await loadImageElementFromBlob(cutoutBlob);
    return buildMaskCanvasFromCutoutImage(cutoutImg, originalCanvas.width, originalCanvas.height);
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Cloud ZeroGPU timeout (25s).')), timeoutMs);
  });

  return Promise.race([cloudPromise, timeoutPromise]);
}

export async function removeBackgroundWithFallback(
  input: Blob | string,
  engine: AIEngineId,
  onProgress?: (ev: AIProgressEvent) => void
): Promise<CutoutResult> {
  const startedAt = performance.now();
  const blob =
    typeof input === 'string'
      ? await (await fetch(input)).blob()
      : input;

  const sourceImg = await loadImageElementFromBlob(blob);
  const originalCanvas = imageToCanvas(sourceImg, 4096);

  let usedEngine: AIEngineId = engine;
  let fallbackNoticeKey: 'cloudFallbackNotice' | 'engineFallbackNotice' | null = null;
  let maskCanvas: HTMLCanvasElement;

  if (engine === 'rmbg') {
    maskCanvas = await runRmbgEngine(blob, originalCanvas, onProgress);
  } else if (engine === 'imgly') {
    try {
      maskCanvas = await runImglyEngine(blob, originalCanvas, onProgress);
    } catch {
      fallbackNoticeKey = 'engineFallbackNotice';
      usedEngine = 'rmbg';
      onProgress?.({ stage: 'fallback', progress: 25 });
      maskCanvas = await runRmbgEngine(blob, originalCanvas, onProgress);
    }
  } else {
    try {
      maskCanvas = await runCloudGradioEngine(blob, originalCanvas, onProgress);
    } catch {
      fallbackNoticeKey = 'cloudFallbackNotice';
      usedEngine = 'rmbg';
      onProgress?.({ stage: 'fallback', progress: 25 });
      maskCanvas = await runRmbgEngine(blob, originalCanvas, onProgress);
    }
  }

  onProgress?.({ stage: 'refining', progress: 100 });
  return {
    originalCanvas,
    maskCanvas,
    width: originalCanvas.width,
    height: originalCanvas.height,
    requestedEngine: engine,
    usedEngine,
    fallbackNoticeKey,
    durationMs: Math.round(performance.now() - startedAt),
  };
}
