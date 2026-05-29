import React from 'react';
import Typography from '@mui/material/Typography';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionTitle({ children, className }: Props) {
  return (
    <Typography
      variant="h6"
      className={className}
      sx={{ fontWeight: 700, color: 'text.primary' }}
    >
      {children}
    </Typography>
  );
}
