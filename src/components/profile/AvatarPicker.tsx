'use client';

import { useRef, useState } from 'react';
import { AVATAR_PRESETS } from '@/features/profile';

interface AvatarPickerProps {
  avatarURL: string | null;
  avatarPresetId: string | null;
  onUpload: (file: File) => Promise<void>;
  onSelectPreset: (presetId: string) => void;
}

export function AvatarPicker({ avatarURL, avatarPresetId, onUpload, onSelectPreset }: AvatarPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that image.');
    } finally {
      setUploading(false);
    }
  };

  const activePreset = AVATAR_PRESETS.find((p) => p.id === avatarPresetId);

  return (
    <div>
      <div className="flex items-center gap-4">
        {avatarURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarURL} alt="" className="h-16 w-16 rounded-full border border-white/15 object-cover" />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-background"
            style={{
              background: `linear-gradient(135deg, ${activePreset?.from ?? '#3ec6ff'}, ${activePreset?.to ?? '#a855f7'})`,
            }}
          >
            {activePreset?.glyph ?? '?'}
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-ghost !py-2 text-sm disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-neon-red">{error}</p>}

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        Or choose a preset
      </p>
      <div className="flex flex-wrap gap-2">
        {AVATAR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-background transition-transform hover:scale-110 ${
              avatarPresetId === preset.id && !avatarURL ? 'ring-2 ring-white' : ''
            }`}
            style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
            title={preset.label}
          >
            {preset.glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
