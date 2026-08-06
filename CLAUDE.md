# ss-components

A SolidJS component library (`@thewaver/ss-components`) plus a Playground app that documents and
exercises it. Vanilla-extract for styles, Vite for both builds, no test runner.

- `src/Lib` — the published library. Everything under here ships.
- `src/Playground` — the demo app. Not published; it is also where every consumer-side painter lives.

## Read these first

| File                                               | Holds                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`src/Lib/conventions.md`](src/Lib/conventions.md) | **Settled decisions and the reasoning behind them.** Long. This is the "why", and it is authoritative. |
| [`src/Lib/review.md`](src/Lib/review.md)           | **Open problems** — bugs, smells, missing implementation. Numbered, contiguous from 1.                 |

`conventions.md` is not documentation of the code — it is the record of arguments already had, so
they are not re-litigated. If you are about to make an architectural call, check whether it is
already in there. If you make a new one, add it.

## Working rules

- **Do not add code comments.** The reasoning goes in `conventions.md` instead. The codebase has
  essentially no comments and that is deliberate.
- **When an item in `review.md` is fixed or dropped, delete it outright** and renumber the rest to
  stay contiguous. Nothing is marked "resolved" in place.
- **No changelogs anywhere in the docs.** `review.md` carries only what is still open;
  `conventions.md` carries only the reasoning behind a decision. Nothing records "what landed", "what
  just shipped" or how many assertions passed — once a thing is done, its only traces are the code and
  its `conventions.md` entry. Do not add a status or state section to this file.
- **Read a neighbouring component before writing a new one.** House style is tight and consistent:
  `const DEFAULT_X = …` at module scope, `createMemo` for derived props with a default, one blank
  line between logical blocks, no destructuring of `props`.
- **Never justify an API shape with "it matches how it is currently used."** Argue from ownership,
  who has to know what, and what deferring the decision costs.
- **Surface one decision at a time.** A long batched list of issues does not land; a single
  well-argued question does.

## Architecture in one page

Details and the arguments behind each of these are in `conventions.md` under the matching heading.

**Prop naming.** `AccessorProps<T>` accessorizes every prop to `getX` except functions, symbols and
`Signal` tuples, which stay plain. Prefixes: `get*` reactive data, `compute*` factories/predicates
taking arguments, `render*` JSX producers, `on*` events, `*Signal` two-way state the component also
writes. **A generic prop cannot pass through `AccessorProps`** — declare it by hand alongside the
accessorized block, or the key silently vanishes.

**Controls: the shell owns behaviour, the painter owns paint.** A control in this library paints
nothing. `InteractionWrapper` owns events, ARIA, focus, tab order, tooltip anchoring and geometry;
every pixel comes from `renderContent(getFlags)`, supplied by the consumer. The Playground's
`StyledComponents/*Content` are those painters. This is why the library carries no colours.

**Flags are extensible.** `InteractionFlags<TExtra>` defaults to `{}`. A control with private state
declares it (`BinarySwitchFlags`, `TextInputFlags`) and passes it through
`getExtraFlags: Accessor<TExtra>`, so its painters are typed to exactly what it can produce.

**Disabled is `aria-disabled`, never the native attribute** — on every control, without exception.
Native `disabled` kills the events a tooltip needs in order to explain why the control is disabled.
Activation gating therefore lives in JS. A consumer stylesheet selecting on `:disabled` will
silently stop matching.

**Overlay geometry.** For controls whose element is a real `<input>`: the painter renders first in
flow and sizes the box, the input is absolutely positioned over it at `inset: 0`. The focus ring
then lands exactly around what was painted.

**Layout.** `Abstracts/` is logic that renders no DOM (namespaced utils and hook-like factories).
`Fundamentals/` renders DOM. `Composites/` combines Fundamentals. `Fundamentals/Input/` groups
controls that carry a user-editable value. `src/Lib/index.ts` enumerates every export path
individually and stays sorted — it is not a barrel.

## Commands

```bash
npm run build:lib          # vite lib build + tsup .d.ts emit
npm run build:playground
npm start                  # dev server
npm run format             # prettier, 4 spaces, 120 cols, import sorting
npx tsc --noEmit -p tsconfig.json
```

### Verifying rendered DOM without a test runner

There is no test environment (`review.md` #2). Anything expressed as markup — roles, ARIA, tab
order, painter classes, inline styles from flags — can still be checked by dumping a built page:

```bash
npm run build:playground
npm run preview            # must outlive the shell that started it
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" \
    --headless --disable-gpu --virtual-time-budget=5000 --dump-dom "http://[::1]:4173/radio"
```

**Use the IPv6 URL.** `vite preview` binds `::1`, so `127.0.0.1` is refused and Chromium dumps its
own error page — a plausible-looking 300 KB of HTML containing none of your markup. Always confirm
the dump contains something you expect before concluding anything from what it lacks.

Edge renders every route fully. What this cannot do is click or type.

### Verifying interaction — clicks and keystrokes, still no dependency

`--dump-dom` cannot click. Driving the same headless browser over the DevTools Protocol can, with
nothing added to `package.json`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --disable-gpu --remote-debugging-port=9222 --window-size=1600,1200 \
    --user-data-dir=./chrome-profile about:blank &
```

From Node 22, `fetch` `http://127.0.0.1:9222/json/list`, connect to the page target's
`webSocketDebuggerUrl` with the built-in `WebSocket`, then use `Input.dispatchMouseEvent`,
`Input.dispatchKeyEvent` and `Runtime.evaluate`.

Three traps, each of which reads as a bug in the component rather than in the harness:

- **Non-printable keys need `rawKeyDown`**, not `keyDown` — the latter also generates a `char` event
  and double-fires handlers. **Printable keys need `keyDown` _with_ a `text` field**, or nothing is
  typed at all.
- **`scrollIntoView` before every click.** Once a page grows past the window, `getBoundingClientRect`
  returns an off-screen point and the dispatched click silently lands on something else, or nothing.
- **Wait out any transition before asserting on it.** Reading a fading element's `opacity` right after
  a keystroke returns a mid-flight value like `0.055`.

`review.md` #2 covers what is missing here, which is that no such script is committed.

## Where to start

`git status` first — work here is often uncommitted. Then `review.md` for what is open, and
`conventions.md` for why anything already there is the way it is.
