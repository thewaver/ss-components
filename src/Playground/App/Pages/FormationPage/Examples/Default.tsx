import { Formation } from "../../../../../Lib/Exotics/Formation/Formation";
import { FormationLayouts } from "../../../Samples/FormationLayouts/FormationLayouts.const";
import { PageFormationItem } from "../../../StyledComponents/FormationContent/FormationContent";
import type { FormationExampleProps } from "../FormationPage.types";

type Props = FormationExampleProps;

export const DefaultExample = ({ getLayoutKey, getShapeKind, ...otherProps }: Props) => {
    return (
        <Formation
            {...otherProps}
            computeLayout={(itemCount) => FormationLayouts.SAMPLE_LAYOUTS[getLayoutKey()](itemCount)}
            renderItem={(getItem, getState) => (
                <PageFormationItem getState={getState} getShapeKind={getShapeKind}>
                    {getItem()}
                </PageFormationItem>
            )}
        />
    );
};
