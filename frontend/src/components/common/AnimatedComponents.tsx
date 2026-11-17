import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants, cardHover, buttonPress, staggerItem } from '../../lib/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  tabKey?: string;
}

export function AnimatedPage({ children, className = '', tabKey }: AnimatedPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedCard({ children, className = '', onClick }: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardHover}
      whileHover="whileHover"
      className={`bg-white rounded-lg border border-slate-200/90 shadow-2xs card-interactive ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  keyId?: string;
  onClick?: () => void;
}

export function AnimatedListItem({ children, className = '', keyId, onClick }: AnimatedListItemProps) {
  return (
    <motion.div
      key={keyId}
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export function AnimatedButton({ children, className = '', onClick, disabled, type = 'button', title }: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      variants={buttonPress}
      whileTap="whileTap"
      whileHover="whileHover"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {children}
    </motion.button>
  );
}
