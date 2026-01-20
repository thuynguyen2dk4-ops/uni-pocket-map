import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setMapboxToken } from '@/lib/mapboxToken';
import { useLanguage } from '@/i18n/LanguageContext';

interface MapboxTokenPromptProps {
  onSaved: (token: string) => void;
}

export const MapboxTokenPrompt = ({ onSaved }: MapboxTokenPromptProps) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSave = () => {
    const tokenValue = token.trim();
    if (!tokenValue) {
      setError(t('tokenEmptyError'));
      return;
    }
    // Mapbox public tokens usually start with "pk." (but we won't strictly enforce)
    if (tokenValue.length < 20) {
      setError(t('tokenTooShortError'));
      return;
    }

    setError(null);
    setMapboxToken(tokenValue);
    onSaved(tokenValue);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="font-semibold text-foreground">{t('mapboxTokenRequired')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('mapboxTokenInstructions')}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t('tokenPlaceholder')}
          aria-label="Mapbox Access Token"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSave} className="w-full">
          {t('saveTokenAndLoad')}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t('tokenSavedInBrowser')}
        </p>
      </div>
    </div>
  );
};
