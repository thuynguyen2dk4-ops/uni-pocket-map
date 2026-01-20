import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; labelFull: string; flag: string }[] = [
    { code: 'vi', label: 'VI', labelFull: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'EN', labelFull: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="flex items-center bg-card rounded-2xl shadow-lg border-2 border-border overflow-hidden">
      {languages.map(({ code, label, labelFull, flag }) => (
        <motion.button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
            language === code
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={labelFull}
          whileTap={{ scale: 0.95 }}
        >
          {/* Active background */}
          {language === code && (
            <motion.div
              layoutId="language-active-bg"
              className="absolute inset-0 bg-primary"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          
          {/* Content */}
          <motion.span 
            className="relative z-10 text-lg"
            animate={{ 
              scale: language === code ? 1.1 : 1,
              rotate: language === code ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {flag}
          </motion.span>
          <span className="relative z-10 font-bold">{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Compact indicator with animation
export const LanguageIndicator = ({ className }: { className?: string }) => {
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 bg-muted/80 backdrop-blur-sm rounded-full text-xs font-medium text-muted-foreground overflow-hidden",
      className
    )}>
      <Globe className="w-3 h-3" />
      <AnimatePresence mode="wait">
        <motion.span
          key={language}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// Badge showing current language - more prominent with animation
export const LanguageBadge = ({ className }: { className?: string }) => {
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary overflow-hidden",
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={language}
          initial={{ opacity: 0, x: -10, rotate: -20 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: 10, rotate: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center gap-1.5"
        >
          <span className="text-base">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
          <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
