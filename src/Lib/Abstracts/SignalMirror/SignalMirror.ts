import type { Signal } from "solid-js";
import { createEffect, createSignal, untrack } from "solid-js";

export namespace SignalMirror {
    export const createMirror = <TOuter, TInner>(
        getOuter: () => TOuter,
        setOuter: (value: TOuter) => void,
        opts: {
            toInner: (value: TOuter) => TInner;
            toOuter: (value: TInner) => TOuter;
            getIsSame?: (a: TOuter, b: TOuter) => boolean;
        },
    ): Signal<TInner> => {
        const getIsSame = opts.getIsSame ?? ((a: TOuter, b: TOuter) => a === b);

        const inner = createSignal(opts.toInner(untrack(getOuter)));

        createEffect(() => {
            const value = getOuter();

            if (
                getIsSame(
                    value,
                    untrack(() => opts.toOuter(inner[0]())),
                )
            )
                return;

            inner[1](() => opts.toInner(value));
        });

        createEffect(() => {
            const value = opts.toOuter(inner[0]());

            if (getIsSame(untrack(getOuter), value)) return;

            setOuter(value);
        });

        return inner;
    };

    /**
     * The signal a component owns unless it was handed one.
     *
     * This is what lets a popup's open state be private by default and shared when a consumer asks, without the
     * component growing two code paths for it. The prop is read through on every access rather than once at
     * setup, so a consumer may hand one over later or take it away, and the fallback keeps whatever state it had.
     */
    export const createOptional = <T>(getSignal: () => Signal<T> | undefined, initial: T): Signal<T> => {
        const fallback = createSignal<T>(initial);
        const pick = () => getSignal() ?? fallback;

        return [() => pick()[0](), (...args: unknown[]) => (pick()[1] as (...a: unknown[]) => T)(...args)] as Signal<T>;
    };

    export const createValueMirror = <T>(
        getOuter: () => T,
        setOuter: (value: T) => void,
        getIsSame?: (a: T, b: T) => boolean,
    ) => createMirror<T, T>(getOuter, setOuter, { toInner: (value) => value, toOuter: (value) => value, getIsSame });
}
