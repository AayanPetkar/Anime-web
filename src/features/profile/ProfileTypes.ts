// Shared types for the user-profile feature (distinct from training progress,
// which stays in features/progress — this is account/identity data).

export interface UserSettings {
  cameraFacingMode: 'user' | 'environment';
  soundEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  theme: 'dark' | 'light';
  language: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  cameraFacingMode: 'user',
  soundEnabled: true,
  graphicsQuality: 'high',
  theme: 'dark',
  language: 'en',
};

export interface UserProfileDoc {
  uid: string;
  username: string;
  displayName: string;
  email: string | null;
  avatarURL: string | null;
  avatarPresetId: string | null;
  favoriteAnime: string | null;
  settings: UserSettings;
  streakCount: number;
  /** ISO calendar date (yyyy-mm-dd) of the last day the user completed a
   * session — used to compute the streak without a separate collection. */
  lastPracticeDate: string | null;
  createdAt: string;
}
