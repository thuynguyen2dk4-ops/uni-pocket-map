import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { setMapboxToken } from '@/lib/mapboxToken';

interface MapboxTokenPromptProps {
  onSaved: (token: string) => void;
}

export const MapboxTokenPrompt = ({ onSaved }: MapboxTokenPromptProps) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const t = token.trim();
    if (!t) {
      setError('Vui lòng dán Mapbox Access Token');
      return;
    }
    // Mapbox public tokens usually start with "pk." (but we won't strictly enforce)
    if (t.length < 20) {
      setError('Token có vẻ chưa đúng (quá ngắn)');
      return;
    }

    setError(null);
    setMapboxToken(t);
    onSaved(t);
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="font-semibold text-foreground">Cần Mapbox Token để xem bản đồ</p>
        <p className="text-sm text-muted-foreground mt-1">
          Dán <span className="font-medium text-foreground">Access Token</span> của bạn (public token) để chạy demo ngay.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="pk.eyJ1Ijoi..."
          aria-label="Mapbox Access Token"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSave} className="w-full">
          Lưu token & tải bản đồ
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Token sẽ được lưu trong trình duyệt (localStorage).
        </p>
      </div>
    </div>
  );
};
