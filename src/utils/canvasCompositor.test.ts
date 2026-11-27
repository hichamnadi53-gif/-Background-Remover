import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeExportDimensions,
  computeContainRect,
  computeCoverRect,
  buildCssFilterString,
  formatBytes,
  hitTestTextLayer,
  DEFAULT_ADJUSTMENTS,
  type TextLayer,
} from './canvasCompositor';

test('computeExportDimensions handles original and aspect presets', () => {
  assert.deepEqual(computeExportDimensions(2400, 1600, 'original'), { width: 2400, height: 1600 });
  assert.deepEqual(computeExportDimensions(2400, 1600, 'square'), { width: 1080, height: 1080 });
  assert.deepEqual(computeExportDimensions(2400, 1600, 'youtube'), { width: 1920, height: 1080 });
  assert.deepEqual(computeExportDimensions(2400, 1600, 'reels'), { width: 1080, height: 1920 });
  assert.deepEqual(computeExportDimensions(2400, 1600, 'passport'), { width: 1050, height: 1350 });
});

test('computeContainRect centers source inside target frame with padding', () => {
  const rect = computeContainRect(1000, 500, 1000, 1000, 0.9);
  assert.equal(rect.width, 900);
  assert.equal(rect.height, 450);
  assert.equal(rect.x, 50);
  assert.equal(rect.y, 275);
});

test('computeCoverRect fills entire target frame', () => {
  const rect = computeCoverRect(1000, 1000, 1920, 1080);
  assert.equal(rect.width, 1920);
  assert.equal(rect.height, 1920);
  assert.equal(rect.x, 0);
  assert.equal(rect.y, -420);
});

test('buildCssFilterString returns none for neutral adjustments and valid string otherwise', () => {
  assert.equal(buildCssFilterString(DEFAULT_ADJUSTMENTS, 0), 'none');
  const filter = buildCssFilterString({ brightness: 115, contrast: 110, saturation: 90, warmth: 20 }, 12);
  assert.match(filter, /brightness\(115%\)/);
  assert.match(filter, /contrast\(110%\)/);
  assert.match(filter, /saturate\(90%\)/);
  assert.match(filter, /sepia\(/);
  assert.match(filter, /blur\(12px\)/);
});

test('formatBytes renders human readable units', () => {
  assert.equal(formatBytes(0), '0 KB');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(2048), '2.0 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.5), '2.50 MB');
});

test('hitTestTextLayer finds topmost matching text layer', () => {
  const layers: TextLayer[] = [
    {
      id: 't1',
      text: 'BACK',
      placement: 'behind',
      fontFamily: 'Cairo',
      fontSize: 120,
      color: '#111827',
      strokeWidth: 0,
      strokeColor: '#FFFFFF',
      shadow: false,
      rotation: 0,
      opacity: 1,
      xNorm: 0.5,
      yNorm: 0.3,
    },
    {
      id: 't2',
      text: 'FRONT',
      placement: 'front',
      fontFamily: 'Anton',
      fontSize: 140,
      color: '#FFFFFF',
      strokeWidth: 4,
      strokeColor: '#000000',
      shadow: true,
      rotation: 0,
      opacity: 1,
      xNorm: 0.5,
      yNorm: 0.3,
    },
  ];
  const hit = hitTestTextLayer(layers, 0.5, 0.3, 1000, 1000);
  assert.equal(hit?.id, 't2');
  assert.equal(hitTestTextLayer(layers, 0.05, 0.95, 1000, 1000), null);
});
