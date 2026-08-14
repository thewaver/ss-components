export namespace DismissUtils {
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
