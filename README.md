# Shader Tool Blueprint (V0)

Next.js + TypeScript + Tailwind + Zustand scaffold for a focused shader editor.

## Included

- one polished `Rainbow Flow` preset
- live WebGL preview stage (desktop + mobile preview toggle)
- curated uniform controls
- export generator for:
  - React component
  - plain HTML canvas embed
  - config JSON
- Milestone 1 save/reuse flow:
  - save local variants
  - duplicate by loading and re-saving
  - import config JSON
  - local personal library (persisted in local storage)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Structure

- `src/app/page.tsx` - app entry
- `src/features/shader/ShaderToolV0.tsx` - editor shell and layout
- `src/features/shader/components/*` - canvas, controls, export, library panels
- `src/features/shader/store/useShaderStore.ts` - Zustand state + persistence
- `src/features/shader/lib/exporters.ts` - React/HTML/JSON export code generators
