import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import SearchBar from "./SearchBar";

describe("SearchBar", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("debounces live search instead of firing on every keystroke", () => {
        const onSearch = vi.fn();
        render(<SearchBar value="" onSearch={onSearch} debounceMs={400} />);

        const input = screen.getByRole("searchbox");

        fireEvent.change(input, { target: { value: "bat" } });
        fireEvent.change(input, { target: { value: "batman" } });

        act(() => vi.advanceTimersByTime(399));
        expect(onSearch).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));
        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith("batman");
    });

    it("searches immediately when the form is submitted", () => {
        const onSearch = vi.fn();
        render(<SearchBar value="" onSearch={onSearch} />);

        fireEvent.change(screen.getByRole("searchbox"), {
            target: { value: "  alien " },
        });
        fireEvent.submit(screen.getByRole("search"));

        expect(onSearch).toHaveBeenCalledWith("alien");
    });
});
