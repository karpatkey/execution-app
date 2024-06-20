import { ThemeOptions, createTheme } from '@mui/material/styles'

// Create a theme instance.
const theme = createTheme({
  zIndex: {
    drawer: 1200,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 800,
      md: 900,
      lg: 1200,
      xl: 1500,
    },
  },
  typography: {
    fontFamily: 'IBM Plex Mono',
    h1: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '2rem',
      lineHeight: '1.1em',
      fontWeight: '400',
      fontStyle: 'normal',
    },
    h2: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '1.5rem',
      lineHeight: '1.1em',
      fontWeight: '400',
      fontStyle: 'normal',
    },
    h3: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '24px',
      lineHeight: '28px',
      fontWeight: '300',
      fontStyle: 'normal',
    },
    h4: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '18px',
      lineHeight: '22px',
      fontWeight: '400',
      fontStyle: 'normal',
    },
    body1: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '0.9rem',
      lineHeight: '1em',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    body2: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '0.9rem',
      lineHeight: '1.2em',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    subtitle1: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '0.8rem',
      lineHeight: '1.2em',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    subtitle2: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '0.7rem',
      lineHeight: '1.2em',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    button: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '700 !important',
      fontSize: '1rem',
      lineHeight: '1.1em',
    },
    filterTitle: {
      fontFamily: 'IBM Plex Mono',
      fontSize: '1rem',
      lineHeight: '1.1rem',
      fontWeight: '600 !important',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    filterTextOption: {
      fontFamily: 'IBM Plex Sans',
      fontSize: '1rem',
      lineHeight: '1.2em',
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#1A1A1A',
    },
    filterTextRenderInput: {
      fontFamily: 'IBM Plex Sans',
      fontSize: '1rem',
      lineHeight: '1.1em',
      fontWeight: '400 !important',
      fontStyle: 'normal',
      color: '#808080',
    },
    filterErrorMessage: {
      fontFamily: 'IBM Plex Sans',
      fontStyle: 'normal',
      fontWeight: '400 !important',
      fontSize: '1rem',
      lineHeight: '1.1em',
      color: '#D55353',
    },
    paperSectionTitle: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '500 !important',
      fontSize: '44px',
      lineHeight: '44px',
      color: '#1A1A1A',
    },
    paperSectionSubtitle: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '700 !important',
      fontSize: '1.1rem',
      lineHeight: '1.2rem',
      color: '#1A1A1A',
    },
    heroSectionTitle: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '500 !important',
      fontSize: '2rem',
      lineHeight: '2.2rem',
      color: '#222222',
    },
    heroSectionSubtitle: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '600 !important',
      fontSize: '2rem',
      lineHeight: '2.2rem',
      color: '#222222',
    },
    infoCardTitle: {
      fontFamily: 'IBM Plex Sans',
      fontStyle: 'normal',
      fontWeight: '600 !important',
      fontSize: '1rem',
      lineHeight: '1.2rem',
      color: '#222222',
    },
    infoCardValue: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '600 !important',
      fontSize: '2rem',
      lineHeight: '2.1rem',
      color: '#222222',
    },
    pieChartLegendTitle: {
      fontFamily: 'IBM Plex Sans',
      fontStyle: 'normal',
      fontWeight: '400 !important',
      fontSize: '18px',
      lineHeight: '23px',
      color: '#1A1A1A',
    },
    balanceOverviewSubtitle: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '700 !important',
      fontSize: '1.1rem',
      lineHeight: '1.2rem',
      color: '#1A1A1A',
    },
    balanceOverviewOptionType: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '700 !important',
      fontSize: '20px',
      lineHeight: '24px',
      color: '#1A1A1A',
    },
    tableCellSubData: {
      fontFamily: 'IBM Plex Mono',
      fontStyle: 'normal',
      fontWeight: '400 !important',
      fontSize: '14px',
      lineHeight: '18px',
      color: '#1A1A1A',
    },
    farmSwapsValue: {
      fontFamily: 'IBM Plex Sans',
      fontStyle: 'normal',
      fontWeight: '700 !important',
      fontSize: '1rem',
      lineHeight: '1.1rem',
      color: '#1A1A1A',
    },
  },
  palette: {
    background: {
      default: '#eeeded',
      paper: '#eeeded',
    },
    primary: {
      main: '#232323',
    },
    secondary: {
      main: '#6B6B6B',
    },
    error: {
      main: '#DF5C64',
    },
    warning: {
      main: '#F0B065',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#54B9A1',
    },
    common: {
      black: '#232323',
      white: '#eeeded',
    },
    custom: {
      // black: {
      //   primary: '#1A1A1A',
      // },
      // grey: {
      //   primary: '#808080',
      //   secondary: '#7A7A7A',
      //   dark: '#222222',
      //   light: '#F5F5F5',
      // },
      // error: '#D55353',
    },
  },
  components: {
    // Name of the component
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          fontFamily: 'IBM Plex Sans',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: '1rem',
          lineHeight: '1.2em',
          color: '#222222',
        },
        listbox: {
          backgroundColor: '#F5F5F5',
        },
        option: {
          fontFamily: 'IBM Plex Sans',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '18px',
          lineHeight: '22px',
          color: '#808080',
          '& img': {
            opacity: '0.3',
          },
          '&[aria-selected="true"]': {
            fontWeight: 600,
            color: '#222222',
            backgroundColor: '#F5F5F5 !important',
          },
          '&[aria-selected="true"] img': {
            opacity: '1',
          },
          '&:hover': {
            fontWeight: 600,
            color: '#222222',
          },
          '&:hover img': {
            opacity: '1',
          },
          '&.Mui-focused': {
            backgroundColor: '#F5F5F5 !important', // Sadly, this is necessary
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          animation: 'none !important',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          animation: 'none !important',
          textDecoration: 'none',
          fontFamily: 'IBM Plex Mono',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '24px',
          lineHeight: '30px',
          letterSpacing: '0.25px',
          color: '#7A7A7A',
          backgroundColor: '#eeeded',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          backgroundColor: '#eeeded',
          ':hover': {
            backgroundColor: '#eeeded',
            '& svg': {
              color: '#1A1A1A',
            },
            '& .MuiListItemText-primary': {
              color: '#1A1A1A',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // fontFamily: 'IBM Plex Mono',
          // fontStyle: 'normal',
          // fontWeight: 700,
          // fontSize: '16px',
          // lineHeight: '18px',
          // color: '#EEEDED',
          // background: '#1A1A1A',
          textTransform: 'none',
          borderRadius: '50px',
          '&:hover': {
            // background: '#222222',
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          background: '#D8D8D8',
          border: '1px solid #1A1A1A',
          borderRadius: '4px',
          button: {
            fontFamily: 'IBM Plex Sans',
            fontStyle: 'normal',
            fontWeight: '400 !important',
            fontSize: '18px',
            lineHeight: '22px',
            color: '#1A1A1A',
            textTransform: 'none',
            border: 'none',
            '&[aria-pressed="true"]': {
              color: '#1A1A1A',
              backgroundColor: '#eeeded',
              fontWeight: '700 !important',
            },
            '&[aria-pressed="false"]': {
              color: '#7A7A7A',
            },
          },
        },
      },
    },
  },
} as ThemeOptions)

declare module '@mui/material/styles' {
  interface TypographyVariants {
    filterTitle: React.CSSProperties
    filterTextOption: React.CSSProperties
    filterTextRenderInput: React.CSSProperties
    filterErrorMessage: React.CSSProperties
    paperSectionTitle: React.CSSProperties
    paperSectionSubtitle: React.CSSProperties
    heroSectionTitle: React.CSSProperties
    heroSectionSubtitle: React.CSSProperties
    infoCardTitle: React.CSSProperties
    infoCardValue: React.CSSProperties
    pieChartLegendTitle: React.CSSProperties
    balanceOverviewSubtitle: React.CSSProperties
    balanceOverviewOptionType: React.CSSProperties
    tableCellSubData: React.CSSProperties
    farmSwapsValue: React.CSSProperties
  }

  // allow configuration using `createMuiTheme`
  interface TypographyVariantsOptions {
    filterTitle?: React.CSSProperties
    filterTextOption?: React.CSSProperties
    filterTextRenderInput?: React.CSSProperties
    filterErrorMessage?: React.CSSProperties
    paperSectionTitle?: React.CSSProperties
    paperSectionSubtitle?: React.CSSProperties
    heroSectionTitle?: React.CSSProperties
    heroSectionSubtitle?: React.CSSProperties
    infoCardTitle?: React.CSSProperties
    infoCardValue?: React.CSSProperties
    pieChartLegendTitle?: React.CSSProperties
    balanceOverviewSubtitle?: React.CSSProperties
    balanceOverviewOptionType?: React.CSSProperties
    tableCellSubData?: React.CSSProperties
    farmSwapsValue?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    filterTitle: true
    filterTextOption: true
    filterTextRenderInput: true
    filterErrorMessage: true
    paperSectionTitle: true
    paperSectionSubtitle: true
    heroSectionTitle: true
    heroSectionSubtitle: true
    infoCardTitle: true
    infoCardValue: true
    pieChartLegendTitle: true
    balanceOverviewSubtitle: true
    balanceOverviewOptionType: true
    tableCellSubData: true
    farmSwapsValue: true
  }
}

export const SUMMARY_COLORS = [
  '#383838',
  '#696969',
  '#989898',
  '#B0B0B0',
  '#C0C0C0',
  '#DEDEDE',
  '#E0E0E0',
  '#F0F0F0',
  '#F8F8F8',
]

export const WALLET_COLORS = [
  '#111111',
  '#222222',
  '#333333',
  '#444444',
  '#555555',
  '#666666',
  '#777777',
  '#888888',
  '#999999',
  '#aaaaaa',
  '#bbbbbb',
  '#cccccc',
  '#dddddd',
  '#eeeeee',
]

export default theme
