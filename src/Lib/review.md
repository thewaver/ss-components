# Lib code review

Outstanding problems in `src/Lib` — bugs, code and architectural smells, missing implementation.
Nothing else belongs here. Once an item is fixed or dropped it is deleted outright rather than
marked resolved, and the remaining items are renumbered to stay contiguous from 1. Settled
decisions and the reasoning behind them live in `conventions.md`.

### Index

1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
2. Nothing that verifies interaction lives in the repo — _open_
3. The Playground's blanket `input` rules now fight a real component — _open_
4. One-shot positioned effects have nowhere to go — _open_
5. Neither animation component can paint its own background — _open_
6. Cell animation timing is linear-only — _open_
7. Parity-based weights break when the origin lands on a half-pixel — _open_
8. `Select` — six things deliberately not built — _open_

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

## 2. Nothing that verifies interaction lives in the repo

Interaction can be driven with no dependency at all — headless Chrome over the DevTools Protocol from
Node, per `CLAUDE.md` → _"Verifying interaction"_, which records the invocation and the three traps.
The problem is that no such script is committed, so nothing is repeatable and every behaviour below is
unexercised on any given day.

The work left is to make it runnable from the repo: a `verify:dom` npm script and one assertion file
per control. That needs a decision about where non-shipped tooling lives, since `src/Lib` and
`src/Playground` are both wrong homes for it.

What such a suite has to cover, all of it invisible in markup and none of it currently checked:

- `BinarySwitch` — the tri-state resolution when a mixed control is clicked, and the refused-write
  resync in `syncElement`, which is the whole reason that function exists.
- `RadioGroup` — the arrow walk and its skip-a-disabled-option-but-still-focus-a-reachable-one rule.
- `Label` — a caption click reaching a disabled control and being stopped, and the `aria-label`
  suppression warning, which has no path in the Playground at all and so has never run.
- `TextInput` / `TextSync` — the composition gating, and the `null` selection guard that keeps
  `type="email"` from throwing. `readonly` as the disabled mechanism is checkable as an attribute, but
  the fact that it actually stops a paste is not.
- `Select` / `MultiSelect` — the whole surface, since it is the largest behavioural component here.

Markup alone stays cheaper to check with `--dump-dom` against `npm run preview` (`conventions.md`
records that invocation and the Edge caveat). The protocol driver is for everything else.

---

## 3. The Playground's blanket `input` rules now fight a real component

`style.css` styles `input:not([type="range"])`, `select` and `textarea` with padding, border,
background and font — specificity 0,1,1, which outranks any class. That is already why
`BinarySwitch.css.ts` carries a block of `!important` resets, and it is a fair trade there because
the library's checkbox input is a blank slate nobody else styles.

`TextInput` broke the trade, because the element the rules hit is one the **consumer** must style.
The consumer's half of that is now gone — `computeTextStyle` applies as an inline style, which
outranks every selector, and `TextInputContent.css.ts` dropped the four `globalStyle` blocks it only
had to buy a specificity point. What remains is the library's own escalation: `cursor` is reset with
`!important` purely because `input:hover:not(…)` at 0,3,1 would otherwise force `pointer` onto a
text field, and the box resets in `TextInput.css.ts` and `BinarySwitch.css.ts` carry `!important`
for the same reason.

The root cause is that those rules exist to style the Playground's **own** chrome — the search box,
the props panels — and were written before the library shipped anything they could collide with.
Scoping them to that chrome would remove the escalation on both sides and probably let several of
`BinarySwitch.css.ts`'s `!important`s go too. Not done here because it touches roughly thirty
unclassed `<input>` call sites across `ShapePage`, `ScanLineAnimationPage` and `TypewriterPage`,
which is its own change.

---

## 4. One-shot positioned effects have nowhere to go

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

## 5. Neither animation component can paint its own background

Both require a `getSrc` and slice that image. The React-era component could instead fill each cell
with `currentColor` over its own children, which is what made a reveal-over-content effect possible —
an animated button, a wipe over a card. Adding it means a children slot and a size anchor that is not
an `<img>`, so the sizing path would diverge from `ScanlineAnimation`'s unless both change together.
Worth deciding once, for both.

---

## 6. Cell animation timing is linear-only

`computeLocalTimeline` maps the timeline linearly and `sampleTrack` interpolates linearly between
stops, so nothing can ease. The React-era component took a timing function per keyframe
(`linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`) and applied it to each cell's playback.

Restoring it is an easing function applied to the local timeline before the stops are sampled, and
needs nothing outside the samples file.

---

## 7. Parity-based weights break when the origin lands on a half-pixel

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

## 8. `Select` — six things deliberately not built

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
