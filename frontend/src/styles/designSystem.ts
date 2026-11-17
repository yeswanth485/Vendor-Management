/**
 * VendorIQ Design System
 * Brand Colors: Ink Black (#0B0D0C), Silver Glass (#C7D0CE), Electric Lime (#C6F135)
 */

export const designTokens = {
  colors: {
    // Brand Colors (Mandatory)
    inkBlack: '#0B0D0C',
    silverGlass: '#C7D0CE',
    electricLime: '#C6F135',

    // Backgrounds
    bg: {
      primary: '#0B0D0C',
      secondary: '#111312',
      elevated: '#151817',
      card: '#1A1D1C',
      overlay: 'rgba(11, 13, 12, 0.85)',
    },

    // Surfaces & Glassmorphism
    surface: {
      glass: 'rgba(199, 208, 206, 0.08)',
      glassStrong: 'rgba(199, 208, 206, 0.12)',
      glassBorder: 'rgba(199, 208, 206, 0.18)',
      glassHighlight: 'rgba(199, 208, 206, 0.04)',
    },

    // Text
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(199, 208, 206, 0.85)',
      muted: 'rgba(199, 208, 206, 0.55)',
      inverse: '#0B0D0C',
      accent: '#C6F135',
    },

    // Status Colors
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#7C2D12',
    },

    // Electric Lime Variants
    lime: {
      primary: '#C6F135',
      hover: '#D4FF40',
      active: '#B0D82E',
      muted: 'rgba(198, 241, 53, 0.12)',
      glow: 'rgba(198, 241, 53, 0.35)',
      text: '#0B0D0C',
    },

    // Gradients
    gradients: {
      hero: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(199, 208, 206, 0.06) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(198, 241, 53, 0.08) 0%, transparent 50%)',
      card: 'linear-gradient(135deg, rgba(199, 208, 206, 0.06) 0%, rgba(199, 208, 206, 0.02) 100%)',
      button: 'linear-gradient(135deg, #C6F135 0%, #B0D82E 100%)',
      buttonHover: 'linear-gradient(135deg, #D4FF40 0%, #C6F135 100%)',
      border: 'linear-gradient(135deg, rgba(199, 208, 206, 0.25) 0%, rgba(199, 208, 206, 0.08) 100%)',
      accent: 'linear-gradient(90deg, #C6F135 0%, #8FD14E 100%)',
    },

    // Shadows
    shadows: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      sm: '0 2px 8px -2px rgba(0, 0, 0, 0.4)',
      md: '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
      lg: '0 16px 48px -8px rgba(0, 0, 0, 0.5)',
      xl: '0 24px 64px -12px rgba(0, 0, 0, 0.55)',
      glowLime: '0 0 32px rgba(198, 241, 53, 0.25)',
      glowLimeSm: '0 0 16px rgba(198, 241, 53, 0.15)',
      inner: 'inset 0 1px 0 rgba(199, 208, 206, 0.1)',
    },
  },

  typography: {
    families: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, "Fira Code", "SF Mono", monospace',
      display: 'Space Grotesk, Inter, system-ui, sans-serif',
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    sizes: {
      xs: '0.6875rem',    // 11px
      sm: '0.75rem',      // 12px
      base: '0.875rem',   // 14px
      lg: '1rem',         // 16px
      xl: '1.125rem',     // 18px
      '2xl': '1.25rem',   // 20px
      '3xl': '1.5rem',    // 24px
      '4xl': '2rem',      // 32px
      '5xl': '2.5rem',    // 40px
      '6xl': '3.5rem',    // 56px
      '7xl': '4.5rem',    // 72px
    },
    lineHeights: {
      tight: 1.1,
      snug: 1.35,
      normal: 1.55,
      relaxed: 1.7,
    },
  },

  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  transitions: {
    fast: '120ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
    slower: '400ms cubic-bezier(0.16, 1, 0.3, 1)',
  },

  easings: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
  },

  motion: {
    durations: {
      instant: '0ms',
      fast: '120ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      page: '500ms',
    },
    stagger: {
      fast: '0.03s',
      normal: '0.05s',
      slow: '0.08s',
    },
  },

  breakpoints: {
    sm: '390px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
  },

  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '36px',
        md: '44px',
        lg: '52px',
        xl: '60px',
      },
      padding: {
        sm: '0 16px',
        md: '0 24px',
        lg: '0 32px',
        xl: '0 40px',
      },
      fontSize: {
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.125rem',
      },
    },
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px',
      },
    },
    input: {
      height: '44px',
      padding: '0 16px',
      fontSize: '0.875rem',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;

// Tailwind CSS custom properties generator
export function generateCSSVariables(): string {
  const tokens = designTokens;
  let css = ':root {\n';

  // Colors
  css += `  --color-ink-black: ${tokens.colors.inkBlack};\n`;
  css += `  --color-silver-glass: ${tokens.colors.silverGlass};\n`;
  css += `  --color-electric-lime: ${tokens.colors.electricLime};\n`;

  // Backgrounds
  Object.entries(tokens.colors.bg).forEach(([key, value]) => {
    css += `  --color-bg-${key}: ${value};\n`;
  });

  // Surfaces
  Object.entries(tokens.colors.surface).forEach(([key, value]) => {
    css += `  --color-surface-${key}: ${value};\n`;
  });

  // Text
  Object.entries(tokens.colors.text).forEach(([key, value]) => {
    css += `  --color-text-${key}: ${value};\n`;
  });

  // Status
  Object.entries(tokens.colors.status).forEach(([key, value]) => {
    css += `  --color-status-${key}: ${value};\n`;
  });

  // Lime variants
  Object.entries(tokens.colors.lime).forEach(([key, value]) => {
    css += `  --color-lime-${key}: ${value};\n`;
  });

  // Gradients
  Object.entries(tokens.colors.gradients).forEach(([key, value]) => {
    css += `  --gradient-${key}: ${value};\n`;
  });

  // Shadows
  Object.entries(tokens.colors.shadows).forEach(([key, value]) => {
    css += `  --shadow-${key}: ${value};\n`;
  });

  // Typography
  Object.entries(tokens.typography.families).forEach(([key, value]) => {
    css += `  --font-${key}: ${value};\n`;
  });

  css += '}\n';
  return css;
}

// Motion variants for Framer Motion
export const motionVariants = {
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    },
    exit: { 
      opacity: 0, 
      y: -12, 
      transition: { duration: 0.25, ease: [0.7, 0, 0.84, 0] } 
    },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 16 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } 
    },
  },
  cardHover: {
    whileHover: { 
      y: -4,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
    },
  },
  buttonPress: {
    whileTap: { scale: 0.97 },
    whileHover: { scale: 1.015 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.35 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  },
  counter: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.1 } },
  },
};

export const reducedMotionVariants = {
  page: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
    exit: { opacity: 0, transition: { duration: 0.01 } },
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0 } },
  },
  staggerItem: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.01 } },
  },
  cardHover: { whileHover: {} },
  buttonPress: { whileTap: {}, whileHover: {} },
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } } },
  slideUp: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } } },
  slideInLeft: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } } },
  slideInRight: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } } },
  scaleIn: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.01 } } },
};