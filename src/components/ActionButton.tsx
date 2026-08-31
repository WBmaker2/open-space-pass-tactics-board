import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary";
  /** 지금 꼭 눌러야 하는 학습 흐름의 다음 행동을 맥박으로 강조한다. */
  readonly pulse?: boolean;
  readonly children: ReactNode;
}

export function ActionButton({
  variant = "secondary",
  pulse = false,
  className,
  children,
  type,
  ...rest
}: ActionButtonProps) {
  const classes = [
    "action-button",
    variant === "primary" ? "action-button--primary" : "action-button--secondary",
    pulse ? "gi-pulse" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type ?? "button"} className={classes} {...rest}>
      {pulse ? (
        <span className="action-button__badge" aria-hidden="true">
          필수
        </span>
      ) : null}
      <span className="action-button__label">{children}</span>
    </button>
  );
}
