import { createSignal, onCleanup } from "solid-js";

import type { TypeaheadDefs, TypeaheadHandle } from "./Typeahead.types";
import { TypeaheadUtils } from "./Typeahead.utils";

const DEFAULT_TYPEAHEAD_TIMEOUT_MS = 1000;
const EMPTY_QUERY = "";

export namespace Typeahead {
    export const createBuffer = (defs?: TypeaheadDefs): TypeaheadHandle => {
        const [getQuery, setQuery] = createSignal(EMPTY_QUERY);

        let timer: ReturnType<typeof setTimeout> | undefined;

        const clear = () => {
            clearTimeout(timer);
            timer = undefined;
            setQuery(EMPTY_QUERY);
        };

        onCleanup(clear);

        return {
            getQuery,
            clear,
            push: (e) => {
                if (!TypeaheadUtils.getIsQueryKey(e, getQuery() !== EMPTY_QUERY)) return;

                const next = getQuery() + e.key;

                clearTimeout(timer);
                timer = setTimeout(clear, defs?.getTimeoutMs?.() ?? DEFAULT_TYPEAHEAD_TIMEOUT_MS);
                setQuery(next);

                return next;
            },
        };
    };
}
