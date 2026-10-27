# Designs

Saved copies of the design canvases the library is built from. `canvas.json` is
a canvas's index (pages, artboard positions, row titles); each `*.dc.html` is
one artboard. Re-save from the canvas after editing it; these files are copies,
not the source. `assistant-greeting/` is different: two live review boards,
plain HTML that opens in a browser, sharing `avatars.js`.

| Folder               | What it is                                                                       | Built as                                               |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `platform-shell/`    | Chat with its own menu, the wizard, the side-menu reference, and the rejected component revisions | `src/recipes/app-shell` and the components it is made of |
| `agentic-flows/`     | The workflow run canvas: horizontal lanes, the flow console, the node kit        | `src/workflows`                                        |
| `responsive-review/` | The tablet and phone review: supported widths, what gives way, evidence          | Rules every component and recipe follows               |
| `assistant-greeting/` | The Ghost prompt greeting and its compact and error states; the Aristotle avatar options | **Chat / Components / Conversation** (empty state), `Greeting`, `AssistantAvatar` |

The same table, with the decisions that came out of each review, is in
Storybook under **Docs / Designs**.
