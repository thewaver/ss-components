# Lib code review — remaining items

Fourteen of the previous twenty items are now fixed in the code — see **Fixed** below. Six are left, and every one of them needs a decision from you rather than an implementation.

Numbers were reassigned again, so they won't match earlier conversations.

### Index

1. `AccessorProps` treats arrays of primitives and arrays of objects differently — *needs a choice*
2. `AccessorProps` pattern, `get`-prefixed collisions, and accessor callback args — *needs a design discussion*
3. `ScreenWiper` renders a few hundred inline SVGs — *deferred*
4. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — *parked*
5. Isolate-mode `feMerge` layers every result over the untouched graphic — *needs a decision*
6. Relative colour syntax needs a documented baseline — *needs your baseline*

---

## 1. `AccessorProps` treats arrays of primitives and arrays of objects differently

`typeUtils.ts:7-9`

```ts
type IsNonReactive<T> = T extends ((...args: any) => any) | JSX.Element | Date | Map<any, any> | Set<any> | symbol
```

Solid defines `JSX.Element` as `Node | ArrayElement | (string & {}) | number | boolean | null | undefined`, with `interface ArrayElement extends Array<Element>`. An array therefore matches `JSX.Element` only when its items are themselves valid JSX children — so arrays of strings and numbers are skipped, and arrays of objects are accessorized.

Verified with a throwaway probe type: given `strings?: string[]`, `numbers?: number[]` and `objects?: { a: number }[]`, the first two stay as-is and the third becomes `getObjects`.

Both halves of the split exist in the codebase today:

| plain | accessorized |
| --- | --- |
| `Tabs.hrefs` (`string[]`) | `StressTestProps.configs` (`StressTestDefs[]`) |
| `Shape.joinRadii`, `Shape.lameExponents` (`number[]`) | `ExamplesProps.items` (`PageExampleDefs[]`) |

Nothing misbehaves — Solid's props proxy keeps both shapes reactive as long as they're read inside a tracking scope, which they are. It's only that the naming convention splits on a rule nobody chose and nobody can see.

**Fix.** State the rule ahead of the `JSX.Element` check so it wins:

```ts
type IsNonReactive<T> = T extends readonly any[]
    ? true // or false
    : T extends ((...args: any) => any) | JSX.Element | Date | Map<any, any> | Set<any> | symbol
      ? true
      : false;
```

Neither answer is free, which is why this is still here:

- **`true`** (all arrays plain) renames `getConfigs` → `configs` and `getItems` → `items`, about ten call sites across `StressTest`, `Examples`, `ScanLineAnimationPage`, `ShapePage`, `SurfacePage` and `TypewriterPage`. All Playground, no library churn.
- **`false`** (all arrays accessorized) renames `hrefs` → `getHrefs`, `joinRadii` → `getJoinRadii` and `lameExponents` → `getLameExponents`, which touches the library's public props and every consumer of them.

I originally said `true` would keep everything exactly as it is. That was wrong — I'd only checked `src/Lib/**/*.types.ts` for array props and missed the Playground's own. `true` is still the cheaper of the two and keeps the library API untouched, but it isn't a no-op.

The `Set` in that list is deliberate and correct, incidentally: `Corners.visibleCorners` relies on it.

---

## 2. `AccessorProps`, `get`-prefixed callbacks, and accessor callback args

This is the bigger design discussion: whether `AccessorProps` is the right pattern, what to do about names that collide with the accessors it generates, and whether callback arguments should be accessors or plain values.

`AccessorProps` turns primitive / plain props into `getX` accessors, and leaves anything typed as a function alone. So a prop that is *already* named `getSomething` and is a function keeps that name — and then looks identical to a generated accessor while behaving differently.

### Props that collide (named like accessors, not zero-arg getters)

| Prop | Where | Signature | What it actually is |
| --- | --- | --- | --- |
| `getController` | `AudioSwitcher`, `Typewriter`, `ScanlineAnimation` | `(controller) => void` | "here, take this" — fires once with the controller object |
| `getIsDisabled` | `Tabs` | `(getIndex: () => number) => boolean` | predicate; also takes an accessor as its arg |
| `getClassNames` | `RichText` | `(defaultClasses) => Record<string, string>` | transform / override of the default class map |
| `getZIndex` | `Tooltip` | `(getPlacement: () => TooltipPlacement) => number` | computes a z-index; takes an accessor |
| `getPoints` | `Shape` | `(getSize: () => Size2d) => Point2d[]` | factory driven by live size |
| `getFillDefs` | `Shape`, `Surface` | `(getSize: () => Size2d) => SVGDefs[]` | same |
| `getStrokeDefs` | `Shape`, `Surface` | `(getSize: () => Size2d) => SVGDefs[]` | same |

### Props that look like accessors and *are* zero-arg, but were hand-named

These didn't go through `AccessorProps` renaming — they were written as `getX` by hand because the value is a function and `AccessorProps` would have left a plain name like `anchorRef` alone:

| Prop | Where | Signature |
| --- | --- | --- |
| `getAnchorRef` | `Tooltip` | `() => HTMLElement \| undefined` |
| `getElementRef` | `ElementHighlight` | `() => HTMLElement \| undefined` |

Same shape as a generated accessor, different reason for the name. Nested on defs objects (not component props): `getDefsElement` on `SVGDefs` entries — a zero-arg factory that builds the SVG node.

### Callback *arguments* that are accessors

Separate from prop names, but part of the same convention question — should these stay as accessors, or become plain values?

| Argument | Passed into | Notes |
| --- | --- | --- |
| `getIndex` | `Tabs.renderTab`, `Tabs.getIsDisabled` | Solid `For`-style index accessor |
| `getSize` | `Shape.getPoints` / `getFillDefs` / `getStrokeDefs` / `renderChildren`, `Surface.getFillDefs` / `getStrokeDefs` | live measured size |
| `getClipPath`, `getClipPoints` | `Shape.renderChildren` | derived from current paths |
| `getVisibilityTarget` | `Modal` / `Tooltip` / `ElementHighlight` render callbacks | `0 \| 1` transition target |
| `getTransitionDurationMs` | same | |
| `getPlacement` | `Tooltip.renderContent`, `Tooltip.getZIndex` | current placement after flip logic |

### Discussion points for later

1. **Is `AccessorProps` worth it?** It makes every primitive prop reactive by construction, at the cost of a naming scheme that fights real callbacks and forces hand-named `getX` for function-valued "accessors." Alternatives: plain Solid props (read through the proxy), an explicit `ReactiveProps` / `StaticProps` split, or only accessorizing when the consumer opts in.
2. **Rename the collisions** so callbacks don't wear getter names — e.g. `onControllerReady`, `isTabDisabled` / `checkIsDisabled`, `resolveClassNames`, `resolveZIndex`, and something non-`get` for the Shape/Surface defs factories (`buildFillDefs`? keep them as factories but drop the prefix?).
3. **Callback args: accessor or value?** Accessors let the callee read later / track reactively (`getSize()` inside a memo). Plain values are simpler and match how most UI libraries work. The codebase currently mixes: `getIndex` / `getSize` / `getVisibilityTarget` are accessors; `evaluateScanlineAnimation(index, lineCount, timeline)` takes plain numbers.

---

## 3. `ScreenWiper` renders a few hundred inline SVGs

*Deferred — noted, not expected to be actioned soon.*

At 1920×1080 with the default 120px cell that's roughly 17 columns × 19 rows, each an `<svg>` with a shape inside and its own CSS transition — about a thousand nodes animating at once.

`SVGPatternDefsUtils` already exists and does exactly this job: one `<svg>` with a tiled pattern would replace the whole grid. For the circle variant, a CSS `radial-gradient` background would too.

Worth measuring before rewriting.

---

## 4. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written

*Acknowledged and parked — the current behaviour is correct, so this is about where the behaviour comes from rather than a bug.*

The intent is right, and remounting is genuinely the only way to reset SMIL state. Here's Solid's `Show`:

```ts
const conditionValue = createMemo(() => props.when);
const condition = keyed ? conditionValue : createMemo(conditionValue, { equals: (a, b) => !a === !b });
return createMemo(() => { const c = condition(); if (c) { ... return child; } ... });
```

With `keyed`, the outer memo re-runs whenever `props.when` changes by reference, and re-reading `props.children` inside it rebuilds the `<animate>` elements. That mechanism does what you want.

What it needs is for `props.when` to read something reactive, and it doesn't. `defs` is a plain object literal built inside `Shape`'s defs memo from the Playground callback, so reading `defs.animationIterationPatterns` isn't tracked, `conditionValue` has no dependencies, and the children are built exactly once.

The reset you see comes from one level up: when `getIterationConfig()` or `getAnimationDurationMs()` changes, `Shape`'s `getFillDefs`/`getStrokeDefs` memo re-runs, the callback returns a new array of new def objects with fresh `getDefsElement` closures, and `<For>` discards the old nodes and inserts new `<animate>` elements. The SMIL reset is free from the parent; the `Show` isn't contributing to it.

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

## 5. Isolate-mode `feMerge` layers every result over the untouched graphic

`SVGFilterDefs.factory.tsx:69-76` — in `isolate` mode the merge puts `SourceGraphic` in first and every primitive's result on top of it.

For drop shadows on an opaque shape this comes out right by accident: `feDropShadow`'s own output is the shadow with the graphic already composited above it, so the final stack is graphic, shadow, graphic — and the top copy hides the shadow where they overlap. With a translucent fill it doesn't work, because the shadow is then drawn over a shape you can see through, and it darkens the interior.

If the intent of `isolate` is "each primitive's effect, layered over the original", then a shadow wants to be *under* the source rather than over it. That means ordering the merge nodes per primitive kind, which is a design call — or leaving it, given that opaque fills are the normal case.

---

## 6. Relative colour syntax needs a documented baseline

`Surface.tsx:78` uses `rgb(from ...)` and the SVG samples use `hsl(from ...)`. Relative colour syntax needs Chrome 119+, Safari 16.4+, Firefox 128+. Fine if that's your baseline; worth writing down somewhere before this gets published, since it'll fail silently on older browsers rather than degrade.

---

# Fixed

## In this pass

- **`ElementFader` fired `onHide` twice per close.** The repeat-call guard read `getTransitionTarget()`, which isn't written until the next frame, so a second call in the same frame passed straight through — and `onHide` → consumer sets `isVisible` false → the fader's effect calls `hide()` again is exactly that shape. Now guarded on a plain `pendingTarget`. The mirror case (show then hide in one frame ending up visible) is closed by the same change. Predates the review; missed in the first two passes.

  Not a timing race, despite the one-frame deferral being involved: the second `hide()` arrives synchronously, inside the first one's call stack, because `onHide` writes a signal that Solid flushes immediately. Measured on the exact `ModalPage` wiring by running the old and new files side by side — two calls before, one after, every time.
- **`AudioSwitcher` could install a fade for a source that had already been replaced.** `play()` resolves only once playback actually starts, which on a fresh `src` waits for buffering — easily long enough for a second `src` change to land. The late resolution then overwrote `fadeInTickHandler`, so the previous element's interval was orphaned and its self-clear later killed the *current* element's fade, leaving a track stuck at partial volume. Now guarded by one line: `if (element !== getActiveElement()) return`. Predates the review.

  My first write-up of this claimed unmount could leak an interval forever and that two tracks could end up audible. Neither holds: `pause()` rejects a pending `play()` per spec, and both the cleanup path and the fade-out path pause the element, so those routes land in `.catch` instead. Only the swapped-source case was real, which is why the fix shrank from a generation counter to a single comparison.
- **`Tabs` floater missed movement that wasn't a resize.** The `ResizeObserver` now watches the root as well as the selected tab, so reflows that move a tab without resizing it are caught.
- **`Tabs` had no keyboard navigation.** One tab stop via a roving `tabIndex`, arrow keys along `dir`, `Home`/`End`, wrapping, and disabled tabs skipped. Arrows move focus and Enter or Space activates, rather than arrows selecting directly — with link tabs the latter would move the highlight without navigating, which is exactly what the router-driven Playground strip would have done. The roving index falls back to the first *enabled* tab, so a disabled tab at index 0 can't leave the strip unreachable.
- **`createAnimateDefs` notified from a stale element and advanced the index too early.** One element now drives the group: it reads the index, fires the callbacks, then restarts every connected element itself. "First element still in the document" is re-evaluated per event, so a remount hands the job to a live element. My defect, from the code I proposed last round.
- **`ScanlineAnimation` announced as an unnamed image.** New optional `ariaLabel`. With it, `role="img"` plus the label; without it the root is `aria-hidden`, which is the honest description of a decorative effect. No made-up labels needed either way.
- **`Modal` had no accessible name.** New optional `ariaLabel` and `ariaLabelledBy`, and a one-shot `console.warn` when a dialog opens with neither. All three Playground modals now pass one — `ModalPage` uses `ariaLabelledBy` pointing at its heading, so the announced name is the visible title.
- **`Typewriter` counted characters in code units but rendered them in code points.** `itemCount` now uses `Array.from(...).length`, so emoji stop inflating every later segment's animation delay. My defect: I gave you the `Array.from` change for the render and never mentioned this line.
- **`RichText` invented a closing tag when unwinding.** `[b]x[i]y[/i]` rendered as the literal `[b]x[i]...[/i]` — the `y` replaced by an ellipsis and a `[/i]` the author never typed. A recursive `stringifyNode` now reproduces the input exactly. Checked against eight inputs, including the overlapping case, which still discards and warns as intended.
- **`InteractionUtils` kept the pressed flag after losing focus.** `onBlur` clears `activeByKey`, mirroring what `onMouseLeave` already did for the mouse.
- **`ColorExtractor` cleanup was incomplete.** `onerror` is cleared and `src` is reset so an unfinished download is cancelled. The dead `!e.currentTarget` guard is gone.
- **`useViewportWithFallback` carried a dead `props` parameter.** Once the short-circuit fix landed, the only call site passed nothing, so every `props?.x ?? fallback` inside resolved to the fallback. Parameter and guards removed.
- **`ScanlineAnimation`'s container ref claimed to be an `SVGSVGElement`** while holding a `div`. Now `HTMLElement`, like the other two refs in the file.
- **Dead `?? 0` on `getSize()` reads** in `Tooltip` and `ScreenWiper`.

Verified with `tsc --noEmit`, both builds, and Prettier. The `RichText` parser and the `Tabs` index arithmetic were exercised directly rather than reasoned about.

## Earlier

`AudioSwitcher` fade handles · `Tabs` click handler no longer inverted · `Tabs` `aria-selected` and `aria-disabled` reactive via getters · `disabled` off the anchor, `preventDefault` in its place · `RichText` warns on discarded content · `createAnimateDefs` replaces the per-element `useAnimateDefs` · banded gradient stop ids unique, and `cycleColors` renamed to `cycleSmoothColors` so it can't be aimed at a banded gradient · `feDropShadow` takes `in` · hover and focus flags reset when disabled · only Enter and Space count as a key press · `ColorExtractor` handles load failures and rejected extraction, and exposes `getError` · `Typewriter` splits with `Array.from`, and `EMPTY_SEGMENTS` is typed · `Button` wires up `getId` · `ElementFader` folded into one `setTarget` on `requestAnimationFrame` · `Viewport.utils` dead guards · `Tabs` `renderFloater` re-guard · `Shape` ref re-guard · `audioA` / `audioB` are `const` · **`Surface` no longer builds throwaway SVG elements** — `getDefsElement` made every sample lazy, including the `new SVGFilterDefsFactory(...)` chains, so the mock-size inspection allocates description objects and nothing else.

---

# Closed as intended

Settled in discussion. Recorded so they don't get raised again.

- **`RichText` discards overlapping tag content** — authors have escape mechanisms for literal brackets. It warns now, which was the whole ask.
- **Fades don't retarget mid-transition** (`AudioSwitcher`) — readjusting a running transition produces strange effects. Freezing the target at the start is the point.
- **`ElementObserver` measures every visible element every frame** — scrollbars, reflows and other unpredictable layout changes make an opt-in "is static" flag unsafe, and only one tooltip is visible at a time, so the cost doesn't accumulate.
- **`Shape`'s `getPaths()[0]` doubles as the fill and clip path** — by design. Measuring the smallest inner path across all strokes would be more correct but isn't feasible when sides can have different thicknesses per stroke.
- **`SVGDefs.const.tsx` repetition** — it's a showcase file, not a built-in solution. Samples that read standalone are worth more here than deduplication.
- **`assignAnimationProps` doesn't clear `transform` / `filter` when a frame produces none** — measured on 800 mounted elements and unconditional assignment was slower. Keeping the styles in place and leaving it to the consumer to return consistent keys is the deliberate trade.
- **`SVGBaseFilterDefs` is an empty type** — deliberate future-proofing for shared filter fields.

# Checked and deliberately not flagged

- The `untrack` in `ScreenWiper`'s direction effect is correct usage, not a smell.
- `equals: Rect.isSame` / `Size2d.isSame` on the observer signals is exactly right, and does most of the work of keeping the per-frame polling affordable.
- `RichText` renders parsed content as text nodes rather than `innerHTML`, so the bbcode parser can't be used for injection.
- `Shape`'s path cache, keyed on floored thicknesses, is a good idea.
- `Corners` reads `props.visibleCorners` inside a memo, so switching to a `Set` didn't cost it any reactivity — Solid's props proxy covers it.
- `ImageSwitcher` and `AudioSwitcher` have effects that read and write the same signal. They settle after one extra pass rather than looping. `on(props.getSrc, ...)` would be tidier but the current form isn't wrong.
- `FPS.utils` and `Focus.utils` — nothing substantive found in either.
- `createMemo` around a single prop default, and memoised controller objects with no dependencies, are consistent enough across the codebase to count as house style rather than something to churn through.
