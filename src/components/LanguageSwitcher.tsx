import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'VI', flag: '🇻🇳' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
  ];

  return (
    <div className="flex items-center gap-1 bg-card rounded-xl p-1 shadow-lg border border-border">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-all",
            language === code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <span>{flag}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
