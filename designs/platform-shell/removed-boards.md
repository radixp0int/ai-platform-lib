# Removed: the old side-menu boards

A handoff note. Read **What to do** first.

## Why

The old side menu is a single 248px list with "Spaces" and "Data" groups and
chevron sub-items (and its 68px collapsed form). It was replaced by the unified
menu: a 68px app rail beside a 260px panel, drawn in
[`side-menu-reference.png`](./side-menu-reference.png). Every board that drew
the old menu was removed from this folder on `feat/select-actions`.

**Copy of everything removed:**
<https://gist.github.com/radixp0int/910cf8fda8e6e66d18c223d50ada0a4f> (public:
the 32 `*.dc.html` boards and the old `canvas.json`, for reference only).

## What to do

1. **Do not bring the boards back.** If a merge or rebase conflicts on a
   `designs/platform-shell/*.dc.html` file listed below, take the deletion. If
   `canvas.json` conflicts, keep the version on `feat/select-actions`.
2. **Delete your own copies.** `.claude/worktrees/keen-rubin-aa33eb` and
   `.claude/worktrees/workflow-inputs-outputs` still hold all 56 boards. In any
   checkout that still has them, from `designs/platform-shell/`:

   ```bash
   rm Main.dc.html ChatSpace.dc.html HomeChatOnly.dc.html HomeCollapsed.dc.html HomeDark.dc.html NoAccess.dc.html Routes.dc.html TenantSwitcher.dc.html Wizard.dc.html WorkflowsSpace.dc.html MChat.dc.html MChatDarkDeep.dc.html MChatDarkGraphite.dc.html MChatDarkNavy.dc.html MHome.dc.html MHomeDarkDeep.dc.html MHomeDarkGraphite.dc.html MHomeDarkNavy.dc.html MHomeTopBar.dc.html MTasks.dc.html MTenantSwitcher.dc.html MWorkflows.dc.html M2Favorites.dc.html M2Home.dc.html M2HomeDarkDeep.dc.html M2HomeDarkGraphite.dc.html M2HomeDarkNavy.dc.html M2Tasks.dc.html M2TenantSwitcher.dc.html M2TenantSwitcherAdmin.dc.html M2Tenants.dc.html M2Workflows.dc.html
   ```

   That is 32 files. Then take `canvas.json`, `designs/README.md`,
   `designs/platform-shell/README.md` and `docs/Designs.mdx` from
   `feat/select-actions`.

3. **If your recipes kept a copy, a link or a story that mirrors one of these
   boards**, it draws the old menu. Replace it with the unified menu, or point it
   at the gist.
4. **Delete the old-menu screenshots** (`.screenshots/` is git-ignored, so
   nothing to commit; `npm run screenshots` makes new ones). In `baseline/`,
   `current/`, `migrated/` and `step-1-current/`:
   - `components-side-menu--{expanded,section-open,rail,chat-only}.png`
   - `recipes-app-shell--{home,rail,runs,tasks,tenants,space-unavailable,chat-only-tenant}.png`
     (not in `step-1-current/`)
5. **Old-menu stories: not deleted yet, and not yours to delete before the
   merge.** `feat/select-actions` still builds the old menu, so its stories are
   the only way to see it. `Components/Side menu` (`Expanded`, `SectionOpen`,
   `Rail`, `ChatOnly`) and `Recipes/App shell` (`Rail`) go when
   `feat/standard-side-menu` merges: that branch rewrites the side-menu stories
   (`Default`, `PanelFolded`, `NoPanel`, `WithPageSection`) and replaces
   `Recipes/App shell` `Rail` with `PanelFolded`. Check that after the merge no
   `Expanded`, `SectionOpen`, `ChatOnly` or `Rail` story is left in
   `src/components/side-menu` or `src/recipes/app-shell`.

## Do not delete

- `M2Chat.dc.html`, `M2ChatOngoing.dc.html`, `M2ChatWide.dc.html`,
  `M2ChatDarkDeep.dc.html`, `M2ChatDarkGraphite.dc.html`,
  `M2ChatDarkNavy.dc.html`, `M2Wizard.dc.html`, `MWizard.dc.html`: chat shows
  only its own menu and the wizard hides the side menu, so they do not draw the
  old one.
- All `Rev*.dc.html`: the rejected component revisions, kept for reference.
- `side-menu-reference.png`: the menu to design against.
- These screenshots look like shell screenshots but do not show the old menu:
  `chat-recipes-chat-inside-app-shell--chat-page.png`,
  `recipes-app-shell--wizard.png`,
  `workflows-recipes-run-inside-app-shell--loan-review.png`.
- `designs/responsive-review/evidence/*.png`: they show the run sidebar, not the
  menu, and `tablet-and-chat-responsive-review.md` links to them.

## How to tell a board or screenshot shows the old menu

- It has a 248px left column listing Home, Tasks, then "Spaces" (Chat,
  Workflows) and "Data" (Insights, Ingestion) with chevrons; or the 68px
  collapsed form of that column.
- In the HTML, the old menu boards contain `248px` (or `68px` for the collapsed
  ones). The unified menu is a 68px rail plus a 260px panel with a search box,
  Views and Recently viewed.
- By name: `M2…` and `M…` Home, Tasks, tenant and Runs boards, and the first-pass
  boards with no prefix.
