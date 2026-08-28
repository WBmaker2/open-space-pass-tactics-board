import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AccessibilityToolbar } from "./AccessibilityToolbar";

describe("접근성 도구모음", () => {
  it("글자 크기와 모션 줄이기 토글을 제공한다", () => {
    render(<AccessibilityToolbar />);
    expect(screen.getByRole("button", { name: "글자 크게" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "모션 줄이기" })).toHaveAttribute("aria-pressed", "false");
  });

  it("글자 크게 토글은 문서 루트에 클래스를 적용한다", async () => {
    const user = userEvent.setup();
    render(<AccessibilityToolbar />);
    const toggle = screen.getByRole("button", { name: "글자 크게" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("font-large")).toBe(true);
    await user.click(toggle);
    expect(document.documentElement.classList.contains("font-large")).toBe(false);
  });

  it("모션 줄이기 토글은 축소 모션 클래스를 적용한다", async () => {
    const user = userEvent.setup();
    render(<AccessibilityToolbar />);
    const toggle = screen.getByRole("button", { name: "모션 줄이기" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
  });
});
