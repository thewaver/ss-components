import type { SelectItem, SelectOption, SelectOptionGroup, SelectRow } from "./Select.types";

export namespace SelectUtils {
    export const getIsGroup = <T>(item: SelectItem<T>): item is SelectOptionGroup<T> => "options" in item;

    export const getFlatOptions = <T>(items: SelectItem<T>[]): SelectOption<T>[] =>
        items.flatMap((item) => (getIsGroup(item) ? item.options : [item]));

    export const getRows = <T>(items: SelectItem<T>[]): SelectRow<T>[] => {
        const rows: SelectRow<T>[] = [];

        let optionIndex = 0;

        items.forEach((item, itemIndex) => {
            if (!getIsGroup(item)) {
                rows.push({ group: undefined, groupIndex: undefined, option: item, optionIndex });
                optionIndex += 1;

                return;
            }

            rows.push({ group: item, groupIndex: itemIndex, option: undefined, optionIndex: undefined });

            for (const option of item.options) {
                rows.push({ group: item, groupIndex: itemIndex, option, optionIndex });
                optionIndex += 1;
            }
        });

        return rows;
    };

    export const getRowIndexOfOption = <T>(rows: SelectRow<T>[], optionIndex: number) =>
        rows.findIndex((row) => row.optionIndex === optionIndex);
}
