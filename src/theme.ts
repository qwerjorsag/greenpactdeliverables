import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#facc15' },
    secondary: { main: '#0f172a' },
    text: { primary: '#1c1917', secondary: '#78716c' },
  },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontWeight: 700,
        },
      },
    },
  },
});

export default theme;
