import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  label: string;
  content: string;
  buttonText?: string;
  trigger?: 'click' | 'hover' | 'both';
  hideIcon?: boolean;
  buttonClassName?: string;
}

export default function InfoTooltip({
  label,
  content,
  buttonText,
  trigger = 'click',
  hideIcon = false,
  buttonClassName = '',
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 288,
  });
  const ref = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;
      const tooltipWidth = 288;
      const margin = 12;
      const nextPlacement: 'top' | 'bottom' = rect.top < 140 ? 'bottom' : 'top';
      setPlacement(nextPlacement);
      const left = Math.min(
        Math.max(rect.right - tooltipWidth, margin),
        window.innerWidth - tooltipWidth - margin
      );
      const top = nextPlacement === 'top' ? rect.top - 8 : rect.bottom + 8;
      setPosition({ top, left, width: tooltipWidth });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const onMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'both') {
      setOpen(true);
    }
  };

  const onMouseLeave = () => {
    if (trigger === 'hover' || trigger === 'both') {
      setOpen(false);
    }
  };

  const onToggle = () => {
    if (trigger === 'click' || trigger === 'both') {
      setOpen((v) => !v);
    }
  };

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={btnRef}
        className={`inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-800 transition-colors ${buttonClassName}`}
        aria-expanded={open}
        aria-label={label}
      >
        {buttonText && <span>{buttonText}</span>}
        {!hideIcon && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 text-xs font-bold">
            i
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed z-[9999] w-72 rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-xl"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
              transform: placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
            }}
          >
            <div className="flex items-start justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-1 leading-relaxed">{content}</div>
          </div>,
          document.body
        )}
    </div>
  );
}
