import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { ButtonExampleProps } from "../ButtonPage.types";

type Props = ButtonExampleProps;

export const DisabledExample = (props: Props) => (
    <Button
        getIsDisabled={() => true}
        renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Click Me</PageButtonContent>}
        onClick={props.onClick}
    />
);
