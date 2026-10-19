# ai-platform-lib

The AI platform's component library, its brand and its designs. One package,
one Storybook.

```sh
npm install
npm run storybook        # http://localhost:6006
```

## Layout

```
brand/         the palettes, the Tailwind bridge, fonts — and stories that show them
designs/       saved design canvases the library is built from
docs/          the Storybook handbook: introduction, structure, contracts, release notes
public/        files Storybook serves as they are — `public/docs/` holds the sample documents
src/
  primitives/  one control or one visual atom each
  components/  primitives assembled around a data contract
  recipes/     whole screens on sample data — stories only
  chat/        components/  recipes/  engine/  fixtures/
  workflows/   components/  recipes/  engine/  fixtures/
  hooks/  lib/  fixtures/
```

Every module is one folder: `index.ts`, `types.ts`, `<name>.tsx`,
`<name>.stories.tsx`, `<name>.e2e.ts`, and optionally `<name>.test.tsx`. A module made of several components nests each secondary
one in its own folder of the same shape. The rules for what goes in which tier
are in Storybook under **Docs / Structure** (`docs/Structure.mdx`).

## Using it in an app

The package is source-only; the app's Vite compiles it. Three entry points, so
an app only loads the areas it uses.

```ts
import { Button, DataTable } from 'ai-platform-lib'
import { Composer, useChat } from 'ai-platform-lib/chat'
import { WorkflowCanvas } from 'ai-platform-lib/workflows'
```

```css
@import 'tailwindcss';
@import 'ai-platform-lib/brand/tokens.css';
@import 'ai-platform-lib/styles.css';
@import 'ai-platform-lib/chat.css';
@import 'ai-platform-lib/workflows.css';
```

React 19 is a peer dependency.

## Scripts

| Command                         | What it does                                                              |
| ------------------------------- | ------------------------------------------------------------------------- |
| `npm run storybook`             | Storybook dev server on port 6006                                         |
| `npm run build-storybook`       | Static Storybook in `storybook-static/`                                   |
| `npm run typecheck`             | The library alone, then everything including stories                      |
| `npm run lint`                  | oxlint                                                                    |
| `npm test`                      | The unit tests (`src/**/*.test.{ts,tsx}`), with Vitest in jsdom           |
| `npm run test:watch`            | The unit tests again on every save                                        |
| `npm run test:e2e`              | Every Playwright test, against the built Storybook                        |
| `npm run test:e2e:components`   | Only the browser tests beside components (`src/**/*.e2e.ts`)              |
| `npm run test:e2e:stories`      | Every story renders, and every component has at least three               |
| `npm run test:e2e:ui`           | Playwright's UI, for watching and debugging a test                        |
| `npm run format:check`          | Check formatting                                                          |
| `npm run test:tablet-workflow`  | Check canvas, inspector visibility, and focus at four viewport widths     |
| `npm run test:static-workflows` | Check incident and onboarding decisions, restart, and retry               |
| `npm run format`                | oxfmt                                                                     |
| `npm run screenshots`           | Screenshot every story of the built Storybook into `.screenshots/current` |
| `npm run screenshots:compare`   | Compare `.screenshots/current` against `.screenshots/baseline`            |

## Sample documents

`public/docs/` holds one placeholder per format the document preview draws.
Storybook serves the folder from its root, so each has a fixed URL:

| File                              | URL                         |
| --------------------------------- | --------------------------- |
| `public/docs/sample.pdf`          | `/docs/sample.pdf`          |
| `public/docs/sample.docx`         | `/docs/sample.docx`         |
| `public/docs/sample.pptx`         | `/docs/sample.pptx`         |
| `public/docs/sample.article.json` | `/docs/sample.article.json` |

To try a real document, replace a file with one of the same name and reload.
Nothing else changes: the `Sample…File` stories under **Components /
DocumentPreview** open these URLs, and so do the references in the canned chat
(`src/chat/fixtures/cannedTurns.ts`). A new format gets a `sample.<ext>` here
beside its renderer.

The last one is not a file format but a knowledge article as data, in the
`Article` shape **Components / ArticlePreview** (experimental) draws
(`src/components/article-preview/types.ts`). Its `SampleArticleFile` story and
the canned chat's knowledge-article reference read it.

## Where it came from

The library was moved here from `chat-interfaces` (the
`radixp0int/web-chat-designs-ui` repo), starting from commit `5a88f0a` on
`feat/document-preview` plus that branch's uncommitted work. It had been three
packages there (`@chat/tokens`, `@chat/ui`, `@chat/chat-ui`) with the platform
shell and the workflow canvas living inside the demo app. History starts fresh
here; `RELEASE_NOTES.md` carries the earlier entries.

## Local demo and validation

The sibling `chat-interfaces/apps/chat` demo consumes this source package with
`file:../../../ai-platform-lib`. Its Vite configuration deduplicates React and
React DOM; TypeScript resolves one React type identity across the linked source.
The old library packages and Storybook setup have been removed from that repo.
Its catalog commands forward here. The local dependency remains the selected
setup; remote consumption and package publishing are deferred.

Complete platform, workflow, and chat screens live in Storybook. Recipes are
excluded from the public entry points. The static incident and onboarding recipes
complete machine work immediately and keep human approvals interactive, without
a server. Build Storybook before running either workflow test command.

For visual comparisons, capture a baseline from the base revision, then capture
the candidate with `npm run screenshots` and run `npm run screenshots:compare`.
Screenshot output is local and ignored by Git. Each story gets isolated browser
storage; comparisons use the capture manifests.

Card defaults to a muted neutral icon tile. Pass `iconTone="warning"` for a
caution explained by the card's text. **Recipes / Card icon options** shows the
selected treatment and the explicit warning tone.
