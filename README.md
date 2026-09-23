# Internship Notebook

A personal notebook for your internships: practicum learning objectives, notes, calendar, coffee chats, an experience log, and a hand-drawn companion that greets you with a new quote every day.

## Run

```sh
npm install
npm run dev        # http://localhost:5173 (uses $PORT if set)
npm run typecheck
npm run build      # outputs to dist/
```

`BASE_PATH` can be set when the app is served from a sub-path (as on Replit).

## Deploy to Vercel

Import the GitHub repo at [vercel.com/new](https://vercel.com/new). `vercel.json` already sets the Vite build, the `dist` output folder, and a rewrite so page URLs like `/objectives` work on refresh. No environment variables are needed.

## Features

- **First-run setup**: name, email, role, and company, then draw your companion (pen, eraser, colors, brush sizes, undo/redo) or keep the default bunny.
- **Today**: your companion says hi with a quote that changes each day, plus your to-do list, objective progress, next coffee chat, and upcoming events.
- **My internships**: add past, current, and upcoming internships. Each one keeps its own notes, objectives, calendar, coffee chats, and log; switch between them from the sidebar.
- **Learning objectives**: practicum objectives built on the SMART criteria and the four types (Knowledge, Skills, Attitude, Career Growth). Each answers the four planning questions and includes the vague-vs-specific examples.
- **Draw**: a creative-break page to redraw your companion or doodle in a sketchbook.

## Where things live

- `src/App.tsx`: layout, navigation, and routes
- `src/hooks/use-notebook.ts`: data model and persistence (browser `localStorage`; notebooks from the first version are migrated automatically)
- `src/pages/`: one file per page
- `src/components/drawing-pad.tsx`: the drawing canvas
- `src/lib/quotes.ts`: daily quotes
