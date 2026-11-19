# FeedbackTab

A slim orange tab on the right edge of the page that reads "Feedback". On hover
or keyboard focus it slides out to say "Report a bug". A click hands off to
your report form. Storybook: **Components / FeedbackTab**.

## Use it

Render it once, beside the app shell. It pins itself to the window's right
edge, so it does not matter where in the tree it sits.

```tsx
import { FeedbackTab } from 'ai-platform-lib'

// A dialog or panel you own
<FeedbackTab onClick={() => setReportOpen(true)} />

// A form at an address
<FeedbackTab href="https://forms.example.com/bug" newTab />
```

| Prop                   | Default                                   | What it does                                                  |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `onClick`              |                                           | Opens your report. Ignored when `href` is set.                |
| `href`, `onNavigate`   |                                           | Makes the tab a link. `onNavigate` is the Links contract.     |
| `newTab`               | `false`                                   | Opens `href` in a new tab.                                    |
| `label`                | `Feedback`                                | The word down the tab, and its accessible name.               |
| `title`, `description` | `Report a bug`, `Tell us what went wrong` | The slide-out lines. An empty `description` drops the second. |
| `anchor`               | `viewport`                                | `container` pins it to the nearest positioned ancestor.       |
| `expanded`             | `false`                                   | Holds it open.                                                |

It hides itself when printing, sits at `z-30` (under dialogs and slide-overs)
and stays still with reduced motion on.

## Bringing it to another project

Copy this folder, then bring the three things it leans on:

1. **The colour.** `--feedback` and `--on-feedback` in `brand/brand.css`
   (one pair in §1 light, one in §2 dark) and their `--color-feedback` /
   `--color-on-feedback` lines in `brand/tokens.css`. It is its own token, not
   `--notify`: in this brand that orange means "a person is waiting".
2. **The icon.** `FeedbackIcon` in `src/primitives/icons/icons.tsx`.
3. **The link.** `Link` from `src/primitives/link`, used only when `href` is set.
