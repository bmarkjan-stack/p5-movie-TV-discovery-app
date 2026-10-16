import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("only updates after the delay has passed without changes", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 400),
            { initialProps: { value: "a" } }
        );

        rerender({ value: "ab" });
        rerender({ value: "abc" });
        expect(result.current).toBe("a");

        act(() => vi.advanceTimersByTime(399));
        expect(result.current).toBe("a");

        act(() => vi.advanceTimersByTime(1));
        expect(result.current).toBe("abc");
    });
});
