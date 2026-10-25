import { render } from "@testing-library/react";
import Clock from "..";
import React from "react";

describe("Clock", () => {
  it("should render 24-hour format", () => {
    const { container } = render(<Clock hourFormat="24" />);

    const now = new Date();
    const expected = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    expect(container).toHaveTextContent(expected);
  });

  it("should render 12-hour format", () => {
    const { container } = render(<Clock hourFormat="12" />);

    const now = new Date();
    const expected = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    expect(container).toHaveTextContent(expected);
  });

  it("should apply alignment classes", () => {
    const { container, rerender } = render(<Clock align="left" />);
    expect(container.firstChild).toHaveClass("text-left");

    rerender(<Clock align="center" />);
    expect(container.firstChild).toHaveClass("text-center");

    rerender(<Clock align="right" />);
    expect(container.firstChild).toHaveClass("text-right");
  });
});
