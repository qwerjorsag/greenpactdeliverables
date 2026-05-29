import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  themeColor?: 'yellow' | 'stone' | 'blue';
};

export default function ConsentRow({ checked, onChange, label, themeColor = 'yellow' }: Props) {
  const accent = themeColor === 'yellow' ? '#facc15' : themeColor === 'blue' ? '#3b82f6' : '#0f172a';
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          sx={{
            color: '#d6d3d1',
            '&.Mui-checked': {
              color: accent,
            },
          }}
        />
      }
      label={label}
      sx={{ color: '#44403c' }}
    />
  );
}
