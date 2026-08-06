import { runSuite } from "./harness.js";
import { binarySwitchSpec } from "./specs/binarySwitch.spec.js";
import { colorInputSpec } from "./specs/colorInput.spec.js";
import { fileInputSpec } from "./specs/fileInput.spec.js";
import { labelSpec } from "./specs/label.spec.js";
import { menuSpec } from "./specs/menu.spec.js";
import { alertDialogSpec, drawerSpec } from "./specs/modal.spec.js";
import { playgroundPanelSpec } from "./specs/playground.spec.js";
import { progressSpec } from "./specs/progress.spec.js";
import { radioGroupSpec } from "./specs/radioGroup.spec.js";
import { selectSpec } from "./specs/select.spec.js";
import { tabsSpec } from "./specs/tabs.spec.js";
import { textInputSpec } from "./specs/textInput.spec.js";
import { toggleSpec } from "./specs/toggle.spec.js";

const SPECS = [
    binarySwitchSpec,
    toggleSpec,
    radioGroupSpec,
    tabsSpec,
    labelSpec,
    textInputSpec,
    fileInputSpec,
    colorInputSpec,
    selectSpec,
    menuSpec,
    progressSpec,
    drawerSpec,
    alertDialogSpec,
    playgroundPanelSpec,
];

const args = process.argv.slice(2);

process.exitCode = await runSuite(SPECS, {
    skipBuild: args.includes("--skip-build"),
    filter: args.filter((arg) => !arg.startsWith("--")),
});
