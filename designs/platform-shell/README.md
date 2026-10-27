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
| Airtable direction    | no prefix | First pass: navy top bar, open-space tabs, tenant switcher, collapsible menu, wizard, route table    |
| Mercury direction     | `M…`      | Mercury-style pages with the controls in the page, three dark palettes, one top-bar variant          |
| Mercury direction 2.0 | `M2…`     | **Current.** Mercury pages under the Airtable top bar, pinned pages, chat with only its own menu, the tenants data table |
| Component revisions   | `Rev…`    | **Rejected, kept for reference.** Eight library components as they ship today (`…Today`) next to a Mercury-direction revision (`…Proposed`). Turned down on 2026-10-04; the one idea kept is a subtler icon on Card |

**Side menu: use the unified one.** New designs use the app rail plus panel
shown in [`side-menu-reference.png`](./side-menu-reference.png) (a 68px rail of
apps beside a 260px panel with a search, Views, and Recently viewed). The
single 248px list menu drawn in the Airtable, Mercury and 2.0 artboards
(Spaces and Data groups, chevron sub-items) is the old menu. Those artboards are
kept for reference and are not updated. Any screenshot that shows the old menu
should be replaced with one of the unified menu, or marked old.

The 2.0 page is what `src/recipes/app-shell` implements, with one difference:
buttons on the pages are the library's `Button`, not the pill buttons in the
artboards. The revisions page was a proposal to restyle eight components;
"today" is drawn from the component source, and none of "proposed" was built.
