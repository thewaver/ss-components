import { createEffect, createMemo, createSignal } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { ElementObserver } from "../../Abstracts/ElementObserver/ElementObserver";
import { access } from "../../Utils/propUtils";
import { Mosaic } from "../Mosaic/Mosaic";
import type { ElementMosaicProps } from "../Mosaic/Mosaic.types";
import { MosaicUtils } from "../Mosaic/Mosaic.utils";

import * as styles from "./ElementMosaic.css";

const EMPTY_SIZE: Size2d = { width: 0, height: 0 };

export const ElementMosaic = <T,>(props: ElementMosaicProps<T>) => {
    const [getMeasuredSizes, setMeasuredSizes] = createSignal<Size2d[]>([]);

    const getSizes = createMemo(() => access(props.items).map((_, index) => getMeasuredSizes()[index] ?? EMPTY_SIZE));

    const setSizeAt = (index: number, size: Size2d) =>
        setMeasuredSizes((sizes) => {
            const next = [...sizes];

            next[index] = size;

            return next;
        });

    return (
        <Mosaic
            sizeAnchor={props.sizeAnchor}
            gap={props.gap}
            sizes={getSizes}
            isItemSized={false}
            computePlacements={MosaicUtils.packFixed}
            renderItem={(index, getState) => {
                const [getItemRef, setItemRef] = createSignal<HTMLElement>();

                const getItemSize = ElementObserver.createBorderBoxSizeObserver(getItemRef);

                createEffect(() => {
                    setSizeAt(index, getItemSize());
                });

                return (
                    <div ref={setItemRef} class={styles.elementMosaicItem}>
                        {props.renderItem(() => access(props.items)[index], getState)}
                    </div>
                );
            }}
        />
    );
};
