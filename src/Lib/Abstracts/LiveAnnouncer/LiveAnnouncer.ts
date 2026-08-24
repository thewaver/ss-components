export type LiveAnnouncerPoliteness = "polite" | "assertive";

const MESSAGE_LIFETIME_MS = 1000;
const POLITENESS: LiveAnnouncerPoliteness[] = ["polite", "assertive"];

const regions = new Map<LiveAnnouncerPoliteness, HTMLElement>();

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
    export const reserve = (politeness: LiveAnnouncerPoliteness = "polite") => {
        getRegion(politeness);
    };

    export const announce = (message: string, politeness: LiveAnnouncerPoliteness = "polite") => {
        if (!message) return;

        const node = document.createElement("div");

        node.textContent = message;
        getRegion(politeness).appendChild(node);

        setTimeout(() => {
            node.remove();
        }, MESSAGE_LIFETIME_MS);
    };

    export const clear = () => {
        for (const politeness of POLITENESS) {
            regions.get(politeness)?.remove();
            regions.delete(politeness);
        }
    };
}
