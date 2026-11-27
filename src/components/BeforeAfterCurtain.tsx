'use client';

import React, { useRef, useState, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterCurtainProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
  aspectRatio?: number;
}

export function BeforeAfterCurtain({
  beforeUrl,
  afterUrl,
  beforeLabel,
  afterLabel,
  aspectRatio,
}: BeforeAfterCurtainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    setSplitPct(Math.max(2, Math.min(98, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  return (
    <div
      ref={containerRef}
      dir="ltr"
      role="slider"
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(splitPct)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setSplitPct((p) => Math.max(2, p - 4));
        if (e.key === 'ArrowRight') setSplitPct((p) => Math.min(98, p + 4));
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-testid="before-after-curtain"
      className="relative mx-auto max-w-full select-none overflow-hidden rounded-xl border border-[#E5E7EB] studio-checkerboard cursor-ew-resize touch-none shadow-sm"
      style={{
        aspectRatio: aspectRatio && Number.isFinite(aspectRatio) ? `${aspectRatio}` : '4 / 3',
        height: 'min(540px, 68vw)',
      }}
    >
      {/* After (cutout) full layer over checkerboard */}
      <img
        src={afterUrl}
        alt={afterLabel}
        referrerPolicy="no-referrer"
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain pointer-events-none"
      />

      {/* Before (original) clipped from left up to splitPct */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          referrerPolicy="no-referrer"
          draggable={false}
          className="h-full w-full object-contain bg-[#F3F4F6]"
        />
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#111827] border border-[#E5E7EB] shadow-xs">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-md bg-[#0D9488] px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
        {afterLabel}
      </span>

      {/* Divider line & circular handle */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(15,23,42,0.4)]"
        style={{ left: `${splitPct}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#111827] border border-[#E5E7EB] shadow-md">
          <MoveHorizontal className="w-4 h-4 text-[#0D9488]" />
        </div>
      </div>
    </div>
  );
}
