# Lib code review

Outstanding work in `src/Lib` — bugs, code and architectural smells, missing implementation, pending
decisions. Nothing else belongs here. Once an item is done or dropped it is deleted outright rather
than marked resolved, and the remaining items are renumbered to stay contiguous from 1. If closing it
settled a decision that drives future work, that decision moves to `conventions.md`; the record of
having done the work does not go anywhere.

### Index

1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
2. One-shot positioned effects still have nowhere to go — _open_
3. Neither animation component can paint its own background — _open_
4. Cell animation timing is linear-only — _open_
5. `Select` — six things deliberately not built — _open_
6. `Menu` — five things deliberately not built — _open_
7. What the date and time family still lacks — _open_
8. Other core controls the library does not have — _open_
9. Machinery those controls need, none of which exists — _open_
10. What the verification suite still cannot see — _open_
11. The SVG defs' geometry cannot be reached without rendering — _open_
12. Planned: strip `style.css`, add a theme, and add opinionated control presets — _planned_
13. `Toasts` — six things deliberately not built — _open_
14. `Calendar` — six things deliberately not built — _open_
15. `ColorInput` — four things deliberately not built — _open_
16. `Accordion` — four things deliberately not built — _open_

### Build order

Covers the unbuilt controls in items 7 to 9. The ordering principle is **how much of the existing base
a thing reuses**: anything that is a preset or a composition of what already works comes before anything
that needs a new primitive, and anything blocked on an architectural decision comes last, so the
decision is made once with several consumers in view rather than inferred from the first one.

**Blocked on a primitive that has to be designed first.** Do not start these by inventing the primitive
privately inside them.

1. **The mask over `TextSync`, then the locale-ordered date and time fields.** Both fields ship in ISO
   order; the mask is what a `dd/mm/yyyy` field and a formatted number need, and it is the one primitive
   two shipped controls are already waiting on. Extracting the field shape `DateInput` and `TimeInput`
   duplicate belongs in the same pass — see item 7.
2. **`Tree`** — `computeNextCell` ships, and `Select`'s tree-flattening model is the other half. Wants
   virtualization, which is also `Select`'s loose end in item 5, so that `Abstract` belongs here.

**Out of the cost ordering, deliberately:**

- **The form story (item 9) should be decided far earlier than its size suggests.** It is the one item
  whose cost _grows_ with delay: every control built without it grows its own half of error and validation
  plumbing, and each becomes a retrofit. The count of controls carrying a `hasError` with nothing on the
  other end of it is now sixteen.
- **Dismissal should be settled once, across four consumers.** `Select` and `Menu` close on blur because
  their popups refuse focus; `ColorInput` and `DatePicker` cannot, so each runs its own outside-pointer
  listener. Four stories for one behaviour is the argument, and it is the same `openSignal` question items
  5 and 6 record.
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

## 2. One-shot positioned effects still have nowhere to go

`InteractionUtils.trackDrag` now reports pointer position, so the primitive this item asked for exists —
but it reports a **ratio while a drag lasts**, which is not the same thing as an event with an origin.
A ripple needs to know where a single click landed and then run once from there; the flags a painter
receives still describe state only, and `trackDrag` is something a control opts into rather than something
a decoration can read.

What remains is the smaller half: getting a one-shot origin from the control to `renderDecoration`. The
shape is probably a flag carrying the last activation ratio, since that reuses the extensible-flags
mechanism and stays opt-in — a control that never calls `trackDrag` emits nothing.

Not worth building until something asks for it, which is where this item started.

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

## 5. `Select` — six things deliberately not built

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

## 6. `Menu` — five things deliberately not built

The decisions behind what exists are in `conventions.md` under _"`Popover` extracted, and `Menu` as the
second consumer"_ and _"`Menu` submenus: a level per popup, focus moving between them"_. These are the
gaps, each with the reason it is still a gap.

- **There are no groups and no separators.** `SelectItem<T>`'s discriminated record would carry them
  unchanged, but a second copy of `getFlatOptions` plus `getItemOffsets` would come with it — and that
  is the duplication `NavigationUtils` deliberately did _not_ absorb, since it walks positions and has
  no opinion about what produced them. Flattening a tree into a navigable list is the next thing worth
  extracting, and copying it first would make that harder rather than easier. A consumer that needs
  sections today paints them into `renderPopup` around a flat list.
- **`Tab` closes the menu and returns focus to the trigger rather than moving past it.** APG says move
  to the next element after the trigger. The menu is portalled to the end of the document, so letting
  `Tab` through lands focus wherever the portal sits, which is worse than not moving. The cost is one
  extra `Tab`; fixing it properly means computing the trigger's next tab stop by hand.
- **There is no typeahead**, for the same reason `Select` has none — it needs a string per item that
  the painter already renders, or a consumer predicate. Unlike `Select` there is no autocomplete to
  offer instead.
- **The trigger is a button and only a button.** A right-click context menu and a split button are both
  the same popup on a different opener, and both want `Menu` to accept an anchor and an open signal it
  does not own. That is the same `openSignal` question `Select` records, and it should be answered once
  for both.
- **There is no `menuitemcheckbox` or `menuitemradio`.** Those carry state, which is the line this
  control is on the other side of — `MenuFlags` has no selection and items have no `aria-checked`.
  Adding them means deciding whether a stateful menu is this component or a `Select` with menu paint.

---

## 7. What the date and time family still lacks

`Calendar`, `DateInput`, `DatePicker` and `TimeInput` ship, over `Abstracts/DateValue` and
`Abstracts/TimeValue`. The decisions are in `conventions.md`. What is left, in the order it would be worth
doing:

- **The mask, whose job is now exactly one thing.** Both fields read ISO order only — `yyyy-mm-dd` and
  `HH:mm` — because those spellings parse and refuse precisely. A locale-ordered field (`dd/mm/yyyy`, or a
  12-hour clock with an am/pm segment) is what needs the caret to skip literal separators and a display
  form that differs from the value form. That is the whole of what `TextSync` cannot do, and a formatted
  number wants the same primitive. `TimeInput`'s caret arithmetic is a hint at the shape but not a
  substitute: it works because ISO segments are fixed width.
- **No time popup.** A list of times in a `Popover` is a `Select` over generated options; whether that
  belongs inside `TimeInput` as a mode or beside it as a `TimePicker` is the decision, and it should be
  taken with the `openSignal` question below rather than separately.
- **No date-and-time value.** The two fields exist side by side and nothing composes them. Which signal
  owns the pair is the question — one `{ date, time }` record, or two signals a consumer keeps in step.
  The former is a new value type; the latter is the mirror problem again.
- **Range variants of all of them.** `Calendar` holds one date, so a span needs two ends, a half-entered
  state while the first is being picked, and `isInRange` / `isRangeStart` / `isRangeEnd` on the flags.
  Decide once, for `Calendar` and `DatePicker` together.
- **`DateInput` and `TimeInput` share a shape and no code.** Both are a `TextField` over a private text
  signal with parse-on-complete and refresh-on-blur. That is now written twice, and a third typed value
  (a formatted number) would write it a third time. Extracting it is the smaller half of the mask work and
  probably wants doing at the same time.

---

## 8. Other core controls the library does not have

`Fundamentals/Input` covers `TextInput`, `TextArea`, `NumberInput`, `Checkbox`, `Toggle`, `Radio`,
`RadioGroup`, `Select`, `MultiSelect`, `FileInput`, `ColorInput`, `Label`, `Calendar`, `DateInput`,
`DatePicker` and `TimeInput`; `Fundamentals` adds `Accordion`, `Button`, `Tabs`, `Tooltip`, `Popover`, `Menu`, `Modal`,
`Drawer`, `Progress`, `Range` and `Toasts`.
Beyond item 7, this is what is missing, ordered by how much of it is a new architectural problem rather
than by how much markup it is.

**This list cannot be inferred from the Playground**, and reading it as the evidence for what is missing
is the trap: every control on every page and in every props panel is now a library control, so the
Playground has nothing left to say about what the library lacks.

### Structure

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

## 9. Machinery those controls need, none of which exists

Grouped here because each one is shared by several of the controls in items 7 and 8, and because building
any of those without first deciding these would bake the decision in by accident.

- **Pointer drag capture, and pointer geometry in the flags contract.** Item 2 records that
  `renderContent`/`renderDecoration` receive state and never events or pointer position. `Range` cannot
  be built without it, so the opt-in design that item asks for has to be settled first.
- **Masking and formatting.** `TextSync` handles a setter that transforms or refuses while preserving
  the caret. A mask is more: the caret must skip literal characters, and a formatted number or date has
  a display form and a value form that are not the same string.
- **Virtualization.** Already recorded as a `Select` loose end in item 5; `Tree` and any grid need the
  same thing, so it is an `Abstract`, not a per-control feature.
- **The form story is decided and wired.** `Form` and `FormField` ship and every control reads the
  description context; see `conventions.md`. What is still unbuilt is smaller: nothing groups fields into
  sections with their own validity, and `hasSubmitted` is exposed but no control uses it to hold its error
  back until the first attempt.
- **The `Signal` mirror is now `Abstracts/SignalMirror`**, taking a getter and a setter so a consumer
  without a signal is served too; see `conventions.md`. What remains is that no library control accepts
  the getter-plus-setter pair directly — a consumer still wraps it in a mirror to hand a control its
  `*Signal`, which is one indirection rather than none.

---

## 10. What the verification suite still cannot see

`e2e/` drives real clicks and keystrokes in a real browser through Playwright, and `npm run verify:dom`
runs it. What is worth stating is the shape of its blind spots, because a green run reads as broader
coverage than it is.

**Nothing checks appearance.** The suite reads the DOM, so the parity rule that forced
`aria-disabled`-everywhere — that disabled and disabled-but-reachable must look _identical_ — is still
only ever checked by eye. Playwright can compare screenshots, so this is now a decision rather than a
limit: what wants settling first is whether a committed baseline image is wanted in this repo at all,
given every painter lives in the Playground and a deliberate restyle would then have to re-bless the
baselines.

**Three components have a Playground page and no spec driving it**: `CellAnimation`,
`ScanlineAnimation` and `ScreenWiper`. All three are the hard case rather than the neglected one — what
they produce is motion over time, so a DOM-reading spec over them would assert structure and call it
coverage. What would actually cover them is the screenshot decision above, and nothing else will.

**`ImageSwitcher` also has a page and no spec, but it is not that hard case.** Only the fade itself
needs pixels; everything the component decides is in the DOM, because the two `<img>` elements carry
the swap. A spec driving `/image-switcher` could assert that a new `src` is preloaded before either
element changes, that the outgoing image stays mounted at `opacity: 0` rather than being torn out, that
a `src` which fails to load still swaps, and that `onLoad` fires for a real image and not for a missing
one. That is most of the contract, and it needs no baseline images.

**Components with no Playground page at all**, so nothing can drive them until one exists:
`AudioSwitcher` and `RichText`, both commented out of `TAB_CONFIGS` in
`src/Playground/App/App.tsx`.

**Covered only through a consumer**, which is worth distinguishing from uncovered because it decides
whether a spec is worth writing: `Popover` through `Select` and `Menu`, `Radio` through
`radioGroup.spec.ts`, `Checkbox` through `binarySwitch.spec.ts`, `MultiSelect` through
`select.spec.ts`, `Corners` and `Viewport` through whatever page happens to mount them,
`InteractionWrapper` through every control. The `Tabs` spec covers its keyboard walk through the
Playground's left menu and nothing else, so its floater and its `href` / `linkComponent` split are
still uncovered.

**Every rAF consumer but `ElementFader` hangs on a frame with no fallback.**
`ElementObserver.createViewportRectObserver`, and through it `Anchor`, `Tooltip` and `Select`'s
positioning, would leave a popup anchored to where its field used to be on a page that stopped painting.
`ElementFader` was given a fallback timer because a state machine that stops advancing is a bug; whether
a positioner that stops updating when nothing is painting is also a bug is undecided. This used to be
observable through the old suite, whose headless mode stopped producing frames; Playwright does not
stall that way, so the question is now purely about the components and nothing in the suite will surface
it.

---

## 11. The SVG defs' geometry cannot be reached without rendering

`SVGPatternDefsUtils` is 321 lines of tiling arithmetic — the row and column offsets that make a grid, a
diagonal, a half-drop, a triangle and two hex packings line up — and every one of those `compute*`
functions returns a `<pattern>` element with the arithmetic written inline in the callback that places
each cell. `SVGGradientDefsUtils` has the same shape, and the part of it most worth testing,
`resolveStops`, is module-private: it interpolates the offset of every colour that was not given an
explicit stop, and getting it wrong shifts a gradient rather than breaking it. `SVGAnimationUtils` is
318 more lines of the same.

None of it is reachable from `npm test`, which calls functions and reads values. Rendering it would need
a DOM environment, which _"Unit tests"_ in `conventions.md` argues against for everything else, and the
`e2e/` suite can only assert that a gradient exists in the defs — not that its third stop landed at 40%.

The decision is whether to separate the arithmetic from the markup: a `computeCellPositions` returning
an array of points, with the JSX builder consuming it. That is a real refactor of three files and it
should be taken once, for all three, rather than for whichever one next grows a bug. It is worth noting
that the packing offsets are exactly the kind of thing that is wrong by half a cell for months without
anyone noticing, because a wrong tiling still tiles.

---

## 12. Planned: strip `style.css`, add a theme, and add opinionated control presets

Recorded **2026-08-07** as advance notice, not as work to start. The user's plan, in three parts:

**Gut most of `style.css`, so anything that is not a library element stands out.** The Playground's
app-level stylesheet currently paints a lot that the library deliberately does not, which means a raw
element and a library control can look similar by accident. Removing it turns that into a visible
difference rather than a thing you have to know. Expect a period where the Playground looks broken in
places, and expect that to be the point.

Two things to watch, because they were argued into their current shape against this stylesheet and
lose their justification if it is not read carefully. The `!important` resets in `BinarySwitch.css.ts`,
`TextInput.css.ts` and `Range.css.ts` exist because element selectors like `input:not([type="range"])`
outrank a class — _"The library's own `!important` resets stay"_ in `conventions.md` argues they must
survive anyway, since the Playground is not the only consumer, so removing the stylesheet is **not**
evidence they can go. And `interactionRoot > * { margin: 0 !important }` guards against a painter's
margin now, not only the app's.

**A theme file.** No shape decided. The library paints nothing and holds no colours, so a theme is
entirely a consumer-side artifact; the current `--clr-*` / `--shd-*` / `--anim-duration` custom
properties in the Playground are the de facto one.

**A more final-consumer-like layer of controls — `MyButton` and friends — that trade API surface for
decided behaviour.** The stated example: no `renderContent` tooltip renderer, just tooltip content as
a string. This is the opposite direction from every argument recorded in `conventions.md` about slots
and flags, and deliberately so: those arguments are about what a **library** owes a consumer who has
not been met yet, and this layer is what a consumer who has been met actually writes. Worth knowing
because a narrowing that is correct here would be wrong one level down, and the two layers will sit in
the same repo.

The open question, when it starts: whether this layer lives in `src/Playground` as the demo it
currently is, or becomes a second published entry point. That decides whether it needs a support
contract, which decides everything else about it.

---

## 13. `Toasts` — six things deliberately not built

The decisions behind what exists are in `conventions.md` under the two `Toasts` headings. These are the
gaps, each with the reason it is still a gap.

- **Urgency is per region, not per toast.** One region carries one `aria-live` politeness, so an error
  cannot be assertive while a confirmation stays polite. A consumer needing both mounts two `Toasts` with
  two queues, which is the honest answer — nesting an assertive announcement inside a polite region is
  not reliably handled. Making it a record field would mean either two regions the component owns
  privately or moving a live region per entry, which announces on every re-render.
- **There is no keyboard route into the stack.** The published pattern gives one (`F6` to jump to the
  notification region and back). What exists instead is that auto-dismiss is held while anything inside
  the region has focus, which covers the hazard that actually bites — a toast cannot vanish out from
  under the button someone is reaching for — but a keyboard user cannot get to a toast they have not
  tabbed into by accident.
- **A pile cannot overlap by measured height.** `index` and `count` are enough for a fixed peek
  distance, but a painter that wants each card offset by the height of the one in front of it needs its
  neighbours' measured heights and can only measure itself. That is the same measuring `Abstract` item 9
  wants for auto-height animation, from a different direction.
- **Nothing pauses when the tab is hidden.** Timers still run in a background tab, so a burst raised
  while the tab is not being looked at will have expired by the time it is. `visibilitychange` would fix
  it in a handful of lines; whether that is wanted is a product decision rather than a correctness one,
  which is why it is here rather than done.
- **No per-toast lifecycle callbacks.** `Modal` has `onShow` and `onHide`. Here the consumer owns the
  list, so an effect over their own signal sees every arrival and departure — but not the transition
  boundaries, which is what those callbacks actually report.
- **An id re-added while it is leaving fades back in** rather than restarting as a new entry, because the
  id never left the rendered list. It is the reasonable behaviour and it is not obvious, so it is written
  down rather than left to be rediscovered.

The pause arithmetic is also the one behaviour with no automated cover: `e2e/toasts.spec.ts` asserts that
the `isPaused` flag reaches the painter, which is what the DOM can show, but nothing checks that a toast
paused half way through actually gets its remaining half rather than a fresh full duration.

---

## 14. `Calendar` — six things deliberately not built

Item 8 covers the missing components. These are `Calendar`'s own gaps, each with the reason it is still
one. The decisions behind what exists are in `conventions.md` under _"Controls: `Calendar`, and the date
value the library owns"_.

- **One date, not a range.** `valueSignal` is `Signal<DateValue | undefined>`. A range needs two ends,
  a partially-entered state while the first end is picked, and `isInRange` / `isRangeStart` /
  `isRangeEnd` on the flags. Whether that is a second component or a widened value is the decision, and
  it should be made with `DatePicker` in view rather than for `Calendar` alone.
- **No month or year jump.** Paging is a month at a time, by the consumer's own buttons or by
  `PageUp`/`PageDown`. Jumping to an arbitrary month or year wants a `Select` inside the consumer's
  header, which works today, or `Shift+PageUp`/`Shift+PageDown` for a year — the published pattern's
  binding, deliberately not added because nothing asked for it.
- **No week numbers and no multi-month view.** Both are extra columns or extra grids around the same
  `DateValueUtils.getMonthGrid`, so neither needs new library machinery; they need a decision about
  whether `Calendar` grows a mode or a consumer composes two of them.
- **The disabled predicate runs per cell per render.** `computeIsDayDisabled` is called for each of the
  42 cells inside a reactive read, so a consumer whose predicate hits a network cache will do it 42
  times a month change. Memoising is the consumer's to do today; whether the library should batch it
  into one call per grid is open.
- **42 `InteractionWrapper`s per month is the cost of consistency, and it is unmeasured.** Every cell is
  a full wrapper so a day gets hover, focus, disabled and tooltip handling like every other control.
  Nothing has been profiled; a multi-month view is where this would first hurt.
- **Nothing announces the month change.** Paging swaps 42 cells with no live region, so a screen reader
  user who pages hears nothing until they move the focus. The published pattern puts the month title in
  a live region, and the title is the consumer's markup here, so the fix is either a documented
  instruction to them or a library-owned announcer.

---

## 15. `ColorInput` — four things deliberately not built

`ColorInput` is the custom picker now; the decisions are in `conventions.md` under the `ColorArea` heading.
These are the gaps.

- **No native colour input anywhere, so no form value and no OS picker.** Deliberate, and the cost of
  owning the surface. A consumer who wants the OS dialog has nothing to fall back on.
- **Alpha is expressible but has no control of its own.** The value carries it and the surface preserves
  it, but nothing in the library sets it — an alpha slider would be a second `Range` over a checkerboard,
  and the Playground's channel inputs are currently the only way to reach it.
- **No eyedropper, no swatch presets, no recent colours.** All three are paint plus a value write, so all
  three are the consumer's today; whether presets deserve a `renderPresets` slot depends on whether the
  keyboard order should include them, which is a real question and not a styling one.
- **The popup's dismissal is per-consumer.** `ColorInput` now runs its own outside-click listener, which
  means `Select`, `Menu` and it have three different dismissal stories. That is the `openSignal` question
  items 5 and 6 record, and it should be settled once across all three rather than a fourth time.

---

## 16. `Accordion` — four things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Accordion`, and where
auto-height measurement lives"_.

- **A collapsed panel's content is still built.** `inert` plus a zero height is what makes the panel
  measurable and animatable, so an accordion of a hundred expensive panels builds all hundred. A
  `getIsLazy` that withholds the panel until first expansion would cost the open animation on that first
  expansion, since there would be nothing to measure yet.
- **Nothing scrolls a newly opened section into view.** Opening the last section of a long list animates
  it open below the fold. `Select`'s option does this for itself off its own `isHighlighted` flag; here
  it would have to happen when the transition finishes rather than when it starts, so it needs the
  fader's completion rather than its target.
- **The height animates, and nothing else can.** A consumer wanting the panel to slide in from the side
  gets it from `renderPanel`'s visibility target, but the panel box itself only ever animates `height`.
  Animating width instead — a horizontal accordion — would need the observer's twin and a direction prop.
- **No single-expand guarantee that at least one stays open.** `getIsSingleExpand` allows zero expanded,
  since clicking the open header closes it. An "always exactly one" mode is a third state for that prop
  rather than a boolean, and no consumer has asked.

---
