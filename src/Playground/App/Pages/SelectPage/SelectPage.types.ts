import type { Signal } from "solid-js";

import type { SelectItem, SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";

export type Airport = {
    code: string;
    city: string;
};

export type Delivery = {
    name: string;
    description: string;
};

export type SelectExampleProps = {
    valueSignal: Signal<string | undefined>;
    getOptions?: () => SelectItem<string>[];
};

export type SelectAirportExampleProps = {
    valueSignal: Signal<Airport | undefined>;
};

export type SelectDeliveryExampleProps = {
    valueSignal: Signal<Delivery | undefined>;
};

export type SelectRoutesExampleProps = SelectDeliveryExampleProps & {
    getOptions: () => SelectOption<Delivery>[];
    getHasMore: () => boolean;
    getIsFetching: () => boolean;
    onReachEnd: () => void;
};
