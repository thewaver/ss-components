# Lib code review

Running log of open issues, opportunities and settled decisions. Items keep their numbers so they can be referenced across sessions — new findings append, they never renumber.

Last full pass: **2026-08-04** (whole `src/Lib` + built `dist` output). Everything raised in
that pass is resolved, dropped or explicitly parked — see the index. Open work is **1**, **2**
and **36**, all deferred by choice rather than left half-done.

Verification standard for that pass, so it isn't assumed to be higher than it was:
typechecking, both builds, and reading compiled output where reactivity was in question.
Nothing was observed running in a browser — there is no test environment (**34**, dropped).

### Index

**Carried over**

1. `ScreenWiper` renders a few hundred inline SVGs — _deferred_
2. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
3. Relative colour syntax in component code (`Surface`) — _showcase only, closed_

**Build & packaging**

4. ~~The published `dist` compiles JSX to `React.createElement`~~ — **fixed**
5. ~~The whole vanilla-extract runtime is bundled into `dist`; no CSS artifact ships~~ — **fixed**
6. ~~`SVGDefsSamples` (2534 lines of showcase) is exported from the library entry~~ — **fixed**
7. ~~`package.json` has no `exports` and no `sideEffects`~~ — **fixed**
8. ~~`AnimDirection` is reachable from public prop types but not exported~~ — **fixed**

**Correctness**

9. ~~`spreadKind` leaks onto `<linearGradient>` / `<radialGradient>` as a DOM attribute~~ — **fixed**
10. ~~`createAnimateDefs` leaks elements, listeners and a rAF~~ — **fixed**
11. ~~`Tooltip` writes `top: undefinedpx` on first paint~~ — **fixed**
12. ~~`Tabs` decides anchor-vs-button once, non-reactively~~ — **fixed**
13. ~~`ScreenWiper` grid under-covers, and its completion latch is baked in at creation~~ — **fixed**
14. ~~`ScanlineAnimation` never clamps `t` to 1~~ — **fixed**
15. ~~`AudioSwitcher` doesn't release media on cleanup; fades out an element that never played~~ — **fixed**
16. ~~`ImageSwitcher` preload has no error path or cleanup~~ — **fixed**; src-less `<img>` on first paint left as-is
17. ~~`Modal` / `ElementHighlight` imperative `hide()` desyncs from the controlled prop~~ — **fixed** (breaking: `visibilitySignal`)
18. ~~`buttonRoot`'s `&:not([disabled])` on a `div` is always true~~ — **fixed**
19. ~~`Typewriter` keys a `<For>` by character~~ — **fixed**
20. ~~`Viewport`'s trailing throttle isn't cancelled on unmount~~ — **fixed**
21. ~~`FocusUtils` selector misses focusables and doesn't filter hidden ones~~ — **fixed**
22. ~~`Tooltip` is never linked to its anchor via `aria-describedby`~~ — **fixed**

**Performance**

23. ~~`Corners` applies two `drop-shadow()` passes over its whole subtree~~ — **fixed**
24. `ScanlineAnimation` paints one background-image layer per line — _style churn reduced; layer count is inherent_
25. `Typewriter` rebuilds one span per character whenever the animation flag flips — _subscriptions collapsed; the swap itself is by design_
26. ~~The `useViewportContext` fallback is instantiated per caller~~ — **fixed**
27. ~~`SVGFilterDefsFactory` filters clip unless `elementSize` is passed~~ — **fixed**

**Architecture** _(raised 2026-08-04, after the first pass)_

35. ~~Closing a `Modal` pops the tooltip of whatever it returns focus to~~ — **fixed**
36. `InteractionUtils` and `Button` overlap, and neither covers non-button controls — _deferred, written up to be picked up cold_

**Consistency / hygiene**

28. ~~`ElementHighlight.types.ts` reaches `typeUtils` through `../../../Lib/...`~~ — **fixed**
29. ~~`Interaction.utils.tsx` / `FPS.utils.tsx` are `.tsx` with no JSX~~ — **fixed**
30. ~~Dead `*Opts` types and commented-out defaults in `ScanlineAnimation.utils`~~ — **fixed with 6**
31. ~~`ButtonCbs` forces `Promise<void>` handlers~~ — **fixed**
32. ~~`AccessorProps` optional props can't carry an accessor returning `undefined`~~ — _dropped_
33. ~~`SVGFilterDefsFactory` is the only class in a namespace/function codebase~~ — _dropped_
34. ~~No tests anywhere in the repo~~ — _dropped_

---

## 1. `ScreenWiper` renders a few hundred inline SVGs

_Deferred — noted, not expected to be actioned soon._

At 1920×1080 with the default 120px cell that's roughly 17 columns × 19 rows, each an `<svg>` with a shape inside and its own CSS transition — about a thousand nodes animating at once.

`SVGPatternDefsUtils` already exists and does exactly this job: one `<svg>` with a tiled pattern would replace the whole grid. For the circle variant, a CSS `radial-gradient` background would too.

Worth measuring before rewriting. **13** covered the correctness problems in the same component and is fixed; this is purely the node count.

---

## 2. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written

_Acknowledged and parked — the current behaviour is correct, so this is about where the behaviour comes from rather than a bug._

The intent is right, and remounting is genuinely the only way to reset SMIL state. Here's Solid's `Show`:

```ts
const conditionValue = createMemo(() => props.when);
const condition = keyed ? conditionValue : createMemo(conditionValue, { equals: (a, b) => !a === !b });
return createMemo(() => { const c = condition(); if (c) { ... return child; } ... });
```

With `keyed`, the outer memo re-runs whenever `props.when` changes by reference, and re-reading `props.children` inside it rebuilds the `<animate>` elements. That mechanism does what you want.

What it needs is for `props.when` to read something reactive, and it doesn't. `defs` is a plain object literal built inside `Shape`'s defs memo from the Playground callback, so reading `defs.animationIterationPatterns` isn't tracked, `conditionValue` has no dependencies, and the children are built exactly once.

The reset you see comes from one level up: when `getIterationConfig()` or `getAnimationDurationMs()` changes, `Shape`'s fill/stroke defs memo re-runs, the callback returns a new array of new def objects with fresh `renderDefsElement` closures, and `<For>` discards the old nodes and inserts new `<animate>` elements. The SMIL reset is free from the parent; the `Show` isn't contributing to it.

Quick way to confirm: `console.count` inside the `when` expression. It logs once per `<Show>` and never again, no matter how many times the iteration pattern changes.

If you ever want the `Show` to genuinely own the remount — worth having, since it stops depending on the parent rebuilding everything and would survive memoising the defs later — the patterns need to arrive as an accessor:

```ts
export type SVGAnimationDefs = {
    animationDurationMs: number;
    getAnimationIterationPatterns?: () => SVGAnimationIterationPattern[];
    onAnimationEnd?: () => void;
    onAnimationIteration?: (next: number) => void;
};
```

```tsx
<Show when={defs.getAnimationIterationPatterns?.() ?? EMPTY_ARRAY} keyed>
```

Doing this would also fix half of **10** for free, since the rebuild would become explicit.

---

## 3. Relative colour syntax in showcase only

_Closed._ Library `Surface` div path now sets colour/opacity via CSS vars and a vanilla-extract fallback array — solid colour first, `rgb(from …)` second — so older browsers stay opaque instead of breaking. Showcase / Playground / `SVGDefs.const.tsx` still use relative colour freely.

---

# Build & packaging

**4**–**8** are all fixed — see _Fixed_. Nothing open in this section.

---

# Correctness

**9**–**22** are fixed — see _Fixed_. Nothing open in this section.

**22**–**23**, **26**–**29** and **31** are fixed; **24** and **25** are partly addressed — see _Fixed_. **32**–**34** are dropped — see _Dropped_.

---

# Dropped

Raised, considered, deliberately not pursued.

- **32 — `AccessorProps` optional props can't carry an accessor returning `undefined`.** `foo?: T` maps to `getFoo?: Accessor<Exclude<T, undefined>>`, so a consumer holding a `Signal<T | undefined>` has to branch on the outer prop rather than letting the signal say "nothing right now". Flagged as a decision to confirm rather than a defect; confirmed as the intended discipline.
- **33 — `SVGFilterDefsFactory` is the only class.** It has genuine mutable accumulation state, so a class is defensible. The nine arrow-function class fields cost one closure each per instance; a closure-based factory would allocate the same.
- **34 — no tests.** Acknowledged and not being taken on. Worth knowing what it costs: **12** shipped as fixed when it wasn't, and **13**, **14** and **9** are all the kind of thing one assertion pins down permanently. Verification in this log is bundle inspection and typechecking, which catches shape but not behaviour.

# Architecture

## 36. `InteractionUtils` and `Button` overlap, and neither covers non-button controls

_Raised 2026-08-04, deferred by agreement. Nothing here has been implemented. Written to be
picked up without the conversation that produced it — read the three files below first and
the rest should stand on its own._

**The files.**

- [Interaction.utils.ts](src/Lib/Abstracts/Interaction/Interaction.utils.ts) — `wrapElement`
- [Button.tsx](src/Lib/Fundamentals/Button/Button.tsx) / [Button.types.ts](src/Lib/Fundamentals/Button/Button.types.ts)
- [Tooltip.tsx](src/Lib/Fundamentals/Tooltip/Tooltip.tsx) — what any control needs to anchor

**Where it stands.** `InteractionUtils.wrapElement` points at any element and reports how the user is interacting with it — hovered, focused, active. `Button` renders its own markup, wires up a `Tooltip`, and hosts a highlight — and doesn't use `wrapElement` at all. So the two overlap in intent while sharing no code, and between them they cover exactly one kind of control.

The trigger for raising it: custom toggles, checkboxes and radios are planned, and each would currently have to reimplement `Button`'s tooltip and state wiring by hand.

Three concrete gaps:

- A tooltip can only be had by using `Button`. An `<input>`, a checkbox, a custom toggle — none can have one without duplicating `Button`'s wiring.
- `wrapElement` imperatively sets `role="button"`, `tabIndex`, `aria-disabled` and `cursor` unless told to skip. That's right for making a plain `div` behave like a button and wrong for everything else: forcing `role="button"` onto an `<input>` actively breaks it.
- `Button` takes its interaction state as props (`isPressed`, `hasError`, `isDisabled`) while `wrapElement` derives it from real events. Nothing reconciles the two.

**Proposal — split behaviour from element.** The concerns that repeat across every control are: interaction state, an anchored tooltip, state-driven decoration, and accessibility wiring. None depend on _which_ element it is. Only the element and its semantics differ.

_Layer 1 — behaviour._ `wrapElement` keeps doing what it does, minus the opinions. The role / tabIndex / cursor block becomes opt-in for the "I'm making a div act like a button" case rather than the default, because native controls already carry correct semantics.

_Layer 2 — a shell._ One component owning the wrapper element, the tooltip, and the highlight, with the consumer supplying only the control itself:

```tsx
<Control
    getIsDisabled={...}
    getTooltipDefs={...}
    renderHighlight={...}
    renderControl={(setRef, getFlags) => <input ref={setRef} type="checkbox" />}
/>
```

`Button` then becomes a thin preset over `Control` that renders a `<button>`, and `Checkbox` / `Radio` / `Toggle` are the same shape with different elements. Tooltip support arrives for all of them at once, from one place.

**Open questions, for whoever picks this up:**

1. Does `Control` own a wrapper element? It needs one to anchor the tooltip and position the highlight, and `Button` already has one — but it means every control carries an extra node.
2. Do flags flow out of the shell (derived from events) or in as props? `isPressed` / `hasError` are genuinely the owner's state, while hover / focus / active are genuinely the element's. Probably both, merged — worth being explicit about which side wins.
3. Does `Button` stay a component in its own right, or become an alias thin enough to drop?

---

# Settled conventions (API naming)

Recorded so they don't get raised again.

### `AccessorProps`

Skips **only** functions and symbols (already reactive accessors / never-reactive callbacks, or symbols). Everything else is accessorized to `getX`.

Arrays, `Set`, `Map`, `Date`, `Node` / `HTMLElement`, and plain objects are all accessorized. Refs are declared as `elementRef: HTMLElement | undefined` / `anchorRef: HTMLElement | undefined` and become `getElementRef` / `getAnchorRef`.

### Prop prefixes

| Kind                                          | Prefix                        | Examples                                                                                                                                                                                                          |
| --------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reactive data (via `AccessorProps`)           | `get*`                        | `getIsVisible`, `getJoinRadii`, `getHrefs`, `getVisibleCorners`                                                                                                                                                   |
| Factories / predicates / transforms with args | `compute*`                    | `computePoints`, `computeFillDefs`, `computeStrokeDefs`, `computeIsDisabled`, `computeZIndex`, `computeClassNames`, `computeRootAnimation`, `computeScanlineAnimation`, `computeSVGDefs`, `computeLinearGradient` |
| Events / lifecycle                            | `on*`                         | `onShow`, `onHide`, `onClick`; **`onMount` for controller handoff** (AudioSwitcher / Typewriter / ScanlineAnimation)                                                                                              |
| JSX producers                                 | `render*`                     | component `renderContent` / `renderTab`; nested defs use `renderDefsElement`                                                                                                                                      |
| Two-way state the component also writes       | `*Signal` (plain, unprefixed) | `visibilitySignal`; future `checkedSignal`, `valueSignal`                                                                                                                                                         |

One `compute*` prefix for all factories — reactivity is carried by **argument shape** (`size` vs `getSize`), not by a second prefix.

### Signal tuples for two-way state

State the component both reads _and_ writes arrives as the whole `createSignal` pair, not an
accessor plus a callback:

```tsx
const modalVisibility = createSignal(false);

<Modal visibilitySignal={modalVisibility} ... />
```

`AccessorProps` skips it like it skips functions, so the prop keeps its plain name. There is
one variable and both sides can write it, so owner and component cannot disagree — and there
is no handler to forget. Callers that only ever open the thing can drop the getter entirely:
`const [, setModalOpen] = modalVisibility`.

Use it only where the component genuinely needs to write. One-way data stays `get*`.

The cost, accepted: the owner has to _have_ a signal. Visibility derived from a memo, a store
field or a route param has no setter to hand over, and would need a signal kept in sync.

### Accessor vs plain callback args

Ask: **who needs to track this value, and when?**

- **Accessor** — parent passes a signal/memo _without reading it_; callee may subscribe later.
- **Plain value** — parent already reads in the same memo/effect, or the value cannot change during the call.

Mental shortcut: **if calling `fn(x())` would lose a subscription the callee needs, pass `x`. Otherwise pass `x()`.**

| Argument                                          | Where                                               | Shape                         |
| ------------------------------------------------- | --------------------------------------------------- | ----------------------------- |
| `getVisibilityTarget` / `getTransitionDurationMs` | Modal / Tooltip / ElementHighlight render callbacks | accessor                      |
| `getPlacement`                                    | `Tooltip.renderContent`                             | accessor                      |
| `getSize` / `getClipPath` / `getClipPoints`       | `Shape.renderChildren`                              | accessor                      |
| `getSize`                                         | `computeFillDefs` / `computeStrokeDefs`             | accessor (optional subscribe) |
| `getInteractionFlags`                             | sample `computeSVGDefs`                             | accessor                      |
| `index`                                           | `Tabs.renderTab`, `computeIsDisabled`               | plain                         |
| `placement`                                       | `computeZIndex`                                     | plain                         |
| `size`                                            | `computePoints`                                     | plain                         |
| `timeline` / `index`                              | Scanline `compute*Animation`                        | plain                         |

### Hook-like util arg order

`ref` (if any) → enabled / visible / disabled → opts / defs. Prefer `getIsDisabled` over `getIsEnabled`.

Examples: `ElementObserver(ref, visible, opts)`, `Interaction.wrapElement(ref, disabled, opts)`, `Focus.autoFocus(ref, visible)`, `ElementFader(visible, opts)`, `FPS.createMonitor(disabled, opts)`.

### SVG / factory arg order

Primary args → **defs** → **opts** → **extra** (injected elements / custom render logic) absolute last.

Merging defs and opts is desirable later but is a deeper refactor — keep them separate for now.

Examples: `computeLinearGradient(defs, custom?)`; `add*Filter(defs, custom?)`; sample `computeSVGDefs(id, flags, defs)`; `computeBreakpoints(type, idx, lineCount, defs, opts?)`; animation helpers `(…, defs)`.

---

# Fixed

## Build pipeline — 2026-08-04

**4 — the published `dist` compiled JSX to `React.createElement`.** `tsup.config.ts` ran plain esbuild, which knows nothing about `babel-preset-solid`; with `jsx: "preserve"` in `tsconfig.json` — which esbuild can't honour when emitting `.js` — it fell back to the classic transform with the default factory. There was no `React` in scope and Solid expects compiled templates rather than a createElement tree, so every component threw on first render. Invisible in development, because the Playground goes through Vite + `vite-plugin-solid`.

**5 — the whole vanilla-extract runtime was bundled into `dist`.** `@vanilla-extract/css` and `@vanilla-extract/dynamic` are devDependencies, and tsup only externalises `dependencies` + `peerDependencies`, so the style-generation runtime was inlined along with `@emotion/hash`, `css-what`, `dedent`, `deepmerge`, `lru-cache`, `media-query-parser` and `modern-ahocorasick` — the bulk of the 341 KB bundle. Styles were generated and injected at runtime, and no stylesheet shipped at all.

Both had the same root cause — the library was built by a toolchain that couldn't run either compiler — so both took the same fix. `vite.lib.config.ts` now builds the JS + CSS in Vite library mode with `solid()` and `vanillaExtractPlugin()`, the same plugins the Playground already used. `tsup` is kept solely for declarations (`dts: { only: true }`, `clean: false`, and it runs _second_ — Vite's `emptyOutDir` is what clears `dist`, so re-enabling `clean` here would wipe the JS and CSS).

Peer dependencies plus their subpaths (`solid-js/web`, `solid-js/store`) are externalised through a predicate rather than a literal list, so `solid-js/*` can't accidentally get inlined.

Result: `dist/index.js` 341 KB → 171 KB, with zero bundled `node_modules`, zero `React.` references, real `template()` / `insert()` / `delegateEvents()` Solid output, and a genuine `dist/index.css` (3.5 KB). `npm run build:playground` is unaffected.

Two notes carried forward. The CSS is currently only reachable as `@thewaver/ss-components/dist/index.css`; a proper subpath belongs with **7**. And verification was by bundle inspection plus a clean rebuild — an executed render smoke test needs a DOM, and the repo has no test environment (**34**).

## 6 — showcase samples out of the library entry — 2026-08-04

`SVGDefs.const.tsx` (2534 lines) moved to `src/Playground/App/Samples/`, and `ScanlineAnimationKeyframes` moved out of `ScanlineAnimation.utils.ts` to `Samples/ScanlineAnimation.const.ts` alongside it. Because both were `namespace`s — IIFEs assigning onto one object — no bundler could tree-shake any of it: importing a single `Button` pulled the whole showcase in.

Note for future moves: the editor's auto-import-update rewrote `index.ts`'s re-export to point at the file's _new_ home rather than dropping it, leaving `export * from "../Playground/App/Samples/SVGDefs.const"` — the library still shipped the samples, now with `Lib` reaching into `Playground`. Removing that line is what actually closed the item.

`dist/index.js` 171 KB → 110 KB, `index.d.ts` 53 KB → 24 KB. Playground unaffected — it imports the samples directly, never through `Lib`.

This also retired **30** (empty `*Opts` types and commented-out defaults), which travelled with `ScanlineAnimationKeyframes`.

## 7, 8, 9 — 2026-08-04

**8 — `AnimDirection` unexported.** `export type * from "./Abstracts/Anim/Anim.types"` added to `index.ts`.

**9 — `spreadKind` leaked onto the gradient element.** Now destructured out in both `computeLinearGradient` and `computeRadialGradient`, with the branch reading the local instead of `defs`. `spreadMethod` still passes through in `baseProps`, which is correct — it's a real SVG attribute. (`computeRadialGradient` still destructures `origin` and then reads `defs.origin` on the next line; harmless, worth tidying whenever that file is next open.)

**7 — no `exports`, no `sideEffects`.**

```json
"exports": {
    ".":              { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./styles.css":   "./dist/index.css",
    "./package.json": "./package.json"
},
"sideEffects": ["**/*.css"]
```

`main` and `types` stay for resolvers that predate `exports`. Three things change for consumers: the stylesheet gets a real name (`@thewaver/ss-components/styles.css`, closing the note left by **5**), deep imports into `dist/` are now blocked so internals stop being accidental API, and `sideEffects` lets bundlers drop unused exports while keeping the CSS.

`"**/*.css"` rather than `false` is deliberate: `false` would let a bundler shake out a consumer's `import ".../styles.css"` and silently un-style the app.

Verified with `import.meta.resolve` — root and both subpaths resolve, `dist/index.js` no longer does.

Not addressed, and worth knowing: the build is DOM-only, so there's no `solid` or SSR condition in the map. Server rendering would need a second build from source. Pre-existing, not a regression.

## 10, 11, 12 — 2026-08-04

**11 — `Tooltip` wrote `top: undefinedpx` on first paint.** `?? 0` on both axes.

**12 — `Tabs` decided anchor-vs-button once.** First attempt made `isLink` a `createMemo`, which was necessary but not sufficient: the branch was still a bare ternary in the `<For>` callback's _return_ position, so it was evaluated eagerly exactly once. Solid's compiler wraps JSX expressions nested inside JSX in getters — a ternary returned from a callback gets nothing, so the memo tracked but nothing subscribed. Now a `<Show>`, which supplies the reactive scope. Unkeyed on purpose: it rebuilds only when the branch flips, so an href changing from one string to another updates in place through the getter.

Worth remembering as a general trap — _making a value reactive does nothing unless something reactive reads it_. Compiled output is the quickest way to settle it: look for a `get when()` / getter wrapper, and if the expression sits bare in a `return`, it runs once.

**10 — `createAnimateDefs` leaked elements, listeners and a rAF.** `elements` is now a `Set`, and the `ref` callback registers `onCleanup` to cancel the pending frame, remove the `endEvent` listener, and delete itself from the set.

This works because Solid invokes refs inside a `createRenderEffect` (via `spread` → `use`), so there is a live owner, and it's a child of the `<Show keyed>` computation — exactly the scope that gets disposed on rebuild. `use` wraps in `untrack`, which drops tracking but keeps the owner, so `onCleanup` still lands correctly.

`getLeadElement()` replaces `elements.find(c => c.isConnected)` and keeps the `isConnected` guard even though membership is now accurate: during a keyed rebuild the outgoing and incoming elements briefly coexist, and cleanup can run after detachment.

## 13–21 — 2026-08-04

**13 — `ScreenWiper` under-covered, and its completion latch was baked in at creation.** Column and row counts now `Math.ceil` (a fractional `{ length }` truncates, dropping the right-hand strip), with even rows keeping the extra column their half-cell shift needs. `renderCell` also lost its two unused parameters and now reads the shape from a memo instead of re-resolving per cell.

The latch is covered separately below — the first attempt at it was wrong.

**14 — `t` unclamped.** `Math.min(1, …)`, so the last frame lands on the end of the timeline instead of past it.

**15 — `AudioSwitcher`.** Cleanup now clears `src` and calls `load()` on both elements; pausing alone leaves the media buffered and resident. The first switch no longer fades out an element that never played — a fresh `Audio` starts at volume 1, so that was spinning an interval to walk a silent, paused element down to zero.

**16 — `ImageSwitcher` preload.** Gained `onerror` and an `onCleanup` that nulls the handlers and clears `src`, matching `ColorExtractor`. This forced the comparison against `getCurrentImage()` to become `untrack`ed: the effect writes the signal it reads, and that extra pass — previously harmless, and recorded under _Checked and deliberately not flagged_ — would now fire the cleanup and cancel the preload it had just started. Worth noting as a general hazard: a benign self-triggering effect stops being benign the moment you give it a cleanup.

The src-less `<img>` on first paint is untouched. It's transparent and `alt=""`, so it's cosmetic.

**18 — `buttonRoot` selectors.** Now `:has(> button:not([disabled]))`. Both halves of the original were dead: a `div` never carries `[disabled]`, and `&:focus-visible` never matched because the wrapper isn't focusable.

**19 — `Typewriter` per-character `<For>`.** Now `<Index>`. Position is the identity; `For` reconciles by value and repeated characters gave it duplicate keys it couldn't match stably.

**20 — `Viewport` throttle.** `FunctionUtils.trailingThrottle` returns a plain function with no cancel handle, so the fix is a `isDisposed` flag the callback checks.

**21 — `FocusUtils`.** Selector gained `audio[controls]`, `video[controls]`, `details > summary`, `iframe`, `object`, `embed` and `[contenteditable]`, and the bare `[href]` narrowed to `a[href]` / `area[href]` so it stops matching `<link>`. Results are now filtered through `isReachable`, which drops `display: none`, `visibility: hidden`, `inert` and `aria-hidden` subtrees — a trap that lands focus on an invisible element strands the user with nowhere visible to go.

`autoFocus`'s restore-focus `onCleanup` also moved below the visibility guard. At the top of the effect it ran on _every_ re-run, so a ref change while the element stayed visible yanked focus back to whatever was active before. It now also checks `isConnected` before restoring.

## 17 — visibility is a signal tuple — 2026-08-04 (breaking)

`Modal` and `ElementHighlight` take `visibilitySignal: Signal<boolean>` — the whole
`createSignal` pair — in place of `getIsVisible`. Escape and overlay clicks set it to false
themselves. One variable, both sides can write it, so they cannot disagree.

Two earlier attempts at this are worth recording, because both were worse and the reasons
generalise.

_Attempt one:_ leave the component hiding itself and warn when the owner looked out of sync.
Too weak — the warning only fired when `onHide` was absent entirely, so anyone who wired
`onHide` for something other than syncing state still got the silent version.

_Attempt two:_ an `onDismiss` callback that only asks, leaving the owner to set the flag. This
shipped briefly and was rejected on review, correctly: it still had to be wired, exactly like
`onHide` did. It converted a delayed confusing failure (the modal closes, the owner still
thinks it's open, and it can never reopen) into an immediate obvious one (Escape does
nothing) — but it did not remove the requirement, it moved it.

The signal tuple deletes the requirement. Nothing to wire means nothing to forget.

`onDismiss` is gone. `onShow` / `onHide` are now purely "it's happening", which is what
`StressTest` wanted anyway — its `onHideModal` / `onShowModal` start and stop the scanline
controllers and had been tangled together with the state flip in one handler.

`AccessorProps` grew a `Signal<any>` carve-out so the prop keeps its plain name; arrays,
`Set`s and plain objects still accessorize as before. See _Settled conventions_.

Three of the four Playground call sites no longer read visibility at all — they only ever
open the thing, so they destructure `const [, setModalOpen] = modalVisibility`. `StressTest`
keeps the getter because it gates FPS monitoring on the modal being open and settled.

## API consistency pass

- **`AccessorProps` skip list** — only functions and symbols. Arrays / `Set` / `Node` accessorize; removed the accidental `JSX.Element` skip and the `Node` carve-out.
- **`compute*` renames** — Shape/Surface fill/stroke/points; Tabs `computeIsDisabled`; Tooltip `computeZIndex`; RichText `computeClassNames`; Scanline `computeRootAnimation` / `computeScanlineAnimation` (+ utils `computeHorizontal*`); SVG samples `computeSVGDefs` / `computeDefs`; gradient/pattern/animation/filter builders `compute*`; `renderDefsElement` on `SVGDefs` entries.
- **Refs via `AccessorProps`** — `elementRef` / `anchorRef` raw shapes → `getElementRef` / `getAnchorRef`.
- **Controller handoff** — `getController` → `onMount` (kept; Solid's `onMount` is the import, `props.onMount` is the callback).
- **Hook-like arg order** — ref → visible/disabled → opts; FPS uses `getIsDisabled`.
- **`computeBreakpoints`** — `(type, idx, lineCount, defs, opts?)` — defs then opts.
- **Local helpers in `SVGDefs.const`** — `getBaseBlur` / `getBaseBorderColor` / `getBaseBackgroundColor` stay `get*` (locals, not public factories).

## Earlier

- **`ElementFader` fired `onHide` twice per close.** Guarded on a plain `pendingTarget`.
- **`AudioSwitcher` could install a fade for a source that had already been replaced.** Guarded by `if (element !== getActiveElement()) return`.
- **`Tabs` floater missed non-resize movement.** Root `ResizeObserver` added.
- **`Tabs` keyboard navigation.** Roving `tabIndex`, arrows / Home / End, disabled skipped.
- **`createAnimateDefs` stale element / early index advance.** One live element drives the group.
- **`ScanlineAnimation` unnamed image.** Optional `ariaLabel`.
- **`Modal` accessible name.** Optional `ariaLabel` / `ariaLabelledBy` + warn.
- **`Typewriter` code units vs code points.** `itemCount` uses `Array.from(...).length`.
- **`RichText` invented closing tags when unwinding.** Recursive `stringifyNode`.
- **`InteractionUtils` pressed flag after blur.** Cleared in `onBlur`.
- **`ColorExtractor` cleanup.** `onerror` cleared, `src` reset; exposes `getError`.
- **`useViewportWithFallback` dead `props`.** Removed.
- **`ScanlineAnimation` container ref type.** `HTMLElement`.
- **Dead `?? 0` on `getSize()`** in Tooltip / ScreenWiper.

`AudioSwitcher` fade handles · `Tabs` click / aria / disabled · `RichText` warns on discard · banded gradient stop ids · `cycleSmoothColors` · `feDropShadow` takes `in` · hover/focus reset when disabled · Enter/Space only · `Button` wires `getId` · `ElementFader` single `setTarget` · Surface mock-size inspection allocates description objects only (`renderDefsElement` lazy).

---

# Closed as intended

Settled in discussion. Recorded so they don't get raised again.

- **`RichText` discards overlapping tag content** — authors have escape mechanisms for literal brackets. It warns now, which was the whole ask.
- **Fades don't retarget mid-transition** (`AudioSwitcher`) — freezing the target at the start is the point.
- **`ElementObserver` measures every visible element every frame** — cost doesn't accumulate with one tooltip visible.
- **`Shape`'s `getPaths()[0]` doubles as the fill and clip path** — by design.
- **`SVGDefs.const.tsx` repetition** — showcase file; standalone samples beat deduplication. (Whether it belongs in the public entry is a separate question — see **6**.)
- **`assignAnimationProps` doesn't clear missing keys** — measured faster; consumer returns consistent keys.
- **`SVGBaseFilterDefs` empty type** — future-proofing.
- **Isolate-mode `feMerge` layering** — registration order on purpose.
- **`AccessorProps` kept** — with the narrowed skip list and `compute*` / `on*` / `render*` for non-accessor functions.
- **`onMount` for controllers** — kept despite Solid's import of the same name; do not rename to `onControllerReady`.
- **`ElementHighlight` calls `renderOverlay` once per segment** — eight mask segments is the design.
- **`Surface` inspects defs with a 0×0 mock size** — the div path only reads `color` / `opacity`, and `renderDefsElement` stays lazy.

# Checked and deliberately not flagged

- The `untrack` in `ScreenWiper`'s direction effect is correct usage.
- `equals: Rect.isSame` / `Size2d.isSame` on observer signals.
- `RichText` renders as text nodes, not `innerHTML`.
- `Shape`'s path cache keyed on floored thicknesses.
- `AudioSwitcher`'s same-signal read/write settles after one extra pass. (`ImageSwitcher`'s no longer applies — see **16**; it now reads `untrack`ed.)
- `createMemo` around a single prop default, and memoised controller objects with no dependencies, are house style.
- `Shape`'s `zipArray("stretch", …)` can't produce fewer pairs than stroke defs, so `getPaths()[getIndex()]` is in range.
- `InteractionUtils` re-registers listeners on every effect run — Solid's `onCleanup` removes the previous set first.
- `FPSUtils` resets its average when the tab regains visibility — per-session average is the useful number.
