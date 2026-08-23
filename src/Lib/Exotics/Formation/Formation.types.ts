import type { Accessor, JSX } from "solid-js";

import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type FormationInset = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export type FormationLayout = {
    insets: FormationInset[];
    heightRatio: number;
};

export type FormationItemState = {
    index: number;
    itemCount: number;
    inset: FormationInset;
};

export type FormationProps<T> = AccessorProps<{
    isStackedInReverse?: boolean;
}> & {
    items: MaybeAccessor<T[]>;
    computeLayout: (itemCount: number) => FormationLayout;
    renderItem: (getItem: Accessor<T>, getState: Accessor<FormationItemState>) => JSX.Element;
};
