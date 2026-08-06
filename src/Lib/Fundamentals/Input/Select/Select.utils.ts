import type { SelectItem, SelectOption, SelectOptionGroup } from "./Select.types";

export namespace SelectUtils {
    export const getIsGroup = <T>(item: SelectItem<T>): item is SelectOptionGroup<T> => "options" in item;

    export const getFlatOptions = <T>(items: SelectItem<T>[]): SelectOption<T>[] =>
        items.flatMap((item) => (getIsGroup(item) ? item.options : [item]));
}
