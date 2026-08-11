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

**Never drop an unexplained acronym or term of art.** Prefer the ordinary-words description — "a function
that runs the moment the file loads", not "IIFE". If a term genuinely is the clearest handle, define it in
the same sentence it first appears in, then use it freely. This applies to written documents as much as to
chat.

**No code diffs.** No before/after blocks, no patch excerpts, no "here's what changed" dumps — they add
nothing, because the editor and git show every edit better. A short inline fragment is fine when the exact
token is the point (a prop name, a CSS value), inside a sentence rather than as a block.

**Short.** They have asked for shorter output more than once. Cut the survey of alternatives and give the
recommendation. An acknowledgement or a decision is one or two lines. Do not recap work already reported,
do not re-list open items they have already seen, and do not close by offering next steps unless asked.
Detail belongs in the files, not repeated in chat.

**A choice between approaches is a pros-and-cons list, not prose.** Asked for on **2026-08-11**, after three
prose answers in a row were called too verbose. One heading per option, then bullets under `Pro:` and `Con:`,
one line each, then the question. No paragraphs around it, no preamble, no recommendation dressed as
narrative — the trade-offs stand side by side so they can be compared by eye. If an option is a non-starter
it still gets listed with the reason as its con, rather than argued away in a sentence above the list.

The reasoning that would have gone into those paragraphs goes into `review.md` or `conventions.md`, which is
where length is wanted.

**Surface one decision at a time.** A long batched list of issues does not land; a single well-argued
question does. They often work by voice and read in short bursts, so a bundled reply means the important
item competes with three others and none land. When several decisions genuinely exist, say there are N
pending and present only the first. This governs the reply, not the work — still do the whole task, and
still write the full reasoning into `conventions.md` and `review.md`, where length is wanted.

## Arguing a position

**Never justify an API shape with "it matches how it is currently used."** Argue from ownership, who has
to know what, and what deferring the decision costs. Consumption patterns change, so a signature defended
by them has nothing load-bearing behind it. State the intrinsic rule first, then check it against the
code — and say so plainly when the rule does not cleanly acquit the current design. Concede a weak opening
argument rather than defending it.

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

## Running things

**Never kill the user's processes.** No `pkill`, no killing a dev server, no stopping anything you did not
start. They keep `npm start` running while working, and losing it interrupts them. `npm run verify:dom`
serves a production preview on its own port and `reuseExistingServer` handles a stale one, so it never
needs the dev server out of the way — and if a port really is taken, say so rather than clearing it.

## Writing code

**When you find something broken and can fix it, fix it — do not stop to ask.** Stated by the user on
**2026-08-11**, after two rounds of reporting a date bug and waiting for permission before touching it.
Two conditions, and they are the whole of it: the fix must not add a package, and it must not break
something that already works. A defect that meets both is not a decision to surface — surfacing it costs
a round trip and leaves the code broken in the meantime. Report what was fixed afterwards.

This does not loosen _"Do not bundle a judgment call into a bug fix"_ below; the two are about different
things. Fix the defect on sight; still raise the taste question separately.

**Do not add code comments.** The codebase carries essentially none and that is deliberate; adding any is
a deviation, not a neutral default. Never write a `//` note inside a function body or a literal. Reasoning
that needs recording goes in `conventions.md`, or in the reply. Correcting or deleting a comment that is
already there is fine — that is editing what exists, not adding. If a change seems to need an inline
comment to be understandable, that is a signal the code should be clearer instead.

**`/** */` blocks above declarations stay, but are not added unprompted in `src/Lib` or `src/Playground`.**
Where one already sits above a function or an exported declaration it is wanted: keep it, and update it
when the thing it describes changes. Do not attach a new one to a declaration that has none unless asked
for it. **`e2e/` is the exception** — explanatory blocks are welcome there, and the existing specs carry
them, so a new spec should read like its neighbours.

**Read a neighbouring component before writing a new one.** House style is tight and consistent, and
`conventions.md` records the parts of it that were argued rather than assumed. Copy the neighbour's shape
rather than writing generically idiomatic Solid: code that reads as if they wrote it costs nothing to
review, code that does not forces a translation pass on every line. When a new API needs a convention that
does not exist yet, derive it from the closest existing one and record it in `conventions.md` rather than
inventing freely.

**Do not bundle a judgment call into a bug fix.** Ship the defect fix on its own; do not carry a subjective
design, API-surface, or performance change along under the fix's justification, and never list a taste
change under the same `review.md` item as the bug it travelled with. A change riding along on a real fix
is hard to spot in review and inherits credibility it has not earned, and the user often has context or
measurements the code does not show. Raise the judgment call separately, in one sentence, and let them
answer. When merging two implementations that disagree on a constant, keep both behaviours — a parameter
with per-call-site defaults — rather than picking a winner.

**Treat anything measured as the user's call.** Cache sizes, thresholds, epsilons and similar tuned values
are decisions backed by benchmarks you cannot see. Flag a concern; do not change one unsupervised.

## The three documents

- **This file** — how to work with the user. Behaviour, not code.
- **`conventions.md`** — settled decisions about the project and the reasoning behind them. It is the
  record of arguments already had, so they are not re-litigated. Before making an architectural call,
  check whether it is already there; after making a new one, add it.
- **`review.md`** — outstanding work: bugs, smells, missing implementation, pending decisions. Numbered
  and contiguous from 1. Its last section, **_Accepted limits_**, is the exception: faults consciously left
  alone, unnumbered and outside the index. **They are not "what's left".** Do not raise one in a report on the
  state of the project, do not re-argue the trade, and do not weigh one against real work — say something only
  if a change has made the recorded reasoning wrong. Moving an item into that section is the user's decision to
  take, never a way to retire an item that has gone quiet.

**When an item in `review.md` is done or dropped, delete it outright** and renumber the rest. Nothing is
marked "resolved" in place. If closing it settled a decision that drives future work, that decision moves
to `conventions.md`; the record of having done the work does not go anywhere.

**No changelogs, in any of the three.** Nothing records "what landed", "what just shipped", or how many
assertions passed. Once a thing is done, its only traces are the code and its `conventions.md` entry.
