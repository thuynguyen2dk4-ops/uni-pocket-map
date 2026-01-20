import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; labelFull: string; flag: string }[] = [
    { code: 'vi', label: 'VI', labelFull: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'EN', labelFull: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="flex items-center bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {languages.map(({ code, label, labelFull, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200",
            language === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          title={labelFull}
        >
          <span className="text-base">{flag}</span>
          <span className="hidden sm:inline font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
};
