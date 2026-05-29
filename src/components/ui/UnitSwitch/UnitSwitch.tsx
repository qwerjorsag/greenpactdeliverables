import React from 'react';
import clsx from 'clsx';

type Props = {
  checked: boolean;
  onToggle: () => void;
  label: string;
  color?: 'yellow' | 'blue' | 'stone';
  className?: string;
  ariaLabel?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function UnitSwitch({
  checked,
  onToggle,
  label,
  color = 'yellow',
  className,
  ariaLabel,
  ...rest
}: Props) {
  const activeColor =
    color === 'blue' ? 'bg-blue-600' : color === 'stone' ? 'bg-stone-700' : 'bg-yellow-400';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={ariaLabel ?? label}
      className={clsx('flex items-center gap-3 text-sm text-stone-700 cursor-pointer', className)}
      {...rest}
    >
      <span
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? activeColor : 'bg-stone-300'
        )}
      >
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
