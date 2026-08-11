# Lib code review

Outstanding work in `src/Lib` — bugs, code and architectural smells, missing implementation, pending
decisions. Nothing else belongs here. Once an item is done or dropped it is deleted outright rather
than marked resolved, and the remaining items are renumbered to stay contiguous from 1. If closing it
settled a decision that drives future work, that decision moves to `conventions.md`; the record of
having done the work does not go anywhere.

Most items now carry an **_Elsewhere_** block: what other component libraries do about the same
question, read off their own documentation and source on **2026-08-10**. It is evidence for decisions
that have not been taken — not a recommendation, and not a decision. Where a published answer
contradicts something already settled in `conventions.md`, the settled entry stands until someone
argues it down; where it names a mechanism this repo had not considered, that is the part worth
reading.

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
13. `Toasts` — five things deliberately not built — _open_
14. `Calendar` — five things deliberately not built — _open_
15. `ColorInput` — four things deliberately not built — _open_
16. `Accordion` — four things deliberately not built — _open_

### Build order

Covers the unbuilt controls in items 7 to 9. The ordering principle is **how much of the existing base
a thing reuses**: anything that is a preset or a composition of what already works comes before anything
that needs a new primitive, and anything blocked on an architectural decision comes last, so the
decision is made once with several consumers in view rather than inferred from the first one.

**Blocked on a primitive that has to be designed first.** Do not start these by inventing the primitive
privately inside them.

1. **The mask ships, `DateInput` reads any of three orders and `TimeInput` reads a 12-hour clock**; see
   `conventions.md`. Nothing here is blocked on a primitive any more. What is left is the formatted number,
   which needs a growing group count rather than a fixed pattern, and the field shape `DateInput` and
   `TimeInput` still duplicate — both unblocked, and neither waiting on the other. See item 7.
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

**_Elsewhere._** A positioned one-shot effect arrives as an event everywhere, never as state. MUI's
button ripple is handed the pointer event itself — the ripple component exposes `start(event)` and
`stop()`, reads the coordinates off the event, and takes a `center` prop for the case where the origin
should be ignored — so what the paint layer receives is the event, not a flag. Radix and React Aria
ship no ripple at all: pressed-ness arrives as data (`data-pressed`, `isPressed`) and anything
positional is the consumer's, which is where this library already stands.

Worth knowing before the flag is designed: MUI's ripple has a long-standing bug (mui#22068) where the
origin lands in the wrong place under an ancestor `transform: scale()`, because pointer coordinates and
`getBoundingClientRect` are being mixed. `trackDrag` reports a ratio of two same-space measurements and
cannot express that failure, so a flag carrying the last activation ratio inherits the immunity rather
than having to earn it again.

---

## 3. Neither animation component can paint its own background

Both require a `getSrc` and slice that image. The React-era component could instead fill each cell
with `currentColor` over its own children, which is what made a reveal-over-content effect possible —
an animated button, a wipe over a card. Adding it means a children slot and a size anchor that is not
an `<img>`, so the sizing path would diverge from `ScanlineAnimation`'s unless both change together.
Worth deciding once, for both.

**_Elsewhere._** There is nothing to compare against, and that is the finding: no headless library
ships anything in this family. Ark UI's set is the widest of them at forty-seven components and has no
cell, scanline or wipe animation; Radix and React Aria own no animation component at all. What the
motion libraries do instead is animate a property over whatever children they were handed, with no
source image anywhere in the contract — which is the arrangement this item is asking for rather than
the one both components have.

---

## 4. Cell animation timing is linear-only

`computeLocalTimeline` maps the timeline linearly and `sampleTrack` interpolates linearly between
stops, so nothing can ease. The React-era component took a timing function per keyframe
(`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`) and applied it to each cell's playback.

Restoring it is an easing function applied to the local timeline before the stops are sampled, and
needs nothing outside the samples file.

**_Elsewhere._** Per-keyframe easing is what CSS itself does: a timing function stated on a keyframe
applies from that keyframe until the next one mentioning the same property, which is the model the
React-era component copied. Motion and GSAP both take one easing per segment of a keyframe list, and
the Web Animations API takes one per keyframe object.

The part worth knowing is `linear()`, which has been Baseline since December 2023: it defines a curve
as a plain list of output values that the engine interpolates linearly between, and values outside
0..1 overshoot, which is how bounces are written. That is the shape `sampleTrack` already has, so an
eased track is expressible as denser stops in the data rather than as an easing function in the
sampler — the same result reached from the other end.

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

**_Elsewhere._** Checked against Radix, React Aria and Kobalte, which is the SolidJS one.

- **Typeahead is a string per option in all three, and two of them derive it rather than asking.**
  Radix's `Select.Item` takes an optional `textValue`, and when it is absent typeahead uses the item's
  own rendered text content. React Aria's list items take `textValue` and require it only when the
  children are not plain text. Kobalte takes `optionTextValue`, a field name or getter on the option
  record, documented as being for typeahead. So the "second source for text the painter already
  renders" is what two of them avoid by reading the rendered text back out of the element — and the
  option element is the library's here, so its `textContent` is reachable without a prop.
- **A filterable list is a separate component everywhere.** Radix has no autocomplete primitive at all,
  so the injected-non-matching-option case cannot arise there; and where a library does own the filter
  it necessarily knows which options matched, which is the knowledge this design trades away by
  choice.
- **Tri-state is a string, and it is the same string.** MUI's tree view reports `"selected"`,
  `"indeterminate"` or `"unselected"` per item; Ant Design's tree carries a `halfChecked` list beside
  its checked one. `CheckedState` is already that shape, which supports the note that this is the one
  place two controls might share a type.
- **The group box is styleable everywhere else because everything is styleable everywhere else.**
  Radix's `Select.Group` and React Aria's `Section` are library elements that carry the role and accept
  the consumer's class name; neither hands over a thunk. That route is closed here by the rule that the
  library accepts no class names, so the thunk really is the only shape left — worth stating, because
  from outside the omission reads as an oversight rather than a consequence.
- **Virtualization is nobody's library code.** Kobalte's select has a `virtualized` boolean and a docs
  example handing the list to `@tanstack/solid-virtual` with a hundred thousand options; React Aria has
  a `Virtualizer` wrapper; Radix has neither, and its docs cover long lists only with scroll buttons.
  So the seam is a flag plus a documented integration rather than an `Abstract`, and the flag exists
  precisely so the library stops managing its own scrolling — which is the loose end this bullet names.
- **Open state is controlled-or-uncontrolled in all three**, under the same three names: `open`,
  `defaultOpen`, `onOpenChange`. The consumer can always close it programmatically and the library
  still owns the default.

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

**_Elsewhere._**

- **Groups, separators and stateful items all live inside the menu component.** Radix ships `Group`,
  `Label` and `Separator`, plus `CheckboxItem` and `RadioGroup` / `RadioItem`. So the last bullet's
  question is answered there by keeping a stateful menu in the menu rather than pointing at the select.
- **Nothing does the `Tab` behaviour APG asks for.** Radix's menu does nothing at all on `Tab`, and
  that is filed against it as a spec-compliance bug (radix#1934) which is still open. Closing and
  returning focus to the trigger is therefore ahead of the field rather than behind it.
- **Right-click is a separate opener, never a separate menu.** Radix ships a whole `ContextMenu`
  component with the same menu inside it; Ark UI and Zag instead add a `ContextTrigger` part to the
  same menu, and open it on a roughly 700ms long press when the pointer is pen or touch. Both keep one
  menu and vary the opener, which is what an anchor plus an open state would buy here.

---

## 7. What the date and time family still lacks

`Calendar`, `DateInput`, `DatePicker` and `TimeInput` ship, over `Abstracts/DateValue` and
`Abstracts/TimeValue`. The decisions are in `conventions.md`. What is left, in the order it would be worth
doing:

- **The mask ships, and the 12-hour clock turned out not to need it.** `TextSyncUtils.applyMask`,
  `DateInput`'s `getFormat` and `TimeInput`'s `getIsTwelveHour` are all in `conventions.md`: the meridiem is
  a control in the trailing slot, so the pattern stayed digits-only and the non-digit slot this bullet
  predicted was never built. What is left is the **formatted number**, which is the one consumer that does
  need the pattern to change — thousands separators mean a group count that grows with the value rather than
  a fixed run of slots, and that is a different function rather than a longer pattern. `TimeInput` adopted
  the mask on 2026-08-11 and `TextSyncUtils` therefore has its second consumer, so whether it should be
  exported for a consumer building their own masked field is now a live question rather than a deferred one.
  **A second consumer of the non-digit slot arrived the same day**: a year before the common era now stores,
  computes and displays correctly and is written `-000044-08-15`, but `DateInput` cannot type one, because
  the sign is not a digit and the mask discards everything that is not. So the missing primitive blocks two
  things rather than one, which is an argument for building it rather than a new requirement on top of it.
- **No time popup.** A list of times in a `Popover` is a `Select` over generated options; whether that
  belongs inside `TimeInput` as a mode or beside it as a `TimePicker` is the decision, and it should be
  taken with the `openSignal` question below rather than separately. Note the trailing slot is now spoken
  for on a 12-hour field, so a picker trigger and an am/pm control would have to share it — which is what
  that slot taking `(getFlags, meridiem)` already allows, since the painter draws both or neither.
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

**_Elsewhere._**

- **Nobody masks a date field.** React Aria renders one focusable, editable segment per unit — each a
  spin button in its own right — and says so as the point of the design: any locale order, in any
  calendar system, _without_ a browser input mask. MUI moved to the same shape in v7, replacing the
  single `<input>` with a list of sections (`PickersSectionList`, behind an
  `enableAccessibleFieldDOMStructure` prop) so that ARIA attributes can sit on each section
  individually. An element per segment does not solve the display-form-versus-value-form problem; it
  makes it not arise, because there is no single string to be in two forms. That is a different
  primitive from the one this item plans, and `TimeInput`'s caret arithmetic is the single-input
  version of the same idea.
- **The mask primitive is real, just not for dates.** MUI's text-field docs cover formatting only by
  swapping the inner input for a third-party one — `react-imask`, `react-number-format` — which is
  where the formatted-number half of this would land, and it is a dependency rather than a component
  everywhere it appears.
- **A time popup is a separate component beside the field, and it is a list.** MUI's `TimePicker`
  composes a `TimeField` for typing with a `DigitalClock` for pointing, which its docs describe as
  behaving like a select over generated times; it swaps in a `MultiSectionDigitalClock` — a column per
  unit — when the granularity is finer, and an analogue `TimeClock` on mobile. The guess in this bullet
  is what `DigitalClock` is.
- **Date-and-time is one value whose _type_ carries the answer.** React Aria has `CalendarDate`,
  `CalendarDateTime` and `ZonedDateTime`, and a `granularity` prop choosing the smallest unit shown —
  defaulting to day for a date and minute for a date-time. One field component reads all three, so the
  pair is never two signals and never a `{ date, time }` record either.
- **Ranges go both ways, and both ship.** React Aria makes it a second component (`RangeCalendar`,
  `DateRangePicker`) over a `{ start, end }` value — the field names `conventions.md` already chose for
  `Range`. react-day-picker makes it a mode on the same component (`mode="range"`, a `{ from, to }`
  value) and carries the awkward case as a prop: `excludeDisabled` decides whether a disabled day
  inside the span breaks it.

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

**_Elsewhere._** Ark UI's set is the widest of the headless libraries and is the most useful scope check
available: it has a tree view, a pagination component, a **segment group** — a segmented control as its
own component, distinct from both tabs and toggle group — and a `Field` plus a `Fieldset`. It has no
table and no data grid. TanStack Table is what that gap gets filled with, and it is a separate project
with its own release cycle, which is this item's call arrived at independently.

- **The segmented control is a toggle group in the unstyled layer and a named component in the styled
  one.** Radix has `ToggleGroup` (roving tab order, single or multiple pressed) and React Aria has
  `ToggleButtonGroup`; Radix _Themes_ then ships a `SegmentedControl` on top of the first. React Aria's
  own guidance in discussion is that a radio group is the right answer when only single selection is
  needed — which is what this item says, from the library that would benefit from saying otherwise.
- **Breadcrumbs is owned by at least one of them:** React Aria ships `Breadcrumbs`.
- **Pagination is owned because it is arithmetic, not paint.** Ark UI's takes `page`, `pageSize`,
  `count`, `siblingCount` and `boundaryCount`, computes the visible page range and where the gaps fall,
  and switches between buttons and links with a `type` prop. That is more than a composition of
  `Button`, and it is the one entry in this item's "compositions" list where the claim is weakest.
- **One of the four "pure paint" components turns out to have behaviour.** Radix ships `Avatar`, and the
  image is the reason: `Avatar.Image` plus `Avatar.Fallback` with a `delayMs`, so the fallback does not
  flash while a cached image loads. That is a load state machine, and it is the argument
  `ImageSwitcher` already makes here.

---

## 9. Machinery those controls need, none of which exists

Grouped here because each one is shared by several of the controls in items 7 and 8, and because building
any of those without first deciding these would bake the decision in by accident.

- **Pointer drag capture, and pointer geometry in the flags contract.** Item 2 records that
  `renderContent`/`renderDecoration` receive state and never events or pointer position. `Range` cannot
  be built without it, so the opt-in design that item asks for has to be settled first.
- **Masking and formatting** is built for digits and fixed groups — `TextSyncUtils.applyMask`, in
  `conventions.md`. What is not built is a slot that is not a digit (an am/pm segment) or a group count
  that grows with the value (thousands separators), so a 12-hour clock and a formatted number are both
  still waiting; see item 7.
- **Virtualization.** Already recorded as a `Select` loose end in item 5; `Tree` and any grid need the
  same thing, so it is an `Abstract`, not a per-control feature.
- **The form story is decided and wired.** `Form` and `FormField` ship and every control reads the
  description context; see `conventions.md`. What is still unbuilt is smaller: nothing groups fields into
  sections with their own validity, and `hasSubmitted` is exposed but no control uses it to hold its error
  back until the first attempt. Note that `DateInput` and `TimeInput` now raise `hasError` on their own,
  from their own text — so the first producer of that flag turned out to be a control rather than the form,
  and the two will have to agree once `hasSubmitted` starts gating anything.
- **Dismissal knows about nesting now, but still has no stack.** `DismissUtils.getIsWithinOwnedLayer` walks
  `aria-controls` so a popup opened from inside another popup no longer reads as outside it; see
  `conventions.md`. What is still missing is the ordered set of open layers, which is what decides _which_
  layer a stray press closes when several are open. `ColorInput` still runs its own listener and should move
  onto the shared one when that is built.
- **The `Signal` mirror is now `Abstracts/SignalMirror`**, taking a getter and a setter so a consumer
  without a signal is served too; see `conventions.md`. What remains is that no library control accepts
  the getter-plus-setter pair directly — a consumer still wraps it in a mirror to hand a control its
  `*Signal`, which is one indirection rather than none.

**_Elsewhere._**

- **Pointer geometry** — see item 2.
- **Masking and formatting** — see item 7. No component library owns a mask: the mask implementations
  are their own packages and get integrated per field.
- **Virtualization** — see item 5. `@tanstack/virtual` is the shared dependency across libraries and
  frameworks; React Aria's `Virtualizer` is the only in-library one found.
- **A field group is a real `<fieldset>` that broadcasts downward, not one that collects upward.** Ark
  UI's `Fieldset` renders `<fieldset>` plus `<legend>` with helper-text and error-text parts, and its
  `invalid` and `disabled` are props the consumer sets which then reach every field inside through
  context. Nothing aggregates the contained fields' own validity. That is the opposite direction from
  `Form`'s registration, and the two do not conflict — one distributes state, the other collects it, and
  a section with its own validity wants both halves.
- **"Errors only after the first attempt" is two flags, not one.** React Hook Form validates on submit
  by default, and the per-field gate people actually write is `touchedFields[name] || isSubmitted` —
  the field's own touched flag or the form's submitted flag. So `hasSubmitted` is half of the published
  shape and the missing half is per-field, which no control here tracks.
- **Every library takes a getter plus a callback, including the SolidJS one.** Radix, Ark UI and Kobalte
  all expose a controlled value, a change callback and an uncontrolled default; Kobalte could have taken
  signal pairs in Solid and did not. Recorded as what the field does, not as an argument against
  `*Signal` — the trade `conventions.md` states (one variable, both sides write, no handler to forget)
  is untouched by this, and `SignalMirror` is what serves the other kind of consumer.

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

**`ImageSwitcher`'s one remaining hole is `onLoad`, and the page is why.** The rest of the contract is
now driven — the pair staying mounted, the preload finishing before either element changes, a failed
source swapping anyway, the empty case, and the duration reaching both elements. `onLoad` cannot be
reached because `ImageSwitcherPage` passes no handler, so covering it means the page growing a readout
first. Worth stating as a shape rather than as one gap: a callback nothing on the page consumes is
invisible to a suite that drives the page, and `onMount` handoffs are in the same position.

**Components with no Playground page at all**, so nothing can drive them until one exists:
`AudioSwitcher` and `RichText`, both commented out of `TAB_CONFIGS` in
`src/Playground/App/App.tsx`.

**`tabs.spec.ts` pins the left menu's contents by name, so changing what the Playground lists breaks it.**
It asserts the number of category headers and which entry `Home` and `End` land on — `CellAnimation` and
`Surface` today. That is not incidental: the left menu is the only real `Tabs` in the app, so it is the
only thing that can cover a column list with disabled headers, and covering it means naming what is in it.
The failure mode is worth knowing because it is silent about its real cause: adding a page, reordering the
categories, or hiding a section makes the `Tabs` **keyboard** spec fail, which reads as a regression in
`Tabs`. It has already happened once — the spec sat broken against a menu that had gained an `Exotics`
category and lost its `Composites` one.

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

**_Elsewhere_, on the baseline question.** There are two published arrangements and they differ on where
the image lives. Playwright's own screenshot assertion commits the baseline beside the spec, one file per
browser and platform, re-blessed with `--update-snapshots` — and its docs are explicit that rendering
varies with the host operating system, the browser build, headless mode, hardware and even whether the
machine is on battery, so a committed image is only stable in the environment that produced it. The
hosted services (Chromatic, Argos) keep baselines off the repo entirely and put the diff in the pull
request for approval, which is what libraries with a design system to protect generally use. Either way,
the re-blessing this item worries about is the routine operation rather than the exception — the
difference is whether it is a commit or an approval click.

**Time is no longer a blind spot, and the mechanism is worth knowing before the next timing bug.**
Playwright's clock API fakes `Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`,
`requestIdleCallback`, `performance` and `Event.timeStamp`, with `install`, `pauseAt`, `fastForward` and
`runFor`. `install` freezes time until it is advanced, so a duration becomes a stepped quantity rather
than a wait — which is what let the toast pause arithmetic be asserted at all, since the question is not
_whether_ four seconds elapse but _which_ four. `toasts.spec.ts` uses it in one describe block, and that
is the pattern for anything else of this shape: `ElementFader`'s 100ms fallback is still undriven, and so
is the paragraph above — stopping the frame supply is exactly what a frozen clock does to
`requestAnimationFrame`, so "is a positioner that stops updating when nothing is painting a bug" is now a
question a spec can put rather than an open one. What the clock does not reach is the three motion
components, whose time is CSS's rather than the page's.

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

**_Elsewhere._** The split this item describes is the standard arrangement in the one ecosystem that does
geometry at this scale: d3's arithmetic lives in modules that return numbers or strings — `d3-shape`
returns the `d` attribute, `d3-hierarchy` returns positions — and drawing is the caller's, which is the
only reason any of it is testable without a browser. The React chart libraries (visx, Recharts) wrap
those generators rather than re-deriving the geometry inside their JSX. So a `computeCellPositions`
returning an array of points is the conventional shape rather than a refactor invented here, and the
conventional shape is also the one that made the arithmetic outlive the renderer.

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

**_Elsewhere._** The two-layer arrangement is the norm, and in every case checked the layers are two
**published packages** rather than one package with two entry points: Radix Primitives under Radix
Themes, Base UI (by MUI's own team) under MUI's styled components, Ark UI under Park UI — which is now
inside the same organisation. shadcn/ui is the third answer and the interesting one, because nothing is
published at all: the styled source is copied into the consumer's repo, so the support-contract question
is settled by there not being one.

**The narrowing this item predicts is exactly where those layers draw the line.** Radix Themes' `Tooltip`
takes `content` as a required prop and wraps its child as the trigger; the primitive underneath makes you
compose a `Trigger` and a `Content`. So "no `renderContent` tooltip renderer, just tooltip content as a
string" is not a departure from how the industry splits these two layers — it is the split, stated in the
same example.

---

## 13. `Toasts` — five things deliberately not built

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
- **No per-toast lifecycle callbacks.** `Modal` has `onShow` and `onHide`. Here the consumer owns the
  list, so an effect over their own signal sees every arrival and departure — but not the transition
  boundaries, which is what those callbacks actually report.
- **An id re-added while it is leaving fades back in** rather than restarting as a new entry, because the
  id never left the rendered list. It is the reasonable behaviour and it is not obvious, so it is written
  down rather than left to be rediscovered.

A hidden tab now holds every countdown, so that gap is closed — see `conventions.md`, and note the signal is
`document.hidden` rather than window focus, which is the narrower of the two published choices. The pause
arithmetic is covered on a fake clock too, per item 10, so what is left in this item is the five gaps above
and nothing about verification.

**_Elsewhere._** Every bullet above has a published answer, and two of them are answers this item did not
have.

- **Per-toast urgency does not go through the region at all.** Radix announces through a throwaway
  element per toast: each one renders a visually-hidden node in its own portal, _outside_ the viewport
  region, with `role="status"` and `aria-live` set from that toast's own `type` — `foreground` becomes
  assertive, `background` becomes polite. The text is inserted after two animation frames so that NVDA
  picks it up, and the node is removed a second later. `role="status"` in both cases rather than
  `role="alert"`, to stop screen readers stuttering. That is a third option beside the two this bullet
  weighs: not two regions, and not a live region per mounted entry, but a live element that exists only
  for the length of one announcement — which also means the visible region carries no politeness at all.
- **The keyboard route is a hotkey, and it is `F8` rather than `F6`.** Radix's viewport takes a `hotkey`
  prop defaulting to `["F8"]`; from there it is `Tab` within the region and `Escape` on a focused toast.
- **Measured-height stacking is the container's job, and one library does exactly it.** sonner measures
  each toast with `getBoundingClientRect` and keeps the heights in the toaster, so an entry's offset is
  the gap times its index plus the sum of the heights in front of it; the collapsed pile also scales each
  card by `0.05 × index` and pads the shorter cards to the height of the front one so they stick out
  evenly. The neighbours' heights a painter cannot reach are held one level up — the same level `index`
  and `count` already come from.
- **Both mainstream toasts stop the clock when you look away.** sonner pauses while the document is
  hidden; Radix pauses on window `blur` alongside pointer and focus, which covers switching windows but
  not a hidden tab inside a focused window. So neither treats this as a product decision to be deferred —
  they both took it, by different events.
- **Why an entry left is reported as two callbacks rather than one field.** sonner gives each toast
  `onDismiss` and `onAutoClose`. That also answers the `conventions.md` note that nothing says why a
  toast is leaving: split the callback rather than widening the state a painter reads.
- **The pause arithmetic is the same arithmetic.** Radix subtracts elapsed from remaining on each pause,
  exactly as here — and per item 10, Playwright's clock API is what would let the remainder be asserted
  rather than eyeballed.

---

## 14. `Calendar` — five things deliberately not built

Item 8 covers the missing components. These are `Calendar`'s own gaps, each with the reason it is still
one. The decisions behind what exists are in `conventions.md` under _"Controls: `Calendar`, and the date
value the library owns"_.

- **One date, not a range.** `valueSignal` is `Signal<DateValue | undefined>`. A range needs two ends,
  a partially-entered state while the first end is picked, and `isInRange` / `isRangeStart` /
  `isRangeEnd` on the flags. Whether that is a second component or a widened value is the decision, and
  it should be made with `DatePicker` in view rather than for `Calendar` alone.
- **The month and year jump exists, and `Shift+PageUp`/`Shift+PageDown` still does not.** The published
  pattern binds a year step to shifted page keys; `Calendar` handles the unshifted pair only, and nothing
  has asked for the other. Note that a keyboard year step is the one part of this a consumer cannot add
  from outside, since the grid owns its own `keydown` — unlike the caption, which turned out to need no
  library change at all (see `conventions.md`).
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

**_Elsewhere._**

- **A range is a second component or a mode, and both ship** — see item 7. React Aria has a separate
  `RangeCalendar`; react-day-picker has `mode="range"` on the same component.
- **Month and year jumping is a caption layout, not a keyboard shortcut.** react-day-picker's
  `captionLayout` takes `"dropdown"`, `"dropdown-months"` or `"dropdown-years"`, with `startMonth` and
  `endMonth` bounding the lists and defaulting to a hundred years back. Selects inside the header are
  what everyone ships; `Shift+PageUp` is nobody's headline feature, which supports leaving it out.
- **Week numbers and multiple months are props on the same component**, not a second one:
  `showWeekNumber` and `numberOfMonths`, plus a callback for a click on the week number itself.
- **The per-cell predicate is answered by widening the input rather than memoising the call.**
  react-day-picker's `disabled` accepts a matcher or an array of them — a single date, an interval, a
  day-of-week set, a before/after bound — and a function is only one of the accepted forms. So the
  common cases never call anything forty-two times, and the expensive form is visibly the expensive one.
- **The month announcement belongs to a shared announcer that is nobody's component.** React Aria
  announces a visible-range change through `@react-aria/live-announcer`: a live region created on first
  use, appended outside the component tree, with the message cleared after a timeout. It is the same
  mechanism as Radix's per-toast announce in item 13, and it is a third option beside the two this bullet
  lists — the announcer belongs to neither the consumer's title nor the calendar.
- **One real focusable element per day is normal**, so forty-two of something is not itself the anomaly:
  react-day-picker renders a `<button>` per day and MUI a day component per day. What is unmeasured here
  is this wrapper's own cost, not the count.

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

**_Elsewhere._**

- **Owning the surface is the mainstream trade.** React Aria's colour suite — `ColorArea`,
  `ColorSlider`, `ColorWheel`, `ColorField`, `ColorSwatch` and `ColorSwatchPicker`, synchronised by a
  `ColorPicker` around one colour value object — has no native `<input type="color">` path either, and
  Ark UI's is custom too. Nobody keeps the OS dialog as a fallback, so the cost recorded in the first
  bullet is the cost everyone pays.
- **Alpha is a second slider over the same value.** React Aria's `ColorSlider` takes `channel="alpha"`,
  which is the shape this bullet predicts, and its colour value carries alpha throughout rather than
  only in a hex string.
- **The eyedropper is absent because the platform is.** `EyeDropper` is Chromium-only — MDN lists it as
  limited availability and not Baseline, needing a secure context and a user gesture, shipped in Chrome
  95 and unsupported in Firefox and Safari — and React Aria's colour documentation shows no eyedropper
  at all. There is nothing to copy here, and a library-owned one would be a Chrome-only prop.
- **Presets are a component, which settles the keyboard question this bullet raises.** React Aria's
  `ColorSwatchPicker` is a focusable, arrow-navigable set of swatches. So the published answer is yes:
  presets are part of the keyboard order and the library owns that order.
- **Dismissal is one mechanism for every layer, and it is a document listener plus a stack.** Radix's
  `DismissableLayer` keeps every open layer in an ordered set; on a pointer press each layer marks
  itself during the capture phase if the press began inside it, and on the bubble phase only the topmost
  layer that was pressed outside dismisses. `onPointerDownOutside` and `onFocusOutside` are both
  cancellable by the consumer. One implementation serves select, menu, popover, dialog and colour picker
  together, which is the "settle it once" this bullet asks for — and it is worth noting that it answers
  the question as a **mechanism** before it answers it as an `openSignal`: the ordered stack is what
  stops an inner popup's press from closing the dialog around it, and that is the part four separate
  listeners cannot get right.

---

## 16. `Accordion` — four things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Accordion`, and where
auto-height measurement lives"_.

- **A collapsed panel's content is still built.** `inert` plus a zero height is what makes the panel
  measurable and animatable, so an accordion of a hundred expensive panels builds all hundred. A
  `getIsLazy` that withholds the panel until first expansion would cost the open animation on that first
  expansion, since there would be nothing to measure yet. This now belongs to `Collapsible` rather than to
  `Accordion` — see `conventions.md` — so whatever is decided lands in one place for both.
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

**_Elsewhere._**

- **The published trade is the opposite one: unmount, and measure in a pass.** Radix's accordion unmounts
  collapsed content unless `forceMount` is set, and publishes `--radix-accordion-content-height` from its
  own measurement so that CSS can animate to a pixel value. React Aria's `DisclosureGroup` keeps the panel
  in the DOM but uses `hidden="until-found"` where supported, so find-in-page can reveal a collapsed
  section. Both keep the measurement library-side and differ only on whether the content stays built, so
  a `getIsLazy` here would land in Radix's position — animation cost on first expansion included — rather
  than somewhere new.
- **Nobody scrolls a newly opened section into view.** It is an open feature request against Base UI
  (#4173) and against MUI's own accordion (#40625), and the recipe everywhere is `scrollIntoView` once
  the transition has ended — which is exactly the completion signal this bullet identifies as the missing
  piece. So the gap is shared rather than peculiar, and the shape of the fix is agreed on.
- **A horizontal accordion is an `orientation` prop plus a second CSS variable.** Radix's
  `orientation="horizontal"` swaps the arrow-key axis and exposes the content _width_ beside the height,
  which is the direction prop this bullet describes, with the measurement doubled rather than generalised.
- **"Always exactly one open" is the default elsewhere, and the second state is a second boolean.**
  Radix's `type="single"` _requires_ one item to stay expanded; `collapsible`, default `false`, is what
  permits zero. So the mode this bullet says no consumer has asked for is what a Radix consumer gets
  unless they opt out — and it is spelled as a separate boolean rather than as a third state on the first
  prop.

---
