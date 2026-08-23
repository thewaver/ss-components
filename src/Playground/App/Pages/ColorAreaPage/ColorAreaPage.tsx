import { createMemo, createSignal, createUniqueId } from "solid-js";

import { Color } from "@thewaver/ss-utils";

import { PageExamples } from "../../PageComponents/Examples/Examples";
import type { ColorAreaDropdownExampleProps, ColorAreaExampleProps } from "./ColorAreaPage.types";
import { DropdownExample } from "./Examples/Dropdown";
import { SurfaceExample } from "./Examples/Surface";

const PERCENT = 100;
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ColorAreaPage/Examples";

const STARTING_HSV: Color.HSVA = { h: 210, s: 0.7, v: 0.9, a: 1 };
const STARTING_PICKER_HSV: Color.HSVA = { h: 90, s: 0.5, v: 0.8, a: 1 };
const STARTING_DISABLED_HSV: Color.HSVA = { h: 0, s: 0.6, v: 0.6, a: 1 };

export const ColorAreaPage = () => {
    const popupId = createUniqueId();

    const bareSignal = createSignal<Color.HSVA>(STARTING_HSV);
    const pickerSignal = createSignal<Color.HSVA>(STARTING_PICKER_HSV);
    const disabledSignal = createSignal<Color.HSVA>(STARTING_DISABLED_HSV);
    const isOpenSignal = createSignal(false);
    const hueSignal = createSignal(pickerSignal[0]().h);

    const getExamples = createMemo(() => {
        const bareProps: ColorAreaExampleProps = { hsvSignal: bareSignal };

        const disabledProps: ColorAreaExampleProps = { hsvSignal: disabledSignal, isDisabled: () => true };

        const dropdownProps: ColorAreaDropdownExampleProps = {
            hsvSignal: pickerSignal,
            isOpenSignal,
            hueSignal,
            popupId: () => popupId,
        };

        return [
            {
                key: "bare",
                name: "The surface alone",
                readout: () =>
                    `hsv: ${Math.round(bareSignal[0]().h)}° ${Math.round(bareSignal[0]().s * PERCENT)}% ${Math.round(bareSignal[0]().v * PERCENT)}% — hex: ${Color.HSV.toHex(bareSignal[0]())}`,
                component: () => <SurfaceExample {...bareProps} />,
                path: `${EXAMPLES_ROOT}/Surface.tsx`,
            },
            {
                key: "dropdown",
                name: "In a dropdown, replacing the OS dialog",
                readout: () => `${Color.HSVA.toHexa(pickerSignal[0]())} — open: ${isOpenSignal[0]()}`,
                component: () => <DropdownExample {...dropdownProps} />,
                path: `${EXAMPLES_ROOT}/Dropdown.tsx`,
            },
            {
                key: "disabled",
                name: "Disabled",
                readout: () => "the drag is not attached at all, so nothing moves",
                component: () => <SurfaceExample {...disabledProps} />,
                path: `${EXAMPLES_ROOT}/Surface.tsx`,
            },
        ];
    });

    return <PageExamples items={getExamples} />;
};
