import type { PageMosaicLinkProps, PageMosaicTileProps } from "./MosaicContent.types";

import * as styles from "./MosaicContent.css";

export const PageMosaicTile = (props: PageMosaicTileProps) => (
    <div class={styles.mosaicTile} style={{ width: `${props.getWidth()}px`, height: `${props.getHeight()}px` }}>
        <div class={styles.mosaicTileName}>{props.children}</div>

        <div class={styles.mosaicTileReading}>
            {`reads ${props.getState().readingIndex + 1} of ${props.getState().itemCount}`}
        </div>
    </div>
);

export const PageMosaicLink = (props: PageMosaicLinkProps) => (
    <a class={styles.mosaicLink} href={props.getHref()}>
        {props.children}

        <span class={styles.mosaicCaption}>{props.getCaption()}</span>
    </a>
);
