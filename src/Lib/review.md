# Lib code review — remaining items

Most prior items are fixed — see **Fixed** and **Closed as intended**. Three are left.

### Index

1. `ScreenWiper` renders a few hundred inline SVGs — *deferred*
2. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — *parked*
3. Relative colour syntax in component code (`Surface`) — *needs a choice*

---

## Settled conventions (API naming)

Recorded so they don't get raised again.

### `AccessorProps`

Skips **only** functions and symbols (already reactive accessors / never-reactive callbacks, or symbols). Everything else is accessorized to `getX`.

Arrays, `Set`, `Map`, `Date`, `Node` / `HTMLElement`, and plain objects are all accessorized. Refs are declared as `elementRef: HTMLElement | undefined` / `anchorRef: HTMLElement | undefined` and become `getElementRef` / `getAnchorRef`.

### Prop prefixes

| Kind | Prefix | Examples |
| --- | --- | --- |
| Reactive data (via `AccessorProps`) | `get*` | `getIsVisible`, `getJoinRadii`, `getHrefs`, `getVisibleCorners` |
| Factories / predicates / transforms with args | `compute*` | `computePoints`, `computeFillDefs`, `computeStrokeDefs`, `computeIsDisabled`, `computeZIndex`, `computeClassNames`, `computeRootAnimation`, `computeScanlineAnimation`, `computeSVGDefs`, `computeLinearGradient` |
| Events / lifecycle | `on*` | `onShow`, `onHide`, `onClick`; **`onMount` for controller handoff** (AudioSwitcher / Typewriter / ScanlineAnimation) |
| JSX producers | `render*` | component `renderContent` / `renderTab`; nested defs use `renderDefsElement` |

One `compute*` prefix for all factories — reactivity is carried by **argument shape** (`size` vs `getSize`), not by a second prefix.

### Accessor vs plain callback args

Ask: **who needs to track this value, and when?**

- **Accessor** — parent passes a signal/memo *without reading it*; callee may subscribe later.
- **Plain value** — parent already reads in the same memo/effect, or the value cannot change during the call.

Mental shortcut: **if calling `fn(x())` would lose a subscription the callee needs, pass `x`. Otherwise pass `x()`.**

| Argument | Where | Shape |
| --- | --- | --- |
| `getVisibilityTarget` / `getTransitionDurationMs` | Modal / Tooltip / ElementHighlight render callbacks | accessor |
| `getPlacement` | `Tooltip.renderContent` | accessor |
| `getSize` / `getClipPath` / `getClipPoints` | `Shape.renderChildren` | accessor |
| `getSize` | `computeFillDefs` / `computeStrokeDefs` | accessor (optional subscribe) |
| `getInteractionFlags` | sample `computeSVGDefs` | accessor |
| `index` | `Tabs.renderTab`, `computeIsDisabled` | plain |
| `placement` | `computeZIndex` | plain |
| `size` | `computePoints` | plain |
| `timeline` / `index` | Scanline `compute*Animation` | plain |

### Hook-like util arg order

`ref` (if any) → enabled / visible / disabled → opts / defs. Prefer `getIsDisabled` over `getIsEnabled`.

Examples: `ElementObserver(ref, visible, opts)`, `Interaction.wrapElement(ref, disabled, opts)`, `Focus.autoFocus(ref, visible)`, `ElementFader(visible, opts)`, `FPS.createMonitor(disabled, opts)`.

### SVG / factory arg order

Primary args → **defs** → **opts** → **extra** (injected elements / custom render logic) absolute last.

Merging defs and opts is desirable later but is a deeper refactor — keep them separate for now.

Examples: `computeLinearGradient(defs, custom?)`; `add*Filter(defs, custom?)`; sample `computeSVGDefs(id, flags, defs)`; `computeBreakpoints(type, idx, lineCount, defs, opts?)`; animation helpers `(…, defs)`.

---

## 1. `ScreenWiper` renders a few hundred inline SVGs

*Deferred — noted, not expected to be actioned soon.*

At 1920×1080 with the default 120px cell that's roughly 17 columns × 19 rows, each an `<svg>` with a shape inside and its own CSS transition — about a thousand nodes animating at once.

`SVGPatternDefsUtils` already exists and does exactly this job: one `<svg>` with a tiled pattern would replace the whole grid. For the circle variant, a CSS `radial-gradient` background would too.

Worth measuring before rewriting.

---

## 2. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written

*Acknowledged and parked — the current behaviour is correct, so this is about where the behaviour comes from rather than a bug.*

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

## 3. Relative colour syntax in showcase only

Library `Surface` div path now sets colour/opacity via CSS vars and a vanilla-extract fallback array — solid colour first, `rgb(from …)` second — so older browsers stay opaque instead of breaking. Showcase / Playground / `SVGDefs.const.tsx` still use relative colour freely.

---

# Fixed

## In this pass (API consistency)

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
- **`SVGDefs.const.tsx` repetition** — showcase file; standalone samples beat deduplication.
- **`assignAnimationProps` doesn't clear missing keys** — measured faster; consumer returns consistent keys.
- **`SVGBaseFilterDefs` empty type** — future-proofing.
- **Isolate-mode `feMerge` layering** — registration order on purpose.
- **`AccessorProps` kept** — with the narrowed skip list and `compute*` / `on*` / `render*` for non-accessor functions.
- **`onMount` for controllers** — kept despite Solid's import of the same name; do not rename to `onControllerReady`.

# Checked and deliberately not flagged

- The `untrack` in `ScreenWiper`'s direction effect is correct usage.
- `equals: Rect.isSame` / `Size2d.isSame` on observer signals.
- `RichText` renders as text nodes, not `innerHTML`.
- `Shape`'s path cache keyed on floored thicknesses.
- `ImageSwitcher` / `AudioSwitcher` same-signal read/write settle after one extra pass.
- `createMemo` around a single prop default, and memoised controller objects with no dependencies, are house style.
