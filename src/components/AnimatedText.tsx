import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
}

export const AnimatedText = ({ children, className = '', as = 'span' }: AnimatedTextProps) => {
  const { language } = useLanguage();
  const Component = motion[as];

  return (
    <AnimatePresence mode="wait">
      <Component
        key={language + String(children)}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ 
          duration: 0.25, 
          ease: [0.4, 0, 0.2, 1]
        }}
        className={className}
      >
        {children}
      </Component>
    </AnimatePresence>
  );
};

// For longer content blocks
export const AnimatedBlock = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const { language } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={language}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ 
          duration: 0.2, 
          ease: 'easeOut'
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
