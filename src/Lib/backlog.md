# Lib backlog

Outstanding work in `src/Lib` — bugs, code and architectural smells, missing implementation, pending
decisions. Nothing else belongs here. Once an item is done or dropped it is deleted outright rather
than marked resolved, and the remaining items are renumbered to stay contiguous from 1.

**`brief.md` beside this file lists the same faults one line each, grouped by kind, and the two are
edited together.** Anything opened, closed or renumbered here is reflected there in the same change. If closing it
settled a decision that drives future work, that decision moves to `conventions.md`; the record of
having done the work does not go anywhere.

**Accepted limits are not outstanding work, and live in their own section at the end.** Asked for by the user
on **2026-08-11**: a fault that has been looked at and consciously left alone should not be re-read and
re-weighed every time the question is "what is left". They are unnumbered, they are not in the index, and a
report on the state of the library does not list them unless something has changed about one. Moving an item
there is a **decision the user takes**, not a way of retiring an item that has merely gone stale — an item
nobody has argued about is still open.

**Two sections at the end hold things that are not outstanding work, and neither is part of the answer to
"what is next".** **_Accepted limits_** is above; **_Open discussion_** is the second. Both are unnumbered and
neither is in the index. The difference is what they hold: an accepted limit is a real fault, consciously left
alone, and an open-discussion entry is an idea nobody has committed to building. Asked for by the user, so that
a sketch can be written down and argued over without ever competing with real work for attention.

Most items now carry an **_Elsewhere_** block: what other component libraries do about the same
question, read off their own documentation and source on **2026-08-10**. It is evidence for decisions
that have not been taken — not a recommendation, and not a decision. Where a published answer
contradicts something already settled in `conventions.md`, the settled entry stands until someone
argues it down; where it names a mechanism this repo had not considered, that is the part worth
reading.

### Index

1. One-shot positioned effects still have nowhere to go — _open_
2. Neither animation component can reveal its own children — _open_
3. `Select` — five things deliberately not built — _open_
4. `Menu` — three things deliberately not built — _open_
5. Other core controls the library does not have — _open, ordered by the user_
6. Machinery those controls need, none of which exists — _open_
7. What the verification suite still cannot see — _open_
8. Planned: a consumer-facing layer of controls above the library — _planned, not a focus_
9. `Toasts` — two things deliberately not built — _open_
10. `Calendar` — two things deliberately not built — _open_
11. `ColorInput` — two things deliberately not built — _open_
12. `Accordion` — two things deliberately not built — _open_
13. `Tabs` — a pairing the consumer can still skip — _open_
14. `Viewport` as a region: what is settled and what is not — _open_
15. `Tree` — three things deliberately not built, and one extraction to decide — _open_
16. `SlideButton` — three things deliberately not built — _open_
17. `Spotlight` — one thing deliberately not built — _open_
18. `Scroller` — four things deliberately not built — _open_
19. `Paginator` — four things deliberately not built — _open_
20. `Carousel` — four things deliberately not built — _open_
21. The four components ported from React — one thing to retest, one deliberately not built — _open_
22. `Typewriter` cannot render a blank line, and the fix is in `ss-utils` — _open_

### Build order

Covers the unbuilt controls in items 5 and 6. The ordering principle is **how much of the existing base
a thing reuses**: anything that is a preset or a composition of what already works comes before anything
that needs a new primitive, and anything blocked on an architectural decision comes last, so the
decision is made once with several consumers in view rather than inferred from the first one.

**Blocked on a primitive that has to be designed first.** Do not start these by inventing the primitive
privately inside them.

1. **Nothing is blocked on a primitive any more.** The date and time family was the last entry here: the mask
   covers fixed patterns and growing groups, `MaskedField` holds the shared field, `CurrencyInput` was the third
   consumer that proved the seam, and the range variants, the date-and-time value, the typed sign and the
   locale's own grouping have all since been built. See `conventions.md`; that item is closed.

**Out of the cost ordering, deliberately:**

- **The form story is settled and wired.** `Form` and `FormField` ship and every control reads the description
  context; see `conventions.md`. This entry used to say the opposite — that it was the one item whose cost
  _grew_ with delay, because every control built without it grew its own half of the error plumbing — and that
  cost has stopped growing. What is left of it in item 6 is one small piece, that nothing groups fields into
  sections with their own validity, and it carries none of the original urgency.
- **Dismissal, open state and openers are all settled.** All five layers dismiss through `DismissStack`, all
  five take a `visibilitySignal`, and `Menu` takes an anchor while `ContextMenu` opens at a point; see
  `conventions.md`. Nothing in this family is outstanding.
- **`Table` / data grid stays out of scope**, and specifically must not arrive as a by-product of
  `Tree` or of virtualization.

---

## 1. One-shot positioned effects still have nowhere to go

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

## 2. Neither animation component can reveal its own children

**The half this item used to be mostly about is closed.** A fill that is not a photograph — a gradient, a
solid, a pattern — is a source like any other: an SVG string as a `data:image/svg+xml,` URI, which the
component slices exactly as it slices a photograph. It needed one library fix, quoting the cell's background
URL, and no new machinery; see `conventions.md`. `Samples/SVGDefsSources` goes further and serialises
`Shape`'s own gradients and patterns into sources, so the two drawn examples pick from the same registry the
Shape page uses.

What is left is the other half. The React-era component could fill each cell over **its own children**, which
is what made a reveal-over-content effect possible — an animated button, a wipe over a card. The mechanism
that would be analogous to what the component does now is a copy of the content per cell, offset by minus its
own position and clipped by the cell box, so a slice flies as a unit the way an image slice does. That forces
three things: the content arrives as a render callback rather than a slot, since Solid children are real nodes
and cannot be placed in forty-two boxes at once; the content is built once per cell, forty-two times at the
default grid and a hundred and twenty-one in the stress case; and nothing inside can be interactive, because
every copy is a duplicate. **The user called that too costly.** A single copy with per-cell windows is not an
alternative — transforming a window moves the window over static content, which is a different effect.

**_Elsewhere._** There is nothing to compare against, and that is the finding: no headless library
ships anything in this family. Ark UI's set is the widest of them at forty-seven components and has no
cell, scanline or wipe animation; Radix and React Aria own no animation component at all. What the
motion libraries do instead is animate a property over whatever children they were handed, with no
source image anywhere in the contract — which is the arrangement this item is asking for rather than
the one both components have.

---

## 3. `Select` — five things deliberately not built

The decisions behind what exists are in `conventions.md` under the three `Select` headings. These are
the gaps, each with the reason it is still a gap.

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
- **What the stress variant reports is the cost of mounting options**, which is a separate cost from painting
  them. Windowing removed the mounting cost for lists that opt in; nothing addresses the painting half, and the
  cheap answer to it was `content-visibility` on the option paint, which is gone — see `conventions.md`.
- **Dismissal does not restore the query.** Escape and blur clear it rather than restoring the selected option's
  text, because restoring it would need the per-option string this design does not have. The open state itself is
  no longer private — `visibilitySignal` ships; see `conventions.md`.

**_Elsewhere._** Checked against Radix, React Aria and Kobalte, which is the SolidJS one.

- **Typeahead is a string per option in all three, and two of them derive it rather than asking.**
  Radix's `Select.Item` takes an optional `textValue`, and when it is absent typeahead uses the item's
  own rendered text content. React Aria's list items take `textValue` and require it only when the
  children are not plain text. Kobalte takes `optionTextValue`, a field name or getter on the option
  record, documented as being for typeahead. This is the reading that closed the gap: the option element
  is the library's here, so its text is reachable without a prop, and `computeCustomText` is the way out
  for the cases that need one. See `conventions.md`.
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

## 4. `Menu` — three things deliberately not built

The decisions behind what exists are in `conventions.md` under _"`Popover` extracted, and `Menu` as the
second consumer"_ and _"`Menu` submenus: a level per popup, focus moving between them"_. These are the
gaps, each with the reason it is still a gap.

- **There are no groups and no separators.** `SelectItem<T>`'s discriminated record would carry them
  unchanged, but a second copy of `getFlatOptions` plus `getItemOffsets` would come with it — and that
  is the duplication `NavigationUtils` deliberately did _not_ absorb, since it walks positions and has
  no opinion about what produced them. Flattening a nested list into a navigable one is now written twice —
  `SelectUtils.getFlatOptions` and `TreeUtils.getVisibleRows` — and whether the two become one is item 15.
  A consumer that needs sections today paints them into `renderPopup` around a flat list.
- **`Tab` closes the menu and returns focus to the trigger rather than moving past it.** APG says move
  to the next element after the trigger. The menu is portalled to the end of the document, so letting
  `Tab` through lands focus wherever the portal sits, which is worse than not moving. The cost is one
  extra `Tab`; fixing it properly means computing the trigger's next tab stop by hand.
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
  menu and vary the opener, which is the shape `ContextMenu` took here — see `conventions.md`. The long
  press for pen and touch is the half nobody has asked for yet: a `contextmenu` event is all that is
  listened for, so a touch device gets whatever its browser synthesises.

---

## 5. Other core controls the library does not have

`Fundamentals/Input` covers `TextInput`, `TextArea`, `NumberInput`, `CurrencyInput`, `Checkbox`, `Toggle`, `Radio`,
`RadioGroup`, `Select`, `MultiSelect`, `FileInput`, `ColorInput`, `Label`, `Calendar`, `DateInput`,
`DatePicker`, `TagInput` and `TimeInput`; `Fundamentals` adds `Accordion`, `Breadcrumbs`, `Button`, `Carousel`,
`SlideButton`, `Scroller`, `Paginator`, `SplitPane`, `Stepper`, `Tabs`, `Tooltip`, `Popover`, `Menu`, `Modal`, `Drawer`, `Progress`,
`Range`, `Toasts` and `Tree`.
Beyond the date and time family, this is what is missing. **The order below is the user's, taken on 2026-08-15 after reading a
worked example of each**, and it replaces the old ordering by architectural cost — that principle still
explains what a thing would need, but it no longer decides what comes first.

**This list cannot be inferred from the Playground**, and reading it as the evidence for what is missing
is the trap: every control on every page and in every props panel is now a library control, so the
Playground has nothing left to say about what the library lacks.

**What was dropped on 2026-08-15, so it is not re-proposed:** a toolbar, a segmented control, a rating input,
and the pure-paint family of `Skeleton`, `Avatar`, `Badge`, `Card` and `Icon`. The paint family was never a
component question — the Playground already builds three of them as `Surface` examples — and the toolbar was
judged not worth having. The segmented control and the rating are now the **Segmented** and **Rating**
variants on the Radio page, which is the whole of what each was; see `conventions.md`, which also records why
the rating's hover preview needed no library change. None of these is an accepted limit, because none is a
fault; they are simply not wanted.

### Next up, in the user's order

**Nothing is queued here.** `Stepper` was the last of them and shipped on **2026-08-15**.

**`Breadcrumbs`, `TagInput`, `SplitPane` and `Stepper` were all built on 2026-08-15** and are no longer here; their decisions are in
`conventions.md`. What each left behind as a gap is recorded there rather than reopened as an item: a
breadcrumb trail cannot collapse when it is too long, a tag input has no cap, no in-place editing, no
paste-a-delimited-list and no reordering, a split pane cannot collapse a pane or reset on a double-click, and a stepper draws no connector of its own
and does not enforce that a linear flow stays linear.

### Bottom of the list

Both placed last by the user on **2026-08-15**, after the difference between each and its nearest existing
control had been argued. Neither is dropped; neither is next.

- **`Table` / data grid.** Sorting, selection, column sizing, sticky headers and virtualization together are
  a project rather than a component, and it should not be started as a by-product of anything else.
- **A command palette.** Mostly assembled already — `Select`'s autocomplete inside a `Modal`, since typing to
  narrow a list is what the autocomplete does. What separates it from `Menu` is that it is opened by a
  shortcut rather than by a button, and holds every action in the application rather than the few that relate
  to one element. Two pieces are missing: results gathered from several sources and shown in labelled groups,
  which is the grouped-and-windowed case item 3 leaves open, and a document-level hotkey, which wants the
  register-and-stack shape `DismissStack` has rather than a listener per consumer.

**_Elsewhere._** Ark UI's set is the widest of the headless libraries and is the most useful scope check
available: it has a tree view, a pagination component, a **segment group** — a segmented control as its
own component, distinct from both tabs and toggle group — and a `Field` plus a `Fieldset`. It has no
table and no data grid. TanStack Table is what that gap gets filled with, and it is a separate project
with its own release cycle, which is this item's call arrived at independently.

- **Breadcrumbs is owned by at least one of them:** React Aria ships `Breadcrumbs`.
- **Pagination is owned because it is arithmetic, not paint.** Ark UI's takes `page`, `pageSize`,
  `count`, `siblingCount` and `boundaryCount`, computes the visible page range and where the gaps fall,
  and switches between buttons and links with a `type` prop. That is more than a composition of `Button`,
  which is the argument this item lost — `Paginator` is built, and where it departs from that shape is in
  `conventions.md`.
- **Worked examples of each, read on 2026-08-15**, which is what the user's ordering above was taken from:
  [TanStack Table](https://tanstack.com/table/latest/docs/overview),
  [React Aria Breadcrumbs](https://react-aria.adobe.com/Breadcrumbs/useBreadcrumbs.html),
  [Ark UI Segment Group](https://ark-ui.com/docs/components/segment-group),
  [Ark UI Splitter](https://ark-ui.com/docs/components/splitter),
  [cmdk](https://cmdk.paco.me),
  [Ark UI Tags Input](https://ark-ui.com/docs/components/tags-input),
  [Ark UI Rating Group](https://ark-ui.com/docs/components/rating-group) and
  [Ark UI Steps](https://ark-ui.com/docs/components/steps). Ark UI carries five of the eight, which is the
  scope check this item already leaned on. Two details from those pages are worth keeping: the splitter
  admits non-panel children such as toolbars and status bars inside its root, so it is not simply two boxes
  and a drag; and the tags input sets the mobile keyboard's Enter key to read "Done", which is the kind of
  thing only found by using one on a phone.

---

## 6. Machinery those controls need, none of which exists

Grouped here because each one is shared by several of the controls in item 5, and because building
any of those without first deciding these would bake the decision in by accident.

- **Pointer drag capture ships; one-shot pointer geometry does not.** `InteractionUtils.trackDrag` is in
  `conventions.md` and `Range` and `ColorArea` are both built over it, so nothing is blocked here any more. What is
  still missing is the origin of a **single activation** — see item 1, which also argues it is not worth building
  until something asks.
- **Masking and formatting is built, shared, and public.** `applyMask`, `applyGroupedMask` and
  `Abstracts/MaskedField` are all in `conventions.md`, with `DateInput`, `TimeInput` and `CurrencyInput` over
  them; a typed sign and a locale's own grouping are in it, and `TextSyncUtils` now leaves through `index.ts`.
  Nothing here is outstanding.
- **Virtualization is built, and both consumers it was made an `Abstract` for now use it.** `Abstracts/Virtualizer`
  wraps `@tanstack/solid-virtual`; `Select` windows a flat or a grouped list and `Tree` windows its flat walking
  order, each answering the `role="group"` question its own way; see `conventions.md`. Note that the on-demand loading that shipped for `Select` is
  **not** it and did not reduce the need for it — that answers a list which is incomplete, this one answers
  a list which is complete and large, and the two compose.
- **The form story is decided and wired.** `Form` and `FormField` ship and every control reads the
  description context; see `conventions.md`, which also records which errors wait for a submit and which
  do not. What is still unbuilt is smaller: nothing groups fields into sections with their own validity.
- **Dismissal is one stack, and paint order comes from the anchor.** `DismissStack` holds the open layers
  and `Popover` registers one, so all five controls dismiss through the same mechanism; a portalled layer's
  z-index is one above the highest on its anchor's ancestor chain, so a popup opened inside a `Modal` paints
  above it. Both are in `conventions.md`. Nothing here is outstanding.
- **The `Signal` mirror is now `Abstracts/SignalMirror`**, taking a getter and a setter so a consumer without a
  signal is served too, and `createOptional` beside it so a control's state can be private until a consumer asks
  for it; see `conventions.md`. What remains is that no library control accepts the getter-plus-setter pair
  directly — a consumer still wraps it in a mirror to hand a control its `*Signal`, which is one indirection
  rather than none.

**_Elsewhere._**

- **Pointer geometry** — see item 1.
- **Masking and formatting** — no component library owns a mask: the implementations are their own packages
  and get integrated per field, which is what made exporting this one worth doing. See `conventions.md`.
- **Virtualization** — see item 3. `@tanstack/virtual` is the shared dependency across libraries and
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

## 7. What the verification suite still cannot see

`e2e/` drives real clicks and keystrokes in a real browser through Playwright, and `npm run verify:dom`
runs it. What is worth stating is the shape of its blind spots, because a green run reads as broader
coverage than it is.

**Nothing checks appearance, and nothing will** — screenshot baselines are an accepted limit rather than a
pending decision; see the section at the end of this file. So the parity rule that forced
`aria-disabled`-everywhere — that disabled and disabled-but-reachable must look _identical_ — is checked by eye,
permanently, and the same goes for `CellAnimation`, `ScanlineAnimation` and `ScreenWiper`, which have a
Playground page and no spec because what they produce is motion over time. A DOM-reading spec over those three
would assert structure and call it coverage; nothing else here will reach them.

**A callback nothing on the page consumes is invisible to a suite that drives the page**, and `onMount`
handoffs are in the same position. `ImageSwitcher`'s `onLoad` was the standing example and is now covered —
the page grew a readout, `ExampleDefs` grew the optional `readout` field `VariantDefs` already had, and the
spec asserts both that a successful load is reported and that the two swap paths without one (a failed
source, a cleared source) report nothing. The shape is what to keep: reaching a callback means giving the
page a reason to consume it first.

**Components with no Playground page at all**, so nothing can drive them until one exists:
`AudioSwitcher` and `RichText`, both commented out of `TAB_CONFIGS` in
`src/Playground/App/App.tsx`. `AudioSwitcher` is the more exposed of the two: its play and pause moved from a
mount handle to a `playbackSignal` and that change has never been run, because there is nothing to run it. The
fades it drives are the part most likely to be wrong.

**Deprioritised by the user**, after being offered as the next piece of work and passed over. It stays here
because the exposure is real and unchanged; it is not next, and it is not to be proposed as next.

**Covered only through a consumer**, which is worth distinguishing from uncovered because it decides
whether a spec is worth writing: `Popover` through `Select` and `Menu`, `Radio` through
`radioGroup.spec.ts`, `Checkbox` through `binarySwitch.spec.ts`, `MultiSelect` through
`select.spec.ts`, `Corners` and `Viewport` through whatever page happens to mount them,
`InteractionWrapper` through every control.

**What a page that stops painting costs is now measured rather than guessed, and the answer split the two
rAF consumers apart.** `e2e/noAnimationFrames.spec.ts` replaces `requestAnimationFrame` with a function that
never calls back, before any application code runs — a frozen clock cannot express this, because Playwright
fakes frames as a 16ms timer and advancing time to reach a fallback fires the frame first. Two findings:

- **`ElementFader`'s 100ms fallback is real and is now driven.** With no frames at all a `Modal` still
  reaches its visible target, which is the whole reason the fallback was written.
- **The positioner's poll is load-bearing for exactly one thing: finishing the first placement.** A layer
  measures itself on mount, before it has its final size, so the opening position is provisional and the
  next tick corrects it — measured at 30px out on `ViewportPage`'s scrolled anchor. Everything after that is
  carried by the capture-phase `scroll` listener alone: with frames starved, the first scroll lands the
  layer exactly on its anchor's edge. So the fear this item used to record — a popup drifting further and
  further from the field it belongs to — is not what happens. What does happen is that **every layer opens
  one frame behind**, which is the same frame of drift item 14 records against a fast scroll, seen from the
  other end. Whether to make the first placement frame-independent is a decision nobody has taken.

**Time is no longer a blind spot, and the mechanism is worth knowing before the next timing bug.**
Playwright's clock API fakes `Date`, `setTimeout`, `setInterval`, `requestAnimationFrame`,
`requestIdleCallback`, `performance` and `Event.timeStamp`, with `install`, `pauseAt`, `fastForward` and
`runFor`. `install` freezes time until it is advanced, so a duration becomes a stepped quantity rather
than a wait — which is what let the toast pause arithmetic be asserted at all, since the question is not
_whether_ four seconds elapse but _which_ four. `toasts.spec.ts` uses it in one describe block, and that
is the pattern for anything else of this shape. What the clock does **not** reach is two things: the three
motion components, whose time is CSS's rather than the page's, and the absence of frames, which needs the
stub above rather than a fake clock — the two look interchangeable and are not.

---

## 8. Planned: a consumer-facing layer of controls above the library — _not a focus_

**Deferred indefinitely by the user on 2026-08-15, and it is the lowest-priority item in this file.** Nothing
is blocked on it, nothing is missing because of it, and it is very doubtful it becomes a focus any time soon.
It stays numbered rather than moving to _Accepted limits_ because the packaging question inside it is a real
decision nobody has taken — not because the work is queued. **Do not propose starting it, do not weigh it
against anything else, and do not list it when asked what is next.**

The reason it survived a review that nearly dropped it: every control is fully consumable today and the
Playground proves it, so what this layer would buy is **less repetition, not more capability**. A page pairs a
control with its painter at every call site — `ButtonPage` imports `Button` and `PageButtonContent` and writes
the same threading closure five times — and about forty painters across thirty pages do the same. That is the
entire cost, and in a repo with one author it is small.

Recorded **2026-08-07** as advance notice in three parts. Two of them are built and are no longer
outstanding: there is no `style.css` anywhere in `src/`, and `App/Theme.css.ts` is the theme — a
vanilla-extract contract over colour, spacing, font size, radius, shadow, the hover / active / disabled
filters and one animation duration, with a small global block for the reset, the focus ring, the
scrollbars, links and `body`. The `--clr-*` custom properties this item used to call the de facto theme
are gone, and the theme's token shape deliberately carries no reasoning — see `conventions.md`.

What is left is the third part.

**A more final-consumer-like layer of controls — `MyButton` and friends — that trade API surface for
decided behaviour.** The stated example: no `renderContent` tooltip renderer, just tooltip content as
a string. This is the opposite direction from every argument recorded in `conventions.md` about slots
and flags, and deliberately so: those arguments are about what a **library** owes a consumer who has
not been met yet, and this layer is what a consumer who has been met actually writes. Worth knowing
because a narrowing that is correct here would be wrong one level down, and the two layers will sit in
the same repo.

**`App/StyledComponents` is not this layer and should not be mistaken for it.** Those forty-odd files are
painters — each named `<LibComponent>Content` after the slot it fills, per `conventions.md` — so they are
handed to a library control by the page that mounts it. Nothing there narrows an API: a page still passes
every prop the library takes. This layer is the opposite move, and it would consume those painters rather
than replace them.

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

## 9. `Toasts` — two things deliberately not built

The decisions behind what exists are in `conventions.md` under the two `Toasts` headings. These are the
gaps, each with the reason it is still a gap.

- **A pile cannot overlap by measured height.** `index` and `count` are enough for a fixed peek
  distance, but a painter that wants each card offset by the height of the one in front of it needs its
  neighbours' measured heights and can only measure itself. That is the same measuring `Abstract` item 6
  wants for auto-height animation, from a different direction.
- **An id re-added while it is leaving fades back in** rather than restarting as a new entry, because the
  id never left the rendered list. It is the reasonable behaviour and it is not obvious, so it is written
  down rather than left to be rediscovered.

A hidden tab now holds every countdown, so that gap is closed — see `conventions.md`, and note the signal is
`document.hidden` rather than window focus, which is the narrower of the two published choices. The pause
arithmetic is covered on a fake clock too, per item 7, so what is left in this item is the two gaps above
and nothing about verification.

**_Elsewhere._** Every bullet above has a published answer, and two of them are answers this item did not
have.

- **Per-toast urgency does not go through the region at all**, and that is the arrangement now built here —
  see `conventions.md`. Radix announces through a throwaway element per toast, outside the viewport region,
  with `aria-live` from that toast's own type; the text is inserted after two animation frames so that NVDA
  picks it up. This library reserves the two shared announcer regions when the stack mounts instead, which
  answers the same hazard without a per-message frame delay. `role="status"` in both cases rather than
  `role="alert"`, to stop screen readers stuttering.
- **The keyboard route is a hotkey, and it is `F8` rather than `F6`.** Radix's viewport takes a `hotkey`
  prop defaulting to `["F8"]`; from there it is `Tab` within the region and `Escape` on a focused toast.
  Built, with `Escape` returning focus to wherever the hotkey was pressed rather than acting on a toast.
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
  `onDismiss` and `onAutoClose`. That is still unanswered here: `onShow` and `onHide` report the two
  transition boundaries, not the reason for the second one. Splitting the callback rather than widening the
  state a painter reads is the shape to copy if anything ever asks.
- **The pause arithmetic is the same arithmetic.** Radix subtracts elapsed from remaining on each pause,
  exactly as here — and per item 7, Playwright's clock API is what would let the remainder be asserted
  rather than eyeballed.

---

## 10. `Calendar` — two things deliberately not built

Item 8 covers the missing components. These are `Calendar`'s own gaps, each with the reason it is still
one. The decisions behind what exists are in `conventions.md` under _"Controls: `Calendar`, and the date
value the library owns"_.

- **No week numbers and no multi-month view.** Both are extra columns or extra grids around the same
  `DateValueUtils.getMonthGrid`, so neither needs new library machinery; they need a decision about
  whether `Calendar` grows a mode or a consumer composes two of them.
- **The disabled predicate runs per cell per render.** `computeIsDayDisabled` is called for each of the
  42 cells inside a reactive read, so a consumer whose predicate hits a network cache will do it 42
  times a month change. Memoising is the consumer's to do today; whether the library should batch it
  into one call per grid is open.

**_Elsewhere._**

- **A range is a second component or a mode, and both ship.** React Aria has a separate `RangeCalendar`;
  react-day-picker has `mode="range"` on the same component. Both shapes were weighed before `RangeCalendar`
  was built; see `conventions.md`.
- **Month and year jumping is a caption layout, not a keyboard shortcut.** react-day-picker's
  `captionLayout` takes `"dropdown"`, `"dropdown-months"` or `"dropdown-years"`, with `startMonth` and
  `endMonth` bounding the lists and defaulting to a hundred years back. Selects inside the header are
  what everyone ships; `Shift+PageUp` is nobody's headline feature, which is why it stayed unbuilt for as
  long as it did. It is built now — the caption is still where the field goes, and the key costs three
  lines beside the month step it already had.
- **Week numbers and multiple months are props on the same component**, not a second one:
  `showWeekNumber` and `numberOfMonths`, plus a callback for a click on the week number itself.
- **The per-cell predicate is answered by widening the input rather than memoising the call.**
  react-day-picker's `disabled` accepts a matcher or an array of them — a single date, an interval, a
  day-of-week set, a before/after bound — and a function is only one of the accepted forms. So the
  common cases never call anything forty-two times, and the expensive form is visibly the expensive one.
- **The month announcement belongs to a shared announcer that is nobody's component**, which is the shape
  this library settled on. React Aria announces a visible-range change through `@react-aria/live-announcer`:
  a live region created on first use, appended outside the component tree, with the message cleared after a
  timeout. `LiveAnnouncer` is that, and `Calendar` was its first consumer — the announcer belongs to neither
  the consumer's title nor the calendar. Nothing here is outstanding.
- **One real focusable element per day is normal**, so forty-two of something was never the anomaly:
  react-day-picker renders a `<button>` per day and MUI a day component per day. What this library adds on top
  is its own wrapper per cell, and that has now been measured — see `conventions.md`.

---

## 11. `ColorInput` — two things deliberately not built

`ColorInput` is the custom picker now; the decisions are in `conventions.md` under the `ColorArea` heading.
These are the gaps.

- **No native colour input anywhere, so no form value and no OS picker.** Deliberate, and the cost of
  owning the surface. A consumer who wants the OS dialog has nothing to fall back on.
- **No eyedropper — _postponed until the platform catches up_, decided by the user on 2026-08-15.** Swatch
  presets and recent colours were dropped the same day and are not coming back. The eyedropper is not
  declined, it is waiting: the work is trivial and the support is not there. **Do not propose building it,
  and do not re-argue the design** — that part is settled and recorded below.

    **The trigger is browser support, and it is checkable rather than a matter of judgement.** Re-open this
    when Firefox or Safari ships `EyeDropper`, or when it reaches Baseline. Until then the only thing worth
    doing is reading [caniuse](https://caniuse.com/mdn-api_eyedropper) — do not re-derive the design, the cost
    or the options, all of which are below and were settled on **2026-08-15**.

    **What it would take, for when that day comes:** almost nothing in `src/Lib`. `valueSignal` is already a
    hex string and `open()` resolves to `{ sRGBHex }`, so a consumer constructs an `EyeDropper`, awaits it, and
    writes the result into the signal — the component syncs hex into its HSV working state itself, and
    `renderPopup` already provides the space for a trigger. The two pieces that would be library-owned are the
    TypeScript declaration, since `EyeDropper` is absent from the DOM lib and every consumer currently writes
    their own `declare global`, and a feature-detection helper, because a consumer who forgets
    `"EyeDropper" in window` ships a dead button to most of their users. A `renderEyedropper` slot was weighed
    and rejected: a prop that does nothing in three browsers out of four is the thing this item exists to
    avoid.

**Nothing about dismissal or open state is outstanding.** `ColorInput` dismisses through `DismissStack` like
every other layer and takes a `visibilitySignal` like every other popup; both are in `conventions.md`.

**_Elsewhere._**

- **Owning the surface is the mainstream trade.** React Aria's colour suite — `ColorArea`,
  `ColorSlider`, `ColorWheel`, `ColorField`, `ColorSwatch` and `ColorSwatchPicker`, synchronised by a
  `ColorPicker` around one colour value object — has no native `<input type="color">` path either, and
  Ark UI's is custom too. Nobody keeps the OS dialog as a fallback, so the cost recorded in the first
  bullet is the cost everyone pays.
- **The eyedropper is absent because the platform is, and re-checked on 2026-08-15 rather than assumed.**
  `EyeDropper` is Chromium-only: Chrome and Edge from 95, Opera from 81, no Firefox, no Safari, **26.83%
  global support**. MDN marks it experimental and explicitly not Baseline, needing a secure context and a
  user gesture. `open()` resolves to `{ sRGBHex }`, accepts an `AbortSignal`, and Escape cancels it. React
  Aria's colour documentation shows no eyedropper at all, so there is nothing to copy — and a library-owned
  prop for it would do nothing in three browsers out of four.
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

## 12. `Accordion` — two things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Accordion`, and where
auto-height measurement lives"_.

- **A collapsed panel's content is still built.** `inert` plus a zero height is what makes the panel
  measurable and animatable, so an accordion of a hundred expensive panels builds all hundred. A
  `getIsLazy` that withholds the panel until first expansion would cost the open animation on that first
  expansion, since there would be nothing to measure yet. This now belongs to `Collapsible` rather than to
  `Accordion` — see `conventions.md` — so whatever is decided lands in one place for both.
- **The height animates, and nothing else can.** A consumer wanting the panel to slide in from the side
  gets it from `renderPanel`'s visibility target, but the panel box itself only ever animates `height`.
  Animating width instead — a horizontal accordion — would need the observer's twin and a direction prop.

**_Elsewhere._**

- **The published trade is the opposite one: unmount, and measure in a pass.** Radix's accordion unmounts
  collapsed content unless `forceMount` is set, and publishes `--radix-accordion-content-height` from its
  own measurement so that CSS can animate to a pixel value. React Aria's `DisclosureGroup` keeps the panel
  in the DOM but uses `hidden="until-found"` where supported, so find-in-page can reveal a collapsed
  section. Both keep the measurement library-side and differ only on whether the content stays built, so
  a `getIsLazy` here would land in Radix's position — animation cost on first expansion included — rather
  than somewhere new.
- **A horizontal accordion is an `orientation` prop plus a second CSS variable.** Radix's
  `orientation="horizontal"` swaps the arrow-key axis and exposes the content _width_ beside the height,
  which is the direction prop this bullet describes, with the measurement doubled rather than generalised.
- **"Always exactly one open" is the default elsewhere, and the second state is a second boolean.**
  Radix's `type="single"` _requires_ one item to stay expanded; `collapsible`, default `false`, is what
  permits zero. Built here as `isExpandRequired` beside `isSingleExpand` — two booleans, as there, rather
  than a third state on the first prop.

---

## 13. `Tabs` — a pairing the consumer can still skip

The decisions behind what exists are in `conventions.md` under _"Controls: `Tabs` as records"_ and
_"`TabPanel`: the pairing is written on the record"_.

- **Nothing makes a consumer wire the panel.** `id` and `panelId` are optional fields, so a tab list with
  no pairing at all is still a valid one. The cost is that the omission is silent: a consumer who paints
  their own panel box and never reaches for `TabPanel` gets no warning, the way one who nests a
  `getAriaLabel` inside a `Label` does. The Playground's own left menu was that consumer for four months
  and nothing said so; it is wired now, which removes the example rather than the gap.

**_Elsewhere_**, read off the two libraries' own documentation on **2026-08-11**.

- **The panel is part of the component in both, and it is mandatory.** Radix has `Tabs.Root` / `List` /
  `Trigger` / `Content`, where `Trigger` and `Content` carry the same `value`; React Aria has `Tabs` /
  `TabList` / `Tab` / `TabPanels` / `TabPanel`, matched on `id`, and a panel per tab is required. Both
  enclose the panels in the root, which is what lets the ids be generated privately — and what this
  library cannot do while a panel may be a routed page mounted elsewhere in the tree. Writing the pair of
  ids on the record is the price of that, and the optional-ness in the first bullet is its tail.
- **Automatic activation is the default in both**, spelled `activationMode="automatic"` in Radix and
  `keyboardActivation="automatic"` in React Aria. Both modes now exist here under `hasAutoActivation`, with
  manual still the default — the inversion is deliberate and the reasoning is in `conventions.md`.

---

---

## 14. `Viewport` as a region: what is settled and what is not

A viewport now fits its design size into the box the page gives it, clips everything inside it, and keeps
its own layers within its own bounds; see `conventions.md`. `ViewportPage` is two 400px squares — a control
that roams one of them at a scale you can change, and an anchor inside a scrolling area in the other — and
`viewport.spec.ts` drives both, including that the two scales multiply and that a stack of toasts raised
inside a nested viewport stays inside it. What is left:

- **A nested viewport needs a sized host, and says nothing when it does not get one.** It measures its own
  box, so a container with no height gives it a zero-sized region and it renders nothing visible. A warning
  would be the obvious kindness; whether the library should warn at all is the same question `Label` already
  answered for itself, and it went the other way.
- **A fast scroll can still show a frame of drift.** The layer repositions from the `scroll` event and from
  a frame poll, both on the main thread, while the scroll itself may be composited off it; see
  `conventions.md`. `viewport.spec.ts` asserts the layer lands exactly on its anchor once the scroll
  settles, which is what a spec can see. The published fix for the intermediate frames is CSS anchor
  positioning, which is Chromium-only.

---

## 15. `Tree` — three things deliberately not built, and one extraction to decide

The decisions behind what exists are in `conventions.md` under _"Controls: `Tree`, and the group box that
could not be a child"_. These are the gaps, each with the reason it is still one.

- **A branch whose children have not arrived yet cannot be spelled.** A branch is a node with at least one
  child, so an empty list reads as a leaf and there is nothing that shows a closed, openable, not-yet-fetched
  folder. Two things would be needed and only the first is obvious: a way to say "this has children" without
  having them, and somewhere to paint "loading" — which would have to be inside the `role="group"` box the
  library owns and the consumer cannot reach.
- **The marker cannot own the toggle.** One press both selects a node and opens it, because the branch
  marker is drawn inside `renderNode` and the component cannot tell a press on it from a press on the label.
  A consumer who wants the published desktop behaviour — the chevron opens, the label selects — has no route
  to it. Giving them one means either a second render slot the library positions, or a flag saying where the
  press landed, and neither has been argued.
- **One selected value, and no checkboxes.** `valueSignal` is `Signal<T | undefined>`, so there is no
  `aria-multiselectable`, no `Shift`-extended range, and no tri-state parent following its children. That
  last one is the same `CheckedState` that item 3 says `Select`'s group header wants, which is now two
  controls asking for the same type.

**The focus rescue was wired to a function nothing could reach, and is now a guard over the visible rows.**
It used to sit inside `collapse`, checking whether focus was on a descendant before removing the subtree — but
both routes into `collapse` act on the branch itself, which is already the focused element and stays mounted,
so the check was never true. A **consumer** writing `expandedSignal` from their own code, which is the only
way to collapse a branch out from under a focused row, never passes through `collapse` at all. The guard now
watches the visible rows and fires when a remembered focused row leaves the set while focus has fallen to the
document body; `tree.spec.ts` drives it through a Playground button that defers the collapse, since a button
that collapsed on the spot would be holding focus itself.

**The extraction, which is a decision rather than a gap.** Flattening a nested list into a navigable one now
exists twice: `SelectUtils.getFlatOptions`, which flattens one level of groups and needs `getItemOffsets`
beside it to hand each slot a flat index, and `TreeUtils.getVisibleRows`, which flattens any number of levels
and writes the index onto the row. The second is the general case of the first. Merging them means `Select`
adopting `TreeRow` — a change to a shipped control's internals in order to delete a two-line function — so it
was deliberately not done under `Tree`'s justification. The question is whether the shared thing is worth
having before a third consumer asks.

**_Elsewhere_**, read off the published documentation on **2026-08-13**.

- **Typeahead is in the pattern itself, not just in the libraries.** The published tree pattern lists it as a
  keyboard requirement — type a character, focus moves to the next node whose name starts with it. Ark UI has
  it on by **default** behind a `typeahead` prop; React Aria drives it off the same `textValue` its lists use.
  This is what made the tree the strongest of the three arguments for building it.
- **Lazy branches are a named feature with a completion callback.** Ark UI takes `loadChildren` plus
  `onLoadChildrenComplete`; React Aria has a `TreeLoadMoreItem` element and a `renderEmptyState` for the
  spinner. Both answer the second half this item calls hard — where "loading" is painted — by making it an
  element the consumer supplies, which is the shape the group box here would have to grow.
- **Multi-select and checkboxes are one feature, and both libraries ship it.** `selectionMode="multiple"` in
  each, with Ark UI adding `NodeCheckbox` and a `checkedValue` list carrying `indeterminate`. So the tri-state
  parent is not an extra: it is what a multi-select tree is expected to include.
- **A windowed tree is done by handing the visible list out.** Ark UI virtualizes through `getVisibleNodes()`
  plus a `scrollToIndexFn`, which is precisely `getVisibleRows` and `scrollToRow` — the same two pieces this
  library already has, arranged so the consumer owns the window. React Aria's tree documents no virtualization
  at all. Worth knowing before the group-box boundary above is treated as the only way in.
- **The indent guide is a part in one of them.** Ark UI ships `BranchIndentGuide` alongside `BranchControl`,
  `BranchIndicator` and `BranchText`, so the depth line a consumer draws here from the `depth` flag is
  something at least one library thought worth owning.
- **Drag and drop is React Aria's, and nobody else's.** It arrives through the same `useDragAndDrop` hook its
  lists use rather than as anything tree-specific. Nothing here has asked for it, and it is recorded so the
  omission is not re-derived as an oversight.

---

## 16. `SlideButton` — three things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `SlideButton`, and why the gesture
is the only thing it owns"_, including which WCAG criteria were read and what they decided. These are the
gaps, each with the reason it is still one.

- **The thumb has to reach the end, and there is no threshold.** Overshooting clamps, so a drag past the end
  is enough and reaching it is easy — but a consumer who wants a hair-trigger at 90%, or a longer travel than
  the paint suggests, has nothing to set. It is not a prop because a tuned value with no consumer behind it is
  a guess, and the rule about measured values says those are the user's to set rather than the library's to
  invent.
- **Horizontal only.** `Range` grew an `orientation` and this did not: the hit test and the progress
  arithmetic both read one axis, and the painter's `calc` does too. A vertical slide-to-activate is a real
  shape on a phone lock screen and nowhere else, which is why it was not built rather than why it could not
  be.
- **The hold duration is one number for everyone.** `getHoldDurationMs` defaults to 1000 and a consumer can
  change it, which is the right shape — but there is no route to a duration that follows the person rather
  than the control, and `prefers-reduced-motion` is not the signal for it either. Recorded because a fixed
  hold is itself a dexterity assumption, and the control exists partly to avoid one.

**_Elsewhere_**, read on **2026-08-13**, after the keyboard decision had already been taken.

- **No headless library ships one, so there is nothing to copy either way.** Radix's thirty-odd primitives,
  Base UI's thirty-five at its December 2025 stable release, React Aria and Ark UI all have a slider and a
  button and nothing between them. That is the same finding as the animation components in item 2: the
  omission is the field's, not this library's.
- **The packages that do ship one have no keyboard route at all**, which is worse than the decision taken here
  rather than different from it. `react-swipeable-button`'s whole documented surface is `onSuccess`,
  `onFailure` and colours — no role, no `tabindex`, no key handling; `react-slide-button` is built on
  `react-swipeable`, which is pointer-only by construction.
- **Apple, whose lock screen is where the pattern comes from, answers exactly the decision taken here.** Asked
  on the developer forum whether a swipe-to-confirm harms VoiceOver users, the guidance is to override
  `accessibilityActivate` so that a single activation runs the same confirm logic **without** the swipe, or to
  expose the confirmation as an `accessibilityCustomActions` entry. The lock screen itself behaves that way:
  a VoiceOver user selects the caption and double-taps, and the gesture collapses to one activation. So "the
  assistive route is a plain activation, not a reproduced gesture" is the platform's own answer and not a
  convenience.
- **The standard that decides it is 2.5.7 Dragging Movements, and it is newer than the pattern**, which is
  most likely why none of the packages above answer it. What it asks for — a single-pointer route that is not
  a drag — is what the hold is; see `conventions.md`.

---

## 17. `Spotlight` — one thing deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Spotlight`, and three presets
because a mode cannot move at runtime"_. These are the gaps, each with the reason it is still one.

- **`prompt` cannot hide the page from a screen reader.** `inert` is inherited and cannot be lifted off a
  descendant, so a mode that keeps one element live cannot seal the rest — the overlay stops the pointer and
  the `focusin` guard stops the tab order, but a virtual cursor still reads everything behind. The only escape
  is portalling the highlighted element into the overlay for the duration, which is far more invasive than the
  mode is worth. Recorded as a limit of the mechanism rather than an oversight.

---

## 18. `Scroller` — four things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Scroller`, and why it renders no
button of its own"_. These are the gaps, each with the reason it is still one.

- **Horizontal only.** The whole component is one axis of arithmetic — `scrollLeft`, `clientWidth`,
  `offsetLeft` — and a vertical twin is those three swapped plus a direction prop, which is `Accordion`'s
  recorded position on its own axis question. Nothing has asked for a column, and the Playground's own left
  menu, which is the obvious candidate, scrolls natively today and nobody has complained.
- **The step is a page, and there is no way to ask for less.** Paging lands on the last item boundary inside
  the next page, so the step is "as much as fits" rather than a tuned fraction. A consumer wanting a lingering
  item of overlap for context has nothing to set. It is not a prop because the overlap would be a measured
  value with no consumer behind it, and the rule about tuned numbers says those are the user's to set.
- **A second press landing mid-scroll moves less than a page.** The step is measured from where the track is
  at the moment the button is pressed, and the scroll that follows is smooth, so pressing quickly five times
  does not advance five pages. It is self-correcting — every press still moves forward and the end is still
  reachable — and every implementation built on `scroll-behavior: smooth` behaves this way. Holding the
  intended target and stepping from that instead is the fix if it ever matters; nothing has asked.
- **The buttons are the consumer's, so their keyboard story is too.** The component renders no button, which
  means it cannot guarantee one is reachable, named, or in the tab order — a consumer who paints them as bare
  divs gets a control no keyboard can reach. The library's answer is that the scrolling itself is still
  operable, because focus moving through the strip drags the track along, so the function survives even when
  the buttons do not. Recorded because it is a real consequence of the ownership line rather than an oversight.

---

## 19. `Paginator` — four things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Paginator`, where the arithmetic
is the component"_. These are the gaps, each with the reason it is still one.

- **It counts pages, not items.** Ark UI takes `count` and `pageSize` and divides; this takes `pageCount` and
  leaves the division to the consumer. The arithmetic is one line, but the two spellings disagree about what
  happens when items do not divide evenly, and about whether a zero-item list has no pages or one empty one.
  Those are the consumer's answers, and taking `pageCount` is what stops the library from picking for them.
- **Nothing hands back the slice bounds.** A consumer showing "showing 21 to 40 of 383" computes it
  themselves, and it is the same arithmetic the point above declined to own. Worth revisiting together with
  it, since either both belong here or neither does.
- **There is no page field to type into.** A paginator over hundreds of pages wants "go to page ▢" beside the
  numbers, and nothing composes one — the consumer builds it from a `NumberInput` and their own page signal.
  Probably right; recorded because it is the first thing a large page count makes you want.
- **The whole row is in the tab order, and there is no way to ask for one stop.** Every page and every step is
  its own tab stop, which is the accordion's rule and is defended in `conventions.md`. A paginator with a wide
  window and both end jumps is fifteen tab stops in a row, which is a lot to walk past to reach the content it
  pages. Nothing has asked, and the alternative — a roving order over a list of independent destinations —
  contradicts the reasoning rather than extending it.

---

## 20. `Carousel` — four things deliberately not built

The decisions behind what exists are in `conventions.md` under _"Controls: `Carousel`, and the first component
that acts without being asked"_. These are the gaps, each with the reason it is still one.

- **One slide at a time; a page of several is not built.** The description this came from allowed either, and
  one slide is the reading with a published pattern behind it. A page of several needs the arithmetic to start
  asking how many fit, which is `Scroller`'s question and the boundary the two were separated along. Building
  it would also make the picker ambiguous — a dot per slide or a dot per page — and that is a design question
  rather than a missing line.
- **The keyboard is whatever the controls are.** There is no arrow-key handling on the region, so a carousel
  rendered with no `renderControls` has no keyboard route at all. The published pattern puts the arrows on the
  buttons rather than on the region, so this matches it — but a consumer who skips the controls gets a control
  a keyboard cannot move, which is worth knowing before it is called a bug.
- **The track always slides; a fade is not expressible.** The library owns the transform, so a consumer cannot
  make one slide dissolve into the next. `ImageSwitcher` is the component that already does that for a single
  image, and the two would be one only if the motion became the consumer's — which would mean handing out a
  visibility target per slide, the way `Tabs`' floater now does. That is a real design, not an oversight, and
  nothing has asked for it.
- **Every slide is built, always.** All of them are in the document from the first render, `inert` and hidden
  when away. This is `Accordion`'s trade rather than `Tree`'s, and here it is forced rather than chosen: the
  track has to be as wide as the slides to translate across them. A carousel of a hundred expensive slides
  builds all hundred, and windowing it is the same boundary `Select` and `Tree` already record.

---

## 21. The four components ported from React — one thing to retest, one deliberately not built

`Satellite`, `Staircase`, `Formation`, `FlatWheel` and `DrumWheel` came in from a React codebase; what the port
settled is in `conventions.md`. Two things did not settle, and only the first is live.

**The drum's girth arithmetic was wrong twice and is now measured rather than argued.** What it reserves and
why is in `conventions.md` under _"A drum reserves the room it paints in"_; both wrong answers are recorded there
too, since the shape of the mistake repeated. What remains open is smaller than the original entry claimed:

- **A wedge count that changes mid-turn interpolates the radius, and is left alone.** The user's call. A face
  carries its angle and its distance from the axis in one `transform`, and that property is transitioned, so
  changing the count while the drum is turning animates the radius over the rotation's duration while the barrel
  jumps to the new one at once. For those few seconds the faces sit outside the box the component reserved. At
  rest the transition duration is zero and the change applies instantly, so this needs a live count change
  **during** a rotation to appear — which is exactly what a Playground knob does and what a fixed prize list
  never will. Recorded rather than fixed because the fix costs an element per face, up to 48 on a doubled reel,
  for a transient nothing outside a props panel produces.
- **What the fix would be, if it is ever wanted.** Splitting the rotation onto an outer element and the radius
  onto an inner one gives `rotate × translate` in that order with the radius untransitioned, which is the same
  matrix as today. The individual `rotate` and `translate` CSS properties cannot do it: they compose as
  `translate × rotate`, and this needs the translation to happen in the face's own turned frame, which is the
  opposite order.
- **Whether the user still sees the errors they remember from the original codebase.** Two wrong formulas have
  been found and fixed since that note, so the recollection may already be accounted for.

**A flat wheel hit-tests outside its visible circle, and is left that way for now.** The user's call, to be
revisited. Each wedge is a full-size square div carrying the rotation, so a rotated square's corners point at the
middles of the axis-aligned edges — measured, a press 40px clear of the wheel at mid-height lands on a wedge,
while the same distance past a corner lands outside it. Nothing paints there and nothing in a wedge is
interactive, so there is no visible effect; the exposure is a consumer who paints a control into a wedge, or an
outside-click layer that would read such a press as inside the wheel.

**What was measured, so the next attempt starts from evidence rather than from the three guesses that preceded
it.** `pointer-events: visiblePainted` on the wedge wrapper does nothing: MDN lists it as SVG-only and
experimental for HTML, and applying it across the whole wedge subtree left the hit chain identical. `none` on the
wrapper and on the `<svg>` root, with `visiblePainted` on the shapes, closes it exactly — a press outside the
wheel falls through and a press on the painted wedge lands on the `path` rather than on a div, so the hit area
becomes the pie itself. Better than clipping the root to its square or the wedge layer to a circle, both of which
were considered. **What stopped it is the consumer trap**: anything painted into a wedge silently stops being
pressable until it opts back in with `pointer-events: auto`.

**A flat wheel has one slot for its controls and it is the hub, chosen by the user over two alternatives.** A
drum's controls sit under the barrel; a flat wheel's sit in the middle of it, and there is no second slot. The
cost is the one item 18 already records for `Scroller`: a consumer who wants the control somewhere else renders
their own button, and a library that renders no button cannot promise it is named or reachable. The two
alternatives were a second slot beneath the wheel, rejected because the flat wheel is a square and anything
under it changes the box it reserves, and a slot with a position prop, rejected because `Toasts` had already
settled that a component does not fully delegate position. Recorded so it is not re-proposed as an oversight.

---

## 22. `Typewriter` cannot render a blank line, and the fix is in `ss-utils`

**What a consumer sees.** Text containing `"a\n\nb"` renders as two lines with no blank line between them, and a
stray blank line after the last one instead. It is on the Playground's second Typewriter example, whose starting
text is `"Line one\n\nline two"`.

**Where it comes from.** `JSXTextParser.getSegmentTokens` splits the text node into `"Line one"`, `"\n"`, `"\n"`,
`"line two"` and pushes a break token for each newline — but through a helper that drops a break whose predecessor
is already a break. So the second break is lost, while the wrapping element's own closing edge later pushes one
that survives, because by then the last token is text. `Typewriter` renders the token list in order and cannot
recover what is no longer in it.

**The collapse is right for the case it was written for and wrong for two others.** Its own comment says so: two
blocks in a row would otherwise close one and open the next. Block edges should collapse. A break the author
wrote — a literal newline, or a `<br>` — is content, and a browser renders `<div>a</div><br>b` with a blank line.
So the two explicit call sites push unconditionally and the two structural ones keep the helper.

**It is a regression, and where it came from is known.** `git log -S'linebreak'` puts it in the commit that
deleted this repo's own `src/Lib/Abstracts/JSX/Text/Parser/JSXTextParser.utils.ts` and moved the parser to
`ss-utils`. The version deleted there had four unconditional pushes, with the block edges additionally guarded by
`isBlockLike && tokens.length > 0`; the copy introduced the helper and routed all four through it. Both guards
came across verbatim, so the only change was the two explicit sites gaining a condition they never had.

**Nothing in this repo can fix it**, which is why this is carried rather than closed: the token is dropped before
`Typewriter` is handed the list. The corrected file is parked at `src/Lib/JSXTextParser.utils.ts`, commented out —
see _"A file in transit"_ in `conventions.md` — and this item closes when `ss-utils` ships it and the dependency
is bumped.

---

## Accepted limits

Faults that have been looked at and consciously left alone. Not outstanding work, not numbered, and not part
of the answer to "what is left" — see the note at the top of this file. Each one records what it is, how to
reach it, and why it was accepted, so that nobody has to re-derive the argument in order to leave it alone
again. An entry moves back up into the numbered items only if the user says so, or if something changes that
makes the reasoning wrong.

**Converting a date into a calendar that cannot hold it clamps, silently.** Accepted **2026-08-11**.
`DateValueUtils.withCalendar` is `toCalendar`, and 15 March 44 BC asked for in the Japanese calendar comes back
as Meiji 1 — 15 September 1868 — because that calendar's first era begins there. Nothing reports that the value
moved. Reachable in the Playground in two clicks: hold the Date picker page's historical date and switch the
calendar knob to `japanese`.

This is the same class of fault as a mask laying too many digits into too few slots, and it is the one place the
_"never approximate a value"_ rule in `conventions.md` is still broken — so the rule is stated there with this
exception, rather than pretending to be absolute. The fix itself is cheap, a round-trip comparison; what made it
not worth taking is that it forces `withCalendar` to return `undefined`, and then each of `Calendar`,
`DateInput` and the Playground's knob has to decide separately what to show instead. Three judgment calls and a
non-null assertion in `toIso`, to close a case only a deliberate calendar switch on an out-of-era date reaches.
The clamp is also `Intl`'s own behaviour, so what ships is at least consistent with the platform.

**Playground samples are not considered for export.** Accepted by the user when the SVG defs vocabulary moved
out of the library: seven tilings and four families of animation builder now live in `Samples/SVGDefs`, so a
consumer of the package can no longer import them and copies them from the Playground instead — the same trade
already taken for `CellAnimation`'s origins and weights. What this gives up is stated so it is not rediscovered
as an oversight: a consumer wanting animated hexagons gets a worked example rather than a function, and
anything that becomes worth publishing has to be moved back deliberately. Nothing in `src/Lib` depends on any
of it, and the arithmetic is now unit-tested where it sits, which is what closed the item this came from.

**Screenshot baselines, and with them any automated check on appearance.** Accepted **2026-08-11**, by the
user, on two grounds: style in this project is far too fluid for a baseline image to mean anything for long,
and appearance is **not the library's responsibility** in the first place — `src/Lib` paints nothing, every
painter lives in the Playground, so a committed image would be asserting the demo's taste rather than the
package's contract.

What this permanently gives up is worth naming so nobody re-proposes it as a gap: the `aria-disabled`-parity
rule — that disabled and disabled-but-reachable look identical — is checked by eye and only by eye, and
`CellAnimation`, `ScanlineAnimation` and `ScreenWiper` will keep their Playground pages and no specs, because
motion over time is the one thing a DOM-reading suite cannot see. Item 10 records the blind spot; this is the
decision not to close it.

For the record, since it was researched and would otherwise be re-researched: there are two published
arrangements and they differ on where the image lives. Playwright's own screenshot assertion commits the
baseline beside the spec, one file per browser and platform, re-blessed with `--update-snapshots` — and its docs
are explicit that rendering varies with the host operating system, the browser build, headless mode, hardware
and even whether the machine is on battery, so a committed image is only stable in the environment that
produced it. The hosted services (Chromatic, Argos) keep baselines off the repo entirely and put the diff in the
pull request for approval, which is what libraries with a design system to protect generally use. Neither
arrangement survives the two grounds above.

---

## Open discussion

Ideas, sketches and things worth arguing about. **Not outstanding work, not numbered, and never part of the
answer to "what is next for development"** — see the note at the top of this file. Nothing here is a
commitment, and an entry that already carries the user's verdict is recorded here so that the same sketch is
not put to them twice. An entry leaves this section in one of two directions: upward into a numbered item, which is the user's
decision to take, or into `conventions.md` if building it settles something.

### The animation sample collections: what to add instead of more entries

`CellAnimation` and `ScanlineAnimation` take their weights and their keyframes from
`src/Playground/App/Samples`, which now holds around sixty entries across two shapes. Two batches of new ones
were built and the user's verdict on most was that they look repetitive; `conventions.md` records why that is
structural — a weight that falls away from a point is always a wipe, a per-cell function ending in place is
always an entrance. So the ideas below are all machinery that recombines the collection rather than extending
it, and each was put to the user as a sketch. Their gradings, in their own terms:

**Attractive, unbuilt.** The weight driving **how far** a cell travels rather than **when** it starts. Every
cell would move at once and a heavy one would go further, so a stagger becomes a depth field and any existing
animation reads completely differently without being rewritten. This was the second of the two they picked out;
dispatch by zone was the first and is built, as `_fromZones`.

**Rejected.** Composing two animations in sequence inside one cell's own window — fly in, then settle with a
shake. Judged interesting in theory and likely too jarring in practice. Do not re-propose it without a new
argument.

**Deferred as knobs rather than entries.** Quantising a weight into bands so a smooth wipe arrives as thick
blocks; jittering a weight so a machined edge becomes ragged; smoothing a weight so cells arrive in loose
clumps. Each applies to all of the weights at once, which is what makes them attractive, and each widens
`WeightOpts` — the user read that as adding behaviour to the API rather than extending a collection, which is a
different kind of change from a new dropdown entry and wants deciding on its own terms.

**Deferred as disproportionate.** All judged interesting, none judged worth the code for one effect:

- **Weights read off the source image** — reveal dark before light, or detail before flat, so the order comes
  from the picture and changes with every one. Singled out as the most code for the narrowest payoff: it needs
  a canvas pass over the source before the grid can be weighted at all. The component already allows it, since
  the weights callback belongs to the consumer, who holds the source.
- **Cells starting in each other's slots and sliding home**, so the picture arrives scrambled and resolves
  rather than assembling out of nothing. Needs each cell to know its partner's slot, which the defs carry.
- **Animations that match themselves at both ends**, run with no iteration delay — a perpetual drift or breath
  rather than an entrance. A whole category the collection does not have.
- **The weight treated as height**, tilting the grid as one object in the perspective the container already
  sets, rather than staggering N independent cells.
- **The root animation moving against the cells** — the whole picture drifting one way while its cells move
  the other. `computeRootAnimation` exists and only the Glitch example on the ScanlineAnimation page uses it.
