# Anime Skill AR Trainer

A webcam-based AR web app that teaches iconic anime techniques (Rasengan,
Kamehameha, Chidori, etc.) via real-time body pose and hand tracking. Visual
effects are clearly fictional entertainment overlays — no claims of real
powers.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript, Tailwind CSS, Framer Motion, Three.js / React Three Fiber, GSAP
- **AI/Tracking:** MediaPipe Pose, MediaPipe Hands, TensorFlow.js (pose-detection model)
- **Auth/Database/Storage:** Firebase (Authentication + Firestore + Storage) — see "Firebase Setup" below
- **State:** Zustand (UI-local only; auth/progress state lives in dedicated providers/stores)
- **Backend:** Next.js API routes (primary) + optional standalone Express server (`/server`)
- **Deployment:** Vercel (frontend), any Node host for `/server` if used

## Firebase Setup

Authentication, profile sync, and cloud progress require a Firebase project.
**The app still runs without one** — it falls back to guest-only mode
(local storage) automatically (see `isFirebaseConfigured` in
`src/lib/firebase/index.ts`) — but sign-in, cloud sync, and avatar upload
need real Firebase credentials.

1. **Create a project** at https://console.firebase.google.com → "Add project".
2. **Register a Web App**: Project Settings → General → "Your apps" → Web (`</>`) icon. Copy the `firebaseConfig` values shown — you'll need them for step 5.
3. **Enable Authentication**: Build → Authentication → Get Started → Sign-in method tab → enable **Email/Password** and **Google**.
4. **Enable Firestore**: Build → Firestore Database → Create database → start in production mode (the rules below lock it down properly) → pick a region.
5. **Enable Storage**: Build → Storage → Get started (used for profile picture uploads).
6. **Deploy the security rules** in this repo:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # point at the same project; when asked
                                      # for rules files, use the existing
                                      # firestore.rules / storage.rules in
                                      # this repo rather than generating new ones
   firebase deploy --only firestore:rules,storage:rules
   ```
   (Or paste the contents of `firestore.rules` / `storage.rules` directly into the Firebase Console's Rules tab for each product and click Publish — no CLI required.)
7. **Fill in your env vars** (see below) with the values from step 2.

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the Firebase block —
every other section is optional:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For auth/sync | From Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For auth/sync | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | For auth/sync | Your Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | For avatar upload | `<project-id>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | For auth/sync | From Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | For auth/sync | From Firebase web app config |
| `NEXT_PUBLIC_MEDIAPIPE_WASM_URL` / `..._POSE_MODEL_URL` / `..._HAND_MODEL_URL` | No | Only if self-hosting MediaPipe assets instead of the default CDN |
| `PORT`, `CORS_ORIGIN` | No | Only if running the optional `/server` Express backend |

`NEXT_PUBLIC_*` vars are safe to expose client-side by design — Firebase's
actual security boundary is `firestore.rules`/`storage.rules`, not secrecy of
these values. Never commit `.env.local` (already in `.gitignore`).

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase config (see above)
npm run dev
```

Visit http://localhost:3000.

### Testing Authentication

1. Go to `/signup`, create an account with a real-format email — Firebase
   Auth's emulator isn't wired up here, so use an email you can actually
   receive mail at if you want to test the password-reset flow.
2. Confirm you land on `/profile` and a `users/{uid}` doc appears in the
   Firestore console.
3. Refresh the page — you should stay signed in (persistent login).
4. Sign out via the navbar avatar menu → Logout, then try visiting
   `/profile` directly — you should be redirected to `/login`.
5. From `/login`, click **Continue as Guest** — `/profile`/`/settings`/
   `/training/*` should now be reachable without an account.
6. Complete a training session as a guest (so `localStorage` has progress),
   then sign in for real — you should see the merge-progress prompt
   (Merge / Replace Cloud / Discard Local).
7. Try **Continue with Google** — requires the Google provider to be
   enabled in step 3 above, and `localhost` to be in Firebase Auth's
   Authorized Domains (it is by default).

### Optional Express backend

```bash
npm run server:dev
```

## Project Structure

```
anime-skill-ar-trainer/
├── public/
│   ├── sounds/            # charging, lightning, fire, wind, water, success sfx
│   ├── models/            # MediaPipe/TF.js model assets
│   └── images/            # skill previews, UI art
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # landing page
│   │   ├── skills/[skillId]/      # skill detail
│   │   ├── training/[skillId]/    # camera + training mode (RequireAuth-gated, guest allowed)
│   │   ├── login/, signup/, forgot-password/  # auth screens
│   │   ├── profile/               # profile dashboard (RequireAuth-gated, guest allowed)
│   │   ├── settings/              # camera/audio/graphics/theme/language + data export (RequireAuth-gated)
│   │   ├── auth/login|register/   # legacy redirects -> /login, /signup
│   │   └── api/{auth,skills,progress}/  # route handlers
│   ├── components/
│   │   ├── home/          # hero, particle bg, skill cards
│   │   ├── skills/        # skill list/detail UI
│   │   ├── camera/        # webcam feed + skeleton overlay
│   │   ├── training/      # step instructions, live corrections, accuracy HUD
│   │   ├── effects/       # cinematic completion effects (EffectStage, icons, particles)
│   │   ├── auth/           # RequireAuth guard, AuthLayout, FormField, MergeProgressDialog
│   │   ├── profile/         # AvatarPicker, EditProfileModal
│   │   ├── ui/             # buttons, cards, modals, progress bars
│   │   └── layout/         # navbar (auth-aware), footer, shells
│   ├── features/
│   │   ├── pose-detection/   # MediaPipe Pose wrapper + angle math
│   │   ├── hand-tracking/    # MediaPipe Hands wrapper
│   │   ├── training/         # PoseMatcher, HandMatcher, SequenceEngine,
│   │   │                     # AccuracyCalculator, FeedbackEngine, SkillSession
│   │   ├── effects/          # EffectManager + 12 reusable Three.js renderers
│   │   ├── progress/         # ProgressStore, StorageAdapter (Local + Firebase), StorageFactory, RankCalculator
│   │   ├── auth/             # AuthService (Firebase Auth wrapper), validators
│   │   └── profile/          # ProfileService (Firestore `users` CRUD + avatar upload), achievements, avatar presets
│   ├── data/
│   │   ├── skills/<anime>/<skill>.json   # skill content, no-code additions
│   │   ├── poses/<anime>/<poseId>.json   # reference-pose targets for the training engine
│   │   └── effectPresets.ts              # skill -> effect-combo mapping
│   ├── hooks/             # useCamera, useVisionTracking, useTrainingSession, useAuth, ...
│   ├── lib/
│   │   ├── firebase/       # Firebase app/auth/firestore/storage init (env-var driven)
│   │   ├── mediapipe/      # model loading helpers
│   │   └── utils/          # generic helpers
│   ├── store/              # Zustand stores
│   ├── types/              # shared TS types
│   └── constants/          # thresholds, XP tables, route paths
├── firestore.rules        # Firestore security rules (owner-only reads/writes)
├── storage.rules          # Firebase Storage security rules (avatar uploads)
└── server/                # optional standalone Express API
```

## Roadmap (future features, architected for but not yet built)

- Multiplayer battles / PvP pose competitions
- AI coach with voice feedback
- VR support
- Leaderboards
- Custom anime skill creator + community-uploaded skills
- Mobile app
- Gesture recording & replay

## Status

✅ Step 1 — Architecture, folder structure, Next.js + Tailwind initialized
✅ Step 2 — Design tokens, animated navbar, hero, glassmorphism skill cards, particle background
✅ Step 3 — Full 24-skill JSON catalog, typed data aggregators, `/skills` browse page, `/skills/[skillId]` detail page
✅ Step 4 — Camera + MediaPipe Tasks Vision integration (Pose + Hand Landmarker, mirrored feed, skeleton overlay, closest-person tracking, FPS/confidence HUD)
✅ Step 5 — Training Engine: JSON-driven PoseMatcher/HandMatcher/SequenceEngine/AccuracyCalculator/FeedbackEngine/SkillSession, 120-pose reference dataset, live coaching HUD, mistake detection, step grading
✅ Step 6 — Effect Engine: 12 reusable Three.js/GPU-particle renderers (orb, beam, lightning, fire, water, wind, aura/glow, particle bursts), bloom post-processing, screen flash, camera shake, JSON-driven skill→effect presets, standalone `/effects-preview` showcase
✅ Step 7 — Effects wired into Training: charge intensity tiers (60/75/90% accuracy → EffectStage), per-step + skill-finale completion cinematics, S/A/B/C/D ranking, TrainingSummary screen, localStorage-backed progress (XP/history/best rank) behind an abstract StorageAdapter
⬜ Step 8 — Polish, performance, sound
✅ Step 9 — Auth, profiles & cloud sync: Firebase Auth (email/password, Google, guest, password reset, persistent login), FirebaseStorageAdapter + StorageFactory (guest→local, signed-in→cloud, zero call-site changes elsewhere), guest→account progress merge flow, `/login` `/signup` `/forgot-password` `/profile` `/settings`, route guards, avatar upload + presets, achievements, Firestore/Storage security rules
