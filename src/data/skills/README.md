# Skill Data

Every anime technique is defined as a JSON object so new skills can be added
without touching application code. One folder per anime; one file per skill.

## Shape (see `_schema.example.json`)

```jsonc
{
  "id": "rasengan",
  "anime": "Naruto",
  "name": "Rasengan",
  "difficulty": "Intermediate", // "Beginner" | "Intermediate" | "Advanced"
  "description": "A rotating sphere of concentrated chakra formed in the palm.",
  "estimatedLearningTimeMinutes": 8,
  "previewAsset": "/images/skills/naruto/rasengan-preview.gif",
  "steps": [
    {
      "id": 1,
      "instruction": "Stand with feet shoulder-width apart, relaxed posture.",
      "pose": "reference-pose-id-1"
    }
  ],
  "referencePoses": ["reference-pose-id-1"],
  "completionEffect": "energy-orb-blue",
  "xpReward": 150
}
```

## Adding a new skill

1. Drop a `<skill-id>.json` file in the matching anime folder (create the
   folder if it's a new series).
2. Follow the schema above.
3. The catalog loader (`lib/mediapipe` + `app/api/skills/route.ts`, wired up
   in a later step) will pick it up automatically — no code changes required.
