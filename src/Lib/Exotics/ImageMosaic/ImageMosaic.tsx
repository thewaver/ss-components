import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { Mosaic } from "../Mosaic/Mosaic";
import type { ImageMosaicProps } from "../Mosaic/Mosaic.types";
import { MosaicUtils } from "../Mosaic/Mosaic.utils";

import * as styles from "./ImageMosaic.css";

const DEFAULT_TARGET_ASPECT_RATIO: Size2d = { width: 1, height: 1 };
const UNREADABLE_IMAGE_SIZE: Size2d = { width: 1, height: 1 };
const EMPTY_SIZE: Size2d = { width: 0, height: 0 };

export const ImageMosaic = (props: ImageMosaicProps) => {
    const [getSizeBySrc, setSizeBySrc] = createSignal<Record<string, Size2d>>({});

    const setSizeOf = (src: string, size: Size2d) => setSizeBySrc((sizes) => ({ ...sizes, [src]: size }));

    createEffect(() => {
        const sources = props.getSources();
        const known = untrack(getSizeBySrc);

        setSizeBySrc(
            Object.fromEntries(
                sources.filter((source) => known[source.src]).map((source) => [source.src, known[source.src]]),
            ),
        );

        for (const source of sources) {
            if (known[source.src]) continue;

            const image = new Image();

            image.decoding = "async";
            image.addEventListener("load", () =>
                setSizeOf(source.src, { width: image.naturalWidth, height: image.naturalHeight }),
            );
            image.addEventListener("error", () => setSizeOf(source.src, UNREADABLE_IMAGE_SIZE));
            image.src = source.src;
        }
    });

    const getSizes = createMemo(() => props.getSources().map((source) => getSizeBySrc()[source.src] ?? EMPTY_SIZE));

    const getTargetAspectRatio = createMemo(() => {
        const targetAspectRatio = props.getTargetAspectRatio?.() ?? DEFAULT_TARGET_ASPECT_RATIO;

        return props.getSizeAnchor?.() === "height" ? MosaicUtils.transposeSize(targetAspectRatio) : targetAspectRatio;
    });

    return (
        <Mosaic
            getSizeAnchor={props.getSizeAnchor}
            getGap={props.getGap}
            getSizes={getSizes}
            getIsItemSized={() => true}
            computePlacements={(defs) => MosaicUtils.packScaled(defs, getTargetAspectRatio())}
            renderItem={(index, getState) => {
                const renderImage = () => (
                    <img
                        class={styles.imageMosaicImage}
                        src={props.getSources()[index]?.src}
                        alt={props.getSources()[index]?.alt}
                        decoding="async"
                    />
                );

                return props.renderItem ? props.renderItem(renderImage, getState) : renderImage();
            }}
        />
    );
};
