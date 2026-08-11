export namespace DismissUtils {
    /**
     * Whether a pointer landed inside one of `roots` **or inside a layer one of them opened**.
     *
     * A popup is portalled to the end of the document, so a popup opened from inside another popup is a DOM
     * sibling of it rather than a descendant, and `contains` reports it as outside. That is what made a
     * `Select` inside a `DatePicker` dismiss the calendar the moment an option was clicked.
     *
     * The walk goes up the tree, and every time it reaches an element something else points at with
     * `aria-controls` it jumps to that controller and keeps going. Ownership is already in the markup for
     * accessibility reasons, so nothing has to be registered and no order has to be maintained. It does not
     * replace a proper layer stack — a stack also decides which of several open layers a stray press closes,
     * which this cannot.
     */
    export const getIsWithinOwnedLayer = (target: Node | null, roots: (HTMLElement | null | undefined)[]) => {
        let node = target instanceof Element ? target : (target?.parentElement ?? null);

        while (node) {
            const current = node;

            if (roots.some((root) => root?.contains(current))) return true;

            const owner = current.id ? document.querySelector(`[aria-controls="${CSS.escape(current.id)}"]`) : null;

            node = owner ?? current.parentElement;
        }

        return false;
    };
}
