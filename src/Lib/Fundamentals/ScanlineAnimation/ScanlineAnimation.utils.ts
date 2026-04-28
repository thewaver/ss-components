export namespace ScanlineAnimationUtils {
    export const getRandomHorizontalShiftKeyframes = (
        maxShift: number,
        breakpoints: [number, number, number, number],
    ): Keyframe[] => {
        const shift = Math.random() * maxShift * 2 - maxShift;

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: breakpoints[0], transform: "translateX(0)" },
            { offset: breakpoints[1], transform: `translateX(${shift}px)` },
            { offset: breakpoints[2], transform: `translateX(${shift}px)` },
            { offset: breakpoints[3], transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };
}
