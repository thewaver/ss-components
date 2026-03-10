import { Accessor, JSX } from "solid-js";

type NonNullish<T> = T extends undefined | null ? never : T;

type IsPrimitive<T> = T extends string | number | boolean | bigint | null | undefined ? true : false;

type IsNonReactive<T> = T extends ((...args: any) => any) | JSX.Element | Date | Map<any, any> | Set<any> | symbol
    ? true
    : false;

type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;

type IsSkippable<T> = IsPrimitive<NonNullish<T>> extends true ? false : IsNonReactive<NonNullish<T>>;

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
