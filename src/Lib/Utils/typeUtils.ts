import type { Accessor, Signal } from "solid-js";

type NonNullish<T> = T extends undefined | null ? never : T;

type IsSkippable<T> = NonNullish<T> extends ((...args: any) => any) | symbol | Signal<any> ? true : false;

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

export type MaybeAccessor<T> = T | Accessor<T>;

export type AccessorProps<T extends object> = {
    [K in keyof T]: IsSkippable<T[K]> extends true
        ? T[K]
        : IsOptional<T, K> extends true
          ? MaybeAccessor<Exclude<T[K], undefined>>
          : MaybeAccessor<T[K]>;
};
