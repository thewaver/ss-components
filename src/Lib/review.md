# Lib code review

Outstanding problems in `src/Lib` — bugs, code and architectural smells, missing implementation.
Nothing else belongs here. Once an item is fixed or dropped it is deleted outright rather than
marked resolved, and the remaining items are renumbered to stay contiguous from 1. Settled
decisions and the reasoning behind them live in `conventions.md`.

### Index

1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
2. One-shot positioned effects have nowhere to go — _open_
3. Neither animation component can paint its own background — _open_
4. Cell animation timing is linear-only — _open_
5. Parity-based weights break when the origin lands on a half-pixel — _open_
6. `Select` — six things deliberately not built — _open_
7. `Range` is not built — _open_
8. Date, time and calendar are not built — _open_
9. Other core controls the library does not have — _open_
10. Machinery those controls need, none of which exists — _open_
11. What the verification suite still cannot see — _open_

### Build order

Covers the unbuilt controls in items 7 to 10. The ordering principle is **how much of the existing base
a thing reuses**: anything that is a preset or a composition of what already works comes before anything
that needs a new primitive, and anything blocked on an architectural decision comes last, so the
decision is made once with several consumers in view rather than inferred from the first one.

Two things break that ordering on purpose, and both are noted where they fall.

**Tier 2 — new components whose every mechanism already exists somewhere.**

1. **Extract `Popover` from `Select`, then build `Menu`.** `Anchor`, `ElementFader`, the portal, the
   `mousedown` refusal and `inert` are all written; what is new is a menu's roles and activation
   semantics, on a keyboard walk that is 1D like `Select`'s. Do the extraction first because three later
   items want it — `Menu`, `DatePicker`, the `ColorInput` picker — and take the shared dismissal
   `Abstract` with it, since that is its third consumer.
2. **`TextArea`** — extract the text composite `conventions.md` already promises, then two presets. New
   work is auto-height measurement, which is the same primitive as the next item, so pair them. It is
   also the last raw native left in the Playground, so it closes that migration rather than adding to it.
3. **`Accordion`** — trivial ARIA over the auto-height animation from 2.
4. **The 1D walk becomes an `Abstract`** — `Tabs`, `RadioGroup` and `Select` contain the same
   navigable-index arithmetic three times. Extracting it here is a refactor with no new component,
   verifiable against three shipped behaviours, and it is the honest place to start item 10's keyboard
   work rather than inside a calendar.

**Tier 3 — blocked on a primitive that has to be designed first.** Do not start these by inventing the
primitive privately inside them.

5. **Pointer drag and track geometry (item 2's opt-in design), then `Range`.** Once a drag can be
   expressed and a value can map to a measured track, `Range` itself is ordinary. Deciding whether both
   thumb counts are custom is part of the same pass.
6. **The custom `ColorInput` picker surface** — the same drag primitive in two dimensions, so it
   follows `Range` and reuses it rather than the reverse. The field itself ships; this is the surface
   that would replace the OS dialog.
7. **The 2D roving keyboard, grown from the `Abstract` in 4, then `Calendar`.**
8. **A mask layer over `TextSync`, plus the date-dependency decision, then `DateInput`** — and only
   then `DatePicker`, which is `Calendar` plus the `Popover` from 1. Date-time and ranges compose from
   those rather than being new components.
9. **`Tree`** — the 2D keyboard from 7 plus `Select`'s tree-flattening model. Wants virtualization,
   which is also `Select`'s loose end in item 6, so that `Abstract` belongs here.

**Out of the cost ordering, deliberately:**

- **The form story (item 10) should be decided far earlier than its size suggests**, and it is now the
  oldest thing on this list. It is the one item whose cost _grows_ with delay: every control built without
  it grows its own half of error and validation plumbing, and each becomes a retrofit. Four controls
  landed since this was written — `Progress`, `FileInput`, `ColorInput` and the two `Modal` presets — and
  each carries its own `hasError` with nothing on the other end of it.
- **Toasts are not blocked by any primitive, only by a shape decision** — an out-of-tree queue and an API
  that is called rather than bound, which nothing here has. That makes them schedulable at any point, and
  worth doing standalone rather than wedged next to something else.
- **`Table` / data grid stays out of scope**, and specifically must not arrive as a by-product of
  `Tree` or of virtualization.

---

## 1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written

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

## 2. One-shot positioned effects have nowhere to go

`renderDecoration(getFlags)` hands a painter a snapshot of state, and the flags describe state
only — never events, never pointer geometry. A painter can watch `isActive` flip with its own
effect, but it cannot know **where** the pointer was, so a ripple or any other effect that has to
start at the point of contact cannot be expressed at all.

This surfaced when the React `BinarySwitch` was audited: its `Checkbox` and `RadioButton` both
spawned ripples imperatively through a controller ref, and nothing in this project's contract can
reproduce that. It is recorded as a shape the current design cannot express rather than as a request
for ripples.

Not worth building until something asks for it, and it should be opt-in when it is — otherwise every
control that wants no effect pays for a listener it ignores.

---

## 3. Neither animation component can paint its own background

Both require a `getSrc` and slice that image. The React-era component could instead fill each cell
with `currentColor` over its own children, which is what made a reveal-over-content effect possible —
an animated button, a wipe over a card. Adding it means a children slot and a size anchor that is not
an `<img>`, so the sizing path would diverge from `ScanlineAnimation`'s unless both change together.
Worth deciding once, for both.

---

## 4. Cell animation timing is linear-only

`computeLocalTimeline` maps the timeline linearly and `sampleTrack` interpolates linearly between
stops, so nothing can ease. The React-era component took a timing function per keyframe
(`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`) and applied it to each cell's playback.

Restoring it is an easing function applied to the local timeline before the stops are sampled, and
needs nothing outside the samples file.

---

## 5. Parity-based weights break when the origin lands on a half-pixel

`CellAnimationGeometry.isEvenRow` and its siblings test `dist.y % 2 === 0`, which silently assumes
the distance is a whole number. It is not: a `center`, `left` or `right` origin is `(count - 1) / 2`,
so on an **even** count the origin sits on a half-integer and every distance from it does too. The
parity test is then false for every cell, so the alternating branch never runs and the weight
function degenerates into whichever branch is the fallback.

Measured on a 1×8 column with a centre origin: `lineRowAlternate` spans only `0 … 0.429`, so no cell
ever starts at the beginning of the timeline, and `lineRowConvergent` returns `-0.071`, outside the
0..1 range every other weight function honours. Nothing crashes, because `computeBreakpoints` clamps
its progress, but the pattern the name promises is gone and two cells collide at the extreme.

Eighteen of the thirty-seven weights read one of these predicates, so the blast radius is every
`*Alternate`, `*Convergent`, `zigzag*`, `roll*`, `entwine*` and `checkered*` entry. It is invisible by
default only because the Playground ships a 7×7 grid, whose centre origin lands on whole cells, and
`ScanlineAnimation` cannot reach it at all now that it exposes no origin. It is inherited from the
React original, which had the same formulas.

Two candidate fixes, neither taken here because both change output across all eighteen: round the
distance before testing parity, which keeps integer cases identical and makes half-integer ones
alternate sensibly; or bound the origin to whole cells, which is a narrower change but removes
centre-of-an-even-grid as a position.

---

## 6. `Select` — six things deliberately not built

The decisions behind what exists are in `conventions.md` under the three `Select` headings. These are
the gaps, each with the reason it is still a gap.

- **Typeahead is absent, and consumer-owned filtering did not solve it after all.** Filtering changes
  the list; typeahead moves the highlight without changing it, so it cannot reuse the consumer's
  filter. It still needs either a string per option — a second source for text the painter already
  renders — or a consumer predicate duplicating the matcher they already wrote. The honest answer for
  anyone who wants it today is to turn on autocomplete instead.
- **A consumer whose filter injects a non-matching option can see the highlight land on it.** While
  filtering, the highlight goes to the first option rather than to the selection, because the component
  knows which options are _present_, not which ones _matched_. The fix belongs in the consumer's
  filter; the trade-off is recorded in `conventions.md`.
- **A group header cannot show partial selection.** `SelectOptionFlags.isSelected` is a boolean, and a
  multi-select group header wants the `checkedState` tri-state `BinarySwitchFlags` already has. This is
  the one place the two controls might legitimately share a type rather than each declaring its own.
- **The group box is not paintable, only its header is.** The library owns
  `<div role="group" aria-label>` so the role cannot end up in consumer markup; the consumer fills the
  header via `renderGroup`. Handing it a `renderOptions` thunk in `renderPopup`'s shape would give it
  the whole box, and is available if something needs it.
- **Virtualization is still possible but nothing uses it.** The record shape was chosen to keep it
  open. Only one thing now assumes every option is mounted: each option scrolls _itself_ into view off
  its own `isHighlighted` flag, which a virtualizer would have to replace with its own scroll-to.
- **Open state is private, and dismissal does not restore the query.** There is no `openSignal`, so a
  consumer cannot close the popup programmatically; if that is ever wanted it is a `*Signal` prop by
  the existing rule. Escape and blur clear the query rather than restoring the selected option's text,
  because restoring it would need the per-option string this design does not have.

---

## 7. `Range` is not built

A slider, single-thumb and two-thumb. Nothing in the repo has ever had one — `style.css` styles
`input[type="range"]` and nothing on any page uses it.

It is the most architecturally novel control left, for three reasons that have nothing to do with how it
looks:

**It is the first control whose value maps to a coordinate rather than to paint.** Every existing control
hands a painter flags and lets it decide what to draw; a slider has to convert a value into a position
along a track and back again, and the track's length is a measured box. That is a geometry primitive
nothing here has, and it belongs in `Abstracts/` rather than in the control.

**It is the first control that needs a pointer drag**, which item 2 records the painter contract cannot
express — flags carry state, never events or pointer position. A slider is what makes item 2 concrete
rather than theoretical, and it needs _continuous_ pointer position during a drag, not the one-shot
contact point that item described. Settle item 2's opt-in design first, or `Range` will invent its own.

**A two-thumb range cannot be a native `<input type="range">`.** The overlay-geometry rule — painter in
flow sizing the box, real input absolutely over it — carries every other input in this library and covers
a single-thumb slider fine. It has nowhere to go for two thumbs. So the first call to make is whether
both cases are custom, or whether the single-thumb case keeps the native input and the two diverge.
Precedent says one composite with presets (`BinarySwitch`, `SelectComposite`), which points at custom
for both.

Also unresolved and cheap to get wrong: keyboard stepping (`step`, plus a coarser `PageUp`/`PageDown`
step), whether the two thumbs may cross, and vertical orientation.

---

## 8. Date, time and calendar are not built

**Not one component.** It decomposes into at least four, and the decomposition is the first decision:

- `Calendar` — the month grid alone, no popup and no field. Selection by date, the same
  data-driven-records shape `Select` settled on.
- `DateInput` — a masked text field, so a date can be typed rather than clicked.
- `DatePicker` — the field plus a popup over `Calendar`, which is `Select`'s composition exactly:
  `Abstracts/Anchor` for placement, a private popup, `aria-activedescendant` on the field.
- Range variants of all three, where the value is two dates and the grid paints the span between them.

Time and date-time sit on top: a `TimeInput` is the mask plus stepping per segment, and a date-time is
the two composed rather than a third thing.

Three blockers, each shared with another item:

**The grid needs a 2D roving keyboard, and every walk in this library is 1D.** `Tabs`, `RadioGroup` and
`Select` all step through a flat list of navigable indexes. A calendar's arrows move by day and by week,
`Home`/`End` mean start and end of week, `PageUp`/`PageDown` mean month, and the walk crosses month
boundaries. See item 10 — this should become an `Abstract` rather than a fourth hand-rolled walk.

**A mask is more than `TextSync`'s transforming setter.** `TextSync` preserves the caret when a setter
rewrites the value, which is the right base, but a mask also has to skip literal separators, decide what
a partially typed date means, and keep a display form and a value form that are not the same string.

**There is no date handling to inherit.** `@thewaver/ss-utils` exports `MathUtils` and nothing for dates,
so month arithmetic, week starts, locale month and weekday names, and timezone behaviour are all
undecided — and that is a real dependency decision (`Intl` alone versus a date library) rather than an
implementation detail. Timezones are the trap: a date-only value that round-trips through a `Date` will
shift across a boundary.

---

## 9. Other core controls the library does not have

`Fundamentals/Input` covers `TextInput`, `Checkbox`, `Toggle`, `Radio`, `RadioGroup`, `Select`,
`MultiSelect`, `FileInput`, `ColorInput` and `Label`; `Fundamentals` adds `Button`, `Tabs`, `Tooltip`,
`Modal`, `Drawer`, `AlertDialog` and `Progress`. Beyond items 7 and 8, this is what is missing, ordered by
how much of it is a new architectural problem rather than by how much markup it is.

**The Playground's raw natives used to be read as the evidence for this list, and that trap is now
closed**: every one of its 43 props-panel controls is a library control, and the single remaining native
is a `<textarea>` waiting on the entry below. Nothing on this list can be inferred from that page any more.

### Value-carrying controls with no equivalent here

**`TextArea`.** Already promised in `conventions.md`, which names it as the thing that would justify
extracting a shared text composite rather than letting `TextInput` grow a mode. The new problem it brings
is that the overlay-geometry rule assumes the painter sizes a fixed box: a textarea auto-grows and
scrolls its own content, so the painted box has to follow content height, and the input's scroll must not
desynchronise from a painter that does not scroll.

**A number stepper, which is a preset and possibly not wanted at all.** `TextInput` already carries
`type="number"`, `min`, `max` and `step`, so a numeric field is not missing. What a `NumberInput` preset
would add is the affordance the library's own CSS removes — `textInputElement` suppresses the webkit
spinner — plus press-and-hold repeat and clamping on blur rather than per keystroke. **The Playground now
argues for it.** `PageNumberField` exists precisely because a panel holding a number has to keep a local
`Signal<string>`, mirror the owner's number into it, parse, clamp and report — thirty lines that every
consumer with a numeric field will write the same way, and it clamps per keystroke because that is what
falls out of the mirror. A preset owning the string/number codec is the thing that would delete it. A
painter can already put two `Button`s in `renderTrailing`, so the affordance was never the hard part.

### Overlays and feedback

**`Popover` and `Menu`.** `Select`'s popup is deliberately private under the standing "private until a
second consumer" rule. **A `Menu` is that second consumer**, so it is the concrete trigger to extract
`Popover` from `Select` — and a menu is genuinely not a listbox: `menuitem`s _do_ things rather than
carrying values, so there is no selected state, `Enter` activates and dismisses, and submenus need
nested popups with their own placement. Dismissal is the other half: outside-click, `Escape` and focus
return are hand-rolled in both `Modal` and `Select` today, and a third copy is the trigger to extract
them too (see item 10).

**Toasts.** The only item here whose hard part is not the markup: a notification stack needs a queue
that outlives the component that raised it, which means state owned outside the tree and an API that is
called rather than bound. Every control here takes signals in props; nothing has ever been imperative.
That shape is the decision, and it should be made before any of it is built.

### Structure

**`Accordion` / disclosure.** Behaviourally small but it needs animating to an auto height, which means
measuring content and animating to a computed pixel value; nothing in this library does that yet.

**`Tree`.** `role="tree"`, expand/collapse, and a keyboard model where arrows do two different things
by axis. The model transfers directly from `Select`'s option groups: render a tree, walk a flat list,
derive the flat list from the tree.

**`Table` / data grid is out of scope for now** — sorting, selection, column sizing, sticky headers and
virtualization together are a project rather than a component, and it should not be started as a
by-product of anything else.

**`Pagination`, `Breadcrumbs` and a segmented control are compositions** — of `Button`, of `Tabs`, and
of `RadioGroup` with button-shaped painters — and should stay that way until something proves otherwise.
A segmented control is worth naming explicitly because it looks like `Tabs` and is not: `Tabs` is
navigation with `role="tablist"`, while a segmented control carries a **value**, which is `RadioGroup`
with different paint.

### Not components at all

`Skeleton`, `Avatar`, `Badge` and `Card` are pure paint with no behaviour, which is the consumer's half
of the contract by definition — the Playground already builds three of them as `Surface` examples.
`Icon` likewise: a library that paints nothing cannot own an icon set.

---

## 10. Machinery those controls need, none of which exists

Grouped here because each one is shared by several of the controls in items 7 to 9, and because building
any of those without first deciding these would bake the decision in by accident.

- **A 2D roving keyboard model.** `Tabs`, `RadioGroup` and `Select` all walk a 1D list of navigable
  indexes with the same wrap-around arithmetic, three times over. `Calendar`, `Tree` and any grid need
  two axes, where the row and column steps differ and `Home`/`End`/`PageUp` mean something per axis.
  This is the point at which the walk itself should become an `Abstract` rather than a fourth copy.
- **Pointer drag capture, and pointer geometry in the flags contract.** Item 2 records that
  `renderContent`/`renderDecoration` receive state and never events or pointer position. `Range` cannot
  be built without it, so the opt-in design that item asks for has to be settled first.
- **Dismissal as an `Abstract`.** Outside-click, `Escape` and focus return exist twice — `Modal` traps
  and restores focus, `Select` closes on blur and `Escape` — with different rules and no shared code.
  `Popover` would be the third, which by the standing rule is when it gets extracted.
- **Auto-height animation.** Needed by `Accordion`, and the general problem is measuring a target box
  and animating to it; `Abstracts/ElementObserver` is where it belongs.
- **Masking and formatting.** `TextSync` handles a setter that transforms or refuses while preserving
  the caret. A mask is more: the caret must skip literal characters, and a formatted number or date has
  a display form and a value form that are not the same string.
- **Virtualization.** Already recorded as a `Select` loose end in item 6; `Tree` and any grid need the
  same thing, so it is an `Abstract`, not a per-control feature.
- **A form story, which is the largest gap and is not a component.** Controls carry `hasError` and
  nothing else: there is no association between a field and its message (no `aria-describedby` wiring,
  which is what makes an error announceable), no validation contract, no submit or reset, and no way to
  ask a group of controls whether they are valid. `Label` solves the accessible **name** and stops
  there. Every control built above will otherwise grow its own half of this by accident — `FileInput` and
  `ColorInput` both shipped carrying `hasError` and nothing on the other end of it, so the count of
  controls to retrofit is now eleven.
- **A `Signal<string>` codec, which is the smallest of these and the one with a consumer already.** Every
  control here owns its value as a `*Signal`, and every value that is not a string needs a mirror: a local
  signal, an effect that writes the owner's value in when the two disagree, and a parse on the way out.
  `PageNumberField`, `PageSelectField`, `PageCheckField` and `PageColorField` are four copies of that
  shape, and a consumer with a store rather than signals will write a fifth. What is undecided is whether
  the answer is an `Abstract` that builds the mirror, or a controls-take-getter-plus-setter escape hatch
  next to `*Signal` — and _"Signal tuples for two-way state"_ already records the cost this is the tail of:
  "the owner has to _have_ a signal".

---

## 11. What the verification suite still cannot see

`verify/` drives real clicks and keystrokes over the DevTools Protocol, and `npm run verify:dom` runs it.
What is worth stating is the shape of its blind spots, because a green run reads as broader coverage than
it is.

**It cannot assert on anything that needs a CSS transition to have finished.** Headless Chrome stops
producing frames once a page settles, and a `transform` transition is compositor-driven, so a panel
transitioning from `scale(0)` never grows and its box measures zero. This is why the `AlertDialog` spec
activates its focused button by keyboard rather than clicking it, and why `page.frame()` races
`requestAnimationFrame` against a timer instead of trusting it. Anything whose _only_ observable is a
transitioned geometry is out of reach; anything observable as state, an attribute or a class is not.

**The same stall found a real bug and may be hiding others of that shape.** `ElementFader` used to hang
its whole state machine on one `requestAnimationFrame`, so on a page that stopped painting a dismissed
`Modal` stayed mounted with its focus trap. It now races a fallback timer. Every other rAF consumer —
`ElementObserver.createViewportRectObserver`, and through it `Anchor`, `Tooltip` and `Select`'s
positioning — has the same dependency and no such fallback, and a stalled page would leave a popup
anchored to where its field used to be. Whether that deserves the same treatment is undecided: a
positioner that stops updating when nothing is painting is arguably correct, while a state machine that
stops advancing is not.

**Six shipped components have no spec at all**: `Button`, `Tabs`, `Tooltip`, `Modal` itself (only its two
presets are covered), `Surface`, and both animation components. `Tabs` is the notable one, since
`conventions.md` records its behaviour as verified by markup dump only.

**Nothing checks appearance.** The suite reads the DOM, so the parity rule that forced
`aria-disabled`-everywhere — that disabled and disabled-but-reachable must look _identical_ — is still
only ever checked by eye.
