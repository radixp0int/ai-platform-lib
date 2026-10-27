# Platform shell designs

The design canvas for the platform shell: the top bar, pinned tabs, tenant
switcher, side menu, and the pages around them. Saved from the canvas at
https://claude.ai/artifact/2gBADGrBbunBWp2eSzRzzz — re-save from there after
editing it; these files are a copy, not the source.

`canvas.json` is the index (pages, artboard positions, row titles). Each
`*.dc.html` is one artboard: 1440 wide for screens, 1040 wide for the
component sheets.

| Canvas page           | Files     | What it is                                                                                           |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| Mercury direction     | `MWizard` | Second pass. Only the wizard board is left; the rest drew the old side menu and was removed        |
| Mercury direction 2.0 | `M2…`     | **Current.** Chat with only its own menu (new, ongoing, dragged wider, three dark palettes) and the wizard |
| Component revisions   | `Rev…`    | **Rejected, kept for reference.** Eight library components as they ship today (`…Today`) next to a Mercury-direction revision (`…Proposed`). Turned down on 2026-10-04; the one idea kept is a subtler icon on Card |

**Side menu: use the unified one.** New designs use the app rail plus panel
shown in [`side-menu-reference.png`](./side-menu-reference.png) (a 68px rail of
apps beside a 260px panel with a search, Views, and Recently viewed). The
single 248px list menu (Spaces and Data groups, chevron sub-items) was the old
menu. The artboards that drew it, which were the Airtable first pass, most of
the Mercury page and the Home, Tasks, tenant and Runs boards of 2.0, have been
removed; they are in git history. The boards left do not draw it: chat shows
only its own menu and the wizard hides the side menu. Any screenshot that shows
the old menu should be replaced with one of the unified menu, or marked old.

The 2.0 page is what `src/recipes/app-shell` implements, with one difference:
buttons on the pages are the library's `Button`, not the pill buttons in the
artboards. The revisions page was a proposal to restyle eight components;
"today" is drawn from the component source, and none of "proposed" was built.
