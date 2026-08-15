# Lib brief

Everything outstanding in `src/Lib`, one line per fault, grouped by kind rather than by component. The
number after each line is its item in `backlog.md`, which holds the reasoning; this file holds none. The two
are edited together, and where they disagree this one is what gets corrected.

**Accepted limits are not here**, for the same reason they are not in the numbered items: they are not
outstanding work. They are at the end of `backlog.md`.

| Section | Count |
| --- | ---: |
| [Missing components](#missing-components) | 9 |
| [Pending abstractions](#pending-abstractions) | 12 |
| [Blockers and known issues](#blockers-and-known-issues) | 15 |
| [Accessibility gaps](#accessibility-gaps) | 5 |
| [Planned projects](#planned-projects) | 2 |

---

## Missing components

Ordered by the user on 2026-08-15. A toolbar, a segmented control, a rating input, `Skeleton`, `Avatar`,
`Badge`, `Card` and `Icon` were dropped on the same day and are not listed anywhere.

| # | What | Standing |
| --- | --- | --- |
| 26 | **`Stepper`** | **Top priority.** Horizontal and vertical both wanted. Needs per-section validity to gate on |
| 7 | **`TimePicker`** | A time popup; unresolved whether it is a mode on `TimeInput` or its own control |
| 7 | **A date-and-time value** | Nothing composes the two fields, and which signal owns the pair is undecided |
| 7, 14 | **Range variants** | `RangeCalendar`, `DateRangePicker`; decide once for both |
| 9 | **A field section / fieldset** | Nothing groups fields into sections with their own validity — what `Stepper` gates on |
| 15 | **Eyedropper, swatch presets, recent colours** | All paint plus a value write; whether presets need a slot depends on the keyboard order |
| 6 | **`menuitemcheckbox` / `menuitemradio`, context opener** | Stateful items are the line `Menu` sits on the other side of |
| 8 | **`Table` / data grid** | **Bottom of the list.** A project rather than a component |
| 8 | **A command palette** | **Bottom of the list.** `Select`'s autocomplete in a `Modal`, plus grouped sources and a page-wide hotkey |

## Pending abstractions

| # | What | What it would serve |
| --- | --- | --- |
| 2, 9 | **One-shot pointer geometry** | Where a single activation landed, for ripples |
| 13 | **A shared measuring abstract** | Neighbour heights for a toast pile, auto-height elsewhere |
| 19 | **One flattener instead of two** | `SelectUtils.getFlatOptions` and `TreeUtils.getVisibleRows` |
| 11 | **Geometry split out of markup** | Three SVG defs files, ~950 lines currently untestable |
| 5, 6, 19 | **A per-item text source** | The missing half of typeahead in `Select`, `Menu` and `Tree` |
| 5, 19 | **Shared `CheckedState`** | `Select`'s group header and a multi-select `Tree` |
| 5, 19 | **Windowing over nested lists** | A group box straddling the window edge, unanswered for both |
| 20, 23 | **Outward position signals** | `SlideButton`'s progress, `Scroller`'s scroll position |
| 9 | **Getter-plus-setter on controls** | Today a consumer wraps one in a `SignalMirror` first |
| 4 | **Easing on the cell timeline** | Cell animation is linear-only |
| 7 | **A typed sign, a non-uniform group pattern** | No negative currency; `en-IN` groups wrong today |
| 7 | **`TextSyncUtils` exported** | Three in-library consumers now argue for it |

## Blockers and known issues

| # | Where | What happens |
| --- | --- | --- |
| 10 | **`AudioSwitcher`, `RichText`** | No Playground page; `AudioSwitcher`'s `playbackSignal` has never been run |
| 10 | **Every popup layer** | Opens one frame behind; the first placement depends on the frame poll |
| 18 | **`Viewport`** | A fast scroll shows a frame of drift |
| 18 | **`Viewport`, nested** | An unsized host renders nothing and says nothing |
| 18 | **`Toasts`** | Fixed `z-index: 200`, outside the anchor-relative rule; nested-viewport case unexamined |
| 5 | **`Select`, windowed** | Rows sit a hairline apart under rounding, visible with a per-row background |
| 5 | **`Select`, filtered** | A filter injecting a non-matching option lands the highlight on it |
| 6 | **`Menu`** | `Tab` returns to the trigger rather than moving past it |
| 20 | **`SlideButton`** | A `pointercancel` at the end of travel reads as a completed gesture |
| 14 | **`Calendar`** | The disabled predicate runs 42 times per render; 42 `InteractionWrapper`s unmeasured |
| 16, 25 | **`Accordion`, `Carousel`** | Every panel and every slide is built; forced by the track width in `Carousel` |
| 19 | **`Tree`** | Cannot express a branch whose children have not loaded |
| 23 | **`Scroller`** | A second press mid-scroll advances less than a page |
| 13 | **`Toasts`** | An id re-added while leaving fades back in instead of restarting |
| 22, 16 | **`Spotlight`, `Accordion`** | Nothing scrolls the highlighted element or the newly opened section into view |

## Accessibility gaps

They cluster, and no single item owns them.

| # | Where | What is missing |
| --- | --- | --- |
| 20, 22, 14 | **`SlideButton`, `Spotlight`, `Calendar`** | Nothing announces progress, a step change or a month change; `LiveAnnouncer` exists, the wording is undecided |
| 13 | **`Toasts`** | No keyboard route into the stack; urgency is per region, not per toast |
| 22 | **`Spotlight`** | `prompt` cannot hide the page from a screen reader — `inert` cannot be lifted off a descendant |
| 17, 19 | **`Tabs`, `Tree`** | No automatic activation; no typeahead, which departs from the published pattern |
| 25 | **`Carousel`** | With no `renderControls` there is no keyboard route at all |

## Planned projects

| # | What | Standing |
| --- | --- | --- |
| 21 | **The same source view on `Variants`** | Blocked on where a variant's file lives — ~150 close over page signals |
| 12 | **A consumer-facing layer above the library** | **Deferred indefinitely, not a focus, do not raise it.** The `style.css` strip and the theme are both built |
