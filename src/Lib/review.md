# Lib code review

Running log of open issues and opportunities for `src/Lib`. Resolved entries (fixed, dropped or
closed) are deleted once settled; remaining open work is renumbered to stay contiguous from 1.

Last full pass: **2026-08-04** — whole `src/Lib`, every file read, plus the built `dist` output.
It raised thirteen findings; twelve were fixed on **2026-08-05** and deleted from this file per
the convention above, and one — a disabled `Button` being unable to show its tooltip — was folded
into the `InteractionWrapper` split, done **2026-08-05** and likewise deleted. Everything still
open predates that pass.

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

### Controls: wrapper owns behaviour, leaf owns the element

Settled **2026-08-05** when `InteractionWrapper` was split out of `Button`.
`Checkbox` / `Radio` / `Toggle` land later as different leaves in the same wrapper.

**The composition is an implementation detail, not the consumer's job.** `Button` _is_
`InteractionWrapper` wrapping a private `ButtonElement`, and consumers write `<Button {...props} />`
exactly as before the split. Leaf-only with no preset was tried first and reverted the same day: it
pushed a six-line `renderControl` block into all eight call sites and put `setElementRef` / `getFlags`
/ `getIsReachable` — wiring that should be opaque — in the consumer's face. This follows `Surface`,
which composes `Shape` and keeps `SurfaceSVG` / `SurfaceDiv` as unexported locals in its own file.
`ButtonElement` is likewise unexported; `InteractionWrapper` stays public for custom controls.

**What the wrapper hands a leaf is the wrapper's type, not the leaf's.** `InteractionControlProps`
(`id` / `flags` / `isReachable` / `ref`) lives in `InteractionWrapper.types.ts`, declared
unaccessorized so each leaf applies `AccessorProps` itself — `ButtonElementProps =
AccessorProps<ButtonCbs & InteractionControlProps>`. Anything applicable to every wrapped element
belongs there; only genuinely element-specific props (`ButtonCbs`) stay with the leaf. The public
`ButtonProps` is then derived rather than restated — `Omit<InteractionWrapperProps, "renderControl">
& AccessorProps<ButtonCbs & { id?: string }>` — so wrapper props reach `Button` consumers
automatically as the wrapper grows.

**The tooltip anchors on the leaf, not the wrapper.** Anchoring on the wrapper div was considered
and rejected: it drags in four changes to `Tooltip` (`focusin`/`focusout` instead of `focus`/`blur`,
a `:has(:focus-visible)` guard, rerouting `aria-describedby` back to the control, and losing
`pointer-events: none` on the root so the hover region grows to the wrapper box). `Tooltip` was not
modified at all by the split — keep it that way.

**Disabled is a mechanism choice, exposed per instance.** Native `disabled` blocks activation for
free but kills every event, so the tooltip explaining _why_ a control is disabled becomes
unreachable exactly when it matters. `aria-disabled="true"` keeps the element live and focusable
but moves click gating into JS. Native stays the default so nothing shifts silently:

```
reachable = isDisabled && isReachableWhenDisabled && tooltipDefs !== undefined
```

Deriving the mode from `getTooltipDefs` presence _alone_ was rejected, and the distinction
generalises: **presence as a trigger fails invisibly** — add hover text, and disabled semantics
change under you — while **presence as a guard fails toward the safe default**, only when a prop
was explicitly set, and is findable with a warning. The third clause exists because a focusable
`aria-disabled` control with nothing to reveal is strictly worse than one skipped by the tab order.
Two cases it knowingly shuts out, each earning its own prop if it ever shows up rather than a
loosening: an explanation living elsewhere on the page (inline error, validation summary) that only
needs `aria-describedby`, and composite widgets where skipping disabled items makes the set read as
incomplete. A control that is reachable while disabled must keep its focus ring — focus landing
somewhere invisible is worse than being skipped.

**Render props receive what drives them.** `renderDecoration(getFlags)` replaced `Button`'s
zero-argument `renderHighlight()`, under which the pressed linkage was faked consumer-side —
`ButtonPage` closed over its own signal for the colour and passed the same signal again as
`getIsPressed`, with the component connecting neither. Renamed because
`ElementHighlight.renderHighlight` already means `(getVisibilityTarget, getTransitionDurationMs)`,
and two contracts under one name is a trap.

**The decoration slot belongs to the wrapper for a structural reason**, not because `Button` needed
it: it requires `position: relative` on the root plus `inset: 0` on the overlay, and inherits
`pointer-events: none` so it never eats clicks — all wrapper properties a leaf cannot provide
without becoming a wrapper itself. One slot, not layered slots; a fragment covers multiple
decorations, and ordering waits until something needs it. Marker classes (`interactionPressed`,
`interactionError`, `interactionDisabled`) stay alongside it as the cheap path for anything CSS can
express: slot for structure, classes for styling.

**Flags merge, external wins.** `isPressed` / `hasError` / `isDisabled` are the owner's;
`isHovered` / `isFocused` / `isActive` are the element's. `wrapElement` keeps its listeners attached
while disabled so hover and focus stay live in reachable mode, forcing `isActive` false rather than
tearing down. Its role / tabIndex / cursor block is opt-in via `applyButtonSemantics` — right for a
div acting as a button, wrong everywhere else, since forcing `role="button"` onto an `<input>`
breaks it and native controls already carry correct semantics.
