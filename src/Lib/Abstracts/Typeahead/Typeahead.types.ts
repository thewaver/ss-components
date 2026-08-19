export type TypeaheadDefs = {
    getTimeoutMs?: () => number;
};

export type TypeaheadHandle = {
    getQuery: () => string;
    push: (e: KeyboardEvent) => string | undefined;
    clear: () => void;
};
