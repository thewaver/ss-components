# Conventions

Settled decisions and the reasoning behind them, so they are not re-litigated. This is what would
otherwise be code comments. Open problems are in `backlog.md`; nothing here is a task. How to work
with the user is in `CLAUDE.md`.

Most of this is about `src/Lib`, the part with a contract. Repo-level sections come first.

## Repo

### The three trees

`@thewaver/ss-components` is a SolidJS component library plus a Playground app documenting it.
Vanilla-extract for styles, Vite for both builds.

- **`src/Lib`** — the published library, and the only tree with a support contract (see
  _"Compatibility arguments"_).
- **`src/Playground`** — the demo app. Every consumer-side painter lives in `App/StyledComponents`,
  named `<LibComponent>Content` after the shell whose slot it fills, with the playground-wide `Page`
  prefix: `PageButtonContent`, `PageCheckboxContent`, `PageTooltipContent`. `App/PageComponents`
  holds the playground's own furniture: `PageVariants`, `PageExamples`, `PageCodeBox`.

**The line between the two folders is the library, not the shape of the thing.** Anything that
dresses a library component belongs in `StyledComponents`, even when it is not a `renderContent`
painter and even when it composes several controls — `Field`, `ColorChannels`, `CalendarCaption`
and `LabelCaption` sat in `PageComponents` until on the grounds that they were
compositions rather than paint, which was the wrong test. `PageComponents` is what the Playground
would still need if the library did not exist. The `<LibComponent>Content` naming is for slot
painters only; these keep the name of the thing they are.

- **`e2e/`** — Playwright interaction suite. Imports from neither tree; drives the built Playground in
  a real browser. See _"Verifying interaction"_.

### Layering

`Abstracts/` renders no DOM (namespaced utils, hook-like factories). `Fundamentals/` renders DOM.
`Composites/` combines Fundamentals. `Fundamentals/Input/` groups controls carrying a user-editable
value (see _"Folder layout"_). `src/Lib/index.ts` enumerates every export path individually and stays
sorted — not a barrel.

**`Composites/` is not exported, and neither is `BinarySwitch`.** A composite demonstrates how
Fundamentals combine rather than owning a contract, so shipping one would freeze a composition the
consumer is better off writing — `Surface` is exercised in the Playground and reachable from source,
which is its whole audience. `BinarySwitch` is internal because `Checkbox`, `Toggle` and `Radio` are
its presets; only `BinarySwitch.types` ships. Stated because a missing export reads as an oversight —
it has been reported as a bug once.

### What goes to `ss-utils` and what stays here

Settled by the user, when `@internationalized/date` was taken as a dependency.

**`ss-utils` is bare: it implements logic on top of nothing.** That is the line, not "maths versus
layout". A primitive needing only the language belongs there. A module adapting a third-party package
to this library's shape stays here however mathematical it looks, because sending it would put a
dependency inside a package whose value is having none.

So `Abstracts/DateValue` wraps `@internationalized/date` from inside `src/Lib`. Pure formatting or
numeric helpers are candidates for `ss-utils`; anything importing the date package is not.

### What went to `ss-utils`, and what was weighed and kept

An extraction round ran: candidates were staged in a temporary `src/Extract`, the
user lifted what they wanted, the folder was removed. Recorded so the next round starts from the
argument rather than the survey.

**Left**: `Audio`, `ColorValue` (now `Color`, a namespace per colour space), `Decimal`, `Matrix3` (now
`Matrix3d`, over a `Point3d` rather than a tuple), `TimeValue` (now `TimeUtils`). `MathUtils` gained
`clamp`, `clamp01`, `normalize`, `lerp`, retiring sixteen hand-written `Math.min(Math.max(…))` clamps
across ten files — **nobody should write that expression again.** Four collapsed further to
`clamp01(normalize(…))`; `Progress` keeps its own guard, because its zero-span answer is `1` where
`normalize` reports `0`, and that choice is the caller's.

**Kept, with the shape each would need first.** The user's verdict: the remainder still feels
component-driven. Not outstanding work — the argument, so it is not re-derived.

- **`TextSyncUtils`** is ready as it stands: string and caret arithmetic, no DOM, and a mask engine is
  normally its own package. Needs a name that is not "syncing a text field".
- **`DismissUtils.getIsWithinOwnedLayer`** is ARIA-aware DOM containment with nothing about dismissal
  in it; `DOMUtils` is where that belongs.
- **`AnchorUtils`** is "align one rect to another along an axis, in/out/center, then fall back to the
  variant that fits". `Rect`, `Bounds` and `Dir` already say that; the `AnchorHPlacement` vocabulary is
  the component-driven half, and dropping the word anchor **is** the abstraction. `getStackingBase`
  stays behind either way.
- **`ElementHighlightUtils.getSegmentRects`** computes the eight regions left when one rect is
  subtracted from another — general, except it returns CSS strings. Returning rects is the change, and
  it is why the function has no unit test: geometry cannot be asserted on a string.
- **`CellAnimationUtils`** is two things. `assignAnimationProps` writes ordered transforms and filters
  onto an element and already reads `CSSConst.ANIMATION_UNITS`, so it is the missing writer half of
  something that package owns; the four parity predicates are grid tiling and belong with the weights.
- **`SlideButtonUtils`** and half of **`CellAnimationWeightUtils`** mostly dissolved into `clamp01` and
  `normalize`. What is left of the first is a thumb sliding in a track, which is `SlideButton`'s.
- **`radar` and `spiral` should not go at all**: four multipliers named `cdoMul`, `croMul`, `cuoMul`,
  `cloMul` — real algorithms behind a signature only their one caller can read.
- **`RotationUtils.wrapIndex`** qualifies on the test — it needs only the language — and is staying here
  anyway. The user's call, and the reason is practical rather than architectural: `ss-utils` is not cloned on
  the machine this is being written on, so the move is deferred for the foreseeable future. It has one
  implementation here and two callers, which is the whole of what the move would have bought.

**Never staged, by category**: anything shaped around a component's own record (`SelectUtils`,
`TreeUtils`, `ToastsUtils`); anything bound to a framework (`Interaction`, `Focus`, `FPS`,
`ElementFader`, the three SVG defs modules returning JSX — the arithmetic item 11 in `backlog.md`
wants split from its markup, which would make the arithmetic half a candidate); anything adapting a
third-party package (`DateValue`, `Virtualizer` over `@tanstack/solid-virtual`); and three near misses
blocked only by a pure type sharing a file with Solid props — `NumberInputUtils`,
`RichTextUtils.parseContent`, `compileStops` / `sampleTrack`.

### Look in `ss-utils` before writing anything general-purpose

Asked for by the user. `ss-utils` is a dependency of this repo by the same author and already holds
a lot. Re-implementing something it exports is the easiest waste to commit and the hardest to notice,
because the duplicate works.

**The trigger is the shape of the code, not the name of the file.** Most utils start as three lines
inside a component, so "I am not writing a utility right now" is the wrong test. The real test:
**could this function be given a name and a couple of arguments and still make sense with nothing
around it?** If yes it is general-purpose, whatever file it is in. The user's example — comparing two
arrays by an id on each element — is not in `ss-utils` and is still that shape.

Aimed at the things that read as small enough to just write: clamping, rounding to a step, comparing
rects, spreading a padding, kebab-casing, picking a random element, deduplicating, formatting a number.
Several are already there — `MathUtils`, `RectUtils`, `CSSUtils`, `StringUtils`, `RandomUtils`,
`PolygonUtils`, `ShapeUtils`, `BitwiseUtils`, `FunctionUtils`, `DOMUtils`, `SVGUtils`, `IOUtils`,
`KeyframesUtils`, plus `Point2d`, `Vec2d`, `Vec4d`, `Rect`, `Bounds`, `Size2d`, `Dir` and `Count`.

**How to check, in order**: pick the namespace it would belong to; read that namespace's file under
`node_modules/@thewaver/ss-utils/dist`, small enough to read whole; grep the export list for the noun
rather than the verb, since the package names things after what they operate on. Only then write it. If
genuinely absent, it is a candidate to go _to_ `ss-utils` — see the section above for which side of the
line it falls on.

### House style

`const DEFAULT_X = …` at module scope, `createMemo` for derived props with a default, one blank line
between logical blocks, no destructuring of `props`. Types live in the owning component's own
`<Component>.types.ts` — never in a shared per-directory types file, even when several siblings consume
them. `StressTestDefs` beside `StressTestProps` is the precedent; a shared `Xs.types.ts` is to be
unwound rather than extended, and names drop the redundant directory prefix (`ExampleDefs`, not
`PageExampleDefs`).

Read a neighbouring component before writing a new one.

### Commands

```bash
npm run build:lib # vite lib build + tsup.d.ts emit
npm run build:playground
npm start # dev server
npm test # vitest, the pure-function half
npm run verify:dom # playwright: build the playground, then drive it in a real browser
npm run format # prettier, 4 spaces, 120 cols, import sorting
npx tsc --noEmit -p tsconfig.json
```

### `external/` is a drop-zone, and every tool is told to leave it alone

The user's convention, from the second migration of code written elsewhere. Code to be brought in is dropped
in `external/` at the repo root, read, ported, and then deleted — but **the folder itself stays**, so the next
migration has somewhere to land.

**It is outside every tool, and the entry in `.gitignore` is what does most of the work.** Prettier 3 reads
`.gitignore` as well as `.prettierignore`, so one rule covers formatting and version control together and there
is no second list to keep in step — worth knowing, because `npm run format` is `prettier --write .` and would
otherwise reformat and re-sort the imports of code that has not been read yet. `tsconfig.json` and
`vitest.config.ts` name it as well: both already worked from a whitelist that could not reach it, and the
explicit exclusion is there so somebody looking for the rule finds it where they look.

**`external/*` with `!external/.gitkeep`**, rather than ignoring the folder, because git tracks files and not
directories: a plain `external/` entry would mean the folder does not exist in a fresh clone.

**The contents are nobody's contract.** They are a foreign framework's code, kept only long enough to read, so
none of the rules about `src/Lib` apply to them — not the comment ban, not the house style, not the export list.
Nothing in `src` may import from there.

### A file in transit sits commented out, rather than excluded in config

`src/Lib/JSXTextParser.utils.ts` is not this library's code and is not compiled. It is a copy of `ss-utils`'
parser carrying a fix that has to be applied in that repo, parked here so it survives a change of machine, and
**every line of it is commented out** — the user's instruction, and the reason is that the alternative leaves
litter: a `tsconfig.json` exclusion outlives the file it was written for, and the next person to read the config
finds a rule pointing at nothing. A commented file needs no rule at all, and one editor keystroke over a
select-all restores it.

**Line comments, not a block comment**, because the file carries `/** … */` documentation of its own and the
first `*/` inside would close the wrapper early.

**It is committed rather than ignored**, unlike `external/`, because the whole point is that it travels.

### Compatibility arguments cite `src/Lib` and nothing else

When arguing a modern CSS or JS feature is safe here, **only `src/Lib` counts** — it is the published
package and the only thing with a support contract. `src/Playground` is a harness and
`src/Playground/App/Samples` is scratch content; citing either is not an argument.

**A use that carries a fallback is not evidence for a use that doesn't.** Relative colour syntax
appears 71 times in Samples and twice in `src/Lib`, both in `Composites/Surface/Surface.css.ts` and
both in vanilla-extract's array-value form — `backgroundColor: [fillColorVar, "rgb(from …)"]` — which
emits the plain variable first, so an engine that does not understand the newer syntax keeps a working
colour. That is graceful degradation, not a hard dependency. Check where the feature actually lives and
whether existing uses degrade; if the new code has no fallback, say so.

### Consult WCAG before settling any interaction, and say what it said

Asked for, after checking WCAG on `SlideButton` turned a settled decision into a
conformance gap nobody had noticed. **At the very least, look it up** — not after the argument, not as
a review pass, not only when a control looks unusual.

**It earns a standing rule because this library's own instincts do not cover it.** The arguments
recorded here are about ownership, slots, flags and who has to know what; none of them would ever have
produced 2.5.7, because a normative requirement is a fact about the outside world rather than a
consequence of the design. `SlideButton` is the shape to expect: the keyboard route was decided, argued
and pinned in a spec, and was still half of what Level AA asks, because 2.5.7 is about **pointers** and
every argument had been about keyboards.

**Cite the criterion by number and quote the normative line.** Understanding documents carry the
deciding part and it is routinely the opposite of the guess — 2.5.1 Pointer Gestures reads as though it
governs any dragging and does not, because a slider using pointer capture is dragging only, not a
path-based gesture. A criterion named without being read is the same failure as a browser-support claim
from memory.

**Say what it said even when it changes nothing**, in the reply and in the entry: "checked 2.5.7, the
existing route conforms" is worth a line, since otherwise nobody can tell a criterion that was
considered from one never opened.

## API naming

### `AccessorProps`

Skips **only** functions and symbols. Everything else — arrays, `Set`, `Map`, `Date`, `Node` /
`HTMLElement`, plain objects — is accessorized to `getX`. Refs are declared as
`elementRef: HTMLElement | undefined` and become `getElementRef`.

**A generic prop cannot pass through it.** `AccessorProps<{ value: T }>` produces no `getValue`: the
key filter depends on `IsSkippable<T>`, which cannot resolve while `T` is unbound, so the key is
silently dropped and every use site fails with "property does not exist". Declare generic props by hand
beside the accessorized block — `RadioProps<T>` writes `getValue: Accessor<T>`, `RadioGroupProps<T>`
keeps `valueSignal: Signal<T>` outside its `AccessorProps<{...}>`. The type compiles and the prop just
vanishes, so check for it whenever a generic component is added.

**It also cannot express an optional prop whose own value may be `undefined`, and a ref is exactly
that.** `AccessorizedPart` maps an optional key to `Accessor<Exclude<T[K], undefined>> | undefined`, so
the `undefined` is stripped from the _return_ type. `initialFocusRef?: HTMLElement` yields
`getInitialFocusRef?: Accessor<HTMLElement>`, which a consumer's `createSignal<HTMLElement>()` cannot
satisfy — an element ref does not exist until mount. Existing refs sidestep it by being **required**
(`Tooltip`'s `anchorRef: HTMLElement | undefined` is not optional, so the union survives). An
_optional_ ref is declared by hand: `ModalProps` writes
`getInitialFocusRef?: Accessor<HTMLElement | undefined>`, as `InteractionWrapperProps` already did with
`getTooltipDefs`. One rule: if the prop mentions a type parameter, or its value can itself be
`undefined`, write the accessor out.

**The rule bites on plain numbers too, not only on refs.** A wheel's `idleDelayMs` is absent when the wheel is
not to turn on its own, so a consumer switching that off at runtime has to return `undefined` from the accessor
— and the accessorized form will not let them, because it promises a `number`. `RotationDefs` and the three
wheel props types therefore all declare `getIdleDelayMs?: Accessor<number | undefined>` by hand. Worth stating
because the ref cases read as being about refs: **any optional prop whose meaningful "off" value is `undefined`
is in the same position**, and the type error arrives at the call site rather than at the declaration.

### Prop prefixes

| Kind                                          | Prefix                        | Examples                                                                                       |
| --------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Reactive data (via `AccessorProps`)           | `get*`                        | `getIsVisible`, `getJoinRadii`, `getHrefs`, `getVisibleCorners`                                |
| Factories / predicates / transforms with args | `compute*`                    | `computePoints`, `computeFillDefs`, `computeIsDisabled`, `computeClassNames`, `computeSVGDefs` |
| Events / lifecycle                            | `on*`                         | `onShow`, `onHide`, `onClick`; **`onMount` for controller handoff**                            |
| JSX producers                                 | `render*`                     | `renderContent` / `renderTab`; nested defs use `renderDefsElement`                             |
| Two-way state the component also writes       | `*Signal` (plain, unprefixed) | `visibilitySignal`, `checkedSignal`, `valueSignal`                                             |

One `compute*` prefix for all factories — reactivity is carried by **argument shape** (`size` vs
`getSize`), not by a second prefix.

### Signal tuples for two-way state

State the component both reads _and_ writes arrives as the whole `createSignal` pair, not an accessor
plus a callback: `<Modal visibilitySignal={modalVisibility} />`. `AccessorProps` skips it like a
function, so the prop keeps its plain name. One variable, both sides write, owner and component cannot
disagree, and there is no handler to forget. Callers that only open the thing drop the getter:
`const [, setModalOpen] = modalVisibility`.

Use it only where the component genuinely writes. One-way data stays `get*`. The accepted cost: the
owner has to _have_ a signal — visibility derived from a memo, a store field or a route param has no
setter to hand over.

### Asking for a state a thing is already in does nothing

Settled for the whole library. **Open an open thing, close a closed one, play what is
playing, show what is shown, highlight what is highlighted — every one is a no-op.** Nothing fires,
nothing is notified, nothing is re-read.

**A state request states where things should end up, not that a transition should run.** A caller
saying "open" is saying "be open"; work done anyway is work they did not ask for, invisible at the call
site and surfacing as a side effect elsewhere — the `Menu` case that produced this rule re-opened an
already-open menu and the only effect was the highlight jumping back to the first item.

**The guard belongs in the transition, not at the call sites.** One `if` inside `open` is a property of
the component; the same `if` at four call sites is a thing the fifth caller will not know about. Same
argument as _"Anything that has to happen because the popup is open belongs to the state, not to one of
the ways in"_ under `DatePicker`.

**Notifying the consumer counts as work.** Re-selecting the selected tab must not call
`onSelectionChange` again; the callback is how a consumer learns the value _changed_.

**Three things are outside the rule**: a **toggle** requests an inversion so it always acts; an
**explicit restart** (`Typewriter`'s) is a command, and restarting something already running is exactly
when it means something; a **multi-select pick** of a selected value deselects it, which is a change.

### Accessor or plain value

Ask: **who needs to track this value, and when?**

- **Accessor** — parent passes a signal/memo _without reading it_; callee may subscribe later.
- **Plain value** — parent already reads in the same memo/effect, or the value cannot change during the
  call.

Shortcut: **if calling `fn(x())` would lose a subscription the callee needs, pass `x`; otherwise
`x()`.**

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

`ref` (if any) → enabled / visible / disabled → opts / defs. Prefer `getIsDisabled` over
`getIsEnabled`. Examples: `ElementObserver.createViewportRectObserver(ref, visible, opts)`,
`Interaction.wrapElement(ref, disabled, opts)`, `Focus.autoFocus(ref, visible)`,
`ElementFader(visible, opts)`, `FPS.createMonitor(disabled, opts)`.

**An observer's name carries its coordinate space**, because the wrong one fails silently — it returns
a plausible number wrong by the `Viewport` scale factor. `createViewportRectObserver` polls on
`requestAnimationFrame` and reports position **and** size through
`ViewportUtils.getAdjustedBoundingClientRect`, scale divided out. It was briefly `createObserver`, which
said neither what was measured nor in which space.

### SVG / factory arg order

Primary args → **defs** → **opts** → **extra** (injected elements / custom render logic) last. Merging
defs and opts is desirable later but is a deeper refactor. Examples:
`computeLinearGradient(defs, custom?)`, `add*Filter(defs, custom?)`, `computeSVGDefs(id, flags, defs)`,
`computeBreakpoints(type, idx, lineCount, defs, opts?)`.

### Controls: wrapper owns behaviour, leaf owns the element

Settled when `InteractionWrapper` was split out of `Button`.

**The composition is an implementation detail, not the consumer's job.** `Button` _is_
`InteractionWrapper` wrapping a private `ButtonElement`, and consumers still write
`<Button {...props} />`. Leaf-only with no preset was tried and reverted the same day: it pushed a
six-line `renderControl` block into all eight call sites and put `setElementRef` / `getFlags` /
`getIsReachable` — wiring that should be opaque — in the consumer's face. Follows `Surface`, which
composes `Shape` and keeps `SurfaceSVG` / `SurfaceDiv` unexported. `ButtonElement` is likewise
unexported; `InteractionWrapper` stays public for custom controls.

**What the wrapper hands a leaf is the wrapper's type, not the leaf's.** `InteractionControlProps`
(`id` / `flags` / `isReachable` / `ref`) lives in `InteractionWrapper.types.ts`, declared unaccessorized
so each leaf applies `AccessorProps` itself. Anything applicable to every wrapped element belongs there;
only element-specific props (`ButtonCbs`) stay with the leaf. `ButtonProps` is derived rather than
restated — `Omit<InteractionWrapperProps, "renderControl"> & AccessorProps<ButtonCbs & { id?: string }>`
— so wrapper props reach consumers automatically as the wrapper grows.

**The tooltip anchors on the leaf, not the wrapper.** Anchoring on the wrapper div was rejected: it
drags in four changes to `Tooltip` (`focusin`/`focusout` instead of `focus`/`blur`, a `:has(:focus-visible)`
guard, rerouting `aria-describedby` to the control, losing `pointer-events: none` so the hover region
grows to the wrapper box). `Tooltip` was not modified at all by the split — keep it that way.

**Disabled is one mechanism for every control: `aria-disabled`, never the native attribute.** This
replaces an earlier split where native `disabled` was the default and `aria-disabled` was used only in
reachable mode. Native `disabled` blocks activation for free but kills every event, so the tooltip
explaining _why_ a control is disabled becomes unreachable exactly when it matters — hence the split.
What the split could not do is look the same in both modes: the UA paints a natively disabled control
greyed and drops `accent-color`, and no CSS reproduces that on the `aria-disabled` branch. Appearance
parity is non-negotiable (next section), so the mechanism has to be uniform, and only `aria-disabled`
supports both modes.

Accepted cost: activation gating lives in JS for _every_ disabled control, and disabled controls are no
longer excluded from form submission — they were never form-bound here, and one that must be excluded
can carry the attribute at that point. The gating is unchanged: `Button.tsx` returns early in `onClick`,
`Checkbox.tsx` calls `preventDefault` on click so the pre-click checkedness toggle is reverted, and both
gate `onMouseEnter` / `onMouseLeave` too, since native `disabled` used to suppress those.

Three things had been leaning on the native attribute:

- **Tab order.** `wrapElement` sets `tabIndex = !isDisabled || isReachable ? 0 : -1` for every wrapped
  element. That line used to sit inside `applyButtonSemantics`, which was right when only a
  div-acting-as-button needed it. `role` / `ariaDisabled` / `cursor` stay opt-in there, because forcing
  `role="button"` onto an `<input>` breaks it.
- **Focus traps.** `FOCUSABLE_SELECTOR` in `Focus.utils.ts` is written as `button:not([disabled])` and
  so on, so a disabled control with no attribute started matching and a disabled `Button` inside a
  `Modal` would have taken autofocus. `isReachable` now rejects `tabindex="-1"` up front, which is the
  correct tab-order rule anyway: `-1` means programmatically focusable, not tab-reachable. It also fixes
  `Tabs`, whose roving-tabindex links matched `a[href]` and were all collected regardless of state.
- **Reachable mode is no longer visible to a leaf.** `getIsReachable` as a third `renderControl`
  argument and `isReachable` on `InteractionControlProps` existed only so a leaf could compute its own
  native `disabled`. Both are gone — reachability stops at `wrapElement`, which is the "wiring should be
  opaque" argument applied one level further in.

**Removing tab order is not enough; mouse focus has to be refused too.** `tabIndex = -1` still allows
click focus. This was originally recorded as a consequence with no fix worth building, since nothing is
drawn — `:focus-visible` does not match on mouse focus and `isFocused` stays false because non-reachable
mode attaches no listeners. `TextInput` disproved the premise: a focused text input blinks a caret
regardless, so a disabled field invited typing it would silently refuse. `wrapElement` now attaches one
listener in its disabled-and-not-reachable branch — `mousedown` with `preventDefault()`, the event whose
default action is focusing. Same "activation gating lives in JS" shape as `Button`'s `onClick` return,
applied to focus, uniform across every wrapped control. Disabled controls also stop being
text-selectable by drag, which matches native `disabled`.

Reachable controls are untouched: the branch runs only when disabled **and** not reachable.

One hole remains, deliberately: clicking a `<label>` caption still focuses a disabled control, because
label activation focuses the labelled control directly rather than dispatching `mousedown`. After the
caret suppression below nothing is drawn in that state, so it lands back on the previously acceptable
condition; the only catch-all — blurring from a `focus` handler — buys it with focus flicker and a jump
to `<body>`.

The reachable predicate is unchanged:

```
reachable = isDisabled && isReachableWhenDisabled && tooltipDefs !== undefined
```

Deriving the mode from `getTooltipDefs` presence _alone_ was rejected, and the distinction generalises:
**presence as a trigger fails invisibly** — add hover text and disabled semantics change under you —
while **presence as a guard fails toward the safe default**, only when a prop was explicitly set, and is
findable with a warning. The third clause exists because a focusable `aria-disabled` control with
nothing to reveal is worse than one skipped by the tab order. Two cases it knowingly shuts out, each
earning its own prop if it shows up: an explanation living elsewhere on the page (inline error,
validation summary) needing only `aria-describedby`, and composite widgets where skipping disabled items
makes the set read as incomplete. A control reachable while disabled must keep its focus ring — focus
landing somewhere invisible is worse than being skipped.

**The third clause reads the value, not the prop — settled with `Select`.** It was
`props.getTooltipDefs !== undefined`, now `props.getTooltipDefs?.() !== undefined`, which also decides
whether the `Tooltip` renders. Not a loosening: the clause asks _"is there anything to reveal"_, a
property of the value. Prop presence was an exact proxy only because a hand-written control that passes
`getTooltipDefs` always returns something. A group rendering items from records breaks the proxy — the
field is absent on most options, so the group forwards
`getOption().tooltipDefs && (() => getOption().tooltipDefs!)` and a function returning `undefined`
crashes the spread into `Tooltip`. Reading the value makes the honest form the only form, and it types
as `Accessor<InteractionTooltipDefs<TExtra> | undefined>`.

**Presence as a guard survives where it is load-bearing, which is the opt-in.**
`getIsReachableWhenDisabled` is still an explicit prop and still carries "only when asked". The
`console.warn` for reachability-without-a-tooltip stays presence-based on purpose: it catches the
authoring mistake it was written for and stays quiet for a group that forwards both fields
unconditionally and legitimately has options with neither.

The render is `<Show when={getTooltipDefs()}>` with the accessor child form rather than `&&` plus `!`.
Non-keyed, so a record rebuilt under `<Index>` does not remount a visible tooltip and restart its fade;
the accessor child removes the non-null assertion.

**Disabled + reachable has to look disabled — identically, not approximately.** Reachability is an
accessibility affordance, not a state: a control that looks actionable but does nothing is worse than one
that plainly reads as unavailable. Under the old mechanism split this failed on screen — `CheckboxPage`'s
"Disabled" box sat next to a "Disabled + reachable" box in full accent colour, looking like the one
control you were meant to click.

Two rounds were needed and the first is the lesson. It kept both mechanisms and layered one appearance
on top: `filter: grayscale(1)` plus `opacity: 0.5` on `interactionDisabled`, set from `getIsDisabled()`
alone so it covers both. That killed the accent colour and was a real improvement, but it could only
narrow the gap, because the two branches start from different UA paint under the same filter. Emulating
the UA per control instead (`accent-color: GrayText` on `[aria-disabled='true']:not(:disabled)`, then a
rule per control type) trades one approximation for a longer list. Approximating a rendering no spec
defines is not a way to reach "equal" — the mechanisms had to converge, which is what the section above
does.

**Nothing that fades or filters may touch the element that owns the focus ring.** `filter` and `opacity`
paint an element's outline along with everything else, so an early version — those two on the wrapper
root — drew the reachable control's ring grey at half strength. In the Playground that ring is magenta
`:focus-visible { outline: 2px solid var(--clr-highlight) }`, and the ring is the entire reason the
control is reachable. Redrawing it on the unfiltered root via `:has(:focus-visible)` was rejected: the
root is not focusable, so the consumer's own `:focus-visible` rule cannot reach it, and the library would
own one ring appearance for disabled controls and the consumer another for enabled ones.

Two further attempts to keep the fade inside the library are recorded because they look reasonable and
are not. Inherited colour only (`color: GrayText`, `accent-color: GrayText`) spares the ring but cannot
touch anything a consumer painted explicitly, which is most of what you see. Pushing `filter` down to
`interactionDisabled > * > *` reaches consumer paint and spares the ring, but depends on a leaf returning
the focusable element itself and on the painted thing living exactly one level below — a structural
assumption CSS cannot state or check.

Both are gone. The library no longer paints disabled at all: the painter does, from the flags (next
section). Since `Button`'s painter is a child of the `<button>`, fading it can never reach the ring on
the parent — the constraint is satisfied by structure rather than by careful selectors.

### Controls: the shell owns behaviour, the painter owns paint

The user's words: `Button` is a shell, `buttonContent` is the painter, and
`Tooltip` and `Modal` already work this way — functional, not visual.

**A control paints nothing.** The shell owns events, ARIA, focus and tab order, tooltip anchoring,
geometry and the flags. Every pixel comes from `renderContent(getFlags)`, declared on
`InteractionControlProps` so it reaches every leaf and re-exported through `ButtonProps` /
`CheckboxProps` with `Pick<InteractionControlProps, "id" | "renderContent">`. It replaced `children`: a
slot cannot take arguments in Solid, and the painter is useless without the flags. Children-as-function
was the alternative, with precedent in `For` / `Show`; `renderContent` won on consistency with the
`render*` convention and with `Tooltip.renderContent`.

**Where the paint goes is the leaf's decision, not the wrapper's.** `Button` puts it inside the
`<button>`, its label. `Checkbox` cannot — `<input>` is a void element — so the leaf returns a fragment:
the painter first in flow, the input second at `inset: 0` over it. The painter sizes the box, the input
covers exactly that box, the ring lands exactly around what was painted. Consequences:

- The input is a genuine blank slate — `appearance: none` plus `!important` resets for background,
  border, radius, shadow, padding, margin, width, height. The `!important` is not defensive habit:
  `input:not([type="range"])` and `input[type="checkbox"]` in the Playground stylesheet outrank a class,
  so without it the app's border and 20×20 sizing would paint over the painter. `outline` is deliberately
  not reset — that is the ring.
- State parity is now structural. A painter is handed `isDisabled` and nothing about reachability, so
  "disabled" and "disabled but reachable" cannot be drawn differently even by accident.
- A painter rendering text should mark it `aria-hidden`, since the accessible name comes from the input
  and stray glyphs would be announced as page content.

**The tooltip gets the flags too**, since it usually explains a state. `Tooltip` was not touched:
`InteractionTooltipDefs` widens only the consumer-facing `renderContent` to `(getVisibilityTarget,
getTransitionDurationMs, getPlacement, getFlags)`, and the wrapper adapts it down to `Tooltip`'s
three-argument signature.

The honest cost of the model: `PageButtonContent` and `PageCheckboxContent` hold the gradient, border,
check mark and disabled / error / checked rendering; fourteen call sites changed. In exchange the library
carries no colours at all, and a consumer defines their branded control once.

**The wrapper's box has to equal the painted box**, because the decoration slot is `inset: 0` against the
root and the ring is drawn on the control. Two things guarantee it: the root is `display: flex`, so its
in-flow child is a flex item rather than an inline-block with descender slack, and
`interactionRoot > *` forces `margin: 0 !important`.

That `!important` is not defensive habit either. The Playground carries
`input[type="checkbox"] { margin-block: 10px }`, and element-plus-attribute outranks the `margin: 0` in
`Checkbox.css.ts` — so a 20×20 checkbox sat in a 20×40 root and `Corners` drew a decoration twice the
height of the control. That route is closed now the input is absolutely positioned, but the rule still
earns its place: it now guards the painter's margin, and the failure would look identical. Spacing
belongs outside the wrapper; a painter wanting inner space uses padding.

The general invariant, worth stating because it predicts the next bug of this shape: **nothing may
decouple the painted box from the wrapper's box.** Sizing, padding, border and surface paint are the
painter's; `margin`, `transform`, `position`, `float` and `inset` on the in-flow child are not, and only
`margin` is currently defended.

**A painter's declared width is a preference, and `max-width: 100%` on the root is what makes it one.**
Found in the Playground's left menu: the search field's painter asks for 200px in a 240px
column whose usable width drops to 190px once a scrollbar takes its gutter, and the field hung 10px past
the padding.

Why nothing else stopped it, because every instinct about it is wrong.
`interactionSizingVariants["fit-content"]` sets `width: fit-content`, which reads as "never exceed the
space I was given" and is not: it resolves to `max(min-content, min(max-content, available))`, and a flex
item with a definite width has an automatic minimum size equal to it — so the painter's 200px _is_ the
container's min-content size, the outer `max` picks it over 190px, and the root is 200px. The painter
cannot fix this from inside: `max-width: 100%` on the painter resolves against a root sized from the
painter, so it is circular; `min-width: 0` does not reach the container's min-content size; `width: 100%`
collapses it outright, since a percentage against a shrink-to-fit parent is treated as `auto` and an
empty div's `auto` width is zero. All three were measured against the running Playground.

What works is `max-width: 100%` on `interactionRoot`. The root clamps to the space it was given and the
painter — a flex item with default `flex-shrink: 1` — follows it down, so the wrapper's box still equals
the painted box and the absolutely positioned input, decoration and ring all land on the smaller box. It
is on `interactionRoot` rather than the `fit-content` variant because it is the invariant for both: under
`fill` it is a no-op, and stating it once says a control never paints outside the box it was placed in.

Sizing-neutral everywhere else, and checked rather than assumed: every `InteractionWrapper` root on all
29 Playground routes was measured before and after, and the search field is the only box that changes. A
percentage `max-width` against an indefinite containing block computes to `none`, so a control inside a
shrink-to-fit ancestor is unaffected by construction.

**Render props receive what drives them.** `renderDecoration(getFlags)` replaced `Button`'s
zero-argument `renderHighlight()`, under which the pressed linkage was faked consumer-side — `ButtonPage`
closed over its own signal for the colour and passed the same signal as `getIsPressed`, with the
component connecting neither. Renamed because `ElementHighlight.renderHighlight` already means
`(getVisibilityTarget, getTransitionDurationMs)`, and two contracts under one name is a trap.

**The decoration slot belongs to the wrapper for a structural reason**, not because `Button` needed it:
it requires `position: relative` on the root plus `inset: 0` on the overlay, and inherits
`pointer-events: none` so it never eats clicks — all wrapper properties a leaf cannot provide without
becoming a wrapper. One slot, not layered slots; a fragment covers multiple decorations, and ordering
waits until something needs it. Marker classes (`interactionPressed`, `interactionError`,
`interactionDisabled`) are empty and stay only as a CSS-side escape hatch and for the root's `z-index`
rules; a painter reads state from the flags rather than from a class on an ancestor.

**Flags merge, external wins.** `isPressed` / `hasError` / `isDisabled` are the owner's; `isHovered` /
`isFocused` / `isActive` are the element's. `wrapElement` keeps its listeners attached while disabled and
gates the flags instead: `isActive` and `isHovered` are forced false whenever `getIsDisabled()`, while
`isFocused` stays live.

`isHovered` is gated because a painter keyed on hover would light up under the cursor on a disabled
control and read as actionable — and now painters own every pixel, the flags are the only thing between a
disabled control and a live-looking one. Hover behaviour that must survive is untouched: `Tooltip` runs
its own listeners on the anchor, so a disabled but reachable control still reveals its explanation.
`isFocused` is the deliberate exception, because a reachable control has to show where focus landed.

`wrapElement`'s `role` / `ariaDisabled` / `cursor` block stays opt-in via `applyButtonSemantics` — right
for a div acting as a button, wrong elsewhere, since native controls already carry correct semantics. Its
`tabIndex` line is the exception and runs for every wrapped element.

### Audit: the React-era `BinarySwitch`, and what of it survives here

A `_TEMP` copy of a two-year-old Preact implementation of these controls (a central
`BinarySwitch` base plus `Checkbox` / `Toggle` / `RadioButton` leaves, 568 lines) was read in full and
deleted — it referenced `@ui/*` and `preact` aliases, so `vite-plugin-checker` failed the build while it
sat in the tree.

**The base was the same idea from the other side**: a shell of a hidden native `<input>` plus a
`children` slot doing all the painting, parameterised by `type: 'checkbox' | 'radio'`. One difference
decides everything else.

**How the painter learns the state.** The old painters read state out of CSS through sibling selectors —
`input[type=checkbox]:checked + container &`, `:disabled + &`, `:focus-visible + &`. Free at runtime, and
uncarryable here for three stacking reasons:

- It hardcodes DOM adjacency. `CheckboxElement` renders the painter **first** and the input after it, so
  the input can be `inset: 0` over the painter and own the hit area and ring. The selector would point
  the wrong way, and fixing that fixes DOM order to the stylesheet forever.
- CSS only sees states the DOM has. `isPressed`, `hasError`, `isActive` and "disabled but reachable" are
  not DOM states, and disabled here is `aria-disabled`, so `:disabled` matches nothing — the old
  disabled and focus rules would silently do nothing.
- It puts library class names inside consumer paint. The settled model is the inverse: the library hands
  over data, the painter owns every pixel.

**`Toggle` needs no new library code**, the audit's most useful result. In the React tree `Toggle` was
141 lines and almost all paint: body size, handle size, radii, two translate distances computed in JS,
the colour swap on check. A toggle **is** a `Checkbox` whose painter draws a track and a sliding handle;
`isChecked` is the entire input it needs. The only library-side difference is one line of semantics —
`role="switch"` so it announces on/off rather than checked. So `Toggle` is a thin preset over `Checkbox`
in the `Surface`-over-`Shape` shape: not a new leaf, and not a base extracted from two leaves with
nothing to share.

**`Radio` is where a shared base earns its keep.** _Corrected after the fact: this originally continued
"and it is not the base `BinarySwitch` had", which was wrong. Only the group's state model and keyboard
needed somewhere new — they became `RadioGroup`. The leaf-sharing job was exactly what the old base was
for, down to the `type` parameter, and the shipped component keeps its name for that reason._

Old radio support was `type="radio"` plus `name`, leaving mutual exclusion to the browser. Too little
here, because the two things a radio group needs are behaviour, and behaviour is the shell's:

- A radio group is a **single tab stop**, arrows both moving and selecting — a roving tabindex, which
  `Tabs` already implements and is the model to follow.
- The **group owns one value**, not one boolean per radio. `checkedSignal: Signal<boolean>` is the wrong
  shape for a member of a set; a `RadioGroup` holding `Signal<T>` handing each radio a derived boolean is
  right. Native `name` grouping gets DOM mutual exclusion free but leaves the state model unowned.

**The size / config / token layer is inconsequent here, and it is the bulk of the code.** The three
`*.config.ts` files, the `s | m | l` scale, `BINARY_SWITCH_SIZE_REMAP`, derivations off
`uiCoreConfig.input.height`, `assignInlineVars` pushing per-instance colours, `useBackground` picking a
contrast pair, `hasOutline` switching filled versus outlined — all so the library can paint with values
the consumer chose. This library paints nothing. Port none of it. The `hasOutline` _technique_ (an empty
marker class selecting a variant) is already the idiom here.

**One genuine gap: the flags describe state, not events, and carry no pointer geometry.** The old
controls spawned a ripple on change imperatively through a controller ref, reading the element's width
and calling `controller.spawnEffect(x, y, …)`. `renderDecoration(getFlags)` is declarative and receives a
snapshot: a painter can watch `isActive` flip, but cannot know **where** the pointer was, and a one-shot
animation keyed on a boolean has nowhere to put an origin. The missing piece for ripples or any
positioned one-shot effect is the originating event, or coordinates from it, reaching the decoration
slot. Named now so it is not rediscovered as a styling problem; not worth building until asked for, and
opt-in when it is, or every control pays for a listener it ignores.

**Two smaller things, so they are not re-litigated.**

- _The `<label>` wrapper and `LabelContext`._ `BinarySwitch` wrapped itself in a `<label>` so clicking
  the painter toggled the input, reading a context to skip the wrapper when an ancestor `Label` supplied
  one (nested `<label>` is invalid). The hit-area half is solved better here: the input is `inset: 0`
  over the painter, so it **is** the hit target. The context half has no current need, but the pattern is
  worth remembering if a `Label` or `FormField` arrives — a component supplying a wrapper should let
  descendants detect it rather than making every caller pass "I am already labelled". Incidentally
  `<label disabled>` was never valid HTML and did nothing.
- _`hasOwnValue`._ A controlled-versus-uncontrolled mode flag: false force-wrote the DOM back to the prop
  and reported the inverse; true reported the DOM's checkedness. `checkedSignal` replaces the flag with
  one mechanism, so it should not come back. The force-write guards something real and became
  `syncElement` — see below.

### Controls: `BinarySwitch`, and `Toggle` / `Radio` as presets over it

Settled, immediately after the audit, which predicted most of this.

**`BinarySwitch` is a private shared composite, not a leaf and not public API**: `InteractionWrapper` plus
the hidden-native-input leaf plus change gating plus the single-writer DOM sync, parameterised by
`type: "checkbox" | "radio"`. `Checkbox`, `Toggle` and `Radio` are a dozen lines each on top. Checkbox and
Radio shared about nine tenths of their leaf, including `syncElement` — the one piece that must not be
copy-pasted, because the second copy is where the bug comes back.

It lives in `Fundamentals/Input/BinarySwitch/` and is **absent from `index.ts`**; only
`BinarySwitch.types` is exported, because `CheckboxProps` and `ToggleProps` alias
`BinarySwitchPresetProps` and the emitted `.d.ts` has to resolve it. A folder under `Fundamentals`
shipping no component is unusual and honest: it renders DOM so it is not an `Abstract`, and consumers
should reach for the presets so it is not public. Promoting it later is one line; the reason not to is
that a public `BinarySwitch` is the union of three controls and invites use over intent.

**One writer for the input's state.** No JSX `checked` binding. A single `syncElement` pushes
`element.checked = props.getIsChecked()` and `element.indeterminate = getIsMixed()` from state, called
from a render effect and again from `onChange` immediately after reporting.

The reason cost a bug to find: the browser flips `input.checked` **before** firing `change`. If the
owner's setter refuses the write — an optimistic toggle a server rejects, a "keep at least one selected"
rule, a form frozen mid-submit — the signal never changes, the render effect never re-runs, and the input
is left `checked` while state says otherwise. Nothing looks wrong then, because `appearance: none` means
the painter draws from the (correct) flags. The damage lands on the **next** click: the browser flips
back and reports the opposite of what the user did, and stays inverted.

`indeterminate` has the identical failure with a likelier trigger — the browser **clears** it on click,
and an effect keyed on an unchanged mixed value will not put it back, so a mixed checkbox would silently
stop being mixed. Hence both properties in one function.

This holds only while the owner's write is synchronous. A consumer `onChange` returning a promise is
awaited by nobody; an async accept would need the render effect to finish the job.

**`checkedState` is a flag, so the painter stops being told twice.** `ExternalInteractionFlags` gained
`checkedState?: boolean | "mixed"` and `InteractionWrapper` a matching `getCheckedState`, which the
presets `Omit` — they own the value, and two sources for one state is what the omission prevents. `PageCheckboxContent` / `PageToggleContent` / `PageRadioContent` now read `getFlags().checkedState` and take nothing
but flags. Before this, `CheckboxPage` passed `checkedSignal` to the component _and_ closed over the same signal for the
painter, with the component connecting neither: the faked linkage `renderDecoration(getFlags)` was
introduced to kill. Three states rather than two is also why it had to be a flag: mixed is computed by
the shell, so a painter inferring it from a boolean could not draw it.

**Mixed is one-way and deliberately not part of the signal.** `getIsMixed` sits beside `getHasError`. A
user can never _click into_ mixed: it is a summary the owner computes (a parent box over disagreeing
children, a setting inherited elsewhere), and clicking always resolves it. Putting `"mixed"` in the
two-way signal would force every plain-checkbox consumer to handle a third case that only arrives from
their own code, and would let the component write a value the user cannot produce. `Radio` has no
`getIsMixed` and it is `Omit`ted: ARIA gives `role="radio"` no mixed state, and a radio that summarises
anything is a checkbox.

**A switch may not be mixed, so `Toggle` drops its role exactly while mixed.** ARIA disallows
`aria-checked="mixed"` under `role="switch"`, so the leaf computes
`role = isSwitch && !isMixed ? "switch" : undefined`, falling back to the native checkbox whose
`indeterminate` does map to mixed. A tri-state toggle announces as a mixed checkbox while mixed and as a
switch otherwise; the role flips on a state change, which readers re-announce anyway. The one place a
requested feature and the spec disagree, resolved by a role swap rather than an approximation.

**The group owns the value; each radio derives a boolean.** `RadioGroup` takes `valueSignal: Signal<T>`
and publishes a context; `Radio` takes `getValue` and reads `context.getValue() === props.getValue()`.
Per-radio `checkedSignal` was never on the table: a member of a mutually exclusive set does not own its
truth, and N booleans can represent states the group cannot be in.

Context rather than `Tabs`' count-plus-`renderOption` shape, because each radio keeps the whole
`InteractionWrapper` surface — its own tooltip, decoration, disabled and error state. A data-driven group
would grow a `compute*` prop per capability and re-expose all of them per index. The cost is
registration: `context.register(entry)` runs during each `Radio`'s setup and cleans up through the
caller's `onCleanup`, and the group sorts entries by `compareDocumentPosition` rather than trusting
registration order, so a reordered `<For>` cannot desynchronise keyboard order from the screen.

The context is typed `unknown` on the value, because a context cannot be generic; `Radio<T>` casts at the
boundary. Benign consequence: a `RadioGroup<SizeValue | undefined>` will accept a `Radio<string>`, and
only the group's own signal keeps the type honest.

**Native `name` grouping is used; native arrow-key navigation is not.** Every group generates a
`createUniqueId()` name unless given one, so the browser does DOM-level mutual exclusion. Its keyboard
handling cannot be used: disabled here is `aria-disabled`, so the browser sees no disabled radios and
would happily move to one **and select it**. `RadioGroup` `preventDefault()`s the arrows and walks
itself.

Its rule is one step more generous than either pattern alone: arrows move to the next entry that is
enabled **or** reachable-while-disabled, and select only if enabled. Single tab stop kept, disabled
options unselectable, and a disabled-but-reachable option can still receive focus so its tooltip
explains itself. `Home` / `End` jump to the ends of the same set. All four arrows work regardless of
`getDir`, which only drives layout.

This required `computeIsReachable` to move from `InteractionWrapper` into `InteractionUtils`, since
`Radio` computes the same predicate. Extracting rather than restating is the point: the predicate is
settled and two copies would drift. It does not re-expose reachability to a _leaf_ — `Radio` is a preset
one level above the leaf.

**`tabIndex` is now a conjunction, narrowing a previously absolute rule.** `wrapElement` takes an
optional `getIsTabbable` and computes `(!isDisabled || isReachable) && isTabbable ? 0 : -1`. The
wrapper's veto is still absolute; an ancestor owning a roving tab order can narrow it further. So the
`tabIndex` line still runs for every element, it just no longer decides alone. `getIsTabbable` stays
public on `InteractionWrapper` and is inherited by `Button` and `Checkbox`, because participating in
someone else's roving order is a general capability — unlike `getCheckedState`, which the presets own.

`InteractionWrapper` also gained a `ref` passthrough, since `RadioGroup` must `focus()` a specific radio.

**Known gaps, deliberate.** Arrow keys do not cross groups, and a group with every option disabled has no
tab stop at all — both correct, both look like bugs from outside. And **a caption drawn inside the painter
is not a label**: `PageRadioContent` draws its caption inside the painter under the `inset: 0` input, so
the whole row is clickable, which is legitimate but is not an accessible name and cannot place the caption
anywhere the painter does not reach. `Label` is the answer.

### Controls: `Label`

Settled, closing the gap the audit recorded.

**It wraps rather than points.** `Label` renders a `<label>` around both caption and control, so
association is implicit and no `id` is invented or threaded. `for` / `getId` was rejected: an explicit id
is a second thing to keep unique and in sync, and only earns its keep when the caption cannot be a
sibling of the control, which nothing here needs.

**It paints nothing, including the cursor.** Geometry only: `display: flex`, `width: fit-content`,
`getDir`, `getGap`. Cursor was left out deliberately: a `<label>` cannot know whether the control inside
is disabled, so a blanket `cursor: pointer` would lie, and taking `getIsDisabled` would duplicate state
the control owns. The caption is the consumer's child, so the cursor is theirs; the Playground sets it in
`pageStyles.labelCaption`.

**`aria-label` loses to a visible caption.** `Label` publishes a context and `BinarySwitch` reads it:
inside a `Label`, `getAriaLabel` is suppressed and a warning fires. Not a preference — `aria-label`
overrides the label's text as the accessible name, so a control carrying both is announced as something
other than what can be read, which is WCAG's _Label in Name_ failure. Suppressing rather than merging
keeps one visible source of truth; warning rather than failing silently is the house pattern.

That context is the audit's `LabelContext` idea put to better use, and it also does the original's job: a
`Label` nested inside a `Label` renders a `<div>`, since nested `<label>` is invalid and its activation
target ambiguous.

**A group caption is not a `Label`.** `RadioGroup` takes `getAriaLabel` and puts it on the
`role="radiogroup"` element. Wrapping a group in a `<label>` would claim one control is being named, and
would make a caption click activate an arbitrary member.

### Controls: `TextInput`

The first control whose element the user can see through, which turns out to be
the only thing separating it from `Checkbox`.

**The overlay geometry survives; what the input keeps does not.** Painter first in flow, `<input>` second
at `inset: 0` — the `CheckboxElement` arrangement, so the ring lands around what was painted. What
changes is the blank-slate rule: a text input **is** the thing showing the value, caret and selection. So
the reset keeps `appearance`, `background`, `border`, `border-radius`, `box-shadow`, `margin` and
`min-width` — all `!important` — and leaves `padding`, `font`, `color`, `caret-color` and the rest of the
text-drawing properties alone. `user-select: text` is set because `interactionRoot` sets `none`.

**Nesting the input inside the painter was the obvious alternative and lost on the focus ring.**
Typography would inherit and the padding duplication below would vanish, but the input is still the
focusable element, so the ring would be drawn around the inner text area rather than the frame, and
recovering it means the painter matching on `:has(:focus-visible)` — the arrangement rejected under
_"Nothing that fades or filters may touch the element that owns the focus ring"_. It would also make
`renderContent` a two-argument contract for one control.

**Accepted cost: the painter's inner padding and the input's `padding` have to agree, and nothing
enforces it.** Both are in the consumer's stylesheet, so a shared constant fixes it — the Playground's
`TextFieldContent.css.ts` derives both from `FIELD_PADDING`. The first place the painter does not own
literally every pixel, and the direct price of keeping the ring correct.

**`computeTextStyle` is the one place paint lives on the element the browser owns**, because there is no
other hook: the consumer must style the text, the text is inside the input, the input is the library's. It
takes `getFlags` per _"Render props receive what drives them"_ — disabled text is grey, and no ancestor
knows the flags.

It returns a **whitelisted** object rather than a class name:
`TextInputTextStyle = Pick<JSX.CSSProperties, "color" | "font-size" | "padding" | …>`. The first version
took `computeClassName` plus a prose rule ("only properties that draw text") that nothing enforced. A
`Pick` makes that a compile error, so a border or a `position` cannot decouple the painted box from the
wrapper's box. Solid's `JSX.CSSProperties` extends `csstype.PropertiesHyphen`, so keys are kebab-case and
lengths are strings — `"12px"`, not `12`.

**Applied as an inline style, which ends the specificity war on the consumer's side.** Inline styles
outrank every selector short of `!important`, so a consumer no longer reaches their input through a
`globalStyle` to beat an app stylesheet's `input:not([type="range"])`; the Playground lost four
`globalStyle` blocks. The library's own `!important` resets still win, correctly:
`caret-color` under `[aria-disabled='true']` must beat whatever the consumer asked for.

**One prop rather than one per property**, because almost everything that draws text is an _inherited_
property — `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `text-transform`,
`caret-color`. Enumerating them reimplements CSS one prop at a time and still leaves a tail; one object
covers the tail by widening the `Pick`.

**Padding is deliberately _not_ whitelisted, because the library owns it.** The obvious division —
background element owns borders, corners and padding; input owns text — does not work: an absolutely
positioned box resolves `inset` against its containing block's padding box and **ignores that ancestor's
padding**, so padding on `renderContent` insets nothing. The first version whitelisted padding and made
the consumer compute it; `getPadding` and `getGap` replaced that (see below).

**What a value-only API cannot express**, recorded because it is why the class may have to come back:
`::selection`, `::placeholder`, `::-webkit-*` and `:autofill` are selectors, not values. The last is a
real gap — Chrome's `:autofill` forces an opaque background that `background: transparent` cannot clear,
so an autofilled field paints a solid square-cornered rectangle **over** the painter, and `color` is
locked the same way.

**Left alone deliberately, and not because it is hard.** The lock is anti-spoofing: Chromium refuses
author overrides so a site cannot conceal that the browser filled a field with stored data. Defeating it
is possible — `box-shadow: inset 0 0 0 1000px <colour>` paints above the background and below the text,
and `-webkit-text-fill-color` covers the forced text colour — but doing it by default would suppress a
signal the browser is deliberately showing. `opacity` and `filter` are not alternatives at any
specificity: both composite the whole paint, fading text with background and reaching the ring. So no
escape hatch ships; if one is ever wanted it should be a narrowly documented pseudo-selector hook rather
than a general class prop, and the consumer should be the one deciding to override an anti-spoofing
default.

**`renderPlaceholder` is a slot, not a string.** Native `placeholder` is paint the library emits, which
_"A control paints nothing"_ forbids. The slot is `position: absolute; inset: 0; pointer-events: none`,
rendered between painter and input so typed text is never occluded, and **always rendered when the prop
is given** — gating on `isEmpty` internally would make a floating label impossible. The painter reads
`getFlags().isEmpty` and decides between hiding and floating. Placeholder text should be `aria-hidden`,
for the same reason a checkbox painter's glyph is.

This is also why the slot belongs to the leaf rather than `renderDecoration`: the decoration wrapper sits
above the input and is shared by every control, whereas a placeholder must sit below the caret and only a
text field has one.

**Focus is drawn once, by the ring, and a painter must not draw a second one.** The first
`PageTextFieldContent` coloured its border on `isFocused`, producing two concentric indications at
different radii. The outline already hugs the painted box exactly, so there is nothing left to add.
`isFocused` stays available for focus-driven paint that is **not** a ring.

**Adornments are `renderLeading` / `renderTrailing`, and they are the leaf's.** Both absolutely
positioned against the root at `insetBlock: 0`, both rendered **after** the input so they stack above it.
Width is their content's, so the slot hugs what it holds and clicks either side still land on the field.
The Playground puts a real `Button` in one: an adornment can hold anything, including another
`InteractionWrapper` with its own ring, tooltip and disabled state.

**The slot inherits `pointer-events: none` from the root and must not override it.** It briefly set
`auto`, which inverted hover: the slot sits above the input, so pointing at a static adornment stole the
hit test, the input never received `mouseenter`, and `isHovered` went **false** exactly while the cursor
was over the adornment. Inheriting `none` lets the hit test fall through, and hovering the adornment
reads as hovering the field, which is what it is.

Interactivity is unaffected, which is why `none` is the right default rather than a compromise:
`pointer-events` is inherited, so an interactive element re-enables it for itself, and every control
element here already does (`buttonElement`, `binarySwitchElement`, `textInputElement` all set
`pointer-events: all`). Only raw consumer markup that must be clickable needs `pointer-events: auto`, the
same one-liner `interactionDecorationWrapper` always required.

One consequence, left alone: hovering an interactive adornment drops the field's `isHovered`, since the
adornment is a sibling of the input and `mouseleave` fires. That reads correctly — you are hovering the
button — and fixing it means moving `wrapElement`'s hover tracking to the root and to `mouseover` /
`mouseout`, which is shared-code surgery for a cosmetic gain.

They do not go through `renderDecoration` because that slot is one full-box overlay shared by every
control, while these are positional, text-specific and drive the input's padding. Nor are they one prop
taking a side — _"one slot, not layered slots"_ was about stacking, and these reserve opposite ends.

Named leading/trailing for **role, not axis**. They were briefly positioned with `inset-inline-start` /
`inset-inline-end` on the argument that following the writing direction costs only a property name; that
argument is withdrawn. Adopting `CSSPadding` made it incoherent, since `paddingLeft` is physical and
feeding it into a logical property is a lie the moment anything is RTL. Physical throughout is honest
while nothing else in the library is RTL-aware — `getDir` on `Label` and `RadioGroup` means flex
direction, not writing direction. Going RTL later means changing the CSS, not the prop names.

**The field's inset is measured, not declared.** `getPadding` and `getGap` are what the consumer states;
everything else is derived. `getPadding` takes `CSSPadding | number`, normalised through
`CSSUtils.spreadPadding`, so one number spreads to four sides and per-side control needs no second prop.
`CSSUtils.spreadableToStyle` renames the keys and adds the `px`, so no template strings are built by
hand. It briefly took a bare `number`, and briefly used `Bounds` — the right shape for
`createViewportRectObserver`, which measures _edges_, while `CSSPadding` arrives keyed by CSS property.

Each adornment slot is observed by a local `createAdornmentWidth`, and the input's text area is inset by
`padding + (adornment ? adornmentWidth + gap : 0)` per side, applied as an inline style along with the
same inset on the placeholder slot. The slots themselves sit at `padding` from their edge. So the only
numbers anyone writes are padding and gap, and the placeholder need not know an adornment exists.

_Corrected after the fact: this section originally argued that an adornment reserves no space and the
consumer supplies matching padding, since measuring "buys correctness with a resize observer per field
and takes the decision away from the painter". The decision it takes away is one the painter cannot make
correctly — the strongest counter is **i18n**, where `Show` / `Hide` becomes `Anzeigen` / `Verbergen` and
any declared width silently breaks, along with font swaps and dynamic adornment content._

**A `ResizeObserver` specifically, not a measured rect.** `createViewportRectObserver` is a
`requestAnimationFrame` loop, right for a position that moves and far too heavy for a width that changes
rarely. `borderBoxSize` also reports **untransformed layout size**, which matters because the Playground
runs inside `Viewport`'s `transform: scale()` and `getBoundingClientRect` would return scaled values —
the whole reason `ViewportUtils.getAdjustedBoundingClientRect` exists. `offsetWidth`, used for the
initial synchronous read so the first paint is already inset, is likewise transform-free.

No feedback loop is possible while adornments stay absolutely positioned: the input's padding cannot
change an adornment's size. `getMinWidth` derives the **root's** size from the same measurements and is
safe for the same reason. Anything making an adornment's width depend on the root's would close the loop.

**`getMinWidth` is the floor, and it is the same numbers summed.** `InteractionWrapper` gained
`getMinWidth` beside `getSizing`; `TextInput` feeds it `leadingInset + trailingInset`, which expands to
`padding × 2 + adornment widths + gap × adornment count` — exactly the chrome. Below that the field draws
over its own adornments. It reserves nothing for the text: a zero-width text area is a legitimate floor,
and picking a minimum number of visible characters would be the library inventing a design decision.

This is why the measurement lives in `TextInput` rather than `TextInputElement`: `min-width` belongs on
the root, the root belongs to `InteractionWrapper`, and props flow down. The leaf receives `getTextInset`
and `getSpreadPadding` ready-made and is correspondingly dumber.

**What `getMinWidth` does not do: make the painter follow.** It protects the root, the input and the
adornments. A painter with a fixed `width` stays put, so if the floor exceeds it the root grows and the
frame is narrower than the field it frames. Guaranteeing they move together needs `flex-grow: 1` in
`interactionRoot > *`, which would change every control at once — not worth doing on `TextInput`'s
account. Until then the rule is that a painter must not be narrower than its own adornments require.

**It is a local helper in `TextInput.tsx`, not an `Abstracts` utility.** It briefly was
`ElementObserver.createLayoutSizeObserver`, which put a second unrelated thing in a namespace whose name
then had to work harder, and shipped public API for one internal caller. Both instances live in one file.
Same rule as `TextArea` below: extraction is cheap, the wrong base is not, and the trigger is a second
component wanting it.

One correct-but-odd consequence: the focus ring encloses the adornments, because they are inside the
field's box. An adornment that should own its ring is a `Button` in the slot, and it gets one.
`interactionRoot > * { margin: 0 !important }` reaches the slots, which is the rule doing its job — a
consumer insets an adornment with margin or padding on their own content, one level down.

**Disabled means `readonly`, the first control where `preventDefault` could not do the job.** "Activation"
for a text field is typing, pasting, dragging text in, autofill and IME composition, with no single event
to cancel. `readonly` blocks every one and satisfies the constraints that forced the `aria-disabled`
rule: the element stays focusable, its events keep firing so a disabled-but-reachable field still reveals
its tooltip, and — decisively — **the UA does not repaint a readonly input**, so appearance parity holds
for free. Selection and copying survive, which native `disabled` would have killed.
`element.readOnly = isDisabled || isReadOnly`.

**The caret is suppressed while disabled, and only while disabled.** A disabled-but-reachable field is
focusable by design, and the browser draws a blinking caret in a `readonly` input — an invitation to type
that the field will refuse. `caret-color: transparent` on `[aria-disabled='true']`, with `!important`
because a consumer's `caret-color` reaches the input through `computeTextStyle`. Read-only keeps its
caret, since keyboard navigation and selection inside it are the point.

Read-only is a real feature, so `getIsReadOnly` is public, `aria-readonly` reflects only the consumer's
intent and `aria-disabled` reflects disabled. There is deliberately **no redundant JS guard on the input
path** — `readonly` is the single mechanism and a browser cannot deliver an `input` event past it. The
mouse handlers keep explicit gating, because `readonly` does not suppress `mouseenter` / `mouseleave`.

**Native constraint validation stays out.** `required` / `pattern` produce a UA-painted bubble, which is
paint the library would be emitting; `hasError` is the owner's. `maxLength` is out for a different reason:
the owner's setter owns transforms, and an attribute that truncates silently would be a second mechanism.

**`syncElement` is `BinarySwitch`'s function with two problems `BinarySwitch` never had.** Same premise —
the browser mutates `value` before `input` fires — except on every keystroke rather than a rejected
toggle.

- **Assigning `value` collapses the caret to the end.** The sync captures `selectionStart` /
  `selectionEnd`, writes only when `element.value` actually differs, and restores; the accepted path
  therefore never touches the selection. The `null` guard is load-bearing: `type="email"` and
  `type="url"` do not support the selection API, so the properties read `null` and `setSelectionRange`
  would throw. Truncation needs no special case — `setSelectionRange` clamps.
- **Writing mid-composition destroys it.** An `isComposing` signal gates both the sync and the report,
  and `compositionend` reports and re-syncs. Chrome and Firefox fire `input` after `compositionend` while
  Safari has historically fired it before; running the report from both is idempotent.

Both are read inside the render effect, so ending a composition re-syncs on its own.

_Corrected after the fact: that re-sync is real, and in the original ordering it destroyed the commit._
`handleCompositionEnd` cleared the composing flag **before** reporting. Clearing it re-runs the render
effect synchronously, `syncElement` finds `element.value` holding the text the IME just committed and
`getValue()` holding the pre-composition state, and writes the stale state over it — after which
`reportValue` reads the clobbered element and reports the old string. Composing `にほ` into `Ada` and
committing `日本` left both DOM and state at `Ada`. The report now runs first and the flag flips after, so
the re-sync finds nothing to write; a refusing or transforming owner still gets its correction one step
later. Found by the first run of the interaction suite, which is the whole argument for having one — the
ordering reads as correct and nothing about it is visible in markup.

**Transforms compose through `onInput`, not through a derived signal.** `TextInput` writes `valueSignal`
with the raw value then calls `onInput`, exactly as `Checkbox` writes `checkedSignal` before reporting, so
a consumer wanting upper-casing or digits-only writes the signal a second time from `onInput` and the sync
corrects the DOM. Handing `TextInput` a hand-built `[getter, transformingSetter]` pair was abandoned:
Solid's `Setter<T>` is an overloaded type a plain `(value: string) => void` cannot satisfy, so it needs a
cast at every call site to express what the sanctioned path already does.

**`isEmpty` and `isReadOnly` join the flags, now a trend rather than an exception.** Both follow
`checkedState`: added to `ExternalInteractionFlags`, exposed as `getIsEmpty` / `getIsReadOnly`, and
`getIsEmpty` `Omit`ted from `TextInputProps` because the component owns the value. `getIsReadOnly` stays
public. The painter does **not** receive the value: the input already renders it, and a painter drawing it
too would double it. `isEmpty` is the summary driving placeholder and floating-label paint, nothing more.
The cost is in `backlog.md` — `ExternalInteractionFlags` is on its way to being the union of every
control's private state.

**`number` is a type, not a component.** _Corrected after the fact: this originally argued for a separate
`NumberInput`, because writing `String(state)` back on every keystroke makes `"1."`, `"-"` and `"1e"`
untypeable and `setSelectionRange` throws on `type="number"`. Both claims are true, and neither was a
reason for a component._ The argument rested on an unstated assumption: that a number field means
`valueSignal: Signal<number | undefined>`. It does not. **The DOM's value is a string for every input
type**, and with `Signal<string>` the round-trip never happens — `syncElement` compares strings, finds
them equal, writes nothing. The `setSelectionRange` hazard was already handled by the `null` guard written
for `email` and `url`.

So `"number"` is a member of `TextInputType`, and it needed three behavioural attributes (`getMin` /
`getMax` / `getStep`, driving arrow-key stepping) and one CSS rule suppressing the spin buttons, which are
UA paint. Consumers who want a number derive it from the string.

This generalises: **an HTML input type is not a reason for a component.** `Toggle` was not one because its
difference was paint; `number` is not one because its difference is an attribute. What earns a component
is behaviour the shell has to own — which `RadioGroup` had and neither of these did.

**One caveat `type="number"` carries and the library cannot repair.** During bad input — a lone `"e"`,
`"-"`, `"1e"` mid-typing — the HTML value sanitisation algorithm makes `element.value` return `""` while
the field still shows the characters. State and screen diverge, nothing in the DOM exposes the visible
string, and `syncElement` sees two empty strings and correctly does nothing. The visible symptom is
`isEmpty` reporting true with text on screen, so a `renderPlaceholder` overlay draws over it.
`type="text"` with `getInputMode={() => "decimal"}` avoids it and is better wherever the placeholder or an
exact value matters.

**Password is not a component.** Its only distinguishing behaviour is revealing, which is `getType`
flipping between `"password"` and `"text"` over a signal the consumer owns — the audit's "`Toggle` needs
no new library code" result again. The Playground demonstrates it with a `Toggle` beside the field.

**`LabelUtils.resolveAriaLabel` was extracted rather than copied.** The context read, the suppression and
the warning lived inline in `BinarySwitchElement` and are needed identically here — the
`computeIsReachable` situation, so it moved to `Label.utils.ts` under the same namespace idiom, and the
warning lost its `BinarySwitch:` prefix.

**The shared composite this section predicted is `TextField`** (below). Everything settled here still
holds, one file down, and `TextInput` is a dozen lines on top of it.

### Controls: `TextField` extracted, with `TextInput` and `TextArea` as presets

Settled, on the terms `TextInput` had already written down: a private shared leaf
parameterised by its element, presets that `Omit` what does not apply, in the `BinarySwitch` shape — and
**not** a `"textarea"` member of the type union, which would be a type that silently changes the element.

**Nothing about `TextInput` changed except where it lives.** `Fundamentals/Input/TextField/` holds the
base; `TextInput` is `<TextField {...props} getElement={() => "input"} />` and `TextArea` the same with
`"textarea"`. The base is absent from `index.ts`; only `TextField.types` ships. The types moved with it
and the old names are gone rather than aliased: `TextFieldFlags`, `TextFieldTextStyle`, `TextFieldType`,
`TextFieldMode`. `Select` imports the text style from the base, and the Playground's painters were renamed
— `PageTextFieldContent` / `PageTextFieldPlaceholder` / `PageTextFieldAdornment` — since one painter now
serves three shells.

`TextSync` widened to `HTMLInputElement | HTMLTextAreaElement`, exported as `TextSyncElement`. Both carry
`value`, `selectionStart`, `selectionEnd` and `setSelectionRange`, so the caret restore is unchanged
rather than branched.

**The element is a `Dynamic`, and that is the whole parameterisation.** One attribute list, with the two
element-specific attributes computed: `type` is `undefined` on a textarea, `rows` on an input. This also
tightened `min` / `max` / `step`, now emitted only for `type="number"` — the browser ignores them
elsewhere, but a `type="text"` field carrying them is a lie in the DOM, and `NumberInput` is a
`type="text"` field that owns a range.

**Auto-growing height is opt-in, and the only thing that could not be inherited.** A fixed textarea leaves
the settled arrangement untouched: the painter sizes the box, the element covers it, `rows` is beside the
point. An auto-growing one inverts that — content decides the box — and the resolution keeps the inversion
out of the overlay and puts it on the wrapper. `getIsAutoSizing` turns it on, `getMinRows` (default 2, the
native default) is the floor, `getMaxRows` the optional ceiling.

The measurement mirrors `getMinWidth` one axis over. `InteractionWrapper` gained `getMinHeight`;
`TextField` sets the element's `bottom` to `auto` for one frame, reads `scrollHeight`, restores it, and
clamps against the row floor and ceiling. `scrollHeight` includes the element's padding and the element
has no border, so the number _is_ the root height needed. `bottom` is the only property touched, because
the class already carries `height: auto !important` and an absolutely positioned box with `top`, `bottom`
and `height: auto` takes its height from the insets. Nothing Solid writes as an inline style is disturbed.

**A growing root only moves the painter if the painter lets it.** The root is `display: flex` with
`align-items: stretch`, so a painter declaring no height follows the root. Same limitation `getMinWidth`
records, load-bearing in the other direction: an auto-sizing `TextArea` wants a painter with no height, a
fixed one wants a painter that sets one. The Playground says which through `getIsStretched` / `getHeight`
on its own painter.

Two smaller consequences. **The re-measure listens for width, not height**, because publishing a height
the observer then reads back is a loop; it compares `inlineSize` against the last one and returns early.
And **`overflow-y` is `hidden` while growing uncapped**, so no scrollbar flickers in during the frame
between a keystroke and the new floor, and `auto` otherwise.

**`resize` is `none`, deliberately without `!important`.** A user-dragged element would decouple the
element's box from the painted box. The other resets carry `!important` because a real conflict was
observed; no such selector exists for this property — a bare `textarea { resize }` is weaker than a class
and loses already. Escalating on suspicion is the defensive habit that rule warns against.

### Controls: `NumberInput`, and the first preset that earns a codec

This does not reopen _"`number` is a type, not a component"_ — it passes that
test. Four things a consumer would otherwise write per field, none of them an attribute: the ladder
stepping walks, clamping when the field is left rather than per keystroke, refusing characters that cannot
appear in a number, and the string-to-number codec.

**It is a `type="text"` field**, which the caveat above already recommends: under `type="number"` the
sanitisation algorithm makes `element.value` return `""` during half-typed input, so `isEmpty` lies and a
placeholder overlay draws over what was typed. A field whose job is to own a number cannot afford that.
What the browser stops providing — spin buttons, arrow stepping, the spin-button role — the shell
provides.

`getIsSpinButton` on `TextFieldState` is exactly the `getIsSwitch` shape: the base computes
`role="spinbutton"` and publishes `aria-valuenow` / `aria-valuemin` / `aria-valuemax` from the value and
range it already holds. `aria-valuenow` is omitted while the text does not parse.

**`valueSignal` is `Signal<number | undefined>`, and `undefined` means an empty field.** The one place the
`Signal<string>` rule is deliberately broken, because the codec is the feature. A private `Signal<string>`
still runs the element, so the `"1."` hazard is untouched — the string signal is what `TextSync` compares
and the number is never written back over it. `undefined` rather than `0`, because a `0` would be a value
the user did not type.

**Typing is refused character by character rather than parsed and rewritten** — the transforming-setter
idiom moved inside the control. `NumberInputUtils.sanitizeText` keeps a character only where it can legally
appear: one sign at the front, one more after an exponent, one decimal point, one exponent and only after a
digit. Written to keep half-typed values typeable rather than to accept only complete numbers: `-`, `1.`,
`1e` and `1e-` all survive, each reporting `undefined` upward until it parses.

**Clamping happens on blur, not on input.** Per keystroke it makes the second digit untypeable — with a
minimum of 40, typing `5` becomes `40` before the `0` arrives. Stepping still clamps immediately, because
a step is a complete gesture and typing is not.

**The step ladder counts from `min`, not from zero**, matching a native number field: a value on a rung
moves a whole step, one between rungs snaps to the next rung in the direction of travel. `computeStep`
runs the arithmetic in whole units of the smallest decimal in play rather than in floats, so `0.1` from
`0.3` gives `0.4` and no epsilon has to be chosen. Pure function in `NumberInput.utils.ts` with tests.

**The stepper reaches the painter through `renderTrailing`, widened rather than duplicated.**
`NumberInput` re-declares that slot as `(getFlags, stepper)`, the same widening `InteractionTooltipDefs`
does. A second `renderStepper` slot loses: both want the same physical position, and one slot lets a
painter draw a unit and a stepper together. The `stepper` carries `stepUp` / `stepDown` plus `getIsAtMin` /
`getIsAtMax`, so a painter can disable the end of the range it has reached — flags stay pure state, actions
stay out of them.

**`onKeyDown` and `onBlur` exist on `TextFieldCbs` and are `Omit`ted from both public presets.** The
arrows, `Home` / `End` and the blur-clamp need them, and the base is where they belong; whether `TextInput`
should expose them is a separate question, and answering it as a side effect would be smuggling.

**`untrack` on the mirror is the fix for a real flip-flop, not a micro-optimisation.** The effect
restating the text when the owner writes a new number must read the text _untracked_. Tracked, it also
re-runs when the text changes — and `TextField` writes the raw text into the signal before the preset's
`onInput` sanitises it, so for one moment the text says `"1"` and the number still says `undefined`. A
tracked effect fires in that gap, formats `undefined` back to `""`, and the two fight: the observed
symptom was a caret jumping to the start and digits arriving in reverse. The `ImageSwitcher` shape — an
effect whose job is one-directional must only depend on the direction it syncs from.

### Controls: `Range`

`backlog.md` predicted this would be the most architecturally novel control left
and got the central call wrong, which is the most useful thing to record.

**A two-thumb range _is_ two native `<input type="range">` elements, one per thumb.** The prediction was
that two thumbs had nowhere to go under overlay geometry, so both thumb counts would be custom. Each thumb
is its own input, absolutely positioned `inset: 0` over the same painter, so a pair is the single case
rendered twice and the two modes cannot diverge in paint, keyboard or ARIA. Native also keeps `step`,
`Home`/`End`, `PageUp`/`PageDown`, drag and the track-click jump.

`Range` therefore did **not** need `backlog.md` #2's pointer primitive, and item 2 stays open for the
thing that does — a two-dimensional colour surface, which has no native equivalent.

**Crossing is prevented by the inputs' own `min` and `max`, not by JS.** Thumb `n`'s `min` is thumb
`n-1`'s value and its `max` is thumb `n+1`'s, so the browser clamps drag and keypress identically and no
guard can be forgotten. The cost is the tie: two thumbs on the same value cannot move through each other,
so which one you grab decides which way you can go. `raiseNearestThumb` resolves that on `pointermove` —
the input nearest the pointer gets `z-index: 1`, and on an exact tie the side of the pointer decides.
Verified in a browser with both thumbs at 80.

**Ranking has to happen on `pointermove`, before the press.** `pointerdown` is too late — the browser has
already picked the event target and begun its native drag. The move handler is skipped while a button is
held (`e.buttons === 0`) so a drag in progress cannot be stolen.

**The library owns the thumb's hit size; the painter owns its appearance.** `appearance: none` leaves the
thumb with no size in Chromium, which kills dragging, so `Range.css.ts` styles
`::-webkit-slider-thumb` and `::-moz-range-thumb` — transparent, sized from `getThumbSize`. That number
and the painter's visible thumb must agree and nothing enforces it: exactly `TextInput`'s
padding-versus-inset cost, paid the same way with one shared `RANGE_THUMB_SIZE` constant.

It is also why the painter is handed `ratios` rather than percentages. A thumb's centre travels between
`thumbSize / 2` and `length - thumbSize / 2`, never the full track, so `left: ratio%` would overhang both
ends. The painter positions with `calc(ratio * (100% - thumbSize))`, which it can only write because it
knows the thumb size.

**One prop per mode, and giving neither or both warns.** `valueSignal: Signal<number>` drives one thumb;
`rangeSignal: Signal<RangeValues>` drives a pair. A single `Signal<number | RangeValues>` would force
every plain-slider consumer to narrow a union on every read, and a generic would hit the `AccessorProps`
hole. Mode is structural rather than a `getMode` prop because the value's shape carries it.

**The selection is `{ start, end }`, and the scale keeps `min` / `max`.** The pair's fields were `min` /
`max` for one draft, which collided badly: `getMin` would be the floor of the track while
`rangeSignal[0]().min` was the floor of the selected band. `getMin` / `getMax` match the native attributes
and `TextInputState` already uses them.

`start` / `end` over `from` / `to` on published precedent rather than taste. Adobe's React Spectrum
`RangeSlider` takes `{ start, end }`; MUI's prose describes its array as "the start and end of a range";
Radix is `number[]` and offers no names. The only major library with other names is Ionic's
`{ lower, upper }`, whose type is the single union this component avoided. Nothing checked uses `from` /
`to` for a slider — that reads as a date-range and filter idiom.

`RangeValues` and `RangeSpan` are the same shape on purpose: the selection is in scale units and
`flags.fill` is the same span as 0..1 ratios.

**Disabled refuses the write and pushes the element back.** A range has no `readonly`, so the guard is
the `BinarySwitch` shape: the browser moves the thumb before firing `input`, so a refused value is
overwritten by `syncElement`. Both paths run it, since the accepted path is also where an owner may clamp.

**Vertical is `writing-mode: vertical-lr` plus `direction: rtl`, with no fallback — accepted.**
The `direction` puts the low value at the bottom. Per MDN, vertical form controls via `writing-mode` "only
gained full browser support in 2024", and this is `src/Lib`, so the baseline was put to the user and taken.
The older routes could not have been layered underneath anyway: `appearance: slider-vertical` cannot
combine with the `appearance: none` that strips UA paint, and Firefox's `orient="vertical"` is
non-standard. On an older engine a vertical `Range` renders horizontal rather than degrading.

The first hard modern-CSS dependency in `src/Lib` with no fallback, so it is the precedent
_"Compatibility arguments"_ will be cited against. It is a real one: argued from a dated support claim and
sanctioned explicitly, not inferred from the Playground.

### Controls: `Tabs` as records, and the shape a data-driven group has to take

Settled, as the rehearsal for `Select`. `Tabs` predated the control model and was the last
component contradicting it: it hand-rolled its `<button>` / `<a>` and set native `disabled`. It is now
`InteractionWrapper` per item plus an unexported `TabsItem` leaf, in the `Button` shape.

**Parallel arrays became one array of records.** `getTabCount` + `getHrefs` + `computeIsDisabled` were
three sources indexed against each other; now `getTabs: Accessor<Tab<T>[]>` with
`Tab<T> = { value, href?, isDisabled? }`. This answers the objection recorded under `RadioGroup` — that
data-driven groups "grow a `compute*` prop per capability and re-expose all of them per index". True of
_indexed callbacks_, not of data: a capability is a field, and adding one costs nothing at the call site.
The earlier entry rules out the callback form only.

**Identity is the value, never the position.** `getSelectedIndex` / `onSelectionChange(index)` became
`getSelectedValue` / `onSelectionChange(value)`. An index is stable only while the list is, and a filtered
or searchable group changes exactly that. Everything internal resolves through the value and treats the
index as a lookup result.

**`<Index>`, not `<For>`, and that is why `renderTab` takes an accessor.** Records are rebuilt on every
filter keystroke, so `<For>`'s by-reference keying would remount every row, losing focus and every ref.
`<Index>` keys by position and lets the record change under a stable node, so the painter must subscribe:
`renderTab(getTab, getFlags)`. The one place the choice of list primitive dictates a prop's shape.

**Refs replace `querySelectorAll`.** The old `:scope > a, :scope > button` walk could not survive the
wrapper, option groups or a painter rendering a `Button`. Each slot reports its control element through
`InteractionWrapper`'s `ref`, so the element list is keyed by the same index as the data. Registration in
the `RadioGroup` sense is unnecessary: the group already owns the array.

**Selection stays one-way, and this is where `Tabs` and `RadioGroup` legitimately differ.** `RadioGroup`
takes `valueSignal` because it owns its value; a `Tabs` with `hrefs` does not — selection is derived from
the route, the case _"Signal tuples for two-way state"_ records as the shape's cost. `getSelectedValue`
plus `onSelectionChange` keeps the router as owner.

**The floater measures the wrapper, not the control.** `interactionRoot` is `position: relative`, so
wrapping each item reparented the control's `offsetParent` and `offsetTop` / `offsetLeft` reported `0`.
The observer hops one level to `control.offsetParent`, which is exact: the wrapper's box equals the painted
box by construction, and `offset*` is unaffected by `Viewport`'s `transform: scale()`.

**`tooltipDefs` is not on the record yet, for a real hazard rather than YAGNI.** `InteractionWrapper`
branches on prop _presence_, so a record field would be forwarded conditionally and a tab gaining or
losing a tooltip mid-life under `<Index>` reuse would not pick it up. Solid's props getters do make the
conditional reactive, so it can be made to work; it is left out because `Tabs` has no use for it and
untested API is worse than absent API. `Select` will want it.

**A consumer selecting on `:disabled` breaks when a control stops lying about it.** The Playground's
`tabCategory` reset the cursor through `:disabled &` and silently stopped applying; it became
`[aria-disabled='true'] &`. The visible tail of the mechanism decision: consumer stylesheets written
against native disabled do not fail loudly.

**Verified by headless dump**: `role="tablist"`, one `tabindex="0"` across the list with the rest at `-1`,
`aria-selected` on the right item, a floater at a real offset — also the proof that the `offsetParent` hop
resolves and that `ref` forwards through the router's `A`. The disabled-tab half of that proof now lives
on `TabsPage`, since the category item it used no longer exists.

**The list names itself and states its axis.** Added, when `TabsPage` put five tab lists on
one page. `getAriaLabel` lands on the `role="tablist"` element, `RadioGroup`'s arrangement for the same
problem. `aria-orientation="vertical"` is set whenever `dir` is `column`: a tab list is horizontal by
default, so a stacked one that does not say so tells a screen reader user to press the wrong arrows. Not a
general rule about `dir` — it is stated here because `tablist` has a published default a column
contradicts.

### `TabPanel`: the pairing is written on the record, and read from both ends

A tab must name the panel it opens and the panel must name the tab back, and the
two elements have different owners — the library owns the tab, the consumer owns the panel — so neither
can complete the link alone.

**Both ids are fields on the record, and neither is generated.** `Tab<T>` gains `id` and `panelId`;
`Tabs` writes them as the tab's `id` and its `aria-controls`, and writes nothing when absent. Radix and
React Aria generate the tab's id privately, which they can only do because their panels are enclosed by
their root. Here a panel may be a page the router mounts elsewhere — the Playground's left menu is that —
so a generated id would have no route to the element that must quote it.

**`TabPanel` is the other end, a wrapper in the `Label` sense**: `getId` and `getTabId` become the panel's
id, `role="tabpanel"` and an `aria-labelledby`. Two strings rather than the record, since two strings are
all it reads. It holds no state and does not decide whether it is mounted. `tabindex="0"` is
unconditional, matching Radix, because a panel of plain prose offers a reader arriving from the tab list
nothing else to land on, and testing for focusable descendants would mean measuring consumer content on
every render.

**It carries no class**, so a consumer's flex or grid child would become this element rather than their own
box. Copy the Playground: `PageTabPanel` holds the `TabPanel` and paints inside it, so the library element
is absorbed by the styled component and layout stays outside both.

**Driven by `tabs.spec.ts` against `TabsPage`, not the Playground's left menu.** The menu is app
furniture — adding a page or renaming a category used to break the keyboard spec and read as a `Tabs`
regression, which happened once. The page carries a row, a column, links, a consumer link component and an
all-disabled list.

### The left menu is one tab list per category

Settled, on the user's call between three options. The menu was a single `role="tablist"`
holding every entry, with `Exotics`, `Fundamentals` and `Composites` inside it as disabled tabs. A tab list
may own tabs and nothing else, and those three were never destinations. They are now `<h2>` elements
outside the lists, and each category gets its own `Tabs` named by `getAriaLabel` with the same text.

**The cost is one tab stop per category rather than one for the menu**, accepted rather than overlooked:
arrows walk within a category and `Tab` crosses between them. The rejected alternative — dropping the
category names from the markup — keeps one stop but tells a screen reader user nothing about a grouping the
sighted user can see.

**The `Tab<T>` `id` / `panelId` pairing is wired here too.** Each component config derives both from its
own name and the routed page is wrapped in `TabPanel`, so the menu stopped being the standing example of a
tab list naming a panel nobody wrote. The `backlog.md` bullet this fixes is about the library, not the
menu: nothing still forces a consumer to do it.

**A category whose entries are all filtered out disappears, heading and all** — an empty heading over an
empty list is furniture with nothing under it. The rule that survived untouched, and the one the `Select`
autocomplete argument rests on: the currently selected entry stays visible even when it does not match.

**`Tabs` stopped orphaning its floater as part of this.** With one list the marker could never be stranded;
with several, the list that used to hold the selection kept drawing its own, because the positioning effect
returned early on "no selected item" instead of acting on it. The first fix cleared the stored bounds and
was superseded a day later by the fader below — the bounds are what the exit animation draws from.

### The floater appears and disappears through `ElementFader`, like every other library element that comes and goes

Settled, at the user's request, once the menu split made a floater that comes and goes
normal. A tab list with no selection has no marker, and that was a hard cut: in the document one frame,
gone the next, with no way for a consumer to fade, shrink or slide it.

**`renderFloater` now takes the same pair every appearing element's painter takes** — a visibility target
of `0` or `1` and the transition duration — which is `Tooltip`, `Popover`, `Modal`, `Toasts` and
`Spotlight`'s signature, transition pair first. `ElementFader.createFader` is driven by "is there a
selected tab whose position we have measured", and the element is mounted while the fader says visible
**or** still transitioning.

**The duration is `getTransitionDurationMs`, the knob the floater already had**, rather than a second one
beside it: a list that slides in 300ms and fades in 80ms describes two animations to one eye. A consumer
who wants them apart puts a CSS `transition` in their painter.

**The stored bounds outlive the selection and die with the element, and both halves are load bearing.**
They are the last place the marker was, which is where the exit is drawn, so clearing them when the
selection goes unmounts the element with nothing to play out. Keeping them past the exit is the other
error and the one that shipped first: a list still holding a position starts its next entrance there, so
the marker returned where it had left and slid across to the new tab over the deliberately long duration.
A second effect watches the fader and clears them once the element is genuinely gone; the positioning
effect re-fills them on a selection change, and the render is gated on having bounds at all, so an entrance
cannot precede a fresh measurement.

The tail of `tabs.spec.ts` measures the rendered box rather than waiting for the entrance to settle — a
slide and an entrance take the same duration, so anything polling until the painter reaches its shown state
has already let the slide finish and passes either way. Checked by putting the fault back and watching the
assertion fail by 106 pixels.

**`TabsPage` grew a variant whose selection can be cleared**, since none of the other five can lose theirs.
It sets a longer duration on purpose: the middle of a 200ms transition is neither watchable by eye nor
readable by a spec without a race.

### `Anchor`: a placement may fall back within its family and never outside it

`getSafeHPlacement` and its vertical twin choose between candidates by asking each where the content would
land — `getHPlacementShift` plus that candidate's own `getHPlacementOffset` — and taking the least
overflow. They used to hand-derive a "space" figure per branch from the anchor's edges, which is how the
`in` branch came to ignore the content size and place content off-screen in 78 of a 240-case sweep.
Deriving the span from the functions that do the positioning makes that class of error unexpressible, and
fixes a second one: the offset was previously computed once from the _requested_ placement and reused to
judge its mirror, whose offset has the opposite sign.

**A placement never crosses between `in` and `out`.** `in` means aligned to an anchor edge and overlapping
it; `out` means beside it. Choosing between them is the consumer stating a relationship, not a hint — a
tooltip that hops from inside its anchor to outside has changed what it means. So `left-in` may become
`right-in` and `left-out` may become `right-out`, and nothing else. `center` may fall back to either `in`,
since a centred layer already overlaps.

The cost is measured: when an anchor is itself clipped by the viewport there are cases where no `in`
placement fits and an `out` one would have. All of them require the anchor to be partly off-screen.

**Content that fits nowhere takes the least-overflow candidate and may run off the screen.** `getPosition`
never clamps. Clamping would keep content visible at the price of detaching it from the edge it was aligned
to, which is the same trade as crossing families and refused for the same reason. A layer wider than the
viewport is the consumer's to size.

### `Anchor`: the positioning half of a floating layer, extracted

Settled, as the other half of the `Select` groundwork. A dropdown needs everything `Tooltip`
knows about placing a box against an element and nothing it knows about when to show one.

**The split is behaviour from markup**, and the existing rule decides where it falls: _"it renders DOM, so
it is not an `Abstract`"_ means the extraction is the effect, not the popup. `Abstracts/Anchor/` holds
`AnchorUtils` (the placement math, formerly `TooltipUtils`, moved unchanged) and
`Anchor.createPortalPosition(getAnchorRef, getIsVisible, opts)`, which observes the anchor, measures the
content, resolves the collision-safe placement and returns `{ getPlacement, getPosition, setContentRef }`.
`Tooltip` lost sixty lines and kept its triggers, `aria-describedby`, `role` and markup.

**The name carries the coordinate space**: `createPortalPosition` returns a position in the `Viewport`
portal's space, which is what a consumer assigns to `top` / `left` on a portalled element. The anchor rect
still comes from `createViewportRectObserver`, so the scale factor is divided out exactly once.

**What stays duplicated is the dozen lines of `<Show><Portal><div>`, deliberately.** Both consumers portal
into the same mount and position absolutely, but disagree about everything else — a tooltip is
`role="tooltip"` and `pointer-events: none`, a listbox is clickable, focusable and `role="listbox"` — so a
shared component would be a two-mode component. Behaviour is shared; markup is not.

`Tooltip` is not renamed. `AnchorPlacement` replaces `TooltipPlacement` (and its `H` / `V` halves) because
the type is now shared vocabulary.

### Controls: the flags are extensible, and a painter is typed to its own control

Settled, on the trigger `backlog.md` named — `Select` wants `isOpen`, `isFiltering` and
more.

**`InteractionFlags<TExtra>` is generic with a `{}` default**, so nothing without extras changed. A control
with private state declares it — `BinarySwitchFlags = { checkedState }`,
`TextInputFlags = { isEmpty, isReadOnly }` — and threads it as `InteractionWrapperProps<BinarySwitchFlags>`,
so its painters receive exactly what it can produce.

**The wrapper receives the extras as one accessor, not a prop per flag.** `getExtraFlags?: Accessor<TExtra>`
is merged into `getFlags` last. This replaces `getCheckedState` / `getIsEmpty` / `getIsReadOnly` and the
`Omit`s that hid them: a private flag is never a public prop in the first place, and only `getExtraFlags` is
omitted, once, per preset.

**The generic props are declared by hand.** `renderControl`, `renderDecoration` and `tooltipDefs` all
mention `TExtra`. The first two would have survived (a function type is not a naked parameter) but sit with
the others so the block reads as one rule and the next prop added there cannot get it wrong.

**Extras are required fields, not optional.** `checkedState: CheckedState`, because the control always
produces one. The universal flags stay optional, since a wrapper genuinely may not know.

**The type immediately found an over-typed painter**: `PageTextFieldAdornment` was typed as a text-input
painter but reads only `isHovered` and `isDisabled`, and the Playground puts it inside a `Button`. Invisible
under one flat flag type; an error at the call site under the generic.

`CheckedState` moved from `Interaction.types.ts` to `BinarySwitch.types.ts`, and `isReadOnly` left the universal set with it — it is a
text concept here, so `getIsReadOnly` is declared on `TextInputState`.

### Controls: `Select`, and who owns a floating list

This and the two `Select` headings after it are what remains of a design brief
deleted once it shipped; `backlog.md` #6 carries what was left out.

**One `mousedown` `preventDefault()` on the popup root is what makes the whole model work.** The options
live in the `Viewport` portal, so clicking one would blur the field. Refusing the default action of
`mousedown` means focus never leaves the field. Three things fall out, and they are why `Tooltip` could not
have been the dropdown: an option click cannot dismiss the popup before the click resolves;
`aria-activedescendant` is honest, because focus really is on the field; and **close-on-blur becomes correct
rather than fatal**, so there is no document-level outside-click listener.

**The field is a `<button role="combobox">`.** The APG select-only pattern uses `<div tabindex="0">`, which
means re-implementing focusability and activation a button has for free, and the house rule is that the leaf
is a real element with real semantics. `Enter` and `Space` are handled in `keydown` with `preventDefault()`,
which suppresses the button's synthesised click — otherwise every keyboard activation toggles twice.

**Options are `role="option"` divs, never buttons, never tab stops.** `getIsTabbable={() => false}` puts
them at `tabIndex -1`; a button inside a listbox breaks option semantics. The consequence a painter must
know: **`isFocused` is never true for an option**, because focus is on the field. Hence their own extras.

**`isHighlighted`, not `isActive`.** `SelectOptionFlags = { isHighlighted, isSelected }`.
`InteractionFlags.isActive` already means "held down" across every control.

**The highlight is a value resolved to an index — never a stored index.** Same shape as `Tabs`' roving
entry: a `highlightedValue` signal and a memo resolving it against the navigable indexes, falling back to
the selected option then the first navigable one. Opening therefore highlights the selection with no
imperative set, and a list changing under a filter cannot leave the highlight pointing elsewhere.

**The painter owns the panel, so the option list arrives as a thunk.**
`renderPopup(renderOptions, getVisibilityTarget, getTransitionDurationMs, getPlacement, getFlags)` — the
consumer returns their own bordered, scrolling, animating box with `{renderOptions()}` inside. The
`renderDecoration` shape (an absolutely-positioned painter behind a library-owned list) was rejected: a
decoration cannot scroll with the content, which would force `max-height` and `overflow` into library props.
`role="listbox"` stays on the library's positioned root and options are descendants at whatever depth the
painter nests them, which ARIA allows as long as nothing between carries a conflicting role.

**Geometry is the library's, including the width floor.** `createPortalPosition` also returns
`getAnchorRect`, and the popup root sets `min-width` from it. A painter cannot compute this — it is portalled
away from the field — and a dropdown narrower than its control is a positioning artefact, not a style choice.
Everything above the floor stays the painter's, exactly as `getMinWidth` draws that line for adornment insets.

**`pointer-events` is switched off for the closing fade**, since `ElementFader` keeps the popup mounted for
the transition and a click during those 200ms would select a second time from a list visually leaving. The
inline style overrides the `pointer-events: all` the class needs while open.

**Single-select first, and no shared private composite yet.** `valueSignal: Signal<T | undefined>` is what a
consumer already holds; `Signal<T[]>` for both cases would tax the common one and make "nothing selected"
representable twice. Multi differs in behaviour, so the `BinarySwitch` shape is the likely end state, but
erecting it before a second consumer would be guessing at the seam.

**The keyboard walk stops on reachable-disabled options and refuses to select them**, matching `RadioGroup`.
`getNavigableIndexes` calls `InteractionUtils.computeIsReachable` with the option's own three fields rather
than re-deriving the rule.

**`scrollIntoView({ block: "nearest" })` on the highlighted option** is the only way the library reaches a
scroll container the painter owns. It runs from an effect on the highlight, so it covers opening onto a
selection far down the list as well as the walk.

### Controls: `Select`'s autocomplete, and why the consumer filters

The question was whether `Select` owns a default matcher with a `computeIsMatch`
escape hatch, or owns only the query string.

**The consumer filters, and the precedent is the Playground's own left menu.** `Tabs` has no filtering API:
`AppContent` owns the search box, the query, and derives each list's tabs. Its rules are the argument — it
decides what a fully-filtered category does, and it **keeps the currently selected item even when it does
not match**. Neither is expressible by a library matcher over an unknown `T`, and the second silently breaks
a select whose matcher would filter the selected option away. The `Select` page makes the point from the
other end: it matches an airport on **either its city or its IATA code**, two fields the library cannot know
exist. Ownership follows knowledge.

**`Select` owns the query, because the query is the field's text.** `querySignal: Signal<string>` is a
`*Signal` by the existing rule, since the component writes it on every keystroke and the consumer reads it
to derive `getOptions`. The loop through the consumer is a plain memo, not a cycle.

**"No matches" stopped being a flag.** The candidate `hasNoMatches` is gone rather than deferred: the consumer filtered, so it already knows the result is empty, and
its empty state is its own JSX inside `renderPopup`. A flag would be the library telling the consumer
something they just computed.

**The mode is `querySignal`'s presence, and this is the one sanctioned use of that.** No `getIsAutoComplete` boolean beside it. _"Presence as a
trigger fails invisibly"_ warns about a prop whose real purpose is something else quietly changing
semantics; a query string has exactly one purpose, an editable field with nowhere to put its text is
incoherent, and forgetting the prop yields a working non-editable select — so it fails toward the safe
default. Precedent: `Tab<T>`'s `href` choosing `<a>` over `<button>`.

**One leaf, two elements, in the `TabsItem` shape.** `SelectField` holds a `commonProps` object of getters
for the shared ARIA and a `<Show>` rendering either a `<button>` or an `<input>`. The `<input>` follows
overlay geometry, and `getPadding` plus `computeTextStyle` are the same two props `TextInput` uses.
`TextInputTextStyle` is imported rather than re-declared: same concept, and duplicating a twelve-key `Pick`
to avoid a sibling import is the worse trade.

**The painter draws the selection, the input draws the query, and `isFiltering` decides which is visible.**
The two texts are stacked by the overlay geometry, so the painter fades its value text out while the query
is non-empty and back in when it clears — so no option ever needs a `label` field for the field to display a
selection.

**The component clears the query, and waits for the fade to finish.** Closing ends the interaction, so the
query is the component's to reset; doing it in `close()` repopulated the consumer's list mid-fade and
visibly re-grew the box. It now runs off `ElementFader`'s `getHasTransitionFinished`, guarded on the query
already being empty so it never writes on mount.

**An editable field takes the keyboard back.** `Space` types a space instead of selecting, and `Home` /
`End` move the caret instead of jumping to the first or last option — both gated on the mode, because
hijacking either in a text field is a bug rather than a shortcut. `Enter`, `Escape`, `Tab` and the arrows
are unchanged. Typing opens the popup and resets the highlight, so each keystroke re-highlights the first
option of the new list.

**While filtering, the highlight prefers the first option over the selection.** Otherwise typing `lis` with
`Oslo` selected leaves the highlight on `Oslo` and `Enter` re-picks it. The limit is inherent to the consumer
owning the filter: the component knows which options are _present_, not which _matched_, so a consumer
injecting a non-matching option can still see the highlight land on it. That is theirs to fix in their own
filter, and it is why the left menu's keep-the-selected-item rule must not be copied into a select.

**`TextSync` came out of `TextInput` because a second consumer arrived.** `Abstracts/TextSync/` holds
`createValueSync(ref, value, opts)` — the element/value sync, the caret restore after a transforming setter,
the IME composition gating. Exactly `TextInput.syncElement`'s code; extracting beat duplicating fifteen
lines of caret arithmetic.

### Controls: option groups, and `Select` / `MultiSelect` as presets

Settled, completing the brief. Both landed together because they answer the same question
from opposite ends: what the option list is a list _of_, and what a selection is.

**A group is a record with children, in the same array as ungrouped options.**
`SelectItem<T> = SelectOption<T> | SelectOptionGroup<T>`, discriminated by `SelectUtils.getIsGroup`
(`"options" in item`), so a list can mix both and a group cannot be malformed — no sibling marker to get out
of order, no second prop to keep in step. `SelectOption<T>` is a closed record shape, so the `in` check
cannot be fooled by a `T` with its own `options` field.

**The tree is a rendering concern only; everything else works off the flat list.**
`SelectUtils.getFlatOptions` gives traversal order, and the keyboard, highlight, ids and selection all index
into it — so the arrow walk crosses group boundaries without knowing groups exist, and `Home` / `End` reach
the ends of the whole list. The one piece of bookkeeping is `getItemOffsets`, mapping each top-level item to
where its options start in the flat list, which lets a nested `<Index>` hand each slot its flat index.

**The library owns `role="group"` and its name; the consumer paints the header.** The wrapper is a bare
`<div role="group" aria-label={label}>` and `renderGroup(getGroup)` fills in the visible header. Two
rejections: `display: contents`, because Chromium has historically dropped such elements from the
accessibility tree and the role is the point of the element; and a `renderGroup(getGroup, renderOptions)`
thunk in `renderPopup`'s shape, which would put the ARIA role in consumer markup. The cost is that a
consumer cannot style the group box itself, only its header — recorded rather than solved, since the thunk
form is available later.

**Option refs are gone, and each option scrolls itself into view.** An array keyed by index cannot survive a
tree, since a flat index shifts when a preceding group is filtered. `SelectOptionItem` watches its own
`isHighlighted` and calls `scrollIntoView({ block: "nearest" })` on its own element, correct at any depth.

**`SelectComposite` is private, `Select` and `MultiSelect` are thin presets over it** — the `BinarySwitch`
shape, down to `SelectPresetProps<T>` being an `Omit` of the composite's props. `index.ts` exports the two
presets and the types but not the composite. The seam is four props: `getSelectedOptions`,
`computeIsSelected`, `onPick`, `getIsMultiple`. Everything else is written once.

**Multi is a preset rather than a mode flag because the value's _type_ changes.**
`Signal<T | undefined>` versus `Signal<T[]>` cannot be reconciled by a boolean, and a single `Signal<T[]>`
would tax the common case and give "nothing selected" two spellings. The composite never sees a value: it
asks the preset which options are selected and tells it what was picked. `MultiSelect` toggles membership;
`Select` replaces. That is why `renderContent` takes `getSelectedOptions` plural and `Select`'s preset
narrows it to `getSelectedOptions()[0]`.

**Picking in a multi list keeps it open, and moves the highlight to what was picked.** The second half was
found by driving it: with the highlight left alone, arrowing after a mouse pick continued from the _first
selected_ option. `aria-multiselectable="true"` goes on the listbox; `isSelected` stays a boolean, and a
tri-state for a partially-selected group header is the one thing multi might still want from
`BinarySwitchFlags`.

**`inert` is what disables a closing popup, not `pointer-events`.** A real bug: the fading popup carried
`pointer-events: none` on its root, which looked sufficient and was not — `pointer-events` is inherited, but
every option sets `pointer-events: all` explicitly (it has to, to beat `interactionRoot`'s `none`), and an
explicit value on a descendant beats an inherited one. So a click aimed at whatever sat under a closing
popup was swallowed by an option of a list already visually gone. `inert` disables an entire subtree for
pointer events, focus and the accessibility tree regardless of descendants; `FocusUtils.isReachable` already
tests `[inert]`, so support was assumed all along. **General rule: `pointer-events` on an ancestor cannot
switch off a subtree, only `inert` can.**

**Behaviours a `Select` guarantees, to re-check after touching it** — none visible in markup, and the last
two were wrong once: `Enter` on a reachable-disabled option changes nothing and leaves the popup open;
clicking an option leaves `document.activeElement` on the field; a disabled field neither opens nor takes
focus while its reachable twin stays at `tabIndex 0`; the arrow walk skips a disabled option _inside_ a group
and crosses into the next; a multi list stays open across a pick and moves its highlight to the row picked;
and a closing popup lets a click through.

### Controls: `Popover` extracted, and `Menu` as the second consumer

The standing "private until a second consumer" rule fired: `Select`'s floating layer
became `Fundamentals/Popover/`.

**This does not reverse _"What stays duplicated is the dozen lines of `<Show><Portal><div>`"_ — it is the
same argument reaching the opposite answer on different inputs.** That entry refused to share markup between
a tooltip and a listbox because they agree on nothing. A listbox and a menu are both _interactive_ floating
layers and agree on every line. `Tooltip` keeps its own dozen lines and stays out.

**`Popover` owns everything true of a floating layer and nothing about what it contains:** the portal mount,
`createPortalPosition`, the `ElementFader`, `inert` while the fade closes, the `mousedown` refusal,
`tabindex="-1"`, and the anchor-width floor. Content arrives as
`renderContent(getVisibilityTarget, getTransitionDurationMs, getPlacement)` — `Tooltip`'s signature.

**The role is the consumer's, so the ARIA that role requires is the consumer's too.** `getRole` plus one
`getAriaAttributes: Accessor<JSX.AriaAttributes>` rather than a prop per role-specific attribute.
`aria-multiselectable` is a listbox word and `aria-labelledby`-to-the-trigger is a menu word; a `Popover`
learning either would grow a branch per consumer. It sits on the same element as the role because it has to
— the options are descendants, so the role cannot be nested one level in.

**The anchor-width floor is opt-in, because the argument for it was a listbox argument.** A menu hanging off
an icon button has no such relationship and should size to its content. `Select` passes
`getHasAnchorMinWidth`, `Menu` does not.

**The fader stays inside and reports out through `onTransitionStatusChange`**, the shape `Modal` uses. A
component cannot return values, and `Select` needs the settled flag to know when it may clear the query.

**`outline: none` on the root is deliberate and is not a colour decision.** The root is focusable only to
host `aria-activedescendant`; the visible focus is the highlighted item, painted by the consumer. A ring
around the whole surface would point at the wrong thing.

**It is written twice so a consumer cannot reverse it by accident**, added later. A bare `outline`
on the class ties with a consumer's blanket `:focus-visible` rule on specificity, so the winner is whichever
stylesheet was emitted last — the Playground's was, which is how every popup grew a ring nobody asked for.
The rule is repeated under `&:focus, &:focus-visible`, which outranks a plain pseudo-class rather than racing
it. What it gives up: a `Select` whose filter emptied the list has nothing painted as focused and is
announced empty; a consumer wanting a ring there paints it on their own surface.

**The initial focus is `Popover`'s, and a real bug is why.** `Menu` first called `FocusUtils.autoFocus`
itself and focus stayed on the trigger: the root carries `visibility: hidden` until `Anchor` has produced a
position, and a `visibility: hidden` element silently refuses `focus()`. Being positioned is `Popover`'s own
state, so `getHasAutoFocus` moved the call inside, gated on `getPosition() !== undefined`. **The gate is a
memo of the boolean, not of the position**: the position object is rebuilt on every anchor observation, so
depending on it directly would re-focus the surface on every scroll.

**`Menu` moves focus to the menu, not to the items, and that is where `aria-activedescendant` is allowed to
live.** ARIA supports the attribute on composite roles — `menu` is one, `button` is not — so the APG variant
with a single focus target puts both on the `role="menu"` element. The items are then `Select`'s options
exactly: non-focusable `role="menuitem"` divs at `getIsTabbable={() => false}`, `isFocused` never true, and
a highlight held as a value resolved to an index. `FocusUtils.autoFocus` restores focus to the trigger on
close through the same `onCleanup` `Modal` relies on.

**Two keydown handlers rather than `Select`'s one**, because the two states have different focus owners: the
trigger handles the closed menu (`Enter` / `Space` / `ArrowDown` open on the first item, `ArrowUp` on the
last), the menu handles the open one. They cannot both be focused, so neither tests whether the menu is open.

**Clicking the trigger while the menu is open would otherwise reopen it.** The `mousedown` moves focus to
the trigger, the menu blurs, blur closes, and the click's own toggle then opens it again. The guard is
`relatedTarget === trigger` in the blur handler: focus going to the trigger is not a dismissal, and the
click that follows does the closing. Every other blur still closes with no document-level listener.

**`MenuFlags` is `{ isOpen }` and nothing else.** A menu carries no value, so no `isEmpty`, no
`aria-selected`, no `isSelected` equivalent, and the callback is `onActivate` rather than `onPick`.

**Dismissal was not extracted as an `Abstract`, against the plan that scheduled this work.** `Menu`'s
dismissal turned out to be `Select`'s exactly — `Escape` in a keydown, close on the focused element's blur,
no document listener — while `Modal`'s is a different mechanism (document keydown, overlay click, focus trap,
explicit restore). Two identical siblings and one that does not fit is not the shape that wants an
`Abstract`; the thing genuinely shared with `Modal` was `FocusUtils.autoFocus`, which existed.

### `Menu` submenus: a level per popup, focus moving between them

An item may carry `items`, and a level is drawn per popup all the way down.

**The choice was one focus target for the whole tree versus one per level, and support decided it rather
than structure.** Keeping focus on the root menu looked like the smaller change. It is not:
`aria-activedescendant` may only name a descendant of the focused element **or** one claimed through
`aria-owns`, and every level is portalled out to the viewport — so that variant rests entirely on
`aria-owns` across a portal, which is sanctioned and thinly supported. A level holding its own focus has its
items physically inside it, and it is the variant the APG menu examples implement: `ArrowRight` opens a
submenu onto its first item, `ArrowLeft` closes it and returns.

**`MenuLevel` is the recursion; `Menu` is the trigger plus the root level.** A level owns its highlighted
value, which of its items is open, its own popup and its own keyboard. It renders each submenu inside the
item that owns it, so a level unmounts with its parent for free and the anchor is that item's element.

**An item with children is the trigger for its level, and says so in the same words the button does** —
`aria-haspopup="menu"`, `aria-expanded`, `aria-controls` while open. `MenuItemFlags` gained `hasSubmenu` and
`isOpen` so a painter can draw the arrow and the open state, which it could not otherwise infer.

**`MenuItemFlags` is a superset of `MenuFlags`, and that keeps `renderPopup` at one signature.** A popup is
handed the flags of whatever opened it — the trigger's for the root, the parent item's for a submenu.
Disjoint flag types would have forced a union every consumer had to narrow.

**A key is handled by the level it was pressed in, and the check has to be explicit because Solid
re-dispatches delegated events through the component tree rather than the DOM tree.** The levels are
portalled siblings, so nothing bubbles between them in the page — but `keydown` is delegated, and Solid walks
a portal back to the component that rendered it, so a key pressed three levels deep ran every ancestor
level's handler: `Escape` collapsed two levels and `ArrowLeft` closed the menu outright. Each level now
ignores a keydown whose target is not its own popup root. Stopping propagation would have worked and was
rejected: it would swallow the key for anything outside the menu that listens.

**A blur dismisses only when focus has left the whole tree**, identified by id prefix — every level's id
derives from the root's. The previous `relatedTarget === trigger` guard cannot generalise, because closing a
level restores focus to the level above and that restore reaches the parent as a blur; with three levels
open, hovering back up the chain closed everything. The trigger check stays beside it for its own reason.

**Hovering an item opens its submenu, and moves the highlight there.** Splitting them is worse: the highlight
is what `aria-activedescendant` names, so a submenu open under an unhighlighted item states two positions at
once, and `ArrowLeft` back out would land on neither. Hovering an item with no children closes whatever was
open at that level. Nothing is on a timer.

**`ArrowUp` on a closed trigger still opens onto the last item, but the mechanism moved.** The highlight now
lives in the level, so the trigger states an intent — `initialHighlightPosition` — which the level reads only
as the fallback for a highlight nothing has set. It is not written into the level's state, so the first arrow
press walks from it and overwrites it as before.

**A trigger swallows its own keys while its menu is open, rather than opening it again.** Added
. A menu is drawn and highlighted before it takes keyboard focus — the layer takes focus only
once positioned, and its position waits on a `ResizeObserver` callback in a later task. In that window an
`Enter` meant for the highlighted item reached the trigger, which read it the only way it knows: open the
menu. Opening an open menu reset the highlight to the first item, so the keystroke silently moved the
highlight and the next `Enter` ran the wrong item. Refusing the four opening keys while the state says open
turns that into a keystroke ignored, the tolerable failure.

**The default is prevented before the open state is consulted, and the order is load-bearing.** All four
keys activate a `<button>` natively, so returning early without preventing the default lets the browser
synthesise a click that toggles the menu shut.

**What this does not do is make that early keystroke work.** Closing the window means giving a layer focus
as soon as it is open rather than once positioned; the cheap version — reading the content size once on mount
instead of waiting for the observer — was tried and reverted. Positioned a frame earlier, the
menu lands under the pointer that just clicked the trigger and `onMouseEnter` takes the highlight, so six
menu specs failed on a highlight one item further down. That makes it a question about whether the pointer or
the keyboard owns the highlight at open, which nobody has decided.

**The submenu's placement defaults to `right-out` / `top-in`; its offset is zero and belongs to the
consumer.** A submenu anchors to its parent item, and an item sits inside whatever padding and border the
painter's surface has, so a submenu flush against its anchor overlaps the surface it came from. The library
cannot know that inset, so `getSubmenuOffset` is where the consumer states it; the Playground passes its own
surface's padding plus border. Anything a consumer paints _outside_ its box — a drop shadow — overlaps by the
same arithmetic and is theirs by the same argument.

### The 1D walk is a pure function, not a hook

Settled, once `Menu` made it a fourth copy. `Tabs`, `RadioGroup`, `Select` and `Menu` all
carried the same wrap-around arithmetic character for character:

```ts
navigable[(((from + delta) % navigable.length) + navigable.length) % navigable.length];
```

**It is `NavigationUtils.computeNextPosition(key, from, length, opts)` rather than a `createRovingIndex`
factory, and `RadioGroup` is the reason.** The `create*` names in `Abstracts/` all mean "owns reactive state
and returns accessors". A walker cannot be one, because the state is already owned by each component and
owned _differently_: `Tabs`, `Select` and `Menu` hold a value signal and resolve it against the navigable
list, while `RadioGroup` walks registered entry objects and takes its starting point from
`document.activeElement` first. A factory owning the cursor would have served three of four and lost the one
that motivated the extraction.

**So it takes positions and returns a position, and knows nothing about what is being walked.** No generic
parameter, no collection argument, no reactivity — every caller maps back through its own array. That also
keeps it in `*Utils` rather than the `Anchor` / `ElementFader` family.

**Two options, both because a caller was already gating on them.** `orientation` decides which arrows step —
`"row"` or `"column"` for `Tabs` by its `dir`, `"both"` for `RadioGroup`, `"column"` for `Select` and `Menu`,
where the horizontal arrows must stay with the caret. It defaults to `"column"`, the narrowest: a default
that ignores a key is recoverable, one that hijacks `ArrowLeft` inside a text field is a bug. `hasEdgeKeys`
gates `Home` / `End`.

**What did not move is the part that is genuinely per-control.** `Select`'s "a closed list opens on an arrow
without moving the highlight" stays in `Select`. The rule: the `Abstract` answers _which position is next_,
the control answers _whether to go there_.

**`Tabs` got its first spec out of this**, being the one consumer whose keyboard had no coverage — recorded
as verified by markup dump only, which does not reach a walk. That spec drove the left menu at first and
moved to `TabsPage`.

`computeNextCell` for two axes belongs in the same file when `Calendar` arrives. That is the return on a pure
function: it grows by gaining a sibling rather than a mode.

### Typeahead: the text is read off the item, and `computeCustomText` is the way out

Settled on the user's call, closing the gap `Select`, `Menu` and `Tree` each recorded separately. All three
had the same blocker written down — the library has no text for an item, only what the painter drew — and
all three now have typeahead.

**The blocker was smaller than it read, because the item element is the library's own.** A
`role="option"`, a `role="menuitem"` and a `role="treeitem"` are all built here, with the painter's markup
inside them, so the text is already in the document and reachable without asking the consumer for it a
second time. Two of the three libraries checked do exactly this — Radix falls back to the item's rendered
text when no `textValue` is given, and React Aria requires `textValue` only when the children are not plain
text. What the earlier note called "a second source for text the painter already renders" was a prop that
did not have to exist.

**It is the accessible text, not `textContent`, and the difference is not cosmetic.** Every painter here
marks its decorative glyphs `aria-hidden` — `Tree` draws a "▶" before a branch's name, `Select` a "✓" after
a selected option. Raw text would make every branch in the tree begin with an arrow and match nothing a
person would type. So `TypeaheadUtils.getElementText` walks the element and skips any subtree carrying
`aria-hidden`, which lands on the same string a screen reader announces. Typing what you hear is the rule,
and it falls out rather than having to be arranged.

**The override is `computeCustomText`, and the word "custom" is doing work.** Named by the user, so that
the prop's own name says a default already exists — a bare `computeText` would read as the only source and
invite every consumer to supply one. Two cases need it, and only two. A **windowed** list mounts the rows in
view and nothing else, so an unmounted option has no element and no text; the Playground's virtualized
example passes `computeCustomText` for exactly that reason, and typing a route's name reaches one far below
the window. And an item whose paint is **not text** — a swatch, an avatar — has nothing to read.

**The buffer is a factory and the matching is a pure function, which splits the opposite way to the walk.**
`NavigationUtils.computeNextPosition` was deliberately not a factory because each control owns its cursor
differently. The typeahead buffer is the reverse: a string and a timer, owned identically by all three, with
nothing per-control about it. So `Typeahead.createBuffer` owns that state and
`TypeaheadUtils.computeNextIndex` stays pure, taking positions and a text lookup and returning a position.
The rule from the walk still holds — the abstract answers _which item is next_, the control answers _what to
do about it_: `Select` moves its highlight, `Menu` moves its highlight, `Tree` moves real focus.

**A repeated letter cycles, and a growing query holds.** `l` then `l` means "the next thing starting with
l"; `l` then `i` means Lisbon. One rule covers both: when the query normalises to a single character the
current item is excluded from the scan, otherwise it is not — which is why typing `li` does not walk away
from the Lisbon it just landed on.

**The query is forgotten after a second**, following React Aria and Radix rather than the shorter half-second
some native controls use. A slow typist breaks a two-word name at 500ms, and the cost of the longer window is
only a stale query, which the next pause clears anyway.

**Space joins the query only when there is a query to join.** Space activates a menu item and selects an
option, so it cannot be a query key from cold; once something has been typed it belongs to the query, which
is what makes "depot p" reachable. The dangerous half is the one worth stating: a space typed mid-query must
not run the item the highlight happens to be sitting on, and `menu.spec.ts` pins that.

**Each control claims its own printable keys first.** `Tree` uses `*` to open every branch at a level, which
the published pattern names, so that branch moved above the typeahead check rather than the key being
special-cased inside the abstract. **An autocomplete `Select` is excluded outright** — a field with a query
signal is a real text input and every keystroke belongs to the consumer's filter. Filtering shortens the
list; typeahead walks it; a control does not do both.

**Typing on a closed `Select` opens it and lands on the first keystroke.** The list is opened before the
match runs, and Solid mounts it synchronously on the signal write, so the options exist by the time the text
is read. This was expected to need two keystrokes and does not.

### Folder layout: `Fundamentals/Input`

`BinarySwitch`, `Checkbox`, `Toggle`, `Radio`, `RadioGroup`, `TextInput` and `Label` live under
`Fundamentals/Input/`. Grouped by what a component is _for_ — carrying a value the user edits — not by what
it is built from. `Button` and `InteractionWrapper` stay at the `Fundamentals` level: `Button` is an
interaction with no value, and `InteractionWrapper` is shared by both families.

`index.ts` still enumerates every export path individually and stays sorted, so the group is a directory
convention rather than a barrel — `Input` sorts between `ImageSwitcher` and `InteractionWrapper`.

### Verifying interaction: `e2e/` at the repo root

**It lives at the repo root, beside `src`, and that is the whole placement argument.** `src/Lib` would ship
it (`package.json` publishes only `dist`, but the folder is the library and the library is what it tests);
`src/Playground` would bundle it into the demo. It drives the _built_ Playground over a socket and imports
nothing from either tree. `npm run verify:dom` is the entry point; `verify:dom:ui` opens Playwright's runner.

**Playwright, rather than a driver of our own.** This suite used to be about 900 lines of hand-written
DevTools Protocol plumbing with no dependency, justified because a dependency would need a second tsconfig
and a compile step. That trade did not hold. Every "trap" the driver documented — which key event type
carries text, scrolling before measuring, waiting out a transition, discovering which loopback family the
preview server bound — Playwright solved years ago, and the one it did not solve cost the most: the driver
measured an element's position and clicked that point a frame later, so anything that re-anchored in between
was clicked where it used to be. That is what made `Select` and `Menu` pass alone and fail after `Tabs`.
Playwright re-checks that an element is visible, stable and hit-testable at the instant it acts, and gives
every test a fresh page.

**One test per behaviour, not one per component.** The old specs were one long scenario per control, so
state accumulated within a file and a failure halfway hid everything after it. Each behaviour is its own
`test`, `beforeEach` navigates, the run is parallel across workers, and the suite finishes in about fifteen
seconds.

**Assertions target `data-variant="<name>"` on each Playground variant and `[data-readout]` inside it**, so
a spec reads state the way the page displays it rather than reaching into Solid. `PageExamples` stamps
`data-example` for the same reason. Prefer the auto-retrying `expect(locator)` forms, which are what make a
wait unnecessary.

Three things Playwright cannot do for us, each of which reads as a component bug:

- **`aria-disabled` controls need `{ force: true }` to be clicked.** Playwright's actionability check treats
  `aria-disabled="true"` as disabled and refuses, which is exactly the interaction this library must prove
  does nothing. Forcing also skips the stability checks, which costs nothing on a control with no popup.
- **Opening a popup is two steps that land in either order**, so waiting on the popup being visible is not
  enough. `Menu` mounts, points at a highlighted item, and takes focus; a key pressed between the second and
  third is silently lost. `e2e/menu.spec.ts` waits on both `aria-activedescendant` and `toBeFocused`;
  `Select` waits on the highlight.
- **An element under a looping CSS animation can never be clicked.** Playwright waits for a stable bounding
  box, and an infinite keyframe slide never has one, so the click waits out the full timeout and reads as a
  broken component. `e2e/elementHighlight.spec.ts` focuses its triggers and presses Enter instead: no
  geometry, and a keyboard user reaching a moving button is the same journey.

**Playwright has no IME API**, so `TextSync`'s composition gating is driven over the DevTools Protocol
through `page.context().newCDPSession(page)` — the one place this suite reaches past the library it is built
on.

**What it catches is the argument for it.** `TextSync` destroying an IME commit and `ElementFader` hanging
its state machine on a single frame are both invisible in markup. `backlog.md` #11 carries what the suite
still cannot see.

**A touch gesture is driven through the DevTools protocol, and `drawerTouch.spec.ts` is the only file that
does it.** Playwright's touch API taps and nothing else, and synthetic touch events dispatched from page
script are ignored by the browser's own scrolling — so neither can answer whether a real finger scrolls a
sheet or dismisses it. `Input.dispatchTouchEvent` produces a gesture the browser treats as one. The file is
separate from `drawer.spec.ts` because the touch context is per-file, and because the two are asking
different questions: one is about the gesture's arithmetic, the other about who wins when the browser wants
the same finger.

### Unit tests: `vitest`, colocated, and only for functions

`e2e/` can only reach what a click can reach. A function taking rectangles and returning a placement has no
page to be clicked on, so provoking its edge cases through a browser means a Playground variant per case —
which is why `AnchorUtils`'s flip-and-clamp logic went unchecked long enough to ship the overflow in
`backlog.md` #5. `npm test` calls library functions directly.

**One dependency, and no DOM.** `vitest` reads the repo's own Vite setup, and `vitest.config.ts` sets
`environment: "node"`. A jsdom environment would invite component-rendering tests, the thing not to build
here — jsdom has no layout engine, so every geometry question comes back wrong, and everything else is
already answered by `e2e/`. The line: **if it renders, it is a spec; if it returns a value, it is a unit
test.**

**Tests sit next to the function**, as `<Name>.test.ts`, matching the rule about types. They are inside
`src/Lib` and therefore type-checked by `npx tsc --noEmit` — a test that no longer compiles against its
subject has stopped describing it. They do not ship: both builds start from `index.ts`.

**Assert the behaviour, not the implementation.** These functions are small enough that a test mirroring
their arithmetic would pass forever and prove nothing. Each case names a situation — an out placement that
would overflow flips to the side with room, a walk that wraps at both ends, a reserved docked panel pushing
the flip earlier — and the numbers are worked out from that situation.

**Covered: every `*.utils` module that neither touches the DOM nor builds JSX** — `Anchor`, `Navigation`,
`Interaction`'s reachability predicate, `Audio`, `Select`'s flattening, `ElementHighlight`'s segment
geometry, `RichText`'s parser and the whole of `CellAnimation` (geometry, origins, all thirty-seven weight
functions, zones, breakpoints). The weights are covered by property rather than value: every type stays
inside 0..1, is deterministic, and — for the origin-free ones — is unaffected by moving the origin. Pinning
thirty-seven grids of numbers would encode the arithmetic rather than describe it, and would have to be
re-blessed wholesale by any change.

**Deliberately not covered:**

- **Anything taking an element or a Solid owner.** `Focus`, `ElementObserver`, `ElementFader`, `TextSync`,
  `Anchor`'s own factory, `InteractionUtils.wrapElement` and `Viewport`'s rect adjustment all need a real
  layout to say anything true. They are `e2e/`'s half.
- **The SVG defs builders.** `SVGPatternDefsUtils`, `SVGGradientDefsUtils` and `SVGAnimationUtils` return
  JSX, and their arithmetic — tiling offsets, `resolveStops`' interpolation — is written inline inside the
  element or kept private. Real geometry, unreachable without rendering or a refactor separating arithmetic
  from markup. `backlog.md` #12.
- **A known-broken case is pinned rather than fixed.** `CellAnimation.utils.test.ts` asserts the
  out-of-range weights `backlog.md` #5 describes, with the measured numbers. It passes today and fails the
  moment anyone fixes the bug, which is the point — both candidate fixes change output across every affected
  weight, so the test is re-blessed as part of the fix rather than quietly surviving it.

### `ElementFader`: the frame that starts a transition needs a fallback

`setTarget` flips `transitionTarget` inside a `requestAnimationFrame` so the browser
paints the pre-transition state first — without that the CSS transition has no start value. The bug was that
the frame was the _only_ path: `setHasTransitionFinished(false)` happens immediately,
`getIsVisible` is `transitionTarget === 1 || !hasTransitionFinished`, and the duration timer was armed only
inside the callback. So on a page that stops producing frames — a backgrounded tab — a dismissed `Modal`
never leaves: `getIsVisible` stays true, the `<Show>` stays mounted, and the focus trap stays with it.

It now schedules the same idempotent `commit` from both a frame and a 100ms timer, whichever arrives first,
cancelling the loser. The frame wins wherever frames exist; where they do not, the state machine advances
without an animation, which is correct on a page that is not painting.

### Controls: `Progress`, and what a non-interactive Fundamental looks like

The first `Fundamentals` component that is neither an interaction nor a composition
of one, so it settles the shape by being it.

**No `InteractionWrapper`, and no flags.** Nothing to hover, focus or activate. The root is a bare
`<div role="progressbar">` and the painter receives `getState`, not `getFlags` — `ProgressState` is the
analogue, and calling it flags would claim an interaction contract this component does not have.

**The painter is handed a normalised `ratio` as well as the raw value.** Clamping `(value - min) / span`
into 0..1 is the one computation a painter must not repeat, since getting it wrong draws past the end of the
track. `value`, `min` and `max` come along because a painter rendering "1.2 of 2.4 MB" cannot get them
anywhere else — the opposite of `TextInput`, which withholds the value because the input already draws it.
One rule both times: hand over what the painter would otherwise have to double.

**`ratio` is `number | undefined`, and the `undefined` is the mode.** An absent `getValue()` means
indeterminate, which is what ARIA means too — `aria-valuenow` is omitted. Sanctioned "presence as a
trigger": one meaning, and forgetting the prop yields a working indeterminate bar. It reads the **value**,
not the prop, for `getTooltipDefs`' reason — an upload with no total yet returns `undefined` from a
`getValue` that later returns numbers. Extras elsewhere are required so a painter never handles an
`undefined` its control cannot emit; here the control genuinely can emit one.

**The indeterminate animation is the painter's**, contradicting the note that raised this component: an
indeterminate bar is a looping animation with no state behind it, CSS runs it on the compositor free, and a
library-owned clock would burn frames handing over a phase `@keyframes` already gives. The library says
_that_ the bar is indeterminate.

**Placement is the library's**, contradicting the same note in the other direction — see the `Modal` presets.

**`getSizing` defaults to `"fill"`, the inverse of `InteractionWrapper`'s, and the type is declared here
rather than imported.** A control's natural size is its content; a track's is its container. Both
vocabularies have the same two members, and sharing the type would file a non-interactive component's
geometry under `InteractionWrapper.types`.

### Controls: `Drawer` as a `Modal` preset, and why `AlertDialog` is not one

Settled for `Drawer`, the `Toggle`-over-`Checkbox` shape. `AlertDialog` shipped the same day
on the same reasoning and was **deleted **.

**Placement is geometry, not paint** — a correction to the note that asked for these. The slide is paint (a
painter transitions its own `transform` off `getVisibilityTarget`). Placement is not: the box carrying
`role="dialog"` is `Modal`'s, and only its position within `modalRoot` decides where the dialog is. Making it
paint would mean stretching the container over the viewport and letting the painter position itself inside,
which hands the dialog role a viewport-sized box and breaks the margin-derived `max-width` / `max-height`.

**`modalRoot` became a grid so both axes can say `stretch`.** A flex row has no main-axis equivalent of
`justify-items: stretch`, so a top-edge drawer could stick to the top or fill the width but not both.
`modalContainer` is `display: flex; flex-direction: column` with `flex-grow: 1` on its child so the painter
fills whichever axis the grid stretched. The absolutely positioned overlay is unaffected.

**That grid states its single track as `100%`, and without it a dialog taller than the screen escaped the
screen.** An implicit grid track is auto-sized, so a container holding more than fits grew the track with it;
the container's own `max-height: calc(100% - margins)` then resolved against that grown track and capped
nothing, and the dialog ran off the bottom with the overflow unreachable — no scrollbar, because nothing had
been asked to scroll. Stating `grid-template-rows: 100%` and `grid-template-columns: 100%` pins the area to
the root, the `max-height` and `max-width` become real limits again, and a painter with `overflow: auto`
scrolls inside them. Found when every drawer on the Playground page was given more content than fits.

**`ModalAlignment`, not `ModalPlacement`** — `AnchorPlacement` already names `{ x, y }` collision placement,
and one prop meaning a string union on one component and a record on another is the two-contracts-one-name
trap.

**`Drawer` narrows to four edges and adds nothing else**: `DrawerEdge` drops `"center"`, and `getEdge` is
required where `getAlignment` was optional. An edge-attached dialog that could be centred is not a drawer.

**`AlertDialog` was a preset that earned nothing.** It set `role="alertdialog"`, required
`getInitialFocusRef` and turned overlay-click dismissal off — three props already public on `Modal`, and no
behaviour of its own. The line: `Drawer` narrows a vocabulary so a wrong state is unexpressible;
`AlertDialog` only pre-filled values. A component whose whole body is three defaults is a comment with a
build step. This does not overturn the `Toggle`-over-`Checkbox` rule — `Toggle` both removes surface and adds
semantics a consumer cannot reach (the `switch` role, the mixed-state role swap).

Its reasoning now belongs to whoever sets those three props: an alert interrupts to demand a decision, so
focus must land on the control that answers it and the initial focus target is not optional; and a dialog
demanding an answer must not be answerable by clicking next to it. `Escape` still closes it, because every
dialog must be escapable regardless of role. `ModalPage` carries it as a second variant, which is the honest
demonstration — it shows the three props rather than hiding them.

**`FocusUtils.autoFocus` reads the initial ref untracked, and "initial" is why.** The effect already depends
on the container ref and visibility; a third dependency that can change while the dialog is open would
re-run it, re-capture `previouslyFocused` as whatever is focused _now_, and restore focus to the wrong
element on close. A ref assigned during render is set before effects run, so the common path is unaffected.

**`getIsDismissableOnOverlayClick` and `getAriaDescribedBy` are public on `Modal`** — a form with unsaved
changes wants the first, any dialog can want the second.

### Controls: `FileInput` and `ColorInput`, where the UA owns the activation

Both are the `TextInput` arrangement (overlay geometry, wrapper, flags, private
leaf), and both exist because of one thing the library cannot take over.

**Activation must stay native, so gating a disabled control is `preventDefault` on `click`.** Only a user
gesture on the real element opens a file dialog or the OS colour picker, so there is no JS path to gate and
no `readonly` to lean on. `preventDefault` cancels the default action — `BinarySwitch`'s mechanism rather
than `Button`'s early return, which would have left both dialogs opening. `wrapElement`'s `mousedown`
refusal still keeps a disabled control from taking focus.

**Suppressing the UA's own rendering is the rule that kept `placeholder` and the number spinner out**, and
each needed a different mechanism:

- **A file input** hides `::file-selector-button` and sets `color: transparent` for the filename. It stays
  transparent-but-present rather than `opacity: 0`, because opacity paints the outline too.
- **A colour input** needs `visibility: hidden` on `::-webkit-color-swatch`; a transparent background is
  **not** enough, since the UA paints the current colour onto the swatch through a path an author
  `background` does not reach, covering the painter with a solid rectangle. Visible on screen and invisible
  to every DOM assertion — the shape of what markup checks cannot catch. `visibility` takes the swatch out
  of paint and leaves the input's outline alone.

**Both give the painter the value, and `TextInput` deliberately does not.** `FileInputFlags = { files }`,
`ColorInputFlags = { value }`: once the native rendering is suppressed nothing else draws them. The other
side of one rule — withhold what the element already draws, hand over what it does not.

**`syncElement` returns for a third time**, on `BinarySwitch`'s premise:

- **`ColorInput`** assigns `value` when it differs, so a snapping owner ("nearest of four") sees its
  correction reach the element instead of the picker's raw colour.
- **`FileInput`** cannot be pushed into an arbitrary state, because a `FileList` cannot be constructed. Only
  the empty case is expressible, via `element.value = ""`, and it is the case that matters: an owner that
  rejects a file and writes `[]` back would otherwise leave the input holding it, and **re-picking the same
  file fires no `change` event**, so the user cannot retry what they were just told to fix.

**Scoped without drag-and-drop, deliberately.** A drop target belongs to whatever surface accepts the drop,
and adding it would give `FileInput` a second activation path.

### The Playground's element selectors are scoped, and the library keeps its `!important`

Settled, with the props-panel migration. All 43 raw controls in the panels are library
controls now, and since `TextArea` shipped there is no raw form control left in the Playground.

**`style.css` no longer styles `input` or `select` at all.** Those rules sat at specificity 0,1,1 and
outranked any class a control could carry, which forced the escalation recorded under _"The input is a
genuine blank slate"_. They exist to style the app's own chrome, that chrome is no longer raw, and they are
scoped to `textarea`. Two rules went rather than being narrowed: the blanket `label` block, since
`labelRoot` already sets everything it did, and `button:hover { filter: brightness(120%) }`, because
`filter` paints an element's outline and that rule was dimming the focus ring of every hovered button —
found by removing the thing that hid it.

**The library's own `!important` resets stay, and `backlog.md`'s guess that "several could go" is wrong.**
The Playground is not the only consumer; a blank slate that loses to an element selector is broken, and
element-level input styling is what every reset stylesheet ships. What the scoping removes is the
**consumer-side** escalation — a painter no longer reaches its own input through a `globalStyle` to win.

**The panels grew a family of field adapters**, which is the migration's real finding. `PageNumberField`,
`PageTextField`, `PageSelectField`, `PageGroupedSelectField`, `PageCheckField`, `PageColorField` and
`PageFileField` live in one folder as one file, because seven two-line adapters in seven folders is worse
than the family being visible in one place — the call `Select.tsx` makes with its three private components.
Each keeps a local `*Signal` and mirrors the panel's plain value into it. That mirror is written seven times
and is the gap `backlog.md` #10 records: every control owns its value as a signal, so a consumer whose state
is a store builds the bridge themselves.

### Controls: `Stepper`, where the state vocabulary is the consumer's

Built, after the longest design conversation in this file's history. A progress strip over a
multi-step flow.

**The library never computes whether a step is complete.** Each step arrives with a `state` the component
declares as a generic and never inspects — `done`, `failed`, `skipped`, whatever the consumer needs — and
its source is deliberately unknown. This dissolved the months-old "what does the stepper gate on" question:
nothing, because it is told.

**What the library does own is `aria-current="step"`**, which is not a state a consumer may invent.
`aria-current` is enumerated and `step` means exactly this, and an unrecognised value degrades silently to
plain `true` — so a consumer expressing "current" as one of their own states would produce a strip whose
position is invisible to a screen reader. Same split `Breadcrumbs` makes with `aria-current="page"`.

**`computeStepAriaLabel` is required, and that is why the free vocabulary is safe.** No ARIA attribute
exists for "this step failed", for any invented state, so a red ring on step two is indistinguishable from
step three and the only route by which an invented state can be announced is **text in the accessible
name**. The strings are the consumer's, for the reason `TagInput` does not ship the word "Remove".

**Navigability is per step and decides the element, not an attribute.** A step you can move to is a
`<button>`; one you cannot is a `<span>` — `Breadcrumbs`' call for its last crumb. A non-navigable step with
a tooltip stays reachable, which is `getIsReachableWhenDisabled`'s pairing, derived from whether a tooltip
exists rather than taken as a prop, so that rule's warning can never fire from here.

**Each step is its own tab stop; there is no roving order.** Researched on request. Roving is legal — no
criterion counts tab stops — but the APG's account of how a user _discovers_ arrow keys is that assistive
technology recognises the role and says so, and its composite list (combobox, grid, listbox, menu, radio
group, tabs, toolbar, treegrid, tree view) has no stepper. An ordered list of buttons announces "list", so
roving hides most of the strip from anyone who did not guess. No ARIA attribute advertises arrow-key
navigation either: `aria-keyshortcuts` is for shortcuts that activate or focus, `aria-roledescription`
renames a role without adding behaviour and is explicitly discouraged, and `role="application"` disables
browse mode wholesale. Getting the announcement would mean claiming `role="tablist"`, which asserts the
steps swap panels — untrue when the state source is agnostic. A stepper that does swap panels is `Tabs`.

The sharper argument is local: a locked or failed step stays reachable **so its tooltip can be read**, and
under roving someone who does not know to press an arrow tabs in, lands on the current step, tabs out, and
never reaches it.

**Both orientations ship**, as a `dir` prop with `aria-orientation` on the list.

**Not built:** the connector is a slot rather than something the library draws, and nothing enforces that a
linear flow is linear — a consumer who marks every step navigable gets free navigation, which is
`nonLinear` elsewhere and needs no prop here.

**The entry takes the list's direction, and the first build forgot to give it one.** Fixed afterwards.
`dir` was written onto the `<ol>` alone, but the `<li>` holds the step and the connector after it and was a
hard-coded row — so a column strip laid a 2px hairline to the right of the label instead of a track running
down the page. The `<li>` now carries the same `flex-direction`. Nothing else was wrong with the column
case, which is why it looked like a paint bug.

**A row strip wraps rather than overflowing.** Four steps with word-length names are
wider than a 370px column, and the strip had no answer: `stepperList` could not shrink (the painter's labels
are `nowrap`, the connector is a fixed-size slot the library does not own) and could not wrap, so it grew
past its container **in both directions** — the first entry sat at `offsetLeft: -45`. Of shrinking,
scrolling and wrapping: shrinking is not the library's to do, since it needs the painter to let its labels
truncate; scrolling hides steps behind a gesture with nothing saying they are there; wrapping needs nothing
from the painter and truncates no label. A consumer wanting either of the others has `overflow` on their own
container. The `<li>` is the wrap unit, so a connector never separates from its step — a wrapped line can
end on a connector, which is the cost. `maxWidth: 100%` on the list and `minWidth: 0` on the entry stop a
single over-wide step escaping either edge.

### Controls: `SplitPane`, where CSS grid is the arithmetic

Resizable panes with a draggable gutter between each pair.

**The stated objection to building it was wrong**: `backlog.md` held that this would be the first control to
write a dimension, against a rule that the library leaves layout to the consumer. `Collapsible` already
writes a measured pixel height, the `Tabs` and `RadioGroup` floaters write a full box, `Viewport` scales its
contents, and the library already owns wrapper elements around consumer content (`Breadcrumbs`' `<li>`,
`Select`'s group box). The rule the objection appealed to does not exist in that form.

**The value is ratios, and pixels are never stored.** `ratiosSignal` is `Signal<number[]>`, one share per
pane. A container resize must not rewrite what the person chose: drag to 30/70 in a 1000px box, narrow the
window, and the stored `0.3` stands while the rendered widths clamp. Same shape as `ColorArea` keeping HSV
while emitting hex, and `DateValue` keeping the lossless form.

**The layout is one `grid-template` string and nothing else.** A pane is
`calc(ratio * (100% - totalGutterPx))`, and a pane with bounds is that share inside a `clamp()`; gutters are
fixed tracks between them. A window resize needs no observer and no code — the browser recomputes. That is
why this shape beat an `fr`-based one: `fr` cannot appear inside `clamp()` or `min()`, so a per-pane maximum
is not expressible alongside it, while percentages and pixels compose freely. N panes come free.

**When the minimums cannot all fit, it overflows — accepted by the user.** Two floors of 250px
and 400px in a 600px box do not shrink proportionally; grid honours both and the row spills. Chosen over
computing a proportional shrink, which needs a `ResizeObserver` and the library rewriting floors on every
resize. The user's reasoning: grid's behaviour is consistent, expected and documented, a consumer declaring
floors that cannot fit is misusing the API, and inheriting the platform's answer beats inventing a second
one. `splitPane.spec.ts` pins it.

**A gutter moves its two neighbours and nothing else.** Their combined share is conserved, so ratios keep
summing to one without a normalisation pass and dragging at one end never reflows the far side.

**The gutter is a `<button>` with `role="separator"`, and it carries a value.** `aria-valuenow` is the
boundary as a percentage over 0–100, `aria-orientation` states the axis, and the arrow keys for that axis
move it by `keyStep`. A drag-only splitter is unreachable without a pointer.

**The drag is local rather than `InteractionUtils.trackDrag`.** That helper measures the pointer against the
element it is attached to, right when the drag surface _is_ the measured surface (`Range`, `ColorArea`). Here
the drag surface is the gutter and the measured surface is the container. If a third consumer of that shape
appears, widening `trackDrag` to take a separate measuring ref is the change to argue then.

**A pixel bound has to be reconciled with a ratio value, and CSS alone cannot do it.** Fixed,
correcting the above. `minPx` / `maxPx` were only the `clamp()` around each track — correct for _rendering_,
useless for _dragging_: `moveBoundary` knew nothing about them, so a drag kept writing ratios the `clamp()`
refused. Past a pane's floor the pane stopped while the gutter carried on under the pointer, the far pane
went on growing, and the tracks summed to more than the container. The bound is now converted to a ratio
against the container's measured size and the drag clamped there.

Two non-obvious details. **The measurement is `offsetWidth` / `offsetHeight`, not `getBoundingClientRect`** —
`Viewport` scales its contents, so a client rect is layout size times a factor that is almost never 1, while
`minPx` is a layout-space number. `computePointerBoundary` keeps the client rect, correctly, because both
sides of its division carry the same factor. **And the CSS `clamp()` stays**: the drag clamp holds while the
pointer moves, the `clamp()` holds when the _container_ resizes. When floors cannot all fit, the drag clamp's
window is empty and it pins to the floor, which is what `clamp(min, …, max)` does when `min > max` — so the
accepted overflow survives.

**Not built:** collapsing a pane to nothing and restoring it, a double-click to reset, persisting the split.
All three are the consumer's, since they own the signal.

### Controls: `TagInput`, and why it is not a `TextField` preset

A field whose value is a list: type a word, press Enter, it becomes a tag beside the
caret.

**It owns its own box rather than sitting in `TextField`'s leading slot, and that was the whole decision.**
The cheap route was a preset like `NumberInput` with tags in `renderLeading`. That slot is absolutely
positioned and the input's left padding inset by its measured width — right for a currency symbol, wrong for
a list: the moment tags wrap onto a second row, an out-of-flow strip and one inset number cannot describe the
layout. Widening `TextField` to make its slot optionally in-flow was the third option, rejected on ownership:
`TextField` is a single-line field with decorations at its edges, and a tag input is a box of controls that
happens to contain a field. Bending the first into the second costs four shipped presets a concept they do
not need.

**Twelve tags in a 240px box wrap, and the box grows — settled by the user.** Nothing clips,
nothing scrolls sideways, no cap. Stated rather than hidden: the control's height is a function of its value,
so a form reflows as tags are added. That is what every published tag input does, and the alternatives were
deferred rather than missed — a `maxRows`-style cap, a single scrolling line over `Scroller`, and a "+10
more" collapse are all additions on top of wrapping. `tagInput.spec.ts` pins the growth.

**Backspace on an empty field steps into the tags rather than deleting one.** First press moves focus onto
the last tag, a second removes it. Deleting outright changes the value with nothing focused to announce it,
which is silent for a screen reader and invisible to anyone who mis-hit the key. `ArrowLeft` does the same
step, arrows walk the tags, walking past the last returns to the field. Backspace only leaves the field when
the field is empty, or it would swallow ordinary editing.

**The tag is a `<button>` whose accessible name is the tag text, and pressing it removes it.** No separate
delete trigger; a consumer painting an `✕` is painting decoration on a control that is already the remove
control. The name defaults to the tag's own text rather than "Remove X", because a library that paints
nothing has no business shipping an English sentence — `computeTagAriaLabel` is where a consumer supplies
wording.

**Tags are `string[]`, not `T[]`.** Every other list control here is generic; a tag genuinely is the text
that was typed, with no identity apart from its characters. A consumer needing records keeps a map beside it.
`computeTag` is where text becomes the stored form — trimming, casing, refusing a duplicate — and returning
nothing declines a word, leaving the text in the field to be edited rather than retyped.

**The draft text is private unless asked for**: `textSignal` is optional through
`SignalMirror.createOptional`, the arrangement the popups use for their open state.

**Owning the box means owning the pointer back, which the first build did not.** Fixed afterwards.
`interactionRoot` sets `pointer-events: none` and each part turns it back on for itself (`buttonElement` does,
`textFieldElement` does); `tagInputField` did
not, so the field could not be clicked, focused or typed into and the control read as a box of tags with no
text entry. Every spec passed throughout, because `fill()` writes the element directly and never asks whether
a person could have reached it — the click path is now asserted, and that is the general lesson. The root
turns pointer events on too, with `cursor: text` and a `pointerdown` that focuses the field when the press
landed on the root itself, so the padding around the tags behaves like the padding of any text box.

**A control that owns its box must be positioned, or the painter paints over it.** Fixed, and
the more general of the two. `renderContent` draws an opaque box at `position: absolute; inset: 0`, and CSS
paints positioned elements _after_ ordinary in-flow content regardless of document order — so the painter's
background covered the field's text. The value was in the DOM, the caret was in the field, the click worked,
and the box looked empty. The tags escaped only by accident, each sitting in an `InteractionWrapper` whose
root is `position: relative`; `TextField` escapes it deliberately, its element being absolute too.

So: **anything the painter is meant to sit behind has to be positioned.** `tagInputRoot` is now
`position: relative`. This is the trap for every future control rendering in-flow content next to
`renderContent` — the symptom is content that is simply not there, and nothing in the markup or the flags
hints at it.

**The field is a row of its own beneath the tags.** Settled by the user, and recorded
because the first build arrived there by accident and the second "fixed" it. An `<input>`'s intrinsic width
is around 177px (the default `size`), and `flex-basis: auto` takes that as its starting size, so it happened
not to fit beside the tags and wrapped. That looked like a stray empty row and was changed to a 60px basis.
The user asked for the full row and is right about the shape: chips in front of a caret read as a search box
that has already matched something, while a block of tags with an empty line under it reads as a list and a
place to add to it. It is now `flex: 1 0 100%` — a 100% basis cannot share a line, so the break is declared
rather than incidental.

**The caret is the painter's, through `computeTextStyle`.** `TagInput` had no way to reach the
input's text, so the caret fell back to the inherited colour while every other field drew the theme's. The
slot is `TextField`'s, reused with the same name and `TextFieldTextStyle` type — the `TabLinkProps`
precedent: a second identical type for the second caller is the thing to avoid.

**A printable key on a focused tag returns to the field.** `handleTagKeyDown` answered
only Backspace, Delete and the arrows, so a letter pressed on a tag went nowhere. Focus now moves back to the
field and the keystroke lands there. Deliberately not `preventDefault`ed: the character is inserted by the
default action, after the handler has moved focus.

**Disabled has to close the write paths, not only announce itself.** Same fix. The field carried
`aria-disabled` and nothing else, so a disabled tag input could still be typed into and Enter still added
tags. It now takes `readOnly` the way `TextField` does — never native `disabled` — and both key handlers
return early. `userSelect: text` was missing for the same reason as `pointer-events`.

**Not built:** a cap or a collapse; editing a tag in place; pasting a delimited list as several tags; a drag
to reorder.

### Controls: `Breadcrumbs`, and why the last crumb is not a control

A trail of links to where you are. The standing position was that it was a `Tabs`
composition; what earns it a file is markup the consumer cannot get from `Tabs` at all.

**A trail is a landmark around an ordered list**: `<nav aria-label>` holding an `<ol>` holding one `<li>` per
crumb. The landmark lets someone jump straight to the trail; the list makes "four of these, in this order"
true for a screen reader. `Tabs` renders `role="tablist"`, which says these swap a region, so the
composition was never right, only convenient.

**The last crumb is the page you are on, so it is a `<span>` with `aria-current="page"`.** Not a disabled
link, which would stay in the tab order and look pressable; not a button that does nothing. Which crumb is
current is positional, so the component decides it and hands the answer to the painter through
`BreadcrumbsFlags.isCurrent`.

**`isCurrent` is an extra flag rather than something the page recomputes.** `Tabs` lets its page derive
`isSelected` because selection is the consumer's state. Here it is not: only the component knows the crumb
count, so a page deriving "last one" would re-derive something known one level up and get it wrong the moment
a trail is trimmed.

**The item is a `<button>` without an `href` and an anchor with one**, with a `linkComponent` escape for a
router's link — the three-way shape `Tabs` and `Paginator` use, reusing `TabLinkProps`.

**Separators are the consumer's paint, live outside the item, and are `aria-hidden`** — otherwise a trail
reads as "Home slash Library slash Inputs". The slot is optional and renders no wrapper when absent.

**There is no keyboard handling at all, and that is correct.** Crumbs are independent destinations, so each
is its own tab stop, as `Paginator` records for its page numbers. A roving order would make the trail one
stop, which is what a `tablist` wants and a `nav` does not.

**Trimming the trail is the consumer's.** Raised by the user: pressing `B` in `A > B > C > D`
ought to leave `A > B`. The behaviour is right and so is the component — `onSelect` reports the press and
nothing else, since the component does not own the route and a trail that trimmed itself would fight a
router-driven consumer. The demo was wrong: it reported into a readout and left the trail at four. The page
now derives the trail from the pressed crumb's index, and the panel's `Reset` is the way back.

**Not built:** collapsing a long trail behind an overflow menu. It needs a decision about where the hidden
crumbs go, and nothing has asked.

### `RadioGroup` takes a floater, and both floater observers are guarded

Settled, straight after the segmented control below. A sliding indicator behind the chosen
segment cannot be painted from inside one radio: it needs the selected item's **box**, and a painter only
knows its own.

**The objection this had to clear was purity, and it does not survive.** `RadioGroup` already takes `dir` and
`gap` — it already decides where its children sit, so handing that measurement back out exposes something it
owns rather than teaching it something new.

**The mechanism is `Tabs`', copied deliberately rather than generalised**: a root ref, a `ResizeObserver`
watching the root and the selected item's `offsetParent`, the box written as inline `top` / `left` / `width` /
`height`, and `ElementFader` for entry and exit. Two consumers is not yet an `Abstract`; a third is when to
extract.

**The observer is now guarded on the prop, in both controls.** It previously ran for every `Tabs` on the
page, measuring for a floater nobody asked to render, and copying it unguarded into `RadioGroup` would have
put a `ResizeObserver` inside every radio group in every form. The effect returns early when `renderFloater`
is absent. Not guarded: `Tabs` keeps its item refs regardless, because arrow keys focus through them — only
the measuring is optional, and confusing the two would break the keyboard.

**Both roots carry `isolation: isolate`, and without it the floater escapes the control.** The floater sits
at `z-index: -1` so the items paint over it. A negative index resolves against the nearest ancestor that
starts a **stacking context**, and `position: relative` alone does not start one — so the floater travelled up
the ancestor chain until it found one, and any background painted on the way covered it. Exactly what happened
when the Playground put a background on the box wrapping the segmented strip: measured correctly, positioned
correctly, painted underneath the wrapper. `isolation: isolate` starts a stacking context and nothing else;
`z-index: 0` would work too but says something about the control's own order among its siblings, which is the
consumer's business. `Tabs` had the same latent fault and now carries the same line.

Worth knowing for the next painter: this class of fault is invisible to `e2e/`. The floater spec asserts the
measured box, which was right the whole time.

**The preset route was considered and rejected.** A segmented preset over `RadioGroup` owning the floater
privately resurrects as a component the thing just decided to be paint, for one optional prop's worth of
surface — and a preset existing to hide a prop the base already needs is a worse trade than the prop.

### A segmented control is `RadioGroup` paint, and the Radio page proves it

Settled, closing a `backlog.md` entry. A row of joined buttons with exactly one pressed reads
like `Tabs` and is not: `Tabs` is navigation and swaps which region is shown, while a segmented control holds
a **value** that is part of a form's answer. Same appearance, different meaning, and the role reflects the
meaning.

So it needs no component. `RadioPage`'s **Segmented** variant is the demonstration: `RadioGroup` with
`getDir` row and `getGap` zero, painted by `RadioSegmentContent` instead of `RadioContent`. **A segment paints almost nothing** — no
dot, no border, no background, only padding and a text colour that flips when checked.

**The strip's own look belongs to a wrapper, not to the segments.** `PageRadioSegmentGroup` is a plain
`<div>` around the whole `RadioGroup` carrying the border, background and outer radius, and the fill behind
the chosen segment is the floater. Segments drawing their own borders was tried first: it needed an `isFirst`
/ `isLast` pair so the ends could round and the inner dividers collapse, it made every segment opaque —
hiding the floater completely, since it sits behind at `z-index: -1` — and it put the strip's appearance in
three places. A container can round its own corners without knowing which child is first.

The library cannot be that wrapper: `RadioGroup` accepts no class name, so the page supplies its own box.
Library owns the roles and the geometry, page owns the paint.

**A rating input went the same way on the same day, and it is the more interesting of the two** because one
part genuinely is not `RadioGroup`. Five stars are five radios; the **preview** is not — hovering the third
star fills the first three. A painter cannot do that alone, because `isHovered` is its own and star two would
have to know star three's. The page holds it: a `hoveredRatingSignal` written from each `Radio`'s
`onMouseEnter` / `onMouseLeave`, each star filled when its number is at or below the hovered one, falling
back to the value. Nothing was added to the library — the preview was the argument for a `Rating` component
being more than paint, and it turned out to be **eight lines in the consumer**; a radio group's arrow keys
move the value itself, so the keyboard case needs no preview.

### The Playground theme is an example, and carries no rationale on purpose

Settled by the user, when asked whether `App/Theme.css.ts`'s token shape deserved an entry
here. It does not: **every value in it is as arbitrary as any consumer's own.** Four steps per colour rather
than a numeric ramp, one animation duration rather than a set, `half` / `full` / `double` / `quad` spacing —
none of it is a recommendation and none of it constrains the library, which paints nothing and reads no
token. A consumer copying its shape is copying an example.

This does **not** license changing it casually. It is the only theme the Playground has, so a token edit
repaints every page at once; the values being arbitrary is a statement about their origin, not an invitation
to churn them.

### The Playground's field look is one surface, and every field-shaped control wears it

Extracted, after the user pointed out that `TagInput` did not look like the other inputs — it
had 1px border instead of 2, a theme background instead of black, no shadow, its own padding.

`TextFieldContent.css` now exports **`fieldSurface`**: the border and its 25% currentColor, the radius, the
black fill, the small shadow, the transition, and the `isReadOnly` / `hasError` / `isHovered` / `isDisabled`
selectors. `textFieldContent` is `fieldSurface` plus the fixed 240×40 box and its `isStretched` escape;
`tagInputContent` is `fieldSurface` plus `position: absolute; inset: 0`, since there the tags size the box.
The flag classes are imported from the same file, so hover, error and disabled behave identically rather than
similarly.

The two shapes are why this is a shared **surface** and not a shared component: in `TextField` the painter
declares the size and the input is laid over it; in `TagInput` the content declares the size and the painter
is laid under it. Only the appearance is common. The metrics travel as the existing `FIELD_PADDING` /
`FIELD_GAP` / `FIELD_HEIGHT` constants, which `TagInput`'s page now passes — `FIELD_HEIGHT` through
`getMinHeight`, so an empty tag box is exactly as tall as a text field and grows from there.

**Width is deliberately not matched.** A text field is 240px because its painter says so; a tag box is as
wide as its tags, which is the documented behaviour of the control.

### A Playground demo a visitor can move must be a demo they can put back

Stated by the user, after `TagInput` and `Stepper` shipped with no way to restore them.
**If pressing something inside a variant changes state the page owns, the page ships a way back to where it
started.**

The reset lives in the **props panel**, not beside the variant, for the reason every other knob does: one
control governs every instance, so the page returns as a whole. The starting values move to module constants
and the reset writes them back.

**A knob that happens to express the state does not stand in for the button.** Confirmed by the user on
against the opposite guess: `Breadcrumbs` was left without one because its `Depth` field can
put the trail back, and they asked for the button anyway. A knob is somewhere to _set_ a value, and knowing
that setting it to 4 happens to be the starting point is knowledge the page has and the visitor does not. A
reset also resets everything the page moved: pressing a crumb moved the trail _and_ the readout under it.

The exception is a variant whose whole point is a one-way gesture with an owner-held latch, which is why
`SlideButton` keeps its `Reset` inside the card.

### `ScreenWiper`: CSS shapes, not SVG

Each wipe cell used to be a `<div>` wrapping an `<svg>` wrapping a `<polygon>` or
`<circle>` — three nodes per cell, with the polygon's `points` string rebuilt per cell. It is now one `<div>`
carrying `clip-path: polygon(...)` for the lozenge or `border-radius: 50%` for the circle, picked by a
`styleVariants` map. Measured at 1920×1080: **1370 elements down to 508**, pixel-identical (byte-for-byte
screenshot comparison).

**Collapsing into one `<svg>` with `<use>` was rejected.** It reaches a similar node count and shares the
geometry, but it moves several hundred animating elements inside one viewport-sized SVG. SVG has no
per-element compositing, so a transform change on any child invalidates the whole raster — trading a few
hundred cheap independent `div` transforms for a full-viewport repaint every frame. The node count was never
the expensive part; the concurrent staggered transitions are, and no restructuring changes that.

A tiled `<pattern>` does not apply whatever the node count: each cell scales on its own staggered delay, so
there is no repeating unit to tile.

`flex-shrink: 0` on the cell is load-bearing. The old markup got its size from the `<svg>`'s width attribute,
which ignored flex shrinking; a plain `div` would shrink and break the tessellation where a row overflows.

Not exercised: the `circle` shape has no Playground variant, so `border-radius: 50%` replacing `<circle>` is
reasoned, not observed.

### `CellAnimation`: weights as the staggering primitive

**A cell's weight is its position on the timeline.** A weight function returns 0..1 per cell from
`(pos, count, origin)`, and `computeBreakpoints(weight, opts)` turns that into the slice of the global
timeline the cell owns — direction is weight inversion, smoothness is the width of the window.

**The library names no weight and knows nothing about origins.** `CellAnimation` took
`getOriginType`, `getWeightType` and `getWeightOpts`, so the nine named origins and thirty-seven named
weights were the only ones a consumer could have. Wrong ownership: a consumer wanting an origin the library
never thought of, or a distribution driven by their own data, had no way in. All of them moved to
`src/Playground/App/Samples` as sample code to copy, extend or ignore.

**The weights slot is a callback taking the count.** The grid the component draws is not the grid the
consumer asked for — the requested count is clamped against the measured pixel size, since cells thinner
than a pixel cannot draw. A weight grid built from the consumer's own numbers would be the wrong shape
whenever that clamp bites, and a wrong shape breaks indexing, so the component hands the effective count to
`computeCellWeights`. Missing weights fall back to `0` per cell rather than throwing.

**The origin never enters the library at all, not even as data on the defs.**
`CellAnimationEvaluationDefs` is `{ pos, count, weight, size }`; a consumer needing an origin merges their
own in at the call site, as the Playground's `DefaultExample` does. A threaded origin would be a value the
component stores, validates and re-renders on while never reading it — API surface that only forwards. The
consumer already holds the point, having computed the weights from it.

Two consequences. Whoever wants origin-aware zones or keyframes types their own defs as
`CellAnimationEvaluationDefs & { origin: Point2d }`, which is what `CellAnimationZones.isInZone` and
`CellAnimationKeyframes.computeAnimation` take. And a consumer whose origin is derived from the grid must
derive it from the count they requested, not the count the component settled on — the one place this shape
is weaker than threading the value.

**`ScanlineAnimation` is a preset over this, not a second engine.** A scanline is a 1×N grid, so a line is a
cell and `getLineCount` is the only prop it adds; the five orderings it used to own became the `sequence*`
weight functions, which are exact rather than approximate. It kept its own name and evaluator alias because
the line-shaped API reads better for the common case — the reasoning that makes `Toggle` a preset over
`Checkbox`.

**A preset that loses an axis drops what indexed on it rather than narrowing it.** A scanline is a single
column, so every weight reading `dist.x` collapses: six go constant (`lineColumn`, `lineColumnAlternate`,
`lineColumnConvergent`, `radarDouble`, `radarQuad`, `quadrantDefault`), four more fall to two values, and
most survivors are a plain row ramp wearing a name like `spiral` or `checkered`. The distance-based
survivors are the only reason an origin would exist on a line, and a control meaningful for three of nine
options reads as broken. This used to be enforced in the library — `ScanlineAnimation` narrowed `weightType`
to `ORIGIN_FREE_WEIGHT_TYPES` and exposed no origin. With the vocabulary gone there is nothing to narrow, so
the constraint is now the Playground's: its Scanline page offers only origin-free weights and pins the
origin to `{ x: 0, y: 0 }`. A real loss — the type used to make the trap unreachable.

**Cell geometry is integral and the requested count is honoured exactly.** Edges are
`round(idx * total / count)`, so every cell starts on a whole pixel and the remainder is spread across the
row — 7 cells over 240px start at 0, 34, 69, 103, 137, 171, 206. This replaced two worse rules:
`ScanlineAnimation` snapped `lineCount` down to a divisor of the measured size, tiling exactly but silently
giving 80 lines when you asked for 119; `CellAnimation` used fractional sizes, which have no visual upside
and push a consumer toward a higher count purely to tile cleanly. The count is separately clamped to the
pixel dimension.

**Cells are still drawn one pixel larger than their slot, and integer edges did not make that redundant.**
The Playground renders inside `Viewport`'s `transform: scale()`, so whole-pixel layout edges land on
fractional device pixels, the browser antialiases each cell independently, and hairline seams appear. This
was removed once on the reasoning that exact tiling made it unnecessary and had to go straight back — the
seams were visible on screen, and reasoning about sub-pixel rounding is not a substitute for looking. Only
the drawn box grows: positions, `background-position` and the logical span stay exact, so the extra pixel
repeats the neighbour's first column rather than shifting the slicing. `defs.size` reports the drawn box,
because that is what a percentage `translateX` resolves against.

**Whole-grid operations cannot live in a per-cell evaluator**, which is why weights are computed once per
count rather than per frame: `shouldMakeUnique` and `shouldNormalize` rank every cell against every other,
and memoising the grid also stops `randomDefault` reshuffling every frame. The component owns that memo and
calls the consumer's function to fill it.

**Grid geometry belongs to `ss-utils`.** The per-axis distance between two cells, the clamp of a point into
a grid, and the distance from a cell to the further of its two edges are `Point2dUtils.getDelta`,
`getBoundPoint` and `getFarthestBound`, added in `ss-utils` 0.0.20 for exactly this. `CellAnimationUtils`
keeps only the parity predicates (`isEvenRow`, `isEvenColumn`, `isEvenRing`, `isEvenCheckered`), which read
a distance rather than measure one.

**`getFarthestBound` is not a drop-in for the old `getMaxDistance`.** It reports the honest `0` on a
single-cell grid where the original floored at `1`. Every distance-based weight divides by that number, so
the floor is what stops a 1×1 grid producing `Infinity` — a property of the weight functions rather than the
geometry, so it lives in `CellAnimationWeights.const.ts`. `computeCellWeights` is pinned on a 1×1 grid so a
future simplification that drops it fails loudly.

**An anchor is a translate, not a new value key.** Scaling or rotating about an anchor `a` equals the
centre-anchored transform `M` plus a translate of `(I - M)·a`, and translate percentages resolve against the
element's own unscaled border box — so `transform-origin` folds into `translateX` / `translateY` inside
`fromStops` and never reaches the result type. Exact rather than an approximation, and it generalises to 3D:
with `perspective` on the **parent**, a 3D rotation folds the same way using `translateZ`. It does **not**
work with the `perspective()` transform function on the element itself, which puts the vanishing point at
that element's own `transform-origin`, so moving the origin changes the projection. Perspective on the
parent is also the better rendering: one shared vanishing point is a 3D scene, per-element perspective is N
independent cards.

**Transform functions are emitted in a fixed order** — perspective, matrix, translate, rotate, skew, scale,
with each family's axis variants together — because `translateX(50%) scaleX(50%)` and its reverse are
different matrices, so ordering by `Object.entries` would make composition depend on the key order of a
literal the consumer wrote. Filters are ordered by `CSS_FILTER_KEYS`, and the transform/filter split is
decided by those lists rather than by the ordering constant, so a key nobody listed cannot end up in the
wrong string. `assignAnimationProps` always assigns both properties, so a frame that stops producing a
filter clears the previous one, and it zips each value against `CSSConst.ANIMATION_UNITS[key]`, one entry per
function argument.

**A component that computes a `z-index` owes the page a stacking context.** Cells carry a per-cell
`z-index` from weight so earlier ones layer above later ones while they overlap; without
`isolation: isolate` on the container those values escape into the nearest ancestor stacking context. In the
Playground they landed in the stress test modal's context and painted over its FPS counter.

### Controls: `Toasts`, and a queue the consumer owns

The shape question `backlog.md` parked toasts on rested on a premise that does not
hold here.

**`backlog.md` claimed toasts needed "an out-of-tree queue and an API that is called rather than bound,
which nothing here has". Both halves were already covered.** "Out of tree" is a signal created outside any
component — `createRoot(() => createSignal<Toast<T>[]>([]))`, which `Viewport.context.ts` already does — so
the list outlives whatever raised a notification without the library owning anything. "Called rather than
bound" is what a signal's setter is: `queue[1]((prev) => [...prev, toast])` is an imperative call from
arbitrary code with no component in scope. What the note reached for is sugar — `toast.error("…")` — which is
a layer for a consumer who has been met, and a library that has not met them should not pick their
vocabulary.

So the prop is `toastsSignal: Signal<Toast<T>[]>`, per _"Signal tuples for two-way state"_.

**The division of writes is what makes the two-way signal correct rather than convenient.** The consumer is
the only thing that adds; the component is the only thing that removes — a duration elapsing, and the limit
being exceeded. `Modal`'s `visibilitySignal` argument with a list instead of a boolean.

It also settles an ownership question no other shape answers cleanly. If the consumer owned the list outright
and the component only reported, "show at most three" would be enforced consumer-side, making queue policy
the consumer's job when policy is behaviour and behaviour is the shell's. If the component owned the list
privately, nothing could raise a toast without a handle to a mounted component. A shared signal is the only
arrangement where the component enforces policy by writing something the consumer can see.

**A controller handed over at mount is deliberately not used.** The `onMount` shape issues commands to a
mounted thing; a queue is state, and state that must outlive the mount cannot be reached through a handle the
mount gives out.

**The component keeps everything with a clock**: the enter transition (`ElementFader` unchanged), the
retention window during which an entry already gone from the consumer's list stays mounted to play its exit,
the auto-dismiss duration and its pausing, and the limit.

**Duration lives on the record and nowhere else — there is no component-wide default.** `Toast<T>` is
`{ id, value, durationMs? }`, and an absent `durationMs` means the toast waits to be dismissed. A default
prop would make per-toast stickiness inexpressible, since `undefined` would then read as "use the default"
and there would be no second spelling for "never" that was not a magic number. A consumer wanting four
seconds everywhere puts it in the push helper they already have. This is _"the absent value is the mode"_
from `Progress`, and it fails visibly.

**`id` is a separate field rather than identity living on `value`.** `Tabs` keys on `value` because two tabs
with the same value are meaningless; two identical toasts are meaningful — "Saved" twice in a row — so keying
on value would collapse them or make a change look like no change.

**One piece of internal state: the ordered list of rendered ids**, the admitted list plus the ids still
playing their exit. Everything else derives — an id absent from the admitted list is leaving. Ids are
strings, so `<For>` keys them by value and each entry keeps a stable node whatever the consumer does with
record references; the problem that forced `Tabs` onto `<Index>` does not arise. The record for an id is
latched inside the `<For>` callback, so an entry keeps painting its last known content while it fades.

**An unexported `ToastsItem` leaf per entry**, in the `TabsItem` shape, owning its own `ElementFader` and
duration timer so both are disposed with the entry rather than accumulating in a container that lives as long
as the application. It reports upward once its exit has finished and the container drops the id then.

**The duration timer arms and disarms through `onCleanup` inside its own effect, which is load-bearing.**
The first version cleared a timeout at the top of the effect and measured elapsed time only when pausing, so
the clock restarted from full whenever the effect re-ran — and it re-ran on every array change, because it
read whether the entry was exiting. Three toasts raised together therefore dismissed one and reset the other
two, indefinitely. Arming inside the effect and subtracting the elapsed time in its cleanup makes the
arithmetic correct regardless of _why_ the effect re-runs, and shrinks the dependency set to the duration and
whether it is paused. Found by driving the page, invisible to every type and DOM assertion.

**Pausing is region-wide and forced.** Hovering or focusing anywhere in the region holds every countdown;
there is no prop to switch it off. Focus is the half that matters — a toast must not vanish out from under
the button someone is reaching for. The listeners are `mouseover` / `mouseout` and `focusin` / `focusout` on
the region with a `relatedTarget` containment guard, **not** `mouseenter` / `mouseleave`, because the region
is `pointer-events: none` and is never itself a hit-test target; bubbling from the entries is the only thing
that reaches it.

### `Toasts`: what the painter gets, and why position is not fully delegated

**`renderToast(getToast, getVisibilityTarget, getTransitionDurationMs, getState)` opens with `Modal`'s
contract, in `Modal`'s order.** A consumer's toast painter and their modal painter are the same kind of
object — something that transitions itself between two states over a duration it was handed — and spelling
that two ways would be one contract under two shapes. Four arguments is not new:
`InteractionTooltipDefs.renderContent` already takes four with the same ordering. `getToast` is an accessor
and comes first, following `Tabs.renderTab`, because a consumer may replace the record for an id
("Uploading" becoming "Uploaded") and the painter must see that without remounting and restarting the entry
animation.

**`ToastState` is `{ index, count, isPaused }`, and those are the stacking hints.** The number of cards in
front of an entry is `count - 1 - index`, and newest-ness is a comparison against the ends. `index` is queue
position, oldest first, independent of `getDir` — the consumer sets the direction so they can map it to
visual order. Both are inside the reactive record rather than passed plain like `Tabs.renderTab`'s index,
because they change while an entry is mounted: removing the first toast renumbers everything behind it.
`isPaused` is there so a painter drawing a countdown can hold it; the countdown itself is the painter's, for
`Progress`'s reason.

**Nothing says _why_ an entry is leaving** — elapsed, closed, or pushed out by the limit. A painter drawing
those differently would animate a distinction the reader cannot act on.

**Nothing carries a dismiss action, and that is not an omission.** The consumer owns the signal, so the close
button their painter draws removes the entry from their own list, and the exit still plays because the
component holds the entry through it.

**Position cannot be fully delegated, and the reason is the live region rather than the geometry.** A
notification region only announces content inserted into it if the element was already in the document, so it
has to be a persistent element the component mounts once and keeps — and it has to be the component's, by the
rule that keeps `Select`'s `<div role="group">` out of consumer markup, with more force here because a
subtly wrong live region fails silently. Given that, delegating its position would mean accepting a class name
or a style object, and `TextInput` already argued that out: it accepted a whitelisted style object _only_
because text the browser draws had no other hook. Here there is another hook, used by three components —
`Modal` with `getAlignment` / `getMargins`, `Drawer` with `getEdge`, `Label` with `getDir` / `getGap`. Per
`Modal`: placement is geometry, not paint.

So the region is a viewport-sized layer in the `Viewport` portal that paints nothing and clicks through, and
four geometry props place the stack inside it: `getAlignment` (nine positions), `getDir` (which end new
entries enter from, and whether the stack runs down an edge or along one), `getGap` and `getMargins`. Each
entry sits in a minimal library box that re-enables pointer events and is the flex item; it carries no role,
since politeness is set once on the region and a role per entry would announce twice.

**Alignment is independent of direction, and `ToastsUtils.computeStackAlignment` keeps it that way.** A
reversed flex direction inverts "start" on the main axis, so a naive mapping would make `bottom-right` name
different corners depending on `getDir`. The function flips the main axis alone — exact arithmetic over two
enums, and the one part of this component reachable from `npm test`.

**Flow stacking is the geometry props; an overlapping pile is the painter's**, offsetting and scaling itself
off `index` and `count`, which works for a fixed peek distance. Overlapping by each card's own measured
height does not work and is in `backlog.md` rather than half-solved.

**Toasts sit above dialogs** — `z-index` 200 against `Modal`'s 100 — because a toast routinely reports the
outcome of the action a dialog just took.

**`getLimit` is written out as `Accessor<number | undefined>`** for the `AccessorProps` hole: an optional
prop whose value may be `undefined` cannot pass through the mapped type, and "no limit" is a value a consumer
switches to at runtime rather than a prop they omit. `getAriaLabel` is **required**, since a `role="region"`
with no name is not exposed as a landmark at all.

**`getOverflow` keeps both queue behaviours rather than picking one.** `dismiss-oldest` writes the excess out
of the consumer's list so the newest is on screen; `hold-newest` renders only the limit and leaves the rest
queued, entering as slots free. Genuinely different products — latest-news versus lose-nothing — and the
request for a prop rather than a default is why both exist. Held entries are not rendered at all, so they run
no clock, which falls out of the design.

### Controls: `Collapsible`, and what an accordion adds to one

Settled, on the user's call, when a single show-more panel became the second consumer of
machinery `Accordion` had kept to itself. The split is **what each layer claims about the page** rather than
how either one opens.

**`Collapsible` owns the disclosure**: the trigger's `aria-expanded` and `aria-controls`, the panel, the
measured height, the fader, and `inert` while closed. `expandedSignal: Signal<boolean>` is its state — a lone
panel genuinely owns its own boolean.

**`Accordion` adds the three things that make a panel part of a set**, each a statement rather than a
behaviour: the heading element around the trigger, the panel's `role="region"` named by that trigger, and the
arrow-key walk across the headers. The expanded-set policy, including single-expand, stays with it too, since
only a set can have a policy.

**The heading is the load-bearing half of that split.** A show-more at the end of a paragraph is a control
inside prose; wrapping it in an `h3` puts a heading in the document outline that no reader would agree is
one, and a `region` landmark for a two-sentence expansion is landmark noise. So `getHeadingLevel` is
**optional** on `Collapsible` and absent means no heading element at all — the only component here where the
absence of a prop removes an element rather than defaulting one.

**The panel's role arrives as `getPanelRole` plus `getPanelAriaAttributes`, which is `Popover`'s shape**: the
role is the consumer's, so the ARIA that role requires is too, and one bag beats a prop per attribute.
`Accordion` passes `region` and an `aria-labelledby` pointing at the header id it generated, which is also why
`Collapsible` takes `getId` — whoever names the panel owns the id.

**A section has no boolean, so `SignalMirror` is the bridge.** `Accordion` owns `Signal<T[]>` and each
section reads its own membership out of it, while `Collapsible` wants the whole signal.
`SignalMirror.createValueMirror` was extracted for this and writes outward only when the value actually
differs, so "the difference is the toggle" holds and the set stays the single source of truth. Its fifth
consumer, and the first inside the library.

**`AccordionFlags` is gone rather than aliased to `CollapsibleFlags`**, following the `TextField` extraction:
old names went with it and the Playground's painter was renamed. One shape, one name.

### Controls: `Accordion`, and where auto-height measurement lives

The first component whose geometry cannot be expressed in CSS at all, which decides
the division of labour.

**The height animation is the library's, and that is not a contradiction of "a control paints nothing".**
CSS cannot transition to `auto`, so animating a panel open requires measuring the content and animating to a
pixel value. Measurement is not paint — same category as `Modal`'s alignment and `Label`'s gap — and a
painter cannot do it because the element being constrained is the library's. The painter still owns
everything visible: `renderPanel` receives `getVisibilityTarget` and `getTransitionDurationMs` in `Modal`'s
shape, so a fade or slide inside the panel is the consumer's, layered on a height the library drives.

**Three boxes, each for a reason.** The section wraps a heading and a panel; the panel carries
`overflow: hidden` and the animated height; inside it an unconstrained content div is what gets measured.
Measuring the constrained box would need the height released and restored on every pass — `TextField`'s trick
on an absolutely positioned overlay — and would fight the transition it is feeding.

**`ElementObserver.createBorderBoxHeightObserver` is the extracted half, and `TextField` was deliberately not
migrated onto it.** `backlog.md` asked for the shared piece so the measurement would not be written twice; on
reading both, they share less than that implied — `TextField` clamps to a row count derived from
`line-height`, releases `bottom` to measure a `scrollHeight`, and republishes the result as the wrapper's
`getMinHeight`. What is genuinely common is "observe an element and republish its own height", which is all
the new observer is. Its name follows the coordinate-space rule — border box, layout pixels, so `Viewport`'s
scale never enters.

**The panel stays mounted and goes `inert` rather than being unmounted or hidden.** Unmounting or
`display: none` would make the content unmeasurable and the animation impossible. `inert` takes the subtree
out of the tab order and the accessibility tree while leaving it laid out, as `Popover` does with its root.
The cost is that a collapsed panel's content is still built, so an accordion of a hundred expensive panels
builds all hundred.

**Headers are all in the tab order, and the arrows are an extra rather than a roving order.** The published
accordion pattern, and the opposite of `Tabs` and `RadioGroup`. The difference is what the collection means: a
tab list or radio group is one control with several states, so it gets one stop; an accordion is several
independent disclosures. Arrow, `Home` and `End` come from `NavigationUtils.computeNextPosition` unchanged,
moving focus without selecting.

**Each header is wrapped in a real heading element, and its level is a prop.** `getHeadingLevel` defaults to
3 and picks `h1`..`h6` from a fixed list rather than building a tag name, so it stays typed. The level is
document structure, which only the consumer knows; the library owning it would either invent an outline or
force `role="heading"` with `aria-level`, and a real element is better for both AT and outline. The heading
gets `margin: 0; font: inherit` — a reset in the same category as `interactionRoot > * { margin: 0
!important }`, not paint.

**`getSizing` defaults to `"fill"`, following `Progress` rather than `InteractionWrapper`.** Found by driving
it: with the root shrink-wrapping its content, opening one section changed the widest section and re-wrapped
the text in every other one. An accordion's natural width is its container's. The type is declared on
`Accordion` rather than imported, for `Progress`'s reason.

**The header leaf must re-enable pointer events, and forgetting to is invisible to types.** The first
`Accordion.css.ts` did not, so a header looked perfect and could not be clicked — the hit test landed on the
heading above it. `Button.css.ts` and `BinarySwitch.css.ts` are the precedent. Nothing in the type system or
in a DOM assertion catches it; only a real click does.

### `LiveAnnouncer`: the region that belongs to no component

Settled, on the user's call, for `Calendar`'s month change.

**A live region only announces content inserted after it is already in the document** — the rule `Toasts`
records — which is why a component cannot mount one when it needs to speak. Two module-level regions, polite
and assertive, created on first use and kept, sidestep that. They live on `document.body` rather than in the
`Viewport` portal: nothing about them is painted, so the scale factor is irrelevant, and they must outlive any
subtree that might announce through them.

**Each message is its own node, removed a second later.** Setting the text of one persistent node does not
re-announce an identical string, so paging back to a month you were just on would be silent. Appending a fresh
child is an addition every time, which is what `aria-relevant="additions"` tells a reader to watch. Radix's
per-toast announce arrangement and React Aria's shared announcer, from the same constraint.

**Visually hidden by the clip-rect idiom, not `display: none` or `visibility: hidden`**, either of which
would take the text out of the accessibility tree along with the paint. The styles are applied imperatively
because the element is the library's own and never reaches a stylesheet.

**`Calendar` is the first consumer, and it formats the month itself.** Paging swaps all 42 cells and changes
nothing else, so a screen reader user hears nothing until they move focus. The month title on the page is the
consumer's markup — `Calendar` renders no header — so the announcement cannot be read off it and goes through
the same `Intl` path the day labels use. Politely, because paging is something the reader just did rather
than news. The previous month arrives as the effect's own argument, so the first run has nothing to compare
against and a calendar never talks about itself as it mounts.

### `NavigationUtils.computeNextCell`: the two-axis walk never wraps and never clamps

Settled, beside the 1D walk rather than replacing it, and deliberately different at the edges.

`computeNextPosition` wraps within its length, because a tab list or menu is a closed ring.
`computeNextCell` does neither: overflow along a row **carries** into the neighbouring row, and `y` is
allowed out of range. That lets a caller whose grid is a window onto something larger resolve the overflow by
moving the window — `Calendar` reads `y === -1` as "the previous month" and needs no special case for the
first or last day. `x` is always in range, because carrying is what puts it there.

**Page keys mean a page of rows, and a caller for whom they mean something else turns them off.** A month is
not six weeks, so `Calendar` passes `hasPageKeys: false` and does month arithmetic itself. `hasEdgeKeys`
works as before, and `Home` / `End` are the ends of the **row**, not of the grid.

### Controls: `Calendar`, and the date value the library owns

Settled, closing the dependency question `backlog.md` recorded as a real decision.

**No date library, and no `Date` in the public API.** `Abstracts/DateValue` holds
`DateValue = { year, month, day }` with **`month` 1-12**, plus `DateValueUtils`. Two things drove it: a
`Date` is an instant, so a date-only value round-tripping through one shifts across a zone boundary, while a
record has nothing to shift by; and `Intl.DateTimeFormat` already supplies every locale-dependent string, so
the only thing left to own is arithmetic, about eighty lines. Months are 1-12 rather than `Date`'s 0-11
because an off-by-one month is the most common bug in date code and no type catches it.

**Every conversion goes through midday**, never midnight. A midnight anchor can land on the hour a zone skips
or repeats, so "add a day" moves by 23 or 25 hours and lands on the same or the wrong calendar date — a
stepper that appears to stick. Midday is never inside a transition anywhere on Earth.
`DateValue.utils.test.ts` pins both European transition dates.

**No conversion may pass a year to the `Date` constructor, because it reads 0 to 99 as the 1900s.** Corrected
. `new Date(year, month - 1, day, 12)` was the single conversion for a long time and is wrong
below year 100: a Caesar born in year 44 was stored as 44 and described everywhere as 1944 — wrong weekday,
wrong grid, wrong label — with nothing reporting a problem. `getDaysInMonth` had it twice over: February in
year 4 answered 29 because it was really being asked about 1904.

Both now go through one private `buildLocalDate`, which builds an anchor date in a safe year and calls
`setFullYear(year, month, day)` — the documented way past the shorthand. **All three fields go in that one
call**: set alone, the year lands on an anchor whose month and day have already been normalised, and year 0 is
a leap year while the 1900 it was shorthand for is not, so 29 February in year 0 would have become 1 March on
the way through. The shorthand is unreachable from the rest of the file — the two remaining `new Date` calls
with a literal year build the month and weekday **name** lists, where the year is an arbitrary anchor.

**A year outside 0000 to 9999 is written in ISO 8601's expanded form, and only then.** Same day, closing the
other half of the same bug. `toIso` was padding the _signed_ string, so year −44 came out as `0-44-08-01` with
the minus where the third digit belongs, and `fromIso`'s four-digit pattern refused to read it back. Padding
the absolute value and putting the sign in front is the whole fix; the pattern widens to "four bare digits, or
a sign and six" and the fixed length check goes, since a pattern anchored at both ends already rejects
anything longer. Six digits with a leading sign is what ISO 8601 prescribes and what
`Date.prototype.toISOString` emits, so the expanded form round-trips through the platform.

**Expanded only when the year needs it.** Emitting a sign on every date would be more uniform and would
rewrite every stored date string every consumer has, for a case almost nobody reaches. The cost is that the
writer is canonical while the reader is lenient — `fromIso` accepts `+002026-08-10` and `toIso` gives back
`2026-08-10` — so reading and writing normalises rather than reproducing the input character for character.
Both halves are pinned by tests. `-000000` is refused: ISO 8601 does not allow a negative zero year, and
`toIso` can never emit one.

**What this does not buy: a BC date still cannot be typed.** `DateInput`'s mask is a fixed run of digit slots
and everything that is not a digit is discarded on the way in, so a sign has nowhere to go — the same missing
piece `backlog.md` tracks for the formatted number. Storing, loading, computing and displaying a
pre-common-era date all work; entering one is by code or by the calendar's paging.

Before anything labels one: this is astronomical year numbering, inherited from `Date`, so there is a year 0
and it is 1 BC — year −44 is 45 BC. `Intl`'s `era` option already does that conversion, and nothing here
should reimplement it.

**`addMonths` clamps the day; `fromIso` refuses an impossible date.** 31 January plus a month is 28 or 29
February, never 2 or 3 March, because `Date.setMonth`'s rollover makes a month stepper skip months. And
`fromIso("2026-02-31")` is `undefined` rather than 3 March: a field that silently moves what was typed is
worse than one reporting the value as not yet valid.

**The grid is always six weeks of seven days, and carries the neighbouring months' days.** A fixed row count
stops the calendar changing height as months are paged. The neighbouring days make the keyboard walk work
without a special case — the grid is a continuous run of dates, so the next cell from `computeNextCell` maps
back as `addDays(gridStart, y * 7 + x)` whatever `y` is.

**The visible month is a `Signal` the consumer owns, and `Calendar` renders no header.** `monthSignal` is
required, and the month title and paging buttons are the consumer's markup outside the component. The
alternative — a private month plus a `renderHeader` slot handed paging callbacks — would invent a controller
record for something the settled convention covers. `Calendar` writes the signal when the keyboard walk leaves
the month, which is exactly the two-way case, and it means `DatePicker` can snap the month to the value when
its popup opens without the component having an opinion.

**That header being the consumer's is what made an interactive caption free.** Added: the
Playground's caption is a month title that turns into a `Select` for the month and a `NumberInput` for the
year when clicked, with the paging arrows either side throughout. `Calendar` was not touched — the caption
writes `monthSignal` exactly as the arrows did. It lives in `StyledComponents/CalendarCaption` and both
`CalendarPage` and `DatePickerPage` use it, since the two had written the same header twice.

**The fields are a mode, not the resting state**, so a calendar reads as a calendar until someone asks to
jump. Three things end the mode and they are not interchangeable: `Enter` accepts and hands focus back to the
title; `Escape` puts the month back to what it was when the mode opened, which is the only reason a restore
point is kept; and focus leaving the group ends it without moving focus, since the usual way out is clicking a
day and pulling focus off that day would undo the click.

`Escape` layers correctly with the month `Select` underneath — `Select` handles the key only while its popup
is open and marks the event handled, so the first press closes the popup and the second closes the mode; the
caption checks that flag rather than the key alone. The cost: `Enter` cannot close the mode from the month
field, because `Select` claims `Enter` unconditionally. From the year field it works, and `Escape` and `Tab`
work from either.

**Two bugs found building it, both recurring in any component with modes.** A `focusout` fires when the
fields unmount, _after_ the mode has been ended by `Enter` or `Escape`, so the focus-out handler ran a second
time and cancelled the focus restore the first exit asked for; it now ignores anything arriving once the mode
is closed. And the year field's `SignalMirror` pushes its inner value outward from an effect, which runs after
the handler that closed the mode — so `Escape` restored the old month and the mirror wrote the abandoned one
back over it; the year write ignores anything queued while the mode is closed. Both are the same shape:
**ending a mode is not one event, and the tail of the old mode arrives after it.**

**The year is written on a `FunctionUtils.debounce`, not on every keystroke.** Typing 1066 into a live field
pages the calendar through years 1, 10 and 106. `Enter` and focus-out flush whatever is pending rather than
waiting, so nothing is lost by leaving quickly. The mirror tolerates this without special handling — while no
write has landed the outer value has not changed, so nothing pushes back over what is being typed.

**The year is a number field rather than a second `Select`, and not on taste.** A `Select` materialises every
option and nothing here virtualises them, so a year list must be bounded — and any bound is invented, since a
hundred years back is right for a birthday and absurd for a booking. A number field needs no bound, and typing
four digits beats scrolling eighty rows even in the ordinary case.

**The caption sets the calendar's width, which is why the day cell grew from 36px to 46px.** Two arrow
buttons, a month name and a four-digit year do not fit across seven 36px columns — the frame ended up a
hundred pixels wider than the grid, with the grid visibly floating. `Calendar`'s root is `width: fit-content`
and the cell size is the Playground painter's, so the cell is the only end that can move: 46px × 7 is 322px,
which is what the caption needs. If a `getSizing` is ever added to `Calendar`, this constraint goes away.

It also keeps the frame still across the mode switch: the edit-mode header is the wider of the two, so sizing
the grid to it means the box does not resize under the pointer when the title is clicked — which it would
have, by seventy pixels, at the old cell size.

**Selection is by date, one tab stop, and the cell carries the whole date as its name.** `valueSignal` holds a
`DateValue | undefined`. The grid is a roving tab order over 42 `InteractionWrapper`s, following `Tabs` rather
than `Select`'s `aria-activedescendant`, because each day is a real element that can hold focus. Since the
painter draws a bare number, the cell sets `aria-label` to the full formatted date, or a reader announces
"17" with no month. `aria-current="date"` marks today, `aria-selected` the selection.

**`CalendarFlags` carries the day itself**, unlike every other flags record, because the painter's whole job
is to draw that date and it would otherwise be handed the accessor twice — once as `renderDay`'s first
argument and once inside the flags. Both are available, and the flag is the one a `classList` block can read
alongside `isSelected` and `isOutsideMonth`.

**An intervening wrapper div sits between `role="row"` and `role="gridcell"`**, because every cell is an
`InteractionWrapper` owning its own root. `Select` already made this trade between `role="listbox"` and
`role="option"`; it is in `backlog.md` now that a second component has hit it, a grid's row/cell relationship
being the stricter of the two.

### Pointer drag: a ratio, opt-in, and captured

Settled, closing the primitive `backlog.md` #2 asked for.
`InteractionUtils.trackDrag(ref, disabled, opts)` reports where a pointer is inside an element for as long as
a drag lasts.

**It is a separate call rather than part of `wrapElement`**, as item 2 asked: most controls want no listener
at all, and a two-dimensional surface is the one shape that cannot borrow a native input the way `Range`
borrows one per thumb.

**It reports a ratio of the element's own box, not a position**, which keeps it out of the coordinate-space
trap: pointer coordinates and the element's rect are both client-space, so `Viewport`'s scale divides out of
the fraction exactly and never has to be looked up. Same insight that fixed the two geometry specs — a ratio
of two same-space measurements is scale-free by construction.

**`setPointerCapture` is load-bearing.** A drag that stops reporting when the pointer leaves the element
strands the control mid-drag, and releasing outside must still land the value. Capture also means the
`pointermove` handler can be on the element rather than the document, so nothing leaks when the component goes
away.

**`pointerdown` reports immediately**, so a click positions the value without a drag — what a colour surface
and any track-clicking slider need.

### The swipe: one gesture over the drag machinery, an axis it claims, and a verdict at the end

Settled, closing the gesture `Abstract` `backlog.md` #26 asked for. `InteractionUtils.trackSwipe(ref,
disabled, opts)` reports how far a pointer has pushed an element along one axis, and at the release says
whether that push counts. `Drawer` and `Carousel` are its two consumers.

**Both gestures sit on one private `trackPointer`, and the public pair stay separate.** `trackPointer` owns
the pointer bookkeeping — which pointer is being followed, capture, the four listeners, and whether a release
was a release or a cancel. `trackDrag` reports position from it and `trackSwipe` reports travel from it, and
neither has a way to express the other's report. The item argued for exactly this: a drag reports **state**
for as long as it lasts, a swipe reports **an event** with a verdict, and the argument survived the later
decision that a swipe also reports progress in flight, because the verdict is still a thing a drag has no
word for.

**`trackDrag` now says why a drag ended, which closes `SlideButton`'s cancelled-pointer gap in the same
change.** `onDragEnd` receives `"release"` or `"cancel"`; `SlideButton` activates only on the first, so a
drag the browser or the OS takes over with the thumb already at the end no longer confirms. A swipe must
never commit on a cancel, and that consumer is what made the change to a shipped `Abstract` worth making —
recorded in the item as the condition for doing it.

**Travel is a ratio of the element's own box, not a distance in pixels.** Same insight as `trackDrag`'s:
pointer coordinates and the element's rect are both client-space, so a `Viewport` scale divides out of the
fraction exactly. It also answers the question the item left open — whether in-flight progress should be a
raw offset or a ratio — without taking either horn. A ratio **of the commit threshold** would mean the
`Abstract` dividing by a number only the consumer knows, which is why the item leaned towards the offset; a
ratio **of the element** is neither, and it is the space `trackDrag` already reports in. A consumer wanting
the fraction-of-threshold reading divides at the call site, where the threshold lives.

**The box is the one the gesture started in, and this is load-bearing rather than tidy.** A drawer that
follows the finger moves the very element the ratio is measured against, so a live `getBoundingClientRect`
feeds the element's own displacement back into the travel: pushing a left-edge drawer leftwards halves every
reading, and pushing a right-edge one rightwards runs away to a commit on the first move. Freezing the rect
at `pointerdown` removes the loop. `trackDrag` keeps measuring live, because its two consumers do not move
under the pointer and a page scrolling during a drag would strand a frozen rect.

**A swipe takes the pointer over only once it has travelled, and a drag takes it immediately.** `trackDrag`
captures and calls `preventDefault` on `pointerdown`, which is right for a colour surface — a click there
sets a value. A swipe cannot: the elements it watches are a dialog and a carousel viewport, both full of
buttons and links, and capturing every press inside them would break all of them. So `trackSwipe` waits until
the travel passes a small slop, then captures, and swallows the one `click` that follows an engaged gesture
so a swipe that began over a button does not also press it. The slop is a ratio of the element like everything
else here, which does mean a wide carousel tolerates more jitter than a narrow drawer; a constant in pixels
would be the truer reading of finger jitter, and was not worth reintroducing the scale question for.

**The `Abstract` writes `touch-action` itself, from the axis it was given.** A horizontal swipe sets `pan-y`
and a vertical one `pan-x`, so the browser keeps the axis the gesture does not want and the page still
scrolls. Leaving this to the consumer's stylesheet is the silent-failure case the item warned about: get it
wrong and the browser claims the gesture, the handler never fires, and it happens only on touch hardware.
Since the axis and the CSS have to agree, the `Abstract` owns both ends rather than documenting the pairing.

**`Modal` moves the container, and no painter had to change.** The swipe offset is a `transform` on
`modalContainer` while the painter keeps its own slide off `getVisibilityTarget` — two elements, two
transforms, composing. This follows the rule already recorded for the edges: **placement is geometry and the
slide is paint**, and where the dialog box sits is placement. It also means every existing `Modal` consumer
gets the gesture without touching `renderContent`, which a third argument handing out the offset would not
have.

**A committed swipe keeps its offset and lets the exit run from there.** Resetting the transform on commit
would snap the panel back to fully open for one frame before the painter slid it out. The offset is cleared
when the fader stops being visible, which is after the exit has finished and the whole layer has unmounted.

**Where the gesture is offered is derived, never configured — SC 2.5.1 Pointer Gestures, Level A.** A swipe
is path-based, so anything operable by one must also be operable with a single pointer and no path. `Modal`
attaches it only when the alignment is an edge, and only when overlay-click dismissal is still on: `Escape`
is the path-free route, and a consumer who has already turned off casual dismissal is not handed a more
casual one. `Carousel` attaches it only when `renderControls` was passed, since a carousel without controls
has no keyboard route at all — the same shape as the floater observers running only when `renderFloater` is
passed. A consumer cannot ask for the conformance failure because there is no prop with which to ask.

**A swiping carousel does not rotate, for the same reason a hovered one does not.** WCAG 2.2.2 asks that
self-moving content not move under the pointer; a finger on the track is a pointer on it. `getIsHeld` keeps
its recorded meaning — hovered, focus within, page hidden — and the swipe joins the rotation predicate beside
it rather than being folded into the flag the consumer reads.

**The commit thresholds are per component, not one constant here.** `trackSwipe` takes `getCommitRatio` and
has no default; `Modal` and `Carousel` each name their own. The item recorded that shape, and it is the same
rule as merging two implementations that disagree on a constant. Neither number is a public prop, for the
reason `SlideButton` has no threshold prop: a tuned value with no consumer behind it is a guess.

**A threshold is a fraction of the drawer, so the four edges commit at the same fraction and different
distances.** The travel is measured against the dialog box along the swipe axis, and how thick a drawer is
belongs to the painter — on the Playground a side drawer is 320px wide and a sheet 400px deep, so the same
0.35 asks for 112px sideways and 140px vertically. The alternative readings are a fraction of the viewport,
which would make a narrow drawer need a push most of the way across the screen, and a distance in pixels,
which would make a thin drawer commit almost at once and a thick one feel stuck. Proportional to the thing
being pushed is the reading that holds at every size, and it is the one a person's hand is already using —
the drawer under the finger is the whole of what they can see moving.

**A sheet whose content scrolls needs a second mechanism, and `touch-action` alone cannot be it.** The first
build left top and bottom edges out on the reasoning that `touch-action: pan-x` on the dialog would disable
touch scrolling inside it. That reasoning was wrong in both directions, and the correction is the useful part.

`touch-action` is **not** simply inherited down the tree. A gesture resolves it by walking from the touched
element up to the nearest ancestor that would handle the gesture — the first containing scroll container —
and intersecting only that stretch. Anything above that scroller is never consulted. So `pan-x` on the dialog
does not reach a scrolling panel inside it, and the panel keeps scrolling normally. What actually happens is
the reverse of the fear: over a scrolling panel the browser takes the vertical gesture and the swipe never
fires, and over a panel that does not scroll the swipe works. A gesture that silently works in some places
and not others is worse than one that does not exist, which is why the limit was worth removing rather than
documenting.

**So the gesture is claimed on the first touch move, and held for the whole gesture.** `trackSwipe` listens
to `touchmove` non-passively and, on the first move that has a direction, walks the scroll chain from the
touch target up to the tracked element asking whether anything there could still scroll the way the finger is
pushing. If something can, the gesture is the browser's and the swipe stays out of it; if nothing can — the
sheet is at the top of its content and the finger is pushing down — `preventDefault` claims it. This is the
iOS sheet rule: reading scrolls, and pushing from the top dismisses.

**Holding it for the whole gesture is the part that is easy to get wrong.** Preventing only the first move
stops that one scroll, and then the browser claims the _next_ move and sends `pointercancel` — the pointer
stream ends mid-swipe and nothing commits. Measured in Chromium: preventing every move keeps `pointermove`
flowing to the end with no cancel and no scrolling; preventing none scrolls and cancels at the second move;
preventing only the first scrolls nothing but still cancels. So the decision is taken once per gesture and
then applied to every move of it.

**`touch-action` still carries the axis, because it is the up-front declaration.** It is what tells the
browser the intent before any listener runs, and it is what keeps the page from panning across a drawer in
the areas that have no scroller of their own. The `touchmove` guard is the second half, not a replacement.

**This is the only place in the library that listens to touch events rather than pointer events.** Pointer
events cannot express it: by the time `pointercancel` arrives the browser has already taken the gesture, and
there is no pointer-level way to say "not this one". The guard is therefore touch-only and the mouse path
never reaches it.

### Controls: `ColorArea`, and the value form a picker has to hold

The saturation-and-brightness surface replacing the OS colour dialog, plus the
arithmetic under it.

**Hex is the storage form and HSV the working one, and they do not round-trip.** `Abstracts/ColorValue` holds
both plus the conversions. Eight bits per channel cannot carry hue at black or saturation at grey, so a
surface re-reading the hex on every drag frame would drift and then stick — drag brightness to zero and the
hue is gone. `ColorArea` takes `hsvSignal: Signal<ColorValueHsv>` and never touches hex; converting at the
boundary is the consumer's, and `ColorValueUtils.getIsSameHex` exists so a caller can tell whether the hex it
was handed still describes the HSV it holds. Same shape as the timezone decision under `Calendar`: keep the
lossless form in the working state, convert only at the edges.

**The surface is a `role="group"` over two real range inputs, one per axis.** Both collapsed to a pixel and
taken out of hit-testing, so the drag on the group owns the pointer while the keyboard and assistive
technology get the native slider free — arrow keys, `aria-valuetext`, the lot. Collapsed rather than
`display: none`, because a hidden element is not focusable and the tab order is the point of them. A single
`role="slider"` element was rejected: one slider cannot honestly carry two values, and it would mean
reimplementing key handling two native inputs already have.

Accepted cost: the axis inputs' own focus rings are invisible, so the painter draws focus from `focusedAxis`
in the flags — the arrangement `TextInput` uses for its caret colour rather than the rejected
`:has(:focus-visible)` shape, because here the flag reaches the painter directly.

**`syncElement` returns for a fourth time.** Both axis inputs are pushed from state in a render effect, for
`BinarySwitch`'s reason: the browser moves a range input before it reports, so an owner that refuses or snaps
the write would leave the element holding a value state does not agree with.

**`PopoverRole` gained `"dialog"`.** `Select` brought `listbox` and `Menu` brought `menu`; a popup holding a
control surface rather than a list of choices is a dialog. The union grows as consumers arrive rather than
being a general string.

**`ColorInput` **is** the picker now, and the OS dialog is gone.** It was a native
`<input type="color">` behind a painter; it is now a field button plus a `Popover` with `ColorArea` and a hue
`Range` inside. The three open ownership questions:

- **The hex boundary is the component's.** `valueSignal` stays `Signal<string>`, so no consumer changed, and
  the HSV working state lives inside where a drag cannot lose hue at black. Both directions of that sync
  guard with `getIsSameHex` and read the far side `untrack`ed — a mirror that tracks both sides writes its
  stale half over the new value. The emitted spelling is six digits while alpha is 1 and eight when it is
  not, so the old contract is unchanged until a consumer uses opacity.
- **Dismissal is the component's, and it needs a document listener.** `Select` closes on blur because its
  popup refuses focus; a colour popup cannot, since the axis sliders and the hue slider must be focusable. So
  `ColorInput` listens for a `pointerdown` outside both popup and field while open, and `Escape` closes from
  either and returns focus to the field. The first popup here needing outside-click detection, and why
  `Popover` still has none — the need is the consumer's, not the layer's.
- **The paint is four slots**, following `Select`'s count: `renderContent` for the field, `renderArea` and
  `renderHue` for the two controls, and `renderPopup` for everything around them. `renderPopup` receives a
  thunk rendering the surface plus the HSV signal itself, which lets a consumer add a colour-space toggle and
  channel inputs — paint and arithmetic over a value they now hold, not behaviour the library owes them.

**There is no `renderAlpha`, and there will not be one — settled by the user.** Alpha is a
channel input in `renderPopup`. It was argued the other way first, on the grounds that alpha is judged by eye
and a number field makes you type-look-type; what defeated that is `NumberInput`'s press-and-hold, which
repeats while the stepper is held, so the field already gives continuous adjustment against a live preview. A
fourth slot would have bought the checkerboard track and nothing else, at the price of a permanent optional
prop and a mode on a shipped control.

The omission reads as a gap from outside: `renderArea` and `renderHue` are library-owned inputs and alpha has
no twin, so a consumer scanning the props concludes transparency is unsupported. It is not — the value is
`HSVA` throughout and `toHexValue` emits eight digits whenever alpha is below opaque. The two slots exist
because those controls own a **gesture** the library implements, and alpha owns none.

**A native colour input is no longer reachable through this control**, which is the cost: no form value and
no OS picker, and `FileInput` remains the only control where the UA owns activation. The suite got better for
it — every part of the picker is drivable, where the OS dialog could only be tested by writing the value.

**`Popover` refuses `mousedown` for a list, not for a dialog.** The `preventDefault` that makes `Select` work
also cancels the default action of pressing a native control, and a range thumb's drag **is** that default
action. So a `dialog` popover holding real controls skips it: the hue slider could be typed into but not
dragged, and nothing in the DOM showed it. The role already states the intent, so this is a branch on
`getRole()` rather than a new prop.

**Alpha is optional on the working form, and 0-1 everywhere except in a hex string.** `ColorValueHsv` gained
`a?: number`, so `ColorArea` passes it through untouched and an absent alpha means opaque. `toHexa` always
emits eight digits, because a form that only sometimes carries alpha is a form you cannot type into. `hsl` is
a display form only.

**A two-way mirror must track only its own source, and this cost two bugs to learn.** The Playground's picker
mirrors the hue into a `Signal<number>` for the slider, and both directions originally read the other side's
value inside the effect. That makes the pair fight: picking a colour elsewhere re-ran the hue-to-picker
direction, which found the hue signal still holding the previous hue and wrote that stale hue over the new
colour — so typing a hex produced a different colour entirely. The guard on the far side has to be read
`untrack`ed. The same shape broke the hex field twice over: an effect refreshing the field's text while
tracking the picker overwrote what was being typed. The fourth mirror in the Playground and the first two to
go wrong, which is the argument for extracting it.

**A hex field owns its text until it is left.** Three and four digit hex forms parse, so a half-typed value
commits early; pushing the canonical spelling back in would replace the text under the caret and send the rest
of the keystrokes into the middle of it. Refreshing on the way out is `NumberInput`'s clamp-on-blur rule
applied to a different kind of incompleteness.

**`PageTextField` cannot be used for a field whose value is derived.** Its internal mirror lands one tick
behind the element, and `TextSync` then restores the caret to the offsets captured before the write, so every
character after the first is inserted one position early. The picker's hex field uses `TextInput` directly
with a signal it owns. Worth recording because the wrapper is used on nine other pages and works fine — the
difference is only that their values are not converted on the way through.

### Controls: `DateInput` and `DatePicker`, without the mask

Both ship; the mask `backlog.md` named as their blocker turned out not to be one for
a typed date.

**`DateInput` is a `TextField` over a private text signal, and it reads and writes ISO order only.**
`yyyy-mm-dd`, because that is the one spelling `DateValueUtils.fromIso` accepts and refuses exactly — it
returns nothing for 31 February rather than nudging it into March. A locale-ordered display (`dd/mm/yyyy`) is
what actually needs the mask, since the caret has to skip separators and the display form stops matching the
value form.

**The field owns its text while it is being typed, and snaps when it is left.** The rule the hex field arrived
at, for the same reason: a partial value is not a value, so a string shorter than a complete date is ignored
rather than treated as cleared, and the canonical spelling is written back on blur. This is why `DateInput`
sits on `TextField` rather than `TextInput` — `TextFieldPresetProps` omits `onBlur`, and the blur is the whole
mechanism.

**Its two range props are `getMinDate` / `getMaxDate`, not `getMin` / `getMax`.** `TextFieldState` already has
numeric `min` and `max` for a spin button, and spreading a `DateValue` into those would either fail to compile
or set a nonsense attribute; renaming is cheaper than an `Omit` plus a hand-written pass-through. There is no
`onInput` either: the consumer owns the signal, so an effect over it sees every change.

**`DatePicker` is `DateInput` plus `Calendar` in a `Popover`, and the trigger lives in the field's trailing
slot** — the slot that existed for `NumberInput`'s stepper, needing no widening. The visible month is the
picker's own signal, snapped to the value each time the popup opens, which is what `Calendar`'s required
`monthSignal` was left public for. Typing a date and picking one agree without either knowing about the other:
both write the same value signal, and the calendar follows it.

**Dismissal repeats `ColorInput`'s arrangement**, outside-`pointerdown` plus `Escape` — the third dismissal
story in the repo, and the count is the argument rather than any one of them.

**Paint is four slots**, matching `ColorInput` and `Select`: the field's `renderContent`, `renderTrigger`,
`renderDay`, `renderWeekday`, and `renderPopup` for the surround, which receives the month signal so the
consumer draws the title and paging buttons.

### The mask: only digits are typed, and the caret is computed rather than preserved

Settled, on the user's call to try a mask rather than the element-per-segment shape every other
library uses (`backlog.md` item 7's survey). The primitive two shipped fields were waiting on.

**`TextSyncUtils.applyMask(pattern, previous, next, caret)` is a pure function, so the caret arithmetic is
reachable from `npm test`.** A pattern is `#` for a digit slot and any other character as a literal, so
`dd/mm/yyyy` is `##/##/####`. It returns the text and where the caret belongs; `TextSync.utils.test.ts` covers
the cases that are easy to get wrong.

**Only the digits carry meaning.** Everything that is not a digit is discarded on the way in and re-emitted
from the pattern on the way out. That single rule makes typing `25122026`, pasting `25/12/2026`, pasting
`25.12.2026` and pasting ` 25 12 2026` all land the same value, and it is why the caret cannot simply be
preserved: the position that survives an edit is _how many digits precede it_, and the text offset is derived
from that afterwards.

**Deleting a literal deletes the digit in front of it.** Backspacing the slash in `12/34` would otherwise
strip a character the mask immediately puts back, so the key would read as broken. The tell is that the digit
count did not change across an edit that shortened the text.

**The mask lives in `TextSync` because it owns the caret, and a transforming setter cannot.** The owner's
setter runs after the browser has written the text; it can refuse or rewrite a value but cannot move a caret
it never saw, and a caret left where the keystroke put it lands before the separator the mask just inserted.
`createValueSync` therefore takes an optional `getMask` and, when there is one, writes the masked text, sets
the caret and reports upward — instead of reporting first and syncing back.

**One consequence, accepted: inserting into the middle shifts rather than overwrites.** Typing a digit into
the middle of a complete date pushes every later digit along and drops the last, because the mask holds a
digit string and not a set of fixed-width fields. Overwrite-in-place is what per-segment elements give free,
and it is the main thing this shape does not.

**What a mask cannot do at all**, which is the line where segments would come back: with one input the browser
draws the whole string, so nothing can tint or box the segment the caret is in, and nothing can be placed
_between_ two segments. What it keeps is everything about the field being one input — `renderLeading` /
`renderTrailing` untouched, the measured adornment inset still applying, `computeTextStyle` still styling the
value. Verified on the masked `DatePicker`.

### Controls: `DateInput`'s format states the order, and the mask follows from it

Settled, with the mask. `getFormat` takes `"iso"`, `"day-month-year"` or `"month-day-year"`,
defaulting to ISO.

**An arbitrary mask string is deliberately not the prop.** A consumer passing `##/##/####` directly would
leave the component guessing which slots were the month, and a pattern the parse does not agree with is a
field that reads a date wrong in silence. So the order is stated and the pattern derived from it — one source
of truth, the argument the discriminated `SelectItem` record makes.

**`fromIso` is still the only thing that decides whether a date exists.** The display order is reassembled
into `yyyy-mm-dd` and handed to it, so 31 February is refused in every order rather than once per order, and no
second validator exists to disagree with the first.

**ISO is masked too, on the same path.** It could have kept its unmasked branch and did not, because two
paths would be two behaviours to keep in step. Nothing observable changed: a typed `-` is discarded and the
mask supplies its own.

**`TextSyncUtils` is not exported from `index.ts` yet.** `DateInput` is its only consumer and the standing
rule is private until a second arrives — which will be `TimeInput`'s 12-hour clock or the formatted number,
either of which is also the moment to decide whether a consumer building their own masked field should reach
it. _`TimeInput` became that second consumer; the export decision is still open._

### A masked field shows the separator it wants next, and never deletes what it could not read

Both settled, from the user testing the fields and finding them, in their words, broken. One
complaint: **a field must say what it is waiting for, and must never answer a mistake by throwing the mistake
away.**

**The separator arrives with the group before it, not the digit after it.** Four digits into `####-##-##` the
text is `2026-` with the caret after the dash. The old rule was the opposite and is argued a few paragraphs up
— a half-finished field never held a trailing separator, so nothing had to decide whether an incomplete value
ended at a digit or at punctuation. A real simplification bought at the reader's expense: typing `2020` into an
ISO field gave no sign that a month was wanted next, or that the dash would be supplied rather than typed.
Nothing downstream cared, because every consumer of the text counts digits rather than characters.

The deletion rule is unchanged and now does more work: backspacing over a separator still removes the digit in
front of it, so two presses remove two digits rather than a digit and a dash. What changes is where it stops —
`25/12/` loses the `2` and becomes `25/1`, keeping the separator its first group earns.

**An unreadable field keeps its text and reports an error.** `DateInput` and `TimeInput` used to rewrite the
text from the value whenever the field was left, and with no value that meant erasing what had been typed:
entering `2020-20-20` and tabbing away left an empty field and no explanation. The rewrite now runs only when
there is a value to rewrite from.

**Wrong and unfinished are different, and they report at different moments.** A spelling that cannot exist —
the 20th month, `29:99`, a date outside `getMinDate` / `getMaxDate` — is wrong the instant the last digit
lands, and errors immediately while the field still has focus. A half-typed value is not wrong yet; saying so
mid-keystroke would be noise, so it errors only once the field is left, and typing again clears that. Both
surface through the flag the painter already reads: `getHasError` is the consumer's own prop **or** the
field's own judgment, so a consumer who passes nothing still gets a field that says no.

This is what `hasError` on sixteen controls was waiting for a producer to do, and the producer turned out to be
the control itself rather than the form story `backlog.md` files it under.

**The value is still cleared when the text cannot be read.** The error is about the text; the owner is told
there is no date, which is true. What changed is that the field stops agreeing with the owner by going blank.

**A part that cannot exist is refused before the rest of the value does.** Added the same day, on the user's
observation that a 13th month is already wrong without waiting for a day: `TextSyncUtils.readGroups` reads the
**complete** fixed-width groups of the digits typed so far and range-checks each on its own — month 1-12, day
1-31, hour 0-23 or 1-12 on a 12-hour clock, minute and second 0-59. A group still being typed is not reported,
so `1` never has to answer for the month it might become.

The bounds are per-part rather than per-value: the day's ceiling is the longest month, because a 30 February is
two parts _disagreeing_ rather than one part being impossible, and that stays `fromIso`'s to catch. Three
checks in order — impossible part, complete-value parse and bounds, then unfinished — each reporting at the
earliest moment it can be sure.

**Not extended to an impossible _prefix_**, though the same argument reaches it: a month whose first digit is 2
can only become 20-29 and is already doomed. Refusing it needs the field to reason about what a group could
still become, and the published answer to that case is auto-advance — typing `2` fills `02` and moves on —
which is a different feature with its own keyboard consequences.

### A masked field offers the placeholder that matches its own mask

`renderPlaceholder` is `(getFlags, hint)`, where `hint` is `yyyy-mm-dd`, `dd/mm/yyyy`,
`hh:mm` or `hh:mm:ss` depending on what the field is spelling. A consumer wanting something else ignores the
argument; the Playground's eight variants stopped carrying eight hand-written strings, three of which were
wrong — every time field said `yyyy-mm-dd`.

**It comes from the format, not from the mask string.** The hint and the pattern are two renderings of one
definition (the ordered parts and the separator), so `computeHint` sits beside `computeMask` and reads the
same record. Deriving the hint by rewriting `####-##-##` would need a second thing to know that the first
group is a year — the guessing _"an arbitrary mask string is deliberately not the prop"_ avoids.

**It is a plain string rather than an accessor**, following `Calendar.renderWeekday`'s `name`: the painter
reads it inside a tracking scope, so a format change re-renders it anyway.

The prop behind it is `getPlaceholderHint` on `TextField`, `Omit`ted by `DateInput` and `TimeInput` for the
reason they omit `getMask` — they own the format. A hand-built `TextField` or `TextInput` sets neither and its
painter is handed `undefined`.

### Dismissal is one stack, and `Popover` is the layer

Settled, replacing five stories: `Select` closed on its field's blur, `Menu` on its popup's
blur, `DatePicker` and `ColorInput` each ran their own document-wide press listener, and `Modal` its own
document `keydown`.

**`DismissStack` is a module-level array of open layers with one set of document listeners**, in the
`LiveAnnouncer` position — it belongs to no component and there is one of it. Not owned by `Viewport`: a
consumer with no `Viewport` still needs dismissal, the events are the document's rather than any element's,
and nesting a `Viewport` inside a `Viewport` would need cross-authority ordering a single array does not have.

**A press or a focus move is positional; `Escape` is a stack operation.** Every layer the target sits outside
of hears about a press or a focus move, which closes a whole menu tree at once and is what
`getIsWithinOwnedLayer` keeps from closing a parent when the press was inside a child. `Escape` goes to the
innermost layer and stops — the bug this fixed: every control handled `Escape` locally and let the key travel
on, so a popup dismissed inside a `Modal` took the `Modal` with it. `modal.spec.ts` drives it over a `Select`
inside the modal on `ModalPage`.

**The reason reaches the consumer, because the right response differs by reason.** `DatePicker` and
`ColorInput` return focus to their field on `Escape` and do not on a press, since moving focus to a field
someone just clicked away from is wrong. A submenu closes only its own level whatever the reason; `Tab` still
closes the whole menu, from the menu's own key handler, before focus moves.

**`Popover` registers the layer, so its four consumers get dismissal by existing.** Roots are the popup
element and the anchor. The controls kept `onDismiss` shaped as their own close paths and lost their
listeners, their `onBlur` plumbing and `Menu`'s `computeIsInsideMenu` walk.

**Window blur no longer closes anything.** `focusout` with no `relatedTarget` is ignored, so switching apps
leaves a popup open where `Select`'s old field blur would have closed it. That matches Radix, and it is why a
focus move alone is not enough — the press listener covers a click on dead space.

### A portalled layer's z-index is one above its anchor's

Settled, as the tail of the dismissal work: a `Select` opened inside a `Modal` could be
dismissed by key but not clicked, because `Modal`'s overlay is `100` and `Popover` was a fixed `1`.

**The number comes from the anchor, not from a register of layers.** `AnchorUtils.getStackingBase` walks the
anchor's ancestors and takes the highest numeric `z-index` on the chain; `createPortalPosition` publishes that
plus one as `getZIndex`, recomputed each time the layer becomes visible. A popup on an ordinary page lands on
`1`, one inside a dialog on `101`, and a submenu anchored to an item inside a popup at `101` on `102` — so a
chain orders itself without anyone counting.

**Why not the stack.** Open order and paint order are different questions: a `Modal` opened _from_ a menu
should cover the menu that opened it, and the anchor chain says so while a counter does not. It also keeps
`DismissStack` a listener rather than something that paints, and leaves a consumer's own stacking free of a
number the library invented.

**`Tooltip` takes the same number and no longer takes a prop.** `computeZIndex` went with this change: it
existed so an "in" placement could paint _under_ the button that opened it, and a portalled layer cannot do
that at all — the `Viewport`'s portal is `z-index: 10` above page content, so everything in it clears every
anchor. Getting that effect would mean raising the anchor above the portal while its layer is open, which is
the library writing a `z-index` onto a consumer's element.

### A popup opened from inside a popup is not outside it

Settled, from a bug the calendar caption exposed: opening the month `Select` inside the
`DatePicker`'s calendar and clicking an option shut the whole calendar. `DatePicker` dismisses on a press not
inside its popup, and a popup is portalled to the end of the document — so the select's list is a **sibling**
of the calendar rather than a descendant, and `contains` reported the click as outside. Every nested popup has
this shape.

`DismissUtils.getIsWithinOwnedLayer(target, roots)` walks up from the pressed element, and every time it
reaches an element something else points at with `aria-controls` it jumps to that controller and keeps
walking. The select's list is controlled by its field, the field is inside the calendar, so the press resolves
as inside. **Ownership is already in the markup**, put there for screen readers, so nothing has to be
registered on open and no order maintained.

It is not the layer stack `backlog.md` asks for and does not pretend to be: a stack also decides which of
several open layers a stray press dismisses, and orders them. It fixes containment only. `ColorInput` runs the
same kind of listener and should adopt it when the stack is built.

### The am/pm segment is a control in the trailing slot, not a slot in the mask

Settled, on the user's suggestion, removing the extension the mask looked like it needed. A
12-hour field was the reason to add a non-digit slot to the pattern; putting the meridiem in `renderTrailing`
means **the pattern stays digits-only** and nothing about the mask changes.

**It is `renderTrailing` widened, not a new slot, and not `renderDecoration`.** `TimeInput` re-declares that
slot as `(getFlags, meridiem)`, exactly what `NumberInput` does with its stepper — both would want the same
physical position, and one slot lets a painter draw a unit and a control together. The decoration overlay
cannot host this at all: one full-box overlay inheriting `pointer-events: none`, so a control inside it is
unclickable, and it is not positional.

**The value stays 24-hour and the meridiem is a way of reading it.** `TimeValue` gains no fourth field.
`TimeValueUtils.getMeridiem` / `getTwelveHour` / `withMeridiem` / `fromTwelveHour` are pure and tested, and
they are tested because **midnight reads as 12 am and noon as 12 pm** — the mapping is not `hour % 12` in
either direction, and nothing in the type system catches an off-by-twelve. Keeping 24-hour form also makes the
hard case free: stepping the hour past eleven carries into the next half of the day with no arithmetic of its
own, because the meridiem is derived from the hour rather than stored beside it.

**The meridiem is nonetheless a signal, and only because of the empty field.** With no value there is no hour
to read it off, and a consumer who chooses "pm" before typing has to have that remembered. Whenever a value
exists it wins — an effect pushes the value's own meridiem back into the signal — so the two cannot disagree
about a time that is actually held. The parse reads the signal `untrack`ed, per the mirror rule.

**Accepted consequence: it is a second tab stop.** Native `<input type="time">` makes am/pm a third segment
inside one control, reachable by arrow keys. Here it is a `Button` in the trailing slot with its own focus
ring, the same call recorded for a two-thumb `Range`. It has to carry a name: the Playground's toggle sets
`aria-label` to "Before or after noon: AM", because the glyph is `aria-hidden` like every painter's text.

**`TimeInput` uses the mask too, as of.** It did not, and the paragraph here argued that was
deliberate; the user found out what it meant by typing `203` and getting `203` rather than `20:3`. The
reasoning was sound about not bundling and wrong about the outcome: a field whose twin punctuates itself and
which does not is not a smaller feature, it is an inconsistency the reader hits immediately.
`computeMask(segmentCount)` builds `##:##` or `##:##:##` from the same constants the caret arithmetic uses, so
the two cannot drift, and the segment stride is unchanged because a mask emits exactly the fixed-width
segments the arithmetic assumed.

### Controls: `TimeInput`, and stepping the segment the caret is in

Settled, immediately after `DateInput` and on the same shape.

**`TimeValue` is `{ hour, minute, second? }` and mirrors `DateValue` deliberately**: a record rather than a
`Date`, its own arithmetic, `Intl` only for formatting. No midday trick, because a time of day carries no zone
— which is also why `second` is optional in a way `DateValue`'s fields are not: a time to the minute and a
time to the second are both complete values, and the shape says which one a consumer holds.

**Everything compares through `getSecondOfDay`**, so a value with seconds and one without mix safely: `09:00`
and `09:00:00` are the same time and `isSame` says so. Field-by-field comparison would make those different,
which shows up as a filter quietly dropping rows.

**Stepping wraps around the day; typing does not.** `addUnit` carries between segments and wraps at midnight,
because a clock has no end. A **typed** time is refused instead: `24:00` reports no value rather than becoming
midnight, on `fromIso`'s rule. Bounds behave the same way in both directions: a stepped value clamps, a typed
one outside the range is simply not a value.

**The arrow keys step whichever segment the caret is in, and then select it.** The segment is derived from the
caret offset — three characters per segment including its separator — so no per-segment elements and no mask
are needed. Selecting the stepped segment afterwards is what makes a run of presses work: the caret would
otherwise drift and the second press would land on a different unit. The one part of the control with no
precedent in the repo, and why `TimeInput` takes `onKeyDown` for itself rather than passing it through.

**The time popup is `Clock`, and it is a column per unit.** The paragraph here used to say there was no
popup and that a list of generated times in a `Popover` would be one; the second half is what was
reconsidered, and why is under `Controls: Clock` below.

### Controls: `Clock`, and why a time popup is columns rather than a list

Settled on the user's call, after the two shapes were weighed side by side.

**The name pairs with `Calendar`.** `Calendar` is the standalone surface a date is picked from and
`DatePicker` is the field plus that surface in a popup; `Clock` and `TimePicker` are the same two things for
a time. Neither surface knows anything about a popup, which is what lets the Playground put a calendar on a
page of its own and would let a consumer do the same with a clock.

**One column per unit, not one list of times.** The list shape is the obvious one — 09:00, 09:15, 09:30, the
thing a booking site shows — and it is what this file used to predict. It was rejected on a single point:
`TimeInput` accepts `getHasSeconds`, and a list at seconds granularity is 86,400 rows. The picker would then
have had to refuse a value the field beside it accepts, which is the one failure a paired field and popup
cannot have. Columns have no such ceiling: the longest is 60 rows whatever the granularity, and the same
`hasSeconds` and `isTwelveHour` accessors drive both halves, so the two cannot disagree about what a time is.

The cost, accepted: picking a time is two or three separate acts rather than one, and the keyboard walk
crosses columns as well as running down one.

**An option carries the whole time it would produce, not just its own number.** Each option is
`{ unit, time, label }` where `time` is the current value with that one unit replaced. Everything else falls
out of it: the option is disabled when that time is outside the bounds, selected when the value already reads
that way, and picking it writes that time. It also gives the honest reading of a bound — with opening hours
of 09:00 to 17:30 and a value of 09:47, the hour option 17 is disabled, because 17:47 is shut.

**The label is the library's, and that is a departure from `Calendar`.** `Calendar` hands the painter a
`DateValue` and lets it draw `day.day`; `Clock` hands over a finished string. Two reasons, and the first is
the load-bearing one: a twelve-hour column reads 12, 01 … 11 rather than 00 … 11, and the conversion is the
one `TimeUtils` documents as easy to get wrong — midnight is 12 am and noon is 12 pm, so it is not `hour % 12`
in either direction. A painter deriving that itself would be re-deriving the exact arithmetic that was moved
into `ss-utils` to stop it being re-derived. Second, the am/pm label is locale text, not a number.

**Twelve is the first row, not the last.** The column runs 12, 01 … 11, because that is the order the hours
fall in — twelve am is midnight. Listing 01 … 12 would put midnight at the bottom.

**The column names come from `Intl.DisplayNames`, and the am/pm words from `Intl.DateTimeFormat`.** A
listbox has to carry a name, and inventing "Hour" in English would bake one language into the library.
`Intl.DisplayNames` with `type: "dateTimeField"` answers `hour`, `minute`, `second` and `dayPeriod` per
locale — "Stunde" in German, "am/pm" in `en-GB` — and it has been in every browser since April 2021, so it
needs no fallback. The am/pm words are read off `formatToParts` of a formatter forced to `hour12: true`,
picking out the `dayPeriod` part, because the words are the locale's and no list of them belongs here.

**The visible column heading sits outside the listbox, and the options sit inside it.** A listbox may
contain options and groups; a heading among them is noise a screen reader has to step over. So the library
draws four levels — a `role="group"` for the whole clock, a plain column, a heading whose content is
`renderUnit`'s, and the `role="listbox"` around the options — and the painter's scrolling box goes inside
the listbox through `renderColumn`, which is where `Select` already put the painter's panel. Keeping
`max-height` and `overflow` out of the library's props is the same argument as there.

**With no value, the fallback time is pulled inside the bounds.** The base a column mutates is the value, or
the current time when there is none. Left unclamped, a bounded clock opened at 22:00 with opening hours of
09:00 to 17:30 has every option in its minute column disabled — each would produce 22-something — so the
picker looks broken until the user happens to pick an hour first. `TimeUtils.clamp` on the fallback fixes it
outright and costs nothing when a value exists.

**Selection is one tab stop over the whole clock, as in `Calendar`.** Up and down move within a column and
wrap; left and right cross to the next column, landing on its reading of the same time; Home and End go to
the ends of a column; only Enter or Space commits. Moving the highlight deliberately does not select, so a
walk across three columns does not write three times. The roving position is stored as **one whole time**
rather than a per-column index, which is what makes crossing columns free — the new column simply reads the
same time its own way.

**Two bugs found building it, both worth knowing because neither is visible in the source.**

An effect that focuses the roving option had its early return _above_ the line that reads the highlight, so
on the first run — when nothing inside the clock has focus yet — the effect finished without ever subscribing
to the highlight and never ran again. Focus then stayed on whichever option it started on while the highlight
walked away. `Calendar`'s equivalent reads its roving day above the guard and is correct by accident of
ordering. **Read every signal an effect depends on before the first `return`.**

And the whole column re-rendered on every value change, destroying the focused option and dropping focus to
the body. The column's children expression read `getColumn().unit`, and the column object is rebuilt whenever
the base time changes, so the expression re-ran and called `renderColumn` again — a fresh `Index`, fresh
elements. A `createMemo` over the unit stops it: the memo only notifies when the string actually changes,
which for a given column is never. **A slot called inside a reactive expression is re-invoked whenever
anything that expression reads changes, so what it reads has to be narrowed to what it actually needs.**

### Controls: `TimePicker`, and the trailing slot carrying two controls

**It is `DatePicker`'s arrangement, part for part**: the field, the surface, a `Popover` between them, the
open state a `SignalMirror` so a consumer may own it, `Escape` returning focus to the input and an outside
press leaving it alone. Nothing here was decided again.

**The one thing `DatePicker` did not have to solve is that the trailing slot was already taken.** On a
twelve-hour field the am/pm control lives there. `DatePicker` could give the trigger a slot of its own —
`renderTrigger` — because a date field's trailing slot was empty. Rather than add a second slot,
`TimePicker` widens the existing one a third time: `renderTrailing` becomes
`(getFlags, meridiem, trigger)` and the painter draws both, or neither, or only the trigger on a
twenty-four-hour field. This is the arrangement the am/pm decision already anticipated — one slot lets a
painter place a unit and a control together, and the physical position both want is the same.

**Both pickers forward a per-item disabled predicate, and `DatePicker` gained its one here.** `Calendar`
had always taken `computeIsDayDisabled` and `DatePicker` never passed it through, so a consumer wanting to
grey out weekends had to drop down to `Calendar` and build the popup themselves. The bounds a picker takes
are a range, and a range cannot express "not on a Sunday" — closing that was the user's call, taken
separately from the work that surfaced it rather than carried along inside it.

### `Button` can be named, and the label wins over the painter

Settled, closing the gap `Calendar`'s paging buttons exposed: a painter drawing only a glyph
left the button announcing "black left-pointing triangle".

**`ariaLabel` joins `InteractionControlProps`**, so it is the wrapper's to hand every leaf rather than each
leaf's to invent, and `ButtonProps` picks it up through the same pass-through `id` and `renderContent` use.
Only `Button` applies it so far; a leaf with its own naming story keeps it (`BinarySwitch` reads the `Label`
context, `TextField` names its input).

**It goes through `LabelUtils.resolveAriaLabel`, so the `Label` rule is inherited rather than restated.**
Inside a `Label` the prop is suppressed and warned about.

**Against painter text, the label wins, and that is the platform's rule rather than a choice.** An
`aria-label` overrides descendant text as the accessible name. There is no way to detect that a painter drew
words, so this cannot be warned about; the requirement that a painter mark decorative glyphs `aria-hidden` is
the other half. The Playground briefly used a visually-hidden span instead, which worked and is gone: it made
every icon button carry a clip-rect idiom the consumer had to know.

### `spiralSingle`'s overshoot is clamped, not re-derived

The spiral mapping subtracts its raw result from 1 and divides, so a result below 1
lifts the weight above it — which happens only with a half-integer origin, because the formula is built for
whole-number distances. The return is now clamped into 0..1.

It deliberately does **not** separate the two cells that share the extreme. Fixing that means rounding the
distances before the formula runs, which changes measured weights across all three spiral variants — and
measured values are the user's call, not something to re-bless while fixing a range violation. The test pins
the range rather than the old 1.008.

### The form story: the library wires, the consumer validates

Settled, on the user's call. It closes the largest open item, and the decision is the whole of
it.

**Validation is not the library's.** No validator prop, no required / min / max / pattern, no rule language.
Validation is application logic — schemas, async server checks, rules spanning fields — and a library that
owns it ends up with a half-built rule language nobody can extend, plus two sources of truth the moment a rule
needs another field's value. `hasError` stays what it was: a prop the owner sets. What changes is that it now
has somewhere to go.

**What the library owns is association and announcement.** `FormField` generates the ids and wires a control
to its message; `Form` collects what its fields **report** and never computes anything. Those two are the
whole surface.

**`FormField` publishes a context and the control reads it, which is `Label`'s shape reused.**
`FormFieldUtils.resolveAriaDescribedBy` sits beside `LabelUtils.resolveAriaLabel` and merges the context's
message id with any `aria-describedby` the consumer passed, so the consumer wires nothing. The alternative —
handing ids out through a render prop to thread — puts an accessibility relationship in application code where
a missing attribute fails silently.

**An error message is a live region; a hint is not.** The message element takes `role="alert"` only while the
field reports an error, so an error that appears is read out and a standing hint is not re-read on every
render. A message that empties takes the description reference with it, so a control is never described by
nothing.

**`Form` collects entries the way `RadioGroup` collects radios.** Each `FormField` registers
`{ getHasError }` during setup and cleans itself up; `getIsValid` is the memo over all of them. A submit
button reads it through the context, so disabling itself needs no state of its own. Registration rather than a
data-driven list, because a form's fields are written as markup rather than enumerated as records.

**`Form` renders a real `<form>` with `noValidate`, and prevents the default on both events.** The element
gives Enter-to-submit and reset for free; `noValidate` keeps the browser's own bubble from competing with the
messages the consumer draws. `hasSubmitted` is exposed because "show the errors only after the first attempt"
is the one piece of form state that is not a field's.

**A control does not hold its own error back until submit, and `hasSubmitted` is not for the errors it
raises.** Stated by the user. The split is by _who can answer the question_, not by when the
reader would rather hear it. A format, range or mask error is answerable from the field's own text the moment
it is typed, so hiding it until submit is a control keeping a secret from its reader. `hasSubmitted` exists
for the other kind: an answer only a server has — whether credentials are accepted, whether a name is taken.
So `DateInput` and `TimeInput` raising `hasError` from their own text is the other half of the same rule
rather than a conflict.

**`Button` gained `getType`.** A submit button has to be `<button type="submit">` and the leaf hardcoded
`"button"`. It defaults to `"button"`, so nothing changed for existing call sites.

**Only `TextField` and `BinarySwitch` read the description context so far**, covering `TextInput`, `TextArea`,
`NumberInput`, `DateInput`, `TimeInput`, `Checkbox`, `Toggle` and `Radio`. `Select`, `ColorInput`, `FileInput`
and `Range` still need the same one-line call.

### `Button` reports the pointer, and `NumberInput` repeats while held

Settled, on the user's call.

**`ButtonCbs` gained `onPointerDown` and `onPointerUp`**, both gated on disabled like every other callback
there. `pointercancel` is routed to `onPointerUp` as well: a drag that leaves the button, a touch the browser
takes over for scrolling, or a context menu all cancel rather than release, and a control that started
repeating on down must stop in every case or it never stops. Pointer events rather than mouse ones because they
cover touch and pen without a second pair.

**The repeat itself is the library's, not the painter's.** `NumberInputStepper` grew `startSteppingUp`,
`startSteppingDown` and `stopStepping`; the painter calls them from the pointer events and owns no timer. A
painter running its own interval would be four lines of behaviour duplicated in every consumer's stepper, and
behaviour is the shell's — the argument that put the auto-dismiss clock inside `Toasts`.

**Both timings are props with defaults, because they are tuned values.** `getRepeatDelayMs` at 400 and
`getRepeatIntervalMs` at 60 match a native spin button, and they are exposed rather than baked because a
consumer with a slow store or a coarse step wants different numbers.

**A tap still steps exactly once.** `startStepping` steps immediately and only then arms the delay, so the
first step is not deferred and releasing before the delay leaves that single step behind. Both halves are
pinned in `numberInput.spec.ts`, since a repeat that starts too eagerly is indistinguishable from a working one
until someone taps.

**The painter also stops on `mouseleave`.** Pointer capture is not used here, so dragging off the button would
otherwise keep repeating with nothing under the cursor. That is the painter's call rather than the library's,
and the one part of the arrangement the shell does not enforce.

### A leaf with more than one focusable element owns the disabled half itself

Settled, closing a defect found while writing `e2e/range.spec.ts`: on a **disabled two-thumb
`Range`** the second thumb kept a `tabIndex` of 0 and took focus from a click, and on a **disabled
`ColorArea`** both axis sliders did. The first thumb was always correct, which is what made it invisible.

**The cause is that `wrapElement` acts on one element, and the wrapper only ever has one.**
`InteractionWrapper` passes a single `setElementRef` into `renderControl`, and everything about disabled — the
`tabIndex` rule and the `mousedown` refusal — is done to that element. `RangeElement` forwards only thumb 0
and `ColorAreaElement` forwards the `role="group"` rather than either slider, so every other focusable element
was outside all of it at a native `tabIndex` of 0.

**`InteractionUtils.wrapExtraControls(getRefs, getIsDisabled, opts)` is the fix, and it is deliberately only
the disabled half.** It sets `tabIndex` and attaches the same focus refusal, and it is in `InteractionUtils`
rather than either leaf because two components needed it the day it was written.

**Reachability deliberately does not enter into it, which keeps the fix small.** A control reachable while
disabled is focusable so its tooltip can be read, and the tooltip is anchored on the wrapper's single element
— one target reveals it. So the extra elements leave the tab order whenever the control is disabled,
reachable or not, and the leaf never has to know whether it is reachable. That matters because _"Reachable
mode is no longer visible to a leaf"_ removed exactly that knowledge.

**Two rejected alternatives.** Having the wrapper apply the rules to every focusable element inside its root
is wrong rather than merely broad: `TextField`'s `renderTrailing` routinely holds a real `Button` with its own
wrapper — the Playground's password field — and a disabled field must not take that button's tab stop away.
And having the leaf compute the rule from its own copy of the predicate is the duplication
`computeIsReachable` was extracted to prevent.

**`ColorArea` had a second bug in the same place, and it is `syncElement`'s rule for the fifth time.** Its
axis `onInput` returned early while disabled, skipping the push-back — so a refused arrow press left the
slider holding a position state never accepted, `aria-valuetext` disagreeing with the element, and the next
press moving on from the wrong base. It now gates the write and always calls `syncAxis`, which is what `Range`
already did. General form: **a disabled control gates the write and still syncs the element**; returning
before the sync is the bug.

**An enabled multi-element control stays one tab stop per element — settled, on the user's call.**
A two-thumb `Range` is two stops and a `ColorArea` is two; the roving single-stop treatment `RadioGroup` and
`Tabs` use is deliberately not applied. The distinction is what the members _are_: a radio group's members are
N spellings of one value, so stopping on each would make the tab order describe the options rather than the
control, while a range's two thumbs are two values with their own names and their own `aria-valuetext`, and a
colour surface's two axes likewise. `Calendar`'s previous and next buttons are the same call one level out.

### The wrapper between a container role and its items is presentational

Settled, on the user's call.

`InteractionWrapper` owns its own root, so any component wrapping each item puts a div between the container's
role and the item's — `Select` between `role="listbox"` and each `role="option"`, `Calendar` between
`role="row"` and each `role="gridcell"`. The wrapper root now carries `role="presentation"`, which removes its
own semantics and leaves the container owning the items directly.

**It is a `getRole` prop defaulting to `"presentation"`, not a hardcoded attribute.** The default fixes every
existing consumer without each one remembering, and it is honest because the wrapper is structural by
definition. Keeping it a prop leaves the door open for a container that wants the wrapper to _be_ the item —
the rejected alternative here, because moving `role="option"` up would take the id, the `aria-selected` and
the `aria-activedescendant` target with it, which is a refactor rather than an attribute.

**`role="presentation"` is only ignored on an element that is focusable or carries global ARIA**, and the
wrapper is neither. Two other rejected alternatives: hand-rolling each item's flags to avoid the wrapper is
what _"the composition is an implementation detail"_ argues against, and `aria-owns` on the container would
state a relationship the DOM no longer shows — indirection that rots silently the moment the markup moves.

**One residue, and it is the consumer's.** `Select`'s popup surround is consumer markup inside the popover
root, so a listbox still has a consumer div between it and the wrapper. The library cannot mark that one —
the same category as the padding agreement `TextInput` records.

### `SignalMirror`, and the form wiring finished

Settled, closing two unblocked items in one pass.

**Every control here owns its value as a `*Signal`, and a consumer holding a getter plus a callback had to
build the same mirror by hand.** `PageTextField`, `PageSelectField`, `PageCheckField`, `PageNumberField` and
`PageColorField` were five copies, and the colour picker's hue slider made a sixth.
`SignalMirror.createMirror(getOuter, setOuter, opts)` is that mirror once, with `createValueMirror` for the
common case where nothing converts.

**It takes a getter and a setter rather than a `Signal`**, the escape hatch `backlog.md` named as the
alternative to a signal-only surface. A consumer with a signal passes its two halves; one with a store field,
route param or callback passes those. The first attempt took a `Signal` and could not express any of the
Playground's own wrappers.

**Each direction reads the far side `untrack`ed**, which is the whole reason this is worth extracting: the two
colour-picker bugs were both a mirror whose guard tracked the other side, so an unrelated change re-ran it and
wrote a stale half back.

**It converts only when the value changes, so a half-written inner value survives.** Typing `7.0` into a
field mirroring a number leaves the text alone, because the number did not change — the rule the hex and date
fields needed, now free for anything built on it.

**It is not unit tested, deliberately.** A mirror is two effects and a scheduler, not a function of its
arguments. Its four consumers are driven in `e2e/`, where its behaviour is observable.

**The form wiring is complete.** `Select`, `ColorInput`, `FileInput` and `Range` now read the description
context alongside `TextField` and `BinarySwitch`, so every control that can sit in a `FormField` points at its
message without the consumer wiring anything.

### A `Viewport` is a region, and it is terminal for everything inside it

Settled, from `ViewportPage`. A viewport fits the size it is designed for into **the space it
is given**: the root's space is the window, a nested one's is the box the page puts it in. The app's own
viewport is not a special kind — it is the one whose region happens to be everything.

**The host is what clips.** Each viewport renders a host box (`overflow: hidden`, filling its container) with
the scaled design box inside. Since every layer opened inside a viewport is portalled into _that_ viewport's
own portal, one `overflow: hidden` is the whole of "nothing inside a viewport paints outside it": a dropdown
from a control in a nested viewport is clipped by that viewport, not by the window. A nested one measures its
host with a `ResizeObserver`, so the consumer sizes it with ordinary CSS and nothing is passed in.

**Scale multiplies through and the rect is carried into window pixels.** A child was handed the innermost
scale while the screen showed every enclosing scale multiplied, so `getAdjustedBoundingClientRect` — and
through it every anchored layer — was wrong by the outer factor. `getScale` is now the parent's times its own,
and `getScaledRect` composes the host's client rect with the local fit through
`ViewportUtils.composeScaledRect`, which is unit-tested as plain arithmetic on plain rects. That one is read
rather than memoised: the host moves whenever anything above it scrolls, and it is what every anchored layer
measures against, once per frame.

**The transform stays local.** CSS already composes an ancestor's transform, so each root writes its own
`translate` and `scale` in its host's coordinates and nothing accumulates twice.

**An earlier attempt had a nested viewport fill its parent instead**, mounted into the parent's content box by
a portal. It was wrong for the case that matters: a viewport you cannot place cannot be the boundary of
anything smaller than the window, and the boundary is the point.

### The viewport is terminal, and an anchored layer tracks its anchor rather than polling for it

Settled, from three defects seen on `ViewportPage`.

**When perfect placement is impossible, the layer is clipped — never shrunk and never moved over the
anchor.** Three things could give: the layer's size, its distance from the anchor, or the part of it you can
see. The library gives up the last. `AnchorUtils.getBand` gives an `out` placement only the space between the
anchor and the edge it faces, and `clampToBand` pins the edge touching the anchor, letting the far edge run
past the viewport where `overflow: hidden` cuts it. An `in` or centred placement is deliberately over the
anchor and gets the whole viewport.

Pinning the other end — `Math.max(band.start, ...)` in both directions, the obvious clamp — is what makes a
list with nowhere to go slide down over the field it belongs to. Capping the layer's height to the band, tried
first, is the same mistake in the other axis: a list that quietly becomes a third of itself has answered a
question nobody asked. A layer keeps the size its painter chose.

**Scrolling is listened for as well as polled.** `createViewportRectObserver` measured once per animation
frame, leaving a portalled layer a frame behind an anchor being scrolled. It now also repositions from a
`scroll` listener in the capture phase — the event does not bubble, so capture is what hears a scrollable
ancestor — and from `resize`. The frame poll stays, because an anchor can also move under a CSS animation,
which no event reports.

**A portalled layer is placed by `transform`, not by `top` / `left`.** Writing offsets forced layout on every
frame of a scroll; a translate is composited. Both roots pin to `top: 0; left: 0` — an absolutely positioned
box with `auto` offsets would otherwise fall at its static position, which for the second layer in a portal is
not the first layer's.

**A nested viewport is opaque.** `viewportNestedRoot` carries a `z-index` above the parent's own portal layer,
so nothing behind a nested viewport paints through it or can be pointed at. Together with the root's
`overflow: hidden` and each viewport portalling into itself, that is the whole of "a viewport is a black box".
`viewport.spec.ts` drives all three.

### A masked field never spells a value approximately

**The rule.** Given a value its mask cannot hold, a field shows nothing and raises `getHasError` — it is
stating that something is held which it cannot show, the only honest reading of a blank box that is not empty.
Truncating the digit run, clamping the value or dropping a sign each produce a _different_ well-formed value
the field would parse straight back, so the corruption survives a round trip with nothing raised.

Written down after exactly that: the old signed-year `DateValue` accepted any year, `toIso` spelled one outside
0..9999 in expanded form, and `DateInput`'s four digit slots laid the longer run into the mask regardless —
pushing every later part along, so 15 August 44 BC read as `0440-81-5`.

**Where the check belongs, when one is needed.** Not in the mask: `TextSyncUtils` is told a pattern and a
digit run and has no idea which digits were the year, so only the control that built the pattern can know the
run is too long. And the text-to-value effect has to stand down while an unspellable value is held, or the
blank text it just produced parses as "no value" and clears the consumer's — turning a display bug into data
loss.

**`DateInput` needs no such check any more, because the value type stopped being able to hold one.** A
`CalendarDate`'s year is a year _within an era_ and every supported calendar bounds it at four digits, so
`getYearsInEra` is at most 9999. The rule stays written down because the formatted number will meet it again.

**One accepted exception, deliberate rather than overlooked.** `DateValueUtils.withCalendar` clamps when the
target calendar cannot hold the date, and says nothing. Left alone by the user with the cost
of fixing it written out; it sits in `backlog.md` under _"Accepted limits"_, and is named here so the rule
above is not read as absolute.

### The date value carries its calendar system, and every bound is asked of it

Settled by the user, choosing to take `@internationalized/date` as a dependency rather than
read the calendars out of `Intl` by hand, and to support as many calendar systems as the package really
implements. The measured reasoning — what the platform contains, what the reverse conversion costs, why
`chinese` cannot be done this way — is in the entry below and in `backlog.md`.

**`DateValue` is `CalendarDate`, aliased rather than wrapped.** A value carries its calendar, an era, a **year
within that era**, a month index and a day. The old `{ year, month, day }` record with a signed year is gone,
and with it every constant the library held about what a year is made of: month count, month length, month
names, grid row count and year ceiling are now questions asked of the value's own calendar through
`DateValueUtils`. Aliasing rather than wrapping is deliberate — a wrapper would have to re-expose `add`, `set`,
`cycle` and `compare` to be useful, and would then be a second date library.

**Thirteen calendars, and the list is explicit rather than the package's own.** `createCalendar` does not
refuse an identifier it has no implementation for: asked for `chinese`, `dangi`, `islamic` or `islamic-rgsa` it
returns a **Gregorian** calendar, so a consumer would get Gregorian dates labelled as something else with no
indication. `DateValueCalendarId` names the thirteen that map to themselves, and `getCalendarIds` is what a
consumer offers in a picker. The lunisolar calendars are excluded rather than half-supported — the same call as
`Table` being out of scope: a thing that looks supported and is not costs more than a thing that is absent.

**An era is a list the calendar reports, never a pair.** `getEras` returns `{ id, name }` for each — two for
Gregorian, one for Hebrew, five for Japanese. The names are not in the package, so they are read out of `Intl`
by formatting a date inside each era with `era: "long"`; finding a date inside era _n_ is a bisection over the
ISO year, since era index is monotone in time, and the result is cached per calendar and locale. A BC/AD toggle
was proposed and withdrawn: it is one calendar's model, and hardcoding it would put a Western assumption into
a control's API.

**The era is a control in `DateInput`'s leading slot, not a slot in the mask** — the am/pm arrangement in the
trailing slot, for the same reason: the mask carries digits only, an era identifier is not digits, and a
consumer paints it. `DateInput` hands `renderLeading` a `DateInputEra` with `getValue`, `getOptions` and `set`,
so the painter can draw a cycle button, a select, or nothing when the calendar reports a single era. The
Playground draws a cycle button and hides it below two eras, which is what React Aria does with its era
segment.

**The signed year is gone, and that is a gain.** A year before the common era is `era: "BC", year: 44` — no
negative numbers, and no off-by-one at the origin, because ISO's astronomical numbering is the package's
problem and stays inside `toIso` / `fromIso`. The cost is that a year past the end of an era, 12026 AD, can no
longer be _held_: the constructor constrains it to 9999 silently, so `fromIso` and `fromParts` compare the
built fields back against what was asked for and return `undefined` rather than passing a different date on.
**Anything built over this package must do that comparison** — `new CalendarDate(2026, 2, 31)` is February
28th, not an error.

**`getMonthGrid` takes an anchor value rather than a year and a month number**, because a month index means
nothing without the calendar it indexes. It still returns **six** week rows for every month of every supported
calendar — the fixed height predates this work, so paging never reflows the page — and six is enough because
no supported calendar has a month longer than 31 days.

**Two dates are the same day if they denote the same day, whatever calendar each is in.** `isSame` and
`compare` go through absolute day, so a Gregorian `min` bounds a Hebrew value and a date held in one system is
found in another system's grid. `DateInput` converts a value into the calendar it is configured for rather
than refusing it, so a consumer may hold Gregorian and show a Hebrew field over the same signal.

### `MaskedField`: the half every field over a typed value shares

Extracted, once `DateInput` and `TimeInput` had written the same thing twice and a formatted
number was about to write it a third time. `Abstracts/MaskedField` owns the private text signal, the effects
keeping it and the value in step, and the three moments at which a field reports a problem. What stays in each
control is what differs: its codec, its bounds, and whatever control it puts in a slot.

**The value arrives as a getter and a setter, not a `Signal`.** A control may not hand its own prop through
unchanged — `DateInput` converts the value into the calendar the field types in first — so the field cannot own
the signal. Same shape as `SignalMirror`, same reason.

**Completeness is counted in digits, and may be absent.** Only digits are typed, so a half-typed value is one
whose digit run is short; measuring the _text_ agrees while every group is a fixed width and stops agreeing the
moment one is not. `getDigitCount` returning `undefined` says the field has no notion of half-typed at all,
which is the honest answer for an amount.

**The spelling follows the formatting as well as the value, and that needs its own effect.** Nothing else
catches a change of format on its own: switching an amount field's locale leaves the value and the digits
exactly as they were, so the effect comparing them stays quiet and the field goes on showing the old
punctuation. The text is rebuilt **from the value** rather than from the digits on screen, because the same six
digits are `1,234.56` at two decimal places and `123,456` at none.

**A control must not keep a second copy of something the value already carries.** `DateInput`'s era signal is
state _only_ for the empty field, and `fromDigits` reads the era off the held value. Reading the signal instead
made the two fight: moving the era commits a new date, the new date re-spells the text, and the text-to-value
effect re-derived a date from those digits and the signal — which had not caught up — committing the old era
back. Duplicated state plus two effects is a loop.

### `TextField` takes a mask transform, not a pattern

Changed, when the grouped number became the third consumer.
`computeMaskedText(previous, next, caret)` replaces `getMask`: a pattern mask and a grouped number are the same
function with a different body, and a grouped number has no pattern to state because it has as many separators
as its value needs. The transform stays where `getMask` was — inside `TextSync.createValueSync` — because _"a
mask owns the caret"_ is unchanged.

### Controls: `CurrencyInput`, and why it is not `NumberInput` with grouping

Settled by the user, choosing a separate control over widening `NumberInput`.

**The two fields are typed differently, not styled differently.** `NumberInput` refuses characters one
keystroke at a time and keeps `-`, `1.`, `1e` and `1e-` typeable. `CurrencyInput` accepts digits only and
fills a fixed fraction from the right, so `1`, `2`, `3` walk `0.01`, `0.12`, `1.23`. Neither is a mode of the
other, and moving `NumberInput` onto the mask path to get grouping would have risked a shipped control for a
field it is not.

**The digits are the value in its smallest unit, and the shift is done on the decimal spelling.** Multiplying
rounds the wrong way at exactly the cases a money field exists for: `1.005 * 100` is `100.49999999999999`, so a
rounded product loses the penny and `toFixed` inherits the fault. `${value}` prints the shortest decimal that
reads back as the same number, so moving the point along that string rounds on what the consumer wrote rather
than on its binary approximation. A magnitude printing in exponential form falls back to multiplying; an amount
field is not where `1e21` belongs.

**The separators come from the locale, not from props.** `Intl.NumberFormat` already knows them and the
consumer has already said which locale they are in; asking twice invites the two to disagree. `getGroupSize`
stays a prop because it is a layout choice rather than a locale fact — and because uniform groups are all
`applyGroupedMask` can express, which is the limit `backlog.md` records.

**There is no sign and no currency symbol.** The mask is digits-only, so a negative amount cannot be typed;
the symbol is paint in a leading slot, because a library holding no colours does not hold currencies either.

### An era is named from year 2, not from its first day

Settled, from a defect that survived two wrong fixes. `getEras` needs a date to format each
era's name from, and the era's own first day is the one date that does not work: the package puts Meiji 1 at
1868-09-08 while ICU switches on the proclamation date weeks later, so formatting the first day reports the era
_before_ it and Meiji came out named "Keiō (1865–1868)". Year 2 is a full year clear of the boundary and works
whichever way an era counts — forward for Meiji, backward for BC, where year 2 is earlier.

**Every instant handed to `Intl` is taken at midday.** A `CalendarDate` becomes an instant at local midnight,
and midnight is the one moment that does not survive the trip: a daylight-saving change can put it on the
previous day, and a pre-standard-time zone offset is not even a whole number of minutes. The pre-package
`DateValue` did this, it was dropped in the rewrite, and it is back.

**An era carries a long name and a short one.** `DateValueEra` is `{ id, name, shortName }`: the identifier is
the package's and is not display text — `BC`, `meiji`, `before_minguo`, with no casing convention and an
underscore in one — while both names come from `Intl` and are the locale's. A compact control shows `shortName`
and labels itself with `name`. Nothing may render `id`.

### A popup's open state is private until a consumer asks for it

Settled by the user, closing the `openSignal` question items 5, 6, 7 and 15 of `backlog.md`
were waiting on. `Select`, `MultiSelect`, `Menu`, `ColorInput` and `DatePicker` each take an optional
`visibilitySignal`, which is `Modal`'s prop under `Modal`'s name and rules.

**One variable, both sides write** — the `*Signal` convention rather than a new idea, and `Modal` already
proved it on this kind of state: it reads `visibilitySignal` and writes `false` when it dismisses itself. A
popup opens and closes for its own reasons, so a one-way "here is a boolean, obey it" prop would fight the
component. A consumer with no signal uses `SignalMirror`.

**`SignalMirror.createOptional` is how a control stays private by default.** It returns the signal the
component was handed or one of its own, reading the prop through on every access, so there is one code path
rather than a branch at every use. Without it each of the five would carry "the shared one if I was given one,
otherwise mine".

**Every side effect of opening or closing hangs off the state, never off the path that changed it.** The part
easy to get wrong, and why the change touched more than five prop types: `Select` cleared its highlight inside
`close()`, `DatePicker` moved its calendar to the value's month inside `open()`, and `Menu` set the initial
highlight position inside `open(position)` — all invisible to a consumer writing the signal directly. Each
moved into an effect keyed on the open state, so a popup closed from outside ends up in the same condition a
click outside would leave it.

**An invariant the component owns is enforced against the state too.** A disabled control cannot be open:
`open()` already refused, but a consumer writing `true` bypassed it, so `Select` and `Menu` write `false` back
— the correction `Modal` makes for its own dismissal.

**What this does not buy is an opener the dismiss layer knows about.** A consumer's own button sits outside the
popup, so pressing it while open dismisses the popup and the handler then re-opens it: a toggle button appears
not to close. The Playground demonstrates open and close as two separate buttons for that reason. Fixing it
means `Menu` accepting an anchor and an opener, which is what `backlog.md` item 6 asks for next.

### Playback is a signal; a rewind is a command

Settled by the user, applying the argument that had already retired the controller shape for
`Toasts` and `Calendar` to the components that still carried one.

**Whether a thing is playing is state, so it arrives as `playbackSignal`.** `CellAnimation` and
`ScanlineAnimation` had `start()` / `stop()` on a handle given out at mount, both literally
`setIsPlaying(true/false)` over a private signal; `AudioSwitcher` had `play()` / `pause()`, the same state
behind a pair of fades. All three now take an optional `playbackSignal` through `SignalMirror.createOptional`.

**What that buys is visible in the Playground rather than in the API.** Both animation pages used to collect a
controller per mounted instance into an array and call `start()` on every one when the stress-test modal
closed. They now share one signal and write it once, and nothing has to still be mounted for that to work.

**The cost, and the rule it produced: a shared playback signal also governs whatever mounts later.** The old
controller array only held instances that existed when it was filled, so the stress-test modal's own items were
never in it and started playing on mount regardless. One shared signal has no such boundary — the stress test
writes `false` when the modal opens, the modal's items mount into a signal that already says stopped, and the
thing being measured never runs. So **the animations under measurement own a second signal of their own**,
declared in each page's `StressTestWrapper` and passed over the spread; the page-wide one keeps its job of
suspending the examples behind the modal. Generally: a signal shared across a page is scoped to that page, and
anything mounted into a different lifetime — a modal, a portal, a route — needs its own or it inherits a state
that was never decided for it.

**A command that is not a state stays a handle handed over at mount.** `Typewriter` keeps `restartAnimation`
and `update(cause)`, `AudioSwitcher` keeps `reset`. Restarting an animation and rewinding a track are not
values anyone can read, and the reason they cannot be faked with a signal is timing: restarting means the
element must be **painted** in the pre-animation state for one frame before the animation is re-applied, and a
consumer toggling a signal off and on — even across a `setTimeout(…, 0)` — is not guaranteed that frame, since
the browser may fold both changes into one paint. The same hazard `ElementFader` documents, failing
intermittently rather than outright, which is worse. The frame discipline belongs inside the component that
owns the animation.

**So the boundary is: can a consumer meaningfully read it?** Playing, open, selected, expanded — state, and a
`*Signal`. Restart, rewind, re-measure — commands, and an `onMount` handle. Two of the four components needed
both, so the controller shape is not a legacy to be finished off.

### A popup's anchor is also its dismiss root, which is what lets a consumer's own button toggle it

Settled, finishing what `visibilitySignal` started. `Menu` takes an optional `getAnchorRef` and
positions its popup against that element instead of its own trigger.

**The positioning is the smaller half; the dismissal is the point.** `Popover` builds its dismiss roots as
`[the popup, the anchor]`, so whatever element is the anchor is inside the layer and a press on it is not an
outside press. Before this a consumer's own toggle button was outside, so pressing it while open dismissed the
menu and the handler re-opened it. Making that button the anchor fixes it without `DismissStack` learning
anything new.

**A split button is now a composition rather than a missing feature**: the arrow half is the anchor, the main
half does its own work, and the consumer's own signal opens the menu.

**A right-click context menu is still not possible**: it opens at the pointer rather than against an element,
and `Anchor` positions against a ref only. That needs a virtual anchor — a rect standing in for an element —
which is a change to `Anchor` rather than to `Menu`, and it is the last piece. `backlog.md` item 6.

### A list the consumer has not finished handing over: `getHasMoreOptions`, `onReachEnd`, and a marker

Settled, after the published virtualization design was tried and reverted (`backlog.md` item
5). This is the other half of the same problem with a different answer, so both are worth stating together:
**virtualization keeps the whole list and mounts a window onto it; this keeps only what has arrived and mounts
all of it.**

**`Select` takes `getHasMoreOptions` and `onReachEnd`, and never a batch size.** A batch size would put the
library in charge of slicing the consumer's data, and the floor a batch size wants — "at least as many as fit"
— is not computable here anyway: the element that scrolls is the **consumer's** popup surface, since the
`max-height` and `overflow-y` live in their paint, and `Select` holds no ref to it. So the library reports an
event and reads a flag; the consumer decides what a batch is, where it comes from, and when there is no more.
An in-memory array sliced by the consumer and a paged HTTP endpoint become the same mechanism.

**The end is marked by a one-pixel element and watched with an intersection observer, not measured.** The
alternative — a `scroll` listener comparing `scrollTop + clientHeight` against `scrollHeight` — loses on three
counts: it needs the scrolling element, which is the consumer's; it needs a "how close counts" threshold,
which is wrong for some row height; and it is silent when the first batch does not fill the box, because
nothing has scrolled. `ElementObserver.createViewportIntersectionObserver` observes against the viewport, and
an observer computes intersection through every ancestor's overflow clip, so it reports the marker hidden
without being told what is hiding it. "The list is too short to scroll" and "you have scrolled to the bottom"
become the same condition, which is what makes it converge with no startup path.

**The marker overlaps the last option rather than following it, and the keyboard is the reason.** A negative
top margin equal to its own height puts it on the last pixel _of_ the list instead of the first pixel _after_
it, so it costs no layout. It shipped as a plain trailing element, which does not work for
anyone not using a mouse: an option scrolls itself into view with `block: "nearest"`, which stops the moment
that option is fully visible, so a marker beyond the last option is exactly what `End` and the last
`ArrowDown` can never reveal — the highlight lands on the last option held and no batch is ever asked for.
Overlapping makes "the last option is on screen" and "the marker is on screen" the same fact, and the mouse
path is unchanged.

Why the suite missed it: at a scale of exactly 1 the marker's top edge lands on the scroll box's bottom edge to
the pixel, and Chrome reports that zero-area contact as an intersection, so the batch arrives and the spec
passes. The Playground is scaled by `Viewport` and is almost never at 1, and at any other scale the contact
misses by a fraction. **A behaviour that depends on two edges being equal is not a behaviour**, so the spec now
asserts the overlap itself rather than the batch that follows.

**The Playground does not skip painting off-screen options, because it moves the list under the reader.** The
option paint carried `content-visibility: auto` with an estimated row height behind a panel switch. The
estimate is a single number and the rows are not one height — a title alone is short, a title with a wrapped
description is not — so the moment a jump to the end forces the skipped rows to be laid out for real, every
height above the highlight is corrected at once and the scroll offset no longer points where it did. `End` then
leaves the highlighted option below the visible box. The user removed the switch. What it
bought was the cost of _painting_ options, which is a different and smaller cost than _mounting_ them;
`backlog.md` item 5 holds what is left.

**The marker is keyed on the options array, and that is load-bearing.** An intersection observer reports only
_changes_, so a batch too small to push the marker off screen would deliver no callback and the list would
stall. Rebuilding the marker whenever the array identity changes forces a fresh observation of fresh geometry;
`createViewportIntersectionObserver` sets its flag back to `false` on every re-registration for the same
reason, so the answer is never carried over from an element that no longer exists. Reading the flag
synchronously after a batch arrives — what the earlier attempt did — fetched one batch more than it needed
every time.

**The guard holds the options array itself, not its length, and it is a plain variable rather than a signal.**
Nothing renders from it. Its job is to stop a marker that leaves and re-enters while a request is in flight
from asking twice for the same list, and the array's identity is exactly what "the same list" means. Length is
not: a **filtered** list is replaced rather than appended to, so a new query whose result happens to be as long
as the last would be read as already asked and the list would never load. Reachable the moment autocomplete
and batches are combined, which the Playground now demonstrates. The guard clears when the popup closes.

**Filtering and batching compose without either knowing about the other.** The query is the consumer's, the
batches are the consumer's, and the library only reports that the end of what it holds is on screen. A
consumer wanting the server to filter runs a new search on a query change and replaces the array; `onReachEnd`
then pages within that query. Note that `Home` and `End` are already suppressed on a filterable field, so the
wrap rule below is the only keyboard behaviour applying to a fetched autocomplete.

**An incomplete list does not wrap, and that is `Select`'s call rather than `NavigationUtils`'s.** The 1D walk
still answers _which position is next_ and still wraps; `Select` answers _whether to go there_, and refuses
when the step would carry off either end while more options exist. No option was added to
`computeNextPosition`, because three of its four callers are closed rings and would gain a mode they can never
use. `Home` and `End` needed no change — they resolve against the array the library was handed, which is
exactly "the first and last held".

**What this does not do is make a complete list cheap.** A consumer holding 100,000 options in memory and
slicing them gets a list that opens quickly and grows as it is read, at the cost of `End` meaning "the last one
loaded" — the library declining to know something it knows. The user took that trade for the
incomplete case, which is the case this is built for.

### A list too long to mount: `computeEstimatedOptionHeight` and `Abstracts/Virtualizer`

Settled, on the second attempt. **On-demand loading answers a list that has not all arrived;
this answers a list that has all arrived and is too long to build.** They compose, and neither knows about the
other.

**Passing an estimated height is what turns it on, and a list short enough not to need it should not pass
one.** The user's rule: under a couple of hundred options there is nothing to win, and the cost is real — a
windowed list is placed from measurements that arrive late, so it accepts imprecision to buy back time that was
never being spent. No boolean and no automatic threshold, because a threshold would be the library guessing at
a row height it has never seen.

**The estimate belongs to the consumer because the height is a consequence of `renderOption`.** It is per index
rather than one number, so rows in two known shapes can be answered separately. It is consulted only for rows
nobody can see — every row on screen is measured for real — so what it buys is an honest scrollbar before
anything has been scrolled. TanStack's advice is to estimate the **largest** plausible row so the guess errs
one way and the list only ever settles upward.

**`@tanstack/solid-virtual` is a runtime dependency, marked external rather than bundled.** The first attempt
took a package out again; this one keeps it, on the user's call that a dependency is acceptable
for exactly this kind of functionality — the call `colorthief` already carries. External rather than bundled
follows `colorthief` too: a package both inlined into `dist` and declared in `dependencies` makes a consumer
install a copy they never load. `@internationalized/date` is still bundled while being declared, the older half
of that inconsistency, and has not been argued.

**The windower lives inside `Select`, and that is the whole difference from the attempt that failed.** The
design had the **consumer** window the list and hand over only the visible slice, so `Select` walked
the slice: `Home`, `End` and the arrows were confined to whatever happened to be mounted. Holding the whole
array and mounting a window onto it leaves `getFlatOptions`, the navigable set and the whole keyboard model
untouched — only what is in the document changes.

**A grouped list is not windowed, and that is a boundary rather than a preference.** A group's box wraps the
options inside it, so a window opening halfway down one would have to draw a box for a group whose header is
above the window and whose end is below it, and repeat the header as the reader scrolls. Passing an estimate
for a list containing a group mounts everything, silently and correctly.

**Four things the package's documentation does not cover, all from one root: this library is a guest inside
somebody else's popup.**

- **Solid runs a `ref` while the element is still being built.** The measurer identifies a row by reading an
  index attribute off the node it is handed, and at `ref` time the attribute is not on it and the node is not
  in the document — so measuring from the `ref` reads an unnamed, unlaid-out element and silently keeps the
  estimate. Rows then tile on the estimate rather than their real heights, and a row taller than its slot
  paints over the one below. The index is written onto the element and the measurement deferred to mount.
  React's adapter never meets this because React runs refs after commit; nothing warns about it.
- **The rows' container does not start where the scrolling starts.** Row offsets are measured from the top of
  the container the library owns, a scroll position from the top of whatever is scrolling, and between them
  sits however much border and padding the consumer put on their popup. Unset, every scroll target lands short
  by that inset, which reads as an arrow key stopping one option early. `scrollMargin` is the package's own
  answer; the offset has to be worked out in layout space rather than off raw client rects, because `Viewport`
  scales the page.
- **A highlighted row must be mounted whether or not it is in view.** `aria-activedescendant` names an element
  by id, and scrolling to a row is not the same instant as mounting it, so the name refers to nothing until the
  window catches up. The row carrying the highlight is pinned into the range.
- **An option can no longer scroll itself into view**, because until the window reaches it there is nothing to
  scroll. The move belongs to whatever owns the window, and it hangs off the highlight as an effect rather than
  off the key handler, so a highlight arriving any other way is carried the same way.

**What it is worth, measured on the Playground's stress card at 10,000 options**: 792 ms from click to the
first painted frame with every option mounted, against 71 ms with a window of four. Frame rate while open was
never the problem and is unchanged. The remaining cost at open is linear but has no DOM in it — building the
records, flattening them, finding the navigable ones — and that is the floor a windower cannot lower.

### Controls: `Tree`, and the group box that could not be a child

`Tree` is `role="tree"` with expand and collapse, one selected value, and a keyboard
where the two axes mean different things. Most of it is `Select`'s model applied a second time; the parts that
are not are here.

**A node is one record with optional children, and a branch is a node that has at least one.** `TreeNode<T>`
carries `value`, `children`, and the same `isDisabled` / `isReachableWhenDisabled` / `tooltipDefs` trio every
other item record carries. `TreeUtils.getIsBranch` is `(node.children?.length ?? 0) > 0`, `Menu`'s test for a
submenu character for character. The cost is that a branch whose children have not been fetched cannot be
spelled — an empty list reads as a leaf — and that is in `backlog.md` rather than solved, because the fix is a
second field whose only job is to contradict the first.

**Render from the nesting, walk the flat order.** `TreeUtils.getVisibleRows` takes the nodes and a predicate
and returns a rendering tree with collapsed branches already removed; `getFlatRows` collapses that into walking
order. Same split as `SelectUtils.getFlatOptions`, for the same reason: the arrows, the edge keys and the
roving tab stop index into the flat list and never learn that nesting happened. Each row carries its own flat
`index`, so the two views agree without anything being kept in step.

**The `role="group"` box is a sibling of the branch's row, not its child, and that is forced rather than
preferred.** The published markup puts the group inside the `treeitem` it belongs to. Here every row is an
`InteractionWrapper`, which listens for `mouseenter`, `mousedown` and `keydown` on the element it was handed —
all three of which reach an ancestor. A row nested inside another row would report its ancestor as hovered
while the pointer was over the child, and as pressed while the child was being clicked. Fixing that means
teaching `wrapElement` that a descendant's hover is not its own, which is false for every other control, where
the descendants are the painter's own markup.

So the groups nest but the rows do not. Depth still computes correctly from the markup — one group per level —
and `aria-level`, `aria-posinset` and `aria-setsize` are written on every row as well, which the published
pattern asks for whenever the DOM is not the whole hierarchy. The one thing given up is the formal ownership of
a group by the `treeitem` above it; `aria-owns` would restore it on paper and was rejected for the reason
recorded under the presentational wrapper.

**A roving tab stop, not `aria-activedescendant`, because there is no second element to put it on.** `Select`
can name its highlighted option from the combobox because the combobox is a separate, always-present element
holding real focus. A tree has only its rows, so the focused row is the focused element and the tab order has
to be roving — `Tabs`' arrangement, down to the roving position falling back to the selection and then to the
first navigable row.

**Focus moves by id rather than through a ref array, because a tree's indexes move under it.** `Tabs` and
`Accordion` keep an array of refs indexed by position, which works because their lists are flat and fixed.
Expanding a branch renumbers every row below it while the elements stay put, and a `ref` callback does not run
again to say so — so an array keyed by index would silently point at the wrong rows. Each row carries
`${treeId}-node-${index}` as its id and moving focus is a `getElementById`. The same id tells the key handler
which row is focused, which is how a click and an arrow key end up on the same footing.

**The focus rescue on a collapse is a guard over the visible rows, not a step inside `collapse`.** Corrected
. It began as a check inside `collapse` — is focus on a descendant, and if so move it to the
branch — and that check could never be true: `ArrowLeft` and a click both act on the branch, which is already
focused and stays mounted. The case it was written for is a **consumer** writing `expandedSignal` themselves,
the only way a focused row can vanish, and which never enters `collapse`. So the guard watches the visible
rows: it remembers the last row focused inside this tree from a `focusin` on the root, and when a collapse
leaves that row out of the visible set **and** focus has fallen to the document body, it moves focus to the
branch that closed.

All three conditions carry weight. Without the remembered row, a tree nobody has touched would steal focus
whenever a consumer collapsed anything. Without checking that the row actually left, a collapse elsewhere in
the tree would do the same. And without focus genuinely sitting on the body, the guard would fight a consumer
who moved focus on purpose — which is why a button that collapses on the spot cannot exercise it: the button
holds focus, so there is nothing to rescue.

**One press both selects and toggles, because the library paints no twisty.** A consumer draws the branch
marker inside `renderNode`, so the component cannot tell a press on the marker from a press on the label — and
if a press did not toggle, a mouse user could not open a branch at all. `Enter` and `Space` do exactly what a
click does. A consumer wanting "the chevron opens, the label selects" has no route to it; see `backlog.md`.

**A disabled node is not a disabled subtree.** The arrows skip it and nothing selects or opens it, but its
children stay navigable if it was already open. A disabled branch is a statement about that node; a consumer
who means the whole subtree disables the nodes in it.

**A collapsed branch's children are not built**, the opposite of `Accordion`, because nothing needs measuring:
an accordion panel animates to a height it can only learn by building the content, while a tree's rows just
appear.

**Not windowed, and it is the same boundary a grouped `Select` hits.** A window opening halfway down a subtree
would have to draw a `role="group"` whose start is above the window and whose end is below it. The flat walking
order is exactly what a windower wants and the row records already carry it, so the missing half is the markup
rather than the arithmetic.

**The walk wraps, as every other list in this library does.** The published tree pattern stops at the ends.
Wrapping is what `Select`, `Menu`, `Tabs` and `RadioGroup` all do through `computeNextPosition`, and a tree
that stopped would be the one list here behaving differently — consistency inside the library won over the
published behaviour, recorded here rather than being discoverable only by pressing `ArrowUp` on the first row.

### `Tree` nodes can be links, on `Tab<T>`'s terms

Added, at the user's request, after the left menu was weighed as a tree. A hierarchical menu is
the obvious use for a tree and the rows were `div`s: a consumer could route from `onSelectionChange`, but the
entries would not have been links — no middle-click, no open-in-new-tab, no copy-link-address, no destination
in the status bar. None of that is reachable from a click handler.

**`href` is a field on the node and it chooses the element**, exactly as `Tab<T>`'s does. A row with one
renders an `<a role="treeitem">` through `Dynamic`, a row without one stays a `div`, and both take the same
`commonProps` object of getters so the ARIA cannot drift. `TreeProps` also takes a `linkComponent`, for the
reason `Tabs` takes one: an `<a>` reloads the application.

**`TreeLinkProps` is declared in `Tree.types.ts` rather than imported from `Tabs.types.ts`.** The two are the
same shape today, but they are two components' public prop types, and importing one control's type into
another's surface would mean a consumer of `Tree` reading `Tabs`' documentation, and would make a future
divergence a breaking change for the wrong component.

**Keyboard: a link row hands its activation to the element.** `Enter` is left alone, because an anchor fires
its own click from `Enter` and that click already runs the row's activation — so selecting, toggling and
navigating happen through one path, and calling `preventDefault` would have selected the row while refusing to
go anywhere. `Space` is the case an anchor does not answer: the row cancels the page scroll and clicks the
element itself, so the two keys stay interchangeable.

**A disabled link row cancels the navigation rather than just skipping the callback.** The click handler calls
`preventDefault` before returning, which is `TabsItem`'s arrangement and is not optional here: on a `div` an
early return is enough, while an anchor would have followed its `href` regardless.

### Controls: `SlideButton`, and why the gesture is the only thing it owns

Settled, when the user named a slide-to-activate control as a gap. It is a `Button` whose
activation is a drag from one end of a track to the other, for the case where an accidental press would be
expensive — send, arm, delete.

**It is a real `<button>`, and it does not listen for a click.** Listening for `click` would defeat the
control, because a press and a release is a click whether or not anything slid — a tap would activate, and so
would a slide dragged back and abandoned. So the element carries the button's semantics and its name, and every
activation route is written by hand.

**There are two routes, and neither is a tap: drag the thumb to the end, or hold a press until it fills.** The
hold drives the same `progressRatio`, so the paint is identical and a person who cannot drag sees what a person
who drags sees. It answers three things at once:

- **WCAG 2.2's 2.5.7 Dragging Movements**, Level AA: _"All functionality that uses a dragging movement for
  operation can be achieved by a single pointer without dragging, unless dragging is essential."_ A keyboard
  route does not satisfy it — 2.5.7 is about **pointers** — so a mouse or touch user who cannot drag needed
  their own route. The published list of conforming alternatives names long press explicitly, and it is the
  only entry that does not throw away the deliberateness the control exists for.
- **WCAG 2.1.1 Keyboard**, answered by the same hold starting on `Enter` or `Space` held down. A tap of either
  does nothing.
- **The reason the control exists.** A stray `Enter` on a focused button is the keyboard's version of the
  accidental press a slide resists.

What does **not** bite, though it looks as though it should: **2.5.1 Pointer Gestures** is about path-based
gestures, and its Understanding document is explicit that a slider using pointer capture — which is what
`trackDrag` does — counts as dragging only. So the drag route is on the right side of 2.5.1 by construction.

**Apple's own answer is the shape of this, arrived at from the other end.** Asked whether a swipe-to-confirm
harms VoiceOver users, Apple's guidance is to override `accessibilityActivate` so a single activation runs the
same logic **without** the swipe; the iOS lock screen behaves that way. What is built here is that answer with
the timing put back in — the part their platform gets from the assistive technology's own confirmation step and
a web control does not.

**A press on the thumb starts both, and movement decides which.** A hold begins on every press; a press that
landed on the thumb converts to a drag once the pointer travels past a few pixels, and the abandoned hold snaps
back at that moment. Pressing the thumb and holding still therefore confirms, which matters because the thumb
is the obvious thing to press and a dead zone there would fail exactly the people 2.5.7 is for. The travel
threshold is a jitter guard rather than a tuned value and is a module constant; if it ever needs to move it
should become a prop.

**The press must land on the thumb for a drag.** `trackDrag` reports from `pointerdown` onward, which is what a
slider wants — press the track and the value jumps there — and is exactly wrong here, since pressing at 90% and
nudging right would be the shortcut the control exists to prevent. The first report of each drag is hit-tested
against the thumb's current span, and a drag that did not begin on the thumb is ignored for its whole length
rather than cancelled part-way. The grab offset inside the thumb is kept and subtracted from every later report,
so the thumb does not jump under the pointer.

**The thumb's size is the library's to know and the painter's to draw, which is `Range`'s cost paid again.**
`getThumbSize` feeds the hit test and the painter positions its own thumb with
`calc(ratio * (100% - thumbSize))`; nothing enforces agreement, and the Playground keeps them honest with one
shared `SLIDE_BUTTON_THUMB_SIZE`. Handing the size out through the flags was dropped for consistency with
`Range`, which had the choice first.

**The track is measured with `clientWidth` rather than `getBoundingClientRect`.** The thumb size arrives in
plain CSS pixels, so the width it is divided by has to be in the same space; a client rect carries a
`Viewport`'s scale baked in. The same hazard the drag ratio avoids by being a fraction of two same-space
measurements — but the thumb size is not one of those measurements, so it has to be handled rather than divided
out.

**Releasing is what activates a drag, and releasing short of the end cancels the gesture.** Firing the moment
the thumb touches the end takes away the ability to change your mind mid-slide, which is worth more here than
the earlier feedback. **A hold is the other way round**: it fires the moment it fills, because there is nothing
to change your mind about once the bar is full and waiting for a release would leave a completed hold looking
broken.

**`getHoldDurationMs` defaults to 1000 and is a prop because it is a tuned value.** Long enough to be
deliberate, short enough not to feel stuck; nobody has measured it, and a consumer with a heavier consequence
should be able to set it without forking the control.

**The control returns to rest on release, always, including after a successful slide.** A slide is a way of
pressing a button, and a button is not still pressed while the consumer's handler runs; anything outliving the
gesture — in flight, succeeded, failed — is the consumer's state, exactly as for `Button`. A consumer wanting
the thumb to stay at the end already has the route without a new prop: pass `getIsPressed`, and the painter
reads `isPressed` and draws the thumb at 1. The Playground's second variant is that composition, so the
omission is not re-derived as a gap.

**A drag does not focus the control, a departure from a native button and the lesser evil.** `trackDrag` calls
`preventDefault` on `pointerdown` — it must, or the press starts a text selection — and that suppresses the
compatibility `mousedown` whose default action is the focus. Calling `focus()` back was tried and reverted the
same day: a scripted focus is not a pointer focus as far as the engine is concerned, so `:focus-visible`
matched and every mouse drag drew the ring. `ColorArea` does call `focus()` and should keep doing so — its axis
sliders are useless unless the arrow keys reach them — while here there is nothing focus enables that the drag
has not already done.

**`isDragging` and `isHolding` are two flags rather than one, and a painter almost always wants both.** They
are separate facts — one is a pointer carrying the thumb, the other a press filling it — and a painter that
wants to say "keep holding" needs to tell them apart. The Playground's painter takes the union and calls it
tracking, which is the common case: while either is true the value is being driven live and a CSS transition
would lag a frame behind.

**`isDragging` means the thumb is being dragged, not that a pointer is down.** `trackDrag`'s own signal turns
on for a press anywhere on the track, including one the hit test refused, so the flag a painter reads is that
signal and a live grab together. A painter keyed on the raw one would drop its transition on a press that moves
nothing.

### The Playground: an example's source is a folder view, and a sample is a file

Settled with the user. `PageComponents/Examples` exists to put a source-code button next to a
demo, and what that button showed was always incomplete: an example imports its samples, its styled components
and its page's own types, and only the example's own text was displayed — the half that was already obvious.

**What is shown is a set of tabs, and a tab is a folder rather than a file.** One tab for the example itself,
then one per thing it imports; inside a tab, an `Accordion` with the imported file open and its `.css.ts` and
`.types.ts` siblings collapsed beside it. The sections are whichever of those files exist — four of the 37
`StyledComponents` folders are missing one of the two, and "the files that are there" costs nothing and never
needs a special case.

**A tab is not every file in the folder**, the version that looks simpler and is wrong: a page folder would
drag in a 600-line props panel and `Samples/SVGDefs` would drag in sixty samples. It is the file that was
imported, plus its style and types siblings.

**Only `src/Playground` imports become tabs; everything from `src/Lib` stays opaque.** The line is what the
consumer has to write: the Playground half is theirs to reproduce, the library half is already written for
them. `@thewaver/ss-utils` and `solid-js` are on the library side for the same reason.

**Depth stops where the code stops being consumer-shaped.** Tabs follow imports transitively through `Samples`
and `StyledComponents`, and one level everywhere else. Not arbitrary: _"The three trees"_ defines
`PageComponents` as what the Playground would still need if the library did not exist, which is exactly the code
nobody copies. Following everything would put `Theme.css` on every example in the app.

**A page's own types and stylesheet are behind a flag, defaulting on.** An example importing `ShapePage.types`
is importing the shared prop type that lets one props panel drive seven examples — real, and not something a
consumer would write. Whether it belongs in the tab list was a hard call, so the mechanism resolves it like any
other folder and one constant decides whether it survives, in the shape `SHOW_COMPOSITES` uses in `App.tsx`.
**The default is not the user's call, it is this file's** — on, so the path stays exercised and the question
gets answered by looking at a real page.

### Playground samples: one file per key, and the key is the file's name

The same decision from the other end, and why `Samples/` had to be reorganised first.

**A sample is a file, and the registry is an index that imports them.** `SVGDefs.const.tsx` was 2534 lines
holding three registries; a tab showing it would have been useless whatever it cost to load. Splitting was
never about weight — the source is fetched on demand — but about a tab a person can read.

**The key is the file's name, which is what lets a runtime selection find its source.** The example imports the
whole registry and indexes it with a key from the props panel, so nothing in its own imports says which sample
is showing. Rather than tracing that, the modal resolves the key to `<Registry>/<key>.ts` by name. Two
mechanisms that never have to know about each other: the example's imports give the general tabs, the current
key gives the sample tab. It also makes renaming a sample and renaming its file the same act.

**Keys collide across registries, so the samples sit one folder down per registry.** `plain` exists in both
`Pattern` and `Gradient`; `Samples/SVGDefs/Samples/Gradient/plain.ts` keeps the name-is-the-key rule intact.

**Nothing is folded into a factory.** `circle("grid")` produced three of the pattern samples from one helper,
and a file whose whole content is that call teaches nobody anything — the reader still has to open a second
tab. Each sample is written out. The line, taken from what `Gradient` already did: the sample's own **shape** is
explicit, while small shared helpers that are not the point of any sample — a base colour, a diagonal offset —
stay shared and get a tab of their own when opened. The total line count goes up, deliberately.

**A registry is only split when a tab of it would be unreadable, which is not every registry.**
`CellAnimationZones` and `CellAnimationOrigins` are 71 and 31 lines of one-line entries, and splitting those
produces files shorter than their own import headers — the same emptiness that unfolding the pattern factories
avoided, from the other direction. They get a folder and keep their registry whole. The rule is the goal
restated: split until a tab reads, and stop. Split so far: `SVGDefs` (2534 lines), `CellAnimation` (600),
`CellAnimationWeights` (515). Left whole: `CellAnimationZones`, `CellAnimationOrigins`,
`CellAnimationBreakpoints`, `ScanlineAnimationKeyframes`, the largest at 123 lines.

**A Playground namespace may not share a name with a library one, and the source view is what makes that a
rule.** The keyframe helpers were `CellAnimationUtils`, which `Lib/Exotics` already exports for something else
entirely. Two namespaces of one name is legal and nothing imported both, so the collision cost nothing while the
code was only ever read in an editor that could tell you which was which. A tab is read **out of context**,
which is exactly the confusion a tab cannot resolve. The Playground one is now `CellAnimationKeyframeUtils`.

Two smaller rules fell out, both house style everywhere else and broken only in the files this split created.
**A `.utils.ts` exports a namespace**, like `InteractionUtils`, `TreeUtils` and `SelectUtils`; `SVGDefsUtils`
and `CellAnimationWeightUtils` were bare exports and are not any more. And **a samples folder is named after
the namespace it exports** — the keyframes folder was `CellAnimation/` while exporting
`CellAnimationKeyframes`.

**What is not shipping, and why it looks as though it should.** `fromStops` and the 3×3 matrix maths beside it
turn a list of keyframe stops into the evaluation function `CellAnimation` asks for, so a consumer wanting
keyframes rather than a formula writes their own. That is real, and it is still not the library's: the
component's contract is already the smaller and more general thing — a function from timeline to result — and a
stop list with `at`, `depth` and origin keys is one **opinion about how to author** such a function. Shipping it
would freeze that opinion as API for a consumer nobody has met, which is the layer item 12 in `backlog.md`
plans. The matrix half is a different case: it needs only the language to work, which is the `ss-utils` test,
and that package has `Vec2d` and `Vec4d` but no matrix — noted as a candidate rather than moved, because one
consumer is a thin case for an export in another repo.

**Types move to `<Name>.types.ts`, and they stop being a namespace.** A sample file needs the config type and
the registry needs the sample files, which is a cycle, so the types have to come out. They cannot come out into
a namespace of the same name, because a `namespace` does not merge across ES modules and any file wanting both
would import one identifier twice. Plain exported type names are what the rest of the repo uses (see _"House
style"_), and the namespace stays on the value side only.

### Controls: `Paginator`, where the arithmetic is the component

Built, at the user's request, from the `backlog.md` entry that had argued it out of the
"compositions" list: the visible page range, where the gaps fall and how many pages sit either side of the
current one is arithmetic, and arithmetic is the library's half of the contract.

**`PaginatorUtils.getEntries` is a pure function with its own unit tests, and the component is a thin wrapper
over it.** Same split as `TreeUtils.getVisibleRows` and `SelectUtils.getFlatOptions`. Sixteen cases cover both
ends, both knobs, a page beyond the end, and no pages at all.

**A gap carries the pages it stands for, rather than being a bare ellipsis.** `{ kind: "gap", from, to }`
against Ark UI's `{ type: "ellipsis" }`. The library has computed those numbers on its way to deciding a gap
belongs there, so throwing them away makes the consumer's painter unable to say anything true — a tooltip
reading "pages 5 to 19" is free here and impossible there.

**A gap that would hide one page is spelled as that page.** Replacing `4` with `…` saves no room and costs a
destination. Arithmetic rather than paint, so it belongs in the function.

**The window is exactly `2 × siblings + 1` wide, and the boundaries do not reserve a slot for an ellipsis that
would hide nothing.** MUI keeps a slot free next to each boundary, which is why its list at page 1 is a page
longer than the same call here. The wasted slot is only ever visible as an ellipsis standing between page 1 and
page 2.

**The gap is `aria-hidden`.** It is not a control, and the pages behind it cannot be reached by naming them, so
announcing "pages 5 to 19" tells a screen reader user about something they cannot act on. Ark UI hides its
ellipsis for the same reason.

**`computeHref` is a function, where `Tab<T>` has an `href` field, and the difference is who authors the
list.** A consumer writes their own tabs, so a field is reachable; here the library generates the entries, so a
field would have nowhere to come from. The consumer knows the address shape and the library knows the page
numbers.

**The page is one-way — `getPage` plus `onPageChange` — following `Tabs` rather than `Select`.** _"Signal
tuples for two-way state"_ takes the pair only where the component genuinely writes, and its recorded exception
is a value derived from a route with no setter to hand over. A page number is that value more often than not,
and pages that are links make it certain. A consumer who does hold a signal spends two props on it, the cheaper
direction to adapt.

**Every item is its own tab stop, with no roving.** `Accordion`'s position rather than `Tabs`': a tab list is
one control with several states, a paginator is a row of independent destinations. `aria-current="page"` marks
the one you are on.

**A step with nowhere to go is `aria-disabled` and carries no `href`.** The target is computed first and the
control is disabled when it equals the current page, so "previous on page one" needs no special case. Dropping
the address as well matters only for the link form, where an anchor would otherwise still be followable by
every route that is not a click.

**The painted number is `aria-hidden` and the name comes from `computePageLabel`.** Exactly `Calendar`'s day
cells: a painter drawing a bare digit gives a reader "7" with no idea what of. The default names are English,
and the compute hook is the escape from that rather than a locale the library pretends to know.

### Controls: `Scroller`, and why it renders no button of its own

Settled with the user. A strip too wide for its box, paged by a previous and a next button
rather than a scrollbar. The user asked for it as a `Carousel`; the name was corrected before anything was
built, because **a carousel is a different pattern with an accessibility contract this does not implement** —
one slide at a time, wrapping, `aria-roledescription` of `carousel` and `slide`, and a pause control the moment
it rotates by itself. Naming a component after what it resembles is the trap already recorded for the segmented
control. The real carousel is `backlog.md` item 8.

**The track holds arbitrary children, and that is the user's call.** It renders nothing and types nothing: the
consumer's markup goes in as `children` and comes out untouched. A list of records — `Tabs`' shape — was
rejected because the first consumer is a `Tabs`, which would then have been rendered twice over, and because
everything the component needs it can measure. Focus centring works by watching for focus reaching **any**
descendant. Paging lands on item boundaries by reading the track's own child elements, and where there is only
one child — the `Tabs` case — the rule degrades to a full page with no special case, because there is no
boundary inside the page to prefer.

**It never claims the arrow keys.** A `Tabs` inside it already walks its tabs with them, and two owners of one
key is a bug found later rather than sooner. The component listens; it never moves focus itself.

**A focused child is revealed, not centred, and the pointer counts the same as the keyboard.** Settled with the
user after the first attempt centred on keyboard focus alone: an item already fully in view does not move the
strip, and one cut off by an edge scrolls by the least that shows it whole. Centring is worse in both
directions — it drags a half-clicked item out from under the cursor, and it moves the strip when nothing needed
moving. Distinguishing pointer from keyboard was my patch for the first of those and it bought a second
behaviour to remember; revealing removes the cause instead, so one rule covers both. What it gives up is the
look-ahead a centred item has: a child revealed at an edge sits flush against it, with nothing of the next one
showing.

**It renders no `<button>`, which is the `NumberInput` shape rather than the `Tabs` one.** `renderButton` is
called once per button with which step it is and with a `ScrollerStepper` — `getIsAtStart`, `getIsAtEnd`,
`stepToPrevious`, `stepToNext` — exactly as `NumberInput` hands its steppers to `renderTrailing`. So the
consumer composes with `Button` and inherits naming, the focus ring, tooltips and the disabled treatment, and
the library owns only what nobody else can know: how far a step goes and whether there is anywhere left to go.
`getButtonPlacement` is `split`, `start` or `end`, since "together" cannot be placed without saying which side.

**`getPadding` exists because a scroll container clips a focus ring, and only the consumer knows how big the
ring is.** A ring is drawn outside the border box and a scrolling box clips at its own edges, so a focused
child at either end loses part of its ring — and so does every child at the top and bottom, because a
horizontal scroller clips the cross axis too. The library paints no ring and cannot guess its width; the
Playground's is one exported constant, `FOCUS_RING_WIDTH`, used both by the `:focus-visible` rule and by every
`Scroller` that has to leave room for it.

Three things follow from that number, and all three are needed — leaving any one out clips a ring somewhere.
The track takes it as `padding-block` and `padding-inline-start`. **The end side cannot be padding**, because a
scroll container's end-side padding is still not interoperable — Firefox does not count `padding-right` as
scrollable space — so the component renders one element of its own after the consumer's children, sized to the
same number. And **the reveal leaves that room free**: a child is scrolled to sit the padding's width clear of
the edge rather than flush against it.

**`overflow-y: clip` with `overflow-clip-margin` is the purpose-built answer and cannot be used here.** Read on
MDN: when either axis is neither `visible` nor `clip`, a `clip` on the other axis computes to
`hidden`. The horizontal axis has to scroll, so the vertical `clip` would become `hidden` and
`overflow-clip-margin` would be ignored. Recorded so it is not re-proposed.

**The buttons leave when there is nothing to scroll; the track never does.** Asked for by the user on
as "just return the contents when there is nothing to scroll", and the smaller version shipped,
because the track is the only thing the component can measure. Whether there is anything to scroll is
`scrollWidth > clientWidth` **on the track**; unmount it and the children lay out in a box the component does
not own, so it can neither tell that they have started to overflow nor put itself back. A track with nothing
overflowing is also indistinguishable from a plain flex row — the scrollbar is hidden, nothing is clipped,
nothing is interactive — so the only visible things were two dead buttons and the gap they sat in.

**Removing them widens the track, and that is deliberate hysteresis rather than a loop.** With the buttons
present the content has the track's width to fit in; without them it has that plus their width and the gaps. So
content between those two widths settles wherever it currently is and stays there, instead of flickering
between the two states on every resize frame. The first measurement happens with no buttons rendered, so a
strip only gains them by genuinely exceeding its full width.

**The track hides its scrollbar and keeps its scrolling.** Wheel and touch still work — taking them away would
make the buttons the only route, worse than the scrollbar it replaced. `scroll-behavior` is smooth in CSS
rather than per call, so `prefers-reduced-motion` turns it off without the component asking.

**Horizontal only.** The axis is one variable rather than a redesign, but nothing has asked for a column and
`SlideButton`'s precedent is to build the axis that exists.

### Controls: `Carousel`, and the first component that acts without being asked

Built, alongside `Paginator`, from the description `backlog.md` had carried since the `Scroller`
naming argument. It shows one slide at a time, wraps at both ends, and can rotate on its own.

**One slide at a time, and a page of several slides is not built.** The description allowed either. One slide
is the reading with a published pattern behind it, and a page of several is `Scroller`'s territory the moment
the arithmetic starts asking how many fit — the boundary the two components were separated along. Recorded in
`backlog.md` as a gap rather than left implicit.

**Wrapping is the difference that makes it a different component.** `Scroller` stops at each end and disables
the step with nowhere to go; `Carousel` comes round, so neither step is ever the dead one. That single line is
why a shared implementation with a `wraps` flag was not attempted: the two disagree about what the ends mean,
and everything they appear to share — a track, a step pair — they hold for different reasons.

**The rotation is why this is a component rather than paint, and the holds are conformance.** WCAG 2.2.2
applies to anything moving by itself for more than five seconds beside other content: it must be stoppable, and
the published pattern adds that it must not move under the pointer or while it holds focus. So the holds are
not a courtesy that could be dropped for a tighter API. `getIsHeld` is `hovered || focus within || page
hidden`, which is `Toasts`' expression character for character. The explicit stop is separate from the holds
and outranks them: a stopped carousel stays stopped when the pointer leaves.

**The consumer arranges the controls; the library still owns every button.** `renderControls` receives a
`CarouselControls` object whose `renderStep`, `renderPick` and `renderRotationControl` **return elements**
rather than taking callbacks, so a consumer writes the bar — order, wrapper, position — while each control is
still a real `<button>` with a real name, built by the library. Deliberately not `Scroller`'s arrangement,
where the consumer renders the button and `backlog.md` records the consequence: a library that renders no
button cannot promise one is reachable or named. Here the split is along the line that matters — the library
owns what the control _is_, the consumer owns where it _sits_ and what it looks like. A consumer passing no
`renderControls` gets a carousel with no controls at all, right for one driven from elsewhere through its
`indexSignal`.

**Slides are plain values, not records.** Every other collection here takes records — `Tab<T>`, `TreeNode<T>`,
`Toast<T>` — because each has per-item capabilities the library acts on. A slide has none: its position is
arithmetic, not a field. The records convention was written against **parallel arrays** indexed at each other,
which a single list of values is not.

**The index is a two-way signal, and this is the clearest case in the library for it.** A rotating carousel
writes its own index on a timer with nobody having asked, which no consumer callback can be expected to mirror
back. `SignalMirror.createOptional` keeps it private until a consumer wants it.

**The announcement goes through `LiveAnnouncer` rather than a live region on the track.** The published pattern
makes the slide container a live region, which works when the slides that are away are removed from the page.
Here they stay — the track translates — and a live region over content that never changes announces nothing.
The shared announcer is already the answer for `Calendar`'s month change. It announces only when the carousel
is **not** rotating, because narrating a slide every few seconds is the noise WCAG 2.2.2 exists to prevent.

**The slides that are away are `inert` as well as `aria-hidden`**, for `Collapsible`'s reason: a control
scrolled off the side is still in the tab order without it, so a keyboard user would tab into a slide nobody
can see and drag the track after them.

### The source view, as built, and the four calls the mechanism forced

Built against the two entries above. Where a rule had to be derived rather than read off, it is
marked as such.

**An example declares its own file, as a path from the repository root.** `ExampleDefs.src` — a string of
already-highlighted HTML built at module scope — is now `path`, and the highlighting happens when the modal
opens; the `?raw` imports and `highlighter.codeToHtml` calls are gone from all six pages that had them. The
path is a plain literal rather than anything derived: `import.meta.glob` keys are root-relative, so
`/src/Playground/App/Pages/ShapePage/Examples/Default.tsx` is the same string the resolver looks up, and a typo
produces an empty tab rather than a wrong one.

**The current sample is declared too, as a key qualified by its sub-registry.** `sampleKeys` returns
`["Gradient/sweep_diag_1v1", "Pattern/plain", "Iteration/constant"]`, and the resolver looks each up under
whichever `Samples/<Registry>/Samples/` folder the example's imports reached. The qualifier is not decoration:
_"Keys collide across registries"_ records that `plain` exists in both `Pattern` and `Gradient`.

**Derived: a registry's own sample files are reached by key and never by import-following.** The two settled
rules pull opposite ways — tabs follow imports transitively through `Samples`, and a tab is not every file in a
folder — and `SVGDefs.const.ts` imports all fifty of its samples, so following it produces the sixty-tab
outcome the second rule prevents. The resolver skips any specifier landing inside a `<Registry>/Samples/`
folder. Nothing is lost: those files are exactly what the key mechanism resolves.

**Derived: a tab is a name, not a file, so `.const`, `.utils`, `.types` and `.css` collapse into one.** The
settled rule says the imported file plus its `.css.ts` and `.types.ts` siblings. Applied literally to
`SVGDefs.const.ts` it produces a tab called `SVGDefs.const` whose types sibling would have to be
`SVGDefs.const.types.ts`, plus a second tab called `SVGDefs` for the types file the const imports — two tabs
for one folder. The stem is therefore the file name with `.const`, `.utils`, `.types` or `.css` removed, so one
`SVGDefs` tab carries the const, the types and the utils. **What is displayed is still only what the settled
rule allows**: a file appears either because it was imported or because it is the stem's `.types.ts` or
`.css.ts`. A `.utils.ts` nobody imported does not appear.

**A sibling is displayed but never traversed.** A stylesheet reached only through another stylesheet is not
followed, which is the mechanism `Theme.css` was already meant to be kept out by.

**`Theme.css` is excluded by name as well, and it is the only file that is.** Settled with the user on
, after the mechanism gave `Card` a `Theme` tab honestly — the example does import the theme by
name. The user's reason generalises: **the theme holds no logic that helps build the component**, it is a
palette, and a tab of colour tokens teaches a reader nothing. The exclusion is a single path constant rather
than a pattern, so it stays a named exception rather than the start of a filter list.

**Forced: `?raw` cannot read a `.css.ts`, so the Playground's Vite config carries a nine-line plugin.** The
vanilla-extract plugin claims every `*.css.ts` by file name and discards the query, so a stylesheet requested
as text comes back compiled and with no default export — `codeToHtml` then receives `undefined` and the modal
renders nothing. `?source` resolves to an id no other plugin recognises (a null-byte prefix and a `.source`
extension) and is read off disk by the plugin itself. The only part of the feature living outside `src`.

**An example is given the key rather than the resolved sample, and three pages changed to do it.** `Shape`
passed `getStrokeConfig`, `getFillConfig` and `getIterationConfig` already looked up; `CellAnimation` passed a
`computeCellWeights` closure and a resolved origin; `ScanlineAnimation` passed a `computeCellWeights` closure.
All three now pass keys and the example does the lookup in its own body, which is the line the reader came to
see. `CellAnimation`'s stress test gains a correctness fix on the way: the origin is computed from the cell
count actually in force rather than from the page's.

**The code box's height cap is a per-call-site parameter.** A standalone box keeps its 800; the source view
passes 500, because a tab shows a list of section headers above the open one and the modal has to hold both.
Neither number moved.

**The scroll container is the modal, edge to edge, and the padding lives inside it.** Asked for by the user on
, so the scrollbar sits against the modal's edge rather than floating twenty pixels inside it.
`PageModalPanel` takes a `getPadding` that overrides its own, defaulting to what it always had — the
parameter-with-per-call-site-defaults rule, since the stress test and the modal page still want the padding.
The source modal passes zero and is the panel's only child. The "tap outside to close" hint went with it: the
panel is now one thing rather than two, and Escape and an overlay click were never spelled out on any other
modal.

**The padding then belongs to the scroller's children rather than to the scroller, because of the sticky
strip.** A tab strip inset by the container's padding leaves a band either side of it, and code scrolling
upward passes through those bands in plain view. A strip that spans the whole scrollport and pads itself covers
everything going under it. Its `z-index` also has to beat the code box's inset border, which otherwise wins by
sitting later in the document at the same level.

**A page's description lives on its tab config.** The title under which a page renders comes from `TAB_CONFIGS`
in `App.tsx`, so the sentence under it does too — one place, one entry per page, and a page without a component
keeps neither.

### Turning a page's variants into examples, settled on the four `Exotics` pages

`Formation`, `Satellite`, `Staircase` and `Wheel` were the first pages whose demos moved from `PageVariants` to
`PageExamples`, which is the first slice of the project `backlog.md` item 21 describes. The question that item
left open — where a variant's file lives and what it is given — is answered here, and the answer is the shape
`ShapePage`, `TypewriterPage` and `ScanlineAnimationPage` already had rather than a new one.

**The split is the library call on one side and the Playground's furniture on the other.** The example file
holds the library component and the styled components it paints with, and nothing else. `PageMeasureBox`, any
local props panel and the width the demo is stated at stay on the page, in an `<Name>ExampleWrapper` beside
`getExamples`. That line is the same one the tab rule draws: what a consumer would write becomes a tab, what
the Playground needs for its own sake does not.

**What closed over the page's signals becomes one props type per page**, `<Name>ExampleProps` in
`<Name>Page.types.ts`, built with `AccessorProps` and handed to every example on the page as `commonProps`.
One type per page rather than one per example is what lets a single props panel drive all of them, which is
the rule the panel already worked to.

**Two demos differing by one prop are one example and a panel knob, never two files.** Corrected by the user,
three times in a row on the same mistake: `Formation`'s pair differed only in `getIsStackedInReverse`,
`Satellite`'s first two only in `getIsBehindSubject`, and `Staircase`'s only in `getDir`, and each was first
built as two example files with the value written into each. Every one of them is now a single example with
that prop wired to a control in the global panel — a `PageCheckField` for a boolean, a `PageSelectField` for
an enum. This is the same rule as _"a props-panel control drives every instance"_ read from the other end: a
value the panel could own is not a reason for a second demo, and two demos over one differing literal are two
copies of one example rather than two examples. **A second example has to be a different call**, as
`Wheel`'s three are — `FlatWheel` against `DrumWheel`, and a drum handed the prize list twice over to prove it
can carry the same prizes round more than once.

**Dropping a demo drops its spec, and that is the trade to state rather than work around.** `Satellite`'s
third demo — the component with no satellite at all — was excluded on the user's instruction, so
`with nothing to attach there is no wrapper either` went with it. The behaviour is still covered by unit
tests; what is gone is the browser's confirmation of it.

**Where a sample registry is not split, the key is still the example's to resolve.** `FormationLayouts` and
`StaircaseIndents` are 80 and 46 lines and stay whole, so no `sampleKeys` entry can resolve to a file — but the
example is still handed `getLayoutKey` / `getIndentKey` and does the lookup in its own body, because that is
the line the reader came for. The registry it imports becomes a tab either way.

**`Wheel` passes `computeSpinDefs` resolved rather than as a key**, which is the one place this departs from
_"An example is given the key rather than the resolved sample"_. Its two spin styles are page constants and not
a `Samples/` registry, so there is nothing for a key to resolve to; making them one is a separate change and
has not been argued.

**An example carries no readout, for now.** Stated by the user when these four converted. `ExampleDefs.readout`
stays on the type and `PageExamples` still renders one when given it — nothing was removed — but no example on
these pages sets it. Two specs read a readout and had to find the same fact elsewhere: `wheel.spec.ts` now
reads the wedge's name out of the `LiveAnnouncer` region, which is the library's own report rather than the
page's, and `satellite.spec.ts` used the readout only as a way to walk back to the demo and now locates the
wrapper directly.

**The attribute the interaction suite reads changes with the component.** `PageVariants` stamps `data-variant`
and `PageExamples` stamps `data-example`, so a converted page's spec swaps `variant()` for `example()` in
`e2e/helpers.ts`. One assertion had to move with it rather than being renamed: `wheel.spec.ts` counted the
buttons inside the whole card to prove the wheel renders exactly one, and an example card carries the source
button too, so the count is now scoped to the element carrying `aria-roledescription="wheel"`. That is the
honest reading of what the test was always claiming.

### Every Playground page is examples now, and two things had to change to finish it

The rollout `backlog.md` item 21 described is done: all thirty-three pages that still used `PageVariants`
carry the source-code button, and `PageVariants` itself has no consumers left. What the four `Exotics` pages
settled held for the rest; two things they never exercised did not.

**An example card now marks its demo, because the source button is a button in the card.** `PageExamples`
wraps the demo in a `data-demo` element and `e2e/helpers.ts` gains `demo(key)` beside `example(key)`. Without
a marker a spec asking for "the first button in this card" found the `</>` button and opened the source viewer
instead of the control it meant — which is how a colour-dropdown test came to assert against a code listing.

**That marker is `display: contents`, and the first attempt at it broke six pages.** It was given
`PageVariants`' demo box — a centred flex row — which changed how every card lays its own contents out: the
pages that were already on `PageExamples` had always put a demo's children straight into the card's column, so
`CellAnimation` and `ScanlineAnimation` suddenly showed their local props panels **beside** their demos rather
than below. A marker exists to be found by a selector, not to lay anything out, so it generates no box at all.
Nothing inside a card can then move because of it, which is a guarantee rather than something to re-check per
page. The cost is that the element has no box to measure: `stepper.spec.ts` asked its parent how wide it was
and got zero, and now asks the card's content box instead.

**`readout` sits outside that box, and a spec that builds its selector from `demo(key)` finds nothing.** The
card holds the title, the demo and the readout as siblings, so a readout lookup is scoped to `example(key)`
and a control lookup to `demo(key)`. Both spellings are correct and they are not interchangeable.

**A spec belongs to the route it visits, not to the file it is named after.** `tooltip.spec.ts` exercises
tooltips on the **button** page and `modal.spec.ts` covers both the modal and the drawer — so converting a
page turns specs red that carry another component's name, and converting one half of a two-page spec means
renaming only that half. The check before touching a page is `grep` for the route, never the filename.

**Demos kept their readouts, against what the four `Exotics` pages chose.** Those four set none, and
`ExampleDefs.readout` stays optional — but dropping the readouts here would have taken the fact each spec
reads with them, so every converted page still sets one. Whether they go is a separate pass.

**Every demo was carried across one-to-one, and the deduplication is deliberately not done.** Where two demos
differ by a single prop they now share one example file with two entries — `Accordion`'s two expand modes,
`Select`'s eleven country lists — which is the rule those four pages settled. What has **not** happened is
collapsing two demos into one plus a panel knob, because that removes demos and the specs covering them; the
user holds that as a separate pass.

**One demo needed pinning down rather than converting.** `SplitPane`'s bounded demo stretched until a pane's
160px floor stopped being reachable — with a wide enough frame the neighbour never reaches it, so the spec
proving the floor is honoured had nothing to bump into. `PageSplitPaneFrame` now caps at 380px, which is the
width it used to get. The alternative was to weaken the assertion.

### `PageExamples` lays out on a grid, with the column width per page and a span per example

Asked for by the user after the rollout: the cards went back to `PageVariants`' grid rather than the
wrapping flex row, since a row leaves cards of different heights sitting unevenly and gives a page no way to
say how wide its demos want to be.

**The root has to state `width: 100%`, which the flex row it replaced did not need.** Several page roots are
flex columns with `align-items: start`, which sizes a child to its content — so an auto-filling grid resolved
to a single column and stacked cards that had room to sit side by side. `CellAnimation` showed two rows in a
1280px area with two 630px columns available. A wrapping flex row hid this by sizing itself to max-content.

**The column floor is the page's, because it follows from the demo rather than from the layout.**
`getMinColumnWidth` defaults to the 320 `PageVariants` used, and a page that states a width for its demo
states a floor of that width plus the card's own padding — `Formation` 420 for its 380px measure box,
`ImageSwitcher` 520 for its 480px image, `SplitPane` 420 for its 380px frame. Where a page's demos have no
declared width the default stands. It is a prop rather than something derived because the demo's own width is
often inside a styled component the page never names.

**An example may take more than one column, and the grid's floor is divided by the widest span on the page.**
`ExampleDefs.span` is a column count; `Tabs`' two demos that carry a panel and `Select`'s virtualized demo
with its own props panel take two. The floor becomes `min(100% / widest span, floor)` — so a page with a
two-column example never resolves to a single column, and the spanning card therefore never needs a track the
grid has not got.

**Two pages had been getting their sizes from the old row, and both showed it.** A wrapping row sizes a card
to its content, which had been hiding two things. `Shape`'s demo is a fixed, resizable 320px box with a `Shape`
around it tracing its outline — and `Shape`'s own root has no width, so under a card that stretches its
children it grew to the column while the box it traces stayed 320: the outline and the content came apart. The
box is what the demo is about, so the page now wraps it in a `width: fit-content` host and the `Shape` hugs it
again. `ViewportPage` builds its own cards rather than using `PageExamples`, and had capped them at the host's
width; it now uses the same grid, with a floor of the host plus the card's padding, and its fixed-size hosts
centre inside a column that can be wider.

**Which is the general lesson: a card stretches its children, so a demo that must match a fixed-size child has
to say so.** The old row let a demo of unstated width agree with a fixed-size sibling by accident, because
both ended up as wide as the card. Nothing about the grid makes that true.

**That division is what keeps a span from overflowing, and it was measured rather than assumed.** With the
plain `min(100%, floor)` a two-column card in a one-column grid lands one gap wider than the row: the grid
allocates a zero-width implicit track and the gap before it is still spent. Halving the floor removes the case
entirely — checked at container widths from 280px up, the row now overflows by nothing at any of them, and the
column count at ordinary widths is unchanged.

### Controls: `Spotlight`, and three presets because a mode cannot move at runtime

Settled with the user, renaming `ElementHighlight` on the way. A spotlight cuts a hole in an
overlay around one element; what differs between uses is **what the page is still allowed to do**, and that
turned out to be three answers rather than a boolean.

**`SpotlightHint` points, `SpotlightPrompt` insists, `SpotlightGuide` explains.** A hint yields to anything — a
click anywhere dismisses it and so does any key that is not a bare modifier. A prompt makes the highlighted
element the only reachable thing and waits. A guide seals the page entirely, shows the element rather than
offering it, and puts the live controls in a popup beside it.

**They are three presets over an unexported base, and the reason is the user's rather than mine.** My argument
was that `renderPopup` is required on one and meaningless on the other two, which a mode prop cannot say in
types. Theirs subsumes it: **one variant can never become another while it is open**, so the choice is not a
runtime value and has no business being a runtime prop. `Checkbox` / `Toggle` / `Radio` over `BinarySwitch`
again, and `Drawer` over `Modal`.

**Escape stays live in every mode, and that is a conformance requirement rather than a kindness.** WCAG 2.1.2
No Keyboard Trap is Level A: _"If keyboard focus can be moved to a component of the page using a keyboard
interface, then focus can be moved away from that component using only a keyboard interface"_ — trapping is
allowed only _"as long as the user knows how to 'untrap' the focus"_, and Escape is a standard exit. So the
honest description of `SpotlightPrompt` is **"click it, or press Escape"**, and nobody may harden that away.

**`prompt` and `guide` seal the page by opposite mechanisms, because `inert` is inherited.** There is no "seal
everything except this one control": `inert` cannot be lifted off a descendant. So `guide`, whose hole is dead,
sets `inert` and gets hit testing, tab order and the accessibility tree in one attribute; `prompt`, whose hole
must stay live, keeps the overlay segments for the pointer and pulls focus back on `focusin` for the keyboard.
The cost is in `backlog.md`: `prompt` cannot hide the page from a screen reader.

**The seal climbs to the body rather than sitting on a root, because there is no root.** The content a
`Viewport` wraps is not a single node — the portal and the children are siblings inside it — and `Portal` nests
its own container inside the mount, so the page is two levels above anything this component holds. The walk
goes from the portal container up to `document.body`, inerting each ancestor's other children, which is the
same shape with a `Viewport` and without one. Elements already `inert` are skipped, or the cleanup would hand
back something that was never ours.

**Autofocus waits for the placement and then latches, and both halves were bugs first.** The popup is
`visibility: hidden` until `Anchor` has measured it, and a hidden element takes no focus — so autofocusing on
mount silently did nothing and left a sealed page with focus on the body. Then, because the position changes on
every step, an autofocus that kept following it threw focus back to the first control each time: press `Next`,
and the next press lands on `Skip all`. Both are pinned in `spotlight.spec.ts`.

### `Anchor` positions against a rect when it is given one

Settled, and it is the virtual anchor `backlog.md` has wanted since `Menu`.
`createPortalPosition` takes an optional `getAnchorRect`; when present it replaces the observed rect and the
element observer is not attached at all. Everything downstream is unchanged, because the placement maths only
ever saw a rect.

Two consumers arrived together, which is what made it worth doing rather than inventing privately inside one of
them: a spotlight positions its popup against the **padded hole** it cut rather than against the element
inside it, and a right-click menu would anchor to the point that was pressed. The second is not built; the seam
it needs now exists.

### Four components arrived from a React codebase, and all four are `Exotics`

Placed there by the user, who wrote the originals: `Satellite`, `Staircase`, `Formation` and the two wheels.
Recorded because `Exotics` had no written definition and now has four more members, so the next arrival will
look for the rule.

**Derived rather than stated, and marked as such**: the four have in common that they render DOM, hold no
user-editable value, and are not compositions of `Fundamentals` — which is what would separate the folder from
its neighbours if a rule were written, rather than anything about how unusual a thing looks. All four lay
elements out or turn them; none is a control, and none is a `Surface`-style assembly of other components. The
user's call was where these four go; whether that is the general test is theirs to make.

**None of the original names survived unchanged, and two could not have.** `Tree` was already taken by the
`Fundamentals` control, and `DecorationWrapper` would have given the library a second meaning for
"decoration" — `InteractionWrapper.renderDecoration` is the full-box overlay behind a control, which is a
different mechanism. `Staircase` was kept, `Satellite` and `Formation` chosen with the user, and `TopWheel` /
`SideWheel` became `FlatWheel` / `DrumWheel` because "top" and "side" describe where the camera is rather than
what the object is.

**What came across as paint stayed out of the library.** The originals shipped a leaf painter with five SVG
shapes, a wedge painter, a pointer, a banner and a starfield. `Shape` and `ShapeConst.getDefaultShapePoints`
already draw the first, and the rest are the consumer's half — they live in `StyledComponents` and are what
the Playground pages are made of. Nothing was lost: every one of them is on a page and reachable from source.

### `Satellite`: two elements, and a box that covers both

**The problem it solves is layout, not positioning.** A badge on a corner is easy to place with
`position: absolute`; what is hard is that the pair then measures as the subject alone, so the badge either
gets clipped by an ancestor or overlaps whatever sits beside it. `Satellite` grows its own box until both
elements are inside it, which is the whole reason it exists and the thing `satellite.spec.ts` pins.

**The placement vocabulary is `Anchor`'s, and this is where the in-variants pay.** The original took
`left | center | right` and derived the offset from half-widths, which can only express "outside that edge".
`AnchorPlacement` already had five values per axis, so a satellite can sit flush **inside** a corner —
the ordinary case for a badge on a card — and `AnchorUtils.getHPlacementShift` computes the position for both
families. The union arithmetic left over is nine lines in `SatelliteUtils.computeLayout`, with unit tests
against hand-computed numbers per placement.

**The wrapper grows by padding, and the subject stays in flow.** The first build absolutely positioned both
elements and wrote a measured pixel width and height onto the root, which is what the React original did. It
means the root has no size of its own until two `ResizeObserver` callbacks have run, so the first painted frame
is a 0×0 box with the subject spilling out of it, and a subject that wanted to size itself from the parent
could not. Padding inverts it: the root's box is the subject's box plus the overhang on each side, an
absolutely positioned satellite is placed against the **padding box** so its offset needs no correction, and
before anything is measured the padding is zero and the layout is simply the subject. Nothing flashes.

**The offset is a nudge in screen space, and that differs from `Anchor` on purpose.** For a floating layer the
offset means a **gap**, so `AnchorUtils.getHPlacementOffset` signs it by the placement and discards it entirely
on a centred axis. A consumer placing a badge is aligning it rather than clearing a gutter, and "nudge it two
to the right" must not become "two to the left" because the placement flipped, nor be silently dropped because
the axis is centred. So `computeLayout` adds the offset raw. Stated because the two components share the
placement type and disagree here.

**With no satellite there is no wrapper.** `renderSatellite` is optional and the component renders its children
bare when it is absent, so a consumer whose badge is conditional does not pay a positioned box for the case
where there is nothing to position. Lifted from the original, which did the same thing for the same reason.

### `Staircase`: the direction is the component's, and the curve is the consumer's

**A step's indent comes from a function of its index**, and the four curves the original shipped —
linear, a broken bilinear, repeating, alternating — are `CellAnimation`'s weights again: one opinion about how
to author the function the component actually asks for. They are Playground samples under
`Samples/StaircaseIndents`, and only the linear default lives in the component, because a component with a
required function and no default cannot be written down in one line.

**The direction knob hands the steps back to front instead of being passed down.** Every one of the original
functions took a `direction` argument and half of them ignored it, named `_direction` to say so. Reversing the
index before the function sees it puts the flip in one place, and the function's defs shrink to the three
fields all of them use. The e2e spec asserts the two staircases on the page are each other's mirror, which is
the property that arrangement buys.

**Indents are physical padding on a wrapper, not a logical property.** `padding-left` and `padding-right`
rather than `padding-inline`, per the field convention: the value is symmetric so the two are equivalent
today, and physical throughout stays honest while nothing else here is RTL-aware.

### `Formation`: positions written as fractions of the width, and nothing measured

**The original measured its own width with a `ResizeObserver`, computed pixel insets from it and carried a
comment saying to remove all of that once container query units existed.** They exist. Every inset a layout
function returns is a fraction of the formation's inline size, the component writes them as `cqw`, and the
browser resolves them — so there is no observer, no state, no frame of wrong layout on mount, and no
arithmetic to redo when the container changes size. `formation.spec.ts` checks a written position against the
root's measured width, because the failure mode is silent: with no query container in scope `cqw` falls back to
the small viewport width and every item lands somewhere plausible and wrong.

**The root's own height comes from a spacer child, because an element cannot query itself.**
`container-type: inline-size` makes the root a container for its **descendants**, so a `min-height` in `cqw` on
the root would resolve against whatever container sits above it. A single in-flow spacer whose height is the
layout's `heightRatio` in `cqw` gives the root its height instead. There is no circularity: inline-size
containment leaves the block axis free, which is exactly the case that unit was designed for.

**The podium arrangement sat unevenly in its box, and the fault was vertical rather than horizontal.** The
sideways offsets are deliberate — first place at 0.4375 of the width with the other two at +0.25 and -0.125
from it, which leaves an equal margin at each side even though the three are not symmetric about first place.
What was wrong is that the first row started a quarter-and-a-bit down while the last row ended flush with the
bottom, so the arrangement had a gap above it and none below. It now starts at its own half-height, the way
the whorl arrangements already did, and `formation.spec.ts` measures the four margins rather than any one
coordinate — which is the assertion that would have caught it, and the one that does not have to be rewritten
when a sample's numbers change. Corrected by the user after a first attempt moved the horizontal offsets, which
were never the problem.

**Width-relative rather than height-relative, so a taller parent leaves space instead of stretching.**
`top` and `height` are in `cqw` too, not in percentages — a percentage `top` resolves against the height, and
an arrangement stretched vertically by a parent that happened to be tall is a distorted podium. Every number
in a `FormationLayout` is therefore in one unit, and `heightRatio` is the honest bottom edge of the lowest
item rather than the original's hand-tuned trims.

**This is the first use of container query units in `src/Lib`, and it carries no fallback.** Argued on the
terms _"Compatibility arguments cite `src/Lib` and nothing else"_ sets: caniuse puts the units at 94.05%
globally, from Chrome 105, Safari 16 and Firefox 110. `InteractionWrapper.css.ts` already depends on `:has()` with no
fallback — 94.07%, and Firefox 121, which is **ten months later than the unit being added here**. So the
published package already requires a strictly newer browser than this does, in the one component every control
passes through.

### `Rotation`: the behaviour both wheels share, with no DOM of its own

**A wheel that spins to an index is arithmetic plus a small state machine, and neither is markup.** The
original had a `useRotationEffect` hook shared by its two wheels and left everything else — where to stop, how
far to overshoot, whether to idle — in a consumer hook beside the styled components. `Abstracts/Rotation` takes
the whole of it: `RotationUtils` is the pure angle maths with unit tests, and `createRotation(ref, disabled,
defs)` holds the phase, the timers and the holds.

**The angle only ever increases.** `getSpinAngle` rounds the current angle up to a whole turn, adds the turns
asked for and then the target index's angle, so a spin is always forward however many times the wheel has been
spun. Testable in one line, and the property a consumer would otherwise discover by watching a wheel unwind
backwards.

**A spin overshoots and then settles, which is two transitions rather than one.** Landing dead centre on the
wedge looks mechanical, so `computeSpinDefs` may return a `jitterRatio`: the wheel spins to the target plus
that fraction of a wedge, then corrects to the centre over the settle duration. `getJitterAngle` clamps the
ratio to half a wedge, because past that the wheel would come to rest on a different wedge from the one the
index names — the clamp exists to protect that correspondence, not to be tasteful.

**Nothing random is in the library.** Turn counts and jitter are the consumer's, defaulting to three turns and
no jitter, which makes the component deterministic and its e2e spec possible. The lively version — random
turns, random jitter — is a Playground sample, the same line `CellAnimation` draws around its weights.

**The index is the settled selection, so it is published at the end rather than the start.** A consumer bound
to `indexSignal` is showing what was won; writing it when the spin begins would reveal the answer three seconds
early. The target is held privately until the settle, which is what the original's `prizeIndexRef` was doing.
`onSpinEnd` fires there too, and so does the announcement.

**Where the target comes from is the consumer's, and the wheel asks for it.** `computeSpinTarget` may return a
promise, because the real case fetches a prize from a server. While it is outstanding the wheel is not
spinnable and says so, or a second press would start a second fetch — the original guarded this with a
`canSpin` flag and the guard has to be reactive, since the spin control's disabled state is drawn from it.

**A spin is a command, not a state.** `spin()` arrives through the `onMount` handle, per _"Playback is a
signal; a rewind is a command"_. Whether the wheel is turning by itself **is** state, so it is
`autoSpinSignal`, and so is the settled index.

**The abstract publishes no handle of its own.** `RotationController` existed and was passed straight
through by `Wheel`; it is gone, and `WheelController` is the only one. An abstract with no DOM has no
consumer to hand anything to — the component that owns the element owns the handle, and one handle in wheel
vocabulary beats two in two vocabularies for the same thing.

**The idle turn runs indefinitely, and rests only after a spin. This replaced an arrangement built on holds,
and the replacement is the user's.** The first build stopped turning whenever the pointer was over the wheel,
whenever anything inside it had focus, and for good once a spin had settled. All of that is gone. The wheel now
turns by itself for as long as it is on the page, with two exceptions: `prefers-reduced-motion: reduce` stops it
outright, and a hidden tab stops it.

**After a user spin settles, the wheel rests for `restDurationMs` and then picks up again; `-1` rests for
good.** The rest is its own private state, deliberately not the same thing as the auto-spin switch, because the
two have different owners — the rest is the component saying "let them read the prize", the switch is the
consumer saying "not now". Folding them into one flag meant a consumer's pause being cancelled by a rest timer
they never started. `DEFAULT_REST_DURATION_MS` is 3000 and is mine, not measured; change it freely.

**A pause on hover is now the consumer's to build, and `autoSpinSignal` is the door.** This is the settled
`playbackSignal` rule applied again — whether the passive turn is running is state a consumer can read and
write, so it is a two-way signal rather than a `pause()` on the mount handle. A consumer wanting the old
behaviour writes `false` on pointer enter and `true` on leave, over their own box, which is also the only way
to cover a control that sits **on top of** the wheel rather than inside it. The library cannot do that for
them: the hold it used to keep listened for the pointer arriving on the wheel's own element, and a button
overlapping the wheel is a neighbour rather than something nested inside, so it took the pointer away from the
wheel instead of holding it.

**`getIsHeld` is gone from the handle, and `getIsPlaying` is now two getters.** `isHeld` existed for one
purpose — deciding whether to suspend the idle turn — and with the holds gone it had no consumer. The
playing flag was doing two jobs at once, so it is split at the seam the user named: `getIsAutoSpinning` is true
while the wheel turns by itself, `getIsUserSpinning` while it is fetching a target, spinning to it or settling
on it. Both are views of `getPhase`, which remains for anyone wanting the four states apart.

**`createRotation` no longer takes an element.** The hold was its only use for one, so the abstract is now what
its own heading claimed: a state machine with no DOM whatsoever. `InteractionUtils.trackPageHidden` was split
out of `trackHold` so the page-visibility half could be used without the pointer and focus halves; `trackHold`
composes it and is unchanged for `Carousel` and `Toasts`.

**WCAG 2.2.2 Pause, Stop, Hide (Level A), and the user's answer to it.** The normative line: _"For any moving, blinking or scrolling information that (1) starts
automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a
mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an
activity where it is essential"_. All three conditions now hold with nothing to answer them. The earlier reading
recorded here — that the motion is essential to the control — was written when the wheel came to rest on a spin
and stopped under the pointer; an attract-mode turn that never ends is a harder thing to call essential, since
the essential activity is the spin and this is what happens while nobody is spinning. What is left is
`prefers-reduced-motion`, which is a real user-side control but is not among the criterion's sufficient
techniques, and `autoSpinSignal`, which is a capability handed to the author rather than a mechanism offered to
the visitor.

**The user's position is that the criterion's own exemption applies: the motion is essential, because spinning
is what a wheel is, and "essential" is a subjective qualifier the criterion leaves to judgement.** Put to them
with the analysis above and answered directly; recorded as their reading, which is the standing the earlier
version of this note had too. A consumer who wants a pause control still has `autoSpinSignal` to build one
against.

The user-initiated spin is outside the criterion in any case — it does not start automatically — and it is the
essential activity, which is what 2.3.3 Animation from Interactions exempts at AAA. That is why reduced motion
suppresses the idle turn and leaves the spin alone.

`Carousel` and `Toasts` keep the three-part hold; the wheel no longer has one at all, so what they share now is
only `trackPageHidden`.

**The result is announced through `LiveAnnouncer`, only on settling.** Same argument as `Carousel`: the wedges
are all still on the page, so a live region over them announces nothing, and narrating an idle wheel every few
seconds is the noise 2.2.2 exists to prevent.

### `FlatWheel` and `DrumWheel`: two presets, because a wheel cannot become a drum

**They share behaviour and no markup at all.** One rotates in the plane of the screen; the other is a barrel
seen edge-on, with a front and a back face per wedge, a perspective ancestor and a size derived from the
wedge's own extent. A single component with a mode prop would be `Scroller` and `Carousel` again —
everything they appear to share, they hold for different reasons.

**So the split is `Spotlight`'s exactly**: an unexported `Wheel` shell holds both markups behind one variant
prop, each preset is a one-line pass of that variant, and only `Wheel.types` and `Wheel.utils` are exported.
The public API cannot express a variant change at runtime, which is the point, and the props each preset needs
differ in a way a mode prop could not state — `renderWedgeBack` and `wedgeSize` are required on the drum and
meaningless on the flat one.

**The drum's geometry is the component's; the wedge's shape is the consumer's.** `WheelUtils` computes the
apothem, the circumdiameter and the girth, because the shell cannot lay a barrel out without them; it does not
compute the pie-slice path, because a wedge could be a card, an image or a label on a ring, and the shell never
needs to know. That is the same line `Paginator` draws from the other side: its entries are arithmetic the
component needs to render, so it owns them.

**A wedge's content is sized from the slice it sits in, in container query units, and nothing is measured.**
The original's wedge content was authored against a 600px wheel: it watched the wheel with a `ResizeObserver`,
divided the measured height by that base size, and multiplied the content's `scale` by the result — then
multiplied again by `min(12 / wedgeCount, 1)` so the content shrank once the wedges outnumbered twelve. Both
multiplications are gone, replaced the way `Formation`'s insets were and for the same reasons: the label's box
and its type size are fractions of the wheel's own width written as `cqw`, so the browser resolves them and
there is no observer, no base size, and no frame of wrong layout on mount. `wheelWedge` carries
`container-type: inline-size`, which makes one `cqw` a hundredth of the wheel's width — the same unit the
wedge path's `viewBox` is drawn in, which is why one geometry function returns numbers that serve both the
path and the label.

**The room a label has is the width of the slice at the radius where the label starts, bounded twice.** The
two straight edges bound it as `radius × tan(halfAngle)`, and the arc bounds it as
`√(wheelRadius² − radius²)`; the narrower of the two is the one that applies. Taking only the first puts the
label's top corners outside the circle at low counts — at four wedges the straight edges are 45° off vertical
and give a half-width larger than the circle has left at that radius. Taking only the second is the
original's `paintedSize.width`, the chord between the slice's two rim corners, which is wider than the slice
is anywhere the label actually sits. The half-angle is clamped to a right angle so that two wedges, where the
edges are parallel and the tangent is unbounded, fall to the arc bound rather than to infinity.

**The count-based shrink was inert on the page, which is why the labels collided.** `min(12 / wedgeCount, 1)`
is exactly 1 at every count the props panel offers, since the panel stops at twelve — so the mechanism the
original had could never be seen, and the label box was the full width of the wheel rather than the width of
the slice, so at twelve wedges each label ran across its neighbours. Sizing the type from the slice bites at
every count instead of only past a threshold, and it needs no reference count to be kept in step with the
length of the prize list.

**Two paint constants carry it, and they are ratios rather than sizes.** `LABEL_RADIUS` is how far out from
the middle the label's top edge sits, in `viewBox` units, and `LABEL_TYPE_RATIO` is the type size as a
fraction of the slice's width there. Both are the consumer's half — a wedge could be a card or an image, and
the library never sees either number.

**Type size rather than a `scale` transform, which is what the original used.** A scaled box lays out at its
unscaled width and paints at the scaled one, so clamping the box to the slice and then scaling it down leaves
the paint narrower than the slice — the room would have to be divided back out by the same factor to come out
even. Setting the type size instead keeps layout and paint in one space, and the gap between lines is in `em`
so it follows without a second rule.

**The girth is the diameter after perspective, and the constant it replaced was a fudge that broke.**
Foreshortening means the barrel needs less room than the circle it turns in, and the original took a flat 1% off
per wedge to approximate that. Within the counts it was written for — eight to twelve portrait faces — it lands
within a few percent of the truth; at sixteen faces it takes 16% off and the drum paints outside the box it
reserved, which is the rule `InteractionWrapper` states as _"the wrapper's box has to equal the painted box"_.
So the approximation is gone and the arithmetic it was approximating is in its place:
the width at which the eye's line of sight **grazes** the drum, which is
`2 × perspective × circumradius ÷ √((perspective + apothem)² − circumradius²)`. `DRUM_PERSPECTIVE_PX` is
exported and applied as the inline `perspective`, so the number the CSS uses and the number the box is computed
from cannot drift apart.

**The obvious formula is wrong, and it was shipped once before being caught.** Measuring at the axis —
`circumdiameter × perspective ÷ (perspective + apothem)` — reads the width of the drum where its axis sits. But
the silhouette is not there: the tangent points are **nearer the eye** than the axis, so they project wider. The
error is the factor `(perspective + apothem) ÷ √((perspective + apothem)² − circumradius²)`, which is a fraction
of a percent on a narrow drum and grows with the ring, reaching 2.6% at twelve faces 150px wide — twelve pixels,
visible against a dashed outline, and worse at higher counts. **This is the second wrong answer here**, after the
original's flat percentage per wedge, and both failed the same way: right in the middle of the range they were
checked in, increasingly short outside it. The user caught both by eye.

**What the geometry is checked against is the rendered result, not the derivation.** The reserved box is measured
against the union of the faces' own boxes, at every count from two to twelve, at rest and sampled forty times
through a continuous turn. That is the assertion that would have caught either wrong formula, and neither unit
test would have. Two faces back to back have no depth at all and one face has no barrel, so the apothem
is zero below two wedges rather than the infinity the tangent gives.

**A drum turns about either axis, and the Playground shows both.** `axis: "row"` rotates about the upright
axis so the faces travel left and right — the original's arrangement — and `axis: "column"` rotates about the
level one so they travel up and over, which is a reel. The extent the geometry works from is the wedge's width
in the first case and its height in the second, which is why a landscape face makes a compact reel and a wide
drum: the same card is the small dimension one way round and the large one the other. **The reel carried each
prize round twice at first, and the user took that out** — nothing on the page now demonstrates that a wheel's
wedges need not be one per option, and the component still allows it.

**The wheel renders no control at all, and hands out a handle instead. This reverses `Carousel`, and the
reversal is the user's.** `renderSpin`, `renderControls`, `computeSpinLabel` and the `<button>` behind them are
gone. What replaces them is `onMount(controller)`, carrying `spin()` plus `getIndex`, `getPhase`,
`getIsSpinnable`, `getIsAutoSpinning` and `getIsUserSpinning` — so a control **anywhere on the page** can spin
the wheel and can disable itself while a spin is outstanding, which is the whole of what the built-in button
knew.

**Nothing the consumer already holds is on the handle.** A `getWedgeCount` was there and the user took it off:
the wedge array is the consumer's own prop, so its length is theirs to read and the wheel repeating it back is
a second source for one fact. The test for a member is whether the wheel is the only place it can be
known — `getPhase` and its two derived spinning flags are internal outright, and `getIndex` stays private when
no `indexSignal` is passed.

**`Carousel`'s argument does not carry over, and it is worth being exact about why, since the two now sit on
opposite sides.** There the library owns every button because the rotation is automatic and WCAG 2.2.2 requires
a stop mechanism that is not the author's to omit — a carousel with no controls is one nobody can stop. A wheel
has nothing to stop: the idle turn is ended by the spin, by the holds and by reduced motion, all recorded above,
and the spin itself only ever happens because someone asked for it. So the button the wheel rendered was
carrying no conformance load, and what is left is `Scroller`'s trade — the consumer renders the button, inherits
naming and the focus ring and the disabled treatment from `Button`, and the library keeps only what nobody else
can know.

**The cost is stated rather than mitigated: a library that renders no button cannot promise one is reachable or
named.** A consumer who wires up no control has a wheel that can only be driven from elsewhere through
`indexSignal`, exactly as `Carousel` with no `renderControls` has no keyboard route. That is the same exposure
item 23 records for `Scroller` and it is now the wheel's too.

**No slot survives either, and the one that briefly did was kept for a bad reason.** A `renderHub` was left on
the flat wheel out of deference to the choice `backlog.md` item 27 records — that a flat wheel has one control
slot and it is the hub. The user axed it. That choice was about where a **button** goes and there is no button
now; intrinsically the slot contributed one number, `inset: 35%`, which is paint, and a consumer who wraps the
wheel in a positioned box writes it themselves. The Playground does exactly that. `FlatWheel` renders wedges
and nothing else, `DrumWheel` renders a barrel and nothing else.

**The handle arrives after the first render, which is a real consequence rather than a wrinkle.** A control
reading `getController()?.getIsSpinnable()` sees `undefined` for the first tick and paints as disabled, because
`onMount` fires after the tree is built. `Typewriter`'s `getController()?.update(…)` has the same shape and the
same tick. Nothing on screen has moved by then, so no consumer has yet been able to press anything.

**The flat wheel exposes every wedge; the drum hides the ones that have turned away.** All of a flat wheel's
wedges are painted at once, so all of them are real content. A drum's are not — `backface-visibility` removes
them from the picture — and `Carousel`'s rule applies: a control nobody can see is still in the tab order, so
the faces that are not at the marker are `aria-hidden` and `inert`, and the back faces always are.

**The marker is drawn by the Playground, not by the wheel, and it needs no arithmetic at all.** All three
demos put a `PageWheelPip` — a filled triangle — against the edge of the box that the wedge at rest fills, so
whatever the wheel has stopped on has the pip touching it. The wheel never has to say where that is, because
the resting position is fixed by the geometry already recorded above: `getIndexAngle` turns the chosen wedge
to zero degrees, and at zero degrees a flat wheel's wedge is drawn straight up and a drum's face is the one
squarely in front. So the pip is a static piece of paint at a known edge, and nothing about it moves or is
measured.

**Which edge it sits on follows the direction of travel, not the variant.** Faces that travel sideways — a
flat wheel's rim and a drum on the upright axis — take the pip above, pointing down; the reel's faces travel
up and over, so it takes the pip at the left, pointing in. `PageWheelPip` accepts that as `getSide`, one of
`"top"` or `"left"`, and the same class both places the box and turns the glyph. It hangs 70% of its own size
outside the edge, so the tip crosses onto the wedge and the body reads as sitting outside it.

**The drums needed a box of their own to be measured against, and `PageWheelStack` could not be it.** The flat
demo's stack is a full-width block because `FlatWheel` is `width: 100%` inside it, and a box that shrinks to
its content cannot give a percentage width anything to resolve against. A drum's own girth box is definite
pixels, so `PageWheelMount` is `width: fit-content` with automatic side margins: it ends up exactly the girth
box, whose top edge is the front face's top edge and whose left edge is the front face's left edge. That is
the whole difference between the two wrappers, and it is why there are two.

**The pip is outside the wheel's element, which is what keeps the drum's geometry assertion honest.** The
Playwright check compares the box a drum reserves against the boxes its faces occupy, reading both from inside
`[aria-roledescription="wheel"]`. The pip is a sibling of that element rather than a child, so it can hang over
the edge without the check reading the overhang as a drum painting outside its room.

### `ElementObserver` reports a size, and the height observer is a view of it

`createBorderBoxSizeObserver` was added for `Satellite`, which needs both axes of both of its elements.
`createBorderBoxHeightObserver` stays exported — it is published API and `Collapsible` uses it — and is now
two lines over the new one, with a `createMemo` so a width-only change does not wake a height consumer. Border
box rather than a client rect, deliberately: a rect measured inside a `Viewport` is the layout value times the
scale factor, and layout numbers are what a positioner has to write back out.

### The hold is one function, and all three consumers call it

**Three components pause while somebody is looking at them, and each had written the test out.** `Toasts`
stops its countdowns, `Carousel` stops advancing, and a wheel stops turning by itself; all three meant
`hovered || focus within || page hidden`, and all three carried their own four handlers, their own
`visibilitychange` effect and their own copy of a `getHasLeft` guard. `InteractionUtils.trackHold(ref)` is now
the only copy, and the user's call was to convert the two existing components rather than leave them pointing
at it.

**It sits in `Interaction` rather than in a folder of its own.** `InteractionUtils.wrapElement` already turns an
element's pointer and keyboard events into state; this is the same job one level out — the region rather than
the control — and `trackDrag` had already established the `track*` verb for "attach listeners, hand back a
signal". A folder for one function would have been discoverable only by someone who already knew it existed.

**Why it carries a Level A requirement rather than being a nicety**: see 2.2.2 under `Rotation`. That is the
argument for one copy. Three copies of a conformance behaviour can drift apart silently, and the fourth
component to want it copies whichever it finds first.

**`mouseenter` / `mouseleave` replaced `mouseover` / `mouseout` plus a containment check.** The pair that does
not bubble already ignores movement between descendants, which is exactly what the guard was reconstructing by
hand. Focus still needs the guard: `focusout` fires on the region when focus moves from one child to another,
and `relatedTarget` is the only way to tell that from focus actually leaving. So the guard survives, used once,
for one of the two axes.

**What proves the conversion changed nothing is the existing specs, not new ones.** `carousel.spec.ts` covers
the hold under the pointer and the hold while a child has focus; `toasts.spec.ts` covers hovering, a hidden tab
and the arithmetic of a countdown resumed half way through. Those were written against the hand-rolled
version and pass unchanged against the shared one.

### One index wrapper, under the name that was already published

**`CarouselUtils.wrapIndex` and `RotationUtils` had the same function**, character for character: bring an
index into range, wrapping at both ends, and answer `0` when there is nothing to index. `CarouselUtils.wrapIndex`
is now that function rather than a second copy of it, which is legal in that direction — a `Fundamental` may
read an `Abstract`. The published name won over the `getWrappedIndex` the wheel work had invented, and the
export stays where consumers already find it.

**Two objections were raised against this and only one of them held.** That `Carousel` would lean on a namespace
named for something it is not: it does not hold, because a carousel's own vocabulary is already rotation —
`getIsRotating`, `renderRotationControl`, `CarouselRotationFlags`. That the old export has to stay: it does not
hold either, since a one-line re-export is a cost every arrangement but "leave both" would pay.

**What does hold is that the function is not angular arithmetic, so `RotationUtils` is not strictly its home
either.** Wrapping an integer needs nothing but the language, which is the `ss-utils` test, and `MathUtils` is
where the sixteen hand-written clamps went for exactly that reason. **It is staying here regardless** — the
user has deferred the move indefinitely, since that package is not cloned on this machine, and it is listed
with the other kept candidates under _"What went to `ss-utils`"_. Nothing is outstanding: one implementation
with two callers is what the move would have achieved, and this is not a task waiting to be finished.

### A Playground page returns a fragment, and its demos sit in a `PageMeasureBox`

Both corrected by the user after the four migrated components arrived with neither.

**A page has no root element of its own.** `App.css.ts`'s `tabPanelBody` is a column flex with a gap, and the
things it spaces are the page's own children — the props panel and the variants. A page that wraps them in a
div becomes one child, the gap disappears, and the panel sits flush against the demos. `CarouselPage` is the
shape to copy: `return (<>…</>)`. `ShapePage` gets away with a root because it re-declares the same column and
gap on it, which is the exception rather than the pattern.

**A demo sits in `PageMeasureBox`, not in a box the page invented.** It draws the checkerboard and the dashed
outline that say "this is the space the component asked for", which is exactly what a page hand-rolling a
bordered `host` div is trying to say and says less well. Three of the four pages had their own.

**The box has no padding, and that is the whole point of it.** Stated by the user, twice: the content hugs the
box, so the outline is a measurement rather than a frame. It was defaulting to 20px, which quietly made every
demo on every page smaller than the thing being measured, and three pages had grown a
`size + MEASURE_BOX_PADDING * 2` expression to cancel it back out. The default is now zero and those
expressions are gone. **`TypewriterPage` is the one exception and opts in**, because unpadded text is hard to
read; `MEASURE_BOX_PADDING` stays exported for it.

**The box hugs its content, and that is the same point from the other end.** It reports what the component asked for and
nothing else, so the outline around a demo is a measurement rather than a frame. The consequence, stated by the
user when this was written up the other way round: a component that asks for a share of its parent —
`Formation` and `Staircase` both size themselves as a fraction of their container — has no appetite of its own,
and collapses to nothing inside a box that only grants appetite. That is the box being truthful, not being in
the way. What it forces is that **the page has to state the width it is demonstrating at**, which is what
`getWidth` is for and what `CellAnimationPage` already used it for. Worth naming because the symptom is a demo
that renders and measures as zero rather than one that errors.

### The suite finds a demo by a key it was given, never by the caption it displays

The fault `backlog.md` item 29 describes, for the part of it that is now closed. A locator built out of
editorial text answers two questions in one red — did the behaviour change, and has anybody edited the
copy — and the second answer is worthless. Every variant, example and props row on a Playground page now
carries a key that is chosen once and never displayed.

**A container states the kind it is as a bare attribute and its key in `data-testid`.** `data-variant`,
`data-example` and `data-prop` survive with no value at all; the key is separate. Two reasons, and the first
is the one that decided it: several specs read `[data-variant]` for presence — "the page has rendered
something" in a `beforeEach` — and `surface.spec.ts` counts `[data-example]` to prove a page renders three
examples, so a page that had no kind attribute left would have nothing honest to count. The second is that a
lookup is then only ever made among things of one kind, which is what lets `SplitPanePage` key a variant
`pair` while some other page keys a props row the same word without either lookup becoming ambiguous.

**`variant`, `example` and `prop` in `e2e/helpers.ts` are the only three spellings of it**, and each pairs
the kind with the key. A props row is `[data-prop][data-testid="…"]` rather than being scoped to the panel
it sits in, because a local panel repeats the same row inside every variant that owns one — `ScanLineAnimationPage`
has two rows keyed `shift`, one per variant — so a row key is unique within its panel and not across the page.
Scoping by panel would have found both; scoping by variant is what the specs already do.

**Where the keys came from, since "chosen once" is only honest if the first choice was not a slug of the
caption.** A variant's key is the name the spec had already given it — `const MULTI = variant("Many open at
once")` becomes `variant("multi")` — because a spec's own const is a name for the demo written by somebody who
was thinking about what it demonstrates. Where no spec had named one, the key is a short reduction of the
caption, which is a starting value rather than a derivation: nothing re-derives it, so rewording the caption
afterwards cannot reach it. A props row's key is **the signal the row drives** — `getKey={() => "spinDurationMs"}`
beside `getLabel={() => "Spin duration (ms)"}` — which is the page's own state rather than anything editorial,
and reads as the prop it stands for.

**The key is required on `VariantDefs`, `ExampleDefs` and `PageProp`, and that is the mechanism rather than a
formality.** An optional key would let the next variant arrive without one, and the first spec to want it would
reach for the caption again because that is what is there. Required means the compiler names every site, which
is also how all 218 variants and 103 props rows were found rather than by grepping for `name:`.

**A demo control a spec drives carries an `id`, and the spec finds it by `#key`.** The user's call, over two
alternatives: wrapping each control in a keyed element, rejected because every wrapped demo grows a box and a
few of them sit in layouts where that is not free; and adding a test-attribute pass-through to the library,
rejected because the library would grow a prop that exists only for the suite. An `id` needs nothing new at
all — `Button`, `Range`, `BinarySwitch`, `Select`, `TextField` and the rest already take `getId`, and each puts
it on the element a spec actually wants: the `<input>`, the `<button>`, the combobox. Their reason for
preferring it: an id is multipurpose and far more stable than a caption.

**The one real consequence is that an id must be unique in the document, so a control rendered more than once
composes its id.** A control that appears once per variant cannot carry a literal, and this is why
`PageCalendarCaption` and `PageDatePickerTrigger` take a `key`: three calendars sit on `CalendarPage` at once,
so their paging buttons are `defaultNextMonth`, `boundedNextMonth`, `weekdaysNextMonth`. `PageExamples` keys its
own source-code button after the example it belongs to for the same reason, and each wheel example names its
spin button in its own file. Where the id had nowhere to land, the Playground component gained the prop rather
than the library: `PageNumberField` and `PageLabelCaption` pass one through.

**Two locators were better off structural than keyed.** A toast's close button is the only button inside a
toast, so it is `${TOASTS} button` rather than a keyed control that would have to compose an id per toast; and
the toasts region is `[role="region"]`, since a role is the sound kind and nothing else on that page is one.

**A control rendered once per datum keeps its name, because the datum is what the spec is reasoning about.**
A radio named `Small`, a tag named `solid`, a menu item named `Paste`, an option named `Denmark`, a props
select's value `hourglass` — the string is the fixture the test chose, not furniture somebody may reword for
prose reasons, and there is no single control to key. This is the line worth being exact about: what was
converted is a control the page **names**, and what stays is a control the page **lists**.

**Three kinds of locator are sound and stay**: a role, a role description or a state attribute
(`[aria-roledescription="wedge"]`, `[role="log"]`, `[aria-disabled]`, `[inert]`) is the component's published
contract, so a spec is meant to break when one changes; an accessible name that **is** the assertion stays,
because there the string is the thing under test; and a name the **library** owns rather than a page —
`ColorInput`'s own default hue label, for instance — is contract too. Between those and the keys, no locator in `e2e/` now
reads a string the Playground wrote as furniture.
