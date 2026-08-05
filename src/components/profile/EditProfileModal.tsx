'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarPicker } from './AvatarPicker';
import { FormField } from '@/components/auth';
import { ProfileService, validateUsername, type UserProfileDoc } from '@/features/profile';
import { allSkills } from '@/data/skills';

interface EditProfileModalProps {
  uid: string;
  profile: UserProfileDoc;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const FAVORITE_ANIME_OPTIONS = Array.from(new Set(allSkills.map((s) => s.anime)));

export function EditProfileModal({ uid, profile, open, onClose, onSaved }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [favoriteAnime, setFavoriteAnime] = useState(profile.favoriteAnime ?? '');
  const [avatarURL, setAvatarURL] = useState(profile.avatarURL);
  const [avatarPresetId, setAvatarPresetId] = useState(profile.avatarPresetId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (file: File) => {
    const url = await ProfileService.uploadAvatar(uid, file);
    setAvatarURL(url);
    setAvatarPresetId(null);
  };

  const handleSelectPreset = async (presetId: string) => {
    setAvatarPresetId(presetId);
    setAvatarURL(null);
    await ProfileService.updateProfile(uid, { avatarPresetId: presetId, avatarURL: null });
  };

  const handleSave = async () => {
    setError(null);
    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      setError(usernameResult.message!);
      return;
    }
    setSaving(true);
    try {
      await ProfileService.updateProfile(uid, {
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        favoriteAnime: favoriteAnime || null,
      });
      onSaved();
      onClose();
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/85 p-6 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-display text-lg font-bold text-white">Edit Profile</h3>

            <div className="mt-5 flex flex-col gap-4">
              <AvatarPicker
                avatarURL={avatarURL}
                avatarPresetId={avatarPresetId}
                onUpload={handleUpload}
                onSelectPreset={handleSelectPreset}
              />

              <FormField id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <FormField
                id="displayName"
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted">Favorite Anime</label>
                <select
                  value={favoriteAnime}
                  onChange={(e) => setFavoriteAnime(e.target.value)}
                  className="rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                >
                  <option value="">None selected</option>
                  {FAVORITE_ANIME_OPTIONS.map((anime) => (
                    <option key={anime} value={anime}>
                      {anime}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-neon-red">{error}</p>}

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 !py-2.5 text-sm disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={onClose} className="btn-ghost !py-2.5 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
