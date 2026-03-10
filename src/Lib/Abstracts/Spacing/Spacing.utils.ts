import { SpacingRect } from "./Spacing.types";

export namespace SpacingUtils {
    export const spreadSpacing = (amount: number): SpacingRect => {
        return {
            top: amount,
            left: amount,
            bottom: amount,
            right: amount,
        };
    };
}
