import React from 'react';
import Button from '@mui/material/Button';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function SecondaryButton({ children, onClick, className }: Props) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      className={clsx(
        'px-6 py-3 rounded-2xl bg-stone-900 text-white font-bold uppercase tracking-widest text-sm shadow-md hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer',
        className
      )}
    >
      {children}
    </Button>
  );
}
