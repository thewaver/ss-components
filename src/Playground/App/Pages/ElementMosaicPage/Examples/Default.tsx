import { ElementMosaic } from "../../../../../Lib/Exotics/ElementMosaic/ElementMosaic";
import { PageMosaicTile } from "../../../StyledComponents/MosaicContent/MosaicContent";
import type { ElementMosaicExampleProps } from "../ElementMosaicPage.types";

type Props = ElementMosaicExampleProps;

export const DefaultExample = (props: Props) => {
    return (
        <ElementMosaic
            getItems={props.getItems}
            getGap={props.getGap}
            getSizeAnchor={props.getSizeAnchor}
            renderItem={(getItem, getState) => (
                <PageMosaicTile getState={getState} getWidth={() => getItem().width} getHeight={() => getItem().height}>
                    {getItem().name}
                </PageMosaicTile>
            )}
        />
    );
};
