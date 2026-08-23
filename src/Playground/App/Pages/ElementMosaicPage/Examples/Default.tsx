import { ElementMosaic } from "../../../../../Lib/Exotics/ElementMosaic/ElementMosaic";
import { PageMosaicTile } from "../../../StyledComponents/MosaicContent/MosaicContent";
import type { ElementMosaicExampleProps } from "../ElementMosaicPage.types";

type Props = ElementMosaicExampleProps;

export const DefaultExample = (props: Props) => {
    return (
        <ElementMosaic
            items={props.items}
            gap={props.gap}
            sizeAnchor={props.sizeAnchor}
            renderItem={(getItem, getState) => (
                <PageMosaicTile state={getState} width={() => getItem().width} height={() => getItem().height}>
                    {getItem().name}
                </PageMosaicTile>
            )}
        />
    );
};
