export type LiveAnnouncerPoliteness = "polite" | "assertive";

const MESSAGE_LIFETIME_MS = 1000;
const POLITENESS: LiveAnnouncerPoliteness[] = ["polite", "assertive"];

const regions = new Map<LiveAnnouncerPoliteness, HTMLElement>();

/**
 * Visually hidden without `display: none` or `visibility: hidden`, either of which takes the element out of
 * the accessibility tree along with the paint and announces nothing at all. The clip-rect idiom is the one
 * that leaves the text readable to assistive technology, and it lives here rather than in a consumer's
 * stylesheet because the element is the library's.
 */
const applyHiddenStyle = (element: HTMLElement) => {
    element.style.position = "fixed";
    element.style.top = "0";
    element.style.left = "0";
    element.style.width = "1px";
    element.style.height = "1px";
    element.style.margin = "-1px";
    element.style.padding = "0";
    element.style.overflow = "hidden";
    element.style.clipPath = "inset(50%)";
    element.style.whiteSpace = "nowrap";
    element.style.border = "0";
};

const getRegion = (politeness: LiveAnnouncerPoliteness) => {
    const existing = regions.get(politeness);

    if (existing?.isConnected) return existing;

    const region = document.createElement("div");

    region.setAttribute("role", "log");
    region.setAttribute("aria-live", politeness);
    region.setAttribute("aria-relevant", "additions");
    applyHiddenStyle(region);
    document.body.appendChild(region);
    regions.set(politeness, region);

    return region;
};

export namespace LiveAnnouncer {
    /**
     * Says something to assistive technology that nothing on the page is going to say by itself.
     *
     * **It belongs to no component, which is the whole point.** A live region only announces content
     * inserted into it after it is already in the document, so a region a component mounts and unmounts with
     * itself announces nothing on the render that mattered. Two module-level regions, created on first use
     * and kept, sidestep that — and they also serve the case where the text a reader needs is markup the
     * consumer owns and the library cannot reach, which is what `Calendar`'s month title is.
     *
     * **Each message is its own node, removed a second later.** Setting the text of one persistent node does
     * not re-announce an identical string, so paging back to a month you were just on would be silent.
     * Appending a fresh child is an addition every time, which is what `aria-relevant="additions"` says to
     * watch for.
     */
    export const announce = (message: string, politeness: LiveAnnouncerPoliteness = "polite") => {
        if (!message) return;

        const node = document.createElement("div");

        node.textContent = message;
        getRegion(politeness).appendChild(node);

        setTimeout(() => {
            node.remove();
        }, MESSAGE_LIFETIME_MS);
    };

    /** For a test or a teardown that wants the document back as it found it. */
    export const clear = () => {
        for (const politeness of POLITENESS) {
            regions.get(politeness)?.remove();
            regions.delete(politeness);
        }
    };
}
