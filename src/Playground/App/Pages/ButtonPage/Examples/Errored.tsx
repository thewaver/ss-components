import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import type { ButtonErroredExampleProps } from "../ButtonPage.types";

type Props = ButtonErroredExampleProps;

export const ErroredExample = (props: Props) => {
    return (
        <Button
            hasError={props.hasError}
            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Toggle Error</PageButtonContent>}
            onClick={props.onClick}
        />
    );
};
