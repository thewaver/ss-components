export namespace ScanlineAnimationUtils {
    export const getRandomHorizontalShiftKeyframes = (maxShift: number, framePercentAtShift: number): Keyframe[] => {
        const shift = Math.random() * maxShift * 2 - maxShift;
        const half = Math.max(Math.min(framePercentAtShift * 0.5, 50), 0);

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: (50 - half) / 100, transform: `translateX(${shift}px)` },
            { offset: (50 + half) / 100, transform: `translateX(${shift}px)` },
            { offset: 1, transform: "translateX(0)" },
        ];
    };
}
