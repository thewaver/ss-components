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

    **The line between the two folders is the library, not the shape of the thing.** Anything that dresses
    a library component belongs in `StyledComponents` even when it is not a `renderContent` painter and
    even when it composes several controls — `Field`, `ColorChannels`, `CalendarCaption` and `LabelCaption`
    all sat in `PageComponents` until **2026-08-11** on the grounds that they were compositions rather than
    paint, and that was the wrong test: they exist only to give library components an appearance, so a
    reader looking for how a control is dressed has to find them there. `PageComponents` is for what the
    Playground would still need if the library did not exist — the variant grid, the props panel, the code
    box. The `<LibComponent>Content` naming is for slot painters and does not extend to these; they keep
    the name of the thing they are.

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

### What goes to `ss-utils` and what stays here

Settled by the user on **2026-08-11**, when `@internationalized/date` was taken as a dependency and the
obvious home for calendar arithmetic looked like `ss-utils` rather than this repo.

**`ss-utils` is bare: it implements logic on top of nothing.** That, rather than "is it maths or is it
layout", is the line. A standalone primitive — one that needs only the language to work — belongs there. A
module whose job is to adapt a third-party package to this library's shape stays here, however
mathematical it looks, because sending it to `ss-utils` would put a dependency inside a package whose value
is having none.

So `Abstracts/DateValue` wraps `@internationalized/date` from inside `src/Lib`, and the dependency is
declared here. Pure formatting or numeric helpers that grow out of this work are candidates for `ss-utils`;
anything holding an import of the date package is not.

### Look in `ss-utils` before writing anything general-purpose

Asked for by the user on **2026-08-13**. `ss-utils` is a dependency of this repo, written by the same person,
and it already holds a lot. Re-implementing something it exports is the easiest waste to commit and the
hardest to notice afterwards, because the duplicate works.

**The trigger is the shape of the code, not the name of the file.** `.utils.ts` is where a util ends up, not
where it starts — most of them start as three lines inside a component, which is exactly why "I am not
writing a utility right now" is the wrong test. The real test is: **could this function be given a name and
a couple of arguments and then make sense with nothing around it?** If yes, it is general-purpose, whatever
file it currently lives in. Comparing two arrays by an id on each element is the example the user gave —
that one is not in `ss-utils`, and it is still the shape being described.

Things that read as small enough to just write are the ones this is aimed at: clamping, rounding to a step,
comparing two rects, spreading a padding, kebab-casing a key, picking a random element, deduplicating,
formatting a number. Several of those _are_ already there — `MathUtils`, `RectUtils`, `CSSUtils`,
`StringUtils`, `RandomUtils`, `PolygonUtils`, `ShapeUtils`, `BitwiseUtils`, `FunctionUtils`, `DOMUtils`,
`SVGUtils`, `IOUtils`, `KeyframesUtils`, plus `Point2d`, `Vec2d`, `Vec4d`, `Rect`, `Bounds`, `Size2d`, `Dir`
and `Count` as value types with their own helpers.

**How to check, in order.** Read the namespace list above and pick the one the thing would belong to; look at
that namespace's own file under `node_modules/@thewaver/ss-utils/dist`, which is small enough to read whole;
grep the export list for the noun rather than the verb — the package names things after what they operate on.
Only then write it. If it is genuinely absent but would still make sense with nothing around it, it is a
candidate to go _to_ `ss-utils` rather than to live here — see the section above for which side of the line
it falls on.

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

| Kind                                          | Prefix                        | Examples                                                                                                                                                                                         |
| --------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reactive data (via `AccessorProps`)           | `get*`                        | `getIsVisible`, `getJoinRadii`, `getHrefs`, `getVisibleCorners`                                                                                                                                  |
| Factories / predicates / transforms with args | `compute*`                    | `computePoints`, `computeFillDefs`, `computeStrokeDefs`, `computeIsDisabled`, `computeClassNames`, `computeRootAnimation`, `computeScanlineAnimation`, `computeSVGDefs`, `computeLinearGradient` |
| Events / lifecycle                            | `on*`                         | `onShow`, `onHide`, `onClick`; **`onMount` for controller handoff** (AudioSwitcher / Typewriter / ScanlineAnimation)                                                                             |
| JSX producers                                 | `render*`                     | component `renderContent` / `renderTab`; nested defs use `renderDefsElement`                                                                                                                     |
| Two-way state the component also writes       | `*Signal` (plain, unprefixed) | `visibilitySignal`; future `checkedSignal`, `valueSignal`                                                                                                                                        |

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

### Asking for a state a thing is already in does nothing

Settled **2026-08-13**, as a rule for the whole library rather than for one control. **Open an open thing,
close a closed one, play what is playing, stop what is stopped, show what is shown, highlight what is
highlighted — every one of them is a no-op.** Nothing fires, nothing is notified, nothing is re-read.

**The reason is that a state request is a statement about where things should end up, not an instruction to
perform a transition.** A caller who says "open" is saying "be open"; if it already is, there is nothing to
do and any work done anyway is work the caller did not ask for. That work is invisible at the call site and
turns up as a side effect somewhere else — the `Menu` case that produced this rule had a trigger re-open an
already-open menu, and the only thing that actually happened was the highlight jumping back to the first item.

**The guard belongs in the transition, not at the call sites.** One `if` inside `open` is a property of the
component; the same `if` written at four call sites is a thing the fifth caller will not know about. This is
the same argument as _"Anything that has to happen because the popup is open belongs to the state, not to one
of the ways in"_ under `DatePicker` — a transition that refuses to repeat itself and an effect that hangs off
the state are the two halves of one idea.

**Notifying the consumer counts as work.** Re-selecting the tab that is already selected must not call
`onSelectionChange` again; the callback is how a consumer learns the value _changed_, and calling it when
nothing changed makes every consumer write the comparison the library declined to.

**Three things are outside this rule and are not violations of it.** A **toggle** is a request to invert,
so it always acts. An **explicit restart** — `Typewriter`'s is the one that exists — is a command rather than
a state, and asking to restart something already running is exactly when it means something. And a
**multi-select pick** of a selected value deselects it, which is a change and not a repeat.

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

**A painter's declared width is a preference, and `max-width: 100%` on the root is what makes it
one.** Found **2026-08-10** in the Playground's own left menu: the search field is a `TextField`
whose painter asks for 200px, sitting in a 240px column whose usable width drops to 190px the moment
the column scrolls and a scrollbar takes its gutter. The field kept its 200px and hung 10px past the
column's padding, flush against the scrollbar.

The reason nothing else stopped it is worth writing down, because every instinct about it is wrong.
`interactionSizingVariants["fit-content"]` sets `width: fit-content`, which reads as "never exceed
the space I was given" and is not: `fit-content` resolves to `max(min-content, min(max-content,
available))`, and a flex item whose width is definite has an automatic minimum size equal to that
definite width — so the painter's 200px _is_ the container's min-content size, the outer `max` picks
it over the 190px available, and the root is 200px wide by the same arithmetic that was supposed to
shrink it. The painter cannot fix this from inside. `max-width: 100%` on the painter resolves against
the root, which is sized from the painter, so it is circular and changes nothing; `min-width: 0` on
the painter does not reach the container's min-content size either; and `width: 100%` on the painter
collapses it outright, since a percentage against a shrink-to-fit parent is treated as `auto` and an
empty div's `auto` width is zero. All three were measured against the running Playground before the
one that works was kept.

What works is `max-width: 100%` on `interactionRoot`. The root then clamps to the space it was given,
and the painter — a flex item with the default `flex-shrink: 1` — follows it down, so the wrapper's
box still equals the painted box and the absolutely positioned input, decoration and focus ring all
land on the smaller box without any of them knowing. It is on `interactionRoot` rather than on the
`fit-content` variant because it is the invariant for both: under `fill` it is a no-op, and stating it
once says that a control never paints outside the box it was placed in.

Sizing-neutral everywhere else, and that was checked rather than assumed: every `InteractionWrapper`
root on all 29 Playground routes was measured before and after, and the search field is the only box
in the app whose size changes. A percentage `max-width` against an indefinite containing block is
treated as `none`, so a control inside a shrink-to-fit ancestor is unaffected by construction.

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
Playground's `TextFieldContent.css.ts` derives both from `FIELD_PADDING`. This is the first place
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
`PageTextFieldContent` coloured its border on `isFocused`, which produced two concentric indications
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

**The shared composite this section predicted is `TextField`** — see _"Controls: `TextField`
extracted"_ below. Everything this section settled still holds; it is now settled one file down, and
`TextInput` is a dozen lines on top of it.

**Password is not a component.** Its only distinguishing behaviour is revealing, which is
`getType` flipping between `"password"` and `"text"` over a signal the consumer already owns. This
is the audit's _"`Toggle` needs no new library code"_ result applied again, and the Playground
demonstrates it with a `Toggle` next to the field.

**`LabelUtils.resolveAriaLabel` was extracted rather than copied.** The context read, the
suppression and the warning lived inline in `BinarySwitchElement` and are needed identically here.
This is the `computeIsReachable` situation — a settled rule, and two copies would drift — so it
moved to `Label.utils.ts` under the same namespace idiom as `InteractionUtils`, and the warning lost
its `BinarySwitch:` prefix.

### Controls: `TextField` extracted, with `TextInput` and `TextArea` as presets

Settled **2026-08-09**, on the terms the `TextInput` section had already written down: a private
shared leaf parameterised by its element, presets that `Omit` what does not apply, in the
`BinarySwitch` shape — and **not** a `"textarea"` member of the type union, which would be a type
that silently changes the element.

**Nothing about `TextInput` changed except where it lives.** `Fundamentals/Input/TextField/` holds
the base; `TextInput` is `<TextField {...props} getElement={() => "input"} />` and `TextArea` the
same with `"textarea"`. The base is absent from `index.ts` in the `BinarySwitch` way — only
`TextField.types` ships, because the presets' props are derived from `TextFieldPresetProps` and the
emitted `.d.ts` has to resolve it. The types moved with it and the old names are gone rather than
aliased: `TextFieldFlags`, `TextFieldTextStyle`, `TextFieldType`, `TextFieldMode`. `Select` already
imported the text style and now imports it from the base, and the Playground's painters were renamed
to match — `PageTextFieldContent` / `PageTextFieldPlaceholder` / `PageTextFieldAdornment` — since one
painter now serves three shells and a name pointing at one of them would be wrong.

`TextSync` widened to `HTMLInputElement | HTMLTextAreaElement`, exported as `TextSyncElement`. Both
carry `value`, `selectionStart`, `selectionEnd` and `setSelectionRange`, so the caret restore is
unchanged rather than branched.

**The element is a `Dynamic`, and that is the whole of the parameterisation.** One attribute list,
with the two element-specific attributes computed rather than duplicated: `type` is `undefined` on a
textarea, `rows` is `undefined` on an input. This also tightened `min` / `max` / `step`, which are now
emitted only for `type="number"` — the browser ignores them elsewhere, but a `type="text"` field
carrying them is a lie in the DOM, and `NumberInput` below is a `type="text"` field that owns a range.

**Auto-growing height is opt-in, and it is the only thing that could not be inherited.** A fixed
textarea leaves the settled arrangement untouched: the painter sizes the box, the element covers it at
`inset: 0`, `rows` is beside the point because the painter's height wins. An auto-growing one inverts
that — the content decides the box — and the resolution is to keep the inversion out of the overlay
and put it on the wrapper instead. `getIsAutoSizing` turns it on, `getMinRows` (default 2, the native
default) is the floor and `getMaxRows` the optional ceiling.

The measurement is the mirror image of `getMinWidth`, one axis over. `InteractionWrapper` gained
`getMinHeight` beside it; `TextField` sets the element's `bottom` to `auto` for one frame, reads
`scrollHeight`, restores it, and clamps that against the row floor and ceiling. `scrollHeight`
includes the element's own padding and the element has no border, so the number _is_ the root height
needed — no second sum to keep in step. `bottom` is the only property touched, because the class
already carries `height: auto !important` and an absolutely positioned box with `top`, `bottom` and
`height: auto` takes its height from the insets; freeing `bottom` is what lets `height: auto` mean the
content again. Nothing that Solid writes as an inline style is disturbed.

**A growing root only moves the painter if the painter lets it.** The root is `display: flex` with
`align-items` left at `stretch`, so a painter that declares no height already follows the root's
height. That is the same limitation `getMinWidth` records — "a painter with a fixed `width` stays
put" — and here it is load-bearing in the other direction: an auto-sizing `TextArea` wants a painter
with no height, a fixed one wants a painter that sets one. The Playground says which through
`getIsStretched` / `getHeight` on its own painter, which is where that choice belongs.

Two smaller consequences. **The re-measure listens for width, not height**, because publishing a
height that the observer then reads back is a loop; the observer compares `inlineSize` against the
last one and returns early otherwise. And **`overflow-y` is `hidden` while growing uncapped**, so no
scrollbar flickers in during the frame between a keystroke and the new floor, and `auto` in every
other case.

**`resize` is `none`, and deliberately without `!important`.** A user-dragged element would decouple
the element's box from the painted box, which is the invariant _"nothing may decouple the painted box
from the wrapper's box"_ names. The other blank-slate resets carry `!important` because a real
conflict was observed — `input:not([type="range"])` and `input[type="checkbox"]` both outrank a class
— and no such selector exists for this property: a bare `textarea { resize }` is weaker than a class
and loses already. Escalating on suspicion is the defensive habit that rule warns against; escalate
when something actually beats it.

### Controls: `NumberInput`, and the first preset that earns a codec

Settled **2026-08-09**. This does not reopen _"`number` is a type, not a component"_ — it passes that
section's own test. What earns a component is behaviour the shell has to own, and there are four
things here that a consumer would otherwise write again per field: the ladder that stepping walks,
clamping at the moment the field is left rather than per keystroke, refusing characters that cannot
appear in a number, and the string-to-number codec. None of those is an attribute.

**It is a `type="text"` field, not a `type="number"` one**, which is the choice the caveat at the end
of that section already recommends. Under `type="number"` the HTML value-sanitisation algorithm makes
`element.value` return `""` during half-typed input while the field still shows the characters, so
`isEmpty` lies and a `renderPlaceholder` overlay draws over what the user typed. A field whose whole
job is to own a number cannot afford that. What the browser stops providing in exchange — the spin
buttons, arrow stepping, and the spin-button role — the shell provides, which is the same trade the
library already makes everywhere else.

`getIsSpinButton` on `TextFieldState` is the `getIsSwitch` shape exactly: the base computes
`role="spinbutton"` from it and publishes `aria-valuenow` / `aria-valuemin` / `aria-valuemax` from the
value and the range it already holds. `aria-valuenow` is omitted while the text does not parse, since
a half-typed value has no number to announce.

**`valueSignal` is `Signal<number | undefined>`, and `undefined` means an empty field.** This is the
one place the `Signal<string>` rule the `TextInput` section argues for is deliberately broken, and the
reason is that the codec is the feature. A private `Signal<string>` still runs the element — the
round-trip `"1."` hazard is untouched, because the string signal is what `TextSync` compares and the
number never gets written back over it. What the consumer sees is a number, which is what they wanted
when they reached for a number field. `undefined` rather than `0` because an empty field has no value:
a `0` would be a value the user did not type.

**Typing is refused character by character rather than parsed and rewritten**, which is the
"transforming setter" idiom the Playground already demonstrates, moved inside the control.
`NumberInputUtils.sanitizeText` walks the text and keeps a character only where it can legally
appear — one sign at the front, one more after an exponent, one decimal point, one exponent and only
after a digit. It is written to keep half-typed values typeable rather than to accept only complete
numbers: `-`, `1.`, `1e` and `1e-` all survive, and each reports `undefined` upward until it parses.

**Clamping happens on blur, not on input.** Clamping per keystroke makes the second digit of a value
untypeable — in a field with a maximum of 100, typing `9` then `9` gives `99`, but in a field with a
minimum of 40, typing `5` becomes `40` before the `0` arrives. Stepping still clamps immediately,
because a step is a complete gesture and typing is not.

**The step ladder counts from `min`, not from zero**, matching what a native number field does: a
value already on a rung moves a whole step, one between rungs snaps to the next rung in the direction
of travel. `computeStep` runs the arithmetic in whole units of the smallest decimal in play rather
than in floats, so a step of `0.1` from `0.3` gives `0.4` and not `0.4000000000000001`, and no epsilon
has to be chosen. It is a pure function in `NumberInput.utils.ts` with tests, which is where the
`vitest` half of the suite can actually reach it.

**The stepper reaches the painter through `renderTrailing`, widened rather than duplicated.**
`NumberInput` re-declares that one slot as `(getFlags, stepper)`, the same widening
`InteractionTooltipDefs` does to its `renderContent`. A second `renderStepper` slot was the obvious
alternative and loses: both would want the same physical position, and one slot lets a painter draw a
unit and a stepper together, which the Playground does. The `stepper` carries `stepUp` / `stepDown`
plus `getIsAtMin` / `getIsAtMax`, so a painter can disable the end of the range it has reached — the
flags stay pure state and the actions stay out of them.

**`onKeyDown` and `onBlur` exist on `TextFieldCbs` and are `Omit`ted from both public presets.** The
arrows, `Home` and `End`, and the blur-clamp all need them, and the base is where they belong; whether
`TextInput` should expose them is a separate question with its own consumers, and answering it as a
side effect of this would be smuggling.

**`untrack` on the mirror is not a micro-optimisation, it is the fix for a real flip-flop.** The
effect that restates the text when the owner writes a new number must read the text _untracked_.
Tracked, it also re-runs when the text changes — and `TextField` writes the raw text into the signal
before the preset's `onInput` gets to sanitise it and report a number, so for one moment the text says
`"1"` and the number still says `undefined`. A tracked effect fires in that gap, formats `undefined`
back to `""`, and the two then fight: the observed symptom was a caret jumping to the start after the
first keystroke and digits arriving in reverse order. This is the `ImageSwitcher` shape — an effect
whose job is one-directional must only depend on the direction it syncs from.

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
the router's `A`.

**The list names itself and states its axis.** Added **2026-08-11**, when `TabsPage` put five tab lists
on one page and none of them could be told apart. `getAriaLabel` lands on the `role="tablist"` element,
which is `RadioGroup`'s arrangement for the same problem — a container role the library owns, so only the
library can name it. `aria-orientation="vertical"` is set whenever `dir` is `column` and left off
otherwise, because a tab list is horizontal by default and a stacked one that does not say so tells a
screen reader user to press the wrong arrows. This is not a general rule about `dir`: it is stated here
because `tablist` has a published default that a column contradicts.

### `TabPanel`: the pairing is written on the record, and read from both ends

Settled **2026-08-11**. A tab has to name the panel it opens and the panel has to name the tab back, and
the two elements have different owners — the library owns the tab, the consumer owns the panel — so
neither can complete the link alone.

**Both ids are fields on the record, and neither is generated.** `Tab<T>` gains `id` and `panelId`;
`Tabs` writes them as the tab's own `id` and its `aria-controls`, and writes nothing when they are
absent. Generating the tab's id privately is what Radix and React Aria do, and both can only do it
because their panels are enclosed by their root. Here a panel may be a page the router mounts somewhere
else entirely — the Playground's left menu is exactly that — so a generated id would have no route to the
element that needs to quote it.

**`TabPanel` is the other end, and it is a wrapper in the `Label` sense**: `getId` and `getTabId`, turned
into the panel's own id, `role="tabpanel"` and an `aria-labelledby`. It takes the two ids rather than the
record, because two strings are all it reads and a record would make every consumer hold one to call it.
It holds no state, chooses nothing, and does not decide whether it is mounted — the consumer's `Show` or
the router already does that. `tabindex="0"` is unconditional, matching Radix, because a panel of plain
prose offers a reader arriving from the tab list nothing else to land on, and testing for focusable
descendants would mean measuring the consumer's content on every render.

**It carries no class**, so a consumer's flex or grid child would become this element rather than their
own box. The arrangement to copy is the Playground's: `PageTabPanel` — the painter that was already
there — holds the `TabPanel` and paints inside it, so the library element is absorbed by the styled
component instead of appearing at every call site, and layout stays outside both.

**Driven by `tabs.spec.ts` against `TabsPage`, not against the Playground's own left menu.** The menu is
app furniture — adding a page or renaming a category used to break the keyboard spec and read as a `Tabs`
regression, which happened once. The page carries a row, a column, links, a consumer link component and
an all-disabled list, so the entries are named by the spec that drives them and nothing else depends on
their order.

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
`PageTextFieldAdornment` had been typed as a text-input painter but reads only `isHovered` and
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

**A trigger swallows its own keys while its menu is open, rather than opening it again.** Added
**2026-08-13**. A menu is drawn and highlighted before it takes keyboard focus — the layer takes focus only
once it has been positioned, and its position waits on a `ResizeObserver` callback that arrives in a later
task. In that window the keyboard is still pointed at the trigger, so an `Enter` meant for the highlighted
item reached the trigger's own handler, which read it the only way it knows: open the menu. Opening an open
menu reset the highlight to the first item, so the keystroke did not go missing — it silently moved the
highlight, and the reader's _next_ `Enter` then ran the wrong item. Refusing the four opening keys while the
state says open turns that into a keystroke ignored, which is the tolerable failure.

**The default is prevented before the open state is consulted, and the order is load-bearing.** All four of
those keys activate a `<button>` natively, so returning early without preventing the default lets the browser
synthesise a click on the trigger — which toggles the menu shut. Guarding first and preventing second would
trade a wrong highlight for a menu that closes under the reader.

**What this does not do is make that early keystroke work**, and the window it arrives in is still there.
Closing it means giving a layer focus as soon as it is open rather than once positioned; the cheap version of
that — reading the content size once on mount instead of waiting for the observer — was tried on 2026-08-13
and reverted. Positioned a frame earlier, the menu lands under the pointer that just clicked the trigger and
`onMouseEnter` takes the highlight, so six menu specs failed on a highlight one item further down than they
asked for. That makes it a question about whether the pointer or the keyboard owns the highlight at open,
which is a decision nobody has taken.

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

### Controls: `Drawer` as a `Modal` preset, and why `AlertDialog` is not one

Settled **2026-08-06** for `Drawer`, which is the `Toggle`-over-`Checkbox` shape: a few lines that narrow
the base and force what makes it what it is. `AlertDialog` shipped the same day on the same reasoning and
was **deleted 2026-08-10** — see the end of this section.

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

**`AlertDialog` was a preset that earned nothing, and it is gone.** It set `role="alertdialog"`, required
`getInitialFocusRef`, and turned overlay-click dismissal off — three props, all of them already public on
`Modal`, and it added no behaviour of its own. That is the line between a preset worth having and one worth
deleting: `Drawer` narrows a vocabulary (`DrawerEdge` drops `"center"`, so an edge-attached dialog that
could be centred is unexpressible), while `AlertDialog` only pre-filled values a consumer can pass
directly. A component whose whole body is three defaults is a comment with a build step.

The reasoning it carried is still right and now belongs to whoever sets those three props: an alert
interrupts to demand a decision, so focus has to land on the control that answers it, which is why the
initial focus target is not optional in that mode; and a dialog that demands an answer must not be
answerable by clicking next to it. `Escape` still closes it, because every dialog must be escapable
regardless of role. The Playground's `ModalPage` carries it as a second variant, which is also the honest
demonstration — it shows the three props rather than hiding them.

What this does **not** overturn is the `Toggle`-over-`Checkbox` rule. A preset is worth its file when it
removes something from the surface or adds semantics a consumer cannot reach; `Toggle` does both (the
`switch` role, and the mixed-state role swap). Pre-filling optional props is not that.

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
controls now, and since `TextArea` shipped there is no raw form control left in the Playground at all —
the Typewriter page's `<textarea>` was the last one, and its stylesheet went with it.

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

### Controls: `Toasts`, and a queue the consumer owns

Settled **2026-08-10**. It closes the shape question `review.md` had toasts parked on, and the answer is
that the question rested on a premise that does not hold here.

**`review.md` claimed toasts needed "an out-of-tree queue and an API that is called rather than bound,
which nothing here has". Both halves were already covered by settled conventions.** "Out of tree" is a
signal created outside any component — `createRoot(() => createSignal<Toast<T>[]>([]))`, which
`Viewport.context.ts` already does for its fallback context — so the list outlives whatever raised a
notification without the library owning anything. "Called rather than bound" is what a signal's setter
already is: `queue[1]((prev) => [...prev, toast])` is an imperative call from arbitrary code with no
component in scope. What the note was actually reaching for is sugar — `toast.error("…")` — and that is
the layer _"Planned: strip `style.css`…"_ files under a consumer who has been met. A library that has not
met them should not pick their vocabulary.

So the prop is `toastsSignal: Signal<Toast<T>[]>`, per _"Signal tuples for two-way state"_.

**The division of writes is what makes the two-way signal correct rather than convenient.** The consumer
is the only thing that adds; the component is the only thing that removes — a duration elapsing, and the
limit being exceeded. One variable, both sides write, neither can disagree with the other, which is
`Modal`'s `visibilitySignal` argument with a list instead of a boolean.

It also settles an ownership question no other shape answers cleanly. If the consumer owned the list
outright and the component only reported, "show at most three" would be enforced consumer-side — making
queue policy the consumer's job, when policy is behaviour and behaviour is the shell's. If the component
owned the list privately, nothing could raise a toast without a handle to a mounted component. A shared
signal is the only arrangement where the component enforces policy by writing something the consumer can
see.

**A controller handed over at mount was available and is deliberately not used.** The `onMount` shape
`AudioSwitcher`, `Typewriter` and `ScanlineAnimation` use issues commands to a mounted thing — play,
restart. A queue is state, and state that has to outlive the mount cannot be reached through a handle the
mount gives out.

**The component keeps everything with a clock**: the enter transition, which needs a painted frame at the
pre-transition value first and is `ElementFader` unchanged; the retention window, during which an entry
that has already left the consumer's list stays mounted to play its exit; the auto-dismiss duration and
its pausing; and the limit.

**Duration lives on the record and nowhere else — there is no component-wide default.** `Toast<T>` is
`{ id, value, durationMs? }`, and an absent `durationMs` means the toast waits to be dismissed. A default
prop would make per-toast stickiness inexpressible, since `undefined` would then read as "use the
default" and there would be no second spelling for "never" that was not a magic number. A consumer who
wants four seconds everywhere puts it in the push helper they already have. This is _"the absent value is
the mode"_ from `Progress`, and unlike a silent semantic change it fails visibly: a toast with no duration
sits there until closed.

**`id` is a separate field rather than identity living on `value`.** `Tabs` keys on `value` because two
tabs with the same value are meaningless. Two identical toasts are entirely meaningful — "Saved" twice in
a row happens — so keying on value would collapse them into one, or make a change look like no change.
That is the invisible-failure shape this log keeps refusing.

**One piece of internal state: the ordered list of rendered ids**, which is the admitted list plus the
ids still playing their exit. Everything else derives — an id absent from the admitted list is leaving.
Ids are strings, so `<For>` keys them by value and each entry keeps a stable node whatever the consumer
does with record references; the problem that forced `Tabs` onto `<Index>` does not arise. The record for
an id is latched inside the `<For>` callback, so an entry keeps painting its last known content while it
fades out.

**An unexported `ToastsItem` leaf per entry**, in the `TabsItem` shape, owning its own `ElementFader` and
its own duration timer so both are disposed with the entry rather than accumulating in a container that
lives as long as the application. It reports upward once its exit transition has finished, and the
container drops the id then.

**The duration timer arms and disarms through `onCleanup` inside its own effect, and that is load-bearing
rather than stylistic.** The first version cleared a timeout at the top of the effect and only measured
elapsed time when pausing, which meant the clock restarted from full whenever the effect re-ran — and it
re-ran on every array change, because it read whether the entry was exiting. Three toasts raised together
therefore dismissed one and reset the other two, indefinitely. Arming inside the effect and subtracting
the elapsed time in its cleanup makes the arithmetic correct regardless of _why_ the effect re-runs, and
the dependency set shrinks to the two things that should drive it: the duration and whether it is paused.
Found by driving the page, invisible to every type and DOM assertion.

**Pausing is region-wide and forced.** Hovering or focusing anywhere in the region holds every countdown;
there is no prop to switch it off. Focus is the half that matters — a toast must not vanish out from under
the button someone is reaching for. The listeners are `mouseover` / `mouseout` and `focusin` / `focusout`
on the region with a `relatedTarget` containment guard, **not** `mouseenter` / `mouseleave`, because the
region is `pointer-events: none` so it is never itself a hit-test target; bubbling from the entries is the
only thing that reaches it.

### `Toasts`: what the painter gets, and why position is not fully delegated

**`renderToast(getToast, getVisibilityTarget, getTransitionDurationMs, getState)` opens with `Modal`'s
contract, in `Modal`'s order.** A consumer's toast painter and their modal painter are the same kind of
object — something that transitions itself between two states over a duration it was handed — and
spelling that two ways would be _"two contracts under one name"_ inverted: one contract under two shapes.
Four arguments is not new; `InteractionTooltipDefs.renderContent` already takes four with the same
ordering, transition pair first and context after. `getToast` is an accessor and comes first, following
`Tabs.renderTab`, because a consumer may replace the record for an id — "Uploading" becoming "Uploaded" —
and the painter has to see that without its node remounting and restarting the entry animation.

**`ToastState` is `{ index, count, isPaused }`, and those are the stacking hints.** `index` and `count`
are the pair everything positional derives from: the number of cards in front of an entry is
`count - 1 - index`, and newest-ness is a comparison against the ends. `index` is queue position, oldest
first, independent of `getDir` — the consumer sets the direction so they can map it to visual order.
Both are inside the reactive record rather than passed plain like `Tabs.renderTab`'s index, because they
change while an entry is mounted: removing the first toast renumbers everything behind it, and a painter
animating that shift has to re-read. `isPaused` is there so a painter drawing a countdown can hold it;
the countdown itself is the painter's, for `Progress`'s reason — a library-owned clock would burn frames
handing over a phase that `@keyframes` plus `animation-play-state` gives for free.

**Nothing says _why_ an entry is leaving** — elapsed, closed, or pushed out by the limit. A painter that
drew those differently would be animating a distinction the reader cannot act on.

**Nothing carries a dismiss action, and that is not an omission.** The consumer owns the signal, so the
close button their painter draws removes the entry from their own list, and the exit transition still
plays because the component holds the entry through it. A callback would be a second route to something
they already have.

**Position cannot be fully delegated, and the reason is the live region rather than the geometry.** A
notification region only announces content inserted into it if the element was already in the document,
so it has to be a persistent element the component mounts once and keeps — and it has to be the
component's element, by the same rule that keeps `Select`'s `<div role="group">` out of consumer markup,
with more force here because a subtly wrong live region fails silently. Given the element is the
component's, delegating its position would mean accepting a class name or a style object for it, and
`TextInput` already argued that out: it rejected `computeClassName` and accepted a whitelisted style
object _only_ because text the browser draws had no other hook. Here there is another hook, and three
components use it — `Modal` with `getAlignment` and `getMargins`, `Drawer` with `getEdge`, `Label` with
`getDir` and `getGap`. `Modal`'s entry states the rule: placement is geometry, not paint.

So the region is a viewport-sized layer in the `Viewport` portal that paints nothing and clicks through,
and four geometry props place the stack inside it: `getAlignment` (nine positions, three vertical by
three horizontal), `getDir` (which end new entries enter from and whether the stack runs down an edge or
along one), `getGap`, and `getMargins`. Each entry sits in a minimal library box that re-enables pointer
events and is the flex item; it carries no role, since politeness is set once on the region and a role
per entry would announce twice.

**Alignment is independent of direction, and `ToastsUtils.computeStackAlignment` is what keeps it that
way.** A reversed flex direction inverts "start" on the main axis, so a naive mapping would make
`bottom-right` name different corners depending on `getDir`. The function flips the main axis alone,
which is exact arithmetic over two enums rather than an approximation, and it is the one part of this
component reachable from `npm test`.

**Flow stacking is the geometry props; an overlapping pile is the painter's**, offsetting and scaling
itself off `index` and `count`, which works for a fixed peek distance. Overlapping by each card's own
measured height does not work and is recorded in `review.md` rather than half-solved.

**Toasts sit above dialogs** — `z-index` 200 against `Modal`'s 100 — because a toast routinely reports
the outcome of the action a dialog just took.

**`getLimit` is written out as `Accessor<number | undefined>` rather than left to `AccessorProps`**, for
the hole recorded under _"`AccessorProps`"_: an optional prop whose own value may be `undefined` cannot
pass through the mapped type, and "no limit" is a value a consumer switches to at runtime rather than a
prop they omit. `getAriaLabel` is **required**, since a `role="region"` with no name is not exposed as a
landmark at all.

**`getOverflow` keeps both queue behaviours rather than picking one.** `dismiss-oldest` writes the excess
out of the consumer's list so the newest is what is on screen; `hold-newest` renders only the limit and
leaves the rest queued, entering as slots free. They are genuinely different products — latest-news
versus lose-nothing — and the request for a prop rather than a default is why both exist. Held entries are
not rendered at all, so they run no clock, which falls out of the design rather than needing a rule.

### Controls: `Collapsible`, and what an accordion adds to one

Settled **2026-08-10**, on the user's call, when a single show-more panel arrived as the second consumer of
the machinery `Accordion` had been keeping to itself. The standing "private until something else needs it"
rule fired, and the split is **what each layer claims about the page** rather than how either one opens.

**`Collapsible` owns the disclosure**: the trigger's `aria-expanded` and `aria-controls`, the panel, the
measured height, the fader, and `inert` while closed. `expandedSignal: Signal<boolean>` is its state, per
_"Signal tuples for two-way state"_ — a lone panel genuinely owns its own boolean, which is `Modal`'s
`visibilitySignal` argument again.

**`Accordion` adds the three things that make a panel part of a set**, and each is a statement rather than a
behaviour: the heading element around the trigger, the panel's `role="region"` named by that trigger, and
the arrow-key walk across the headers. The expanded-set policy — including single-expand — stays with it too,
since a set is the only thing that can have a policy.

**The heading is the load-bearing half of that split.** A show-more at the end of a paragraph is a control
inside prose; wrapping it in an `h3` would put a heading in the document outline that no reader would agree
is one, and a `region` landmark for a two-sentence expansion is landmark noise. So `getHeadingLevel` is
**optional** on `Collapsible` and absent means no heading element at all — the only component here where the
absence of a prop removes an element rather than defaulting one.

**The panel's role arrives as `getPanelRole` plus `getPanelAriaAttributes`, which is `Popover`'s shape.**
That entry already argued this exact case: the role is the consumer's, so the ARIA that role requires is the
consumer's too, and one bag beats a prop per attribute. `Accordion` passes `region` and an
`aria-labelledby` pointing at the header id it generated, which is also why `Collapsible` takes `getId` —
whoever names the panel has to own the id.

**A section has no boolean, so `SignalMirror` is the bridge.** `Accordion` owns `Signal<T[]>` and each
section reads its own membership out of it, while `Collapsible` wants the whole signal.
`SignalMirror.createValueMirror` is exactly the escape hatch that was extracted for this, and it writes
outward only when the value actually differs — so "the difference is the toggle" holds and the set stays the
single source of truth. This is its fifth consumer and the first inside the library rather than the
Playground.

**`AccordionFlags` is gone rather than aliased to `CollapsibleFlags`**, following the `TextField` extraction:
the old names went with it and the Playground's painter was renamed to match. One shape, one name.

### Controls: `Accordion`, and where auto-height measurement lives

Settled **2026-08-10**. The first component whose geometry cannot be expressed in CSS at all, which is
what decides the division of labour.

**The height animation is the library's, and that is not a contradiction of "a control paints nothing".**
CSS cannot transition to `auto`, so animating a panel open requires measuring the content and animating
to a pixel value. Measurement is not paint — it is the same category as `Modal`'s alignment and `Label`'s
gap, and a painter cannot do it because the element being constrained is the library's. What the painter
still owns is everything visible: `renderPanel` receives `getVisibilityTarget` and
`getTransitionDurationMs` in `Modal`'s shape, so a fade or a slide inside the panel is the consumer's,
layered on top of a height the library drives.

**Three boxes, and each one exists for a reason.** The section wraps a heading and a panel. The panel
carries `overflow: hidden` and the animated height. Inside it sits an unconstrained content div, and that
inner box is what gets measured. Measuring the constrained box instead would need the height released and
restored on every pass — the trick `TextField`'s auto-sizing uses on an absolutely positioned overlay —
and it would fight the transition it is feeding.

**`ElementObserver.createBorderBoxHeightObserver` is the extracted half, and `TextField` was
deliberately not migrated onto it.** `review.md` asked for the shared piece so the measurement would not
be written twice. On reading both, they share less than that implied: `TextField` clamps to a row count
derived from `line-height`, releases `bottom` to measure a `scrollHeight`, and republishes the result as
the wrapper's `getMinHeight`. What is genuinely common is "observe an element and republish its own
height", which is what the new observer is and all it is. Its name follows the coordinate-space rule —
border box, layout pixels, so `Viewport`'s scale never enters and neither does the height being animated.

**The panel stays mounted and goes `inert` rather than being unmounted or hidden.** Unmounting would
make the content unmeasurable and the animation impossible; `display: none` the same. `inert` takes the
subtree out of the tab order and out of the accessibility tree while leaving it laid out, which is what
`Popover` already does with its own root. The cost is that a collapsed panel's content is still built, so
an accordion of a hundred expensive panels builds all hundred.

**Headers are all in the tab order, and the arrows are an extra rather than a roving order.** This is the
published accordion pattern and the opposite of `Tabs` and `RadioGroup`, which are single tab stops. The
difference is what the collection means: a tab list or a radio group is one control with several states,
so it gets one stop; an accordion is several independent disclosures. Arrow, `Home` and `End` support
comes from `NavigationUtils.computeNextPosition` unchanged, moving focus without selecting anything.

**Each header is wrapped in a real heading element, and its level is a prop.** A `getHeadingLevel`
defaulting to 3 picks `h1`..`h6` from a fixed list rather than building a tag name, so it stays typed. The
level is document structure, which only the consumer knows; the library owning it would either invent an
outline or force `role="heading"` with `aria-level`, and a real element is better for both AT and
document outline. The heading gets `margin: 0; font: inherit` — a reset in the same category as
`interactionRoot > * { margin: 0 !important }`, not paint.

**`getSizing` defaults to `"fill"`, following `Progress` rather than `InteractionWrapper`.** Found by
driving it: with the root shrink-wrapping its content, opening one section changed the widest section and
re-wrapped the text in every other one. An accordion's natural width is its container's. The type is
declared on `Accordion` rather than imported, for the reason `Progress` records — sharing it would file a
non-interactive geometry vocabulary under `InteractionWrapper.types`.

**The header leaf must re-enable pointer events, and forgetting to is invisible to types.** `interactionRoot`
sets `pointer-events: none` and every leaf sets `pointer-events: all` on its own element; the first
version of `Accordion.css.ts` did not, and the result was a header that looked perfect and could not be
clicked, because the hit test landed on the heading above it. `Button.css.ts` and `BinarySwitch.css.ts`
are the precedent. Worth stating because nothing in the type system or in a DOM assertion catches it —
only a real click does.

### `LiveAnnouncer`: the region that belongs to no component

Settled **2026-08-10**, on the user's call, for `Calendar`'s month change.

**A live region only announces content inserted after it is already in the document**, which is the rule
`Toasts` records for its own region — and it is why a component cannot mount one when it needs to speak. Two
module-level regions, polite and assertive, created on first use and kept, sidestep that. They live on
`document.body` rather than in the `Viewport` portal: nothing about them is painted, so the scale factor is
irrelevant, and they must outlive any subtree that might announce through them.

**Each message is its own node, removed a second later.** Setting the text of one persistent node does not
re-announce an identical string, so paging back to a month you were just on would be silent. Appending a
fresh child is an addition every time, which is what `aria-relevant="additions"` tells a reader to watch.
This is Radix's per-toast announce arrangement and React Aria's shared announcer, arrived at from the same
constraint.

**It is visually hidden by the clip-rect idiom, and not by `display: none` or `visibility: hidden`**, either
of which would take the text out of the accessibility tree along with the paint and announce nothing at all.
The styles are applied imperatively because the element is the library's own and never reaches a stylesheet.

**`Calendar` is the first consumer, and it formats the month itself.** Paging swaps all 42 cells and changes
nothing else, so a screen reader user hears nothing until they move the focus. The month title on the page is
the consumer's markup — `Calendar` renders no header — so the announcement cannot be read off it; it goes
through the same `Intl` path the day labels already use. Politely, because paging is something the reader
just did rather than news. The previous month arrives as the effect's own argument, so the first run has
nothing to compare against and a calendar never talks about itself as it mounts.

### `NavigationUtils.computeNextCell`: the two-axis walk never wraps and never clamps

Settled **2026-08-10**, beside the 1D walk rather than replacing it, and it deliberately behaves
differently at the edges.

`computeNextPosition` wraps within its length, because a tab list or a menu is a closed ring.
`computeNextCell` does neither: overflow along a row **carries** into the neighbouring row, and `y` is
allowed out of range. That is what lets a caller whose grid is a window onto something larger resolve the
overflow by moving the window — `Calendar` reads `y === -1` as "the previous month" and needs no special
case for the first or last day. `x` is always in range, because carrying is what puts it there.

**Page keys mean a page of rows, and a caller for whom they mean something else turns them off.** That is
the only thing they can mean to a grid. A month is not six weeks, so `Calendar` passes
`hasPageKeys: false` and does month arithmetic itself. `hasEdgeKeys` works as it already did, and `Home`
/ `End` are the ends of the **row**, not of the grid.

### Controls: `Calendar`, and the date value the library owns

Settled **2026-08-10**. This closes the dependency question `review.md` recorded as a real decision
rather than an implementation detail.

**No date library, and no `Date` in the public API.** `Abstracts/DateValue` holds
`DateValue = { year, month, day }` with **`month` 1-12**, plus `DateValueUtils` over it. Two things drove
that. A `Date` is an instant, so a date-only value that round-trips through one shifts across a zone
boundary — the trap the review note named — and a record cannot shift because it has nothing to shift by.
And `Intl.DateTimeFormat` already supplies every locale-dependent string (month names, weekday names,
formatted dates), so the only thing left to own is arithmetic, which is about eighty lines. Months are
1-12 rather than `Date`'s 0-11 because an off-by-one month is the most common bug in date code and no
type catches it.

**Every conversion goes through midday**, never midnight. A midnight anchor can land on the hour a zone
skips or repeats, and then "add a day" moves by 23 or 25 hours and comes back on the same or the wrong
calendar date — a stepper that appears to stick. Midday is never inside a transition anywhere on Earth.
`DateValue.utils.test.ts` pins both European transition dates.

**No conversion may pass a year to the `Date` constructor, because it reads 0 to 99 as the 1900s.**
Corrected **2026-08-11**. `new Date(year, month - 1, day, 12)` was the single conversion for a long time
and is wrong for any year below 100: the constructor treats those as shorthand for 1900 to 1999, so a
Caesar born in year 44 was stored as 44 and then described everywhere as 1944 — wrong weekday, wrong
month grid, wrong formatted label — with nothing reporting a problem. `getDaysInMonth` had it twice over:
February in year 4 answered 29 because it was really being asked about 1904.

Both now go through one private `buildLocalDate`, which builds an anchor date in a safe year and then
calls `setFullYear(year, month, day)` — the documented way past the shorthand, since `setFullYear` takes
the year literally. **All three fields go in that one call, and that is the part worth remembering**: set
alone, the year lands on an anchor whose month and day have already been normalised, and year 0 is a leap
year while the 1900 it was shorthand for is not, so the 29th of February in year 0 would have become the
1st of March on the way through. Passing all three makes the date exist only once, in the year asked for.

The shorthand is unreachable from the rest of the file — the two remaining `new Date` calls with a literal
year build the month and weekday **name** lists, where the year is an arbitrary anchor and never read back.

**A year outside 0000 to 9999 is written in ISO 8601's expanded form, and only then.** Settled the same
day, closing the other half of the same bug. `toIso` was padding the _signed_ string, so year −44 came out
as `0-44-08-01` with the minus sitting where the third digit belongs, and `fromIso`'s four-digit pattern
then refused to read it back. Padding the absolute value and putting the sign in front is the whole fix;
the pattern widens to "four bare digits, or a sign and six" and the fixed length check goes away, since a
pattern anchored at both ends already rejects anything longer.

Six digits with a leading `+` or `-` is what ISO 8601 prescribes for years outside the four-digit range,
and what `Date.prototype.toISOString` emits, so the expanded form round-trips through the platform rather
than being a private spelling.

**Expanded only when the year needs it**, rather than always. Emitting a sign on every date would be more
uniform and would rewrite every stored date string every consumer has, for a case almost nobody reaches.
The cost of the narrower rule is that the writer is canonical while the reader is lenient — `fromIso` will
accept `+002026-08-10` and `toIso` gives back `2026-08-10` — so reading and writing normalises rather than
reproducing the input character for character. That is the right way round and it is not a pure
round-trip; both halves are pinned by tests.

`-000000` is refused. ISO 8601 does not allow a negative zero year, and `toIso` can never emit one, since
year 0 is inside the plain range.

**What this does not buy: a BC date still cannot be typed.** `DateInput`'s mask is a fixed run of digit
slots, and everything that is not a digit is discarded on the way in, so a sign has nowhere to go — the
same missing piece `review.md` already tracks for the formatted number. Storing, loading, computing and
displaying a pre-common-era date all work; entering one is by code or by the calendar's own paging.

Worth knowing before anything labels one: this is astronomical year numbering, inherited from `Date`, so
there is a year 0 and it is 1 BC — year −44 is 45 BC. `Intl`'s `era` option already does that conversion.
Nothing here should reimplement it.

**`addMonths` clamps the day; `fromIso` refuses an impossible date.** The 31st of January plus a month is
the 28th or 29th of February, never the 2nd or 3rd of March, because `Date.setMonth`'s rollover makes a
month stepper skip months. And `fromIso("2026-02-31")` is `undefined` rather than the 3rd of March: a
field that silently moves what was typed is worse than one that reports the value as not yet valid.

**The grid is always six weeks of seven days, and carries the neighbouring months' days.** A fixed row
count is what stops the calendar changing height as months are paged. The neighbouring days are what make
the keyboard walk work without a special case — the grid is a continuous run of dates, so the next cell
from `computeNextCell` maps back to a date as `addDays(gridStart, y * 7 + x)` whatever `y` is.

**The visible month is a `Signal` the consumer owns, and `Calendar` renders no header.** `monthSignal` is
required, and the month title and the paging buttons are the consumer's own markup outside the component.
The alternative — a private month plus a `renderHeader` slot handed paging callbacks — would have invented
a controller record for something the settled convention already covers: state the component both reads
and writes arrives as the whole signal. `Calendar` writes it when the keyboard walk leaves the month,
which is exactly the two-way case. It also means `DatePicker` can snap the month to the value when its
popup opens without the component needing an opinion about that.

**That header being the consumer's is what made an interactive caption free.** Added **2026-08-11**: the
Playground's caption is a month title that turns into a `Select` for the month and a `NumberInput` for the
year when clicked, with the paging arrows either side of it throughout. `Calendar` was not touched to allow
any of it — the caption writes `monthSignal` exactly as the arrows already did. It lives in
`StyledComponents/CalendarCaption` and both `CalendarPage` and `DatePickerPage` use it, since the two had
written the same header twice.

**The fields are a mode, not the resting state**, so a calendar reads as a calendar until someone asks to
jump. Three things end the mode and they are not interchangeable: `Enter` accepts and hands focus back to
the title; `Escape` puts the month back to what it was when the mode opened, which is the only reason a
restore point is kept at all; and focus leaving the group ends it without moving focus, since the usual way
out is clicking a day and pulling focus off that day would undo the click's whole point.

`Escape` layers correctly with the month `Select` underneath it — `Select` handles the key only while its
popup is open and marks the event handled, so the first press closes the popup and the second closes the
mode. The caption checks that flag rather than the key alone. The one thing this costs: `Enter` cannot
close the mode from the month field, because `Select` claims `Enter` unconditionally to open or pick. From
the year field it works, and `Escape` and `Tab` work from either.

**Two bugs found building it, both worth stating because they will recur in any component with modes.**
The first: a `focusout` fires when the fields unmount, _after_ the mode has already been ended by `Enter`
or `Escape`, so the focus-out handler ran a second time and cancelled the focus restore the first exit had
just asked for. The handler now ignores anything arriving once the mode is already closed. The second: the
year field's `SignalMirror` pushes its inner value outward from an effect, which runs after the handler
that closed the mode — so `Escape` restored the old month and the mirror immediately wrote the abandoned
one back over it. The year write ignores anything queued while the mode is closed, for the same reason.
Both are the same shape: **ending a mode is not one event, and the tail of the old mode arrives after it.**

**The year is written on a `FunctionUtils.debounce`, not on every keystroke.** Typing 1066 into a live
field pages the calendar through years 1, 10 and 106 on the way. The debounce waits for the typing to
settle; `Enter` and focus-out flush whatever is pending rather than waiting for it, so nothing is lost by
leaving quickly. The mirror tolerates this without special handling — while no write has landed the outer
value has not changed, so nothing pushes back and overwrites what is being typed.

**The year is a number field rather than a second `Select`, and the reason is not taste.** A `Select`
materialises every option it is given and nothing here virtualises them, so a year list must be bounded —
and any bound is invented, since a hundred years back is right for a birthday and absurd for a booking, and
wrong for both if the date is ancient or fictional. A number field needs no bound, so no range has to be
guessed, and typing four digits beats scrolling eighty rows even in the ordinary case.

**The caption sets the calendar's width, which is why the day cell grew from 36px to 46px.** The header
carries two arrow buttons, a month name and a four-digit year, and that does not fit across seven 36px
columns — the frame was ending up a hundred pixels wider than the grid inside it, with the grid visibly
floating. `Calendar`'s root is `width: fit-content` and the cell size is the Playground painter's, so the
grid cannot stretch to a wider header and the cell is the only end of it that can move. 46px × 7 is 322px,
which is what the caption needs. If a `getSizing` is ever added to `Calendar` — every other component of
this shape has one — this is the constraint that would go away.

It also keeps the frame still across the mode switch. The edit-mode header is the wider of the two, so
sizing the grid to it means the box does not resize under the pointer when the title is clicked — which it
would have done, by seventy pixels, at the old cell size.

**Selection is by date, one tab stop, and the cell carries the whole date as its name.** `valueSignal`
holds a `DateValue | undefined`. The grid is a roving tab order over 42 `InteractionWrapper`s, following
`Tabs` rather than `Select`'s `aria-activedescendant`, because each day is a real element that can hold
focus. Since the painter draws a bare number, the cell sets `aria-label` to the full formatted date —
otherwise a screen reader announces "17" with no month. `aria-current="date"` marks today,
`aria-selected` the selection.

**`CalendarFlags` carries the day itself**, unlike every other flags record, because the painter's whole
job is to draw that date and it would otherwise have to be handed the accessor twice — once as
`renderDay`'s first argument and once inside the flags. Both are available and the flag is the one a
`classList` block can read alongside `isSelected` and `isOutsideMonth`.

**An intervening wrapper div sits between `role="row"` and `role="gridcell"`**, because every cell is an
`InteractionWrapper` and the wrapper owns its own root. `Select` already made this trade between
`role="listbox"` and `role="option"`; it is recorded in `review.md` now that a second component has hit
it, since a grid's row/cell relationship is the stricter of the two.

### Pointer drag: a ratio, opt-in, and captured

Settled **2026-08-10**, closing the primitive `review.md` #2 asked for. `InteractionUtils.trackDrag(ref,
disabled, opts)` reports where a pointer is inside an element for as long as a drag lasts.

**It is a separate call rather than part of `wrapElement`**, which is what item 2 asked for and the reason
is unchanged: most controls want no listener at all, and a two-dimensional surface is the one shape that
cannot borrow a native input the way `Range` borrows one per thumb.

**It reports a ratio of the element's own box, not a position, and that is what keeps it out of the
coordinate-space trap.** Pointer coordinates and the element's rect are both client-space, so `Viewport`'s
scale divides out of the fraction exactly and never has to be looked up — no `ViewportUtils` call, nothing
to get wrong. This is the same insight that fixed the two geometry specs: a ratio of two same-space
measurements is scale-free by construction.

**`setPointerCapture` is load-bearing.** A drag that stops reporting when the pointer leaves the element
strands the control mid-drag, and releasing outside must still land the value. Capture also means the
`pointermove` handler can be on the element rather than the document, so nothing leaks when the component
goes away.

**`pointerdown` reports immediately**, so a click positions the value without a drag — which is what a
colour surface and any track-clicking slider need.

### Controls: `ColorArea`, and the value form a picker has to hold

Settled **2026-08-10**. The saturation-and-brightness surface that replaces the OS colour dialog, plus the
arithmetic under it.

**Hex is the storage form and HSV the working one, and they do not round-trip.** `Abstracts/ColorValue`
holds both plus the conversions. Eight bits per channel cannot carry hue at black or saturation at grey,
so a surface that re-read the hex on every drag frame would drift and then stick — drag brightness to zero
and the hue is gone for good. `ColorArea` therefore takes `hsvSignal: Signal<ColorValueHsv>` and never
touches hex; converting at the boundary is the consumer's, and `ColorValueUtils.getIsSameHex` exists so a
caller can tell whether the hex it was handed still describes the HSV it is holding. This is the same
shape as the timezone decision under `Calendar`: keep the lossless form in the working state and convert
only at the edges.

**The surface is a `role="group"` over two real range inputs, one per axis.** Both are collapsed to a
pixel and taken out of hit-testing, so the drag on the group owns the pointer while the keyboard and
assistive technology get the native slider for free — arrow keys, `aria-valuetext`, the lot. Collapsed
rather than `display: none`, because a hidden element is not focusable and the tab order is the whole
point of them. A single element with `role="slider"` was the alternative and was rejected: one slider
cannot honestly carry two values, and it would mean reimplementing the key handling that two native
inputs already have.

The cost, accepted: the axis inputs' own focus rings are invisible, so the painter draws focus from
`focusedAxis` in the flags. That is the same arrangement `TextInput` uses for its caret colour — the
library hands over the state and the painter draws it — rather than the rejected `:has(:focus-visible)`
shape, because here the flag reaches the painter directly.

**`syncElement` returns for a fourth time.** Both axis inputs are pushed from state in a render effect,
for `BinarySwitch`'s reason: the browser moves a range input before it reports, so an owner that refuses
or snaps the write would leave the element holding a value the state does not agree with.

**`PopoverRole` gained `"dialog"`.** `Select` brought `listbox` and `Menu` brought `menu`; a popup holding
a control surface rather than a list of choices is a dialog. The union grows as consumers arrive rather
than being a general string, which is why the addition is a word and not a widening.

**`ColorInput` **is** the picker now, and the OS dialog is gone — settled 2026-08-10.** It was a native
`<input type="color">` behind a painter; it is now a field button plus a `Popover`, with `ColorArea` and a
hue `Range` inside. The three ownership questions that were open are answered as follows.

- **The hex boundary is the component's.** `valueSignal` stays `Signal<string>`, so no consumer changed,
  and the HSV working state lives inside where a drag cannot lose hue at black. Both directions of that
  sync guard with `getIsSameHex` and read the far side `untrack`ed, for the reason recorded above — a
  mirror that tracks both sides writes its stale half back over the new value. The emitted spelling is six
  digits while alpha is 1 and eight when it is not, so the old contract is unchanged until a consumer
  actually uses opacity.
- **Dismissal is the component's, and it needs a document listener.** `Select` closes on blur because its
  popup refuses focus; a colour popup cannot, since the surface's axis sliders and the hue slider must be
  focusable. So `ColorInput` listens for a `pointerdown` outside both the popup and the field while open,
  and `Escape` closes from either and returns focus to the field. This is the first popup here that needs
  outside-click detection, and it is why `Popover` still has none — the need is the consumer's, not the
  layer's.
- **The paint is four slots**, following `Select`'s count rather than inventing a smaller surface:
  `renderContent` for the field, `renderArea` and `renderHue` for the two controls, and `renderPopup` for
  everything around them. `renderPopup` receives a thunk that renders the surface plus the HSV signal
  itself, which is what lets a consumer add a colour-space toggle and channel inputs — those are paint and
  arithmetic over a value they now hold, not behaviour the library owes them.

**A native colour input is no longer reachable through this control**, which is the cost. There is no form
value and no OS picker, and `FileInput` remains the only control where the UA still owns activation. The
suite got better for it: every part of the picker is drivable, where the OS dialog could only ever be
tested by writing the value and reporting it.

**`Popover` refuses `mousedown` for a list, not for a dialog.** The `preventDefault` that makes `Select`
work — focus never leaves the field, so close-on-blur is correct rather than fatal — also cancels the
default action of pressing a native control, and a range thumb's drag **is** that default action. So a
`dialog` popover holding real controls skips it: the hue slider inside the colour picker could be typed
into but not dragged, and nothing in the DOM showed it. The role already states the intent, which is why
this is a branch on `getRole()` rather than a new prop.

**Alpha is optional on the working form, and 0-1 everywhere except in a hex string.** `ColorValueHsv`
gained `a?: number`, so `ColorArea` — which has no opinion about opacity — passes it through untouched and
an absent alpha means opaque. `toHexa` always emits eight digits, because a form that only sometimes
carries alpha is a form you cannot type into. `hsl` is a display form only: it is what `hsl()` and an HSLA
input want, and it is not what a saturation-and-brightness square is drawn in.

**A two-way mirror must track only its own source, and this cost two bugs to learn.** The Playground's
colour picker mirrors the hue into a `Signal<number>` for the slider, and both directions originally read
the other side's value inside the effect. That makes the pair fight: picking a colour anywhere else re-ran
the hue-to-picker direction, which found the hue signal still holding the previous hue and wrote that
stale hue straight back over the new colour — so typing a hex produced a different colour entirely. The
guard on the far side has to be read `untrack`ed. The same shape broke the hex field twice over: an effect
that refreshed the field's text while tracking the picker overwrote what was being typed. This is the
fourth mirror in the Playground and the first two to go wrong, which is the argument for extracting it —
see `review.md`.

**A hex field owns its text until it is left.** Three and four digit hex forms parse, so a half-typed
value commits early; pushing the canonical spelling back in would replace the text under the caret and
send the rest of the keystrokes into the middle of it. Refreshing on the way out is `NumberInput`'s
clamp-on-blur rule applied to a different kind of incompleteness.

**`PageTextField` cannot be used for a field whose value is derived.** Its internal mirror lands one tick
behind the element, and `TextSync` then restores the caret to the offsets it captured before the write, so
every character after the first is inserted one position early. The colour picker's hex field uses
`TextInput` directly with a signal it owns, so the element and the source can never disagree. Worth
recording because the field wrapper is used on nine other pages and works fine for all of them — the
difference is only that their values are not converted on the way through.

### Controls: `DateInput` and `DatePicker`, without the mask

Settled **2026-08-10**. Both ship; the mask `review.md` named as their blocker turned out not to be one for
a typed date, and that is the decision worth recording.

**`DateInput` is a `TextField` over a private text signal, and it reads and writes ISO order only.**
`yyyy-mm-dd`, because that is the one spelling `DateValueUtils.fromIso` accepts and refuses exactly — it
returns nothing for the 31st of February rather than nudging it into March. A locale-ordered display
(`dd/mm/yyyy`) is what actually needs the mask, since the caret has to skip the separators and the display
form stops matching the value form. Refusing to build half a mask is why the field is ISO for now.

**The field owns its text while it is being typed, and snaps when it is left.** Exactly the rule the
colour picker's hex field arrived at, for the same reason: a partial value is not a value, so a shorter
string than a complete date is ignored rather than treated as cleared, and the canonical spelling is
written back on blur. This is also why `DateInput` sits on `TextField` rather than on `TextInput` —
`TextFieldPresetProps` omits `onBlur`, and the blur is the whole mechanism.

**Its two range props are `getMinDate` / `getMaxDate`, not `getMin` / `getMax`.** `TextFieldState` already
has numeric `min` and `max` for a spin button, and spreading a `DateValue` into those would either fail to
compile or set a nonsense attribute. Renaming is cheaper than an `Omit` plus a hand-written pass-through,
and it reads better on a date field anyway. There is no `onInput` either: the consumer owns the signal, so
an effect over it sees every change — the argument `Toasts` already settled.

**`DatePicker` is `DateInput` plus `Calendar` in a `Popover`, and the trigger lives in the field's trailing
slot.** That slot existed for `NumberInput`'s stepper and needed no widening. The visible month is the
picker's own signal, snapped to the value each time the popup opens, which is what `Calendar`'s required
`monthSignal` was left public for. Typing a date and picking one therefore agree without either knowing
about the other — both write the same value signal, and the calendar follows it.

**Dismissal repeats `ColorInput`'s arrangement**, outside-`pointerdown` plus `Escape`, and that is now the
third dismissal story in the repo. It is the same open question `review.md` records for `Select` and
`Menu`; the count is the argument, not any one of them.

**Paint is four slots**, matching `ColorInput` and `Select`: the field's own `renderContent`, `renderTrigger`
for the opener, `renderDay` and `renderWeekday` for the grid, and `renderPopup` for the surround, which
receives the month signal so the consumer draws the title and the paging buttons.

### The mask: only digits are typed, and the caret is computed rather than preserved

Settled **2026-08-10**, on the user's call to try a mask rather than the element-per-segment shape every
other library uses (`review.md` item 7's survey). It is the primitive two shipped fields were waiting on.

**`TextSyncUtils.applyMask(pattern, previous, next, caret)` is a pure function, so the caret arithmetic is
reachable from `npm test`.** A pattern is `#` for a digit slot and any other character as a literal, so
`dd/mm/yyyy` is `##/##/####`. It returns the text and where the caret belongs, and
`TextSync.utils.test.ts` covers the cases that are easy to get wrong.

**Only the digits carry meaning.** Everything that is not a digit is discarded on the way in and re-emitted
from the pattern on the way out. That single rule is what makes typing `25122026`, pasting `25/12/2026`,
pasting `25.12.2026` and pasting ` 25 12 2026` all land the same value, and it is why the caret cannot
simply be preserved: the position that survives an edit is _how many digits precede it_, and the offset in
the text is derived from that afterwards.

**A literal appears only once the digit after it exists.** Two digits in, the text is `12` rather than
`12/`. So an abandoned field never holds a trailing separator, and nothing downstream has to decide whether
an incomplete value ends at a digit or at punctuation. The alternative — emitting the separator as soon as
its group fills — was not taken because it makes `12/` a state the parse then has to ignore.

**Deleting a literal deletes the digit in front of it.** Backspacing the slash in `12/34` would otherwise
strip a character the mask immediately puts back, so the key would read as broken. The tell is that the
digit count did not change across an edit that shortened the text.

**The mask lives in `TextSync` because it owns the caret, and a transforming setter cannot.** The owner's
setter runs after the browser has already written the text; it can refuse or rewrite a value, but it cannot
move a caret it never saw, and a caret left where the keystroke put it lands before the separator the mask
just inserted. `createValueSync` therefore takes an optional `getMask` and, when there is one, writes the
masked text, sets the caret and reports upward — instead of reporting first and syncing back.

**One consequence, accepted: inserting into the middle shifts rather than overwrites.** Typing a digit into
the middle of a complete date pushes every later digit along and drops the last one, because the mask holds
a digit string and not a set of fixed-width fields. Overwrite-in-place is what per-segment elements give
you for free, and it is the main thing this shape does not.

**What a mask cannot do at all**, worth stating because it is the line where segments would come back: with
one input the browser draws the whole string, so nothing can tint or box the segment the caret is in, and
nothing can be placed _between_ two segments. What it keeps is everything about the field being one input —
`renderLeading` / `renderTrailing` are untouched, the measured adornment inset still applies, and
`computeTextStyle` still styles the value. Verified on the masked `DatePicker`, whose trailing trigger
insets the text exactly as it did before.

### Controls: `DateInput`'s format states the order, and the mask follows from it

Settled **2026-08-10**, with the mask above. `getFormat` takes `"iso"`, `"day-month-year"` or
`"month-day-year"`, defaulting to ISO so nothing changed for existing call sites.

**An arbitrary mask string is deliberately not the prop.** A consumer who could pass `##/##/####` directly
would leave the component guessing which of its slots were the month, and a pattern the parse does not agree
with is a field that reads a date wrong in silence. So the order is what is stated and the pattern is
derived from it — one source of truth, the same argument the discriminated `SelectItem` record makes.

**`fromIso` is still the only thing that decides whether a date exists.** The display order is reassembled
into `yyyy-mm-dd` and handed to it, so the 31st of February is refused in every order rather than once per
order, and no second validator exists to disagree with the first.

**ISO is masked too, on the same path.** It could have kept its unmasked branch, and did not, because two
paths would be two behaviours to keep in step. Nothing observable changed: typing the separators still
produces the same string, since a typed `-` is discarded and the mask supplies its own.

**`TextSyncUtils` is not exported from `index.ts` yet.** `DateInput` is its only consumer and the standing
rule is private until a second one arrives — which will be `TimeInput`'s 12-hour clock or the formatted
number, and either would also be the moment to decide whether a consumer building their own masked field
should be able to reach it. _`TimeInput` became that second consumer on 2026-08-11; the export decision is
still open._

### A masked field shows the separator it wants next, and never deletes what it could not read

Both settled **2026-08-11**, from the user testing the fields and finding them, in their words, broken.
Recorded together because they are one complaint: **a field must say what it is waiting for, and must never
answer a mistake by throwing the mistake away.**

**The separator arrives with the group before it, not the digit after it.** Four digits into `####-##-##`
the text is now `2026-`, and the caret sits after the dash. The old rule was the opposite and is argued a
few paragraphs up in this file — a half-finished field never held a trailing separator, so nothing had to
decide whether an incomplete value ended at a digit or at punctuation. That is a real simplification and it
was bought at the reader's expense: typing `2020` into an ISO field showed `2020` and gave no sign that a
month was wanted next, or that the dash would be supplied rather than typed. Nothing downstream cared,
because every consumer of the text counts digits rather than characters.

The deletion rule is unchanged and now does more work: backspacing over a separator still removes the digit
in front of it, so two presses remove two digits rather than a digit and a dash. What changes is where it
stops — `25/12/` loses the `2` and becomes `25/1`, keeping the separator its first group still earns.

**An unreadable field keeps its text and reports an error.** `DateInput` and `TimeInput` used to rewrite the
text from the value whenever the field was left, and with no value that meant erasing what had been typed:
entering `2020-20-20` and tabbing away left an empty field and no explanation. The rewrite now runs only
when there is a value to rewrite from, so wrong text survives to be corrected.

**Wrong and unfinished are different, and they report at different moments.** A spelling that cannot exist —
the 20th month, `29:99`, a date outside `getMinDate`/`getMaxDate` — is wrong the instant the last digit
lands, and errors immediately, while the field still has focus. A value that is merely half-typed is not
wrong yet; saying so mid-keystroke would be noise, so it errors only once the field is left, and typing
again clears that. Both surface through the flag the painter already reads: `getHasError` is the consumer's
own prop **or** the field's own judgment, so a consumer who passes nothing still gets a field that says no.

This is what `hasError` on sixteen controls was waiting for a producer to do, and it is worth noting that
the producer turned out to be the control itself rather than the form story `review.md` files it under.

**The value is still cleared when the text cannot be read.** The error is about the text; the owner is told
there is no date, which is true. What changed is that the field stops agreeing with the owner by going
blank.

**A part that cannot exist is refused before the rest of the value does.** Added the same day, on the
user's observation that a 13th month is already wrong without waiting for a day: `TextSyncUtils.readGroups`
reads the **complete** fixed-width groups of the digits typed so far, and each is range-checked on its own —
month 1-12, day 1-31, hour 0-23 or 1-12 on a 12-hour clock, minute and second 0-59. A group still being
typed is not reported, so `1` never has to answer for the month it might still become.

The bounds are deliberately per-part rather than per-value: the day's ceiling is the longest month, because
a 30th of February is two parts _disagreeing_ rather than one part being impossible, and that stays
`fromIso`'s to catch once all three exist. Three checks in order — impossible part, then complete-value
parse and bounds, then unfinished — and each reports at the earliest moment it can be sure.

**Not extended to an impossible _prefix_**, though the same argument reaches it: a month whose first digit
is 2 can only ever become 20-29 and is already doomed. Refusing it needs the field to reason about what the
group could still become, and the published answer to that case is auto-advance — typing `2` fills `02` and
moves on — which is a different feature with its own keyboard consequences. Complete groups only, for now.

### A masked field offers the placeholder that matches its own mask

Settled **2026-08-11**. `renderPlaceholder` is now `(getFlags, hint)`, where `hint` is `yyyy-mm-dd`,
`dd/mm/yyyy`, `hh:mm` or `hh:mm:ss` depending on what the field is actually spelling. A consumer that wants
something else ignores the argument; the Playground now draws it and its eight variants stopped carrying
eight hand-written strings, three of which were wrong — every time field said `yyyy-mm-dd`.

**It comes from the format, not from the mask string.** The hint and the pattern are two renderings of one
definition — the ordered parts and the separator — so `computeHint` sits beside `computeMask` and reads the
same record. Deriving the hint by rewriting `####-##-##` would need a second thing to know that the first
group is a year, which is exactly the guessing _"an arbitrary mask string is deliberately not the prop"_
exists to avoid.

**It is a plain string rather than an accessor**, following `Calendar.renderWeekday`'s `name`: the painter
reads it where it is handed over, inside a tracking scope, so a format change re-renders it anyway.

The prop behind it is `getPlaceholderHint` on `TextField`, and `DateInput` and `TimeInput` `Omit` it for the
reason the presets omit `getMask` — they own the format, so two sources for the same string is the problem
the omission prevents. A hand-built `TextField` or `TextInput` sets neither and its painter is handed
`undefined`.

### Dismissal is one stack, and `Popover` is the layer

Settled **2026-08-11**, replacing five separate stories: `Select` closed on its field's blur, `Menu` on
its popup's blur, `DatePicker` and `ColorInput` each ran their own document-wide press listener, and
`Modal` its own document `keydown`.

**`DismissStack` is a module-level array of open layers with one set of document listeners**, in the
`LiveAnnouncer` position — it belongs to no component and there is one of it. It is _not_ owned by
`Viewport`: a consumer with no `Viewport` still needs dismissal, the events it listens for are the
document's rather than any element's, and nesting a `Viewport` inside a `Viewport` would then need
cross-authority ordering that a single array does not have.

**A press or a focus move is positional; `Escape` is a stack operation.** Every layer the target sits
outside of hears about a press or a focus move, which is what closes a whole menu tree at once and what
`getIsWithinOwnedLayer` keeps from closing a parent when the press was inside a child. `Escape` goes to
the innermost layer and stops. That last part is the bug this fixed: every control used to handle
`Escape` locally and let the key travel on, so a popup dismissed inside a `Modal` took the `Modal` with
it. `modal.spec.ts` drives it, over a `Select` inside the modal on `ModalPage`.

**The reason reaches the consumer, because the right response differs by reason.** `DatePicker` and
`ColorInput` return focus to their field on `Escape` and do not on a press, since moving focus to a field
someone has just clicked away from is the wrong answer. A submenu closes only its own level whatever the
reason; `Tab` still closes the whole menu, from the menu's own key handler, before focus moves.

**`Popover` registers the layer, so its four consumers get dismissal by existing.** Roots are the popup
element and the anchor. The controls kept `onDismiss` shaped as their own close paths and lost their
listeners, their `onBlur` plumbing and `Menu`'s `computeIsInsideMenu` walk with them.

**Window blur no longer closes anything.** `focusout` with no `relatedTarget` is ignored, so switching
apps leaves a popup open where `Select`'s old field blur would have closed it. That matches Radix and it
is the reason a focus move alone is not enough — the press listener covers a click on dead space.

### A portalled layer's z-index is one above its anchor's

Settled **2026-08-11**, as the tail of the dismissal work: a `Select` opened inside a `Modal` could be
dismissed by key but not clicked, because `Modal`'s overlay is `100` and `Popover` was a fixed `1`.

**The number comes from the anchor, not from a register of layers.** `AnchorUtils.getStackingBase` walks
the anchor's ancestors and takes the highest numeric `z-index` on the chain; `Anchor.createPortalPosition`
publishes that plus one as `getZIndex`, recomputed each time the layer becomes visible. A popup on an
ordinary page still lands on `1`, which is what it was, and one inside a dialog lands on `101`. A submenu
anchored to an item inside a popup at `101` lands on `102`, so a chain of layers orders itself without
anyone counting.

**Why not the stack.** Open order and paint order are not the same question — a `Modal` opened _from_ a
menu should cover the menu that opened it, and the anchor chain says so while a counter does not. It also
keeps `DismissStack` a listener rather than something that paints, and leaves a consumer's own stacking
free of a number the library invented.

**`Tooltip` takes the same number and no longer takes a prop.** `computeZIndex` went with this change: it
existed so an "in" placement could paint _under_ the button that opened it, and a portalled layer cannot
do that at all — the `Viewport`'s portal is `z-index: 10` above page content, so everything in it clears
every anchor. Getting that effect would mean raising the anchor above the portal while its layer is open,
which is the library writing a `z-index` onto a consumer's element, so the prop was removed rather than
left as a number nobody could use.

### A popup opened from inside a popup is not outside it

Settled **2026-08-11**, from a bug the calendar caption exposed: opening the month `Select` inside the
`DatePicker`'s calendar and clicking an option shut the whole calendar. `DatePicker` dismisses on a pointer
press that is not inside its popup, and a popup is portalled to the end of the document — so the select's
list is a **sibling** of the calendar rather than a descendant of it, and `contains` reported the click as
outside. Every nested popup has this shape; the calendar caption was just the first one built.

`DismissUtils.getIsWithinOwnedLayer(target, roots)` walks up from the pressed element, and every time it
reaches an element that something else points at with `aria-controls` it jumps to that controller and keeps
walking. The select's list is controlled by the select's field, the field is inside the calendar, so the
press resolves as inside. **Ownership is already in the markup**, put there for screen readers, so nothing
has to be registered on open and no order has to be maintained.

It is not the layer stack `review.md` asks for, and it does not pretend to be: a stack also decides which of
several open layers a stray press dismisses, and orders them, which this cannot. It fixes the containment
question only. `ColorInput` runs the same kind of listener and should adopt it when the stack is built.

### The am/pm segment is a control in the trailing slot, not a slot in the mask

Settled **2026-08-10**, on the user's suggestion, and it removes the extension the mask looked like it needed.
A 12-hour field was the reason to add a non-digit slot to the pattern; putting the meridiem in
`renderTrailing` instead means **the pattern stays digits-only** and nothing about the mask changes.

**It is `renderTrailing` widened, not a new slot, and not `renderDecoration`.** `TimeInput` re-declares that
one slot as `(getFlags, meridiem)`, which is exactly what `NumberInput` does with its stepper — same
argument: both would want the same physical position, and one slot lets a painter draw a unit and a control
together. The decoration overlay was the other candidate and cannot host this at all: it is one full-box
overlay that inherits `pointer-events: none`, so a control inside it is unclickable, and it is not
positional.

**The value stays 24-hour and the meridiem is a way of reading it.** `TimeValue` gains no fourth field.
`TimeValueUtils.getMeridiem` / `getTwelveHour` / `withMeridiem` / `fromTwelveHour` are pure and tested, and
they are tested because **midnight reads as 12 am and noon as 12 pm** — the mapping is not `hour % 12` in
either direction, and nothing in the type system catches an off-by-twelve. Keeping the value in 24-hour form
also makes the hard case free: stepping the hour past eleven carries into the next half of the day with no
arithmetic of its own, because the meridiem is derived from the hour rather than stored beside it.

**The meridiem is nonetheless a signal, and only because of the empty field.** With no value there is no hour
to read it off, and a consumer who chooses "pm" before typing has to have that remembered. Whenever a value
exists it wins — an effect pushes the value's own meridiem back into the signal — so the two cannot disagree
about a time that is actually held. The parse reads the signal `untrack`ed, per the rule the colour picker's
mirrors established: an effect whose job is one-directional must depend only on the direction it syncs from.

**The consequence, accepted: it is a second tab stop.** Native `<input type="time">` makes am/pm a third
segment inside one control, reachable by arrow keys. Here it is a `Button` in the trailing slot with its own
focus ring, which is the same call recorded above for a two-thumb `Range` — and the slot was already
documented as able to hold a control with its own ring and tooltip. It has to carry a name: the Playground's
toggle sets `aria-label` to "Before or after noon: AM", because the glyph is `aria-hidden` like every other
painter's text.

**`TimeInput` uses the mask too, as of 2026-08-11.** It did not, and the paragraph here argued that was
deliberate; the user found out what it actually meant by typing `203` into the field and getting `203`
rather than `20:3`. The reasoning was sound about not bundling and wrong about the outcome: a field whose
twin punctuates itself and which does not is not a smaller feature, it is an inconsistency the reader hits
immediately. `computeMask(segmentCount)` builds `##:##` or `##:##:##` from the same constants the caret
arithmetic already uses, so the two cannot drift, and the segment stride is unchanged because a mask emits
exactly the fixed-width segments the arithmetic assumed.

### Controls: `TimeInput`, and stepping the segment the caret is in

Settled **2026-08-10**, immediately after `DateInput` and on the same shape.

**`TimeValue` is `{ hour, minute, second? }` and mirrors `DateValue` deliberately.** A record rather than a
`Date`, its own arithmetic, `Intl` only for formatting. There is no midday trick to worry about because a
time of day carries no zone at all — which is also why `second` is optional in a way `DateValue`'s fields
are not: a time to the minute and a time to the second are both complete values, and the shape says which
one a consumer is holding.

**Everything compares through `getSecondOfDay`**, so a value with seconds and one without mix safely:
`09:00` and `09:00:00` are the same time and `isSame` says so. Comparing the records field by field would
have made those two different, which is the kind of thing that shows up as a filter quietly dropping rows.

**Stepping wraps around the day; typing does not.** `addUnit` carries between segments and wraps at
midnight, because a clock has no end — stepping the hour up from 23:30 is 00:30. A **typed** time is
refused instead: `24:00` reports no value rather than becoming midnight, on `fromIso`'s rule that a field
which silently moves what was typed is worse than one that says the value is not there yet. Bounds behave
the same way in both directions: a stepped value clamps, a typed one outside the range is simply not a
value.

**The arrow keys step whichever segment the caret is in, and then select it.** The segment is derived from
the caret offset — three characters per segment including its separator — so no per-segment elements and no
mask are needed. Selecting the stepped segment afterwards is what makes a run of presses work: the caret
would otherwise drift and the second press would land on a different unit. This is the one part of the
control with no precedent in the repo, and it is why `TimeInput` takes `onKeyDown` for itself rather than
passing it through.

**No time popup.** A list of times in a `Popover` is a `Select` with generated options, and nothing here
needed one yet; typing plus stepping covers the field. Recorded in `review.md` rather than guessed at.

### `Button` can be named, and the label wins over the painter

Settled **2026-08-10**, closing the gap `Calendar`'s paging buttons exposed: a painter that draws only a
glyph left the button announcing "black left-pointing triangle".

**`ariaLabel` joins `InteractionControlProps`**, so it is the wrapper's to hand every leaf rather than each
leaf's to invent, and `ButtonProps` picks it up through the same pass-through `id` and `renderContent`
already use. Only `Button` applies it so far; a leaf that has its own naming story (`BinarySwitch` reads
the `Label` context, `TextField` names its input) keeps it.

**It goes through `LabelUtils.resolveAriaLabel`, so the `Label` rule is inherited rather than restated.**
Inside a `Label` the prop is suppressed and warned about, for the reason recorded under _"`aria-label` loses
to a visible caption"_ — a control carrying both is announced as something other than what can be read.

**Against painter text, the label wins, and that is the platform's rule rather than a choice.** An
`aria-label` overrides descendant text as the accessible name. There is no way to detect that a painter drew
words, so this cannot be warned about; the existing requirement that a painter mark decorative glyphs
`aria-hidden` is the other half of it. The Playground briefly used a visually-hidden span instead, which
worked and is gone: it made every icon button carry a clip-rect idiom the consumer had to know.

### `spiralSingle`'s overshoot is clamped, not re-derived

Closed **2026-08-10**. The spiral mapping subtracts its raw result from 1 and divides, so a result below 1
lifts the weight above it — which happens only with a half-integer origin, because the formula is built for
whole-number distances. The return is now clamped into 0..1.

What that deliberately does **not** do is separate the two cells that share the extreme. Fixing that means
rounding the distances before the formula runs, which changes measured weights across all three spiral
variants — and measured values are the user's call, not something to re-bless while fixing a range
violation. The test now pins the range rather than the old 1.008.

### The form story: the library wires, the consumer validates

Settled **2026-08-10**, on the user's call. It closes the largest open item, and the decision is the whole
of it.

**Validation is not the library's.** No validator prop, no required / min / max / pattern, no rule
language. Validation is application logic — schemas, async server checks, rules that span fields — and a
library that owns it ends up with a half-built rule language nobody can extend, plus two sources of truth
the moment a rule needs another field's value. `hasError` stays exactly what it was on every control: a
prop the owner sets. What changes is that it now has somewhere to go.

**What the library owns is association and announcement.** `FormField` generates the ids and wires a
control to its message; `Form` collects what its fields **report** and never computes anything. Those two
are the whole surface.

**`FormField` publishes a context and the control reads it, which is `Label`'s shape reused.**
`FormFieldUtils.resolveAriaDescribedBy` sits beside `LabelUtils.resolveAriaLabel` and merges the context's
message id with any `aria-describedby` the consumer passed. The consumer therefore wires nothing: put a
control inside a `FormField` with a message and it points at that message. The alternative — handing ids
out through a render prop for the consumer to thread — puts an accessibility relationship in application
code where a missing attribute fails silently.

**An error message is a live region; a hint is not.** The message element takes `role="alert"` only while
the field reports an error, so an error that appears is read out and a standing hint is not re-read every
time it renders. A message that empties takes the description reference with it, so a control is never
described by nothing.

**`Form` collects entries the way `RadioGroup` collects radios.** Each `FormField` registers
`{ getHasError }` during setup and cleans itself up; `getIsValid` is the memo over all of them. A submit
button reads it through the context, so disabling itself needs no state of its own. This is registration
rather than a data-driven list because a form's fields are written as markup, not enumerated as records —
the same argument `RadioGroup` records.

**`Form` renders a real `<form>` with `noValidate`, and prevents the default on both events.** The element
is what gives Enter-to-submit and the reset behaviour for free; `noValidate` is there because the browser's
own bubble would compete with the messages the consumer is already drawing. `hasSubmitted` is exposed
because "show the errors only after the first attempt" is the one piece of form state that is not a field's.

**A control does not hold its own error back until submit, and `hasSubmitted` is not for the errors it
raises.** Stated by the user on **2026-08-13**. The split is by _who can answer the question_, not by when
the reader would rather hear it. A format, range or mask error is answerable from the field's own text the
moment it is typed — the control already knows, so hiding what it knows until a submit is a control keeping
a secret from its reader. `hasSubmitted` exists for the other kind: an answer only a server has, such as
whether credentials are accepted or a name is already taken, which cannot exist before something is sent.
That is why `DateInput` and `TimeInput` raising `hasError` from their own text is not a conflict with the
form's flag but the other half of the same rule — nothing has to be reconciled between them.

**`Button` gained `getType`.** A submit button has to be a `<button type="submit">`, and the leaf hardcoded
`"button"` — so before this the form story could not have a submit button that was also a `Button`. It
defaults to `"button"`, so nothing changed for existing call sites.

**Only `TextField` and `BinarySwitch` read the description context so far.** Those cover `TextInput`,
`TextArea`, `NumberInput`, `DateInput`, `TimeInput`, `Checkbox`, `Toggle` and `Radio`. `Select`,
`ColorInput`, `FileInput` and `Range` still need the same one-line call, and that is recorded in
`review.md` rather than left to be discovered.

### `Button` reports the pointer, and `NumberInput` repeats while held

Settled **2026-08-10**, on the user's call, closing the item that had been parked for its own turn.

**`ButtonCbs` gained `onPointerDown` and `onPointerUp`**, both gated on disabled like every other callback
there. `pointercancel` is routed to `onPointerUp` as well: a drag that leaves the button, a touch the
browser takes over for scrolling, or a context menu all cancel rather than release, and a control that
started repeating on down must stop in every one of those cases or it never stops at all. Pointer events
rather than mouse ones because they cover touch and pen without a second pair.

**The repeat itself is the library's, not the painter's.** `NumberInputStepper` grew `startSteppingUp`,
`startSteppingDown` and `stopStepping`; the painter calls them from the pointer events and owns no timer.
A painter running its own interval would be four lines of behaviour duplicated in every consumer's
stepper, and behaviour is the shell's — the same argument that put the auto-dismiss clock inside `Toasts`
rather than in a toast painter.

**Both timings are props with defaults, because they are tuned values.** `getRepeatDelayMs` at 400 and
`getRepeatIntervalMs` at 60 match what a native spin button feels like, and they are exposed rather than
baked because the rule about measured values applies: a consumer with a slow store or a coarse step wants
different numbers, and nobody should have to fork the control to get them.

**A tap still steps exactly once.** `startStepping` steps immediately and only then arms the delay, so the
first step is not deferred; releasing before the delay elapses leaves that single step behind. Both halves
are pinned in `numberInput.spec.ts`, since a repeat that starts too eagerly is indistinguishable from a
working one until someone taps.

**The painter also stops on `mouseleave`.** Pointer capture is not used here, so dragging off the button
would otherwise keep repeating with nothing under the cursor. That is the painter's call rather than the
library's, and worth noting because it is the one part of the arrangement the shell does not enforce.

### A leaf with more than one focusable element owns the disabled half itself

Settled **2026-08-10**, closing a defect found while writing `e2e/range.spec.ts` and confirmed by driving
it: on a **disabled two-thumb `Range`** the second thumb kept a `tabIndex` of 0 and took focus from a
click, and on a **disabled `ColorArea`** both axis sliders did. The first thumb was always correct, which
is exactly what made it invisible.

**The cause is that `wrapElement` acts on one element, and the wrapper only ever has one.**
`InteractionWrapper` passes a single `setElementRef` into `renderControl`, and everything it does about
disabled — the `tabIndex` rule and the `mousedown` `preventDefault` that refuses focus — is done to that
element. `RangeElement` forwards only thumb 0 (`if (index === 0) props.ref?.(element)`) and
`ColorAreaElement` forwards the `role="group"` rather than either slider, so every other focusable element
those leaves render was outside all of it, at a native `tabIndex` of 0.

**`InteractionUtils.wrapExtraControls(getRefs, getIsDisabled, opts)` is the fix, and it is deliberately
only the disabled half.** It sets `tabIndex` and attaches the same focus refusal, and it is in
`InteractionUtils` rather than in either leaf because two components needed it the day it was written —
the standing "private until a second consumer" rule firing immediately.

**Reachability deliberately does not enter into it, and that is what keeps the fix small.** A control that
is reachable while disabled is focusable so that its tooltip can be read, and the tooltip is anchored on
the wrapper's single element — one target reveals it. So the extra elements leave the tab order whenever
the control is disabled, reachable or not, which means the leaf never has to know whether it is reachable.
That matters because _"Reachable mode is no longer visible to a leaf"_ removed exactly that knowledge on
purpose, and a fix that put it back would have undone the wrapper split to repair a tab stop.

**Two rejected alternatives, each for a reason worth keeping.** Having the wrapper apply the rules to every
focusable element inside its root is wrong rather than merely broad: `TextField`'s `renderTrailing` slot
routinely holds a real `Button` with its own wrapper — the Playground's password field is one — and a
disabled field must not take that button's tab stop away. And having the leaf compute the rule from its own
copy of the predicate is the duplication `computeIsReachable` was extracted to prevent.

**`ColorArea` had a second bug in the same place, and it is `syncElement`'s rule for the fifth time.** Its
axis `onInput` returned early while disabled, which skipped the push-back — so a refused arrow press left
the slider holding a position the state had never accepted, `aria-valuetext` disagreeing with the element,
and the next press moving on from the wrong base. It now gates the write and always calls `syncAxis`, which
is what `Range` already did. The general form: **a disabled control gates the write and still syncs the
element**; returning before the sync is the bug.

**An enabled multi-element control stays one tab stop per element — settled 2026-08-10, on the user's
call.** A two-thumb `Range` is two stops and a `ColorArea` is two, and the roving single-stop treatment
`RadioGroup` and `Tabs` use is deliberately not applied. The distinction is what the members _are_: a radio
group's members are N spellings of one value, so stopping on each would make the tab order describe the
options rather than the control, while a range's two thumbs are two values with their own names and their
own `aria-valuetext`, and a colour surface's two axes likewise. `Calendar`'s previous and next buttons are
the same call one level out — they are the consumer's own two `Button`s, so they are two stops because they
are two controls.

### The wrapper between a container role and its items is presentational

Settled **2026-08-10**, on the user's call, closing the structural item two components had hit.

`InteractionWrapper` owns its own root, so any component that wraps each item puts a div between the
container's role and the item's — `Select` between `role="listbox"` and each `role="option"`, `Calendar`
between `role="row"` and each `role="gridcell"`. The wrapper root now carries `role="presentation"`, which
removes its own semantics and leaves the container owning the items directly.

**It is a `getRole` prop defaulting to `"presentation"`, not a hardcoded attribute.** The default is what
fixes every existing consumer without each one remembering, and it is the honest default because the
wrapper is structural by definition: it paints nothing, means nothing, and holds no ARIA of its own.
Keeping it a prop leaves the door open for a container that wants the wrapper to _be_ the item — which is
the alternative that was rejected here, because moving `role="option"` up would take the id, the
`aria-selected` and the `aria-activedescendant` target with it, and that is a refactor rather than an
attribute.

**`role="presentation"` is only ignored on an element that is focusable or carries global ARIA**, and the
wrapper is neither, so it applies cleanly. The two rejected alternatives are worth recording: hand-rolling
each item's flags to avoid the wrapper is what _"the composition is an implementation detail"_ argues
against, and `aria-owns` on the container would state a relationship the DOM no longer shows — indirection
that rots silently the moment the markup moves.

**One residue, and it is the consumer's.** `Select`'s popup surround is the consumer's markup inside the
popover root, so a listbox still has a consumer div between it and the wrapper. The library cannot mark
that one, and it is the same category as the padding agreement `TextInput` records: where the consumer
supplies structure, the consumer owns its semantics.

### `SignalMirror`, and the form wiring finished

Settled **2026-08-10**, closing two unblocked items in one pass.

**Every control here owns its value as a `*Signal`, and a consumer who holds a getter plus a callback had
to build the same mirror by hand.** `PageTextField`, `PageSelectField`, `PageCheckField`,
`PageNumberField` and `PageColorField` were five copies of it, and the colour picker's hue slider made a
sixth. `SignalMirror.createMirror(getOuter, setOuter, opts)` is that mirror once, with
`createValueMirror` for the common case where nothing converts.

**It takes a getter and a setter rather than a `Signal`**, which is the escape hatch `review.md` named as
the alternative to a signal-only surface. A consumer who does have a signal passes its two halves; one who
has a store field, a route param or a callback passes those. The first attempt took a `Signal` and could
not express any of the Playground's own wrappers, which is what settled it.

**Each direction reads the far side `untrack`ed**, which is the whole reason this is worth extracting: the
two bugs the colour picker hit were both a mirror whose guard tracked the other side, so an unrelated
change re-ran it and wrote a stale half back. Writing that correctly once is worth more than the lines it
saves.

**It converts only when the value changes, so a half-written inner value survives.** Typing `7.0` into a
field mirroring a number leaves the text alone, because the number did not change — the same rule the hex
and date fields needed, now free for anything built on it.

**It is not unit tested, deliberately.** _"Unit tests: `vitest`, colocated, and only for functions"_ rules
it out — a mirror is two effects and a scheduler, not a function of its arguments. Its four consumers are
driven in `e2e/`, which is where its behaviour is actually observable.

**The form wiring is complete.** `Select`, `ColorInput`, `FileInput` and `Range` now read the description
context alongside `TextField` and `BinarySwitch`, so every control that can sit in a `FormField` points at
its message without the consumer wiring anything.

### A `Viewport` is a region, and it is terminal for everything inside it

Settled **2026-08-11**, from `ViewportPage`. A viewport fits the size it is designed for into **the space
it is given**: the root's space is the window, and a nested one's is the box the page puts it in. The app's
own viewport is not a special kind — it is the one whose region happens to be everything.

**The host is what clips.** Each viewport renders a host box — `overflow: hidden`, filling its container —
with the scaled design box inside it. Since every layer opened inside a viewport is portalled into _that_
viewport's own portal, one `overflow: hidden` is the whole of "nothing inside a viewport paints outside
it": a dropdown from a control in a nested viewport is clipped by that viewport, not by the window. A
nested one measures its host with a `ResizeObserver`, so the consumer sizes it with ordinary CSS and
nothing is passed in.

**Scale multiplies through and the rect is carried into window pixels.** A child was handed the innermost
scale while the screen showed every enclosing scale multiplied, so `getAdjustedBoundingClientRect` — and
through it every anchored layer — was wrong by the outer factor. `getScale` is now the parent's times its
own, and `getScaledRect` composes the host's client rect with the local fit through
`ViewportUtils.composeScaledRect`, which is unit-tested because it is plain arithmetic on plain rects.
That one is read rather than memoised: the host moves whenever anything above it scrolls, and it is what
every anchored layer measures against, once per frame.

**The transform stays local.** CSS already composes an ancestor's transform, so each root writes its own
`translate` and `scale` in its host's coordinates and nothing accumulates twice.

**An earlier attempt had a nested viewport fill its parent instead**, mounted into the parent's content box
by a portal. It was wrong for the case that matters: a viewport you cannot place is a viewport that cannot
be the boundary of anything smaller than the window, and the boundary is the whole point.

### The viewport is terminal, and an anchored layer tracks its anchor rather than polling for it

Settled **2026-08-11**, from three defects seen on `ViewportPage`.

**When perfect placement is impossible, the layer is clipped — never shrunk and never moved over the
anchor.** Three things could give when a layer does not fit: its size, its distance from the anchor, or
the part of it you can see. The library gives up the last one. `AnchorUtils.getBand` gives an `out`
placement only the space between the anchor and the edge it faces, and `clampToBand` pins the edge that
touches the anchor, letting the far edge run past the viewport where the viewport's own `overflow: hidden`
cuts it. An `in` or centred placement is deliberately over the anchor and gets the whole viewport.

Pinning the other end — `Math.max(band.start, ...)` in both directions, which is the obvious clamp — is
what makes a list with nowhere to go slide down over the field it belongs to. And capping the layer's
height to the band, which was tried first, is the same mistake in the other axis: a list that quietly
becomes a third of itself has answered a question nobody asked. A layer keeps the size its painter chose.

**Scrolling is listened for as well as polled.** `ElementObserver.createViewportRectObserver` measured
once per animation frame, which leaves a portalled layer a frame behind an anchor being scrolled. It now
also repositions from a `scroll` listener in the capture phase — the event does not bubble, so capture is
what hears a scrollable ancestor — and from `resize`. The frame poll stays, because an anchor can also
move under a CSS animation, which no event reports.

**A portalled layer is placed by `transform`, not by `top` / `left`.** Writing offsets forced layout on
every frame of a scroll; a translate is composited. Both roots therefore pin to `top: 0; left: 0` — an
absolutely positioned box with `auto` offsets would otherwise fall at its static position, which for the
second layer in a portal is not the first layer's.

**A nested viewport is opaque.** `viewportNestedRoot` carries a `z-index` above the parent's own portal
layer, so nothing behind a nested viewport paints through it and nothing behind it can be pointed at.
Together with the root's `overflow: hidden` and each viewport portalling into itself, that is the whole
of "a viewport is a black box": nothing inside it escapes its bounds, and nothing outside it shows
through. `viewport.spec.ts` drives all three.

### A masked field never spells a value approximately

**The rule.** Given a value its mask cannot hold, a field shows nothing and raises `getHasError` — it is
stating that something is held which it cannot show, which is the only honest reading of a blank box that is
not empty. Truncating the digit run, clamping the value or dropping a sign each produce a _different_
well-formed value that the field would then parse straight back, so the corruption survives a round trip
without anything being raised.

Written down after exactly that: the old signed-year `DateValue` accepted any year, `toIso` spelled one
outside 0..9999 in ISO's expanded form, and `DateInput`'s four digit slots laid the longer run into the mask
regardless — pushing every later part along, so 15 August 44 BC read as `0440-81-5`.

**Where the check belongs, when one is needed.** Not in the mask. `TextSyncUtils` is told a pattern and a
digit run and has no idea which digits were the year, so only the control that built the pattern can know the
run is too long for it. And the text-to-value effect has to stand down while an unspellable value is held, or
the blank text it just produced parses as "no value" and clears the consumer's — turning a display bug into
data loss.

**`DateInput` needs no such check any more, because the value type stopped being able to hold one.** A
`CalendarDate`'s year is a year _within an era_ and every supported calendar bounds it at four digits, so
`getYearsInEra` is at most 9999 and a date the four slots cannot spell no longer exists. The rule stays
written down because the formatted number will meet it again — see `review.md`.

**The rule has one accepted exception, and it is deliberate rather than overlooked.**
`DateValueUtils.withCalendar` clamps when the target calendar cannot hold the date, and says nothing. Left
alone by the user on **2026-08-11** with the cost of fixing it written out; it sits in `review.md` under
_"Accepted limits"_, and is named here so the rule above is not read as absolute.

### The date value carries its calendar system, and every bound is asked of it

Settled by the user on **2026-08-11**, choosing to take `@internationalized/date` as a dependency rather than
read the calendars out of `Intl` by hand, and to support as many calendar systems as the package really
implements. The reasoning that led there — what the platform contains, what the reverse conversion costs, why
`chinese` cannot be done this way — was measured and is recorded in the entry below and in `review.md`.

**`DateValue` is `CalendarDate`, aliased rather than wrapped.** So a value carries the calendar it belongs to,
an era, a **year within that era**, a month index and a day. The old `{ year, month, day }` record with a
signed year is gone, and with it every constant the library used to hold about what a year is made of: month
count, month length, month names, grid row count and year ceiling are now questions asked of the value's own
calendar through `DateValueUtils`. Aliasing rather than wrapping is deliberate — a wrapper would have to
re-expose `add`, `set`, `cycle` and `compare` to be useful, and would then be a second date library.

**Thirteen calendars, and the list is explicit rather than the package's own.** `createCalendar` does not
refuse an identifier it has no implementation for: asked for `chinese`, `dangi`, `islamic` or `islamic-rgsa`
it returns a **Gregorian** calendar, so a consumer would get Gregorian dates labelled as something else and no
indication of it. `DateValueCalendarId` therefore names the thirteen that map to themselves, and
`getCalendarIds` is what a consumer offers in a picker. The lunisolar calendars are excluded rather than
half-supported, which is the same call as `Table` being out of scope: a thing that looks supported and is not
costs more than a thing that is absent.

**An era is a list the calendar reports, never a pair.** `getEras` returns `{ id, name }` for each — two for
Gregorian, one for Hebrew, five for Japanese. The names are not in the package, so they are read back out of
`Intl` by formatting a date inside each era with `era: "long"`; finding a date inside era _n_ is a bisection
over the ISO year, since era index is monotone in time, and the result is cached per calendar and locale. A
BC/AD toggle was proposed first and withdrawn: it is one calendar's model, and hardcoding it would have put a
Western assumption into a control's API.

**The era is a control in `DateInput`'s leading slot, not a slot in the mask.** Exactly the arrangement the
am/pm segment already has in the trailing slot, and for the same reason — the mask carries digits only, an era
identifier is not digits, and a consumer paints it. `DateInput` hands `renderLeading` a `DateInputEra` with
`getValue`, `getOptions` and `set`, so the painter can draw a cycle button, a select, or nothing at all when
the calendar reports a single era. The Playground draws a cycle button and hides it below two eras, which is
also what React Aria does with its era segment.

**The signed year is gone, and that is a gain rather than a loss.** A year before the common era is now
`era: "BC", year: 44` — no negative numbers, and no off-by-one at the origin to get wrong, because ISO's
astronomical numbering (where year 0 is 1 BC) is the package's problem and stays inside `toIso` / `fromIso`.
The cost is that a year past the end of an era, 12026 AD, can no longer be _held_ at all: the constructor
constrains it to 9999 silently, so `fromIso` and `fromParts` compare the built fields back against what was
asked for and return `undefined` rather than passing a different date on. **Anything built over this package
must do that comparison** — `new CalendarDate(2026, 2, 31)` is February 28th, not an error.

**`getMonthGrid` takes an anchor value rather than a year and a month number**, because a month index means
nothing without the calendar it indexes. It still returns **six** week rows for every month of every supported
calendar — the fixed height is deliberate and predates this work, so that paging never reflows the page around
the grid — and six is enough because no supported calendar has a month longer than 31 days.

**Two dates are the same day if they denote the same day, whatever calendar each is in.** `isSame` and
`compare` go through absolute day, so a Gregorian `min` bounds a Hebrew value, and a selected date held in one
system is found in another system's grid. `DateInput` converts a value into the calendar it is configured for
rather than refusing it, so a consumer may hold Gregorian and show a Hebrew field over the same signal.

### `MaskedField`: the half every field over a typed value shares

Extracted **2026-08-12**, once `DateInput` and `TimeInput` had written the same thing twice and a formatted number
was about to write it a third time. `Abstracts/MaskedField` owns the private text signal, the effects that keep it
and the value in step, and the three moments at which a field reports a problem. What stays in each control is
what differs: its codec, its bounds, and whatever control it puts in a slot.

**The value arrives as a getter and a setter, not a `Signal`.** A control may not hand its own prop through
unchanged — `DateInput` converts the value into the calendar the field types in first — so the field cannot own
the signal. Same shape as `SignalMirror`, same reason.

**Completeness is counted in digits, and may be absent.** Only digits are typed, so a half-typed value is one
whose digit run is short; measuring the _text_ instead happens to agree while every group is a fixed width and
stops agreeing the moment one is not. `getDigitCount` returning `undefined` says the field has no notion of
half-typed at all, which is the honest answer for an amount — every digit run is a value.

**The spelling follows the formatting as well as the value, and that needs its own effect.** Nothing else
catches a change of format on its own: switching an amount field's locale leaves the value and the digits exactly
as they were, so the effect comparing them stays quiet and the field goes on showing the old punctuation. The
text is rebuilt **from the value** rather than from the digits on screen, because the same six digits are
`1,234.56` at two decimal places and `123,456` at none — the value decides which.

**A control must not keep a second copy of something the value already carries.** `DateInput`'s era signal is
state _only_ for the empty field, and `fromDigits` reads the era off the held value. Reading the signal instead
made the two fight: moving the era commits a new date, the new date re-spells the text, and the text-to-value
effect then re-derived a date from those digits and the signal — which had not caught up — committing the old era
straight back. Duplicated state plus two effects is a loop.

### `TextField` takes a mask transform, not a pattern

Changed **2026-08-12**, when the grouped number became the third consumer. `computeMaskedText(previous, next,
caret)` replaces `getMask`: a pattern mask and a grouped number are the same function with a different body, and a
grouped number has no pattern to state because it has as many separators as its value needs. The transform stays
where `getMask` was — inside `TextSync.createValueSync` — because _"a mask owns the caret"_ is unchanged, and a
transforming setter still cannot move a caret it never saw.

### Controls: `AmountInput`, and why it is not `NumberInput` with grouping

Settled by the user on **2026-08-12**, choosing a separate control over widening `NumberInput`.

**The two fields are typed differently, not styled differently.** `NumberInput` refuses characters one keystroke
at a time and keeps `-`, `1.`, `1e` and `1e-` typeable on the way to a number. `AmountInput` accepts digits only
and fills a fixed fraction from the right, so `1`, `2`, `3` walk `0.01`, `0.12`, `1.23`. Neither behaviour is a
mode of the other, and moving `NumberInput` onto the mask path to get grouping would have risked a shipped
control for a field it is not.

**The digits are the value in its smallest unit, and the shift is done on the decimal spelling.** Multiplying is
the obvious way and rounds the wrong way at exactly the cases a money field exists for: `1.005 * 100` is
`100.49999999999999`, so a rounded product loses the penny, and `toFixed` inherits the fault. `${value}` prints
the shortest decimal that reads back as the same number, so moving the point along that string rounds on what the
consumer wrote rather than on its binary approximation. A magnitude that prints in exponential form falls back to
multiplying; an amount field is not where `1e21` belongs.

**The separators come from the locale, not from props.** `Intl.NumberFormat` already knows them and the consumer
has already said which locale they are in; asking twice invites the two to disagree. `getGroupSize` stays a prop
because it is a layout choice rather than a locale fact — and because uniform groups are all `applyGroupedMask`
can express, which is the limit `review.md` records.

**There is no sign and no currency symbol.** The mask is digits-only, so a negative amount cannot be typed; the
symbol is paint in a leading slot, because a library holding no colours does not hold currencies either.

### An era is named from year 2, not from its first day

Settled **2026-08-12**, from a defect that survived two wrong fixes. `getEras` needs a date to format each era's
name from, and the era's own first day is the one date that does not work: the package puts Meiji 1 at 1868-09-08
while ICU switches on the proclamation date weeks later, so formatting the first day reports the era _before_ it
and Meiji came out named "Keiō (1865–1868)". Year 2 is a full year clear of the boundary and works whichever way
an era counts — forward for Meiji, backward for BC, where year 2 is earlier rather than later.

**Every instant handed to `Intl` is taken at midday.** A `CalendarDate` becomes an instant at local midnight, and
midnight is the one moment that does not survive the trip: a daylight-saving change can put it on the previous
day, and a pre-standard-time zone offset is not even a whole number of minutes. This is what the pre-package
`DateValue` did, it was dropped in the rewrite, and it is back.

**An era carries a long name and a short one.** `DateValueEra` is `{ id, name, shortName }`: the identifier is
the package's and is not display text — it is `BC`, `meiji`, `before_minguo`, with no casing convention and an
underscore in one of them — while both names come from `Intl` and are the locale's. A compact control shows
`shortName` and labels itself with `name`. Nothing may render `id`.

### A popup's open state is private until a consumer asks for it

Settled by the user on **2026-08-12**, closing the `openSignal` question that items 5, 6, 7 and 15 of `review.md`
had all been waiting on. `Select`, `MultiSelect`, `Menu`, `ColorInput` and `DatePicker` each take an optional
`visibilitySignal`, which is `Modal`'s prop under `Modal`'s name and rules.

**One variable, both sides write.** That is the `*Signal` convention rather than a new idea, and `Modal` already
proved it on this exact kind of state: it reads `visibilitySignal` and writes `false` into it when it dismisses
itself. A popup opens and closes for its own reasons — a query typed, an item picked, Escape, focus leaving — so a
one-way "here is a boolean, obey it" prop would fight the component. The consumer who has no signal to hand over
uses `SignalMirror`, which is what it is for.

**`SignalMirror.createOptional` is how a control stays private by default.** It returns the signal the component
was handed or one of its own, reading the prop through on every access, so there is one code path rather than a
branch at every use. Without it each of the five would carry "the shared one if I was given one, otherwise mine",
five times over.

**Every side effect of opening or closing hangs off the state, never off the path that changed it.** This is the
part that is easy to get wrong and the reason the change touched more than five prop types. `Select` cleared its
highlight inside `close()`, `DatePicker` moved its calendar to the value's month inside `open()`, and `Menu` set
the initial highlight position inside `open(position)` — all invisible to a consumer writing the signal directly.
Each moved into an effect keyed on the open state, so a popup closed from outside ends up in the same condition a
click outside would leave it.

**An invariant the component owns is enforced against the state too.** A disabled control cannot be open:
`open()` already refused, but a consumer writing `true` bypassed it, so `Select` and `Menu` now write `false`
back — the same correction `Modal` makes for its own dismissal.

**What this does not buy is an opener the dismiss layer knows about.** A consumer's own button sits outside the
popup, so pressing it while the popup is open dismisses the popup first and the handler then re-opens it: a
toggle button appears not to close. The Playground demonstrates open and close as two separate buttons for
exactly that reason. Fixing it means `Menu` accepting an anchor and an opener, which is the next thing
`review.md` item 6 asks for and is not this.

### Playback is a signal; a rewind is a command

Settled by the user on **2026-08-12**, applying the argument that had already retired the controller shape twice —
for `Toasts` and for `Calendar` — to the components that still carried one.

**Whether a thing is playing is state, so it arrives as `playbackSignal`.** `CellAnimation` and
`ScanlineAnimation` had `start()` / `stop()` on a handle given out at mount, and both were literally
`setIsPlaying(true)` and `setIsPlaying(false)` over a private signal. `AudioSwitcher` had `play()` / `pause()`,
which is the same state behind a pair of fades. All three now take an optional `playbackSignal` through
`SignalMirror.createOptional`, so the state stays private until a consumer asks for it.

**What that buys is visible in the Playground rather than in the API.** Both animation pages used to collect a
controller per mounted instance into an array and call `start()` on every one of them when the stress-test modal
closed. They now share one signal and write it once, and nothing has to still be mounted for that to work — which
is the same argument the `Toasts` entry makes about a queue.

**A command that is not a state stays a handle handed over at mount.** `Typewriter` keeps `restartAnimation` and
`update(cause)`, and `AudioSwitcher` keeps `reset`. Restarting an animation and rewinding a track are not values
anyone can read; they are requests, and the reason they cannot be faked with a signal is timing. Restarting means
the element must be **painted** in the pre-animation state for one frame before the animation is re-applied, and a
consumer toggling a signal off and on — even across a `setTimeout(…, 0)` — is not guaranteed that frame, because
the browser may fold both changes into a single paint. That is the same hazard `ElementFader` documents, and it
fails intermittently rather than outright, which is worse. The frame discipline belongs inside the component that
already owns the animation.

**So the boundary is: can a consumer meaningfully read it?** Playing, open, selected, expanded — state, and a
`*Signal`. Restart, rewind, re-measure — commands, and an `onMount` handle. Two of the four components turned out
to need both, so the controller shape is not a legacy to be finished off.

### A popup's anchor is also its dismiss root, which is what lets a consumer's own button toggle it

Settled **2026-08-12**, finishing what `visibilitySignal` started. `Menu` takes an optional `getAnchorRef` and
positions its popup against that element instead of against its own trigger.

**The positioning is the smaller half; the dismissal is the point.** `Popover` already builds its dismiss layer
roots as `[the popup, the anchor]`, so whatever element is the anchor is inside the layer and a press on it is not
an outside press. Before this, a consumer's own toggle button was outside: pressing it while the menu was open
dismissed the menu and the handler then re-opened it, so the button appeared not to close. Making that button the
anchor fixes it without `DismissStack` learning anything new — the mechanism was already there and the anchor was
simply always the trigger.

**A split button is now a composition rather than a missing feature.** The arrow half is the anchor, the main half
does its own work, and the consumer's own signal opens the menu.

**A right-click context menu is still not possible, and the reason is worth stating**: it opens at the pointer
rather than against an element, and `Anchor` positions against a ref only. That needs a virtual anchor — a rect
standing in for an element — which is a change to `Anchor` rather than to `Menu`, and it is the last piece. See
`review.md` item 6.

### A list the consumer has not finished handing over: `getHasMoreOptions`, `onReachEnd`, and a marker

Settled **2026-08-12**, after the published virtualization design was tried and reverted (see `review.md`
item 5). This is the other half of the same problem and it is a different answer, so both are worth stating
together: **virtualization keeps the whole list and mounts a window onto it; this keeps only what has arrived
and mounts all of it.**

**`Select` takes `getHasMoreOptions` and `onReachEnd`, and never a batch size.** A batch size would put the
library in charge of slicing the consumer's data, which is not its to slice, and the floor a batch size wants —
"at least as many as fit" — is not computable here anyway: the element that scrolls is the **consumer's** popup
surface, since the `max-height` and the `overflow-y` live in their paint. `Select` holds no ref to it. So the
library reports an event and reads a flag; the consumer decides what a batch is, where it comes from, and when
there is no more. An in-memory array sliced by the consumer and a paged HTTP endpoint are then the same
mechanism rather than two features.

**The end is marked by a one-pixel element and watched with an intersection observer, not measured.** The
alternative was a `scroll` listener comparing `scrollTop + clientHeight` against `scrollHeight`, and it loses on
three counts: it needs the scrolling element, which is the consumer's; it needs a "how close counts" threshold,
which is a constant that is wrong for some row height; and it is silent in the case where the first batch does
not fill the box, because nothing has scrolled. The marker has none of those — `ElementObserver.createViewportIntersectionObserver`
observes against the viewport, and an observer computes intersection through every ancestor's overflow clip, so
it reports the marker hidden without ever being told what is hiding it. "The list is too short to scroll" and
"you have scrolled to the bottom" become the same condition, which is what makes it converge with no startup path.

**The marker overlaps the last option rather than following it, and the keyboard is the reason.** A negative
top margin equal to its own height puts it on the last pixel _of_ the list instead of the first pixel _after_
it, so it costs no layout. It shipped on **2026-08-12** as a plain trailing element and that does not work for
anyone not using a mouse: an option scrolls itself into view with `block: "nearest"`, which stops the moment
that option is fully visible and never goes further, so a marker beyond the last option is exactly the thing
`End` and the last `ArrowDown` can never reveal — the highlight lands on the last option held and no batch is
ever asked for. Overlapping it makes "the last option is on screen" and "the marker is on screen" the same
fact, which is the condition the observer was always meant to be reporting, and the mouse path is unchanged
because scrolling to the bottom still crosses it.

The reason this was not caught by the suite is worth keeping too: at a scale of exactly 1 the marker's top
edge lands on the scroll box's bottom edge to the pixel, and Chrome reports that zero-area contact as an
intersection, so the batch arrives and the spec passes. The Playground is scaled by `Viewport` and is almost
never at a scale of 1, and at any other scale the contact misses by a fraction. **A behaviour that depends on
two edges being equal is not a behaviour**, so the spec now asserts the overlap itself rather than the batch
that follows from it.

**The Playground does not skip painting off-screen options, and the reason is that it moves the list under the
reader.** The option paint carried `content-visibility: auto` with an estimated row height behind a panel
switch, which lets the browser skip laying out and painting rows nobody can see. The estimate is a single
number and the rows are not one height — a title alone is short, a title with a wrapped description is not —
so the moment a jump to the end forces the skipped rows to be laid out for real, every height above the
highlight is corrected at once and the scroll offset no longer points where it did. `End` then leaves the
highlighted option below the visible box, having scrolled to where that option used to be. The user removed
the switch on **2026-08-13** for that reason. What it bought was the cost of _painting_ options, which is a
different cost from _mounting_ them and the smaller of the two; `review.md` item 5 holds what is left of that.

**The marker is keyed on the options array, and that is load-bearing.** An intersection observer reports only
_changes_, so a batch too small to push the marker off screen would deliver no callback and the list would
stall. Rebuilding the marker whenever the array identity changes forces a fresh observation of fresh geometry;
`createViewportIntersectionObserver` sets its flag back to `false` on every re-registration for the same reason,
so the answer is never carried over from an element that no longer exists. Reading the flag synchronously after
a batch arrives — before the observer has recomputed — is what the earlier attempt did, and it fetched one batch
more than it needed every time.

**The guard holds the options array itself, not its length, and it is a plain variable rather than a signal.**
Nothing renders from it. Its job is to stop a marker that leaves and re-enters while a request is in flight from
asking twice for the same list, and the array's identity is exactly what "the same list" means. Length is not:
a **filtered** list is replaced rather than appended to, so a new query whose result happens to be as long as the
last one asked for would be read as already asked and the list would never load. That is reachable the moment
autocomplete and batches are combined, which is the arrangement the Playground now demonstrates. The guard is
cleared when the popup closes, so a reopened short list can ask again.

**Filtering and batching compose without either knowing about the other.** The query is the consumer's, the
batches are the consumer's, and the library only reports that the end of what it holds is on screen. A consumer
who wants the server to filter runs a new search on a query change and replaces the array; `onReachEnd` then pages
within that query. Nothing in `Select` needed to learn what a query means to a batch. Note that `Home` and `End`
are already suppressed on a filterable field so the caret keeps them, so the wrap rule below is the only keyboard
behaviour that applies to a fetched autocomplete.

**An incomplete list does not wrap, and that is `Select`'s call rather than `NavigationUtils`'s.** The 1D walk
still answers _which position is next_ and still wraps; `Select` answers _whether to go there_, and refuses when
the step would carry off either end while more options exist. That is the split recorded under _"The 1D walk is a
pure function, not a hook"_, and it is why no option was added to `computeNextPosition`: three of its four callers
are closed rings and would gain a mode they can never use. `Home` and `End` needed no change at all — they resolve
against the array the library was handed, which is exactly "the first and last held".

**What this does not do is make a complete list cheap.** A consumer holding 100,000 options in memory and slicing
them gets a list that opens quickly and grows as it is read, at the cost of `End` meaning "the last one loaded".
For a list that genuinely is all there, that is the library declining to know something it knows. The user took
that trade on **2026-08-12** for the incomplete case, which is the case this is built for.

### A list too long to mount: `computeEstimatedOptionHeight` and `Abstracts/Virtualizer`

Settled **2026-08-13**, on the second attempt. This is the answer for the complete list the section above
declines: **on-demand loading answers a list that has not all arrived; this answers a list that has all
arrived and is too long to build.** They compose, and neither knows about the other.

**Passing an estimated height is what turns it on, and a list short enough not to need it should not pass
one.** The user's rule: under a couple of hundred options there is nothing to win, and the cost is real —
a windowed list is placed from measurements that arrive late, so it accepts imprecision to buy back time
that was never being spent. There is no boolean and no automatic threshold, because a threshold would be
the library guessing at a row height it has never seen.

**The estimate belongs to the consumer because the height is a consequence of `renderOption`.** The library
paints no option and therefore cannot know how tall one is. It is per index rather than one number, so rows
that come in two known shapes can be answered separately. It is consulted only for rows nobody can see —
every row on screen is measured for real — so what it actually buys is an honest scrollbar before anything
has been scrolled. TanStack's advice is to estimate the **largest** plausible row so the guess errs one way
and the list only ever settles upward; that is the note this repo would otherwise have learned by shipping it.

**`@tanstack/solid-virtual` is a runtime dependency, and it is marked external rather than bundled.** The
first attempt on 2026-08-12 took a package out again; this one keeps it, on the user's call that a dependency
is acceptable for exactly this kind of functionality, the same call `colorthief` already carries. External
rather than bundled follows `colorthief` too: a package that is both inlined into `dist` and declared in
`dependencies` makes a consumer install a copy they never load. Note that `@internationalized/date` is still
bundled while being declared, which is the older half of that inconsistency and has not been argued.

**The windower lives inside `Select`, and that is the whole difference from the attempt that failed.** The
2026-08-12 design had the **consumer** window the list and hand over only the visible slice, so `Select`
walked the slice: `Home`, `End` and the arrows were confined to whatever happened to be mounted. Holding the
whole array and mounting a window onto it leaves `getFlatOptions`, the navigable set and the whole keyboard
model untouched — only what is in the document changes. Nothing about the keyboard needed rewriting.

**A grouped list is not windowed, and that is a boundary rather than a preference.** A group's box wraps the
options inside it, so a window opening halfway down one would have to draw a box for a group whose header is
above the window and whose end is below it, and repeat the header as the reader scrolls. Passing an estimate
for a list that contains a group mounts everything, silently and correctly.

**Four things had to be answered that the package's own documentation does not cover, all of them from the
same root: this library is a guest inside somebody else's popup.**

- **Solid runs a `ref` while the element is still being built.** The measurer identifies a row by reading an
  index attribute off the node it is handed, and at `ref` time the attribute is not on it and the node is not
  in the document — so measuring from the `ref` reads an unnamed, unlaid-out element and silently keeps the
  estimate. Rows then tile on the estimate rather than on their real heights, and a row taller than its slot
  paints over the one below. The index is written onto the element and the measurement deferred to mount.
  React's adapter never meets this because React runs refs after commit; nothing warns about it.
- **The rows' container does not start where the scrolling starts.** Row offsets are measured from the top of
  the container the library owns, a scroll position from the top of whatever is scrolling, and between them
  sits however much border and padding the consumer put on their popup. Unset, every scroll target lands short
  by that inset, which reads as an arrow key stopping one option before the one it highlighted. `scrollMargin`
  is the package's own answer; the offset has to be worked out in layout space rather than off the raw client
  rects, because `Viewport` scales the page.
- **A highlighted row must be mounted whether or not it is in view.** `aria-activedescendant` names an element
  by id, and scrolling to a row is not the same instant as mounting it, so the name refers to nothing until
  the window catches up. The row carrying the highlight is pinned into the range.
- **An option can no longer scroll itself into view**, because until the window reaches it there is nothing to
  scroll. The move belongs to whatever owns the window, and it hangs off the highlight as an effect rather
  than off the key handler, so a highlight arriving any other way — a pick in a multi-select, a list opening
  onto a selection — is carried the same way.

**What it is worth, measured on the Playground's stress card at 10,000 options**: 792 ms from click to the
first painted frame with every option mounted, against 71 ms with a window of four. Frame rate while open was
never the problem and is unchanged. The remaining cost at open is linear but has no DOM in it — building the
records, flattening them, finding the navigable ones — and that is the floor a windower cannot lower.
