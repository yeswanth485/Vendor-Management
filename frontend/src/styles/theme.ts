/**
 * VendorIQ Color Palette & Design Tokens
 * Upgrades flat monochrome grey to rich modern enterprise indigo, violet, emerald, and amber
 */

export const theme = {
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5', // Primary brand action
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    status: {
      success: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200/80',
        dot: 'bg-emerald-500',
      },
      warning: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200/80',
        dot: 'bg-amber-500',
      },
      danger: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200/80',
        dot: 'bg-rose-500',
      },
      info: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200/80',
        dot: 'bg-indigo-500',
      },
    },
    gradients: {
      brand: 'from-indigo-600 via-indigo-700 to-blue-700',
      brandDark: 'from-slate-950 via-slate-900 to-indigo-950',
      cardHover: 'hover:shadow-md hover:border-indigo-200/70',
      subtleGlass: 'bg-white/90 backdrop-blur-md border border-slate-200/80',
    }
  }
};
