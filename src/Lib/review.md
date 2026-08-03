# Lib code review — remaining items

Re-checked against the current code. Anything fixed, or settled as intended, has been removed — see **Closed as intended** at the bottom for what was dropped and why, so it doesn't get raised again.

Numbers were reassigned when the items were grouped into categories, so they won't match earlier conversations.

Items 1 to 3 are the urgent ones: 1 and 2 are fixes that look right but don't work, and 3 is something I missed on the first pass.

### Index

**Broken behaviour**
1. `AudioSwitcher` — the `clearAndNullifyInterval` helper does nothing
2. `Tabs` — the click handler is attached to the wrong tabs
3. `Tabs` — `aria-selected` and `disabled` never update after the first render
4. `Tabs` — `disabled` on `<A>` does nothing
5. `Tabs` — the floater misses movement that isn't a resize
6. `RichText` — silently drops text when tags overlap
7. Each `<animate>` element gets its own copy of the animation state
8. Banded gradients emit duplicate `id`s
9. Drop shadows can't be chained
10. `InteractionUtils` — hover and focus flags stick when disabled
11. `InteractionUtils` — any key counts as "pressed"
12. `ColorExtractor` — failures surface as unhandled rejections
13. `Typewriter` — breaks emoji

**Accessibility**
14. `Tabs` — no keyboard navigation
15. `ScanlineAnimation` — `role="img"` with no accessible name
16. `Modal` — `role="dialog"` with no accessible name

**Performance**
17. `Surface` — builds throwaway SVG elements just to inspect them
18. `useViewportContext` — measures the window when it doesn't need to
19. `ScreenWiper` — renders a few hundred inline SVGs *(deferred)*

**Design and API**
20. `AccessorProps` — silently makes array props non-reactive
21. `get`-prefixed callbacks read like accessors but aren't
22. `Button` — declares an `id` prop and ignores it
23. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written *(parked)*
24. `ElementFader` — `setTimeout(0)` isn't the next frame, and show/hide are duplicated

**Tidying**
25. `ViewportUtils` guards against a value that can't be missing
26. `Tabs` re-guards `renderFloater`
27. `Shape` re-guards an already-checked ref
28. `Typewriter` casts its empty array to `any`
29. `AudioSwitcher` audio elements should be `const`
30. Relative colour syntax needs a documented baseline

---

# Broken behaviour

## 1. `AudioSwitcher` — the `clearAndNullifyInterval` helper does nothing

`AudioSwitcher.tsx:12-15`

```ts
const clearAndNullifyInterval = (handle: ReturnType<typeof setInterval> | undefined) => {
    clearInterval(handle);
    handle = undefined;
};
```

`handle` is a local copy of whatever you passed in. Assigning to it changes the copy and nothing else — `fadeInTickHandler` in the component is untouched. The `clearInterval` part works; the "nullify" part doesn't.

So the original bug is still live. After the first fade-in, `fadeInTickHandler` is stuck holding a used-up interval id (a positive number, so truthy), and this guard never passes again:

```ts
if (active && !fadeInTickHandler) {
    active.volume = volume;
}
```

Change the `volume` prop after the first fade and nothing happens.

**Two ways to fix it.**

The blunt one — drop the helper and write both lines at each of the seven call sites:

```ts
clearInterval(fadeInTickHandler);
fadeInTickHandler = undefined;
```

The tidier one — put the handles in an object, so the helper has something it can actually mutate:

```ts
const timers: {
    fadeIn?: ReturnType<typeof setInterval>;
    fadeOut?: ReturnType<typeof setInterval>;
} = {};

const clearTimer = (key: "fadeIn" | "fadeOut") => {
    clearInterval(timers[key]);
    timers[key] = undefined;
};
```

Call sites become `clearTimer("fadeIn")`, and assignments become `timers.fadeIn = setInterval(...)`.

Worth enabling the `no-param-reassign` lint rule if you have a linter — it catches exactly this shape.

---

## 2. `Tabs` — the click handler is attached to the wrong tabs

`Tabs.tsx:84-88`

```ts
"onClick": props.getIsDisabled?.(getIndex)
    ? () => {
          props.onSelectionChange?.(getIndex());
      }
    : undefined,
```

The condition is backwards. Disabled tabs get the handler, enabled tabs get `undefined`. Every tab that isn't disabled is currently unclickable, and every disabled one still fires `onSelectionChange`.

Buttons are partly saved by the `disabled` attribute blocking the click. Link tabs (`<A>`) aren't — a disabled link tab will navigate *and* fire the callback.

**Fix.** Pull the disabled check into its own function and flip the branches:

```ts
const isDisabled = (getIndex: () => number) => props.getIsDisabled?.(getIndex) ?? false;
```

```ts
"onClick": isDisabled(getIndex) ? undefined : () => props.onSelectionChange?.(getIndex()),
```

Item 3 needs to change the same block, so do both together.

---

## 3. `Tabs` — `aria-selected` and `disabled` never update after the first render

`Tabs.tsx:78-89` builds `commonProps` as a plain object:

```ts
const commonProps: JSX.ButtonHTMLAttributes<any> = {
    "class": styles.tabsItem,
    "role": "tab",
    "disabled": props.getIsDisabled?.(getIndex),
    "aria-disabled": props.getIsDisabled?.(getIndex),
    "aria-selected": getIndex() === props.getSelectedIndex(),
    ...
};
```

Those three values are computed once, when the object literal is created. Spreading the object into JSX copies whatever is already sitting in it — there's nothing left for Solid to re-read, so nothing updates later.

And the tabs are never rebuilt: `<For each={getTabArray()}>` only rebuilds when `tabCount` changes, not when the selection changes. So:

- Click a different tab and the floater slides over, but `aria-selected="true"` stays on whichever tab was selected at mount. Screen readers report the wrong tab as selected, permanently.
- A tab that becomes disabled later stays clickable and never gets the `disabled` attribute.

I missed this the first time because the visible behaviour looks correct — the floater is driven by a separate effect and does update.

**Fix.** Make them getters. Solid reads spread properties inside a render effect, so a getter's body *is* tracked and will re-run:

```ts
const commonProps: JSX.ButtonHTMLAttributes<any> = {
    "class": styles.tabsItem,
    "role": "tab",
    get "aria-disabled"() {
        return isDisabled(getIndex);
    },
    get "aria-selected"() {
        return getIndex() === props.getSelectedIndex();
    },
    get "onClick"() {
        return isDisabled(getIndex) ? undefined : () => props.onSelectionChange?.(getIndex());
    },
};
```

`disabled` is deliberately gone from the shared object — see item 4. Set it directly on the button, and give the anchor its own click handler:

```tsx
return props.hrefs?.[getIndex()] ? (
    <A
        href={props.hrefs![getIndex()]}
        {...commonProps}
        onClick={(e) => {
            if (isDisabled(getIndex)) {
                e.preventDefault();
                return;
            }
            props.onSelectionChange?.(getIndex());
        }}
    >
        {props.renderTab(getIndex)}
    </A>
) : (
    <button type="button" disabled={isDisabled(getIndex)} {...commonProps}>
        {props.renderTab(getIndex)}
    </button>
);
```

The anchor needs its own handler because `preventDefault` is the only thing that stops navigation — `aria-disabled` is a hint for assistive tech, not something the browser enforces.

---

## 4. `Tabs` — `disabled` on `<A>` does nothing

Not a valid anchor attribute, so the browser ignores it and disabled link tabs stay fully clickable. The fix is folded into item 3: keep `disabled` on the `<button>` branch only, and block the anchor with `preventDefault`.

---

## 5. `Tabs` — the floater misses movement that isn't a resize

`Tabs.tsx:48-56` watches the selected tab with a `ResizeObserver`, which only fires when that element's own width or height changes. If the tab *moves* without changing size — a sibling grows, the gutter reflows, the row re-wraps — then `offsetTop` and `offsetLeft` change but the observer stays quiet, and the floater is left behind.

**Fix.** Observe the root instead. It resizes whenever the row reflows, and you can still read the selected tab's offsets inside the callback:

```ts
selectedItemObserver = new ResizeObserver(() => {
    setFloaterBounds({
        top: `${selectedTab.offsetTop}px`,
        left: `${selectedTab.offsetLeft}px`,
        width: `${selectedTab.offsetWidth}px`,
        height: `${selectedTab.offsetHeight}px`,
    });
});
selectedItemObserver.observe(rootRef);
```

---

## 6. `RichText` silently drops text when tags overlap

`RichText.utils.ts:28-41`

When a closing tag matches something further down the stack rather than the tag currently open, `splice(i)` removes every frame from that point up, but only `popped[0]` gets re-attached. Everything the removed frames collected is thrown away.

`[b]x[i]y[/b]` comes out as `<b>x</b>` — the `y` is simply gone.

Discarding the content is the intended behaviour, since authors have escape mechanisms for writing literal brackets. The problem is that it happens in total silence, which makes it painful to diagnose when the input isn't hand-authored (user-generated text, translation strings).

**Fix — warn instead of restructuring the parse:**

```ts
if (stack[i].tag === tag) {
    found = true;

    const popped = stack.splice(i);
    const completed = popped[0];

    if (popped.length > 1) {
        console.warn(
            `RichText: closing [${tag}] discarded content from unclosed ` +
                `${popped
                    .slice(1)
                    .map((frame) => `[${frame.tag}]`)
                    .join(", ")} in: ${input}`,
        );
    }

    stack[stack.length - 1].children.push({ type: "tag", tag, children: completed.children });

    break;
}
```

Behaviour stays identical; the console now tells you which tags were involved and what the input was.

---

## 7. Each `<animate>` element gets its own copy of the animation state

`SVGAnimationDefs.utils.tsx:30-72` — every call to `useAnimateDefs` creates a fresh `patternIndex` signal and attaches its own `endEvent` listener. The helpers below spread the result into more than one element:

- `Linear.grow` → 2 elements → `onAnimationIteration` and `onAnimationEnd` fire twice per iteration
- `Linear.rotate` → 4 elements → four times per iteration
- `Linear.sweepDiagonal` → 4 elements (2 points × 2 axes)

Each element also advances its own pattern index, so if one misses an `endEvent` they drift apart and animate different steps of the same sequence.

Every element genuinely does need its own `ref` — setting `begin` and calling `beginElementAt` are per-element operations. What shouldn't be duplicated is the shared state and the outward-facing callbacks.

**Fix.** One call per animation group, returning a factory you spread into each element. The state lives in the closure; the first element to register owns the notifications:

```ts
export const createAnimateDefs = (defs: SVGAnimationDefs) => {
    const [getPatternIndex, setPatternIndex] = createSignal(0);
    const getPatterns = createMemo(() => unrollSelfReferencingPatterns(defs.animationIterationPatterns ?? []));

    let notifier: SVGAnimateElement | undefined;

    return (): JSX.AnimateSVGAttributes<SVGAnimateElement> => ({
        get dur() {
            return `${defs.animationDurationMs}ms`;
        },
        get repeatCount() {
            const pattern = getPatterns()[getPatternIndex()];
            return !pattern || pattern.count === Infinity ? "indefinite" : pattern.count;
        },
        fill: "freeze",
        begin: "indefinite",
        ref: (el: SVGAnimateElement) => {
            notifier ??= el;

            requestAnimationFrame(() => {
                if (!el.isConnected) return;

                const svg = el.ownerSVGElement;
                const now = svg ? svg.getCurrentTime() : 0;
                const delaySecs = (getPatterns()[0]?.beginDelayMs ?? 0) / 1000;

                el.setAttribute("begin", `${now + delaySecs}s`);
            });

            el.addEventListener("endEvent", () => {
                const currentIndex = getPatternIndex();
                const nextIndex = getPatterns()[currentIndex]?.nextIndex;
                const isNotifier = el === notifier;

                if (isNotifier) defs.onAnimationIteration?.(currentIndex);

                if (nextIndex !== undefined) {
                    if (isNotifier) setPatternIndex(nextIndex);

                    el.beginElementAt((getPatterns()[nextIndex]?.beginDelayMs ?? 0) / 1000);
                } else if (isNotifier) {
                    defs.onAnimationEnd?.();
                }
            });
        },
    });
};
```

Call sites change from calling `useAnimateDefs(defs)` per element to once per group:

```tsx
export const grow = (vName: "x" | "y", v1: number, v2: number, sArr: number[], defs: SVGAnimationDefs) => {
    const halfDist = Math.abs(v2 - v1) * 0.5;
    const animateDefs = createAnimateDefs(defs);

    return (
        <Show when={defs.animationIterationPatterns ?? EMPTY_ARRAY} keyed>
            <animate attributeName={`${vName}1`} values={/* ... */} {...animateDefs()} />
            <animate attributeName={`${vName}2`} values={/* ... */} {...animateDefs()} />
        </Show>
    );
};
```

Every element still restarts itself; only the index advance and the callbacks are gated to one of them.

**Priority: low.** Nothing in the Playground currently passes `onAnimationIteration` or `onAnimationEnd` to an SVG animation, so this is a trap for the first person who does rather than a live bug.

---

## 8. Banded gradients emit duplicate `id`s, and colour cycling only reaches half the stops

The off-by-one is fixed. What's left is a consequence of how banded stops work.

`SVGGradientDefs.utils.tsx:36-43` — a band needs two stops at the same offset (end of the old colour, start of the new one), and both currently get labelled with their colour's index. For colours `[A, B, C]` that produces ids `0, 0, 1, 1, 2`.

Two problems:

- Duplicate `id` values in one document are invalid.
- `SVGAnimationUtils.Gradient.cycleColors` animates by `href="#${gradientId}-stop-${i}"`, and an id lookup returns the *first* match. Only the opening stop of each band gets animated; the closing stop keeps its original colour, so the band turns into a gradient mid-animation instead of staying flat.

**Fix** (agreed) — give the two stops distinct suffixes:

```ts
stops.push(<stop id={`${id}-stop-${i - 1}-end`} offset={`${stop}%`} stop-color={colors[i - 1].value} />);
stops.push(<stop id={`${id}-stop-${i}-start`} offset={`${stop}%`} stop-color={colors[i].value} />);
```

The very first stop becomes `${id}-stop-0-start` and the last one `${id}-stop-${n - 1}-end`, so every stop has a unique, predictable id.

`cycleColors` then emits one `<animate>` per stop element rather than per colour — for colour `i` that's `-start` and `-end`, except the first colour which has no `-end` and the last which has no `-start`.

---

## 9. Drop shadows can't be chained — and it's a gap in Solid's types, not the spec

`SVGFilterDefs.factory.tsx:91` — the drop shadow is the only primitive whose factory ignores its `srcIn` argument:

```ts
this.filterPrimitives[key] = () => ({ ... });
```

Every other primitive takes `(srcIn: string)` and passes it as `in`. With `method: "chain"`, `getFilterPrimitives` threads each primitive's output into the next one's input — but a drop shadow never reads that input, so it always shadows the original graphic, and because it still writes a `result`, everything after it in the chain reads *its* output. Anything before the shadow in the chain is silently dropped.

The reason it was written without `in` is that Solid's types don't offer one. `in` is declared in `SingleInputFilterSVGAttributes`:

```ts
interface SingleInputFilterSVGAttributes {
    in?: string | undefined;
}
```

`feGaussianBlur` extends that interface. `feDropShadow` doesn't — it only extends `CoreSVGAttributes`, `FilterPrimitiveElementSVGAttributes`, `StylableSVGAttributes` and a `Pick` of the flood presentation attributes (`solid-js/types/jsx.d.ts:2573-2581`).

That's purely an omission in the typings. `feDropShadow` is an ordinary filter primitive, the Filter Effects spec gives it `in`, and browsers honour it.

**Fix.** Use the object-spread escape hatch already used elsewhere in this codebase (`SVGAnimationDefs.utils.tsx:264` does the same thing for `href`):

```ts
this.filterPrimitives[key] = (srcIn: string) => ({
    element: (
        <feDropShadow
            {...{ in: srcIn }}
            {...otherDefs}
            result={key}
            flood-color={floodColor}
            flood-opacity={floodOpacity}
        >
            {custom}
        </feDropShadow>
    ),
    resultGraphic: key,
});
```

In `isolate` mode `srcIn` stays `"SourceGraphic"`, so nothing changes for existing callers.

If you'd rather have it typed properly, a module augmentation does it, and is worth sending upstream to Solid:

```ts
declare module "solid-js" {
    namespace JSX {
        interface FeDropShadowSVGAttributes<T> extends SingleInputFilterSVGAttributes {}
    }
}
```

Also worth a look while you're in there: in `isolate` mode the `<feMerge>` at line 70 puts `SourceGraphic` first and every filter result on top of it, so a drop shadow paints *over* the shape rather than behind it.

---

## 10. `InteractionUtils` — hover and focus flags stick when an element is disabled

`Interaction.utils.tsx:71-75` now resets the two active flags when `isDisabled` becomes true, which is the important half. But `isHovered` and `isFocused` live in the store and aren't touched, and the listeners that would clear them are no longer attached. Hover an element, disable it, and it reports `isHovered: true` forever.

**Fix.** Reset the store in the same branch:

```ts
if (isDisabled) {
    setInternalFlags({ isHovered: false, isFocused: false });
    setActiveByKey(false);
    setActiveByMouse(false);
    return;
}
```

---

## 11. `InteractionUtils` — any key counts as "pressed"

`Interaction.utils.tsx:50-52` — `onKeyDown` sets `activeByKey` for every key, including Tab, Escape and the arrows. A keyboard user tabbing past the element sees the pressed state flash on.

**Pending your call** on whether "active" was meant to mean something broader here. If it does mean "pressed", then:

```ts
const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    setActiveByKey(true);
};
```

`onKeyUp` should check the same keys, otherwise a Tab keyup can clear a state that Enter set.

---

## 12. `ColorExtractor` — failures surface as unhandled rejections

`ColorExtractor.context.ts:36` and `42` — `getColor` and `getPalette` return promises that reject when the canvas can't be read, which is the normal outcome for a cross-origin image served without permissive CORS headers. Both `.then()` chains are bare, so the rejection surfaces as an uncaught error with a stack that points into `colorthief` rather than at anything useful.

There's also no `img.onerror`, so an image that simply fails to load leaves the effect hanging with no signal at all.

Right now this is the worst of both worlds: it makes console noise *and* the consumer can't react to it. Surfacing the error deliberately fixes both.

**Fix.**

```ts
export const useColorExtractor = (props?: ColorExtractorContextType) => {
    const [getColorData, setColorData] = createSignal<Color[]>([]);
    const [getError, setError] = createSignal<unknown>();

    createEffect(() => {
        // ... unchanged setup ...

        img.onerror = () => {
            if (!isMounted) return;

            console.warn(`ColorExtractor: failed to load image: ${src}`);
            setColorData([]);
            setError(new Error(`Failed to load image: ${src}`));
        };

        img.onload = () => {
            if (!isMounted) return;

            const request =
                colorCount === 1
                    ? getColor(img, { quality }).then((res) => (res ? [res] : []))
                    : getPalette(img, { quality, colorCount });

            request
                .then((res) => {
                    if (!isMounted) return;

                    setColorData(res ?? []);
                    setError(undefined);
                })
                .catch((err) => {
                    if (!isMounted) return;

                    console.warn("ColorExtractor: colour extraction failed:", err);
                    setColorData([]);
                    setError(err);
                });
        };
    });

    return { getColorData, getError };
};
```

Consumers who care can show a fallback; consumers who don't get a single readable warning instead of an uncaught error. Collapsing the two branches into one promise also removes the duplicated `isMounted` handling, and using `img` directly drops the `e.currentTarget` casts.

The cleanup at lines 25-28 clears `img.onload` but leaves `img.src` set, so an in-flight download keeps going after unmount. Setting `img.src = ""` there cancels it.

---

## 13. `Typewriter` breaks emoji

`Typewriter.tsx:171` — `segment.text.split("")` splits on UTF-16 code units, which cuts emoji and other non-BMP characters in half and renders them as replacement characters. `Array.from(segment.text)` splits on whole characters and is otherwise identical.

---

# Accessibility

## 14. `Tabs` — no keyboard navigation

`role="tablist"` tells assistive tech to expect arrow-key navigation between tabs, with only the selected tab reachable by Tab. Right now every tab is its own tab stop and the arrow keys do nothing, so it announces as a tablist but doesn't behave like one.

**Fix.** Give the selected tab `tabIndex={0}` and the others `tabIndex={-1}`, then handle keys on the root — `ArrowLeft`/`ArrowRight` when `dir` is `row`, `ArrowUp`/`ArrowDown` when it's `column` — moving the selection and focusing the newly selected tab. `Home` and `End` jumping to first and last are a nice extra.

---

## 15. `ScanlineAnimation` has `role="img"` with no accessible name

`ScanlineAnimation.tsx:161` — announces as an image with no description at all. Needs an `aria-label`, which means a prop for the caller to supply the text (the `src` filename is not a description).

---

## 16. `Modal` has `role="dialog"` with no accessible name

`Modal.tsx:80-81` — `role="dialog" aria-modal="true"` with nothing naming it. Dialogs need `aria-label`, or `aria-labelledby` pointing at their heading element. Same fix shape as item 15: a prop the caller fills in.

---

# Performance

## 17. `Surface` builds throwaway SVG elements just to inspect them

`Surface.tsx:123-133` and `74-80` both call `getFillDefs` / `getStrokeDefs` with a fake zero size, purely to look at what comes back — is anything "complex", and what's the first colour. The problem is that those callbacks don't return descriptions, they return finished SVG elements: gradients, filters, patterns with dozens of cells. All of it gets built and immediately discarded. In `SurfaceDiv` it happens twice, in two separate memos, on every recompute.

**Fix, the real one.** Split the description from the element, so the cheap questions can be answered without building anything. Making `defsElement` lazy is the smallest version:

```ts
type SVGDefsEntry = {
    id: string;
    defsElement: () => JSX.Element;   // was: JSX.Element
};
```

Consumers call `def.defsElement()` where they actually render, and `getIsComplex` / `getColor` can inspect `id`, `color`, `opacity` and `blend` without triggering any of it. This touches `SVGDefs.types.ts`, `Shape.tsx` and the sample configs, so it's a real change — but it's the only version that actually removes the waste.

**Fix, the cheap one.** If you'd rather not touch the type, at least evaluate the defs once instead of three times:

```ts
const getResolvedFillDefs = createMemo(() => props.getFillDefs?.(MOCK_SIZE_CB));
const getResolvedStrokeDefs = createMemo(() => props.getStrokeDefs?.(MOCK_SIZE_CB));
```

and have `getIsComplex`, `getBackgroundColor` and `getBorderColor` read those. Doesn't stop the elements being built, but stops them being built repeatedly.

---

## 18. `useViewportContext` measures the window even when it doesn't need to

`Viewport.context.ts:19`

```ts
const [getViewportFallbackRect, setViewportFallbackRect] = createSignal<DOMRect>(getWindowRect());
```

`getWindowRect()` runs immediately, on every call, whether or not a real viewport context exists. Reading `window.innerWidth` forces the browser to settle layout first, so it isn't free — and it's called more often than it looks, since `Tooltip` calls it directly and `ElementObserver.createObserver` calls it again. Every tooltip pays for two.

The `onMount` guard added at lines 26-29 doesn't help with this. It only affects whether the resize listener gets attached, which the `if (!props?.getScaledRect)` check below already handled — the two conditions now overlap and the new one can go.

**Fix.** Only build the fallback when there's no context to fall back from:

```ts
export const useViewportContext = (): ViewportContextType => {
    const context = useContext(ViewportContext);

    if (context) return context;

    return useViewportWithFallback();
};
```

A conditional call is fine here: `useContext` doesn't create anything, and whichever branch runs does so once per owner. `useViewportWithFallback` can then drop its optional `props` parameter and every `??` fallback inside it, which makes it considerably shorter.

---

## 19. `ScreenWiper` renders a few hundred inline SVGs

*Deferred — noted, not expected to be actioned soon.*

At 1920×1080 with the default 120px cell that's roughly 17 columns × 19 rows, each an `<svg>` with a shape inside and its own CSS transition — about a thousand nodes animating at once.

`SVGPatternDefsUtils` already exists and does exactly this job: one `<svg>` with a tiled pattern would replace the whole grid. For the circle variant, a CSS `radial-gradient` background would too.

Worth measuring before rewriting.

---

# Design and API

## 20. `AccessorProps` silently makes array props non-reactive

`typeUtils.ts:7-9`

```ts
type IsNonReactive<T> = T extends ((...args: any) => any) | JSX.Element | Date | Map<any, any> | Set<any> | symbol
```

Solid defines `JSX.Element` as including `ArrayElement extends Array<Element>`, and `string` is one of the element types. So `string[]` matches `JSX.Element`, gets classified as non-reactive, and passes through without becoming an accessor.

That's why `Tabs` reads `props.hrefs?.[i]` and not `props.getHrefs?.()`. It compiles and it works, but the reason is an accident of how `JSX.Element` is defined, and the consequence is that *any* array prop is frozen at creation with nothing in the code to explain why.

**Fix.** Decide explicitly, ahead of the `JSX.Element` check so it wins:

```ts
type IsNonReactive<T> = T extends readonly any[]
    ? false                                       // or true, if arrays should stay static
    : T extends ((...args: any) => any) | JSX.Element | Date | Map<any, any> | Set<any> | symbol
      ? true
      : false;
```

If you pick `false`, `hrefs` becomes `getHrefs` and `Tabs` needs updating. Either answer is defensible — the point is that right now nobody chose.

The `Set` in that list is deliberate and correct, incidentally: `Corners.visibleCorners` relies on it.

---

## 21. `get`-prefixed callbacks read like accessors but aren't

`AccessorProps` leaves function-valued props untouched, which is right, but it means props that happen to start with `get` end up looking identical to the generated accessors while behaving completely differently:

- `getController` (`ScanlineAnimation`, `Typewriter`, `AudioSwitcher`) isn't a getter at all — you hand it a callback and it hands you the controller. It's a "here, take this" wearing a getter's name.
- `getIsDisabled` (`Tabs`) takes an index accessor and returns a boolean.

Names that describe what they do would be clearer: `onControllerReady` and `checkIsDisabled` (or `isTabDisabled`). Both still pass through `AccessorProps` untouched, so nothing else changes.

---

## 22. `Button` declares an `id` prop and ignores it

`Button.types.ts:23` declares `id?: string`. Nothing in `Button.tsx` reads it. Consumers can pass it, TypeScript accepts it, and nothing happens.

Either wire it to the inner `<button>` or delete it from the type.

---

## 23. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written

*Acknowledged and parked — the current behaviour is correct, so this is about where the behaviour comes from rather than a bug.*

The intent is right, and remounting is genuinely the only way to reset SMIL state. Here's Solid's `Show`:

```ts
const conditionValue = createMemo(() => props.when);
const condition = keyed ? conditionValue : createMemo(conditionValue, { equals: (a, b) => !a === !b });
return createMemo(() => { const c = condition(); if (c) { ... return child; } ... });
```

With `keyed`, the outer memo re-runs whenever `props.when` changes by reference, and re-reading `props.children` inside it rebuilds the `<animate>` elements. That mechanism does what you want.

What it needs is for `props.when` to read something reactive, and it doesn't. `defs` is a plain object literal built inside `Shape`'s defs memo from the Playground callback, so reading `defs.animationIterationPatterns` isn't tracked, `conditionValue` has no dependencies, and the children are built exactly once.

The reset you see comes from one level up: when `getIterationConfig()` or `getAnimationDurationMs()` changes, `Shape`'s `getFillDefs`/`getStrokeDefs` memo re-runs, the callback returns a new array of new def objects with freshly built `defsElement` JSX, and `<For>` discards the old nodes and inserts new `<animate>` elements. The SMIL reset is free from the parent; the `Show` isn't contributing to it.

Quick way to confirm: `console.count` inside the `when` expression. It logs once per `<Show>` and never again, no matter how many times the iteration pattern changes.

If you ever want the `Show` to genuinely own the remount — worth having, since it stops depending on the parent rebuilding everything, and would survive memoising the defs later — the patterns need to arrive as an accessor:

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

This is the same underlying issue as item 20 — plain values where the reactive system needs a function to call.

---

## 24. `ElementFader` — `setTimeout(0)` isn't the next frame, and show/hide are duplicated

`ElementFader.ts:28-52`

**The timing.** `setTimeout(..., 0)` is a task that usually runs *before* the next paint, which makes it the flaky version of this pattern. For a CSS transition to animate, the browser needs to have computed style for the element's initial state first; if the timeout runs before that happens, the transition is skipped and the element just appears at its final value. `requestAnimationFrame` is literally the next frame.

If you've never seen a modal or tooltip pop in without transitioning, this is working fine as-is and isn't worth touching. Flagging it only because "next frame" is the stated intent and `setTimeout(0)` doesn't guarantee that.

**The duplication.** `show` and `hide` are the same nine lines with `1` and `0` swapped. Folding them together also gives the frame handle somewhere to live:

```ts
let pendingFrameId: number | undefined;

onCleanup(() => {
    if (pendingFrameId !== undefined) cancelAnimationFrame(pendingFrameId);
    clearTimeout(transitionTimeout);
});

const setTarget = (target: 0 | 1) => {
    if (getTransitionTarget() === target) return;

    setHasTransitionFinished(false);

    if (pendingFrameId !== undefined) cancelAnimationFrame(pendingFrameId);

    pendingFrameId = requestAnimationFrame(() => {
        pendingFrameId = undefined;

        setTransitionTarget(target);
        clearTimeout(transitionTimeout);
        transitionTimeout = setTimeout(() => setHasTransitionFinished(true), getTransitionDurationMs());
    });

    (target === 1 ? opts?.onShow : opts?.onHide)?.();
};

const show = () => setTarget(1);
const hide = () => setTarget(0);
```

`ScreenWiper.tsx:62-75` hand-rolls this same target / hasFinished / deferred-write pattern a third time. It isn't a drop-in replacement — its transition finishes on a `transitionend` event rather than a timer — but a shared primitive would be worth having if a third variation ever shows up.

---

# Tidying

## 25. `ViewportUtils` guards against a value that can't be missing

`Viewport.utils.ts:7-8` — `viewportContext?.getScaledRect()` and `?? 1` on a parameter typed as non-optional `ViewportContextType`. Either drop the guards or widen the parameter type to match what the code expects.

---

## 26. `Tabs` re-guards `renderFloater`

`Tabs.tsx:72` — `props.renderFloater?.()` inside a block already guarded by `props.renderFloater &&`. The gutter one above it is fixed; this one was missed.

---

## 27. `Shape` re-guards an already-checked ref

`Shape.tsx:52` — `rootRef?.offsetWidth ?? 0` where `rootRef` is a const that's already been null-checked at line 49. Both the `?.` and the `?? 0` are dead.

---

## 28. `Typewriter` casts its empty array to `any`

`Typewriter.tsx:17` and `75` — `EMPTY_ARRAY as any`, twice. A typed empty-array constant, or a local `const EMPTY_SEGMENTS: (ElementSegment & { startIndex: number })[] = EMPTY_ARRAY`, drops the cast.

---

## 29. `AudioSwitcher` audio elements should be `const`

`AudioSwitcher.tsx:20-21` — `let audioA` and `let audioB` are never reassigned.

---

## 30. Relative colour syntax needs a documented baseline

`Surface.tsx:78` uses `rgb(from ...)` and the SVG samples use `hsl(from ...)`. Relative colour syntax needs Chrome 119+, Safari 16.4+, Firefox 128+. Fine if that's your baseline; worth writing down somewhere before this gets published, since it'll fail silently on older browsers rather than degrade.

---

# Closed as intended

Settled in discussion. Recorded so they don't get raised again.

- **`RichText` discards overlapping tag content** — authors have escape mechanisms for literal brackets. Now covered by item 6, which only adds a warning.
- **Fades don't retarget mid-transition** (`AudioSwitcher`) — readjusting a running transition produces strange effects. Freezing the target at the start is the point.
- **`ElementObserver` measures every visible element every frame** — scrollbars, reflows and other unpredictable layout changes make an opt-in "is static" flag unsafe, and only one tooltip is visible at a time, so the cost doesn't accumulate.
- **`Shape`'s `getPaths()[0]` doubles as the fill and clip path** — by design. Measuring the smallest inner path across all strokes would be more correct but isn't feasible when sides can have different thicknesses per stroke. (Whether to always use the fill path instead is still an open subjective call.)
- **`SVGDefs.const.tsx` repetition** — it's a showcase file, not a built-in solution. Samples that read standalone are worth more here than deduplication.
- **`assignAnimationProps` doesn't clear `transform` / `filter` when a frame produces none** — measured on 800 mounted elements and unconditional assignment was slower. Keeping the styles in place and leaving it to the consumer to return consistent keys is the deliberate trade.
- **`SVGBaseFilterDefs` is an empty type** — deliberate future-proofing for shared filter fields.

# Checked and deliberately not flagged

- The `untrack` in `ScreenWiper`'s direction effect is correct usage, not a smell.
- `equals: Rect.isSame` / `Size2d.isSame` on the observer signals is exactly right, and does most of the work of keeping the per-frame polling affordable.
- `RichText` renders parsed content as text nodes rather than `innerHTML`, so the bbcode parser can't be used for injection.
- `Shape`'s path cache, keyed on floored thicknesses, is a good idea.
- `ImageSwitcher` and `AudioSwitcher` have effects that read and write the same signal. They settle after one extra pass rather than looping. `on(props.getSrc, ...)` would be tidier but the current form isn't wrong.
- `FPS.utils` and `Focus.utils` — nothing substantive found in either.
- `createMemo` around a single prop default, and memoised controller objects with no dependencies, are consistent enough across the codebase to count as house style rather than something to churn through.
