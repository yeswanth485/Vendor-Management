/**
 * VendorIQ Motion & Animation Design Tokens
 * Provides fluid micro-interactions and transitions across enterprise workflows
 */

export const pageVariants: any = {
  initial: { opacity: 0, y: 14 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.35,
    } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { 
      duration: 0.2, 
    } 
  }
};

export const staggerContainer: any = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

export const staggerItem: any = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3,
    } 
  }
};

export const cardHover: any = {
  whileHover: { 
    y: -2,
    transition: { duration: 0.15 } 
  }
};

export const buttonPress: any = {
  whileTap: { scale: 0.98 },
  whileHover: { scale: 1.01 }
};

export const modalBackdrop: any = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const modalContent: any = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.25 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 8, 
    transition: { duration: 0.15 } 
  }
};

export const drawerSlideRight: any = {
  initial: { x: '100%', opacity: 0.8 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: '100%', opacity: 0.8, transition: { duration: 0.2 } }
};

export const badgePulse: any = {
  initial: { scale: 0.9, opacity: 0.8 },
  animate: { 
    scale: [0.9, 1.05, 1],
    opacity: 1,
    transition: { duration: 0.4 } 
  }
};
