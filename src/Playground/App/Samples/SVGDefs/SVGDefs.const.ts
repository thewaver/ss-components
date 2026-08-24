import type { GradientConfig, IterationConfig, PatternConfig, SVGDefsColors } from "./SVGDefs.types";
import { elastic_circle_3 } from "./Samples/Gradient/elastic_circle_3";
import { elastic_drip_3 } from "./Samples/Gradient/elastic_drip_3";
import { elastic_inter_semicircle_3 } from "./Samples/Gradient/elastic_inter_semicircle_3";
import { elastic_semicircle_3 } from "./Samples/Gradient/elastic_semicircle_3";
import { flow_2s } from "./Samples/Gradient/flow_2s";
import { flow_3 } from "./Samples/Gradient/flow_3";
import { flow_3s } from "./Samples/Gradient/flow_3s";
import { flow_diag_2s } from "./Samples/Gradient/flow_diag_2s";
import { flow_diag_3 } from "./Samples/Gradient/flow_diag_3";
import { flow_diag_3s } from "./Samples/Gradient/flow_diag_3s";
import { hue_1 } from "./Samples/Gradient/hue_1";
import { hue_diag_inter_2 } from "./Samples/Gradient/hue_diag_inter_2";
import { hue_pulse_2 } from "./Samples/Gradient/hue_pulse_2";
import { hue_rot_3 } from "./Samples/Gradient/hue_rot_3";
import { merge_1v1 } from "./Samples/Gradient/merge_1v1";
import { merge_diag_1v1 } from "./Samples/Gradient/merge_diag_1v1";
import { merge_diag_async_4 } from "./Samples/Gradient/merge_diag_async_4";
import { orbit_1 } from "./Samples/Gradient/orbit_1";
import { orbit_1v1 } from "./Samples/Gradient/orbit_1v1";
import { orbit_async_2v1 } from "./Samples/Gradient/orbit_async_2v1";
import { orbit_async_3 } from "./Samples/Gradient/orbit_async_3";
import { plain as gradientPlain } from "./Samples/Gradient/plain";
import { scan_1 } from "./Samples/Gradient/scan_1";
import { scan_1v1 } from "./Samples/Gradient/scan_1v1";
import { scan_diag_1 } from "./Samples/Gradient/scan_diag_1";
import { scan_diag_1v1 } from "./Samples/Gradient/scan_diag_1v1";
import { snake_1 } from "./Samples/Gradient/snake_1";
import { snake_1v1 } from "./Samples/Gradient/snake_1v1";
import { snake_2 } from "./Samples/Gradient/snake_2";
import { snake_4 } from "./Samples/Gradient/snake_4";
import { snake_async_3 } from "./Samples/Gradient/snake_async_3";
import { snake_inter_2 } from "./Samples/Gradient/snake_inter_2";
import { sweep_1 } from "./Samples/Gradient/sweep_1";
import { sweep_1v1 } from "./Samples/Gradient/sweep_1v1";
import { sweep_diag_1 } from "./Samples/Gradient/sweep_diag_1";
import { sweep_diag_1v1 } from "./Samples/Gradient/sweep_diag_1v1";
import { sweep_diag_async_4 } from "./Samples/Gradient/sweep_diag_async_4";
import { constant } from "./Samples/Iteration/constant";
import { repeat1_1 } from "./Samples/Iteration/repeat1_1";
import { repeat2_1 } from "./Samples/Iteration/repeat2_1";
import { repeat3_3 } from "./Samples/Iteration/repeat3_3";
import { circle_g_2 } from "./Samples/Pattern/circle_g_2";
import { circle_hd_2 } from "./Samples/Pattern/circle_hd_2";
import { circle_hs_2 } from "./Samples/Pattern/circle_hs_2";
import { hexagon_ft_2 } from "./Samples/Pattern/hexagon_ft_2";
import { hexagon_pt_2 } from "./Samples/Pattern/hexagon_pt_2";
import { lozenge_d_2 } from "./Samples/Pattern/lozenge_d_2";
import { plain as patternPlain } from "./Samples/Pattern/plain";
import { triangle_t_2 } from "./Samples/Pattern/triangle_t_2";
import { whirlCurved_2 } from "./Samples/Pattern/whirlCurved_2";
import { whirl_2 } from "./Samples/Pattern/whirl_2";

export namespace SVGDefsSamples {
    export const SAMPLE_COLORS: SVGDefsColors = {
        background: "#282420",
        primary: "#FFFF00",
        secondary: "#00FFFF",
        tertiary: "#FF00FF",
    };

    export namespace Iteration {
        export const SAMPLE_CONFIGS = {
            constant,
            repeat1_1,
            repeat2_1,
            repeat3_3,
        } as const satisfies Record<string, IterationConfig>;

        export type SampleKey = keyof typeof SAMPLE_CONFIGS;
    }

    export namespace Pattern {
        export const SAMPLE_CONFIGS = {
            plain: patternPlain,
            circle_g_2,
            circle_hd_2,
            circle_hs_2,
            hexagon_ft_2,
            hexagon_pt_2,
            lozenge_d_2,
            triangle_t_2,
            whirl_2,
            whirlCurved_2,
        } as const satisfies Record<string, PatternConfig>;

        export type SampleKey = keyof typeof SAMPLE_CONFIGS;
    }

    export namespace Gradient {
        export const SAMPLE_CONFIGS = {
            plain: gradientPlain,
            elastic_circle_3,
            elastic_semicircle_3,
            elastic_inter_semicircle_3,
            elastic_drip_3,
            flow_2s,
            flow_3,
            flow_3s,
            flow_diag_2s,
            flow_diag_3,
            flow_diag_3s,
            hue_1,
            hue_pulse_2,
            hue_diag_inter_2,
            hue_rot_3,
            merge_1v1,
            merge_diag_1v1,
            merge_diag_async_4,
            orbit_1,
            orbit_1v1,
            orbit_async_2v1,
            orbit_async_3,
            scan_1,
            scan_1v1,
            scan_diag_1,
            scan_diag_1v1,
            snake_1,
            snake_1v1,
            snake_2,
            snake_4,
            snake_inter_2,
            snake_async_3,
            sweep_1,
            sweep_1v1,
            sweep_diag_1,
            sweep_diag_1v1,
            sweep_diag_async_4,
        } as const satisfies Record<string, GradientConfig>;

        export type SampleKey = keyof typeof SAMPLE_CONFIGS;
    }
}
