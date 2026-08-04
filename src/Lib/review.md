# Lib code review

Running log of open issues and opportunities for `src/Lib`. Resolved entries (fixed, dropped or
closed) are deleted once settled; remaining open work is renumbered to stay contiguous from 1.

Last full pass: **2026-08-04** — whole `src/Lib`, every file read, plus the built `dist` output.
It raised thirteen findings; twelve were fixed on **2026-08-05** and deleted from this file per
the convention above, and one was folded into **3**, which is where the work actually belongs.
Everything still open predates that pass.

Verification for the fixes: typecheck clean, `build:lib` clean (115.9 KB JS, 3.8 KB CSS, all
peers external, no `React.` references), `build:playground` clean, and the `RichText` parser
re-run standalone across nine inputs — the crash gone, every pre-existing behaviour unchanged.
Nothing was observed in a browser; there is no test environment. So the reactivity and pointer-
event fixes are reasoned about and typechecked, not seen working.

Two of the twelve were reworked after review and are worth knowing about, since the shipped code
is not what was first proposed:

- **`AudioSwitcher` fades are now per-element** — a `Map<HTMLAudioElement, { handle, direction }>`
  replacing the two module-level interval handles. The first attempt kept the shared handle and
  force-ended the competing fade, which dodged the collision by truncating the outgoing track
  instead of fixing it. The global handles encoded "at most one fade-in and one fade-out
  _overall_", which breaks the moment two elements both need to go down — pause during a track
  switch. Per-element is the invariant that's actually true, and it makes the existing crossfade
  honest rather than accidental.
- **The `Tabs` floater fix was dropped** — `tabsRoot` is `display: flex` with no size constraints,
  so gap and direction changes resize its content box and the existing root `ResizeObserver`
  already catches them. Adding them as effect dependencies was redundant, and cost an observer
  teardown per change.

### Index

**Carried over**

1. `ScreenWiper` renders a few hundred inline SVGs — _deferred_
2. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
3. `InteractionUtils` and `Button` overlap, and neither covers non-button controls — _deferred, written up to be picked up cold_

---

## 1. `ScreenWiper` renders a few hundred inline SVGs

_Deferred — noted, not expected to be actioned soon._

At 1920×1080 with the default 120px cell that's roughly 17 columns × 19 rows, each an `<svg>` with a shape inside and its own CSS transition — about a thousand nodes animating at once.

`SVGPatternDefsUtils` already exists and does exactly this job: one `<svg>` with a tiled pattern would replace the whole grid. For the circle variant, a CSS `radial-gradient` background would too.

Worth measuring before rewriting. The correctness problems in the same component (grid coverage, completion latch) were fixed separately; this is purely the node count.

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

---

## 3. `InteractionUtils` and `Button` overlap, and neither covers non-button controls

_Raised 2026-08-04, deferred by agreement. Nothing here has been implemented. Written to be
picked up without the conversation that produced it — read the three files below first and
the rest should stand on its own._

**The files.**

- [Interaction.utils.ts](src/Lib/Abstracts/Interaction/Interaction.utils.ts) — `wrapElement`
- [Button.tsx](src/Lib/Fundamentals/Button/Button.tsx) / [Button.types.ts](src/Lib/Fundamentals/Button/Button.types.ts)
- [Tooltip.tsx](src/Lib/Fundamentals/Tooltip/Tooltip.tsx) — what any control needs to anchor

**Where it stands.** `InteractionUtils.wrapElement` points at any element and reports how the user is interacting with it — hovered, focused, active. `Button` renders its own markup, wires up a `Tooltip`, and hosts a highlight — and doesn't use `wrapElement` at all. So the two overlap in intent while sharing no code, and between them they cover exactly one kind of control.

The trigger for raising it: custom toggles, checkboxes and radios are planned, and each would currently have to reimplement `Button`'s tooltip and state wiring by hand.

Four concrete gaps:

- A tooltip can only be had by using `Button`. An `<input>`, a checkbox, a custom toggle — none can have one without duplicating `Button`'s wiring.
- **A disabled `Button` can't show its tooltip at all.** `disabled={props.getIsDisabled?.()}` goes on the native `<button>` ([Button.tsx:24](src/Lib/Fundamentals/Button/Button.tsx#L24)), and `Tooltip` drives visibility off `mouseenter` / `focus` bound to that same element ([Tooltip.tsx:165](src/Lib/Fundamentals/Tooltip/Tooltip.tsx#L165)). A disabled button fires neither and isn't focusable, so the tooltip is unreachable exactly when it's most useful — explaining _why_ the control is disabled. Raised on its own in the 2026-08-04 pass and folded in here rather than patched: every available fix moves the tooltip anchor off the `<button>`, which is precisely the split this item proposes. Doing it twice is the only way to get it wrong.
- `wrapElement` imperatively sets `role="button"`, `tabIndex` and `aria-disabled` unless told to skip. That's right for making a plain `div` behave like a button and wrong for everything else: forcing `role="button"` onto an `<input>` actively breaks it. (The `cursor` write in the same block was corrected independently — it now sets `not-allowed` when disabled instead of always `pointer` — but it's still an opinion that belongs behind the opt-in.)
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
