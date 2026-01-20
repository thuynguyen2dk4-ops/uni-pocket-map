import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; labelFull: string; flag: string }[] = [
    { code: 'vi', label: 'VI', labelFull: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'EN', labelFull: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="flex items-center bg-card rounded-2xl shadow-lg border-2 border-border overflow-hidden">
      {languages.map(({ code, label, labelFull, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300",
            language === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          title={labelFull}
        >
          <span className="text-lg">{flag}</span>
          <span className="font-bold">{label}</span>
          {language === code && (
            <motion.div
              layoutId="language-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

// Compact indicator for use in other parts of the app
export const LanguageIndicator = ({ className }: { className?: string }) => {
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 bg-muted/80 backdrop-blur-sm rounded-full text-xs font-medium text-muted-foreground",
      className
    )}>
      <Globe className="w-3 h-3" />
      <span>{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
    </div>
  );
};

// Badge showing current language - more prominent
export const LanguageBadge = ({ className }: { className?: string }) => {
  const { language } = useLanguage();
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary",
      className
    )}>
      <span className="text-base">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
      <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
    </div>
  );
};
