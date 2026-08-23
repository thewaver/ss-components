import { Formation } from "../../../../../Lib/Exotics/Formation/Formation";
import { access } from "../../../../../Lib/Utils/propUtils";
import { FormationLayouts } from "../../../Samples/FormationLayouts/FormationLayouts.const";
import { PageFormationItem } from "../../../StyledComponents/FormationContent/FormationContent";
import type { FormationExampleProps } from "../FormationPage.types";

type Props = FormationExampleProps;

export const DefaultExample = ({ layoutKey, shapeKind, ...otherProps }: Props) => {
    return (
        <Formation
            {...otherProps}
            computeLayout={(itemCount) => FormationLayouts.SAMPLE_LAYOUTS[access(layoutKey)](itemCount)}
            renderItem={(getItem, getState) => (
                <PageFormationItem state={getState} shapeKind={shapeKind}>
                    {getItem()}
                </PageFormationItem>
            )}
        />
    );
};
