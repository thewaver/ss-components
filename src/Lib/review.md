# Lib code review

Outstanding problems in `src/Lib` — bugs, code and architectural smells, missing implementation.
Nothing else belongs here. Once an item is fixed or dropped it is deleted outright rather than
marked resolved, and the remaining items are renumbered to stay contiguous from 1. Settled
decisions and the reasoning behind them live in `conventions.md`.

### Index

1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
2. Nothing that needs a click or a keystroke has ever been verified — _open_
3. The Playground's blanket `input` rules now fight a real component — _open_
4. One-shot positioned effects have nowhere to go — _open_
5. Neither animation component can paint its own background — _open_
6. Cell animation timing is linear-only — _open_
7. Parity-based weights break when the origin lands on a half-pixel — _open_
8. `getTooltipDefs` is switched on presence, which a data-driven list cannot express cleanly — _open_
9. `Select` is designed but not built — _open_

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

## 2. Nothing that needs a click or a keystroke has ever been verified

There is no test environment, and every entry written here has ended with some version of "reasoned
about, not seen working". That was tolerable while the library was mostly rendering; it is not any
more, because the controls now carry real behaviour whose failures are invisible in markup.

Currently unexercised, all of it in `Fundamentals/Input`: the tri-state resolution when a mixed
control is clicked, the refused-write resync in `BinarySwitch.syncElement` (the whole reason that
function exists), the radio arrow walk and its skip-a-disabled-option-but-still-focus-a-reachable-one
rule, `Label`'s caption click reaching a disabled control and being stopped, and the `aria-label`
suppression's warning branch, which has no path in the Playground at all and so has never run.

`TextInput` made this worse rather than incrementally longer, because it is the first control that
is **entirely** keystrokes. Nothing in `TextInput.syncElement` can be seen in markup: not the caret
restore after a transforming setter, not the resync after a refusing one, not the composition
gating, not the `null` selection guard that keeps `type="email"` from throwing. `readonly` as the
disabled mechanism is likewise invisible — the attribute is checkable, the fact that it actually
stops a paste is not.

Markup can still be checked without any dependency: headless Chrome with `--dump-dom` against
`npm run preview`, which is how the roving tab order and the ARIA roles were confirmed
(`conventions.md` records the invocation and the Edge caveat). The gap is interaction, and closing
it means either a driver (Playwright, which is a real dependency decision) or a DOM-level test
runner. Deferred deliberately when `TextInput` landed rather than overlooked.

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

## 8. `getTooltipDefs` is switched on presence, which a data-driven list cannot express cleanly

`InteractionWrapper` decides both whether to render a `Tooltip` and whether a disabled control is
reachable from `props.getTooltipDefs !== undefined` — the presence of the prop, not the value it
returns. That is deliberate and correct for a control written by hand, and _"presence as a guard
fails toward the safe default"_ in `conventions.md` is the reasoning behind it.

It does not survive contact with a group that renders its items from records. A per-item
`tooltipDefs` field has to reach the wrapper as a prop that is sometimes absent, so the group must
forward it conditionally — `getTab().tooltipDefs && (() => getTab().tooltipDefs!)` — and pass a
function that returns `undefined` if it does not, which crashes the spread into `Tooltip`. Solid's
props getters make the conditional form reactive, so it does work, but it is a trap laid for whoever
writes the next group, and the failure is a runtime crash rather than a type error.

`Tabs` sidesteps it by not carrying the field (see `conventions.md`). `Select` cannot: an option that
is disabled for a reason is exactly the case reachability exists for. The fix is to let the value
decide — render the `Tooltip` on `getTooltipDefs?.() !== undefined` and compute reachability from the
same — which costs the guard its "only when a prop was explicitly set" property and needs that
trade-off thought through before it lands.

---

## 9. `Select` is designed but not built

The shape is settled — data-driven records identified by value, one `InteractionWrapper` per option,
a popup on `Abstracts/Anchor` rather than on `Tooltip` — and `Tabs` was refactored to that shape
first so it is exercised by something shipped. The full brief, the rejected alternatives and the
build order live in `select.md`; this entry exists so the index stays the one place outstanding work
is listed.

It is blocked on item 8 above, which every option depends on, and carries four undecided questions
of its own: single versus multi as one component or two, whether the field composes `TextInput`,
whether the component or the consumer owns filtering, and how groups are represented.
