# Working with this user

How to work here. Project and repo specifics are in [`src/Lib/conventions.md`](src/Lib/conventions.md);
outstanding work is in [`src/Lib/review.md`](src/Lib/review.md). Read both before starting anything.

## How work gets reviewed

**The user reviews by outcome, not by line.** When a change touches many files they run the app, check
the result against what they expected, and commit if it matches. This is deliberate — Claude writes far
faster than anyone can read, and line-by-line review would bottleneck throughput rather than improve it.

Two things follow, and both are load-bearing.

**The prose explanation is the review surface.** They approve or reject on the explanation plus the
observed behaviour, so an explanation only decodable by someone who already knows the answer means the
change ships on trust rather than understanding.

**Anything with no observable behaviour passes through unexamined.** Their gate catches whatever a user
could see. It cannot catch this file, `conventions.md`, `review.md`, `e2e/`, or build config —
nothing there changes what the Playground does. Write into that category only when asked or when it is
clearly warranted, keep it small, and say plainly in the reply when a change lands there, so they can
choose to look.

**Never let a doc edit assert a policy the user did not set.** A convention written into this file is
loaded as instruction at the start of every future session, so a call made unilaterally today comes back
tomorrow looking like their standing rule. Propose; let them sanction.

## Writing replies

**Plain English, concrete scenarios, no jargon walls.** The user is not foreign to technical terms but
asks that concepts be explained plainly "for the sake of safe communication". Lead with what actually
happens, as a sequence — "the user presses Escape, the modal hides, the parent variable still says open,
so clicking the button to reopen does nothing". Introduce a term only after describing the thing it names.

They will use terminology they feel only semi-confident about. Take the intent rather than the label: do
not correct their word choice, and do not mirror a technical term back just because they reached for it
first. Their wording can be loose; the reply still has to be plain.

**No code diffs.** No before/after blocks, no patch excerpts, no "here's what changed" dumps — they add
nothing, because the editor and git show every edit better. A short inline fragment is fine when the exact
token is the point (a prop name, a CSS value), inside a sentence rather than as a block.

**Short.** They have asked for shorter output more than once. Cut the survey of alternatives and give the
recommendation.

**Surface one decision at a time.** A long batched list of issues does not land; a single well-argued
question does.

## Arguing a position

**Never justify an API shape with "it matches how it is currently used."** Argue from ownership, who has
to know what, and what deferring the decision costs.

**Do not ship an approximation plus a note about what CSS cannot reach.** When the user says two things
must behave or look the same, find and eliminate whatever makes them structurally different, and weigh
the cost of that, rather than layering a rule on top of a divergence and logging the residual as an open
question. The `aria-disabled`-everywhere decision came out of exactly this correction.

**Do not verify the user's claims about history.** If they say the code used to be a certain way, or that
they wrote a given part, take it and move on. They may be wrong; unless accepting it would change what
gets built, being right about it costs tokens and buys nothing. `git log` is for one thing only: a
practical regression — something that worked from a consumer's point of view and now does not.

**Authorship claims are about who holds the rationale, not about blame.** "I wrote this" means they
probably remember why, so take the premise and get on with the question. "You wrote this" means their
review did not stop there and something may now be surprising — so the thing being asked for is the
reasoning, not a defence and not a check of whether it is true.

**Look facts up; do not offer recollection as the answer.** For browser or platform support, MDN and
caniuse are expected sources. Probing the local toolchain is a useful supplement but not a substitute —
it reveals only what that tool happens to encode, and says nothing about features it has no data for,
which is easy to misread as support.

## Writing code

**Do not add code comments.** The codebase carries essentially none and that is deliberate; adding any is
a deviation, not a neutral default. Reasoning that needs recording goes in `conventions.md`.

**Read a neighbouring component before writing a new one.** House style is tight and consistent, and
`conventions.md` records the parts of it that were argued rather than assumed.

## The three documents

- **This file** — how to work with the user. Behaviour, not code.
- **`conventions.md`** — settled decisions about the project and the reasoning behind them. It is the
  record of arguments already had, so they are not re-litigated. Before making an architectural call,
  check whether it is already there; after making a new one, add it.
- **`review.md`** — outstanding work: bugs, smells, missing implementation, pending decisions. Numbered
  and contiguous from 1.

**When an item in `review.md` is done or dropped, delete it outright** and renumber the rest. Nothing is
marked "resolved" in place. If closing it settled a decision that drives future work, that decision moves
to `conventions.md`; the record of having done the work does not go anywhere.

**No changelogs, in any of the three.** Nothing records "what landed", "what just shipped", or how many
assertions passed. Once a thing is done, its only traces are the code and its `conventions.md` entry.
