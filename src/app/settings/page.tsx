'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService, DEFAULT_SETTINGS, type UserSettings } from '@/features/profile';
import { getActiveProgressStore, getActiveStorageAdapter, STORAGE_KEY, type UserProgressProfile } from '@/features/progress';
import { deleteUser } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

const GUEST_SETTINGS_KEY = 'asar:guestSettings';

function loadGuestSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(GUEST_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SettingsContent() {
  const router = useRouter();
  const { status, user, profile, signOutUser, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setSettings(status === 'signed-in' && profile ? profile.settings : loadGuestSettings());
  }, [status, profile]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };

  const persistSettings = async (next: UserSettings) => {
    setSettings(next);
    if (status === 'signed-in' && user) {
      await ProfileService.updateSettings(user.uid, next);
      await refreshProfile();
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(next));
    }
  };

  const handleResetProgress = async () => {
    await getActiveProgressStore().reset();
    setConfirmingReset(false);
    showToast('Progress reset.');
  };

  const handleExport = async () => {
    const profileData = await getActiveProgressStore().getProfile();
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anime-skill-ar-trainer-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported.');
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as UserProgressProfile;
      if (typeof parsed.totalXP !== 'number' || !Array.isArray(parsed.completedSkillIds)) {
        throw new Error('That file doesn\u2019t look like a progress export.');
      }
      await getActiveStorageAdapter().setItem(STORAGE_KEY, parsed);
      showToast('Progress imported.');
    } catch {
      showToast('Could not import that file.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await getActiveProgressStore().reset();
      const currentUser = getFirebaseAuth().currentUser;
      if (currentUser) await deleteUser(currentUser);
      router.push('/');
    } catch {
      showToast('Please sign in again, then retry deleting your account.');
      await signOutUser();
      router.push('/login');
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            {status === 'guest'
              ? 'Browsing as guest — settings are saved on this device only.'
              : 'Synced to your account.'}
          </p>

          <div className="mt-8 flex flex-col gap-6">
            <Section title="Camera">
              <ToggleRow
                label="Front-facing camera"
                checked={settings.cameraFacingMode === 'user'}
                onChange={(checked) =>
                  persistSettings({ ...settings, cameraFacingMode: checked ? 'user' : 'environment' })
                }
              />
            </Section>

            <Section title="Audio">
              <ToggleRow
                label="Sound effects"
                checked={settings.soundEnabled}
                onChange={(checked) => persistSettings({ ...settings, soundEnabled: checked })}
              />
            </Section>

            <Section title="Graphics Quality">
              <SelectRow
                value={settings.graphicsQuality}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ]}
                onChange={(value) =>
                  persistSettings({ ...settings, graphicsQuality: value as UserSettings['graphicsQuality'] })
                }
              />
            </Section>

            <Section title="Theme">
              <SelectRow
                value={settings.theme}
                options={[
                  { value: 'dark', label: 'Dark (Cyberpunk)' },
                  { value: 'light', label: 'Light (coming soon)' },
                ]}
                onChange={(value) => persistSettings({ ...settings, theme: value as UserSettings['theme'] })}
              />
            </Section>

            <Section title="Language">
              <SelectRow
                value={settings.language}
                options={[{ value: 'en', label: 'English' }]}
                onChange={(value) => persistSettings({ ...settings, language: value })}
              />
            </Section>

            <Section title="Progress Data">
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExport} className="btn-ghost !py-2 text-sm">
                  Export Progress
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn-ghost !py-2 text-sm">
                  Import Progress
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = '';
                  }}
                />
                {!confirmingReset ? (
                  <button
                    onClick={() => setConfirmingReset(true)}
                    className="btn-ghost !py-2 text-sm text-neon-orange"
                  >
                    Reset Progress
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleResetProgress} className="btn-ghost !py-2 text-sm text-neon-red">
                      Confirm Reset
                    </button>
                    <button onClick={() => setConfirmingReset(false)} className="text-sm text-muted hover:text-white">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </Section>

            {status === 'signed-in' && (
              <Section title="Danger Zone">
                {!confirmingDelete ? (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="rounded-xl border border-neon-red/40 px-4 py-2 text-sm font-semibold text-neon-red hover:bg-neon-red/10"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="rounded-xl border border-neon-red/40 bg-neon-red/10 p-4">
                    <p className="text-sm text-white">
                      This permanently deletes your account and all cloud progress. This can&apos;t be undone.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={handleDeleteAccount} className="btn-primary !py-2 text-sm !bg-neon-red">
                        Yes, Delete My Account
                      </button>
                      <button onClick={() => setConfirmingDelete(false)} className="text-sm text-muted hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Section>
            )}
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-neon-cyan/40 bg-surface px-5 py-2.5 text-sm text-white shadow-glow">
            {toast}
          </div>
        )}
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-xl border border-white/10 p-5">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-white/85">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="relative h-5 w-9 cursor-pointer appearance-none rounded-full bg-white/20 transition-colors before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:bg-neon-blue checked:before:translate-x-4"
      />
    </label>
  );
}

function SelectRow({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
