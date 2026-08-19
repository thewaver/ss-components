const SPACE_KEY = " ";
const SINGLE_CHARACTER = 1;
const NOT_HIDDEN = "false";

const readText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? "";
    if (!(node instanceof Element)) return "";

    const hidden = node.getAttribute("aria-hidden");

    if (hidden !== null && hidden !== NOT_HIDDEN) return "";

    return [...node.childNodes].map(readText).join("");
};

export namespace TypeaheadUtils {
    export const getElementText = (element: Element | null | undefined) => (element ? readText(element) : "");

    export const getIsQueryKey = (e: KeyboardEvent, hasQuery: boolean) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return false;
        if ([...e.key].length !== SINGLE_CHARACTER) return false;

        return e.key !== SPACE_KEY || hasQuery;
    };

    export const getIsRepeat = (query: string) =>
        query.length > SINGLE_CHARACTER && [...query].every((character) => character === query[0]);

    export const computeNextIndex = (
        query: string,
        from: number,
        length: number,
        computeText: (index: number) => string,
    ) => {
        if (length < 1 || query.length < 1) return;

        const search = (getIsRepeat(query) ? query[0] : query).toLowerCase();
        const start = search.length === SINGLE_CHARACTER ? 1 : 0;

        for (let offset = start; offset < length; offset++) {
            const index = (Math.max(from, 0) + offset) % length;

            if (computeText(index).trimStart().toLowerCase().startsWith(search)) return index;
        }
    };
}
