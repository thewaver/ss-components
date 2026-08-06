# `Select` — design brief

Decided but **not implemented**. This file holds what was settled in discussion, what is still open,
and the order to build it in. When it ships, the settled parts move to `conventions.md` and this file
is deleted.

Requirements as stated: options, option groups, multi-select, autocomplete.

---

## 1. Options are records, not indexed callbacks

**Settled.** The option set arrives as data:

```ts
getOptions: Accessor<SelectOption<T>[]>;
renderOption: (getOption: Accessor<SelectOption<T>>, getFlags: () => InteractionFlags<SelectFlags>) => JSX.Element;
```

Two shapes were considered, both with precedent in this repo. `RadioGroup` takes options as
**children that register through context**; `Tabs` took them as **data plus indexed callbacks**.
Neither was adopted unchanged, and the reasoning matters because it is what `Tabs` was refactored to
prove.

**Against children-plus-context:** the group cannot answer "what are my options" without waiting for
them to mount, filtering means mounting everything, and virtualization becomes impossible forever.

**Against indexed callbacks — the `Tabs` shape as it was:** four problems, and only the last is
specific to `Select`.

1. The group found its items by `querySelectorAll(":scope > a, :scope > button")`. Option groups
   break `:scope >` immediately, and a looser selector then collects group headers, or a `Button`
   that a painter put inside an option.
2. `renderTab(index)` received no flags, because `Tabs` predated the painter model. Supplying them
   means an `InteractionWrapper` per item — at which point the group is rendering N wrappers in its
   own loop and the only difference from children is who wrote the `<For>`.
3. One `compute*` prop per capability, per index. `Tabs` needed one; an option needs disabled,
   reachable-when-disabled, tooltip, error and value.
4. **Filtering makes "index" ambiguous.** With autocomplete the list changes on every keystroke, so
   `computeIsDisabled(index)` is either an index into the filtered list — meaning the consumer must
   reproduce the component's own filter result to answer it — or into the full list, meaning the
   group needs a mapping layer between its keyboard walk and every callback. Multi-select compounds
   it: selection is tracked by value regardless, so half the API would be value-keyed and half
   index-keyed.

**A record array fixes all four while staying data-driven.** A capability is a field on a record, not
a callback taking a position. This is the direct answer to the objection recorded in `conventions.md`
against data-driven groups ("a `compute*` prop per capability re-exposed per index") — that objection
is true of the callback form only.

**Identity is the value, never the position.** Every internal concern — the active option, the
selection, the keyboard walk, the typeahead — resolves through `option.value` and treats the index as
a lookup result.

## 2. `Tabs` is the rehearsal, and it is already done

The refactor described above was applied to `Tabs` first, deliberately, so the shape is exercised by
a shipped component before `Select` depends on it. See `conventions.md` → _"Controls: `Tabs` as
records"_. Copy its structure; the parts that transfer directly:

- `Tab<T>` / `SelectOption<T>` as a record with `value` plus behavioural fields.
- `<Index>` rather than `<For>`, because records are rebuilt on every filter keystroke and `<For>`'s
  by-reference keying would remount every row, dropping focus and every ref. **This is why the
  painter prop takes an accessor** — under `<Index>` the record changes beneath a stable node.
- Element refs collected per slot from `InteractionWrapper`'s `ref` passthrough, keyed by the same
  index as the data, so the two cannot desynchronise. No registration mechanism is needed: the group
  already owns the array.
- One `InteractionWrapper` per option, so each option keeps flags, ARIA, tab order and disabled
  handling without the group reimplementing any of it.

What does **not** transfer: `Tabs` uses a roving tabindex across its items because each tab is a tab
stop. A listbox is a single tab stop on the **field**, with the active option tracked by
`aria-activedescendant`. See §6.

## 3. The popup is built on `Anchor`, not on `Tooltip`

**Settled**, and the extraction is already done — `Abstracts/Anchor/` exists and `Tooltip` is already
a consumer of it.

`Anchor.createPortalPosition(getAnchorRef, getIsVisible, opts)` returns
`{ getPlacement, getPosition, setContentRef }` and handles anchor observation, content measurement
and collision-safe placement flipping, in the `Viewport` portal's coordinate space.

`Tooltip` itself was considered as the dropdown and rejected. Every one of these is load-bearing, not
a tuning:

- `tooltipRoot` is `pointer-events: none`. A dropdown must be clickable.
- Visibility is private — no `visibilitySignal`, driven by listeners `Tooltip` attaches to the anchor
  itself. A consumer cannot open or close it.
- It opens on hover and **closes on anchor blur**, so clicking an option would close the popup before
  the click resolves.
- `role="tooltip"` is hardcoded and it force-writes `aria-describedby` onto the anchor. A listbox
  needs `aria-controls` / `aria-activedescendant`; announcing the option list as the field's
  _description_ is wrong.
- `Escape` is handled by a listener on the anchor, so it stops working once focus moves into the
  popup. No outside-click dismissal, no focus return.

So the popup renders its own `<Show><Portal><div>` — about a dozen lines, duplicated from `Tooltip`
on purpose. Behaviour is shared through `Anchor`; markup is not, because the two disagree about
role, pointer events, focus and width.

**Not yet decided:** whether the popup is a private local inside `Select.tsx` (the `SurfaceSVG` /
`ButtonElement` precedent) or a public `Popover` Fundamental. Default to private until a second
consumer exists — that is the standing rule in `conventions.md`, applied to `TextArea` and to
`createAdornmentWidth` already.

## 4. Flags

`InteractionFlags<TExtra>` is already generic (`conventions.md` → _"the flags are extensible"_), so
`Select` declares its own:

```ts
export type SelectFlags = {
    isOpen: boolean;
    isEmpty: boolean;
    // candidates, decide when the painter needs them:
    // isFiltering: boolean;
    // hasNoMatches: boolean;
};
```

Extras are **required** fields, not optional — the control always produces them, and a painter should
not have to handle an `undefined` its control cannot emit.

Options need their own flag for "active" (the `aria-activedescendant` target, distinct from
`isFocused`, since focus stays on the field) and for "selected". Under multi-select, selected is not
`checkedState` — reusing `BinarySwitchFlags` would be borrowing a type from an unrelated control.
Give options a `SelectOptionFlags`.

## 5. Blocked on `review.md` #8

**This is the one thing to resolve before building the option list.**

`InteractionWrapper` decides both whether to render a `Tooltip` and whether a disabled control is
reachable from `props.getTooltipDefs !== undefined` — the presence of the prop, not the value it
returns. A per-option `tooltipDefs` field must therefore be forwarded conditionally, and passing a
function that returns `undefined` crashes the spread into `Tooltip`.

Solid's props getters do make the conditional form reactive, so it _works_, but the failure mode for
whoever writes the next group is a runtime crash rather than a type error. `Tabs` sidestepped it by
not carrying the field. `Select` cannot: an option disabled for a reason is exactly the case
reachability exists for.

The candidate fix is to switch on the value (`getTooltipDefs?.() !== undefined`) for both the render
and the reachability predicate. That costs the guard the "only when a prop was explicitly set"
property that `conventions.md` argues for under _"presence as a guard fails toward the safe
default"_. Decide deliberately; do not drift into it.

## 6. Open questions

Listed so they are decided rather than discovered.

**Single vs multi as one component or two.** `Toggle` is a preset over `Checkbox` because its
difference is paint; `number` is not a component because its difference is an attribute. Multi-select
differs in **behaviour** (the popup stays open on pick, selection is a set, the field summarises N
values), which by that test is closer to earning its own component — but the shared surface is far
larger than `Checkbox`/`Radio` shared. The `BinarySwitch` shape (private shared composite, two thin
presets) is the obvious candidate. `valueSignal: Signal<T | undefined>` versus `Signal<T[]>` is the
crux; a single `Signal<T[]>` for both was not seriously considered and probably should be.

**Where the filter lives.** The field is a `TextInput` when autocomplete is on, so `syncElement`,
composition gating and the caret restore all come for free — but `TextInput` owns a
`valueSignal: Signal<string>` that is now a _filter_, not the control's value. Whether `Select`
composes `TextInput` or reimplements a narrower version of it is undecided. Composing is preferred if
the read-only (non-autocomplete) case can be `getIsReadOnly`.

**Who filters.** Either `Select` owns a default substring match with a `computeIsMatch(option, query)`
escape hatch, or the consumer filters `getOptions` themselves and `Select` only owns the query
string. The second is less API and composes with async/remote sources; the first makes the common
case free. Note the second makes "no matches" the consumer's state, which affects §4.

**Option groups.** A group is a record with children rather than a sibling marker, most likely —
`SelectOptionGroup<T> = { label, options: SelectOption<T>[] }` — so the tree is explicit and a group
cannot be malformed. This makes the flat index that keyboard navigation walks a derived value. Not
settled.

**Virtualization.** Deferred. The record shape keeps it possible, which is the main reason it was
chosen over children; nothing should be built now that assumes every option is mounted.

## 7. Build order

1. Resolve §5 in `InteractionWrapper`, since every option depends on it.
2. Decide §6's single-vs-multi and filter-ownership questions — they shape the props.
3. The popup on `Anchor`, with open/close, outside-click and `Escape` dismissal, and focus return.
   Verifiable by dump.
4. Flat option list with `InteractionWrapper` per option, following `Tabs`.
5. Keyboard: single tab stop on the field, `aria-activedescendant` for the active option, arrows and
   `Home`/`End` over enabled-or-reachable options, `Enter` to pick, typeahead.
6. Groups on top of the flat list.
7. Multi-select.
8. Autocomplete last — it is the part that makes the list change under the user, so everything else
   should be stable first.

A Playground page and a painter per new slot are part of each step, not a follow-up: the library
paints nothing, so an unpainted component cannot be looked at.
