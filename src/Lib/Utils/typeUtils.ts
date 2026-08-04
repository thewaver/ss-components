import type { Accessor } from "solid-js";

type NonNullish<T> = T extends undefined | null ? never : T;

/**
 * Skip (leave plain) only when the prop is:
 * - already an accessor / callback (functions — natively reactive or never reactive)
 * - a symbol (never reactive)
 *
 * Everything else is accessorized to `getX`.
 */
type IsSkippable<T> = NonNullish<T> extends ((...args: any) => any) | symbol ? true : false;

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

type PrefixKeyWithGet<K> = K extends string ? `get${Capitalize<K>}` : never;

type AccessorizedPart<T extends object> = {
    [K in keyof T as IsSkippable<T[K]> extends false ? PrefixKeyWithGet<K & string> : never]: IsOptional<
        T,
        K
    > extends true
        ? Accessor<Exclude<T[K], undefined>> | undefined
        : Accessor<T[K]>;
};

type SkippedPart<T extends object> = {
    [K in keyof T as IsSkippable<T[K]> extends true ? K : never]: T[K];
};

export type AccessorProps<T extends object> = AccessorizedPart<T> & SkippedPart<T>;
