# Conventions

Settled decisions for this project, recorded so they are not re-litigated. This is the reasoning
that would otherwise live in code comments. Open problems live in `review.md`; nothing here is a
task. How to work with the user is in `CLAUDE.md` at the repo root.

Most of what follows is about `src/Lib`, which is the part with a contract. The repo-level
sections come first.

## Repo

### The three trees

`@thewaver/ss-components` is a SolidJS component library plus a Playground app that documents and
exercises it. Vanilla-extract for styles, Vite for both builds.

- **`src/Lib`** — the published library. Everything under here ships. It is also the only tree with
  a support contract, which matters for the argument recorded under _"Compatibility arguments"_ below.
- **`src/Playground`** — the demo app. Not published, and the home of every consumer-side painter.
  Those live in `App/StyledComponents`, each named `<LibComponent>Content` after the shell whose slot
  it fills and exported with the playground-wide `Page` prefix — `PageButtonContent`,
  `PageCheckboxContent`, `PageTooltipContent`. `App/PageComponents` keeps the playground's own page
  furniture instead: `PageVariants`, `PageExamples`, `PageCodeBox`.
- **`e2e/`** — the interaction suite, in Playwright. Not published, imports from neither tree: it drives
  the built Playground in a real browser. See _"Verifying interaction"_ below.

### Layering

`Abstracts/` is logic that renders no DOM — namespaced utils and hook-like factories.
`Fundamentals/` renders DOM. `Composites/` combines Fundamentals. `Fundamentals/Input/` groups the
controls that carry a user-editable value; the argument for that grouping is under _"Folder layout"_.
`src/Lib/index.ts` enumerates every export path individually and stays sorted — it is not a barrel.

**`Composites/` is deliberately not exported, and neither is `BinarySwitch`.** `index.ts` carries
`Abstracts` and `Fundamentals` only. A composite is a demonstration of how the Fundamentals combine
rather than a thing with its own contract, so shipping one would freeze a composition the consumer is
better off writing themselves — `Surface` is built and exercised in the Playground and reachable from
source, and that is the whole of its intended audience. `BinarySwitch` is internal for the same reason
from the other direction: only `BinarySwitch.types` ships, because `Checkbox`, `Toggle` and `Radio` are
its presets and the base itself is an implementation detail of those three. Worth stating because a
missing export otherwise reads as an oversight — it has been raised as a bug once already.

### House style

`const DEFAULT_X = …` at module scope, `createMemo` for derived props with a default, one blank line
between logical blocks, no destructuring of `props`. Types live in the owning component's own
`<Component>.types.ts`, next to the component — never in a shared per-directory types file collecting
types for sibling components, even when more than one consumes them. `StressTestDefs` beside
`StressTestProps` is the precedent; a shared `Xs.types.ts` is something to unwind rather than extend,
and names in these files drop the redundant directory prefix (`ExampleDefs`, not `PageExampleDefs`).

Read a neighbouring component before writing a new one.

### Commands

```bash
npm run build:lib          # vite lib build + tsup .d.ts emit
npm run build:playground
npm start                  # dev server
npm test                   # vitest, the pure-function half
npm run verify:dom         # playwright: build the playground, then drive it in a real browser
npm run format             # prettier, 4 spaces, 120 cols, import sorting
npx tsc --noEmit -p tsconfig.json
```

### Compatibility arguments cite `src/Lib` and nothing else

When arguing that some modern CSS or JS feature is safe to use here, **only `src/Lib` counts**. It is
the published package and the only thing with a support contract. `src/Playground` is a development
harness, and `src/Playground/App/Samples` in particular is scratch content — citing either as proof of
an established baseline is not an argument.

**A use that carries a fallback is not evidence for a use that doesn't.** Relative colour syntax
appears 71 times in Samples but twice in `src/Lib`, both in `Composites/Surface/Surface.css.ts`, and
both written with vanilla-extract's array-value form — `backgroundColor: [fillColorVar, "rgb(from …)"]`
— which emits the plain variable first and the relative-colour declaration second, so an engine that
does not understand the newer syntax drops it and keeps a working colour. That is graceful degradation,
not a hard dependency. Before claiming a baseline, check where the feature actually lives and whether
the existing uses degrade; if the new code has no fallback, say so rather than leaning on precedent
that does.

## API naming

### `AccessorProps`

Skips **only** functions and symbols (already reactive accessors / never-reactive callbacks, or symbols). Everything else is accessorized to `getX`.

Arrays, `Set`, `Map`, `Date`, `Node` / `HTMLElement`, and plain objects are all accessorized. Refs are declared as `elementRef: HTMLElement | undefined` / `anchorRef: HTMLElement | undefined` and become `getElementRef` / `getAnchorRef`.

**A generic prop cannot pass through it.** `AccessorProps<{ value: T }>` produces no `getValue` at
all — the mapped type's key filter depends on `IsSkippable<T>`, which cannot resolve while `T` is
unbound, so the key is silently dropped and every use site fails with "property does not exist".
Declare generic props by hand alongside the accessorized block: `RadioProps<T>` writes
`getValue: Accessor<T>`, and `RadioGroupProps<T>` keeps `valueSignal: Signal<T>` outside its
`AccessorProps<{...}>`. The failure mode is confusing enough — the type compiles, the prop just
vanishes — to be worth checking for whenever a generic component is added.

**It also cannot express an optional prop whose own value may be `undefined`, and a ref is exactly
that.** `AccessorizedPart` maps an optional key to `Accessor<Exclude<T[K], undefined>> | undefined`, so
the `undefined` is stripped from the _return_ type and only the prop stays optional. Declaring
`initialFocusRef?: HTMLElement` therefore yields `getInitialFocusRef?: Accessor<HTMLElement>`, which a
consumer's `createSignal<HTMLElement>()` cannot satisfy — an element ref does not exist until mount, so
its accessor is always `Accessor<HTMLElement | undefined>`. The existing refs sidestep it by being
**required**: `Tooltip` declares `anchorRef: HTMLElement | undefined`, which is not optional, so the union
survives. An _optional_ ref has to be declared by hand alongside the accessorized block, which is what
`ModalProps` does with `getInitialFocusRef?: Accessor<HTMLElement | undefined>` and what
`InteractionWrapperProps` already did with `getTooltipDefs?: Accessor<InteractionTooltipDefs | undefined>`
for the same reason. Two holes, one rule: if the prop mentions a type parameter or its value can itself be
`undefined`, write the accessor out.

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

Examples: `ElementObserver.createViewportRectObserver(ref, visible, opts)`, `Interaction.wrapElement(ref, disabled, opts)`, `Focus.autoFocus(ref, visible)`, `ElementFader(visible, opts)`, `FPS.createMonitor(disabled, opts)`.

**An observer's name carries its coordinate space**, because picking the wrong one fails silently — it
returns a plausible number that is wrong by the `Viewport` scale factor.
`ElementObserver.createViewportRectObserver` polls on `requestAnimationFrame` and reports position
**and** size through `ViewportUtils.getAdjustedBoundingClientRect`, with the scale divided out. It was
briefly just `createObserver`, which said neither what was measured nor in which space.

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

**Disabled is one mechanism for every control: `aria-disabled`, never the native attribute.** This
replaces an earlier split where native `disabled` was the default and `aria-disabled` was used only
in reachable mode. Native `disabled` blocks activation for free but kills every event, so the
tooltip explaining _why_ a control is disabled becomes unreachable exactly when it matters — hence
the split. What the split could not do is look the same in both modes: the UA paints a natively
disabled control greyed and drops `accent-color`, and no CSS reproduces that painting on the
`aria-disabled` branch, so the two states diverged visually no matter what was layered on top. Since
appearance parity is non-negotiable (next section), the mechanism has to be uniform, and only
`aria-disabled` supports both modes. Identical attributes in both states, identical paint, by
construction.

What that costs, accepted deliberately: activation gating lives in JS for _every_ disabled control
rather than just reachable ones, and disabled controls are no longer excluded from form submission —
they never were form-bound here, and a control that must be excluded can carry the attribute at that
point. The gating was already written and is unchanged: `Button.tsx` returns early in `onClick`,
`Checkbox.tsx` calls `preventDefault` on click so the pre-click checkedness toggle is reverted, and
both now gate `onMouseEnter` / `onMouseLeave` too, since native `disabled` used to suppress those
mouse events and nothing else would.

Three things had been leaning on the native attribute and now have explicit homes:

- **Tab order.** `wrapElement` sets `tabIndex = !isDisabled || isReachable ? 0 : -1` for every
  wrapped element. That line used to sit inside the `applyButtonSemantics` block, which was right
  when only a div-acting-as-button needed it and native `disabled` handled the rest. `role` /
  `ariaDisabled` / `cursor` stay opt-in there, because forcing `role="button"` onto an `<input>`
  breaks it.
- **Focus traps.** `FOCUSABLE_SELECTOR` in `Focus.utils.ts` is written as `button:not([disabled])`,
  `input:not([disabled])` and so on, so a disabled control with no attribute started matching and a
  disabled `Button` inside a `Modal` would have taken autofocus. `isReachable` now rejects
  `tabindex="-1"` up front, which is the correct tab-order rule anyway: `-1` means programmatically
  focusable, not tab-reachable. It also fixes `Tabs`, whose roving-tabindex links matched `a[href]`
  and were all being collected regardless of which one was active.
- **Reachable mode is no longer visible to a leaf.** `getIsReachable` existed as a third
  `renderControl` argument and an `isReachable` field on `InteractionControlProps` purely so a leaf
  could compute its own native `disabled`. Both are gone — reachability now stops at `wrapElement`,
  which is the "wiring that should be opaque" argument above, applied one level further in.

**Removing tab order is not enough on its own; mouse focus has to be refused too.** `tabIndex = -1`
means "programmatically focusable, not tab-reachable", so a disabled control could still be focused
by clicking it. This was originally recorded here as a consequence with no fix worth building, on
the grounds that nothing is drawn — `:focus-visible` does not match on mouse focus, and `isFocused`
stays false because non-reachable mode never attaches listeners. `TextInput` disproved the premise:
a focused text input blinks a caret whether or not `:focus-visible` matched, so a disabled field
invited typing it would silently refuse.

`wrapElement` now attaches one listener in its disabled-and-not-reachable branch —
`mousedown` with `preventDefault()`, which is the event whose default action is focusing the
element. This is the same "activation gating lives in JS" shape as `Button`'s `onClick` return and
`BinarySwitch`'s cancelled click, applied to focus, and it is uniform across every wrapped control
rather than special-cased for text. Disabled controls also stop being text-selectable by drag, which
matches what native `disabled` did anyway.

Reachable controls are untouched: the branch only runs when the control is disabled **and** not
reachable, so a control that is focusable in order to explain itself still is.

One hole remains, deliberately. Clicking a `<label>` caption still focuses a disabled control,
because label activation focuses the labelled control directly rather than by dispatching
`mousedown` on it. After the caret suppression below, nothing is drawn in that state — no ring, no
caret — so it lands back on the condition that was acceptable before, and the only catch-all,
blurring from a `focus` handler, buys it with focus flicker and a jump to `<body>`.

The reachable predicate itself is unchanged:

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

**The third clause reads the value, not the prop — settled 2026-08-06, with `Select`.** It was
`props.getTooltipDefs !== undefined` and is now `props.getTooltipDefs?.() !== undefined`, which also
decides whether the `Tooltip` renders at all. This is not a loosening of the guard, and the wording
above is what makes that clear: the clause asks _"is there anything to reveal"_, which is a property
of the value. Prop presence was an exact proxy for it only because a hand-written control that passes
`getTooltipDefs` always returns something from it. A group rendering items from records breaks the
proxy — the field is absent on most options, so the group must forward
`getOption().tooltipDefs && (() => getOption().tooltipDefs!)` and a function returning `undefined`
crashes the spread into `Tooltip`. Reading the value makes the honest form (`() =>
getOption().tooltipDefs`) the only form, and it types: `Accessor<InteractionTooltipDefs<TExtra> |
undefined>`.

**Presence as a guard survives where it is load-bearing, which is the opt-in.** Nothing about this
lets hover text turn a control reachable by accident — `getIsReachableWhenDisabled` is still a prop
the consumer sets explicitly, and it is still the clause that carries "only when asked". The
`console.warn` for reachability-without-a-tooltip stays presence-based on purpose: it catches the
authoring mistake it was written for (reachability wired up with no tooltip prop at all) and stays
quiet for a group that forwards both fields unconditionally and legitimately has options with neither.

The render is a `<Show when={getTooltipDefs()}>` with the accessor child form rather than a
`&&` plus `!`. Non-keyed, so a record rebuilt under `<Index>` does not remount a visible tooltip and
restart its fade; the accessor child is what removes the non-null assertion.

**Disabled + reachable has to look disabled — identically, not approximately.** Reachability is an
accessibility affordance, not a state: a control that looks actionable but does nothing is worse than
one that plainly reads as unavailable. Under the old mechanism split this failed on screen — in
`CheckboxPage` the "Disabled" box sat next to a "Disabled + reachable" box rendered in the full
accent colour, looking like the one control on the page you were meant to click.

Two rounds were needed and the first one is the lesson. It kept both mechanisms and put one
appearance on top of them, `filter: grayscale(1)` plus `opacity: 0.5` on `interactionDisabled` —
which is set from `getIsDisabled()` alone, so it covers both. That killed the accent colour and was
a real improvement, but it could only ever narrow the gap, because the two branches start from
different UA paint underneath the same filter. Emulating the UA per control instead
(`accent-color: GrayText` on `[aria-disabled='true']:not(:disabled)`, and a rule per control type
after that) trades one approximation for a longer list of them. Approximating a rendering that no
spec defines is not a way to reach "equal" — the mechanisms had to converge instead, which is what
the section above does.

**Nothing that fades or filters may touch the element that owns the focus ring.** `filter` and
`opacity` paint an element's outline along with everything else, so an early version of the
appearance — `filter: grayscale(1)` plus `opacity: 0.5` on the wrapper root — drew the reachable
control's ring grey at half strength. In the Playground that ring is
`:focus-visible { outline: 2px solid var(--clr-highlight) }`, magenta, and greying it is worse than
it sounds: the ring is the entire reason the control is reachable. Redrawing it on the unfiltered
root via `:has(:focus-visible)` was considered and rejected — the root is not focusable, so the
consumer's own `:focus-visible` rule cannot reach it, and the library would end up owning one ring
appearance for disabled controls and the consumer another for enabled ones. That is the same
inconsistency in a new place.

Two further attempts to keep the fade inside the library are recorded because they look reasonable
and are not. Inherited colour only (`color: GrayText`, `accent-color: GrayText`) leaves the ring
alone but cannot touch anything a consumer painted with explicit values, which is most of what you
see. Pushing `filter` one level down to `interactionDisabled > * > *` reaches consumer paint and
spares the ring, but it depends on a leaf returning the focusable element itself and on the painted
thing living exactly one level below — a structural assumption CSS cannot state or check.

Both are gone. The library no longer paints disabled at all: the painter does, from the flags it is
handed (next section). Since the painter for `Button` is a child of the `<button>`, fading it can
never reach the ring, which is on the parent — the constraint is satisfied by structure rather than
by careful selectors.

### Controls: the shell owns behaviour, the painter owns paint

Settled **2026-08-05**. The consumer's own words for it: `Button` is a shell, `buttonContent` is the
painter, and `Tooltip` and `Modal` already work this way — functional, not visual.

**A control paints nothing.** The shell owns events, ARIA, focus and tab order, tooltip anchoring,
geometry and the flags. Every pixel comes from `renderContent(getFlags)`, which is declared on
`InteractionControlProps` so it reaches every leaf, and re-exported through `ButtonProps` /
`CheckboxProps` with `Pick<InteractionControlProps, "id" | "renderContent">` — the same pass-through
shape `id` already used. It replaced `children`: a slot cannot take arguments in Solid, and the
painter is useless without the flags. Children-as-function (`<Button>{(getFlags) => …}</Button>`) was
the alternative, with real precedent in `For` / `Show`; `renderContent` won on consistency with the
`render*` convention and with `Tooltip.renderContent`.

**Where the paint goes is the leaf's decision, not the wrapper's.** `Button` puts it inside the
`<button>`, because that is its label. `Checkbox` cannot — `<input>` is a void element — so the leaf
returns a fragment: the painter first, in flow, and the input second, absolutely positioned over it
with `inset: 0`. The painter therefore sizes the box, the input covers exactly that box, and the ring
lands exactly around what was painted. Consequences of that arrangement:

- The input is a genuine blank slate — `appearance: none` plus `!important` resets for background,
  border, radius, shadow, padding, margin, width and height. The `!important` is not defensive
  habit: `input:not([type="range"])` and `input[type="checkbox"]` in the Playground stylesheet
  outrank a class, so without it the app's border and 20×20 sizing would still paint over the
  painter. `outline` is deliberately not reset — that is the ring.
- The state parity from the previous sections is now structural. A painter is handed `isDisabled` and
  nothing else about reachability, so "disabled" and "disabled but reachable" cannot be drawn
  differently even by accident.
- A painter that renders text should mark it `aria-hidden`, since the accessible name comes from the
  input, and stray glyphs like a check mark would otherwise be announced as page content.

**The tooltip gets the flags too**, since it is usually explaining a state. `Tooltip` itself was not
touched — the log above says keep it that way — so `InteractionTooltipDefs` widens only the
consumer-facing `renderContent` to `(getVisibilityTarget, getTransitionDurationMs, getPlacement,
getFlags)`, and the wrapper adapts it down to `Tooltip`'s three-argument signature.

What the Playground had to grow, which is the honest cost of the model: `PageButtonContent` and
`PageCheckboxContent`, one painter each, holding the gradient, the border, the check mark and the
disabled / error / checked rendering. Fourteen call sites changed. In exchange the library carries no
colours at all, and a consumer defines their branded control once and uses it everywhere.

**The wrapper's box has to equal the painted box**, because the decoration slot is `inset: 0` against
the root and the focus ring is drawn on the control. Two things guarantee it, both on the root: it is
`display: flex`, so its in-flow child is a flex item rather than an inline-block sitting on a line box
with descender slack under it, and `interactionRoot > *` forces `margin: 0 !important`.

The `!important` is not defensive habit. The Playground stylesheet carries
`input[type="checkbox"] { margin-block: 10px }`, and an element-plus-attribute selector outranks the
`margin: 0` written in `Checkbox.css.ts` — so a 20×20 checkbox sat in a 20×40 root and `Corners` drew
a decoration twice the height of the control it decorated. That specific route is closed now that the
input is absolutely positioned and paints nothing, but the rule still earns its place: it is the
painter's margin it now guards against, and the failure would look identical. Spacing belongs outside
the wrapper; a painter that wants inner space uses padding.

The general invariant, worth stating because it predicts the next bug of this shape: nothing may
decouple the painted box from the wrapper's box. Sizing, padding, border and surface paint are the
painter's to choose and the wrapper measures the result. `margin`, `transform`, `position`, `float`
and `inset` on the in-flow child are not, and only `margin` is currently defended.

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
`interactionError`, `interactionDisabled`) are empty and stay only as a CSS-side escape hatch and for
the root's own `z-index` rules; since the shell stopped painting, a painter reads state from the flags
it is handed rather than from a class on an ancestor.

**Flags merge, external wins.** `isPressed` / `hasError` / `isDisabled` are the owner's;
`isHovered` / `isFocused` / `isActive` are the element's. `wrapElement` keeps its listeners attached
while disabled rather than tearing down, and gates the flags instead: `isActive` and `isHovered` are
forced false whenever `getIsDisabled()`, while `isFocused` stays live.

`isHovered` is gated because a painter keyed on hover would otherwise light up under the cursor on a
disabled control and read as actionable — and now that painters own every pixel, the flags are the
only thing standing between a disabled control and a live-looking one. Gating the flag does not touch
hover behaviour that must survive: `Tooltip` runs its own listeners on the anchor, so a disabled but
reachable control still reveals its explanation on hover. `isFocused` is the deliberate exception,
because a reachable control has to show where focus landed.

`wrapElement`'s `role` / `ariaDisabled` / `cursor` block stays opt-in via `applyButtonSemantics` —
right for a div acting as a button, wrong everywhere else, since forcing `role="button"` onto an
`<input>` breaks it and native controls already carry correct semantics. Its `tabIndex` line is the
exception and now runs for every wrapped element, for the reason given further up.

### Audit: the React-era `BinarySwitch`, and what of it survives here

Done **2026-08-05**. A `_TEMP` folder was dropped into `src/Lib` containing a copy-paste of a
two-year-old Preact implementation of these same controls: a central `BinarySwitch` base plus
`Checkbox`, `Toggle` and `RadioButton` leaves, 568 lines with configs and stylesheets. The question
was whether anything in it should be leveraged before `Toggle` is built here, or whether
`InteractionWrapper` already makes it moot. It has been read in full, the findings are below, and
the folder was deleted afterwards — it referenced `@ui/*` and `preact` aliases that don't resolve
here, so `vite-plugin-checker` failed the build for as long as it sat in the tree and nothing could
be tested visually.

**The base was the same idea, arrived at from the other side.** `BinarySwitch` was already a shell:
a hidden native `<input>` plus a `children` slot that did all the painting, one base parameterised
by `type: 'checkbox' | 'radio'`. So this project's model is not a departure from what was done
before — it's the same instinct, with one difference that turns out to decide everything else.

**How the painter learns the state is that difference, and it is not a close call.** The old
painters read state out of CSS, off the hidden input, through sibling selectors —
`input[type=checkbox]:checked + container &`, `:disabled + &`, `:focus-visible + &`. That is free at
runtime and it works, but it cannot be carried over here, for three reasons that stack:

- It hardcodes DOM adjacency. `+` requires the input to be the painter's immediately preceding
  sibling; `CheckboxElement` renders the painter **first** and the input after it, precisely so the
  input can be `inset: 0` over the painter and own both the hit area and the focus ring. The
  selector would point the wrong way, and fixing that would mean fixing the DOM order to the
  stylesheet forever.
- CSS can only see states the DOM has. `isPressed`, `hasError`, `isActive` and "disabled but
  reachable" are not DOM states. Worse, disabled here is `aria-disabled` and never the native
  attribute (see two sections up), so `:disabled` matches nothing at all — the old stylesheets'
  disabled and focus rules would silently do nothing if pasted in.
- It puts library class names inside consumer paint. A painter's stylesheet would have to import and
  reference the library's classes to know when to look checked. The settled model is the exact
  inverse: the library hands over data and the painter owns every pixel.

Flags-as-data does everything the selector approach does and four things it can't, so nothing from
that layer is worth porting.

**`Toggle` needs no new library code, and that is the audit's most useful result.** In the React
tree, `Toggle` was a full component — 141 lines across `.tsx`, `.css.ts` and `.config.ts` — and
almost all of it was paint: body width and height, handle size, border radii, the two translate
distances computed in JS to avoid absolute positioning, the colour swap on check. Every one of those
belongs to the painter here. A toggle **is** a `Checkbox` whose painter draws a track and a sliding
handle instead of a box and a tick; the `isChecked` flag it already receives is the entire input it
needs. The only library-side difference is one line of semantics: a switch should announce "on/off"
rather than "checked", which means `role="switch"` on the input. So `Toggle` should be a thin preset
over `Checkbox` in the `Surface`-over-`Shape` shape already settled here — not a new leaf, and not a
shared base extracted from two leaves that would have nothing to share.

**`Radio` is where a shared base would earn its keep.** _Corrected after the fact: this paragraph
originally continued "and it is not the base `BinarySwitch` had", which was wrong. Only the group's
state model and keyboard turned out to need somewhere new — they became `RadioGroup`. The
leaf-sharing job was exactly what the old base was for, down to the `type` parameter, and the
component that shipped keeps its name for that reason._

The old radio support was one prop — `type="radio"` — plus `name`, leaving mutual exclusion to the
browser. That is too little here, because the two things a radio group actually needs are behaviour,
and behaviour is the shell's:

- A radio group is a **single tab stop**, with arrow keys both moving and selecting. That is a
  roving tabindex, which `Tabs` already implements (`Tabs.tsx` handles `ArrowRight`/`ArrowDown` and
  their reverses against an enabled-index walk) and is the model to follow rather than reinvent.
- The **group owns one value**, not one boolean per radio. `checkedSignal: Signal<boolean>` is the
  wrong shape for a member of a set; a `RadioGroup` holding `Signal<T>` and handing each radio a
  derived boolean is the right one. Native `name` grouping gets the DOM's mutual exclusion for free
  but leaves the state model unowned, which is how the React version could get away with skipping
  this and this one cannot.

**The size / config / token layer is inconsequent here, and it is the bulk of the code.** The three
`*.config.ts` files, the `s | m | l` scale, `BINARY_SWITCH_SIZE_REMAP` mapping an outer `xs | s | m`
onto it, the derivations off `uiCoreConfig.input.height`, `assignInlineVars` pushing per-instance
colours into the stylesheet, `useBackground` reading an ambient background to pick a contrast pair,
`hasOutline` switching filled versus outlined — all of it exists so the library can paint using
values the consumer chose. This library paints nothing, so there is no size to scale and no colour
to push. Port none of it. The `hasOutline` _technique_ — an empty marker class selecting a variant —
is already the idiom here (`isChecked`, `isHovered`, `interactionPressed`) and needs no import.

**One genuine gap it exposes: the flags describe state, not events, and carry no pointer geometry.**
`Checkbox` and `RadioButton` each spawned a ripple on change, imperatively, through a controller
ref — `spawnRippleEffect` read the element's width and called `controller.spawnEffect(x, y, …)`.
Nothing in this project's contract can express that. `renderDecoration(getFlags)` is declarative and
receives a snapshot of state; a painter can watch `isActive` flip with its own effect, but it cannot
know **where** the pointer was, and a one-shot animation keyed on a boolean has nowhere to put an
origin. If ripples or any positioned one-shot effect are ever wanted, that is the missing piece: the
originating event, or coordinates derived from it, reaching the decoration slot. Naming it now so it
isn't rediscovered later as a styling problem. Not worth building until something asks for it, and
it should be opt-in when it is — otherwise every control that wants no effect pays for a listener it
ignores.

**Two smaller things, recorded so they are not re-litigated.**

- _The `<label>` wrapper and `LabelContext`._ `BinarySwitch` wrapped itself in a `<label>` so that
  clicking the painter toggled the input, and read a context to skip that wrapper when an ancestor
  `Label` already supplied one, since nested `<label>` elements are invalid. The hit-area half is
  already solved here, differently and better: the input is `position: absolute; inset: 0` over the
  painter, so it **is** the hit target and no label is needed. The context half has no equivalent
  and no current need, but the pattern is worth remembering if a `Label` or `FormField` ever
  arrives — a component that supplies a wrapper should let descendants detect it, rather than making
  every caller pass a flag that says "I am already labelled". Incidentally that old
  `<label disabled={disabled}>` was never valid HTML; `label` has no `disabled` attribute and the
  prop did nothing.
- _`hasOwnValue`._ The base carried a controlled-versus-uncontrolled mode flag: with it false it
  force-wrote the DOM back to the prop and reported the inverse of the prop; with it true it
  reported the DOM's own checkedness. `checkedSignal: Signal<boolean>` replaces the flag with a
  single mechanism and is the settled convention here (see _Signal tuples for two-way state_), so
  the flag should not come back. The force-write it performed, however, guards against something
  real, and became `syncElement` — see _One writer for the input's state_ below.

### Controls: `BinarySwitch`, and `Toggle` / `Radio` as presets over it

Settled **2026-08-05**, immediately after the audit above, which predicted most of this.

**`BinarySwitch` is a private shared composite, not a leaf and not public API.** It is
`InteractionWrapper` plus the hidden-native-input leaf plus the change gating and the single-writer
DOM sync, parameterised by `type: "checkbox" | "radio"`. `Checkbox`, `Toggle` and `Radio` are each
about a dozen lines on top of it. The audit's prediction held: Checkbox and Radio shared roughly
nine tenths of their leaf, and the part they shared included `syncElement` — the one piece of logic
that must not be copy-pasted into two files, because the second copy is where the bug comes back.

It lives in `Fundamentals/Input/BinarySwitch/` and is deliberately **absent from `src/Lib/index.ts`**,
which enumerates exports file by file. Only `BinarySwitch.types` is exported, because
`CheckboxProps` and `ToggleProps` are aliases of `BinarySwitchPresetProps` and the emitted `.d.ts`
has to resolve it. This is a slightly unusual status — a folder under `Fundamentals` that ships no
component — and it is the honest one: it renders DOM, so it is not an `Abstract`, and consumers
should reach for the presets, so it is not public. Promoting it later is a one-line change; the
reason not to now is that a public `BinarySwitch` is the union of three controls and invites people
to use it instead of the one that matches their intent.

**One writer for the input's state.** `BinarySwitch` has no JSX `checked` binding. A single
`syncElement` pushes both properties from state, called from a render effect and again from
`onChange` immediately after reporting:

```tsx
const syncElement = (element: HTMLInputElement) => {
    element.checked = props.getIsChecked();
    element.indeterminate = getIsMixed();
};
```

The reason, which is not obvious and cost a bug to find: the browser flips `input.checked` **before**
it fires `change`. If the owner's setter then refuses the write — an optimistic toggle a server
rejects, a "keep at least one selected" rule, a form frozen mid-submit — the signal never changes,
so the render effect never re-runs, and the input is left `checked` while state says otherwise.
Nothing looks wrong at that moment, because `appearance: none` means the native tick is gone and the
painter draws from the flags, which are correct. The damage lands on the **next** click: the browser
flips back and reports the opposite of what the user did, and stays inverted from then on.

`indeterminate` has the identical failure with a likelier trigger — the browser **clears** it on
click, and an effect keyed on an unchanged mixed value will not put it back, so a mixed checkbox
would silently stop being mixed after one click. Hence both properties in one function.

This only holds while the owner's write is synchronous. A consumer `onChange` returning a promise is
awaited by nobody; an async accept would need the render effect to finish the job when the signal
eventually lands.

**`checkedState` is a flag, so the painter stops being told twice.** `ExternalInteractionFlags`
gained `checkedState?: boolean | "mixed"`, and `InteractionWrapper` a matching `getCheckedState`
which the presets `Omit` from their public props — they own the value, and two sources for one state
is the actual problem the omission prevents. Before this, `CheckboxPage` passed `checkedSignal` to
the component _and_ closed over the same signal to hand `getIsChecked` to the painter, with the
component connecting neither: the identical faked linkage that `renderDecoration(getFlags)` was
introduced to kill. `PageCheckboxContent` / `PageToggleContent` / `PageRadioContent` now read
`getFlags().checkedState` and take nothing but flags.

Three states rather than two is also why this had to be a flag at all. Mixed is computed by the
shell — it is what drives `input.indeterminate` — so a painter that had to infer it from a boolean
could not draw it.

**Mixed is one-way and deliberately not part of the signal.** `getIsMixed` sits beside
`getHasError`, not inside `checkedSignal`. The reason is behavioural, not typographic: a user can
never _click into_ mixed. Mixed is a summary the owner computes — a parent box over children that
disagree, a setting inheriting from elsewhere — and clicking always resolves it to a definite value.
Putting `"mixed"` in the two-way signal would force every consumer of a plain checkbox to handle a
third case that only ever arrives from their own code, and would let the component write a value the
user cannot produce. `Radio` has no `getIsMixed` at all, and it is `Omit`ted from `RadioProps`: ARIA
gives `role="radio"` no mixed state, and a radio that summarises anything is a checkbox.

**A switch may not be mixed, so `Toggle` drops its role exactly while mixed.** ARIA does not allow
`aria-checked="mixed"` under `role="switch"`. Rather than emit invalid ARIA or refuse the state the
consumer asked for, the leaf computes `role = isSwitch && !isMixed ? "switch" : undefined`, falling
back to the native checkbox whose `indeterminate` property _does_ map to mixed. So a tri-state
toggle announces as a mixed checkbox for as long as it is mixed and as a switch the rest of the
time. The role flips on a state change, which screen readers re-announce anyway. This is the one
place where the requested feature and the spec disagree, and it is worth knowing that the resolution
is a role swap rather than an approximation.

**The group owns the value; each radio derives a boolean from it.** `RadioGroup` takes
`valueSignal: Signal<T>` — the `valueSignal` name the prop-prefix table already reserved — and
publishes a context; `Radio` takes `getValue` and reads `context.getValue() === props.getValue()`.
Per-radio `checkedSignal` was never on the table: a member of a mutually exclusive set does not own
its own truth, and N booleans can represent states the group cannot be in.

Context, rather than the count-plus-`renderOption` shape `Tabs` uses, because each radio has to keep
the whole `InteractionWrapper` surface — its own tooltip, decoration, disabled and error state. A
data-driven group would have had to grow a `compute*` prop per capability and re-expose all of them
per index. The cost is a registration mechanism: `context.register(entry)` is called during each
`Radio`'s setup and cleans itself up through the caller's own `onCleanup`, and the group sorts
entries by `compareDocumentPosition` rather than trusting registration order, so a reordered `<For>`
cannot desynchronise the keyboard order from what is on screen.

The context is typed `unknown` on the value, because a context cannot be generic. `Radio<T>` casts
at the boundary. Consequence, benign but worth knowing: a `RadioGroup<SizeValue | undefined>` will
happily accept a `Radio<string>`, and only the group's own signal keeps the type honest.

**Native `name` grouping is used; native arrow-key navigation is not.** Every group generates a
`createUniqueId()` name unless given one, so the browser does the DOM-level mutual exclusion for
free. Its keyboard handling, however, cannot be used, and the reason is a direct consequence of a
much earlier decision: disabled here means `aria-disabled` and never the native attribute, so the
browser sees no disabled radios and its own arrow navigation would happily move to one **and select
it**. `RadioGroup` therefore `preventDefault()`s the arrows and does the walk itself.

Its rule is one step more generous than either pattern alone: arrows move to the next entry that is
enabled **or** reachable-while-disabled, and select it only if it is enabled. That keeps the radio
pattern's single tab stop, keeps disabled options unselectable, and still lets a disabled-but-
reachable option receive focus so its tooltip can explain itself — which was the entire point of
reachability. `Home` / `End` jump to the ends of the same set. All four arrows work regardless of
`getDir`, which only drives layout.

Making that possible required `computeIsReachable` to move out of `InteractionWrapper` and into
`InteractionUtils`, since `Radio` now computes the same predicate for its group entry. Extracting it
rather than restating it is the point: the predicate is settled (`isDisabled &&
isReachableWhenDisabled && hasTooltip`) and two copies would drift. Note this does not re-expose
reachability to a _leaf_ — the thing the split deliberately stopped. `Radio` is a preset holding the
props the predicate is computed from, one level above the leaf.

**`tabIndex` is now a conjunction, which narrows a previously absolute rule.** `wrapElement` took an
optional `getIsTabbable` and computes `(!isDisabled || isReachable) && isTabbable ? 0 : -1`. The
wrapper's veto is unchanged and still absolute — a disabled, non-reachable control is never
tabbable — but an ancestor owning a roving tab order can now narrow it further. This amends the
earlier note that the `tabIndex` line "runs for every wrapped element" unconditionally: it still
runs for every element, it just no longer decides alone. `getIsTabbable` is left public on
`InteractionWrapper` and inherited by `Button` and `Checkbox`, because participating in someone
else's roving tab order is a general capability, unlike `getCheckedState`, which the presets own.

`InteractionWrapper` also gained a `ref` passthrough, since `RadioGroup` has to be able to `focus()`
a specific radio and the control element was previously visible only inside the wrapper.

**Known gaps, deliberate rather than overlooked.**

- **Arrow keys do not cross groups**, and a group with every option disabled has no tab stop at all
  — both correct, both worth stating because they look like bugs from the outside.
- **A caption drawn inside the painter is not the same thing as a label.** `PageRadioContent` draws
  its caption inside the painter, which the `inset: 0` input covers, so the whole row is clickable.
  That is a legitimate painter choice and still supported, but it is not an accessible name in the
  platform sense and it cannot place the caption anywhere the painter does not reach. `Label` is the
  answer for that; see the next section.

### Controls: `Label`

Settled **2026-08-05**, closing the gap the audit recorded.

**It wraps rather than points.** `Label` renders a `<label>` around both the caption and the
control, so association is implicit and no `id` has to be invented or threaded. `for` / `getId`
pointing was rejected for that reason — an explicit id is a second thing to keep unique and in sync,
and it only earns its keep when the caption cannot be a sibling of the control, which nothing here
needs yet.

**It paints nothing, including the cursor.** Geometry only: `display: flex`, `width: fit-content`,
plus `getDir` and `getGap`. Cursor was considered and left out, and the reason is worth recording
because it looks like an oversight: a `<label>` cannot know whether the control inside it is
disabled, so a blanket `cursor: pointer` would lie over a disabled control, and taking
`getIsDisabled` would duplicate state the control already owns — two sources for one truth, the
thing `getCheckedState`'s omission exists to prevent. The caption is the consumer's child, so the
cursor is the consumer's to set; the Playground does it in `pageStyles.labelCaption`.

**`aria-label` loses to a visible caption.** `Label` publishes a context, and `BinarySwitch` reads
it: inside a `Label`, `getAriaLabel` is suppressed and a warning fires. This is not a preference
between two equal options — `aria-label` overrides the label's text as the accessible name, so a
control carrying both is announced as something other than what the user can read, which is the
failure WCAG's _Label in Name_ describes. Suppressing rather than merging keeps one visible source
of truth; warning rather than failing silently is the house pattern.

That context is the ancestor-detection idea the audit lifted from the React `LabelContext`, put to a
better use than the original. It also does the original's job: a `Label` nested inside another
`Label` renders a `<div>` instead, since nested `<label>` elements are invalid HTML and their
activation target is ambiguous.

**A group caption is not a `Label`.** `RadioGroup` takes `getAriaLabel` and puts it on the
`role="radiogroup"` element. Wrapping a whole group in a `<label>` would claim that one control is
being named, and would make a caption click activate an arbitrary member.

### Controls: `TextInput`

Settled **2026-08-05**. The first control whose element the user can see through, which turns out to
be the only thing that separates it from `Checkbox`.

**The overlay geometry survives; what the input keeps does not.** `TextInput` renders painter first
in flow, `<input>` second at `position: absolute; inset: 0` — the exact `CheckboxElement`
arrangement, so the painter sizes the box, the input covers that box, and the focus ring lands
around what was painted. What changes is the blank-slate rule: a checkbox input shows nothing, while
a text input **is** the thing that shows the value, the caret and the selection. So the reset keeps
`appearance`, `background`, `border`, `border-radius`, `box-shadow`, `margin` and `min-width` — all
`!important`, for the reason `BinarySwitch.css.ts` already records — and deliberately leaves
`padding`, `font`, `color`, `caret-color` and the rest of the text-drawing properties alone.
`user-select: text` is set because `interactionRoot` sets `none`.

**Nesting the input inside the painter was the obvious alternative and lost on the focus ring.** If
`renderContent` received a slot and placed the input inside its frame, typography would inherit and
the padding duplication below would vanish entirely. But the input is still the focusable element,
so the ring would then be drawn around the inner text area rather than around the frame, and
recovering it means the painter matching on `:has(:focus-visible)` — which is the arrangement
rejected under _"Nothing that fades or filters may touch the element that owns the focus ring"_,
where the library owns one ring appearance and the consumer another. It would also have made
`renderContent` a two-argument contract for this one control. Overlay geometry is settled and
proven; keep it.

**The cost, accepted: the painter's inner padding and the input's `padding` have to agree, and
nothing enforces it.** Both live in the consumer's stylesheet, so a shared constant fixes it — the
Playground's `TextInputContent.css.ts` derives both from `FIELD_PADDING`. This is the first place
where the painter does not own literally every pixel, and it is the direct price of keeping the ring
correct.

**`computeTextStyle` is the one place paint lives on the element the browser owns**, and it exists
because there is no other hook: the consumer must style the text, the text is inside the input, and
the input is the library's element. It takes `getFlags` per _"Render props receive what drives
them"_ — disabled text is grey, and no ancestor knows the flags, which is the one thing plain CSS
inheritance cannot do here.

It returns a **whitelisted** object rather than a class name, and the whitelist is the point:

```ts
export type TextInputTextStyle = Pick<JSX.CSSProperties, "color" | "font-size" | "padding" | …>;
```

The first version took `computeClassName` and carried a prose rule — _"it may only carry properties
that draw text"_ — that nothing enforced. A `Pick` of `JSX.CSSProperties` makes that a compile
error instead, so a border or a `position` cannot reach the input by accident and decouple the
painted box from the wrapper's box. Solid's `JSX.CSSProperties` extends `csstype.PropertiesHyphen`,
so the keys are kebab-case and lengths must be strings — `"12px"`, not `12`.

**It is applied as an inline style, and that ends the specificity war on the consumer's side.**
Inline styles outrank every selector short of `!important`, so a consumer no longer has to reach
their own input through a `globalStyle` on `input.<class>` just to beat an app stylesheet's
`input:not([type="range"])`. The Playground lost four `globalStyle` blocks to this change. The
library's own `!important` resets still win over it, which is correct: `caret-color` under
`[aria-disabled='true']` must beat whatever the consumer asked for.

**One prop rather than one per property**, because almost everything that draws text is an
_inherited_ CSS property — `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`,
`text-transform`, `caret-color`. Enumerating them as `getTextColor`, `getFontSize` and so on
reimplements CSS one prop at a time and still leaves a tail. One object covers the tail by widening
the `Pick`.

**Padding is deliberately _not_ in the whitelist, because the library owns it.** The obvious division
of labour — background element owns borders, corners _and padding_; input owns only text — does not
work, since an absolutely positioned box resolves `inset` against its containing block's padding box
and **ignores that ancestor's padding entirely**. Padding on `renderContent` insets nothing. The
first version therefore put padding in the whitelist and made the consumer compute it; `getPadding`
and `getGap` replaced that — see _"The field's inset is measured, not declared"_ below. The
whitelist is now purely text properties and the rule no longer bends.

**What a value-only API cannot express**, recorded because it is the reason the class may have to
come back: `::selection`, `::placeholder`, `::-webkit-*` and `:autofill` are selectors, not values.
The last of those is a real gap rather than a theoretical one — Chrome's `:autofill` forces an opaque
background that `background: transparent` cannot clear, so an autofilled field paints a solid
rectangle **over** the painter, square-cornered and ignoring the frame. `color` is locked the same
way.

**Left alone deliberately, and the reason is not that it is hard.** The lock is an anti-spoofing
measure: Chromium refuses author overrides so a site cannot conceal that the browser filled a field
with the user's stored data. Defeating it is possible — `box-shadow: inset 0 0 0 1000px <colour>`
works because inset shadows paint above the background and below the text, and
`-webkit-text-fill-color` covers the forced text colour — but doing so by default would have the
library suppress a signal the browser is deliberately showing the user. `opacity` and `filter` are
not alternatives at any specificity or under any selector: both composite the element's whole paint,
so they fade the text with the background, and both would reach the focus ring.

So no escape hatch ships. If one is ever wanted it should return as a narrowly documented
pseudo-selector hook rather than a general class prop, since the common path no longer needs one —
and the consumer, not the library, should be the one deciding to override an anti-spoofing default.

**`renderPlaceholder` is a slot, not a string.** Native `placeholder` is paint the library emits,
which _"A control paints nothing"_ forbids outright. The slot is `position: absolute; inset: 0;
pointer-events: none`, rendered between the painter and the input so typed text is never occluded,
and it is **always rendered when the prop is given** — gating it on `isEmpty` internally would make
a floating label impossible, since that has to stay mounted and transform. The painter reads
`getFlags().isEmpty` and decides between hiding and floating. Placeholder text should be
`aria-hidden`, for the same reason a checkbox painter's glyph is: the accessible name comes from
`getAriaLabel` or an enclosing `Label`.

This is also why the slot belongs to the leaf rather than to `renderDecoration`: the decoration
wrapper sits above the input and is shared by every control, whereas a placeholder must sit below
the caret and only a text field has one.

**Focus is drawn once, by the ring, and a painter must not draw a second one.** The first version of
`PageTextInputContent` coloured its border on `isFocused`, which produced two concentric indications
at different radii — the consumer's `:focus-visible` outline sitting on the input's border box, and
the painter's border two pixels inside it. The outline already hugs the painted box exactly, because
the input is `inset: 0` against a root the painter sized, so there is nothing left for the painter to
add. `isFocused` stays available for focus-driven paint that is **not** a ring; it is a second
outline or border specifically that is always wrong here.

**Adornments are `renderLeading` / `renderTrailing`, and they are the leaf's, not the wrapper's.**
Both are absolutely positioned against the root at `insetBlock: 0`, and both are rendered **after**
the input so they stack above it. The width is their content's, so the slot hugs what it holds and
clicks either side of it still land on the field. The Playground puts a real `Button` in one, which
is the point: an adornment can hold anything, including another `InteractionWrapper` with its own
focus ring, tooltip and disabled state.

**The slot inherits `pointer-events: none` from the root and must not override it.** It briefly set
`auto`, which inverted hover: the slot sits above the input, so pointing at a static adornment stole
the hit test, the input never received `mouseenter`, and `isHovered` went **false** exactly while the
cursor was over the adornment — so a painter keyed on the field's hover lit up everywhere except
there. Inheriting `none` lets the hit test fall through to the input underneath, and hovering the
adornment now reads as hovering the field, which is what it is.

Interactivity is unaffected, and that is why `none` is the right default rather than a compromise:
`pointer-events` is inherited, so an interactive element re-enables it for itself. Every control
element in this library already does — `buttonElement`, `binarySwitchElement` and `textInputElement`
all set `pointer-events: all` against the same inherited `none` — so a `Button` dropped in a slot
works with no configuration. Only raw consumer markup that must be clickable needs `pointer-events:
auto` on itself, the same one-liner `interactionDecorationWrapper` has always required.

One consequence, left alone: hovering an interactive adornment does drop the field's `isHovered`,
since the adornment is a sibling of the input rather than an ancestor and `mouseleave` fires. That
reads correctly — you are hovering the button, not the field — and fixing it would mean moving
`wrapElement`'s hover tracking from the control to the root and from `mouseenter`/`mouseleave` to
`mouseover`/`mouseout`, which is shared-code surgery for a cosmetic gain.

They do not go through `renderDecoration` for the reason that slot was defined narrowly in the first
place: it is one full-box overlay shared by every control, while these are positional and
text-specific, and they drive the input's padding. Nor are they one prop taking a side — _"one
slot, not layered slots"_ was about stacking, and these two do not stack; they reserve opposite ends
and drive opposite padding.

Named leading/trailing for **role, not axis** — the slot at the start of the field and the one at
its end. They were briefly positioned with `inset-inline-start` / `inset-inline-end` on the argument
that following the writing direction costs only a property name; that argument is withdrawn.
Adopting `CSSPadding` (next section) made it incoherent, since `paddingLeft` is physical and feeding
it into a logical property is a lie the moment anything is RTL. Physical throughout is the honest
choice while nothing else in the library is RTL-aware — `getDir` on `Label` and `RadioGroup` means
flex direction, not writing direction. Going RTL later means changing the CSS, not the prop names.

**The field's inset is measured, not declared.** `getPadding` and `getGap` are the geometry the
consumer states; everything else is derived. `getPadding` takes `CSSPadding | number` and is
normalised through `CSSUtils.spreadPadding`, so a single number spreads to four sides and per-side
control is available without a second prop. `CSSUtils.spreadableToStyle` then renames the keys and
adds the `px`, which is why no template strings are built by hand:

```tsx
CSSUtils.spreadableToStyle(
    { ...getSpreadPadding(), paddingLeft: getLeadingInset(), paddingRight: getTrailingInset() },
    StringUtils.camelToKebabCase,
);
```

It briefly took a bare `number`, and briefly used `Bounds` — the latter is the right shape for
`createViewportRectObserver`, which measures _edges_, but `CSSPadding` is the one meant for
declaring padding and arrives already keyed by CSS property.

Each adornment slot is observed by a local `createAdornmentWidth`, and the input's effective text
area is inset by

```
padding + (adornment ? adornmentWidth + gap : 0)
```

per side, applied as an inline style along with the same inset on the placeholder slot. The
adornment slots themselves sit at `padding` from their edge. So the only numbers anyone writes are
padding and gap; nothing else has to be kept in agreement, and the placeholder no longer needs to
know an adornment exists.

_Corrected after the fact: this section originally argued that an adornment reserves no space and
the consumer should supply the matching padding themselves, on the grounds that measuring "buys
correctness with a resize observer per field and takes the decision away from the painter". The
decision it takes away is one the painter cannot make correctly — the strongest counter-argument is
**i18n**, where `Show` / `Hide` becomes `Anzeigen` / `Verbergen` and any declared width silently
breaks, along with font swaps and dynamic adornment content._

**A `ResizeObserver`, specifically, and not a measured rect.**
`ElementObserver.createViewportRectObserver` is a `requestAnimationFrame` polling loop, appropriate
for tracking a position that moves but far too heavy for a width that changes rarely.
`borderBoxSize` also reports **untransformed layout size**, which matters here more than it looks:
the Playground runs inside `Viewport`, which applies a CSS `transform: scale()`, and
`getBoundingClientRect` would return scaled values. That is the whole reason
`ViewportUtils.getAdjustedBoundingClientRect` exists. `ResizeObserver` sidesteps it entirely, and
`offsetWidth` — used for the initial synchronous read, so the first paint is already inset — is
likewise unaffected by transforms.

No feedback loop is possible while the adornments stay absolutely positioned: the input's padding
cannot change an adornment's size, so the observer cannot re-trigger itself. `getMinWidth` below
derives the **root's** size from the same measurements and is still safe for the same reason — a
content-sized, out-of-flow adornment does not change width when the root does. Anything that makes
an adornment's width depend on the root's would close that loop.

**`getMinWidth` is the floor, and it is the same numbers summed.** `InteractionWrapper` gained
`getMinWidth` beside `getSizing`, and `TextInput` feeds it `leadingInset + trailingInset` — which
expands to `padding × 2 + adornment widths + gap × adornment count`, exactly the chrome. Below that
the field would be drawing over its own adornments. It deliberately reserves nothing for the text:
a zero-width text area is a legitimate floor, and picking a minimum number of visible characters
would be the library inventing a design decision.

This is also why the measurement lives in `TextInput` rather than in `TextInputElement`, where it
started. `min-width` belongs on the root, the root belongs to `InteractionWrapper`, and props flow
down — so the observers had to sit above the wrapper. The leaf now receives `getTextInset` and
`getSpreadPadding` ready-made and is correspondingly dumber, which is the better arrangement anyway.

**What `getMinWidth` does not do: make the painter follow.** It protects the root, and with it the
input and the adornments. A painter with a fixed `width` stays put, so if the floor exceeds it the
root grows and the frame is left narrower than the field it is framing. Guaranteeing they move
together needs `flex-grow: 1` on the in-flow child, which lives in `interactionRoot > *` and would
therefore change every control at once — not worth doing on `TextInput`'s account alone. Until then
the rule for a painter is simply that it must not be narrower than its own adornments require.

**It is a local helper in `TextInput.tsx`, not an `Abstracts` utility.** It briefly was one —
`ElementObserver.createLayoutSizeObserver` — which put a second, unrelated thing in a namespace whose
name then had to work much harder, and shipped public API through `index.ts` for a single internal
caller. Both instances live in one file, so the sharing that would justify extraction is inside that
file already. This is the same rule applied to `TextArea` below: extraction is cheap, the wrong base
is not, and the trigger is a second component wanting it.

One consequence that is correct but looks odd: the focus ring encloses the adornments, because they
are inside the field's box. They are part of the field, so that is right — an adornment that should
own its own ring is a `Button` placed in the slot, and it gets one.

`interactionRoot > * { margin: 0 !important }` reaches the slots, since they are direct children of
the root. That is the rule doing its job rather than a limitation — spacing belongs inside, so a
consumer insets an adornment from the frame with margin or padding on their own content, one level
down.

**Disabled means `readonly`, and this is the first control where `preventDefault` could not do the
job.** `Button` gates in `onClick` and `BinarySwitch` cancels the click, but "activation" for a text
field is typing, pasting, dragging text in, autofill and IME composition, and there is no single
event to cancel. `readonly` blocks every one of them, and it satisfies the constraints that forced
the `aria-disabled`-everywhere rule in the first place: the element stays focusable, its events keep
firing so a disabled-but-reachable field still reveals its tooltip, and — decisively — **the UA does
not repaint a readonly input**, so the appearance parity the mechanism split could never achieve
holds here for free. Selection and copying survive too, which native `disabled` would have killed.

```
element.readOnly = isDisabled || isReadOnly
```

**The caret is suppressed while disabled, and only while disabled.** A disabled-but-reachable field
is focusable by design, so focus genuinely lands in it and the browser draws a blinking caret in a
`readonly` input exactly as it would in an editable one — an invitation to type that the field will
refuse. `caret-color: transparent` on `[aria-disabled='true']` removes it, with `!important` for the
same reason `cursor` carries one: a consumer's `caret-color` reaches the input through
`computeTextStyle` and would otherwise win. Read-only keeps its caret, because keyboard navigation
and selection inside a read-only field are the point of it.

Read-only is a real feature in its own right, so `getIsReadOnly` is public and `aria-readonly`
reflects only the consumer's intent while `aria-disabled` reflects disabled. There is deliberately
**no redundant JS guard on the input path** — `readonly` is the single mechanism and a browser
cannot deliver an `input` event past it. The mouse handlers keep their explicit gating, because
`readonly` does not suppress `mouseenter` / `mouseleave` and `isHovered` on a disabled control is
exactly what _"Flags merge, external wins"_ is about.

**Native constraint validation stays out.** `required` / `pattern` produce a UA-painted bubble,
which is paint the library would be emitting. `hasError` is already the owner's and stays that way.
`maxLength` is out for a different reason: the owner's setter already owns transforms, and an
attribute that truncates silently would be a second mechanism for the same thing.

**`syncElement` is `BinarySwitch`'s function with two problems `BinarySwitch` never had.** The
premise is identical — the browser mutates `value` before `input` fires, so an owner that refuses or
transforms the write leaves the DOM holding text the state disagrees with — except it happens on
every keystroke rather than on a rejected toggle.

- **Assigning `value` collapses the caret to the end.** The sync captures `selectionStart` /
  `selectionEnd`, writes only when `element.value` actually differs, and restores. The accepted path
  therefore costs nothing and never touches the selection. The `null` guard is load-bearing beyond
  tidiness: `type="email"` and `type="url"` do not support the selection API, so the properties read
  `null` and `setSelectionRange` would throw. Truncation needs no special case — `setSelectionRange`
  clamps.
- **Writing mid-composition destroys it.** An `isComposing` signal gates both the sync and the
  report, and `compositionend` reports and re-syncs. Chrome and Firefox fire `input` after
  `compositionend` while Safari has historically fired it before; running the report from both is
  idempotent, since the second pass finds the value unchanged.

Both are read inside the render effect, so ending a composition re-syncs on its own.

_Corrected after the fact: that re-sync is real, and in the original ordering it destroyed the commit._
`handleCompositionEnd` cleared the composing flag **before** reporting. Clearing it re-runs the render
effect synchronously, `syncElement` then finds `element.value` holding the text the IME just committed and
`getValue()` holding the pre-composition state, and writes the stale state over it — after which
`reportValue` reads the clobbered element and reports the old string. Composing `にほ` into `Ada` and
committing `日本` left both the DOM and the state at `Ada`. The report now runs first and the flag flips
after, so the re-sync happens with state the owner has already accepted and finds nothing to write; a
refusing or transforming owner still gets its correction, from the same effect, one step later. This was
found by the first run of the interaction suite (see _"Verifying interaction"_ below), which is the entire
argument for having one — the ordering reads as correct, and nothing about it is visible in markup.

**Transforms compose through `onInput`, not through a derived signal.** `TextInput` writes
`valueSignal` with the raw value and then calls `onInput`, exactly as `Checkbox` writes
`checkedSignal` before reporting, so a consumer that wants upper-casing or digits-only writes the
signal a second time from `onInput` and the sync corrects the DOM afterwards. Handing `TextInput` a
hand-built `[getter, transformingSetter]` pair was tried first and abandoned: Solid's `Setter<T>` is
an overloaded type a plain `(value: string) => void` cannot satisfy, so it needs a cast at every
call site to express something the sanctioned path already does.

**`isEmpty` and `isReadOnly` join the flags, and that is now a trend rather than an exception.**
Both follow `checkedState` exactly — added to `ExternalInteractionFlags`, exposed on
`InteractionWrapper` as `getIsEmpty` / `getIsReadOnly`, and `getIsEmpty` `Omit`ted from
`TextInputProps` because the component owns the value and two sources for one state is the problem
the omission prevents. `getIsReadOnly` stays public, since read-only is the consumer's to declare.
The painter does **not** receive the value: the input already renders it, and a painter drawing it
too would double it. `isEmpty` is the summary that drives placeholder and floating-label paint, and
nothing more. What this costs is recorded in `review.md` — `ExternalInteractionFlags` is on its way
to being the union of every control's private state.

**`number` is a type, not a component.** _Corrected after the fact: this section originally argued
for a separate `NumberInput`, on the grounds that a number field could not reuse this sync rule
because writing `String(state)` back on every keystroke makes `"1."`, `"-"` and `"1e"` untypeable,
and that `setSelectionRange` throws on `type="number"`. Both claims are true, and neither was a
reason for a component._

That argument rested on an assumption that was never stated and never justified: that a number field
means `valueSignal: Signal<number | undefined>`. It does not. **The DOM's value is a string for every
input type**, and once `valueSignal` stays `Signal<string>` the round-trip that made `"1."`
untypeable never happens — `syncElement` compares strings, finds them equal, and writes nothing. The
`setSelectionRange` hazard was already handled too, by the `null` guard written for `email` and
`url`, which `number` hits identically. Nothing was left.

So `"number"` is a member of `TextInputType`, and the only additions it needed were three
behavioural attributes (`getMin` / `getMax` / `getStep`, which drive arrow-key stepping) and one CSS
rule suppressing the spin buttons, which are UA paint and therefore forbidden by the same rule that
kept `placeholder` out. Consumers who want a number derive it from the string; the owner's setter
already owns transforms, so a codec inside the component would only be a lossier place to put one.

This generalises, and it is the useful part: **an HTML input type is not a reason for a component.**
`Toggle` was not a component because its difference was paint; `number` is not one because its
difference is an attribute. What earns a component is behaviour the shell has to own — which is what
`RadioGroup` had and neither of these did.

**One caveat `type="number"` carries and the library cannot repair.** During bad input — a lone
`"e"`, `"-"` or `"1e"` mid-typing — the HTML value sanitisation algorithm makes `element.value`
return `""` while the field still shows the characters. State and screen diverge, nothing in the DOM
exposes the visible string to read it back, and `syncElement` sees two empty strings and correctly
does nothing. The visible symptom is `isEmpty` reporting true with text on screen, so a
`renderPlaceholder` overlay will draw over it. `type="text"` with `getInputMode={() => "decimal"}`
avoids the whole thing and is the better choice wherever the placeholder or an exact value matters.

**No shared composite yet, and `TextArea` is the thing that would justify one.** `BinarySwitch`
earned its existence from three presets sharing nine tenths of a leaf. `TextInput` is currently
alone — `InteractionWrapper` plus a private `TextInputElement`, the `Button` shape — because a base
extracted from one component is just an extra file.

A textarea is a different case from `number`, and the difference is exactly the test above: it is a
different **element**, not a different type, so the leaf's tag changes and with it two real things.
`rows` and `cols` replace `type` and `autocomplete`-ish concerns, and — the one that matters —
auto-growing height would invert who owns geometry, since the settled arrangement has the painter
size the box and the element cover it at `inset: 0`. A fixed-height textarea keeps that arrangement
untouched; an auto-growing one cannot, and that is a decision to take deliberately rather than
inherit.

Everything expensive is shared regardless: `syncElement` with its caret restore, composition
gating, the `readonly` disabled mechanism, the flags, the placeholder and adornment slots. That is
more overlap than `Checkbox` and `Radio` had, and copying it would put a second copy of
`syncElement` in the tree — the specific mistake `BinarySwitch` exists to prevent. So when `TextArea`
is built it should be a private shared leaf parameterised by its element with `TextInput` and
`TextArea` as presets that `Omit` what does not apply, in the `BinarySwitch` shape, and **not** a
`"textarea"` member of `TextInputType`, which would be a type that silently changes the element.

**Password is not a component.** Its only distinguishing behaviour is revealing, which is
`getType` flipping between `"password"` and `"text"` over a signal the consumer already owns. This
is the audit's _"`Toggle` needs no new library code"_ result applied again, and the Playground
demonstrates it with a `Toggle` next to the field.

**`LabelUtils.resolveAriaLabel` was extracted rather than copied.** The context read, the
suppression and the warning lived inline in `BinarySwitchElement` and are needed identically here.
This is the `computeIsReachable` situation — a settled rule, and two copies would drift — so it
moved to `Label.utils.ts` under the same namespace idiom as `InteractionUtils`, and the warning lost
its `BinarySwitch:` prefix.

### Controls: `Range`

Settled **2026-08-07**. `review.md` predicted this would be the most architecturally novel control
left and got the central call wrong, which is the most useful thing to record about it.

**A two-thumb range _is_ two native `<input type="range">` elements, one per thumb.** The prediction
was that two thumbs had nowhere to go under the overlay-geometry rule, so both thumb counts would
have to be custom. They do not. Each thumb is its own input, absolutely positioned `inset: 0` over
the same painter, so a pair is the single case rendered twice and the two modes cannot diverge in
paint, keyboard or ARIA. Keeping native also keeps `step`, `Home`/`End`, `PageUp`/`PageDown`, drag,
and the track-click jump, none of which anyone has to write.

`Range` therefore did **not** need `review.md` #2's pointer primitive, and item 2 stays open for the
thing that actually needs it — a two-dimensional colour surface, which has no native equivalent.

**Crossing is prevented by the inputs' own `min` and `max`, not by JS.** Thumb `n`'s `min` is thumb
`n-1`'s current value and its `max` is thumb `n+1`'s, so the browser clamps a drag and a keypress
identically and no guard can be forgotten. The cost is the tie: when two thumbs sit on the same
value, neither can move through the other, so which one you grab decides which way you can go.
`raiseNearestThumb` resolves that on `pointermove` — the input whose value is nearest the pointer
gets `z-index: 1`, and on an exact tie the side of the pointer decides. Verified in a browser: with
both thumbs driven to 80, pressing below and dragging left frees the low thumb, pressing above and
dragging right frees the high one.

**Ranking has to happen on `pointermove`, before the press.** `pointerdown` is too late — the
browser has already picked the event target and begun its native drag by the time the handler runs.
The move handler is skipped while a button is held (`e.buttons === 0`) so a drag in progress cannot
be stolen by the thumb it is sliding past.

**The library owns the thumb's hit size; the painter owns its appearance.** `appearance: none` on a
range leaves the thumb with no size in Chromium, which kills dragging, so `Range.css.ts` must style
`::-webkit-slider-thumb` and `::-moz-range-thumb` — transparent, sized from `getThumbSize`. That
number and the painter's visible thumb have to agree, and nothing enforces it. This is exactly
`TextInput`'s padding-versus-inset cost, and the Playground pays it the same way: `RANGE_THUMB_SIZE`
is one constant shared by the painter and the call site.

It is also why the painter is handed `ratios` rather than percentages. A thumb's centre travels
between `thumbSize / 2` and `length - thumbSize / 2`, never the full track, so a painter placing a
thumb at `left: ratio%` would overhang both ends. The painter positions with
`calc(ratio * (100% - thumbSize))`, which it can only write because it knows the thumb size.

**One prop per mode, and giving neither or both warns.** `valueSignal: Signal<number>` drives one
thumb; `rangeSignal: Signal<RangeValues>` drives a pair. A single `Signal<number | RangeValues>`
would force every consumer of a plain slider to narrow a union on every read, and a generic would
hit the `AccessorProps` hole recorded above. Mode is structural rather than a `getMode` prop because
the value's shape already carries it.

**The selection is `{ start, end }`, and the scale keeps `min` / `max`.** The pair's fields were
`min` / `max` for one draft, which collided badly: `getMin` would have been the floor of the track
while `rangeSignal[0]().min` was the floor of the selected band — two different things under one word,
one axis apart. `getMin` / `getMax` had the stronger claim on those names, since they match the native
attributes and `TextInputState` already uses them for the same purpose.

`start` / `end` was chosen over `from` / `to` on published precedent rather than taste. Adobe's React
Spectrum `RangeSlider` takes exactly `{ start, end }` — `defaultValue={{ start: 12, end: 36 }}` — and
MUI's own prose describes its array as "the start and end of a range" even though its API is
`number[]`. Radix is `value: number[]`, so it offers no field names either way. The only major library
found using named fields other than `start` / `end` is Ionic, with `{ lower, upper }` — and its type
is `number | { lower, upper }`, the single union this component deliberately avoided. Nothing checked
uses `from` / `to` for a slider; that reads as a date-range and filter idiom.

`RangeValues` and `RangeSpan` are the same shape on purpose: the selection is in scale units and
`flags.fill` is the same span expressed as 0..1 ratios, so sharing the vocabulary is the point.

**Disabled refuses the write and pushes the element back.** A range has no `readonly`, so the guard
is the `BinarySwitch` shape: the browser moves the thumb before firing `input`, so when the value is
refused `syncElement` writes state back over it. Both paths run it, since the accepted path is also
where an owner may clamp or reject.

**Vertical is `writing-mode: vertical-lr` plus `direction: rtl`, and it has no fallback — accepted
2026-08-07.** The `direction` is what puts the low value at the bottom; without it a vertical slider
runs downwards. Per MDN, vertical form controls via `writing-mode` "only gained full browser support
in 2024", and this is `src/Lib`, so the baseline was put to the user rather than assumed, and taken:
two years is long enough. The older routes could not have been layered underneath in any case —
`appearance: slider-vertical` cannot be combined with the `appearance: none` that strips the UA
paint, and Firefox's `orient="vertical"` is non-standard. On an engine older than that, a vertical
`Range` renders horizontal rather than degrading gracefully.

This is the first hard modern-CSS dependency in `src/Lib` with no fallback, which makes it the
precedent the _"Compatibility arguments"_ section above will be cited against. It is a real one: it
was argued from a dated support claim and sanctioned explicitly, not inferred from the Playground.

### Controls: `Tabs` as records, and the shape a data-driven group has to take

Settled **2026-08-06**, as the rehearsal for `Select`. `Tabs` predated the control model and was the
last component still contradicting it: it hand-rolled its `<button>` / `<a>` and set the native
`disabled` attribute, which _"Disabled is one mechanism for every control"_ forbids outright. It is
now `InteractionWrapper` per item plus an unexported `TabsItem` leaf, in the `Button` shape.

**Parallel arrays became one array of records.** `getTabCount` + `getHrefs` + `computeIsDisabled`
were three sources indexed against each other; they are now `getTabs: Accessor<Tab<T>[]>` with
`Tab<T> = { value, href?, isDisabled? }`. This is the answer to the objection recorded against
data-driven groups under `RadioGroup` — that they "grow a `compute*` prop per capability and
re-expose all of them per index". That is true of _indexed callbacks_, not of data: a capability is
a field on a record, and adding one costs nothing at the call site. The two shapes are not
equivalent and the earlier entry should be read as ruling out the callback form only.

**Identity is the value, never the position.** `getSelectedIndex` / `onSelectionChange(index)`
became `getSelectedValue` / `onSelectionChange(value)`. An index is only stable while the list is,
and the list is exactly what a filtered or searchable group changes — the Playground's own left menu
filters as you type. Everything internal (the roving entry, the floater, the arrow walk) resolves
through the value and treats the index as a lookup result.

**`<Index>`, not `<For>`, and that is why `renderTab` takes an accessor.** The records are rebuilt on
every filter keystroke, so `<For>`'s by-reference keying would discard and remount every row —
losing focus and every ref with it. `<Index>` keys by position and lets the record change under a
stable node, which means the painter must subscribe rather than receive a snapshot: `renderTab(getTab,
getFlags)`. This is _"if calling `fn(x())` would lose a subscription the callee needs, pass `x`"_,
and it is the one place where the choice of list primitive dictates a prop's shape.

**Refs replace `querySelectorAll`.** The old `:scope > a, :scope > button` walk could not survive the
wrapper — the items are no longer direct children — and would not have survived option groups or a
painter that renders a `Button` either. Each slot reports its control element through
`InteractionWrapper`'s `ref` passthrough, so the element list is keyed by the same index as the data
and the two cannot desynchronise. Registration in the `RadioGroup` sense is not needed: the group
already owns the array, so nothing has to announce itself or be sorted by `compareDocumentPosition`.

**Selection stays one-way, deliberately, and this is where `Tabs` and `RadioGroup` legitimately
differ.** `RadioGroup` takes `valueSignal` because it owns its value. A `Tabs` with `hrefs` does not:
selection is derived from the route, which is the case _"Signal tuples for two-way state"_ already
records as the shape's cost — "a route param has no setter to hand over". `getSelectedValue` plus
`onSelectionChange` keeps the router as the owner.

**The floater measures the wrapper, not the control.** `interactionRoot` is `position: relative`, so
wrapping each item reparented the control's `offsetParent` from the tab list to its own wrapper and
`offsetTop` / `offsetLeft` started reporting `0`. The observer hops one level —
`control.offsetParent` — which is exact rather than approximate: the wrapper's box equals the painted
box by construction, and `offset*` is unaffected by `Viewport`'s `transform: scale()` where
`getBoundingClientRect` would not be.

**`tooltipDefs` is not on the record yet, and the reason is a real hazard rather than YAGNI.**
`InteractionWrapper` branches on `props.getTooltipDefs !== undefined` — prop _presence_, not value —
so a record field would have to be forwarded conditionally, and a tab that gains or loses a tooltip
mid-life under `<Index>` reuse would not pick it up. Solid's props getters do make the conditional
reactive, so it can be made to work; it is left out here because `Tabs` has no use for it and
untested API is worse than absent API. `Select` will want it, and this is the thing to solve there.

**A consumer selecting on `:disabled` breaks when a control stops lying about it.** The Playground's
`tabCategory` reset the cursor through `:disabled &` and silently stopped applying; it is now
`[aria-disabled='true'] &`. Worth stating because it is the visible tail of the mechanism decision —
consumer stylesheets written against native disabled do not fail loudly.

**Verified by headless dump**, per the invocation below: `role="tablist"`, one `tabindex="0"` across
the whole list with every other item at `-1`, `aria-selected` on the right item, the category item
carrying `aria-disabled="true"` and **no** `disabled` attribute, and a floater positioned at a real
offset — which is also the proof that the `offsetParent` hop resolves and that `ref` forwards through
the router's `A`. Interaction is still unverified, per `review.md`.

### `Anchor`: a placement may fall back within its family and never outside it

`getSafeHPlacement` and its vertical twin choose between candidates by asking each one where the content
would actually land — `getHPlacementShift` plus that candidate's own `getHPlacementOffset` — and taking
the least overflow. They used to hand-derive a "space" figure per branch from the anchor's edges, which
is how the `in` branch came to ignore the content size entirely and place content off-screen in 78 of a
240-case sweep. Deriving the span from the functions that do the positioning makes that class of error
unexpressible, and fixes a second one for free: the offset was previously computed once from the
_requested_ placement and then reused to judge its mirror, whose offset has the opposite sign.

**A placement never crosses between `in` and `out`.** `in` means the content is aligned to an anchor edge
and overlaps it; `out` means it sits beside the anchor. Choosing between them is the consumer stating a
relationship, not a hint — a tooltip that hops from inside its anchor to outside it has changed what it
means, not just where it is. So `left-in` may become `right-in` and `left-out` may become `right-out`,
and nothing else. `center` may fall back to either `in`, since a centred layer already overlaps.

The cost is accepted and measured: when an anchor is itself clipped by the viewport there are cases where
no `in` placement fits and an `out` one would have. All of them require the anchor to be partly
off-screen — with the anchor fully visible, the family is always sufficient.

**Content that fits nowhere takes the least-overflow candidate and is allowed to run off the screen.**
`getPosition` applies the shift as computed and never clamps. Clamping would keep the content visible at
the price of detaching it from the edge it was aligned to, which is the same trade as crossing families
and is refused for the same reason: a layer that no longer touches its anchor has stopped describing the
relationship the consumer asked for. A layer wider than the viewport is the consumer's to size.

### `Anchor`: the positioning half of a floating layer, extracted

Settled **2026-08-06**, as the other half of the `Select` groundwork. A dropdown needs everything
`Tooltip` knows about placing a box against an element and nothing it knows about when to show one.

**The split is behaviour from markup, and the existing rule decides where it falls.** _"It renders
DOM, so it is not an `Abstract`"_ means the extraction cannot be the popup itself — only the effect.
`Abstracts/Anchor/` therefore holds `AnchorUtils` (the placement math, formerly `TooltipUtils`,
moved unchanged) and `Anchor.createPortalPosition(getAnchorRef, getIsVisible, opts)`, which observes
the anchor, measures the content, resolves the collision-safe placement and returns
`{ getPlacement, getPosition, setContentRef }`. `Tooltip` lost sixty lines and kept every one of its
triggers, its `aria-describedby` handling, its `role` and its markup.

**The name carries the coordinate space**, per the rule the observer names already follow:
`createPortalPosition` returns a position in the `Viewport` portal's space, which is what the
consumer assigns to `top` / `left` on a portalled element — not a document or client position. The
anchor rect underneath it still comes from `ElementObserver.createViewportRectObserver`, so the
scale factor is divided out exactly once, in the place that already did it.

**What stays duplicated is the dozen lines of `<Show><Portal><div>`, deliberately.** Both consumers
portal into the same mount and position absolutely, but they disagree about everything else — a
tooltip is `role="tooltip"` and `pointer-events: none`, a listbox is clickable, focusable and
`role="listbox"` — so a shared component would be a two-mode component. Behaviour is shared;
markup is not.

`Tooltip` is not renamed. `AnchorPlacement` replaces `TooltipPlacement` (and its `H` / `V` halves)
because the type is now the shared vocabulary rather than one component's, and nothing outside the
library referenced it.

### Controls: the flags are extensible, and a painter is typed to its own control

Settled **2026-08-06**, closing `review.md`'s third item on the trigger it named — `Select` wants
`isOpen`, `isFiltering` and more, which is well past the "two or more private flags" threshold.

**`InteractionFlags<TExtra>` is generic with a `{}` default, so nothing that had no extras changed.**
`Button` and `Tabs` still write `InteractionFlags`. A control with private state declares it —
`BinarySwitchFlags = { checkedState }`, `TextInputFlags = { isEmpty, isReadOnly }` — and threads it
as `InteractionWrapperProps<BinarySwitchFlags>`, so its painters receive exactly what it can produce
and nothing else.

**The wrapper receives the extras as one accessor, not as a prop per flag.** `getExtraFlags?:
Accessor<TExtra>` is merged into `getFlags` last. This replaces the `getCheckedState` / `getIsEmpty` /
`getIsReadOnly` props and, with them, the `Omit`s that existed to hide those props from consumers:
`BinarySwitchProps` omitted `getCheckedState` and `TextInputProps` omitted `getIsEmpty` precisely
because the control owned the value and two sources for one state is the failure to prevent. That is
now structural — a private flag is never a public prop in the first place — and only
`getExtraFlags` is omitted, once, per preset.

**The generic props are declared by hand.** `renderControl`, `renderDecoration` and `tooltipDefs` all
mention `TExtra`, and `AccessorProps` drops a key whose skippability cannot resolve while the
parameter is unbound. `renderControl` and `renderDecoration` would in fact have survived (a function
type is not a naked parameter), but they sit with the others so the block reads as one rule rather
than three cases, and so the next prop added there cannot get it wrong.

**Extras are required fields, not optional ones.** `checkedState: CheckedState` rather than
`checkedState?:`, because the control always produces one — a painter reading `getFlags().checkedState`
no longer has to handle an `undefined` its control cannot emit. The universal flags stay optional,
since a wrapper genuinely may not know.

**The type immediately found an over-typed painter**, which is the return on the refactor:
`PageTextInputAdornment` had been typed as a text-input painter but reads only `isHovered` and
`isDisabled`, and the Playground puts it inside a `Button`. Under one flat flag type that was
invisible; under the generic it is an error at the call site.

`CheckedState` moved from `Interaction.types.ts` to `BinarySwitch.types.ts`. `isReadOnly` left the
universal set with it, so `getIsReadOnly` is declared on `TextInputState` rather than inherited —
read-only is a text concept here, and a future control that wants it declares it too.

### Controls: `Select`, and who owns a floating list

Settled **2026-08-06**. This and the two `Select` headings after it are what remains of a design brief
that was deleted once it shipped; `review.md` #6 carries what was deliberately left out of it.

**One `mousedown` `preventDefault()` on the popup root is what makes the whole model work.** The
options live in the `Viewport` portal, so clicking one would move focus out of the field and blur it.
Refusing the default action of `mousedown` — the same mechanism `wrapElement` uses to refuse focus on
a disabled control — means focus never leaves the field at all. Three things fall out of that single
line, and they are the reasons `Tooltip` could not have been the dropdown: an option click cannot
dismiss the popup before the click resolves; `aria-activedescendant` is honest, because focus really
is still on the field; and **close-on-blur becomes correct rather than fatal**, so there is no
document-level outside-click listener. Clicking anywhere outside blurs the field, and blur closes.

**The field is a `<button role="combobox">`.** The APG select-only pattern uses a `<div tabindex="0">`,
which would mean re-implementing focusability and activation that a button has for free, and this
repo's rule is that the leaf is a real element with real semantics. `Enter` and `Space` are handled in
`keydown` with `preventDefault()`, which suppresses the button's synthesised click — otherwise every
keyboard activation would toggle twice.

**Options are `role="option"` divs, never buttons, and never tab stops.** `getIsTabbable={() => false}`
puts every one at `tabIndex -1`; a button inside a listbox would break the option semantics. The
consequence a painter has to know: **`isFocused` is never true for an option**, because focus is on
the field. That is why options get their own extras.

**`isHighlighted`, not `isActive`.** `SelectOptionFlags = { isHighlighted, isSelected }`.
`InteractionFlags.isActive` already means "held down" across every control, so the
`aria-activedescendant` target needed a different word rather than an overload of that one.

**The highlight is a value, resolved to an index — never a stored index.** Same shape as `Tabs`'
roving entry: a `highlightedValue` signal, and a memo that resolves it against the navigable indexes
and falls back to the selected option, then to the first navigable one. Opening therefore highlights
the current selection with no imperative set anywhere, and a list that changes under a filter cannot
leave the highlight pointing at a different option.

**The painter owns the panel, so the option list arrives as a thunk.** `renderPopup(renderOptions,
getVisibilityTarget, getTransitionDurationMs, getPlacement, getFlags)` — the consumer returns its own
bordered, scrolling, animating box with `{renderOptions()}` inside it. The alternative considered was
the `renderDecoration` shape, an absolutely-positioned painter behind a library-owned list; it was
rejected because a decoration cannot scroll with the content, which would have forced `max-height` and
`overflow` into library props. `role="listbox"` stays on the library's positioned root and the options
are descendants at whatever depth the painter nests them, which ARIA allows as long as nothing between
them carries a conflicting role.

**Geometry is the library's, including the width floor.** `Anchor.createPortalPosition` now also
returns `getAnchorRect`, and the popup root sets `min-width` from it. A painter cannot compute this —
it is portalled away from the field and has no access to its box — and a dropdown narrower than the
control it belongs to is a positioning artefact, not a style choice. Everything above the floor
(width, max-height, padding, colour) stays the painter's, exactly as `getMinWidth` on
`InteractionWrapper` already draws that line for adornment insets.

**`pointer-events` is switched off for the closing fade.** `ElementFader` keeps the popup mounted for
the duration of the transition, so without this a click during those 200ms would select a second time
from a list that is visually leaving. The inline style overrides the `pointer-events: all` the class
needs while open.

**Single-select first, and no shared private composite yet.** `valueSignal: Signal<T | undefined>` is
what a consumer already holds for a form field; `Signal<T[]>` for both cases would tax the common one
and make "nothing selected" representable two ways. Multi differs in behaviour — the popup stays open
on pick, selection is a set, the field summarises — so the `BinarySwitch` shape (private composite,
thin presets) is the likely end state, but erecting it before there is a second consumer would be
guessing at the seam. The standing rule applies: private until something else needs it.

**The keyboard walk stops on reachable-disabled options and refuses to select them**, matching
`RadioGroup`. `getNavigableIndexes` calls `InteractionUtils.computeIsReachable` with the option's own
three fields rather than re-deriving the rule, so the group and the wrapper cannot disagree about
which options the walk may land on.

**`scrollIntoView({ block: "nearest" })` on the highlighted option** is the only way the library can
reach a scroll container the painter owns. It runs from an effect on the highlight, so it covers
opening onto a selection far down the list as well as the walk.

### Controls: `Select`'s autocomplete, and why the consumer filters

Settled **2026-08-06**, step 8 of the brief, built directly after the rest. The question was whether
`Select` owns a default matcher with a `computeIsMatch` escape hatch or owns only the query string.

**The consumer filters, and the precedent that decided it is the Playground's own left menu.** `Tabs`
has no filtering API at all: `AppContent` owns the search box, owns the query, and derives `getTabs`
from a filtered list. The rules it wrote are the argument — it keeps every category header regardless
of the query, and **keeps the currently selected item even when it does not match**. Neither is
expressible by a library matcher over an unknown `T`, and the second one silently breaks a select whose
default matcher would filter the selected option away. The `Select` page makes the same point from the
other end: it matches an airport on **either its city or its IATA code**, two fields the library cannot
know exist. Ownership follows knowledge — the consumer knows what its `T` means, so it does the
matching.

**`Select` owns the query, because the query is the field's text.** That is the one part the consumer
cannot own: `querySignal: Signal<string>` is a `*Signal` by the existing rule, since the component
writes it on every keystroke and the consumer reads it to derive `getOptions`. The loop through the
consumer is a plain memo, not a cycle.

**"No matches" stopped being a flag.** The candidate `hasNoMatches` in the original brief is gone
rather than deferred: the consumer filtered, so it already knows the result is empty, and its empty
state is its own JSX inside `renderPopup`. A flag would have been the library telling the consumer
something the consumer just computed.

**The mode is `querySignal`'s presence, and this is the one sanctioned use of that.** No
`getIsAutoComplete` boolean beside it. _"Presence as a trigger fails invisibly"_ warns about a prop
whose real purpose is something else quietly changing semantics; a query string has exactly one
purpose, an editable field with nowhere to put its text is incoherent, and forgetting the prop yields
a working non-editable select — so it fails toward the safe default, which is the sanctioned half of
that rule. The precedent is `Tab<T>`'s `href` choosing `<a>` over `<button>`: a data field with one
meaning selecting the element.

**One leaf, two elements, in the `TabsItem` shape.** `SelectField` holds a `commonProps` object of
getters for the ARIA that both share and a `<Show>` that renders either a `<button>` or an `<input>`.
The `<input>` follows _"Overlay geometry"_ — painter first in flow, input at `inset: 0` over it — so
the focus ring still lands around the painted box, and `getPadding` plus `computeTextStyle` are the
same two props `TextInput` uses for the same reason. `TextInputTextStyle` is imported rather than
re-declared: it is a whitelist of text properties, the concept is identical, and duplicating a
twelve-key `Pick` to avoid a sibling import would be the worse trade.

**The painter draws the selection, the input draws the query, and `isFiltering` decides which is
visible.** This is why that candidate flag earned its place. The two texts are stacked by the overlay
geometry, so the painter fades its own value text out while the query is non-empty and back in when it
clears — meaning no option ever needs a `label` field for the field to display a selection.

**The component clears the query, and it waits for the fade to finish.** Closing ends the interaction,
so the query is the component's to reset; doing it on `close()` repopulated the consumer's list while
the popup was still fading, which visibly re-grew the box. It now runs off
`ElementFader`'s `getHasTransitionFinished`, and guards on the query already being empty so it never
writes on mount.

**An editable field takes the keyboard back.** `Space` types a space instead of selecting, and
`Home` / `End` move the caret instead of jumping to the first or last option — both are gated on the
mode rather than handled unconditionally, because hijacking either in a text field is a bug rather than
a shortcut. `Enter`, `Escape`, `Tab` and the arrows are unchanged. Typing opens the popup and resets
the highlight to nothing, so each keystroke re-highlights the first option of the new list.

**While filtering, the highlight prefers the first option over the selection.** Without this, typing
`lis` with `Oslo` already selected would leave the highlight on `Oslo` and `Enter` would re-pick it.
The limit is worth stating because it is inherent to the consumer owning the filter: the component
knows which options are _present_, not which ones _matched_, so a consumer that injects a
non-matching option into the filtered list can still see the highlight land on it. That is the
consumer's rule to fix in its own filter, and it is why the left menu's keep-the-selected-item rule
must not be copied into a select.

**`TextSync` came out of `TextInput` because a second consumer arrived.** `Abstracts/TextSync/` now
holds `createValueSync(ref, value, opts)` — the element/value sync, the caret restore after a
transforming setter and the IME composition gating. It is the exact code `TextInput.syncElement` had;
extracting it was preferred to duplicating fifteen lines of caret arithmetic into `Select`, which is
the standing rule fired in the direction it points once something else needs it.

### Controls: option groups, and `Select` / `MultiSelect` as presets

Settled **2026-08-06**, completing the brief. Both features landed together because they answer the
same question from opposite ends: what the option list is a list _of_, and what a selection is.

**A group is a record with children, in the same array as ungrouped options.**
`SelectItem<T> = SelectOption<T> | SelectOptionGroup<T>`, discriminated by
`SelectUtils.getIsGroup` (`"options" in item`), so a list can mix both and a group cannot be
malformed — there is no sibling marker to get out of order, and no second prop to keep in step with
the first. `SelectOption<T>` is a closed record shape, so the `in` check cannot be fooled by a `T`
that happens to have an `options` field of its own.

**The tree is a rendering concern only; everything else works off the flat list.**
`SelectUtils.getFlatOptions` gives the traversal order, and the keyboard, the highlight, the ids and
the selection all index into that — so the arrow walk crosses group boundaries without knowing groups
exist, and `Home` / `End` reach the ends of the whole list rather than of a group. The one piece of
bookkeeping is `getItemOffsets`, mapping each top-level item to where its options start in the flat
list, which is what lets a nested `<Index>` hand each slot its flat index.

**The library owns `role="group"` and its name; the consumer paints the header.** The group wrapper is
a bare `<div role="group" aria-label={label}>`, and `renderGroup(getGroup)` fills in the visible
header inside it. Two things were rejected: `display: contents` on the wrapper, because Chromium has
historically dropped such elements from the accessibility tree and the role is the whole point of the
element; and handing the consumer a `renderGroup(getGroup, renderOptions)` thunk in `renderPopup`'s
shape, which would have put the ARIA role in consumer markup. The cost is that a consumer cannot style
the group box itself, only its header — recorded rather than solved, because the thunk form is
available later if something needs it.

**Option refs are gone, and each option scrolls itself into view.** The old array keyed by index could
not survive a tree, since a flat index shifts when a preceding group is filtered. `SelectOptionItem`
now watches its own `isHighlighted` flag and calls `scrollIntoView({ block: "nearest" })` on its own
element, which is correct at any nesting depth and deletes the bookkeeping rather than fixing it.

**`SelectComposite` is private, `Select` and `MultiSelect` are thin presets over it** — the
`BinarySwitch` shape, down to `SelectPresetProps<T>` being an `Omit` of the composite's props and each
preset spreading `{...props}` over the parts it supplies. `index.ts` exports the two presets and the
types but not the composite, which is exactly how `BinarySwitch` is kept internal. The seam is four
props: `getSelectedOptions`, `computeIsSelected`, `onPick` and `getIsMultiple`. Everything else — the
popup, the query, the keyboard, the ARIA — is written once.

**Multi is a preset rather than a mode flag because the value's _type_ changes.**
`Signal<T | undefined>` versus `Signal<T[]>` cannot be reconciled by a boolean prop, and a single
`Signal<T[]>` for both would tax the common case and give "nothing selected" two spellings. The
composite therefore never sees a value at all: it asks the preset which options are selected and tells
it what was picked. `MultiSelect` toggles membership; `Select` replaces. That the composite has no
opinion about either is why `renderContent` takes `getSelectedOptions` plural and `Select`'s preset
narrows it back to `getSelectedOptions()[0]`.

**Picking in a multi list keeps it open, and moves the highlight to what was picked.** The second half
was found by driving it: with the highlight left alone, arrowing after a mouse pick continued from the
_first selected_ option rather than from the row just clicked. `aria-multiselectable="true"` goes on
the listbox; `isSelected` stays a boolean, and a tri-state for a partially-selected group header is the
one thing multi might still want from `BinarySwitchFlags`.

**`inert` is what disables a closing popup, not `pointer-events`.** This was a real bug, found the same
way. The fading popup carried `pointer-events: none` on its root, which looked sufficient and was not:
`pointer-events` is inherited, but every option sets `pointer-events: all` explicitly — it has to, to
beat `interactionRoot`'s `none` — and an explicit value on a descendant beats an inherited one from an
ancestor. So a click aimed at whatever sat under a closing popup was silently swallowed by an option
of a list that was already visually gone. `inert` disables an entire subtree for pointer events, focus
and the accessibility tree regardless of what descendants declare, which is precisely the intent;
`FocusUtils.isReachable` already tests `[inert]`, so the codebase had assumed support for it all
along. **The general rule: `pointer-events` on an ancestor cannot switch off a subtree, only `inert`
can.**

**These are the behaviours a `Select` guarantees, and the ones to re-check after touching it** — none
of them are visible in markup, and the last two are here because they were wrong once:
`Enter` on a reachable-disabled option changes nothing and leaves the popup open; clicking an option
leaves `document.activeElement` on the field; a disabled field neither opens nor takes focus while its
reachable twin stays at `tabIndex 0`; the arrow walk skips a disabled option _inside_ a group and then
crosses into the next one; a multi list stays open across a pick and moves its highlight to the row
picked; and a closing popup lets a click through to whatever is underneath it.

### Controls: `Popover` extracted, and `Menu` as the second consumer

Settled **2026-08-06**. The standing "private until a second consumer" rule fired: `Menu` is that
consumer, so `Select`'s floating layer became `Fundamentals/Popover/`.

**This does not reverse _"What stays duplicated is the dozen lines of `<Show><Portal><div>`"_ — it
is the same argument reaching the opposite answer on different inputs.** That entry refused to share
markup between a tooltip and a listbox because they agree on nothing: one is `role="tooltip"` and
`pointer-events: none`, the other is clickable, focusable and `role="listbox"`, and a component
spanning both would be a two-mode component. A listbox and a menu are both _interactive_ floating
layers and agree on every line of it. `Tooltip` therefore keeps its own dozen lines and stays out.

**`Popover` owns everything that is true of a floating layer and nothing about what it contains:**
the portal mount, `Anchor.createPortalPosition`, the `ElementFader`, `inert` while the fade closes,
the `mousedown` refusal, `tabindex="-1"`, and the anchor-width floor. The content arrives as
`renderContent(getVisibilityTarget, getTransitionDurationMs, getPlacement)` — `Tooltip`'s signature,
because the painter needs the same three things for the same reasons.

**The role is the consumer's, so the ARIA that role requires is the consumer's too.** `getRole` plus
one `getAriaAttributes: Accessor<JSX.AriaAttributes>`, rather than a prop per role-specific
attribute. `aria-multiselectable` is a listbox word and `aria-labelledby`-to-the-trigger is a menu
word; a `Popover` that learned either would be growing a branch per consumer, which is what the bag
prevents. It sits on the same element as the role because it has to — the options are descendants,
so the role cannot be nested one level in.

**The anchor-width floor is opt-in, because the argument for it was a listbox argument.** _"a
dropdown narrower than the control it belongs to is a positioning artefact"_ holds for a field and
its list; a menu hanging off an icon button has no such relationship and should size to its own
content. `Select` passes `getHasAnchorMinWidth`, `Menu` does not.

**The fader stays inside and reports out through `onTransitionStatusChange`**, the shape `Modal`
already uses. A component cannot return values, and `Select` needs the settled flag to know when it
may clear the query without visibly re-growing the box mid-fade.

**`outline: none` on the root is deliberate and is not a colour decision.** The root is focusable
only so it can host `aria-activedescendant`; the visible focus is the highlighted item, painted by
the consumer. A ring around the whole surface would point at the wrong thing.

**It is written twice so a consumer cannot reverse it by accident**, added **2026-08-09**. A bare
`outline` on the class ties with a consumer's blanket `:focus-visible` rule on specificity, so which
of the two wins comes down to which stylesheet was emitted last — and the Playground's was, which is
how every popup grew a focus ring nobody asked for. The rule is repeated under
`&:focus, &:focus-visible`, which outranks a plain pseudo-class rather than racing it. What that gives
up is the one case with no highlight to point at: a `Select` whose filter has emptied the list has
nothing painted as focused, and is announced empty instead. A consumer that wants a ring there paints
it on its own surface, which is the half of the contract that was always theirs.

**The initial focus is `Popover`'s, and a real bug is why.** `Menu` first called
`FocusUtils.autoFocus` itself, and focus stayed on the trigger. The root carries
`visibility: hidden` until `Anchor` has measured the content and produced a position — and a
`visibility: hidden` element silently refuses `focus()`, so the call landed one frame early and did
nothing. Being positioned is `Popover`'s own state, so `getHasAutoFocus` moved the call inside,
gated on `getPosition() !== undefined`. **The gate is a memo of the boolean, not of the position**:
the position object is rebuilt on every anchor observation, so depending on it directly would
re-focus the surface on every scroll.

**`Menu` moves focus to the menu, not to the items, and that is where `aria-activedescendant` is
allowed to live.** ARIA supports the attribute on composite roles — `menu` is one, `button` is not —
so the APG variant that keeps a single focus target puts both on the `role="menu"` element. The
items are then `Select`'s options exactly: non-focusable `role="menuitem"` divs at
`getIsTabbable={() => false}`, `isFocused` never true for one, and a highlight held as a value and
resolved to an index rather than stored as an index. `FocusUtils.autoFocus` restores focus to the
trigger on close through the same `onCleanup` that `Modal` relies on, which is its second consumer
and the reason it was not re-invented.

**Two keydown handlers rather than `Select`'s one**, because the two states have different focus
owners: the trigger handles the closed menu (`Enter` / `Space` / `ArrowDown` open on the first item,
`ArrowUp` opens on the last), the menu handles the open one (the walk, activation, dismissal). They
cannot both be focused, so neither needs to test whether the menu is open.

**Clicking the trigger while the menu is open would otherwise reopen it.** The `mousedown` moves
focus to the trigger, the menu blurs, blur closes — and then the click's own toggle sees a closed
menu and opens it again. The guard is `relatedTarget === trigger` in the blur handler: focus going
to the trigger is not a dismissal, and the click that follows does the closing. Every other blur —
an outside click anywhere — still closes with no document-level listener, which is the whole point
of the model `Select` established.

**`MenuFlags` is `{ isOpen }` and nothing else.** A menu carries no value, so there is no
`isEmpty`, no `aria-selected`, no `SelectOptionFlags.isSelected` equivalent, and the callback is
`onActivate` rather than `onPick`. That is the substantive difference between the two controls;
everything else is shared.

**Dismissal was not extracted as an `Abstract`, against the plan that scheduled this work.** The
expectation was that `Popover` would be its third consumer. It is not: `Menu`'s dismissal turned out
to be `Select`'s exactly — `Escape` in a keydown, close on the focused element's blur, no document
listener — while `Modal`'s is a different mechanism entirely (a document keydown, an overlay click,
a focus trap, an explicit restore). Two identical siblings and one that does not fit is not the
shape that wants an `Abstract`; the thing genuinely shared with `Modal` was `FocusUtils.autoFocus`,
which already existed.

### `Menu` submenus: a level per popup, focus moving between them

Settled **2026-08-09**. An item may now carry `items`, and a level of the menu is drawn per popup all
the way down.

**The choice was between one focus target for the whole tree and one per level, and support decided
it rather than structure.** Keeping focus on the root menu is the model already in place — one
`role="menu"` box holds focus and `aria-activedescendant` names the highlighted item — so extending it
looked like the smaller change. It is not, because `aria-activedescendant` may only name an element
that is a descendant of the focused one **or** one claimed through `aria-owns`, and every level is
portalled out to the viewport. That variant therefore rests entirely on `aria-owns` across a portal,
which is sanctioned and thinly supported. A level that holds its own focus has its own items physically
inside it, so the question never arises, and it is the variant the APG menu examples themselves
implement: `ArrowRight` opens a submenu onto its first item, `ArrowLeft` closes it and returns.

**`MenuLevel` is the recursion; `Menu` is the trigger plus the root level.** A level owns its
highlighted value, which of its items is open, its own popup and its own keyboard. It renders each
submenu inside the item that owns it, so a level unmounts with its parent for free, and the anchor is
that item's element rather than the trigger.

**An item with children is the trigger for its level, and says so in the same words the button does** —
`aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` while open. `MenuItemFlags` gained
`hasSubmenu` and `isOpen` so a painter can draw the arrow and the open state; the alternative was
leaving the painter to infer both from the records it was handed, which it does not have.

**`MenuItemFlags` is now a superset of `MenuFlags`, and that is what keeps `renderPopup` at one
signature.** A popup is handed the flags of whatever opened it — the trigger's for the root, the parent
item's for a submenu. Had the two flag types stayed disjoint, the signature would have had to take a
union and every consumer would narrow it to reach anything.

**A key is handled by the level it was pressed in, and the check has to be explicit because Solid
re-dispatches delegated events through the component tree rather than the DOM tree.** The levels are
portalled siblings, so nothing bubbles between them in the page — but `keydown` is delegated, and Solid
walks a portal back to the component that rendered it. A key pressed three levels deep therefore ran
every ancestor level's handler too: `Escape` collapsed two levels at once and `ArrowLeft` closed the
menu outright. Each level now ignores a keydown whose target is not its own popup root. Stopping
propagation would have worked as well and was rejected: it would swallow the key for anything outside
the menu that listens, which the single-level menu never did.

**A blur dismisses only when focus has left the whole tree**, where the tree is identified by id
prefix — every level's id derives from the root's. The previous guard was `relatedTarget === trigger`
and it cannot generalise, because closing a level restores focus to the level above and that restore
reaches the parent as a blur; with three levels open, hovering back up the chain closed everything.
The trigger check stays beside it for the reason it was written: focus landing on the trigger is the
click that will do its own closing.

**Hovering an item opens its submenu, and moves the highlight there.** Splitting them was considered
and is worse: the highlight is what `aria-activedescendant` names, so a submenu open under an item that
is not highlighted states two different positions at once, and `ArrowLeft` back out of it would land on
neither. Hovering an item with no children closes whatever was open at that level, which is how the
pointer walks back up. Nothing is on a timer.

**`ArrowUp` on a closed trigger still opens onto the last item, but the mechanism moved.** The highlight
now lives in the level rather than in `Menu`, so the trigger states an intent — `initialHighlightPosition`
— which the level reads only as the fallback for a highlight nothing has set yet. It is not written into
the level's state, so the first arrow press walks from it and overwrites it exactly as before.

**The submenu's placement defaults to `right-out` / `top-in`; its offset is left at zero and belongs to
the consumer.** A submenu anchors to its parent item, and an item sits inside whatever padding and
border the painter's surface has, so a submenu flush against its anchor overlaps the surface it came
from. The library cannot know that inset — it paints nothing — so `getSubmenuOffset` is where the
consumer states it, and the Playground passes its own surface's padding plus border. Anything a
consumer paints _outside_ its own box — a drop shadow is the other one — overlaps the level beneath by
the same arithmetic, and compensating for it is theirs by the same argument.

### The 1D walk is a pure function, not a hook

Settled **2026-08-06**, once `Menu` made it a fourth copy. `Tabs`, `RadioGroup`, `Select` and `Menu`
all carried the same wrap-around arithmetic character for character:

```ts
navigable[(((from + delta) % navigable.length) + navigable.length) % navigable.length];
```

**It is `NavigationUtils.computeNextPosition(key, from, length, opts)` rather than a
`createRovingIndex` factory, and `RadioGroup` is the reason.** The `create*` names in `Abstracts/`
all mean "owns reactive state and returns accessors" — `createFader`, `createPortalPosition`,
`createValueSync`. A walker cannot be one, because the state is already owned by each component and
owned _differently_: `Tabs`, `Select` and `Menu` hold a value signal and resolve it against the
navigable list, while `RadioGroup` walks registered entry objects and takes its starting point from
`document.activeElement` first, falling back to the roving entry. A factory that owned the cursor
would have served three of the four and lost the one that motivated the extraction.

**So it takes positions and returns a position, and knows nothing about what is being walked.** No
generic parameter, no collection argument, no reactivity — every caller maps back through its own
array, which is how `RadioGroup` keeps entries while the other three keep indexes. That also keeps
it in `*Utils`, alongside `InteractionUtils` and `FocusUtils`, rather than in the `Anchor` /
`ElementFader` family.

**Two options, and both exist because a caller was already gating on them.** `orientation` decides
which arrows step — `"row"` or `"column"` for `Tabs` by its `dir`, `"both"` for `RadioGroup`,
`"column"` for `Select` and `Menu`, where `ArrowLeft` / `ArrowRight` must stay with the caret. It
defaults to `"column"` because that is the narrowest of the three: a wrong default that ignores a
key is recoverable, one that hijacks `ArrowLeft` inside a text field is a bug. `hasEdgeKeys` gates
`Home` / `End`, which `Select` already suppressed while filterable for the same reason.

**What did not move is the part that is genuinely per-control.** `Select`'s "a closed list opens on
an arrow without moving the highlight" stays in `Select`, because it is a statement about its own
open state rather than about walking. The rule the split follows: the `Abstract` answers _which
position is next_, the control answers _whether to go there_.

**`Tabs` got its first spec out of this**, since it was the one consumer whose keyboard had no
coverage at all — `conventions.md` had recorded it as verified by markup dump only, which does not
reach a walk. The Playground's own left menu is a real `Tabs` (column, disabled category headers,
`href` on every entry), so the spec drives that rather than adding a page.

`computeNextCell` for two axes belongs in the same file when `Calendar` arrives. That is the return
on choosing a pure function: it grows by gaining a sibling rather than by gaining a mode.

### Folder layout: `Fundamentals/Input`

`BinarySwitch`, `Checkbox`, `Toggle`, `Radio`, `RadioGroup`, `TextInput` and `Label` live under
`Fundamentals/Input/`. The grouping is by what a component is _for_ — carrying a value the user
edits — not by what it is built from. `Button` and `InteractionWrapper` deliberately stay at the
`Fundamentals` level: `Button` is an interaction with no value, and `InteractionWrapper` is shared
by both families, so filing it under `Input` would misdescribe it.

`src/Lib/index.ts` still enumerates every export path individually and stays sorted, so the group is
a directory convention rather than a barrel — `Input` sorts between `ImageSwitcher` and
`InteractionWrapper` and the block reads as a unit there.

### Verifying interaction: `e2e/` at the repo root

**It lives at the repo root, beside `src`, and that is the whole of the placement argument.** `src/Lib`
would ship it — `package.json` publishes only `dist`, but the folder is the library and the library is
what it tests. `src/Playground` would bundle it into the demo. It is neither: it drives the _built_
Playground over a socket and imports nothing from either tree, so it sits outside both. `npm run
verify:dom` is the entry point and `verify:dom:ui` opens Playwright's own runner.

**Playwright, rather than a driver of our own.** This suite used to be about 900 lines of hand-written
DevTools Protocol plumbing with no dependency, justified on the grounds that a dependency would need a
second tsconfig and a compile step. That trade did not hold. Every "trap" the driver documented — which
key event type carries text, scrolling before measuring, waiting out a transition, discovering which
loopback family the preview server bound — is a problem Playwright solved years ago, and the one it did
_not_ solve is the one that cost the most: the driver measured an element's position and clicked that
point a frame later, so anything that re-anchored in between was clicked where it used to be. That is
what made `Select` and `Menu` pass alone and fail after `Tabs`. Playwright re-checks that an element is
visible, stable and hit-testable at the instant it acts, and gives every test a fresh page, so neither
failure mode is expressible.

**One test per behaviour, not one per component.** The old specs were a single long scenario per
control, which meant state accumulated within a file and a failure halfway through hid everything after
it. Each behaviour is now its own `test`, `beforeEach` navigates, and the run is parallel across
workers — the whole suite finishes in about fifteen seconds.

**Assertions target `data-variant="<name>"` on each Playground variant and `[data-readout]` inside it**,
so a spec reads state the way the page displays it rather than reaching into Solid. `PageExamples` stamps
`data-example` for the same reason. Prefer the auto-retrying `expect(locator)` forms over reading a value
and asserting on it, because they are what make a wait unnecessary.

Two things Playwright cannot do for us, both recorded because each reads as a component bug:

- **`aria-disabled` controls need `{ force: true }` to be clicked.** Playwright's actionability check
  treats `aria-disabled="true"` as disabled and refuses to click, which is exactly the interaction this
  library needs to prove does nothing — disabled is `aria-disabled` here and never the native attribute,
  so every disabled control is one Playwright would rather not touch. Forcing the click skips the
  stability checks too, which costs nothing on a control with no popup.
- **Opening a popup is two steps that land in either order**, so waiting on the popup being visible is
  not enough. `Menu` mounts, points at a highlighted item, and takes focus; a key pressed between the
  second and third goes to the trigger and is silently lost. `e2e/menu.spec.ts` waits on both
  `aria-activedescendant` and `toBeFocused` before pressing anything, and `Select` waits on the
  highlight.

- **An element under a looping CSS animation can never be clicked.** Playwright waits for a stable
  bounding box before it acts, and a container running an infinite keyframe slide never has one, so the
  click waits out the full timeout and reads as a broken component. `e2e/elementHighlight.spec.ts`
  focuses its triggers and presses Enter instead: no geometry is involved, and a keyboard user reaching a
  moving button is the same journey.

**Playwright has no IME API**, so `TextSync`'s composition gating is driven straight over the DevTools
Protocol through `page.context().newCDPSession(page)` — the one place this suite still reaches past the
library it is built on.

**What it catches is the argument for it.** `TextSync` destroying an IME commit (see above) and
`ElementFader` hanging its state machine on a single frame (below) are both bugs that are invisible in
markup, and neither would have been found by looking at the page.

`review.md` #11 carries what the suite still cannot see.

### Unit tests: `vitest`, colocated, and only for functions

`e2e/` can only reach what a click can reach. A function that takes rectangles and returns a placement
has no page to be clicked on, so provoking its edge cases through a browser means building a Playground
variant per case — which is why `AnchorUtils`'s flip-and-clamp logic went unchecked long enough to ship
the overflow in `review.md` #5. `npm test` is the other half: it calls library functions directly.

**One dependency, and no DOM.** `vitest` reads the repo's own Vite setup, and `vitest.config.ts` sets
`environment: "node"` because nothing under test touches a document. A jsdom environment would invite
component-rendering tests, which is the thing not to build here — jsdom has no layout engine, so every
geometry question it could be asked comes back wrong, and everything else it could answer is already
answered by `e2e/` against a real browser. The line is: **if it renders, it is a spec; if it returns a
value, it is a unit test.**

**Tests sit next to the function**, as `<Name>.test.ts` beside `<Name>.ts`, matching the rule that a
component's types live in its own file rather than in a shared collection. They are inside `src/Lib` and
are therefore type-checked by `npx tsc --noEmit`, which is the point — a test that no longer compiles
against its subject is a test that has stopped describing it. They do not ship: `package.json` publishes
`dist` only, and both the Vite lib build and the `tsup` d.ts emit start from `index.ts`, so nothing
unreachable from there is ever emitted.

**Assert the behaviour, not the implementation.** These functions are small enough that a test mirroring
their arithmetic would pass forever and prove nothing. Each case names a situation — an out placement
that would overflow flips to the side with room, a walk that wraps at both ends, a reserved docked panel
pushing the flip earlier — and the numbers are worked out from that situation rather than read off the
source.

**What is covered is every `*.utils` module that neither touches the DOM nor builds JSX**: `Anchor`,
`Navigation`, `Interaction`'s reachability predicate, `Audio`, `Select`'s flattening, `ElementHighlight`'s
segment geometry, `RichText`'s parser and the whole of `CellAnimation` — geometry, origins, all
thirty-seven weight functions, zones and breakpoints. The weights are covered by property rather than by
value: every type is asserted to stay inside 0..1, to be deterministic, and — for the origin-free ones —
to be unaffected by moving the origin. Pinning thirty-seven grids of numbers would encode the arithmetic
rather than describe it, and would have to be re-blessed wholesale by any change.

**What is deliberately not covered, and why it is not laziness:**

- **Anything that takes an element or a Solid owner.** `Focus`, `ElementObserver`, `ElementFader`,
  `TextSync`, `Anchor`'s own factory, `InteractionUtils.wrapElement` and `Viewport`'s rect adjustment all
  need a real layout to say anything true. They are `e2e/`'s half.
- **The SVG defs builders.** `SVGPatternDefsUtils`, `SVGGradientDefsUtils` and `SVGAnimationUtils` return
  JSX, and their arithmetic — the tiling offsets for each pattern, the gradient stop interpolation in
  `resolveStops` — is written inline inside the element being built or kept private to the module. There
  is real geometry in there and it is currently unreachable without either rendering or a refactor that
  separates the arithmetic from the markup. `review.md` #12 records it.
- **A known-broken case is pinned rather than fixed.** `CellAnimation.utils.test.ts` asserts the
  out-of-range weights that `review.md` #5 describes, with the measured numbers. It passes today and will
  fail the moment anyone fixes the bug, which is the point — both candidate fixes change output across
  every affected weight, so the test has to be re-blessed as part of the fix rather than quietly surviving
  it.

### `ElementFader`: the frame that starts a transition needs a fallback

Settled **2026-08-06**. `setTarget` flips `transitionTarget` inside a `requestAnimationFrame` so the
browser paints the pre-transition state first — without that the CSS transition has no start value to
animate from. The bug was that the frame was the _only_ path: `setHasTransitionFinished(false)` happens
immediately, `getIsVisible` is `transitionTarget === 1 || !hasTransitionFinished`, and the duration timer
is only armed from inside the callback. So on a page that stops producing frames, a dismissed `Modal`
never leaves — `getIsVisible` stays true, the `<Show>` stays mounted, and the focus trap stays with it.
A backgrounded tab does exactly this.

It now schedules the same idempotent `commit` from both a frame and a 100ms timer, whichever arrives
first, and cancels the loser. The frame wins in every case where frames exist, so nothing about a normal
transition changes; when they do not, the state machine advances without an animation, which is the
correct outcome on a page that is not painting anyway.

### Controls: `Progress`, and what a non-interactive Fundamental looks like

Settled **2026-08-06**. The first component in `Fundamentals` that is neither an interaction nor a
composition of one, so it settles the shape by being it.

**No `InteractionWrapper`, and no flags.** There is nothing to hover, focus or activate, so a wrapper that
owns events would be a wrapper owning nothing. The root is a bare `<div role="progressbar">` and the
painter receives `getState`, not `getFlags` — `ProgressState` is the analogue, and calling it flags would
claim an interaction contract this component does not have.

**The painter is handed a normalised `ratio` as well as the raw value.** Clamping `(value - min) / span`
into 0..1 is the one computation a painter must not be asked to repeat, because getting it wrong draws
past the end of the track. `value`, `min` and `max` come along because a painter that renders "1.2 of
2.4 MB" cannot get them anywhere else — this is the opposite of `TextInput`, which withholds the value
precisely because the input already draws it. The rule is the same in both: hand over what the painter
would otherwise have to double.

**`ratio` is `number | undefined`, and the `undefined` is the mode.** An absent `getValue()` means
indeterminate, and that is what ARIA means by it too — `aria-valuenow` is simply omitted. This is the
sanctioned form of _"presence as a trigger"_: a progress value has exactly one meaning, and forgetting the
prop yields a working indeterminate bar rather than a silent semantic change. It reads the **value**, not
the prop, for the reason `getTooltipDefs` already records — an upload with no total yet returns
`undefined` from a `getValue` that later returns numbers. Extras elsewhere are required fields so a
painter never handles an `undefined` its control cannot emit; here the control genuinely can emit one, so
the union is honest rather than an oversight.

**The indeterminate animation is the painter's, which contradicts the note that raised this component.**
`review.md` claimed the timing was the library's. It should not be: an indeterminate bar is a looping
animation with no state behind it, CSS runs it on the compositor for free, and a library-owned clock would
burn frames to hand a painter a phase it can already get from `@keyframes`. The library says _that_ the
bar is indeterminate; how it moves is paint like everything else.

**Placement is the library's, which contradicts the same note in the other direction** — see the `Modal`
presets below, where the argument is the same and the conclusion is too.

**`getSizing` defaults to `"fill"`, the inverse of `InteractionWrapper`'s default, and the type is
declared here rather than imported.** A control's natural size is its content; a track's natural size is
whatever contains it. Both vocabularies have the same two members and the same meaning, and the reason not
to share the type is that sharing it would file a non-interactive component's geometry under
`InteractionWrapper.types` — the import would be the only thing tying them together and it would misdescribe
both.

### Controls: `Drawer` and `AlertDialog` as `Modal` presets

Settled **2026-08-06**. Both are the `Toggle`-over-`Checkbox` shape: a few lines that narrow the base and
force what makes them what they are.

**Placement is geometry, not paint, and that is a correction to the note that asked for these.** The
review entry said "placement and slide are paint". The slide is — a painter transitions its own
`transform` off `getVisibilityTarget`, exactly as `ModalPage` already scales. Placement is not: the box
that carries `role="dialog"` is `Modal`'s, and only its position within `modalRoot` decides where the
dialog is. Making it paint would mean stretching the container over the viewport and letting the painter
position itself inside — which hands the dialog role a viewport-sized box and breaks the margin-derived
`max-width`/`max-height` with it.

**`modalRoot` became a grid so both axes can say `stretch`.** As a flex row there is no main-axis
equivalent of `justify-items: stretch`, so a top-edge drawer could stick to the top or fill the width but
not both without the item growing itself. Grid states each axis independently, and `modalContainer` is
`display: flex; flex-direction: column` with `flex-grow: 1` on its child so the painter fills whichever
axis the grid stretched. The absolutely positioned overlay is out of flow and unaffected.

**`ModalAlignment`, not `ModalPlacement`.** `AnchorPlacement` is already the name for `{ x, y }` collision
placement, and a `getPlacement` prop that means a string union on one component and that record on another
is the "two contracts under one name" trap this log has hit before.

**`Drawer` narrows to four edges and adds nothing else**, which is the whole preset: `DrawerEdge` drops
`"center"`, and `getEdge` is required where `getAlignment` was optional. An edge-attached dialog that could
be centred is not a drawer.

**`AlertDialog` forces three things and hides all three.** `role="alertdialog"`, a **required**
`getInitialFocusRef`, and overlay-click dismissal off. The role is why the focus target is mandatory rather
than optional: an alert interrupts to demand a decision, so focus has to land on the control that answers
it, and APG names that as the requirement. Overlay dismissal going off is the same argument continued — a
dialog that demands an answer must not be answerable by clicking next to it. `Escape` still closes it,
because every dialog must be escapable regardless of role. All three are `Omit`ted from `AlertDialogProps`,
so a consumer cannot set them back; that is the `BinarySwitch` preset rule applied to a `Modal`.

**`FocusUtils.autoFocus` reads the initial ref untracked, and "initial" is why.** The effect already
depends on the container ref and on visibility; a third dependency that can change while the dialog is open
would re-run it, re-capture `previouslyFocused` as whatever is focused _now_, and restore focus to the
wrong element on close. Untracked also states the semantics exactly: the target as of the moment the dialog
opened. A ref assigned during render is set before effects run, so the common path is unaffected.

**`getIsDismissableOnOverlayClick` and `getAriaDescribedBy` are public on `Modal`**, since a form with
unsaved changes wants the first and any dialog can want the second. Only the preset's own three are hidden.

### Controls: `FileInput` and `ColorInput`, where the UA owns the activation

Settled **2026-08-06**. Both are the `TextInput` arrangement — overlay geometry, wrapper, flags, a private
leaf — and both exist because of one thing the library cannot take over.

**Activation must stay native, so gating a disabled control is `preventDefault` on `click`.** Nothing but a
user gesture on the real element can open a file dialog or the OS colour picker, so there is no JS path to
gate and no `readonly` to lean on. `preventDefault` in `onClick` cancels the default action that opens
them, which is `BinarySwitch`'s mechanism rather than `Button`'s early return — the review note said
"`Button` `onClick` pattern" and returning early would have left both dialogs opening. `wrapElement`'s
`mousedown` refusal keeps a disabled control from taking focus as before.

**Suppressing the UA's own rendering is the same rule that kept `placeholder` and the number spinner out**,
and each needed a different mechanism:

- **A file input** hides `::file-selector-button` and sets `color: transparent` for the filename text. The
  input stays transparent-but-present rather than `opacity: 0`, because opacity paints the outline too and
  _"nothing that fades or filters may touch the element that owns the focus ring"_ still applies.
- **A colour input** needs `visibility: hidden` on `::-webkit-color-swatch`, and a transparent background
  is **not** enough — the UA paints the current colour onto the swatch through a path an author
  `background` does not reach, so the swatch covers the painter with a solid rectangle whatever colour you
  declare. This was visible on screen and invisible to every DOM assertion, which is worth remembering
  as the shape of what markup checks cannot catch. `visibility` takes the swatch subtree out of paint and
  leaves the input's own outline alone.

**Both give the painter the value, and `TextInput` deliberately does not.** `FileInputFlags = { files }`
and `ColorInputFlags = { value }`, because once the native rendering is suppressed nothing else draws
them — the painter is the only thing that can show which files are picked or what colour is chosen. The
rule is unchanged and this is the other side of it: withhold what the element already draws, hand over what
it does not.

**`syncElement` returns for a third time, with a third variation.** The premise is `BinarySwitch`'s: the
browser mutates the control before the event fires, so an owner that refuses the write leaves the DOM
disagreeing with state.

- **`ColorInput`** is the easy case — assign `value` when it differs. A snapping owner ("nearest of four")
  therefore sees its correction reach the element instead of the picker's raw colour.
- **`FileInput`** cannot be pushed into an arbitrary state at all, because a `FileList` cannot be
  constructed. Only the empty case is expressible, via `element.value = ""`, and that is the case that
  matters: an owner that rejects a file and writes `[]` back would otherwise leave the input holding it,
  and **re-picking the same file then fires no `change` event**, so the user cannot retry the thing they
  were just told to fix. Everything else is a limitation recorded rather than solved.

**Scoped without drag-and-drop, deliberately.** A drop target belongs to whatever surface wants to accept
a drop, not to the field, and adding it would make `FileInput` own a second activation path.

### The Playground's element selectors are scoped, and the library keeps its `!important`

Settled **2026-08-06**, with the props-panel migration. All 43 raw controls in the panels are library
controls now, and the single remaining native is a `<textarea>` waiting on `TextArea`.

**`style.css` no longer styles `input` or `select` at all.** Those rules sat at specificity 0,1,1 and
outranked any class a control could carry, which is what forced the escalation this log records under
_"The input is a genuine blank slate"_. They exist to style the app's own chrome, that chrome is no longer
raw, and they are now scoped to `textarea`. Two rules went with them rather than being narrowed: the
blanket `label` block, because `labelRoot` already sets everything it did, and `button:hover { filter:
brightness(120%) }`, because `filter` paints an element's outline and that rule was quietly dimming the
focus ring of every hovered button — the exact failure the ring rule exists to prevent, found by removing
the thing that hid it.

**The library's own `!important` resets stay, and `review.md`'s guess that "several could go" is wrong.**
The Playground is not the only consumer. A blank slate that loses to an element selector is broken, and
element-level input styling is what every reset stylesheet in existence ships. What the scoping removes is
the **consumer-side** escalation — a painter no longer has to reach its own input through a `globalStyle`
to win — which is the half that was actually costing anyone anything.

**The panels grew a family of field adapters, and that is the migration's real finding.** `PageNumberField`,
`PageTextField`, `PageSelectField`, `PageGroupedSelectField`, `PageCheckField`, `PageColorField` and
`PageFileField` live in one folder as one file, because seven two-line adapters in seven folders is worse
than the family being visible in one place — the same call `Select.tsx` makes with its three private
components. Each keeps a local `*Signal` and mirrors the panel's plain value into it. That mirror is
written seven times and it is the thing `review.md` #10 now records as a gap: every control here owns its
value as a signal, and a consumer whose state is a store has to build the bridge themselves.

### `ScreenWiper`: CSS shapes, not SVG

Settled **2026-08-05**. Each wipe cell used to be a `<div>` wrapping an `<svg>` wrapping a
`<polygon>` or `<circle>` — three nodes per cell, and the polygon's `points` string rebuilt per
cell. It is now one `<div>` carrying `clip-path: polygon(...)` for the lozenge or
`border-radius: 50%` for the circle, picked by a `styleVariants` map. Measured on the Playground
page at 1920×1080: **1370 elements down to 508**, and the rendered result is pixel-identical
(screenshot comparison, byte-for-byte).

**Collapsing into one `<svg>` with `<use>` elements was the obvious alternative and was rejected.**
It reaches a similar node count and shares the geometry, but it moves several hundred animating
elements inside a single viewport-sized SVG. SVG has no per-element compositing, so a transform
change on any child invalidates the whole SVG raster — the wipe would trade a few hundred cheap
independent `div` transforms for a full-viewport repaint every frame. The node count was never the
expensive part; the concurrent staggered transitions are, and no restructuring changes that.

A tiled `<pattern>` does not apply at all, whatever the node count: each cell scales on its own
staggered delay, so there is no repeating unit to tile.

`flex-shrink: 0` on the cell is load-bearing. The old markup got its size from the `<svg>`'s width
attribute, which ignored flex shrinking; a plain `div` would shrink instead and break the
tessellation at cell sizes where a row overflows.

Not exercised: the `circle` shape has no Playground variant, so `border-radius: 50%` replacing
`<circle>` is reasoned, not observed.

### `CellAnimation`: weights as the staggering primitive

**A cell's weight is its position on the timeline.** A weight function returns 0..1 per cell from
`(pos, count, origin)`, and `computeBreakpoints(weight, opts)` turns that into the slice of the
global timeline the cell owns — direction is weight inversion, smoothness is the width of the window.

**The library names no weight and knows nothing about origins — settled 2026-08-07.**
`CellAnimation` took `getOriginType`, `getWeightType` and `getWeightOpts`, so the nine named origins
and the thirty-seven named weights were the only ones a consumer could have. That is the wrong
ownership: a consumer who wants an origin the library never thought of, or a distribution driven by
their own data, had no way in at all. Every named origin and weight moved to
`src/Playground/App/Samples` as ordinary sample code that a consumer can copy, extend or ignore.

**The weights slot is a callback taking the count.** The grid the component draws is not the grid the
consumer asked for — the requested count is clamped against the measured pixel size, since cells
thinner than a pixel cannot draw. A weight grid built from the consumer's own numbers would therefore
be the wrong shape whenever that clamp bites, and a wrong shape breaks indexing, so the component
hands the effective count to `computeCellWeights`. Missing weights fall back to `0` per cell rather
than throwing, because the grid now arrives from outside.

**The origin never enters the library at all, not even as data on the defs.** An evaluator's whole
use for it is "am I left of the origin, or right of it" — the direction a cell moves — so it was
tempting to keep an `origin` field on `CellAnimationEvaluationDefs` and have the component thread a
`Point2d` through. It does not. `CellAnimationEvaluationDefs` is `{ pos, count, weight, size }`, and
a consumer who needs an origin merges their own in at the call site, the way the Playground's
`DefaultExample` does. The reason is that a threaded origin would be a value the component stores,
validates and re-renders on while never reading it — API surface that only forwards. The consumer
already holds the point, since they computed the weights from it.

Two consequences worth stating. Whoever wants origin-aware zones or keyframes types their own defs as
`CellAnimationEvaluationDefs & { origin: Point2d }`, which is what `CellAnimationZones.isInZone` and
`CellAnimationKeyframes.computeAnimation` take. And a consumer whose origin is derived from the grid
has to derive it from the count they requested, not the count the component settled on — the same
clamp above, and the one place this shape is weaker than threading the value.

**`ScanlineAnimation` is a preset over this, not a second engine.** A scanline is a 1×N grid, so a
line is a cell and `getLineCount` is the only prop it adds; the five orderings it used to own became
the `sequence*` weight functions, which are exact rather than approximate. It kept its own name and
evaluator alias because the line-shaped API reads better for the common case, the same reasoning that
makes `Toggle` a preset over `Checkbox`.

**A preset that loses an axis drops what indexed on it rather than narrowing it.** A scanline is a
single column, so every weight reading `dist.x` collapses: six go outright constant — `lineColumn`,
`lineColumnAlternate`, `lineColumnConvergent`, `radarDouble`, `radarQuad`, `quadrantDefault` — four
more fall to two values, and most survivors are a plain row ramp wearing a name like `spiral` or
`checkered`. The distance-based weights that do survive work, but they are the only reason an origin
would exist on a line, and a control that is meaningful for three of nine options reads as broken.
This used to be enforced in the library: `ScanlineAnimation` narrowed its `weightType` to
`ORIGIN_FREE_WEIGHT_TYPES` and exposed no origin at all. With the vocabulary gone from the library
there is nothing left to narrow, so the constraint is now the Playground's — its Scanline page offers
only the origin-free weights and pins the origin to `{ x: 0, y: 0 }`. Recorded because it is a real
loss: the type used to make the trap unreachable, and now only the sample avoids it.

**Cell geometry is integral and the requested count is honoured exactly.** Edges are
`round(idx * total / count)`, so every cell starts on a whole pixel and the remainder is spread across
the row — 7 cells over 240px start at 0, 34, 69, 103, 137, 171, 206. This replaced two worse rules:
`ScanlineAnimation` used to snap `lineCount` down to a divisor of the measured size, which tiled
exactly but silently gave you 80 lines when you asked for 119, and `CellAnimation` used fractional
sizes, which have no visual upside and push a consumer toward a higher count purely to tile cleanly —
buying cells that cost frame time and show nothing. The count is separately clamped to the pixel
dimension, since cells thinner than a pixel cannot draw.

**Cells are still drawn one pixel larger than their slot, and integer edges did not make that
redundant.** The Playground renders inside `Viewport`'s `transform: scale()`, so whole-pixel layout
edges still land on fractional device pixels, and the browser antialiases each cell independently and
leaves hairline seams between them. This was removed once on the reasoning that exact tiling made it
unnecessary, and had to go straight back because the seams were visible on screen — reasoning about
sub-pixel rounding is not a substitute for looking at it. Only the drawn box grows: positions,
`background-position` and the logical span stay exact, so the extra pixel repeats the neighbour's
first column rather than shifting the slicing. `defs.size` reports the drawn box, because that is what
the browser resolves a percentage `translateX` against.

**Whole-grid operations cannot live in a per-cell evaluator**, which is why weights are computed once
per count rather than per frame. `shouldMakeUnique` and `shouldNormalize` rank every cell against
every other, and memoising the grid also stops `randomDefault` reshuffling every frame. The component
still owns that memo; what changed is that it calls the consumer's function to fill it.

**Grid geometry belongs to `ss-utils`, not here.** The per-axis distance between two cells, the
clamp of a point into a grid, and the distance from a cell to the further of the two edges it sits
between are `Point2dUtils.getDelta`, `getBoundPoint` and `getFarthestBound` — added in `ss-utils`
0.0.20 for exactly this. `CellAnimationUtils` keeps only what has no equivalent there: the parity
predicates (`isEvenRow`, `isEvenColumn`, `isEvenRing`, `isEvenCheckered`), which read a distance
rather than measure one.

**`getFarthestBound` is not a drop-in for the old `getMaxDistance`, and the difference is
load-bearing.** It reports the honest `0` on a single-cell grid; the original floored the result at
`1`. Every distance-based weight divides by that number, so the floor is what stops a 1×1 grid
producing `Infinity`. That floor is a property of the weight functions, not of the geometry, so it
lives with them in `CellAnimationWeights.const.ts` rather than being pushed back into a general
util. `computeCellWeights` is pinned on a 1×1 grid so a future simplification that drops it fails
loudly.

**An anchor is a translate, not a new value key.** Scaling or rotating about an anchor `a` equals the
centre-anchored transform `M` plus a translate of `(I - M)·a`, and translate percentages resolve
against the element's own unscaled border box — so `transform-origin` folds into `translateX` /
`translateY` inside `fromStops` and never reaches the result type. This is exact rather than an
approximation, and it generalises to 3D: with `perspective` on the **parent**, a 3D rotation folds
the same way using `translateZ`. It does **not** work with the `perspective()` transform function on
the element itself, which puts the vanishing point at that element's own `transform-origin`, so
moving the origin changes the projection rather than only the position. Perspective on the parent is
also the better rendering: one shared vanishing point is a 3D scene, while per-element perspective is
N independent cards.

**Transform functions are emitted in a fixed order** — perspective, matrix, translate, rotate, skew,
scale, with each family's axis variants together — because `translateX(50%) scaleX(50%)` and its
reverse are different matrices, so ordering by `Object.entries` would make composition depend on the
key order of a literal the consumer wrote. Filters are ordered by `CSS_FILTER_KEYS` for the same
reason, and the transform/filter split is decided by those lists rather than by the ordering
constant, so a key nobody thought to list cannot end up in the wrong string.
`assignAnimationProps` also always assigns both properties, so a frame that stops producing a filter
clears the previous one instead of leaving it stuck, and it zips each value against
`CSSConst.ANIMATION_UNITS[key]`, which is one entry per function argument.

**A component that computes a `z-index` owes the page a stacking context.** Cells carry a per-cell
`z-index` from weight so earlier ones layer above later ones while they overlap; without
`isolation: isolate` on the container those values escape into the nearest ancestor stacking context.
In the Playground they landed in the stress test modal's context and painted over its FPS counter.
