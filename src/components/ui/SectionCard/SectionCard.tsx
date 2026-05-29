import React from 'react';
import Paper from '@mui/material/Paper';
import clsx from 'clsx';

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function SectionCard({ children, className }: Props) {
  return (
    <Paper
      elevation={0}
      className={clsx('gp-card', className)}
    >
      {children}
    </Paper>
  );
}
