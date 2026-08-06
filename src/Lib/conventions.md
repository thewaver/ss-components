# Lib conventions

Settled decisions for `src/Lib`, recorded so they are not re-litigated. This is the reasoning
that would otherwise live in code comments. Open problems live in `review.md`; nothing here is a
task.

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
that was deleted once it shipped; `review.md` #8 carries what was deliberately left out of it.

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

### Folder layout: `Fundamentals/Input`

`BinarySwitch`, `Checkbox`, `Toggle`, `Radio`, `RadioGroup`, `TextInput` and `Label` live under
`Fundamentals/Input/`. The grouping is by what a component is _for_ — carrying a value the user
edits — not by what it is built from. `Button` and `InteractionWrapper` deliberately stay at the
`Fundamentals` level: `Button` is an interaction with no value, and `InteractionWrapper` is shared
by both families, so filing it under `Input` would misdescribe it.

`src/Lib/index.ts` still enumerates every export path individually and stays sorted, so the group is
a directory convention rather than a barrel — `Input` sorts between `ImageSwitcher` and
`InteractionWrapper` and the block reads as a unit there.

**How the rendered DOM can be checked without a test environment.** Headless Chrome can dump a
built page, which is enough to verify anything expressed as markup — tab order, roles, ARIA,
painter classes:

```
npm run build:playground && npm run preview
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless --disable-gpu --virtual-time-budget=3000 --dump-dom http://localhost:4173/radio
```

That is how the roving tab order, per-group `name` isolation, `role="radiogroup"`, the dropped
`role="switch"` on a mixed toggle and the mixed painter classes were confirmed. It cannot click or
type, so behaviour is a different problem — see `review.md`.

_Corrected **2026-08-06**: this previously said Edge's headless `--dump-dom` on Windows returns the
shell with an empty route outlet, and that a failure to see page content there is the browser rather
than the page. That is wrong and the advice was dangerous — it tells you to disbelieve a real empty
result. Edge renders every route fully; `/radio` came back with all five radio groups, both painter
decorations and their inline colours._

The actual failure is the URL. `vite preview` binds the **IPv6** loopback, so `http://localhost:4173`
resolves for some clients and `http://127.0.0.1:4173` is refused outright — and a refused connection
dumps Chromium's error page, which is a plausible-looking 300 KB of HTML containing none of your
markup. Use `http://[::1]:4173/…` and check the dump contains something you expect before reading
anything into what it does not contain.

On Windows the browser is at
`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, and the preview server has to
outlive the shell that started it.

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
would exist on a line, and a control that is meaningful for three of nine options reads as broken. So
`ScanlineAnimation` offers `ORIGIN_FREE_WEIGHT_TYPES` — the five `sequence*` permutations, which are
the orderings it owned before the merge, plus `randomDefault` — and has no `getOriginType` at all.
`CellAnimation` keeps the full set and calls `isOriginAware` to disable its own origin control when
the selected weight ignores it. Both narrowings live in the type rather than in the Playground's
dropdown, because filtering only the UI leaves the same trap set for the next consumer.

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

**Whole-grid operations cannot live in a per-cell evaluator**, which is why the component owns
weights while the consumer owns breakpoints. `shouldMakeUnique` and `shouldNormalize` rank every
cell against every other, and the memoised grid also stops `randomDefault` reshuffling every frame.
The evaluator receives `{ pos, count, origin, weight }`, so a zone predicate can drive motion.

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
