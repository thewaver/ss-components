# Lib code review

Review of `src/Lib` (74 files). Ordered by impact. Line numbers reflect the state of the code at review time.

---

## 1. Logic faults worth fixing

### 1.1 `Corners` ignores the boolean values of `visibleCorners`

`Corners.tsx:43` — rendering iterates `Object.keys(getVisibleCorners())`, so `{ topLeft: true, topRight: false }` renders both corners. Only omitting a key hides it; setting it to `false` does nothing.

```tsx
<For each={Object.keys(getVisibleCorners())}>
```

Fix: `Object.entries(...).filter(([, v]) => v).map(([k]) => k)`. Still string-keyed, so `For` identity is unaffected.

### 1.2 `Typewriter` renders a literal `0`

`Typewriter.tsx:134` — Solid inserts numbers as text nodes, so `{getIndexedSegments().length && ...}` puts a stray `0` in the DOM on first paint and after every `update()` reset (which sets segments back to `EMPTY_ARRAY`).

Fix: `length > 0 &&`, or a `<Show>`.

### 1.3 `RichText.parseContent` silently deletes text on crossed tags

`RichText.utils.ts:30-38` — when a closing tag matches an ancestor rather than the top of the stack, `splice(i)` discards the intermediate frames and only re-attaches `popped[0]`.

`[b]x[i]y[/b]` parses to `<b>x</b>` — the `y` disappears entirely.

The end-of-input path already unwinds unclosed tags into literal text. Applying the same treatment to `popped.slice(1)` would make the two paths consistent. Rendering `[i]y` literally is much better than dropping user content.

### 1.4 `ScanlineAnimation.onAnimationEnd` never fires on the final iteration

`ScanlineAnimation.tsx:113-124` — the early return for "no more iterations" happens *before* the callback:

```tsx
if (t >= 1) {
    const current = getCurrentIteration();

    if (current + 1 >= maxIterations) return;   // <- returns before the callback

    props.onAnimationEnd?.();
```

Consequences:

- `animationIterationCount: 1` → callback never fires at all.
- `animationIterationCount: Infinity` → fires on every iteration.

It is effectively an "iteration end" callback that goes silent exactly when the animation ends. Fix: call `onAnimationEnd` before returning.

### 1.5 `AudioSwitcher` stops honoring volume changes after the first fade-in

`AudioSwitcher.tsx:114-122` — `clearInterval(h)` does not reset `h`, so `fadeInTickHandler` stays a truthy interval id forever once a fade has run:

```tsx
if (active && !fadeInTickHandler) {   // <- never true again after the first fade-in
    active.volume = volume;
}
```

Fix: set `fadeInTickHandler = undefined` / `fadeOutTickHandler = undefined` alongside every `clearInterval` (five places).

Related, lower priority: `fadeIn`/`fadeOut` capture `step` and `volume` at call time, so a volume change mid-fade won't retarget the ramp. Probably fine given fades are ~500 ms.

### 1.6 Banded gradient stop ids are off by one, first one is negative

`SVGGradientDefs.utils.tsx:46-56` — `stops.length - 1` is evaluated *before* the push, so ids run `-1, 0, 1, 2...` while the smooth renderer emits `0, 1, 2...`.

`SVGAnimationUtils.Gradient.cycleColors` targets `#${gradientId}-stop-${index}`, so color-cycling animations bind to the wrong stops (or none) on banded gradients.

Note that banded emits *two* stops per boundary, so the id scheme can't be 1:1 with `colors` indices. Worth deciding whether `cycleColors` should key off the color index and have the banded renderer emit the same id for both halves of a boundary.

### 1.7 Drop shadow flood color and opacity never reach the DOM

`SVGFilterDefs.types.ts:7-8` declares `floodColor` / `floodOpacity`, and `SVGFilterDefs.factory.tsx:90-97` spreads them straight onto `<feDropShadow>`.

Solid's `Aliases` table (`solid-js/web/dist/web.js:26`) only maps `className` and `htmlFor`, so these are set verbatim as attributes. SVG attribute names are case-sensitive and the real names are `flood-color` / `flood-opacity` — shadows will render default black at full opacity. Solid's own typings use the hyphenated names, so renaming the fields also restores type checking on the spread.

Same function is also the only primitive that ignores its `srcIn` argument, so a drop shadow silently breaks `method: "chain"` — every later primitive keeps reading the pre-shadow graphic.

Neither has surfaced because nothing in the repo calls `addDropShadowFilter` yet.

### 1.8 `ScreenWiper` uses cell *width* where it needs height, twice

`ScreenWiper.tsx:40` — row count divides viewport *height* by `getCellSize().width`.
`ScreenWiper.tsx:61-62` — the circle variant's `cy` and `r` both come from width.

With the default square 120x120 cell these coincide. Any non-square `cellSize` produces the wrong number of rows and off-center circles.

### 1.9 `useAnimateDefs` creates independent state per `<animate>`, so callbacks fire N times

`SVGAnimationDefs.utils.tsx:30-72` — each call sets up its own `patternIndex` signal and its own `endEvent` listener.

- `Linear.grow` spreads it into 2 `<animate>` elements → callbacks fire 2x per iteration.
- `Linear.rotate` spreads it into 4 → 4x per iteration.

The elements can also drift out of sync if any of them misses an `endEvent`. Fix: hoist one `useAnimateDefs(defs)` result per animation group and reuse it, attaching the `endEvent` listener to only the first element.

### 1.10 `Tabs` puts `disabled` on an anchor

`Tabs.tsx:67-84` — `commonProps` is typed as button attributes and spread onto `<A>` in the href branch. A disabled link tab renders an inert `disabled` attribute and stays fully clickable. Needs `aria-disabled` plus click suppression for the anchor case.

Two related smaller issues in the same component:

- `itemRefs` (`Tabs.tsx:14`) is never trimmed when `tabCount` shrinks, so a stale detached element can end up observed.
- The floater's `ResizeObserver` only fires on *size* changes. When the selected tab moves without resizing (sibling reflow, gutter change) the floater stays behind.

Observing the tablist root, or reading offsets in the same observer callback, covers both.

### 1.11 `Tooltip` binds anchor listeners once and never rebinds

`Tooltip.tsx:140-158` — `onMount` reads `props.getAnchorRef()` a single time, so a tooltip attached to a conditionally rendered or swapped anchor never wires up. `ElementObserver.createObserver` on the line above reads the same accessor reactively, so the two disagree about whether the ref is stable.

Fix: move the binding into a `createEffect` keyed on `props.getAnchorRef()`.

### 1.12 `InteractionUtils`: any key marks the element active, flags go stale on disable

`Interaction.utils.tsx:50-52` — `onKeyDown` sets `activeByKey` for Tab, Escape and arrows, not just activation keys, so a keyboard user tabbing through sees the pressed state flash.

`Interaction.utils.tsx:71` — when `isDisabled` flips true the effect re-runs and skips attaching listeners, but `isHovered` / `isFocused` keep their last values. Hovering then disabling leaves `isHovered: true` permanently. Resetting the store in that branch is two lines.

(The unused `e` parameter is consistent with the rest of the codebase — leave it.)

### 1.13 `ColorExtractor` has no rejection handler

`ColorExtractor.context.ts:36,42` — `getColor` / `getPalette` reject on tainted canvases and CORS failures, which is the common case for remote images, and both `.then()` chains are bare. That's an unhandled rejection rather than a graceful no-op. Add `.catch()` and an `img.onerror`.

### 1.14 `ElementObserver` subtracts the offset from width and height

`ElementObserver.ts:29-34` — shifting `x` by `-offset.x` *and* shrinking `width` by `offset.x` moves the right edge by twice the offset, which doesn't match any reading of "offset".

Nothing in the library passes `getOffset`, so this is untested dead code. Either remove the option or fix the formula before something depends on it.

---

## 2. Performance

Only the items where the cost looks real rather than theoretical.

### 2.1 `ElementHighlight` recreates all 8 overlay segments on every rect change — highest value fix

`ElementHighlight.tsx:68-74`:

```tsx
<For each={Object.values(getSegmentRects()!)}>
```

`Object.values()` returns fresh object literals each time and `For` is reference-keyed, so a one-pixel movement disposes and rebuilds eight subtrees — including eight fresh `props.renderOverlay(...)` calls. Since `ElementObserver` re-measures every frame while visible, a moving or animating highlight does this at 60fps.

Fix: use `<Index>`. The segment list is fixed-length and positional, which is exactly what `Index` is for — the eight elements stay alive and only their styles update.

### 2.2 `ElementObserver`'s rAF loop forces a layout read every frame per observed element

`ElementObserver.ts:41-61` — `getBoundingClientRect` every frame for every visible tooltip and highlight. This is a deliberate design (only way to track arbitrary movement) and the `equals: Rect.isSame` signals correctly stop propagation when nothing changed, so the structure is sound.

Two cheap wins inside it:

- Cache `getElementRef()` in a local instead of calling it twice plus a non-null assertion (`ElementObserver.ts:22-24`).
- Consider having callers opt into polling — a tooltip on a static anchor pays the same cost as one on an animating element.

### 2.3 `Surface` evaluates the full defs callbacks just to inspect them

`Surface.tsx:123-133` (`getIsComplex`) and `Surface.tsx:74-84` (`SurfaceDiv.getColor`) both invoke `getFillDefs` / `getStrokeDefs` with a mock size purely to look at the result. Those callbacks build complete `defsElement` JSX — gradients, filters, patterns with dozens of cells — which is then discarded. In `SurfaceDiv` that happens on every recompute of two separate memos.

Structural fix: separate the descriptor from the element so complexity and color can be read without constructing DOM, e.g. `defsElement` becoming a lazy `() => JSX.Element`. That's a real API change.

Minimum: memoize the probe so defs are built once per dependency change rather than three times.

### 2.4 `ScanlineAnimation` allocates 3 closures per line per frame

`ScanlineAnimation.tsx:102-111` — at 100 lines that's ~18,000 closures/sec purely to satisfy the accessor-passing convention. Hoisting `getT` / `getCount` out of the loop over a mutable `let` (and passing a stable index accessor) reduces it to a constant.

Worth doing only for high line counts; at ~20 lines it's noise.

### 2.5 `useViewportContext` builds a fallback on every call, even when a real context exists

`Viewport.context.ts:18-19` — `getWindowRect()` runs eagerly at call time, so every consumer does a `window.innerWidth` layout read. Each `Tooltip` triggers two (its own call plus `ElementObserver`'s).

Fix: defer the fallback signal to the branch where `context` is undefined.

### 2.6 `ScreenWiper` renders ~300 cells, each an inline `<svg>` with its own transition

At 1920x1080 with default cells that's ~17 cols x 19 rows, so ~1000 nodes animating simultaneously. `SVGPatternDefsUtils` already exists — one SVG with a pattern, or CSS-drawn shapes, would be dramatically cheaper.

Only worth it if the wipe actually drops frames on target hardware.

---

## 3. Abstraction and API concerns

### 3.1 `AccessorProps` silently makes array props non-reactive

`typeUtils.ts:7-9` — `IsNonReactive` includes `JSX.Element`, and Solid defines `ArrayElement extends Array<Element>` with `string` among the element types. So `string[]` matches, gets classified non-reactive, and passes through unaccessorized.

That's why `Tabs` reads `props.hrefs?.[i]` rather than `props.getHrefs?.()`. It typechecks, but it means any array prop is frozen at creation for reasons no reader could infer.

Fix: check `T extends readonly any[]` explicitly (before the `JSX.Element` test) and decide deliberately, either way.

### 3.2 The `get` prefix collides with callbacks named `get*`

`getController`, `getIsDisabled`, `getZindex`, `getAnchorRef` all read as accessors, but three are callbacks that take arguments — `getController` is in fact a *setter* that receives the controller.

Since `AccessorProps` passes functions through untouched, `onControllerReady` would still be left alone and would be unambiguous.

Also `getZindex` (lowercase `i`) is inconsistent with the `getZIndex` local right next to it (`Tooltip.tsx:103`), and it's public API.

### 3.3 `Button` declares an `id` prop and never uses it

`Button.types.ts:23` declares `id?: string`; `Button.tsx` never reads it. Consumers can pass it and nothing happens.

### 3.4 `SVGDefs.const.tsx` is 2453 lines with heavy repetition

The same scaffold — `getBaseBorderColor(defs)` + a `gradient1-${id}` linear gradient with the same primary/secondary/tertiary triple at `angle: 90` + a `clipPath id={clip1-${id}} clipPathUnits="objectBoundingBox"` wrapper — appears 31 times, differing only in the animation call inside the clip path.

A helper taking `(id, defs, renderClip)` would collapse most of the file and make the actual differences between samples visible.

The `hexagon` / `lozenge` / `triangle` generators (lines ~196-380) are similarly near-identical apart from the pattern function and shape-id selection.

### 3.5 `Show when={... ?? EMPTY_ARRAY} keyed` doesn't gate anything

Appears 9x in `SVGAnimationDefs.utils.tsx`. An empty array is truthy, so children always render; the wrapper exists only to re-create them when the array reference changes. But `defs` is a plain object in every call site, so the `when` getter isn't reactive and the re-key never happens either.

It reads like a conditional and behaves like neither. Either add a comment explaining the intended reactive contract, or remove it.

### 3.6 The two gradient stop renderers duplicate their stop-resolution math verbatim

`SVGGradientDefs.utils.tsx:9-23` and `31-44` — six identical lines computing `prevIdx` / `nextIdx` / `offset`. Extracting `resolveStops(colors): number[]` would also let 1.6 be fixed in one place.

(The `findLastIndex`/`findIndex` scan is O(n^2), but color arrays are 3-4 entries — not worth touching.)

### 3.7 `ElementFader`'s show/hide are the same nine lines twice, and the deferred write isn't cancellable

`ElementFader.ts:28-52`:

- The `setTimeout(..., 0)` handle isn't stored, so a component unmounting inside that window still calls `setTransitionTarget` after disposal.
- The guard reads `getTransitionTarget()`, which the pending timeout hasn't updated yet, so a show-then-hide within one tick leaves the fader stuck visible. Effects batch, so a single driving signal won't trigger it — but `Modal.hide()` and `ElementHighlight.hide()` are called imperatively from key handlers, which can interleave with the effect.

Tracking a pending target separately from the committed one resolves both and collapses the duplication.

`ScreenWiper.tsx:69-82` reimplements the same target + hasFinished + `setTimeout(0)` pattern inline. Its completion is transition-event driven rather than timeout driven, so it isn't a drop-in for `createFader`, but a shared primitive covering both would remove the third copy.

### 3.8 `Shape`'s `getPaths()[0]` means two different things

`Shape.tsx:22-39` — with no stroke defs, index 0 is the plain shape; with stroke defs, it's the first stroke's inset path. The fill `<path>` (line 84) and the `renderChildren` clip path (lines 98-99) both use index 0 unconditionally, so adding a stroke def silently changes the fill geometry and the children's clip.

If intentional, it deserves a comment. If not, the fill should get its own zero-thickness path.

---

## 4. Minor

Cosmetic, or consistent with existing conventions.

**Accessibility**

- `ImageSwitcher.tsx:42,50` — `<img>` elements have no `alt`. Decorative images need `alt=""`.
- `ScanlineAnimation.tsx:167` — `role="img"` with no accessible name.
- `Modal.tsx:80-81` — `role="dialog"` with no accessible name.
- `Tabs.tsx:54` — `role="tablist"` without roving tabindex or arrow-key navigation, so it announces as a tablist but doesn't behave like one.

**Correctness nits**

- `Typewriter.tsx:171` — `segment.text.split("")` splits surrogate pairs; emoji render as replacement characters. `Array.from()` is a drop-in fix.
- `ScanlineAnimation.utils.ts:210-216` — `assignAnimationProps` only assigns `transform`/`filter` when the respective list is non-empty, so a frame producing no transforms leaves the previous one applied rather than clearing it. Doesn't bite with the current evaluators (they always return the same keys), but will the moment one becomes conditional.
- `Typewriter.tsx:109` — `createEffect(on(getAnimationName, restartAnimation as any))` passes the animation *name string* as the `cause` argument, so `cause` is never a valid `TypewriterUpdateCause`. It works because the string falls through every comparison, but the comment justifies it as avoiding a closure allocation on an effect that fires when a CSS class name changes. `() => restartAnimation()` is worth the one closure.

**Consistency**

- `Shape.tsx:71-79,110-118` — `.map()` inside `<defs>` while using `<For>` for the paths immediately below, so defs are fully recreated on any change.
- `Shape.tsx:10,58-60` — stores its ref in a `let` via a callback while every other component uses a signal.

**Dead code / no-ops**

- `Tooltip.tsx:49-50` and `Viewport.utils.ts:7-8` — `viewportContext?.` optional chaining where the type is non-optional and `useViewportContext` never returns undefined.
- `ScanlineAnimation.tsx:145-146` — `imgRef.offsetWidth ?? 0` on a value that's always a number.
- `SVGFilterDefs.types.ts:1` — `SVGBaseFilterDefs = {}` as an empty base type.
- `SVGAnimationDefs.types.ts:3` — `beginEvent` declared but never read.
- `Tabs.tsx:55-61` — `props.renderGutter && ... props.renderGutter?.()` double-guarding (twice).
- `Typewriter.tsx:17,75` — `EMPTY_ARRAY as any`.
- `SVGFilterDefs.factory.tsx:82` — `(defs.dx ?? 0)` where `dx` is a required number and is used unguarded two lines later.
- `AudioSwitcher.tsx:16-17` — the two `Audio` elements live in signals that are never set. Plain consts would do, and would avoid constructing `Audio` at module-evaluation time if you ever server-render.

**Browser support**

- `Surface.tsx:78` and the SVG samples use `rgb(from ...)` / `hsl(from ...)` relative color syntax: Chrome 119+, Safari 16.4+, Firefox 128+. Fine if that's the baseline; worth documenting if the package is published.

---

## 5. Checked and considered fine

Not issues — recording them so they don't get re-litigated:

- The `untrack` in `ScreenWiper`'s direction effect is a correct use, not a smell.
- `equals: Rect.isSame` / `Size2d.isSame` on the observer signals is exactly right and does most of the work of keeping the rAF loop cheap.
- `RichText` renders parsed content as text nodes rather than `innerHTML`, so the bbcode parser isn't an injection vector.
- `Shape`'s per-computation path cache keyed on floored thicknesses is a nice touch.
- The self-retriggering effects in `ImageSwitcher` and `AudioSwitcher` (reading and writing the same signal) do terminate after one extra pass. `on(props.getSrc, ...)` would be tidier but the current form isn't a bug.
- `FPS.utils` and `Focus.utils` — nothing substantive found.
- The `createMemo` wrappers around single prop defaults, and the memoized controller objects with no dependencies, are consistent enough across the codebase to count as house style rather than something to churn.
