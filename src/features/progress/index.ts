// Progress & persistence (Step 7): abstract storage, XP/rank/history tracking,
// and rank calculation. localStorage today; swap StorageAdapter for Firebase
// later without touching ProgressStore or any UI.
export * from './ProgressTypes';
export * from './StorageAdapter';
export * from './RankCalculator';
export * from './ProgressStore';
export * from './FirebaseStorageAdapter';
export * from './StorageFactory';
