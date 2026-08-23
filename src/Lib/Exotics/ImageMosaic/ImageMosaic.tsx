import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { Size2d } from "@thewaver/ss-utils";

import { access } from "../../Utils/propUtils";
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
        const sources = access(props.sources);
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

    const getSizes = createMemo(() => access(props.sources).map((source) => getSizeBySrc()[source.src] ?? EMPTY_SIZE));

    const getTargetAspectRatio = createMemo(() => {
        const targetAspectRatio = access(props.targetAspectRatio) ?? DEFAULT_TARGET_ASPECT_RATIO;

        return access(props.sizeAnchor) === "height" ? MosaicUtils.transposeSize(targetAspectRatio) : targetAspectRatio;
    });

    return (
        <Mosaic
            sizeAnchor={props.sizeAnchor}
            gap={props.gap}
            sizes={getSizes}
            isItemSized={true}
            computePlacements={(defs) => MosaicUtils.packScaled(defs, getTargetAspectRatio())}
            renderItem={(index, getState) => {
                const renderImage = () => (
                    <img
                        class={styles.imageMosaicImage}
                        src={access(props.sources)[index]?.src}
                        alt={access(props.sources)[index]?.alt}
                        decoding="async"
                    />
                );

                return props.renderItem ? props.renderItem(renderImage, getState) : renderImage();
            }}
        />
    );
};
