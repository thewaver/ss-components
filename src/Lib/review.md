# Lib code review

Outstanding problems in `src/Lib` — bugs, code and architectural smells, missing implementation.
Nothing else belongs here. Once an item is fixed or dropped it is deleted outright rather than
marked resolved, and the remaining items are renumbered to stay contiguous from 1. Settled
decisions and the reasoning behind them live in `conventions.md`.

### Index

1. `Show when={... ?? EMPTY_ARRAY} keyed` can't fire as written — _parked_
2. Nothing that needs a click or a keystroke has ever been verified — _open_
3. One-shot positioned effects have nowhere to go — _open_

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
suppression and its warning — that last one has no correct-usage path in the Playground at all, so
it has never run.

Markup can already be checked without any dependency: headless Chrome with `--dump-dom` against
`npm run preview`, which is how the roving tab order and the ARIA roles were confirmed
(`conventions.md` records the invocation). The gap is interaction, and closing it means either a
driver (Playwright, which is a real dependency decision) or a DOM-level test runner. Worth a
deliberate choice rather than drifting further.

---

## 3. One-shot positioned effects have nowhere to go

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
