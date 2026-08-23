import type { MaybeAccessor } from "./typeUtils";

export const access = <T>(value: MaybeAccessor<T>): T => (typeof value === "function" ? (value as () => T)() : value);
