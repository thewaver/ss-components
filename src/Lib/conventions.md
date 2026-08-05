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

One consequence with no fix worth building: a plain disabled control can now take focus from a mouse
click, since only its tab order was removed. `:focus-visible` does not match on mouse focus, so
nothing is drawn, and `isFocused` stays false because non-reachable mode never attaches listeners.

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

### Folder layout: `Fundamentals/Input`

`BinarySwitch`, `Checkbox`, `Toggle`, `Radio`, `RadioGroup` and `Label` live under
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
